import {
  Entity,
  Query,
  System,
  SystemType,
  TransformComponent,
  Vector,
  World,
} from "excalibur";
import {
  CharacterComponent,
  CharacterState,
  VisionComponent,
} from "../components/character";
import { InventoryComponent } from "../components/inventory";
import Character from "../actors/character";
import { game } from "../main";
import { HarvestableResourceComponent } from "../components/harvestable";
import MainScene from "../main_scene";

class IdleSystem extends System {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof VisionComponent
  >;

  public info_table: string | null = null;

  constructor(world: World) {
    super();
    this.query = world.query([
      CharacterComponent,
      InventoryComponent,
      VisionComponent,
    ]);
  }
  // Lower numbers mean higher priority
  public priority = 150;
  // Run this system in the "update" phase
  public systemType = SystemType.Update;

  public update(delta: number) {
    for (let entity of this.query.entities) {
      const character = entity as Character;
      const characterComponent = character.get(CharacterComponent);
      // make sure our state is IDLE
      if (characterComponent.state !== CharacterState.IDLE) {
        continue;
      }

      const isoMap = (game.currentScene as MainScene).isoMap;

      // pick a random tile
      const randomTile = isoMap.getTile(
        Math.floor(Math.random() * isoMap.columns),
        Math.floor(Math.random() * isoMap.rows)
      );

      // walk to the random tile
      character.walkTo(randomTile!.pos);
    }
  }
}
export default IdleSystem;
