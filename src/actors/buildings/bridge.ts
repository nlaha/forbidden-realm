import { Color, Font, ImageSource, Label, vec } from "excalibur";
import { CharacterRole } from "../../components/character";
import { InventoryComponent } from "../../components/inventory";
import Building from "../building";
import { HarvestableResourceComponent } from "../../components/harvestable";
import MainScene from "../../main_scene";
import { VisibleComponent } from "../../components/visible";

class Bridge extends Building {
  constructor(
    isoMap: ex.IsometricMap,
    pos: ex.Vector,
    img: ImageSource,
    walkability: number,
    cost: Map<string, number>
  ) {
    super(isoMap, pos, img, walkability, cost);

    // add bridge tag to the building
    this.tags.add("bridge");
  }

  public update(engine: ex.Engine, delta: number): void {
    super.update(engine, delta);
  }

  public onConstructionDone(): void {
    super.onConstructionDone();
  }
}

export default Bridge;
