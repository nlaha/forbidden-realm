import { ImageSource, vec } from "excalibur";
import Building from "../building";
import { CharacterComponent, CharacterRole } from "../../components/character";

class Church extends Building {
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

    const character = import("../../actors/character").then((module) => {
      // when the church is constructed, spawn a new character
      // spawn humans in random locations
      const human = new module.default(this.isoMap, {
        pos: this.pos.add(vec(-40, 40)),
      });
      human.get(CharacterComponent).role = CharacterRole.WOODCUTTER;
      this.scene!.add(human);
    });
  }
}

export default Church;
