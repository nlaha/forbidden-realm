import { Actor, Engine } from "excalibur";

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
  }
}

export default CameraController;
