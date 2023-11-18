class Program {
    constructor(glc) {
        this.gl = glc;
        var gl = this.gl;

        var light = new Light(LightType.POINT, [0.0, 0.0], 50.0);

        var vs = this.createShader(gl.VERTEX_SHADER, rayVertSource);
        var fs = this.createShader(gl.FRAGMENT_SHADER, rayFragSource);
        var ray_program = this.createProgram(vs, fs);
        gl.useProgram(ray_program);

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
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        var ray_verticesAttrib = gl.getAttribLocation(ray_program, "position");
        var ray_verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ray_verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ray_positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ray_verticesAttrib);
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(ray_verticesAttrib, size, type, normalize, stride, offset);
        
        var ray_lengthsAttrib = gl.getAttribLocation(ray_program, "ray_length");
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ray_lengths), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ray_lengthsAttrib);
        gl.vertexAttribPointer(ray_lengthsAttrib, size, type, normalize, stride, offset);
        
        gl.uniform1f(gl.getUniformLocation(ray_program, "ray_contribution"), 1.0 / Renderer.RAYS_COUNT);
        gl.uniform1f(gl.getUniformLocation(ray_program, "light_power"), light.power);
        
        if (!gl.getExtension("EXT_color_buffer_float"))   { console.log("EXT_color_buffer_float not available")};
        if (!gl.getExtension("EXT_float_blend"))          { console.log("EXT_float_blend not available")};
        
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        var fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
        var primitiveType = gl.LINES;
        var offset = 0;
        var count = Renderer.RAYS_COUNT * 2;
        gl.drawArrays(primitiveType, offset, count);        
            
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var quad_vs = this.createShader(gl.VERTEX_SHADER, quadVertSource);
        var quad_fs = this.createShader(gl.FRAGMENT_SHADER, quadFragSource);
        var quad_program = this.createProgram(quad_vs, quad_fs);
        gl.useProgram(quad_program);
                
        var quad_vao = gl.createVertexArray();
        gl.bindVertexArray(quad_vao);

        var quad_verticesAttrib = gl.getAttribLocation(quad_program, "position");
        var quad_verticesBuffer = gl.createBuffer();
        var quad_positions = [
            -1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
             1.0,  1.0,
             1.0, -1.0,
            -1.0, -1.0
        ];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, quad_verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad_positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(quad_verticesAttrib);
        gl.vertexAttribPointer(quad_verticesAttrib, size, type, normalize, stride, offset);

        // TODO perhaps optimize by reusing positions as texture coordinates in the shader
        var quad_uvAttrib = gl.getAttribLocation(quad_program, "uv");
        var quad_uvBuffer = gl.createBuffer();
        var quad_uvs = [
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, quad_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad_uvs), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(quad_uvAttrib);
        gl.vertexAttribPointer(quad_uvAttrib, size, type, normalize, stride, offset);

        var quad_textureUniform = gl.getUniformLocation(quad_program, "tex");
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(quad_textureUniform, 0);

        gl.clearColor(0, 0.5, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.BLEND);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    createShader(type, source) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        var success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        
        console.log(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
    }

    createProgram(vertexShader, fragmentShader) {
        var p = this.gl.createProgram();
        this.gl.attachShader(p, vertexShader);
        this.gl.attachShader(p, fragmentShader);
        this.gl.linkProgram(p);
    
        var success = this.gl.getProgramParameter(p, this.gl.LINK_STATUS);
        if (success) {
            return p;
        }

        console.log(p.gl.getProgramInfoLog(p));
        this.gl.deleteProgram(p);
    }
}