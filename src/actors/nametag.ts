import { Actor, ActorArgs, Color, Text, Rectangle, Font } from "excalibur";
import { spriteFont } from "../resources";

class NameTag extends Actor {
  text: string = "";

  constructor(config: ActorArgs, text: string) {
    super(config);

    this.text = text;

    this.graphics.add(
      "name_text",
      new Text({
        text: `${this.text}`,
        font: new Font({ size: 8, family: "Arial", color: Color.White }),
      })
    );

    this.graphics.use("name_text");

    this.z = 1000;
  }

  public onInitialize() {}
}

export default NameTag;
