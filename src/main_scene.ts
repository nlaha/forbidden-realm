import { Actor, Engine, IsometricMap, Scene, vec } from "excalibur";
import { Tiles, Buildings, Harvestables } from "./resources";
import Building from "./actors/building";
import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import CameraController from "./utility/camera_controller";
import Tree from "./actors/tree";
import Character from "./actors/character";
import Harvestable from "./actors/harvestable";
import { init_navgrid, mark_tiles_as_solid, spawner } from "./utility/utils";
import { AStarFinder } from "astar-typescript";
import { Grid } from "@evilkiwi/astar";
import CharacterStateSystem from "./systems/character_state_system";
import VisionSystem from "./systems/vision_system";
import HarvestSystem from "./systems/harvest_system";
import DepotSystem from "./systems/depo_system";
import NeighborSystem from "./systems/neighbor_system";

class MainScene extends Scene {
  isoMap: ex.IsometricMap;

  noiseGen: NoiseFunction2D;
  draggingEntity: Actor | null = null;

  // grid of integers for pathfinding
  navgrid: Grid | null = null;

  harvestables: Harvestable[] = [];

  gold: number = 0;
  gameTime: number = 0;

  public update(engine: Engine, delta: number): void {
    super.update(engine, delta);
    // increment game time on document
    const timeElement = document.getElementById("time");
    timeElement!.innerHTML = this.gameTime.toFixed(2);

    // increment game time
    this.gameTime += delta / 1000;
  }

  /**
   * Start-up logic, called once
   */
  public onInitialize(engine: Engine) {
    // first, add camera controller
    this.add(new CameraController());

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

    // spawn trees on grass tiles
    spawner(5, 10, this.isoMap, "grass").forEach((pos) => {
      const tree = new Tree(this.isoMap, { pos: pos });
      this.add(tree);
    });

    // spawn rocks on dirt tiles
    spawner(5, 4, this.isoMap, "dirt").forEach((pos) => {
      const rock = new Harvestables.rock1.type(
        this.isoMap,
        { pos: pos },
        Harvestables.rock1.img,
        "rock"
      );
      this.add(rock);
      this.harvestables.push(rock);
    });

    // initialize pathfinding
    mark_tiles_as_solid(this.isoMap);

    // spawn humans in random locations
    spawner(1, 2, this.isoMap, "grass").forEach((pos) => {
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
      label.innerHTML = `${building.name} - ${building.cost} gold`;
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
          building.walkability
        );
        this.add(buildingObj);
      };

      palette?.appendChild(div);
    }

    this.world.add(CharacterStateSystem);
    this.world.add(VisionSystem);
    this.world.add(HarvestSystem);
    this.world.add(DepotSystem);
    this.world.add(NeighborSystem);
  }
}

export default MainScene;
