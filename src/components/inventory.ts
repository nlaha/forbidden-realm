import { Component } from "excalibur";
import { Storage } from "../storage";

export class InventoryComponent extends Component {
  public items: Map<string, number> = new Map();
  public capacity: number = 2;

  public onAdd() {}

  public addItem(item: string) {
    if (this.hasCapacity()) {
      this.items.set(item, (this.items.get(item) ?? 0) + 1);
      Storage.addResource(item, 1);
      return true;
    } else {
      return false;
    }
  }

  public getNumItems(): number {
    return Array.from(this.items.values()).reduce((a, b) => a + b, 0);
  }

  public removeItem(item: string | undefined = undefined): string {
    // if no item is specified, remove any item
    if (!item) {
      item = Array.from(this.items.keys())[0];
    }
    // remove one of this item from the inventory
    this.items.set(item, this.items.get(item)! - 1);
    // if the item count is 0, remove it from the inventory
    if (this.items.get(item) === 0) {
      this.items.delete(item);
    }

    Storage.removeResource(item, 1);
    return item;
  }

  public hasCapacity(): boolean {
    return this.getNumItems() < this.capacity;
  }
}