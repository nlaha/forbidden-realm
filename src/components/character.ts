import { Component, Entity } from "excalibur";
import { female_names, male_names } from "../tables/names";

export class LivingComponent extends Component {
  public health: number = 100;
  public maxHealth: number = 100;
  public energy: number = 100;

  public isDead(): boolean {
    return this.health <= 0;
  }

  public takeDamage(damage: number) {
    this.health -= damage;
    if (this.health < 0) {
      this.health = 0;
    }
  }

  public heal(amount: number) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  public canAct(): boolean {
    return this.energy >= 100;
  }

  public onAdd() {}
}

export interface Thought {
  message: string;
  negativity: number;
}

export class BrainComponent extends Component {
  public thoughts: Thought[] = [];

  public onAdd() {}

  public think(thought: Thought) {
    this.thoughts.push(thought);
  }
}

export class InventoryComponent extends Component {
  public items: string[] = [];
  public capacity: number = 10;

  public onAdd() {}

  public addItem(item: string) {
    if (this.items.length < this.capacity) {
      this.items.push(item);
      return true;
    } else {
      return false;
    }
  }

  public removeItem(item: string) {
    this.items = this.items.filter((i) => i !== item);
  }

  public hasCapacity(): boolean {
    return this.items.length < this.capacity;
  }
}

export enum CharacterState {
  WALKING,
  IDLE,
  HARVESTING,
}

export class CharacterComponent extends Component {
  public first_name: string;
  public last_name: string;

  public state: CharacterState = CharacterState.IDLE;

  public onAdd() {
    const all_names = [...male_names, ...female_names];
    const random_name = all_names[Math.floor(Math.random() * all_names.length)];

    this.first_name = random_name;
    console.log(`Hello, my name is ${this.first_name}`);
  }
}

export class VisionComponent extends Component {
  public range: number = 200;

  public visibleEntities: Set<Entity> = new Set();

  // Gets all visible entities that have the given component
  public getWithComponent<T extends Component>(
    component: new () => T
  ): Entity[] {
    return Array.from(this.visibleEntities).filter((e): e is Entity =>
      e.has(component)
    );
  }
}
