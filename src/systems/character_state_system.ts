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
  InventoryComponent,
  VisionComponent,
} from "../components/character";
import Character from "../actors/character";
import { game } from "../main";
import { HarvestableResourceComponent } from "../components/harvestable";
import MainScene from "../main_scene";

function stateToString(state: CharacterState): string {
  switch (state) {
    case CharacterState.IDLE:
      return "IDLE";
    case CharacterState.WALKING:
      return "WALKING";
    case CharacterState.HARVESTING:
      return "HARVESTING";
  }
}

class CharacterStateSystem extends System {
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
  // 99 is low priority
  public priority = 99;
  // Run this system in the "update" phase
  public systemType = SystemType.Update;

  public update(delta: number) {
    // update html in info-panel
    const infoPanel = document.getElementById("info-panel");
    // get table body
    const tableBody = infoPanel!.querySelector("tbody");

    this.info_table = this.query.entities
      .map((entity) => {
        const character = entity as Character;
        const characterComponent = character.get(CharacterComponent);
        const inventoryComponent = character.get(InventoryComponent);
        const visionComponent = character.get(VisionComponent);

        return `
          <tr>
            <td>${characterComponent.first_name}</td>
            <td>${stateToString(characterComponent.state)}</td>
            <td>${inventoryComponent.items.join(", ")}</td>
            <td>${Array.from(visionComponent.visibleEntities)
              .map((e) => e.name)
              .join(", ")}</td>
          </tr>
        `;
      })
      .join("");

    // check if we need to update the table
    if (tableBody!.innerHTML === this.info_table) {
      return;
    }

    tableBody!.innerHTML = this.info_table ?? "";

    for (let entity of this.query.entities) {
      const character = entity as Character;
      const characterComponent = character.get(CharacterComponent);
      const visionComponent = character.get(VisionComponent);

      // make sure our state is IDLE
      if (characterComponent.state !== CharacterState.IDLE) {
        continue;
      }

      const characterPos = character.get(TransformComponent)?.pos;
      const isoMap = (game.currentScene as MainScene).isoMap;

      // check to see if we can see a harvestable resource
      const harvestables = visionComponent.getWithComponent(
        HarvestableResourceComponent
      );
      if (harvestables.length > 0) {
        character.walkTo(harvestables[0].get(TransformComponent)!.pos);
        characterComponent.state = CharacterState.WALKING;
      } else {
        // pick a random tile
        const randomTile = isoMap.getTile(
          Math.floor(Math.random() * isoMap.columns),
          Math.floor(Math.random() * isoMap.rows)
        );

        // walk to the random tile
        character.walkTo(randomTile!.pos);
        characterComponent.state = CharacterState.WALKING;
      }
    }
  }
}
export default CharacterStateSystem;
