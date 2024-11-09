import { Engine, IsometricMap, Scene, vec } from "excalibur";
import { Tiles, Buildings } from "./resources";
import Building from "./actors/building";
import { createNoise2D, NoiseFunction2D } from "simplex-noise";
import CameraController from "./utility/camera_controller";

class MainScene extends Scene {
  isoMap: ex.IsometricMap;
  noiseGen: NoiseFunction2D;

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

    for (let tile of this.isoMap.tiles) {
      // get perlin noise to determine tile type
      const noise = this.noiseGen(tile.x / 16, tile.y / 16);
      if (noise < -0.2) tile.addGraphic(Tiles.Dirt.toSprite());
      else tile.addGraphic(Tiles.Grass.toSprite());
    }

    this.add(this.isoMap);

    // add building actor
    const building = new Building(this.isoMap, vec(500, 300));

    this.add(building);
  }
}

export default MainScene;
