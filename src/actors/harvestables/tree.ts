import {
  Actor,
  ActorArgs,
  ImageSource,
  IsometricEntityComponent,
  IsometricMap,
} from "excalibur";
import { Foliage } from "../../resources";
import { compute_iso_collider } from "../../utility/utils";
import Harvestable from "../harvestable";
import { HarvestableResourceComponent } from "../../components/harvestable";
import { CharacterRole } from "../../components/character";

class Tree extends Harvestable {
  constructor(
    isoMap: IsometricMap,
    config: ActorArgs,
    img: ImageSource,
    resourceType: string
  ) {
    super(isoMap, config, img, resourceType);

    this.get(HarvestableResourceComponent).harvestableBy = [
      CharacterRole.WOODCUTTER,
    ];
  }

  public onInitialize() {}
}

export default Tree;
