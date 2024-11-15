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

class UIUpdateSystem {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof VisionComponent
    | typeof LivingComponent
  >;

  public world: World;

  constructor(world: World) {
    this.world = world;

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
  public static table_built = false;
  public obituary_table_html = "";

  public update(delta: number) {
    // update the storage display
    document.getElementById("storage")!.innerText = Array.from(
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

    const obituaryData = scene.deaths.map((death) => {
      return `
            <tr>
                <td>${death.name}</td>
                <td>${death.cause}</td>
            </tr>
            `;
    });

    if (scene.deaths.length > 0) {
      const obituaryTable = document.getElementById("obituary")!;
      this.obituary_table_html = `
            <tr>
                <th>Name</th>
                <th>Cause</th>
            </tr>
            ${obituaryData.join("")}
        `;
      if (this.obituary_table_html !== obituaryTable.innerHTML) {
        obituaryTable.innerHTML = this.obituary_table_html;
      }
    }

    if (!UIUpdateSystem.table_built) {
      console.warn("Building table");
      return;
    }

    if (!scene.status_table) {
      console.log("No status_table found in UIUpdateSystem");
      return;
    }

    let newData = this.query.entities.map((entity, idx) => {
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
    });

    // if the table matches the data, don't update it
    if (scene.status_table.getData() === newData) {
      console.warn("Data matches, not updating table");
      return;
    }

    // if we can't find the entity ID in the table, add it
    for (let data of newData) {
      // if the state is dead, remove the character from the table
      if (data.state === CharacterState.DEAD) {
        scene.status_table.deleteRow(data.id);
      } else {
        scene.status_table.updateOrAddRow(data.id, data);
      }
    }
  }
}

export default UIUpdateSystem;
