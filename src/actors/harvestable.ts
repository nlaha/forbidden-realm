import {
  Actor,
  ActorArgs,
  ImageSource,
  IsometricEntityComponent,
  IsometricMap,
} from "excalibur";
import { HarvestableResourceComponent } from "../components/harvestable";
import { compute_iso_collider } from "../utility/utils";
import { VisibleComponent } from "../components/visible";

class Harvestable extends Actor {
  isoMap: IsometricMap;

  constructor(
    isoMap: IsometricMap,
    config: ActorArgs,
    img: ImageSource,
    resourceType: string
  ) {
    super(config);

    this.isoMap = isoMap;

    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.addComponent(new HarvestableResourceComponent());
    this.addComponent(new VisibleComponent());

    // set harvestable resource type
    this.get(HarvestableResourceComponent).resourceType = resourceType;

    this.graphics.use(img.toSprite());

    this.collider.set(compute_iso_collider(this.graphics.current!));
  }

  public onInitialize() {}
}

export default Harvestable;
