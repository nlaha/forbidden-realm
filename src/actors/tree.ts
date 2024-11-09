import {
  Actor,
  ActorArgs,
  IsometricEntityComponent,
  IsometricMap,
} from "excalibur";
import { Foliage } from "../resources";
import { compute_iso_collider } from "../utility/utils";

class Tree extends Actor {
  isoMap: IsometricMap;

  constructor(isoMap: IsometricMap, config: ActorArgs) {
    super(config);

    this.isoMap = isoMap;

    this.addComponent(new IsometricEntityComponent(this.isoMap));
    // randomize tree sprite
    const treeSprite =
      Object.values(Foliage)[
        Math.floor(Math.random() * Object.values(Foliage).length)
      ].toSprite();
    this.graphics.use(treeSprite);

    this.collider.set(compute_iso_collider(this.graphics.current!));
  }

  public onInitialize() {}
}

export default Tree;
