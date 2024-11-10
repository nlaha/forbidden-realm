import { ImageSource, vec } from "excalibur";
import Building from "../building";
import { HarvestRateIncreaseComponent } from "../../components/harvestRateIncrease";

class Blacksmith extends Building {
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

    this.addComponent(new HarvestRateIncreaseComponent());
  }
}

export default Blacksmith;
