import {
  Actor,
  ActorArgs,
  IsometricEntityComponent,
  IsometricMap,
  Vector,
} from "excalibur";
import { Characters } from "../resources";
import {
  BrainComponent,
  CharacterComponent,
  LivingComponent,
} from "../components/character_components";

class Character extends Actor {
  isoMap: IsometricMap;

  constructor(isoMap: IsometricMap, config: ActorArgs) {
    super(config);

    this.isoMap = isoMap;

    this.addComponent(new IsometricEntityComponent(this.isoMap));
    this.addComponent(new LivingComponent());
    this.addComponent(new BrainComponent());
    this.addComponent(new CharacterComponent());
    this.graphics.use(Characters.Worker.toSprite());
  }

  public move(pos: ex.Vector) {
    // lerp to new position
    this.actions.easeTo(pos, 1000);
  }

  public onInitialize() {}
}

export default Character;
