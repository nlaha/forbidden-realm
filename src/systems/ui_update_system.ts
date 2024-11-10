import { Query, System, SystemType, World } from "excalibur";
import Character from "../actors/character";
import {
  CharacterComponent,
  InventoryComponent,
  VisionComponent,
} from "../components/character";
import MainScene from "../main_scene";

class UIUpdateSystem extends System {
  query: Query<
    | typeof CharacterComponent
    | typeof InventoryComponent
    | typeof VisionComponent
  >;

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
    if (this.query.entities.length === 0) {
      console.log("No characters found in UIUpdateSystem");
      return;
    }

    // update tabulator table data in main scene
    const scene = this.query.entities[0].scene as MainScene;

    if (!scene.status_table) {
      console.log("No status_table found in UIUpdateSystem");
      return;
    }

    const newData = this.query.entities.map((entity, idx) => {
      const character = entity as Character;
      const characterComponent = character.get(CharacterComponent);
      const inventoryComponent = character.get(InventoryComponent);
      const visionComponent = character.get(VisionComponent);

      return {
        id: idx,
        eid: character.id,
        name: characterComponent.first_name,
        role: characterComponent.role,
        state: characterComponent.state,
        inventory: inventoryComponent.items.join(""),
        vision: visionComponent.visibleEntities.size,
      };
    });

    if (scene.status_table.getData().length === 0) {
      scene.status_table.setData(newData);
    } else {
      scene.status_table.updateData(newData);
    }
  }
}

export default UIUpdateSystem;
