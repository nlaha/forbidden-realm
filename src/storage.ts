import { World } from "excalibur";
import { InventoryComponent } from "./components/inventory";
import { BuildingComponent } from "./components/building";

export abstract class Storage {
  static storage: Map<string, number> = new Map();

  static canAfford(cost: Map<string, number>): boolean {
    for (const [resource, amount] of cost.entries()) {
      if ((Storage.storage.get(resource) ?? 0) < amount) {
        return false;
      }
    }
    return true;
  }

  static addResource(resource: string, amount: number) {
    console.log(`Adding ${amount} ${resource} to storage`);
    Storage.storage.set(
      resource,
      (Storage.storage.get(resource) ?? 0) + amount
    );
  }

  static removeResource(resource: string, amount: number) {
    console.log(`Removing ${amount} ${resource} from storage`);
    Storage.storage.set(
      resource,
      (Storage.storage.get(resource) ?? 0) - amount
    );
  }

  // clear all inventories in the world and reset storage
  static clearInventories(world: World) {
    const inventoryQuery = world.query([InventoryComponent]);
    for (let entity of inventoryQuery.entities) {
      entity.get(InventoryComponent).items.clear();
    }
    Storage.storage.clear();
  }

  static pay(cost: Map<string, number>, world: World) {
    // query all inventory + building components
    const inventoryQuery = world.query([InventoryComponent]);

    const tempCost = new Map(cost);
    for (let entity of inventoryQuery.entities) {
      const inventory = entity.get(InventoryComponent);

      // remove resources from this inventory until we've paid
      // the cost or run out of resources of this type
      for (const resourceType of cost.keys()) {
        // start removing resources from this inventory
        while (
          (inventory.items.get(resourceType) ?? 0) > 0 && // we have this resource
          tempCost.get(resourceType)! > 0 // we still need to pay for this resource
        ) {
          console.log(`Paying ${resourceType} from inventory ${entity.id}`);
          inventory.removeItem(resourceType);
          tempCost.set(resourceType, tempCost.get(resourceType)! - 1);
        }
      }
    }
  }
}
