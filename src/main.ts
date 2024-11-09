import { Color, DisplayMode, Engine } from "excalibur";
import { loader } from "./resources";
import MainScene from "./main_scene";

class Game extends Engine {
  constructor() {
    super({
      width: 1280,
      height: 720,
      pixelArt: true,
      scenes: {
        mainScene: MainScene,
      },
      displayMode: DisplayMode.Fixed,
      backgroundColor: Color.Black,
    });
  }
  initialize() {
    this.start(loader);
    console.log(this.currentSceneName);
    this.goToScene("mainScene");
  }
}

export const game = new Game();
game.initialize();
