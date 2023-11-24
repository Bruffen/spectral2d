class Pass {
    constructor(gl, vs, fs) {
        this.gl = gl;
        this.vs = this.createShader(gl.VERTEX_SHADER, vs);
        this.fs = this.createShader(gl.FRAGMENT_SHADER, fs);
        this.program = this.createProgram(this.vs, this.fs);
        this.vao = null;
        this.fbo = null;
    }

    setDraw() {
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    }

    createVAO(attributes, uniforms) {
        this.vao = this.gl.createVertexArray();
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);

        for (var a in attributes) {
            var al = this.gl.getAttribLocation(this.program, a);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(attributes[a]), this.gl.STATIC_DRAW);
            this.gl.enableVertexAttribArray(al);
            this.gl.vertexAttribPointer(al, 2, this.gl.FLOAT, false, 0, 0);
        }

        for (var u in uniforms) {
            this.gl.uniform1f(this.gl.getUniformLocation(this.program, u), uniforms[u]);
        }
    }

    createFBO(attachments) {
        this.fbo = this.gl.createFramebuffer();
        this.gl.useProgram(this.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, attachments, 0);
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