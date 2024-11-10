import { Component, Entity } from "excalibur";
import { female_names, male_names } from "../tables/names";

export class LivingComponent extends Component {
  public health: number = 100;
  public maxHealth: number = 100;

  public food: number = 100;

  public isDead(): boolean {
    return this.health <= 0;
  }

  public isHungry(): boolean {
    return this.food <= 50;
  }

  public isStarving(): boolean {
    return this.food <= 0;
  }

  public eat(amount: number) {
    if (this.food + amount > 100) {
      this.food = 100;
    } else {
      this.food += amount;
    }
  }

  public starve(amount: number) {
    this.food -= amount;
    if (this.food < 0) {
      this.food = 0;
    }
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

export enum CharacterState {
  WALKING = "walking",
  IDLE = "idle",
  HARVESTING = "harvesting",
  DEPOSITING = "depositing",
  DEAD = "dead",
  EATING = "eating",
}

export enum CharacterRole {
  MINER = "miner",
  FARMER = "farmer",
  WOODCUTTER = "woodcutter",
}

export class CharacterComponent extends Component {
  public first_name: string;
  public last_name: string;

  public role: CharacterRole = CharacterRole.MINER;

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

export class NeighborsComponent extends Component {
  public range: number = 50;

  public neighbors: Set<Entity> = new Set();

  // Gets all visible entities that have the given component
  public getWithComponent<T extends Component>(
    component: new () => T
  ): Entity[] {
    return Array.from(this.neighbors).filter((e): e is Entity =>
      e.has(component)
    );
  }
}
