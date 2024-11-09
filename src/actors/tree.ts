import {
  Actor,
  ActorArgs,
  IsometricEntityComponent,
  IsometricMap,
} from "excalibur";
import { Foliage } from "../resources";

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
  }

  public onInitialize() {}
}

export default Tree;
