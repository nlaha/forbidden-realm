import {
  Actor,
  Color,
  Font,
  ImageSource,
  IsometricEntityComponent,
  Label,
  vec,
} from "excalibur";
import { Buildings, Tiles } from "../resources";
import { game } from "../main";

import buildingFrag from "../shaders/building.frag";
import ProgressIndicator from "./progress_bar";
import { compute_iso_collider, mark_tile_solid_single } from "../utility/utils";
import { InventoryComponent } from "../components/character";
import { BuildingComponent } from "../components/building";

/**
 * Building actor
 */
class Building extends Actor {
  isoMap: ex.IsometricMap;
  radius: number = 1;
  construction_progress: number = 0;
  placed: boolean = false;
  walkability: number = -1;

  constructor(
    isoMap: ex.IsometricMap,
    pos: ex.Vector,
    img: ImageSource,
    walkability: number
  ) {
    super({
      x: pos.x,
      y: pos.y,
    });

    this.isoMap = isoMap;

    this.addComponent(new IsometricEntityComponent(this.isoMap));

    this.graphics.use(img.toSprite());

    // assign custom material for outlines
    this.graphics.material = game.graphicsContext.createMaterial({
      name: "buildingMaterial",
      // load from shaders/outline.frag
      fragmentSource: buildingFrag,
    });

    // building initially has an opacity of 0.5 and follows the mouse
    this.graphics.opacity = 0.25;

    this.pointer.useGraphicsBounds = true;

    this.on("pointerup", (evt) => {
      // make sure the building is placed on a tile
      if (
        this.isoMap.getTile(
          this.isoMap.worldToTile(this.pos).x,
          this.isoMap.worldToTile(this.pos).y
        ) &&
        evt.nativeEvent.target === game.canvas
      ) {
        this.place();
      }
    });

    this.walkability = walkability;
  }

  public onConstructionDone() {
    this.addComponent(new BuildingComponent());
    this.children.find((child) => child instanceof ProgressIndicator)!.kill();
  }

  // update
  public update(engine: ex.Engine, delta: number) {
    super.update(engine, delta);

    if (!this.placed) {
      const pointerWorldPos = engine.input.pointers.primary.lastWorldPos;
      this.pos = this.isoMap.tileToWorld(
        this.isoMap.worldToTile(pointerWorldPos)
      );
    }

    // update construction progress
    if (this.placed && this.construction_progress < 1) {
      this.construction_progress += delta / 1000;
      this.children
        .find((child) => child instanceof ProgressIndicator)!
        .setPercent(Math.round(this.construction_progress * 100));
      this.graphics.opacity = 0.25 + this.construction_progress * 0.75;

      if (this.construction_progress >= 1) {
        this.onConstructionDone();
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

    this.collider.set(compute_iso_collider(this.graphics.current!));

    // mark tiles as solid
    mark_tile_solid_single(this.isoMap, this, this.walkability);
    console.log(`Marking tiles with walkability ${this.walkability}`);
  }
}

export default Building;
