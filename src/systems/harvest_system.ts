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
  CharacterRole,
  CharacterState,
  NeighborsComponent,
  VisionComponent,
} from "../components/character";
import { InventoryComponent } from "../components/inventory";
import Character from "../actors/character";
import { HarvestableResourceComponent } from "../components/harvestable";
import Harvestable from "../actors/harvestable";
import { closest_entity } from "../utility/utils";
import { HarvestRateIncreaseComponent } from "../components/harvestRateIncrease";

class HarvestSystem extends System {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof NeighborsComponent
    | typeof VisionComponent
  >;

  harvestRateQuery: Query<typeof HarvestRateIncreaseComponent>;

  public info_table: string | null = null;

  public static harvestRate = 1;

  constructor(world: World) {
    super();
    this.query = world.query([
      CharacterComponent,
      InventoryComponent,
      NeighborsComponent,
      VisionComponent,
    ]);

    this.harvestRateQuery = world.query([HarvestRateIncreaseComponent]);
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
      const visionComponent = character.get(VisionComponent);

      const characterRole = character.get(CharacterComponent).role;

      if (
        ![
          CharacterRole.FARMER,
          CharacterRole.MINER,
          CharacterRole.WOODCUTTER,
        ].includes(characterRole)
      ) {
        continue;
      }

      // make sure our state is IDLE
      if (characterComponent.state !== CharacterState.IDLE) {
        continue;
      }

      // make sure we have inventory space
      if (!character.get(InventoryComponent).hasCapacity()) {
        continue;
      }

      // check to see if we can see a harvestable resource
      const visisbleHarvestables = visionComponent
        .getWithComponent(HarvestableResourceComponent)
        .filter((harvestable) => {
          const harvestableComponent = harvestable.get(
            HarvestableResourceComponent
          );
          return harvestableComponent.harvestableBy.includes(characterRole);
        });

      // return if we can't see any harvestable resources
      if (visisbleHarvestables.length === 0) {
        continue;
      }

      // check if any of these are in the neighbors
      const neighbors = Array.from(neighborsComponent.neighbors);
      const harvestables = visisbleHarvestables.filter((harvestable) =>
        neighbors.includes(harvestable)
      );

      // if we don't have any harvestables in our neighbors, walk to the closest one
      if (harvestables.length === 0 && visisbleHarvestables.length > 0) {
        // if we can see a harvestable, get the closest one
        const closestVisibleHarvestable = closest_entity(
          character,
          visisbleHarvestables
        );

        // walk to the closest harvestable
        if (closestVisibleHarvestable) {
          character.walkTo(
            closestVisibleHarvestable.get(TransformComponent).pos
          );
        }
      }

      const closestHarvestable = closest_entity(character, harvestables);

      // if we found a harvestable, set our state to HARVESTING
      if (closestHarvestable) {
        characterComponent.state = CharacterState.HARVESTING;

        // add up the harvest rate increase
        const harvestRateIncrease = 100 * this.harvestRateQuery.entities.length;
        const baseDelay = 3000 * HarvestSystem.harvestRate;
        const harvestDelay = baseDelay - harvestRateIncrease;

        // after the delay, harvest the resource
        character.actions.delay(harvestDelay).callMethod(() => {
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
