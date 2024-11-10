import { IsometricMap, ActorArgs, ImageSource } from "excalibur";
import Harvestable from "../harvestable";
import { HarvestableResourceComponent } from "../../components/harvestable";
import { CharacterRole } from "../../components/character";

class Rock extends Harvestable {
  constructor(
    isoMap: IsometricMap,
    config: ActorArgs,
    img: ImageSource,
    resourceType: string
  ) {
    super(isoMap, config, img, resourceType);

    this.get(HarvestableResourceComponent).harvestableBy = [
      CharacterRole.MINER,
    ];

    this.addTag("rock");
  }
}

export default Rock;
