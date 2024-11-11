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
import {
  compute_iso_collider,
  mark_tile_solid_single,
  mark_tiles_as_solid,
} from "../utility/utils";
import { InventoryComponent } from "../components/inventory";
import { BuildingComponent } from "../components/building";
import { Storage } from "../storage";
import MainScene from "../main_scene";

/**
 * Building actor
 */
class Building extends Actor {
  isoMap: ex.IsometricMap;
  radius: number = 1;
  construction_progress: number = 0;
  placed: boolean = false;
  walkability: number = -1;
  cost: Map<string, number> = new Map();

  constructor(
    isoMap: ex.IsometricMap,
    pos: ex.Vector,
    img: ImageSource,
    walkability: number,
    cost: Map<string, number>
  ) {
    super({
      x: pos.x,
      y: pos.y,
    });

    this.isoMap = isoMap;
    this.cost = cost;

    this.addComponent(new IsometricEntityComponent(this.isoMap));

    this.graphics.use(img.toSprite());

    // building initially has an opacity of 0.5 and follows the mouse
    this.graphics.opacity = 0.25;

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
    console.log("Adding building component");
    this.addComponent(new BuildingComponent());
    this.addTag("buildingObject");
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
      this.construction_progress += delta / 5000;
      this.children
        .find((child) => child instanceof ProgressIndicator)!
        .setPercent(Math.round(this.construction_progress * 100));
      this.graphics.opacity = 0.25 + this.construction_progress * 0.75;

      if (this.construction_progress >= 1) {
        this.onConstructionDone();
      }
    }
  }

  public die() {
    // if the building actor is in the harvestables array, remove it
    if (game.currentScene) {
      const scene = game.currentScene as MainScene;
      scene.harvestables = scene.harvestables.filter((h) => h.id !== this.id);
    }

    this.kill();
  }

  public place() {
    // check storage to see if we have enough resources
    if (!Storage.canAfford(this.cost)) {
      console.log("Not enough resources");
      this.die();
      return;
    }

    // remove event subscriptions
    this.off("pointermove");
    this.off("pointerup");

    // add child progress bar
    const progressBar = new ProgressIndicator({ width: 32, height: 4 });
    this.addChild(progressBar);

    this.placed = true;

    this.collider.set(compute_iso_collider(this.graphics.current!));

    // mark tiles as solid
    const canPlace = mark_tile_solid_single(
      this.isoMap,
      this,
      this.walkability
    );

    if (!canPlace) {
      console.log("Cannot place building here");
      this.die();
      return;
    }

    Storage.pay(this.cost, this.scene!.world);
  }
}

export default Building;
