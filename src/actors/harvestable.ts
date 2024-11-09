import {
  Actor,
  ActorArgs,
  ImageSource,
  IsometricEntityComponent,
  IsometricMap,
} from "excalibur";
import { HarvestableResource } from "../components/harvestable_components";
import { compute_iso_collider } from "../utility/utils";

class Harvestable extends Actor {
  isoMap: IsometricMap;

  constructor(isoMap: IsometricMap, config: ActorArgs, img: ImageSource) {
    super(config);

    this.isoMap = isoMap;

    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.addComponent(new HarvestableResource());

    this.graphics.use(img.toSprite());

    this.collider.set(compute_iso_collider(this, this.graphics.current!));
  }

  public onInitialize() {}
}

export default Harvestable;
