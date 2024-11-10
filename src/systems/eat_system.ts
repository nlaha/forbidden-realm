import {
  Query,
  System,
  SystemType,
  TransformComponent,
  World,
} from "excalibur";
import {
  CharacterComponent,
  CharacterState,
  LivingComponent,
  NeighborsComponent,
} from "../components/character";
import { InventoryComponent } from "../components/inventory";
import Character from "../actors/character";
import { BuildingComponent } from "../components/building";
import { closest_entity } from "../utility/utils";

class EatSystem extends System {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof NeighborsComponent
    | typeof LivingComponent
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
      NeighborsComponent,
      LivingComponent,
    ]);

    this.buildingQuery = world.query([
      TransformComponent,
      InventoryComponent,
      BuildingComponent,
    ]);
  }
  // Lower numbers mean higher priority
  // 99 is low priority
  public priority = 40;
  // Run this system in the "update" phase
  public systemType = SystemType.Update;

  public update(delta: number) {
    for (let entity of this.query.entities) {
      const character = entity as Character;
      const characterComponent = character.get(CharacterComponent);
      const neighborsComponent = character.get(NeighborsComponent);
      const livingComponent = character.get(LivingComponent);

      // make sure we're actually hungry
      if (!livingComponent.isHungry()) {
        continue;
      }

      // make sure our state isn't WALKING
      if (characterComponent.state !== CharacterState.IDLE) {
        continue;
      }

      // if we have food in our inventory, eat it
      const inventoryComponent = character.get(InventoryComponent);
      if (inventoryComponent.items.has("🌿")) {
        characterComponent.state = CharacterState.EATING;
        // after 1 second, eat the food
        character.actions.delay(1000).callMethod(() => {
          const item = inventoryComponent.removeItem("🌿");
          if (item) {
            livingComponent.eat(100);
          }
          characterComponent.state = CharacterState.IDLE;
        });

        continue;
      }

      // get buildings that have food
      const buildingsWithCapacity = this.buildingQuery.entities.filter(
        (building) => {
          const buildingInventory = building.get(InventoryComponent);
          return buildingInventory.items.has("🌿");
        }
      );

      // get the closest building
      const closestBuilding = closest_entity(entity, buildingsWithCapacity);

      // if we have a building, walk to it
      if (closestBuilding) {
        // see if it's in our neighbors
        const isNeighbor = neighborsComponent.neighbors.has(closestBuilding);

        if (isNeighbor) {
          // if we're next to the building, eat
          characterComponent.state = CharacterState.EATING;
          // after 1 second, eat the food
          character.actions.delay(1000).callMethod(() => {
            const item = closestBuilding
              .get(InventoryComponent)
              .removeItem("🌿");
            if (item) {
              livingComponent.eat(100);
            }
            characterComponent.state = CharacterState.IDLE;
          });
        } else {
          character.walkTo(closestBuilding.get(TransformComponent).pos);
        }
      }
    }
  }
}

export default EatSystem;
