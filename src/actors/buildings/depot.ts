import { Color, Font, ImageSource, Label, vec } from "excalibur";
import { InventoryComponent } from "../../components/character";
import Building from "../building";

class Depot extends Building {
  label: Label;

  constructor(
    isoMap: ex.IsometricMap,
    pos: ex.Vector,
    img: ImageSource,
    walkability: number
  ) {
    super(isoMap, pos, img, walkability);
  }

  public update(engine: ex.Engine, delta: number): void {
    super.update(engine, delta);
    if (this.label) {
      // update label
      const inventory = this.get(InventoryComponent);
      this.label.text = `${inventory.items.length}/${inventory.capacity}`;
    }
  }

  public onConstructionDone(): void {
    super.onConstructionDone();

    // add inventory component
    this.addComponent(new InventoryComponent());
    this.get(InventoryComponent).capacity = 10;

    // add label showing the building inventory capacity
    const label = new Label({
      text: "0/0",
      pos: vec(-10, 0),
      color: Color.fromHex("#ffa618"),
      font: new Font({ size: 15, family: "Alagard" }),
      z: 1000,
    });

    this.addChild(label);
    this.label = label;
  }
}

export default Depot;
