import { Query, System, SystemType, World } from "excalibur";
import Character from "../actors/character";
import {
  CharacterComponent,
  CharacterRole,
  CharacterState,
  LivingComponent,
  VisionComponent,
} from "../components/character";
import { InventoryComponent } from "../components/inventory";
import MainScene from "../main_scene";
import { Storage } from "../storage";

class UIUpdateSystem extends System {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof VisionComponent
    | typeof LivingComponent
  >;

  constructor(world: World) {
    super();
    this.query = world.query([
      CharacterComponent,
      InventoryComponent,
      VisionComponent,
      LivingComponent,
    ]);
  }
  // Lower numbers mean higher priority
  // 99 is low priority
  public priority = 200;
  // Run this system in the "update" phase
  public systemType = SystemType.Update;

  public update(delta: number) {
    // update the storage display
    document.getElementById("storage")!.innerHTML = Array.from(
      Storage.storage.entries()
    )
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    if (this.query.entities.length === 0) {
      console.log("No characters found in UIUpdateSystem");
      return;
    }

    // update tabulator table data in main scene
    const scene = this.query.entities[0].scene as MainScene;

    // for each element in the building definitions, check if the player can afford it
    // if they can, update the UI to show that the building is available
    // if they can't, update the UI to show that the building is unavailable
    for (let item of scene.buildingDefinitions) {
      const canAfford = Storage.canAfford(item.definition.cost);
      item.element.classList.toggle("unavailable", !canAfford);
    }

    const obituaryTable = document.getElementById("obituary")!;
    const obituaryData = scene.deaths.map((death) => {
      return `
            <tr>
                <td>${death.name}</td>
                <td>${death.cause}</td>
            </tr>
            `;
    });

    if (scene.deaths.length > 0) {
      obituaryTable.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Cause</th>
            </tr>
            ${obituaryData.join("")}
        `;
    }

    if (!scene.status_table) {
      console.log("No status_table found in UIUpdateSystem");
      return;
    }

    let newData = this.query.entities
      .map((entity, idx) => {
        const character = entity as Character;
        const characterComponent = character.get(CharacterComponent);
        const inventoryComponent = character.get(InventoryComponent);
        const visionComponent = character.get(VisionComponent);
        const livingComponent = character.get(LivingComponent);

        const invString = Array.from(inventoryComponent.items.keys())
          .filter((key) => inventoryComponent.items.get(key)! > 0)
          .map((key) => key.repeat(inventoryComponent.items.get(key) ?? 0))
          .join("");

        return {
          id: character.id,
          name: characterComponent.first_name,
          state: characterComponent.state,
          role: characterComponent.role,
          health: livingComponent.health,
          food: livingComponent.food,
          inventory: invString,
          vision: visionComponent.visibleEntities.size,
        };
      })
      .filter((data) => data.state !== CharacterState.DEAD);

    // if we can't find the entity ID in the table, add it
    const currentIds = scene.status_table.getData().map((data) => data.id);
    for (let data of newData) {
      if (!currentIds.includes(data.id)) {
        scene.status_table.addRow(data);
      } else {
        // remove role column
        scene.status_table.updateRow(data.id, {
          id: data.id,
          name: data.name,
          state: data.state,
          health: data.health,
          food: data.food,
          inventory: data.inventory,
          vision: data.vision,
        });
      }
    }
  }
}

export default UIUpdateSystem;
