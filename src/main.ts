import { Color, DisplayMode, Engine } from "excalibur";
import { loader } from "./resources";
import MainScene from "./main_scene";

class Game extends Engine {
  constructor() {
    super({
      canvasElementId: "game",
      width: 1280,
      height: 720,
      pixelArt: true,
      scenes: {
        mainScene: MainScene,
      },
      displayMode: DisplayMode.FillContainer,
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
