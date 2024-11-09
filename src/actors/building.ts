import { Actor, IsometricEntityComponent } from "excalibur";
import { Buildings } from "../resources";
import { game } from "../main";

import buildingFrag from "../shaders/building.frag";
import ProgressIndicator from "./progress_bar";

/**
 * Building actor
 */
class Building extends Actor {
  isoMap: ex.IsometricMap;
  radius: number = 1;
  construction_progress: number = 0;
  placed: boolean = false;

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
    this.graphics.opacity = 0.25;

    this.on("pointermove", (evt) => {
      // snap to isoMap grid
      this.pos = this.isoMap.tileToWorld(this.isoMap.worldToTile(evt.worldPos));
    });

    this.on("pointerup", () => {
      this.place();
    });
  }

  // update
  public update(engine: ex.Engine, delta: number) {
    super.update(engine, delta);
    // update construction progress
    if (this.placed && this.construction_progress < 1) {
      this.construction_progress += delta / 1000;
      this.children
        .find((child) => child instanceof ProgressIndicator)!
        .setPercent(Math.round(this.construction_progress * 100));
      this.graphics.opacity = 0.25 + this.construction_progress * 0.75;

      if (this.construction_progress >= 1) {
        this.children
          .find((child) => child instanceof ProgressIndicator)!
          .kill();
      }
    }
  }

  public place() {
    // remove event subscriptions
    this.off("pointermove");
    this.off("pointerup");

    // add child progress bar
    const progressBar = new ProgressIndicator({ width: 32, height: 4 });
    this.addChild(progressBar);

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

    this.placed = true;
  }

  public onInitialize() {
    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.graphics.use(Buildings.House1.toSprite());
  }
}

export default Building;
