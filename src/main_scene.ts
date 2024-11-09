import { Engine, IsometricMap, Scene, vec } from "excalibur";
import { Tiles, Buildings } from "./resources";
import Building from "./actors/building";

class MainScene extends Scene {
  isoMap: ex.IsometricMap;

  /**
   * Start-up logic, called once
   */
  public onInitialize(engine: Engine) {
    // initialize scene actors
    this.isoMap = new IsometricMap({
      pos: vec(500, 200),
      tileWidth: 32,
      tileHeight: 16,
      columns: 32,
      rows: 32,
    });

    for (let tile of this.isoMap.tiles) {
      tile.addGraphic(Tiles.Grass.toSprite());
    }

    this.add(this.isoMap);

    // add building actor
    const building = new Building(this.isoMap, vec(500, 200));

    this.add(building);
  }
}

export default MainScene;
