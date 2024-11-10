import { Color, Font, ImageSource, Label, vec } from "excalibur";
import { CharacterRole } from "../../components/character";
import { InventoryComponent } from "../../components/inventory";
import Building from "../building";
import { HarvestableResourceComponent } from "../../components/harvestable";
import MainScene from "../../main_scene";
import { VisibleComponent } from "../../components/visible";

class Farm extends Building {
  label: Label;

  constructor(
    isoMap: ex.IsometricMap,
    pos: ex.Vector,
    img: ImageSource,
    walkability: number,
    cost: Map<string, number>
  ) {
    super(isoMap, pos, img, walkability, cost);
  }

  public update(engine: ex.Engine, delta: number): void {
    super.update(engine, delta);
  }

  public onConstructionDone(): void {
    super.onConstructionDone();

    // add HarvestableResourceComponent
    this.addComponent(new VisibleComponent());
    this.addComponent(new HarvestableResourceComponent());
    this.get(HarvestableResourceComponent).resourceType = "🌿";
    this.get(HarvestableResourceComponent).harvestableBy = [
      CharacterRole.FARMER,
    ];

    // add to scene harvestables array
    (this.scene as MainScene).harvestables.push(this);
  }
}

export default Farm;
