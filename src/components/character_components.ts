import { Component } from "excalibur";
import { female_names, male_names } from "../tables/names";

export class LivingComponent extends Component {
  public health: number = 100;
  public maxHealth: number = 100;

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

export class CharacterComponent extends Component {
  public first_name: string;
  public last_name: string;

  public onAdd() {
    const all_names = [...male_names, ...female_names];
    const random_name = all_names[Math.floor(Math.random() * all_names.length)];

    this.first_name = random_name;
    console.log(`Hello, my name is ${this.first_name}`);
  }
}
