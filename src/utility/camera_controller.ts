import { Actor, Engine, KeyEvent, Keys} from "excalibur";

class CameraController extends Actor {
  public onInitialize(engine: Engine) {
    const camera = engine.currentScene.camera;

    // set up scroll to zoom
    engine.input.pointers.primary.on("wheel", (evt) => {
      const zoom = camera.zoom - evt.deltaY / 1000;
      camera.zoom = Math.max(0.5, Math.min(2, zoom));
    });

    // move camera when dragging
    let lastPos = engine.input.pointers.primary.lastScreenPos.clone();
    let dragging = false;
    engine.input.pointers.primary.on("down", (evt) => {
      dragging = true;
      lastPos = evt.screenPos.clone();
    });
    engine.input.pointers.primary.on("up", () => {
      dragging = false;
    });
    engine.input.pointers.primary.on("move", (evt) => {
      if (dragging) {
        const delta = evt.screenPos.sub(lastPos);
        camera.pos = camera.pos.sub(delta);
        lastPos = evt.screenPos.clone();
      }
    });

    engine.input.keyboard.on("hold", (evt: KeyEvent) => {
      if (evt.key == Keys.KeyW || evt.key == Keys.ArrowUp) {
        camera.pos.y -= 2;
      }

      if (evt.key == Keys.KeyS || evt.key == Keys.ArrowDown) {
        camera.pos.y += 2;
      }

      if (evt.key == Keys.KeyA || evt.key == Keys.ArrowLeft) {
        camera.pos.x -= 2;
      }

      if (evt.key == Keys.KeyD || evt.key == Keys.ArrowRight) {
        camera.pos.x += 2;
      }
    })
  }
}

export default CameraController;
