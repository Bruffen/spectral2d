#version 300 es
precision highp float;

in float power;

out vec4 color;

void main() {
    color = vec4(1, 1, 1, power);
}