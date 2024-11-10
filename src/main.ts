import {
  Color,
  DisplayMode,
  Engine,
  PointerScope,
  Resolution,
} from "excalibur";
import { Buildings, loader } from "./resources";
import MainScene from "./main_scene";
import Building from "./actors/building";
import PaletteShiftPostProcessor from "./utility/post_process";

class Game extends Engine {
  constructor() {
    super({
      canvasElementId: "game",
      viewport: {
        width: 1280,
        height: 500,
      },
      pixelArt: true,
      scenes: {
        mainScene: MainScene,
      },
      displayMode: DisplayMode.FitContainer,
      backgroundColor: Color.Black,
      pointerScope: PointerScope.Document,
    });
  }
  initialize() {
    this.start(loader);
    console.log(this.currentSceneName);
    this.goToScene("mainScene");

    this.graphicsContext.addPostProcessor(new PaletteShiftPostProcessor());
  }
}

export const game = new Game();
game.initialize();
