import {
  Actor,
  ActorArgs,
  ImageSource,
  IsometricEntityComponent,
  IsometricMap,
} from "excalibur";
import { HarvestableResource } from "../components/harvestable_components";

class Harvestable extends Actor {
  isoMap: IsometricMap;

  constructor(isoMap: IsometricMap, config: ActorArgs, img: ImageSource) {
    super(config);

    this.isoMap = isoMap;

    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.addComponent(new HarvestableResource());

    this.graphics.use(img.toSprite());
  }

  public onInitialize() {}
}

export default Harvestable;
