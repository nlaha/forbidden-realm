import { Query, System, SystemType, World } from "excalibur";
import Character from "../actors/character";
import {
  CharacterComponent,
  InventoryComponent,
  VisionComponent,
} from "../components/character";

class UIUpdateSystem extends System {
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
            <td>${characterComponent.state}</td>
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
  }
}

export default UIUpdateSystem;
