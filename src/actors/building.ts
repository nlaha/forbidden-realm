import { Actor, IsometricEntityComponent } from "excalibur";
import { Buildings } from "../resources";

class Building extends Actor {
  isoMap: ex.IsometricMap;
  radius: number = 1;

  constructor(isoMap: ex.IsometricMap, pos: ex.Vector) {
    super({
      x: pos.x,
      y: pos.y,
    });

    this.isoMap = isoMap;

    // if it's on a tile, make that tile and all tiles in
    // the radius of the building solid
    const isoCoords = this.isoMap.worldToTile(pos);
    for (let x = -this.radius; x <= this.radius; x++) {
      for (let y = -this.radius; y <= this.radius; y++) {
        const tile = this.isoMap.getTile(isoCoords.x + x, isoCoords.y + y);
        if (tile) {
          tile.solid = true;
        }
      }
    }

    // highlight the building when hovered
    this.on("pointerenter", () => {
      this.graphics.opacity = 0.5;
    });

    this.on("pointerleave", () => {
      this.graphics.opacity = 1;
    });
  }

  public onInitialize() {
    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.graphics.use(Buildings.House1.toSprite());
  }
}

export default Building;
