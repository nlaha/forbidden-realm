import {
  System,
  SystemType,
  Timer,
  World,
} from "excalibur";
import { BuildingComponent } from "../components/building";

class DialogueSystem extends System {
  public systemType = SystemType.Update;
  static world: World;

  constructor(world: World) {
    super();
    DialogueSystem.world = world;
    DialogueSystem.showText("Welcome to my realm... Can your followers hope to survive here? I'll make sure they cannot.")
  }

  update(delta: Number) {}

  public static showText(message: string) {
    document.getElementById("dialogue")!.innerText = message;
    document.getElementById("dialogue-box")!.classList.remove("hidden-fade");

    const timer = new Timer({
      fcn: () => document.getElementById("dialogue-box")!.classList.add("hidden-fade"),
      repeats: false,
      interval: 5000,
    });

    DialogueSystem.world.scene.add(timer)

    timer.start()
  }
}

export default DialogueSystem;
