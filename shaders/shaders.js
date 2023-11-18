var quadVertSource = `#version 300 es

in vec4 position;
in vec2 uv;

out vec2 f_uv;

void main() {
    gl_Position = position;
    f_uv = uv;
}
`;
 
var quadFragSource = `#version 300 es
precision highp float;

uniform sampler2D tex;

in vec2 f_uv;

out vec4 color;

void main() {
    color = texture(tex, f_uv);
    color = pow(color, vec4(1.0/2.2));
    //color = texture(tex, vec2(gl_FragCoord.x / 960.0, gl_FragCoord.y / 540.0));
    //color = vec4(1,1,0,1);
}
`;

var rayVertSource = `#version 300 es

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
`;

var rayFragSource = `#version 300 es
precision highp float;

in float power;

out vec4 color;

void main() {
    color = vec4(1, 1, 1, power);
}
`;