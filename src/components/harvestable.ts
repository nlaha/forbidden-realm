import { Component } from "excalibur";

export class HarvestableResourceComponent extends Component {
  public resourceType: string;
  public amount: number;

  public onInitialize() {}

  public harvest(amount: number) {
    this.amount -= amount;
    if (this.amount < 0) {
      this.amount = 0;
    }
  }

  public isEmpty(): boolean {
    return this.amount <= 0;
  }
}
