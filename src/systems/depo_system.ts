import {
  Entity,
  Query,
  System,
  SystemType,
  TransformComponent,
  World,
} from "excalibur";
import {
  CharacterComponent,
  CharacterState,
  InventoryComponent,
  VisionComponent,
} from "../components/character";
import Character from "../actors/character";
import { BuildingComponent } from "../components/building";

class DepotSystem extends System {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof VisionComponent
  >;

  buildingQuery: Query<
    | typeof TransformComponent
    | typeof InventoryComponent
    | typeof BuildingComponent
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
  // 99 is low priority
  public priority = 90;
  // Run this system in the "update" phase
  public systemType = SystemType.Update;

  public update(delta: number) {
    for (let entity of this.query.entities) {
      const character = entity as Character;
      const characterComponent = character.get(CharacterComponent);
      const visionComponent = character.get(VisionComponent);

      // make sure our state is HARVESTING
      if (characterComponent.state !== CharacterState.HARVESTING) {
        continue;
      }

      // check if character has a full inventory
      if (!character.get(InventoryComponent).hasCapacity()) {
        characterComponent.state = CharacterState.IDLE;
        continue;
      }

      // check if we have a building in vision
      const buildings = visionComponent.getWithComponent(BuildingComponent);
      if (buildings.length === 0) {
        characterComponent.state = CharacterState.IDLE;
        continue;
      }

      // find the closest building
      let closestBuilding: Entity | null = null;
      let closestDistance = Infinity;
      for (let building of buildings) {
        const buildingTransform = building.get(TransformComponent);
        if (!buildingTransform) {
          continue;
        }

        const distance = character.pos.distance(buildingTransform.pos);
        if (distance < closestDistance) {
          closestBuilding = building;
          closestDistance = distance;
        }
      }

      // walk to the building
      character.walkTo(closestBuilding!.get(TransformComponent)!.pos);
      characterComponent.state = CharacterState.WALKING;
    }
  }
}
export default DepotSystem;
