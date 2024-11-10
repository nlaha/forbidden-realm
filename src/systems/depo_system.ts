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
  InventoryComponent,
  NeighborsComponent,
} from "../components/character";
import Character from "../actors/character";
import { BuildingComponent } from "../components/building";

class DepotSystem extends System {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof NeighborsComponent
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
    ]);

    this.buildingQuery = world.query([
      TransformComponent,
      InventoryComponent,
      BuildingComponent,
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
      const inventoryComponent = character.get(InventoryComponent);

      // make sure we're not already walking
      if (characterComponent.state !== CharacterState.IDLE) {
        continue;
      }

      // check if character has items to deposit
      if (inventoryComponent.items.length === 0) {
        continue;
      }

      // get buildings that have capacity in the buildingQuery
      const buildingsWithCapacity = this.buildingQuery.entities.filter(
        (building) => {
          const buildingInventory = building.get(InventoryComponent);
          return buildingInventory.hasCapacity();
        }
      );

      // if any of these are in the neighbors, deposit resources
      const neighbors = Array.from(neighborsComponent.neighbors);
      const buildingsInNeighbors = buildingsWithCapacity.filter((building) =>
        neighbors.includes(building)
      );

      if (buildingsInNeighbors.length > 0) {
        const building = buildingsInNeighbors[0];
        const inventory = character.get(InventoryComponent);
        const buildingInventory = building.get(InventoryComponent);
        characterComponent.state = CharacterState.DEPOSITING;

        // deposit resources
        character.actions.delay(1000).callMethod(() => {
          const item = inventory.items.pop();
          if (!item) {
            return;
          }
          buildingInventory.addItem(item);
          console.log("Deposited", item);
          characterComponent.state = CharacterState.IDLE;
        });
      }

      // if there are no buildings with capacity, we can't deposit resources
      if (buildingsWithCapacity.length === 0) {
        continue;
      }

      // move to the first building with capacity
      const building = buildingsWithCapacity[0];

      character.walkTo(building.get(TransformComponent).pos);
    }
  }
}
export default DepotSystem;
