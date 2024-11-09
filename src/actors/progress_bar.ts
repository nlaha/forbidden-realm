import { Actor, ActorArgs, Color, Text, Rectangle } from "excalibur";
import { spriteFont } from "../resources";

class ProgressIndicator extends Actor {
  percent: number = 0;

  constructor(config: ActorArgs) {
    super(config);

    this.graphics.add(
      "percent_text",
      new Text({
        text: `${this.percent}`,
        font: spriteFont,
      })
    );

    this.graphics.use("percent_text");

    this.z = 1000;
  }

  public setPercent(percent: number) {
    this.percent = Math.min(100, Math.max(0, percent));
    (
      this.graphics.getGraphic("percent_text")! as Text
    ).text = `${this.percent}`;
  }

  public onInitialize() {}
}

export default ProgressIndicator;
