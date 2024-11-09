import { Actor, Engine } from "excalibur";

class CameraController extends Actor {
  public onInitialize(engine: Engine) {
    const camera = engine.currentScene.camera;

    // set up scroll to zoom
    engine.input.pointers.primary.on("wheel", (evt) => {
      const zoom = camera.zoom - evt.deltaY / 1000;
      camera.zoom = Math.max(0.5, Math.min(2, zoom));
    });

    // set up drag to pan
    let lastPos = engine.input.pointers.primary.lastWorldPos.clone();
    let isDragging = false;
    engine.input.pointers.primary.on("down", (evt) => {
      lastPos = evt.worldPos.clone();
      isDragging = true;
    });

    engine.input.pointers.primary.on("up", () => {
      isDragging = false;
    });

    engine.input.pointers.primary.on("move", (evt) => {
      if (isDragging) {
        const delta = lastPos.sub(evt.worldPos);
        camera.pos = camera.pos.add(delta);

        lastPos = evt.worldPos.clone();
      }
    });
  }
}

export default CameraController;
