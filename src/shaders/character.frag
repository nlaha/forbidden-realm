#version 300 es
precision mediump float;
uniform sampler2D u_graphic;
uniform float outlineRadius;
uniform float u_opacity;

in vec2 v_uv;
out vec4 fragColor;

void main() {
  const float TAU = 6.28318530;
  const float steps = 4.0; // up/down/left/right pixels
  float radius = outlineRadius;
  vec3 outlineColor = vec3(1.0, 1.0, 1.0);
  vec2 aspect = 1.0 / vec2(textureSize(u_graphic, 0));
  for (float i = 0.0; i < TAU; i += TAU / steps) {
    // Sample image in a circular pattern
    vec2 offset = vec2(sin(i), cos(i)) * aspect * radius;
    vec4 col = texture(u_graphic, v_uv + offset);
    // Mix outline with background
    float alpha = smoothstep(0.5, 0.7, col.a);
    fragColor = mix(fragColor, vec4(outlineColor, 1.0), alpha); // apply outline
  }
  // Overlay original texture
  vec4 mat = texture(u_graphic, v_uv);
  float factor = smoothstep(0.5, 0.7, mat.a);
  fragColor = mix(fragColor, mat, factor);
  fragColor.a = clamp(fragColor.a * u_opacity, 0.0, 1.0);
}