import { Component } from "excalibur";

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

  public onInitialize() {}
}

export interface Thought {
  message: string;
  negativity: number;
}

export class BrainComponent extends Component {
  public thoughts: Thought[] = [];

  public onInitialize() {}

  public think(thought: Thought) {
    this.thoughts.push(thought);
  }
}

export class CharacterComponent extends Component {
  public first_name: string;
  public last_name: string;

  public onInitialize() {}
}
