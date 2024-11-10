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
  NeighborsComponent,
  VisionComponent,
} from "../components/character";
import Character from "../actors/character";
import { HarvestableResourceComponent } from "../components/harvestable";
import Harvestable from "../actors/harvestable";
import { closest_entity } from "../utility/utils";

class HarvestSystem extends System {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof NeighborsComponent
  >;

  public info_table: string | null = null;

  constructor(world: World) {
    super();
    this.query = world.query([
      CharacterComponent,
      InventoryComponent,
      NeighborsComponent,
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
      const neighborsComponent = character.get(NeighborsComponent);

      // make sure our state is IDLE
      if (characterComponent.state !== CharacterState.IDLE) {
        continue;
      }

      // make sure we have inventory space
      if (!character.get(InventoryComponent).hasCapacity()) {
        continue;
      }

      const harvestables = neighborsComponent.getWithComponent(
        HarvestableResourceComponent
      );

      // check if we have any harvestables in the neighbors
      if (harvestables.length === 0) {
        continue;
      }

      const closestHarvestable = closest_entity(character, harvestables);

      // if we found a harvestable, set our state to HARVESTING
      if (closestHarvestable) {
        characterComponent.state = CharacterState.HARVESTING;

        // after 2 seconds, harvest the resource
        character.actions.delay(2000).callMethod(() => {
          const inventory = character.get(InventoryComponent);
          const harvestable = closestHarvestable as Harvestable;
          const harvestableComponent = harvestable.get(
            HarvestableResourceComponent
          );
          inventory.addItem(harvestableComponent.resourceType);
          characterComponent.state = CharacterState.IDLE;
        });
      }
    }
  }
}
export default HarvestSystem;
