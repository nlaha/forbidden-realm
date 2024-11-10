import {
  Actor,
  Color,
  Engine,
  EntityManager,
  Font,
  IsometricMap,
  Label,
  Scene,
  vec,
} from "excalibur";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { Tiles, Buildings, Harvestables } from "./resources";
import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import CameraController from "./utility/camera_controller";
import Character from "./actors/character";
import { init_navgrid, mark_tiles_as_solid, spawner } from "./utility/utils";
import { Grid } from "@evilkiwi/astar";
import IdleSystem from "./systems/idle_system";
import VisionSystem from "./systems/vision_system";
import HarvestSystem from "./systems/harvest_system";
import DepotSystem from "./systems/depo_system";
import NeighborSystem from "./systems/neighbor_system";
import UIUpdateSystem from "./systems/ui_update_system";
import DisasterSystem from "./systems/disaster_system";
import { CharacterComponent } from "./components/character";

import { Storage } from "./storage";
import EatSystem from "./systems/eat_system";

class MainScene extends Scene {
  isoMap: ex.IsometricMap;

  noiseGen: NoiseFunction2D;
  draggingEntity: Actor | null = null;

  // grid of integers for pathfinding
  navgrid: Grid | null = null;

  harvestables: Actor[] = [];

  status_table: any | null = null;

  gameTime: number = 0;

  buildingDefinitions: any = [];

  deaths: any[] = [];

  public update(engine: Engine, delta: number): void {
    super.update(engine, delta);
    // increment game time on document
    const timeElement = document.getElementById("time");
    timeElement!.innerHTML = this.gameTime.toFixed(2);

    const prev_time = this.gameTime;

    // increment game time
    this.gameTime += delta / 1000;

    // start a disaster every 60 seconds
    if (prev_time % 60 > this.gameTime % 60) {
      DisasterSystem.startDisaster();
    }
  }

  /**
   * Start-up logic, called once
   */
  public onInitialize(engine: Engine) {
    // first, add camera controller
    this.add(new CameraController());

    document.getElementById("dialogue-box")!.classList.add("hidden-fade");
    document.getElementById("dialogue")!.innerText = "Welcome to the game!";

    // initialize status table
    this.status_table = new Tabulator("#status-table", {
      height: 205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
      data: [], //assign data to table
      layout: "fitColumns", //fit columns to width of table (optional)
      columns: [
        //Define Table Columns
        { title: "ID", field: "eid", width: 50 },
        { title: "Name", field: "name", width: 150 },
        { title: "State", field: "state" },
        {
          title: "Health",
          field: "health",
          formatter: "progress",
          formatterParams: {
            color: "#FF0000",
            legend: function (value) {
              // round to 2 decimal places
              return parseFloat(value).toFixed(2) + "/100";
            },
          },
        },
        {
          title: "Food",
          field: "food",
          formatter: "progress",
          formatterParams: {
            color: "#f4FF00",
            legend: function (value) {
              // round to 2 decimal places
              return parseFloat(value).toFixed(2) + "/100";
            },
          },
        },
        { title: "Visible Objects", field: "vision" },
        { title: "Inventory", field: "inventory" },
        {
          title: "Role (Click to change)",
          field: "role",
          editor: "list",
          cellEdited: function (cell) {
            const entity = engine.currentScene.world.entityManager.getById(
              cell.getRow().getData().eid
            );
            const character = entity as Character;
            const characterComponent = character.get(CharacterComponent);
            characterComponent.role = cell.getData().role;
          },
          editorParams: {
            multiSelect: true,
            values: {
              miner: "Miner",
              farmer: "Farmer",
              woodcutter: "Woodcutter",
              idle: "Idle",
            },
          },
        },
      ],
    });

    // initialize scene actors
    this.isoMap = new IsometricMap({
      pos: vec(500, 200),
      tileWidth: 32,
      tileHeight: 16,
      columns: 48,
      rows: 48,
    });

    this.navgrid = init_navgrid(this.isoMap);

    this.noiseGen = createNoise2D();

    // generate rivers
    // pick a random start point on the edge of the map
    const start = vec(0, Math.floor(Math.random() * this.isoMap.rows));
    // make sure the start point is not too close to the edge
    if (start.y < 5 || start.y > this.isoMap.rows - 5) {
      start.y = 5;
    }

    for (let i = 0; i < 200; i++) {
      const tile = this.isoMap.getTile(start.x, start.y);
      tile?.addTag("water");

      // add a bunch of sand tiles around the water
      for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {
          const sandTile = this.isoMap.getTile(start.x + x, start.y + y);
          if (sandTile && !sandTile.tags.has("water")) {
            sandTile.addGraphic(Tiles.Sand.toSprite());
            sandTile.addTag("sand");
          }
        }
      }

      // randomly change direction
      if (i % 2 === 0) {
        const dir = Math.random();
        if (dir < 0.5) start.y--;
        else if (dir > 0.5) start.y++;
      } else {
        start.x++;
      }

      if (tile) {
        tile.addGraphic(Tiles.Water.toSprite());
      }
    }

