import { Actor, IsometricEntityComponent } from "excalibur";
import { Buildings } from "../resources";
import { game } from "../main";

import buildingFrag from "../shaders/building.frag";

/**
 * Building actor
 */
class Building extends Actor {
  isoMap: ex.IsometricMap;
  radius: number = 1;

  constructor(isoMap: ex.IsometricMap, pos: ex.Vector) {
    super({
      x: pos.x,
      y: pos.y,
    });

    this.isoMap = isoMap;

    // assign custom material for outlines
    this.graphics.material = game.graphicsContext.createMaterial({
      name: "buildingMaterial",
      // load from shaders/outline.frag
      fragmentSource: buildingFrag,
    });

    // building initially has an opacity of 0.5 and follows the mouse
    this.graphics.opacity = 0.5;

    this.on("pointermove", (evt) => {
      // snap to isoMap grid
      this.pos = this.isoMap.tileToWorld(this.isoMap.worldToTile(evt.worldPos));
    });

    this.on("pointerup", () => {
      this.place();
    });
  }

  public place() {
    // remove event subscriptions
    this.off("pointermove");
    this.off("pointerup");

    this.graphics.opacity = 1.0;

    // if it's on a tile, make that tile and all tiles in
    // the radius of the building solid
    const isoCoords = this.isoMap.worldToTile(this.pos);
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
      this.graphics.material!.update((shader) => {
        shader.trySetUniformFloat("outlineRadius", 2.0);
      });
    });

    this.on("pointerleave", () => {
      this.graphics.material!.update((shader) => {
        shader.trySetUniformFloat("outlineRadius", 0.0);
      });
    });
  }

  public onInitialize() {
    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.graphics.use(Buildings.House1.toSprite());
  }
}

export default Building;
