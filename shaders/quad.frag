#version 300 es
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