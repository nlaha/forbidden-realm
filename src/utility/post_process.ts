import { PostProcessor, ScreenShader } from "excalibur";
import postprocess from "../shaders/postprocess.frag";

class PaletteShiftPostProcessor implements PostProcessor {
  private _shader: ScreenShader;
  initialize(gl: WebGL2RenderingContext): void {
    this._shader = new ScreenShader(gl, postprocess);
  }
  getLayout(): ex.VertexLayout {
    return this._shader.getLayout();
  }
  getShader(): ex.Shader {
    return this._shader.getShader();
  }
}

export default PaletteShiftPostProcessor;
