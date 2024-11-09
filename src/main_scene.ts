import {
  Actor,
  Engine,
  IsometricEntityComponent,
  IsometricMap,
  Scene,
  vec,
} from "excalibur";
import { Tiles, Buildings } from "./resources";
import Building from "./actors/building";
import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import CameraController from "./utility/camera_controller";
import { WaterComponent } from "./components/water_component";

class MainScene extends Scene {
  isoMap: ex.IsometricMap;
  noiseGen: NoiseFunction2D;
  draggingEntity: Actor | null = null;

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
      columns: 64,
      rows: 64,
    });

    this.noiseGen = createNoise2D();

    // generate base terrain
    for (let tile of this.isoMap.tiles) {
      // get perlin noise to determine tile type
      const noise = this.noiseGen(tile.x / 16, tile.y / 16);
      if (noise < -0.2) tile.addGraphic(Tiles.Dirt.toSprite());
      else tile.addGraphic(Tiles.Grass.toSprite());
    }

    // generate rivers
    // pick a random start point on the edge of the map
    const start = vec(0, Math.floor(Math.random() * this.isoMap.rows));
    for (let i = 0; i < 200; i++) {
      const tile = this.isoMap.getTile(start.x, start.y);
      tile?.addComponent(new WaterComponent());

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

    this.add(this.isoMap);

    // initialize building palette
    const palette = document.getElementById("palette");

    // iterate through all buildings and add them as images to the palette
    for (const building of Object.values(Buildings)) {
      const img = document.createElement("img");
      img.src = building.path;
      img.width = 64;
      img.height = 64;
      img.style.cursor = "pointer";

      img.onclick = () => {
        const pos = engine.input.pointers.primary.lastWorldPos;
        const building = new Building(this.isoMap, pos);
        this.add(building);
      };

      palette?.appendChild(img);
    }
  }
}

export default MainScene;
