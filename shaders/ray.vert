#version 300 es

uniform float ray_contribution;
uniform float light_power;

in vec4 position;
in vec2 ray_length; // correct for aliasing

out float power;

void main() {
    vec4 pos = position;
    pos.x *= 9.0/16.0; // correct for aspect ratio
    gl_Position = pos;
    power = ray_contribution * ray_length.x * light_power;
}