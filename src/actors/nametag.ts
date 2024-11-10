import { Actor, ActorArgs, Color, Text, Rectangle, Font, vec } from "excalibur";
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
        font: new Font({
          size: 16,
          family: "alagard",
          color: Color.White,
        }),
        scale: vec(0.8, 0.8),
      })
    );

    this.graphics.use("name_text");

    this.z = 1000;
  }

  public onInitialize() {}
}

export default NameTag;
