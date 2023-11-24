class Renderer {
    static MAX_RAY_LENGTH = 4.5;
    static RAYS_COUNT = 5000;

    constructor(canvas) {
        var gl = canvas.getContext("webgl2");
        
        if (!gl) {
            console.error("WebGL not found");
        }
        
        if (!gl.getExtension("EXT_color_buffer_float"))   { console.log("EXT_color_buffer_float not available")};
        if (!gl.getExtension("EXT_float_blend"))          { console.log("EXT_float_blend not available")};
        
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        //var program = new Program(gl);

        var light = new Light(LightType.POINT, [0.0, 0.0], 50.0);
        var ray_pass = new Pass(gl, rayVertSource, rayFragSource);

        var ray_positions = [];
        var ray_lengths = [];
        
        // TODO move to shader
        for (var i = 0; i < Renderer.RAYS_COUNT * 4; i += 4) {
            var x = light.position[0];
            var y = light.position[1];
            
            ray_positions[i  ] = x;
            ray_positions[i+1] = y;
            
            var direction = light.createRay();
            var dx = direction[0] * Renderer.MAX_RAY_LENGTH;
            var dy = direction[1] * Renderer.MAX_RAY_LENGTH;
            ray_positions[i+2] = x + dx;
            ray_positions[i+3] = y + dy;
            
            // Correct for aliasing
            var length = Math.sqrt(dx*dx + dy*dy) / Math.max(Math.abs(dx), Math.abs(dy));
            ray_lengths[i  ] = length;
            ray_lengths[i+1] = length;
            ray_lengths[i+2] = length;
            ray_lengths[i+3] = length;
        }
        
        ray_pass.createVAO({
            "position" : ray_positions,
            "ray_length" : ray_lengths
        }, {
            "ray_contribution" : 1.0 / Renderer.RAYS_COUNT,
            "light_power" : light.power
        });

        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        ray_pass.createFBO(tex);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        var quad_pass = new Pass(gl, quadVertSource, quadFragSource);
        
        var quad_positions = [
            -1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
             1.0,  1.0,
             1.0, -1.0,
            -1.0, -1.0
        ];
        var quad_uvs = [
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ];
        
        quad_pass.createVAO({
            "position" : quad_positions,
            "uv" : quad_uvs
        });
                
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(gl.getUniformLocation(quad_pass.program, "tex"), 0);
        
        ray_pass.setDraw();
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.LINES, 0, Renderer.RAYS_COUNT * 2);
        
        quad_pass.setDraw();
        gl.disable(gl.BLEND);
        gl.clearColor(0, 0.5, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}