    // generate base terrain
    for (let tile of this.isoMap.tiles) {
      if (tile.tags.has("water") || tile.tags.has("sand")) {
        continue;
      }
      // get perlin noise to determine tile type
      const noise = this.noiseGen(tile.x / 16, tile.y / 16);
      if (noise < -0.2) {
        tile.addGraphic(Tiles.Dirt.toSprite());
        tile.addTag("dirt");
      } else {
        tile.addGraphic(Tiles.Grass.toSprite());
        tile.addTag("grass");
      }
    }

    // spawn harvestables
    for (let harvestable of Object.values(Harvestables)) {
      console.log(`Spawning ${harvestable.type.name}`);
      spawner(
        5,
        harvestable.spawnNum,
        this.isoMap,
        harvestable.spawnTags
      ).forEach((pos) => {
        const obj = new harvestable.type(
          this.isoMap,
          { pos: pos },
          harvestable.img,
          harvestable.resourceType
        );
        this.add(obj);
        this.harvestables.push(obj);
      });
    }

    // initialize pathfinding
    mark_tiles_as_solid(this.isoMap);

    // spawn humans in random locations
    spawner(1, 3, this.isoMap, "grass").forEach((pos) => {
      const human = new Character(this.isoMap, { pos: pos });
      this.add(human);
    });

    // add the map to the scene
    this.add(this.isoMap);

    // initialize building palette
    const palette = document.getElementById("palette");

    // iterate through all buildings and add them as images to the palette
    for (const building of Object.values(Buildings)) {
      const div = document.createElement("div");
      div.className = "palette-item";

      const img = document.createElement("img");
      div.appendChild(img);

      // create label for image
      const label = document.createElement("label");

      // repeat keys the number of times the value is
      const costString = Array.from(building.cost.keys())
        .map((key) => key.repeat(building.cost.get(key)!))
        .join("");

      label.innerHTML = `${building.name} - ${costString}`;
      label.className = "palette-label";
      div.appendChild(label);

      img.src = building.img.path;
      img.width = 64;
      img.height = 64;
      img.style.cursor = "pointer";

      div.onclick = () => {
        const pos = engine.input.pointers.primary.lastWorldPos;
        // create object depending on what buliding.type is
        const buildingObj = new building.type(
          this.isoMap,
          pos,
          building.img,
          building.walkability,
          building.cost
        );
        this.add(buildingObj);
      };

      this.buildingDefinitions.push({
        definition: building,
        element: div,
      });
      palette?.appendChild(div);
    }

    document.getElementById("clear-storage")!.onclick = () => {
      Storage.clearInventories(this.world);
    };

    this.world.add(IdleSystem);
    this.world.add(VisionSystem);
    this.world.add(HarvestSystem);
    this.world.add(DepotSystem);
    this.world.add(NeighborSystem);
    this.world.add(UIUpdateSystem);
    this.world.add(DisasterSystem);
    this.world.add(EatSystem);
  }
}

export default MainScene;
