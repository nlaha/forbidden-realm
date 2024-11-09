import {
  Actor,
  ActorArgs,
  IsometricEntityComponent,
  IsometricMap,
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

  public onInitialize() {}
}

export default Character;
