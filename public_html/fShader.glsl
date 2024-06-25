#version 300 es

precision highp float;     // required precision declaration
uniform sampler2D fTexSampler;
in vec3 fColor;            // input color for fragment
in vec2 fTexCoord;
out vec4 final_color;      // output color to frame buffer

void main() {
  final_color = texture(fTexSampler, fTexCoord) * vec4(fColor, 1.0);
}
