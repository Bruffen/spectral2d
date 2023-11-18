class Renderer {
    static MAX_RAY_LENGTH = 4.5;
    static RAYS_COUNT = 3000000;

    constructor(canvas) {
        var gl = canvas.getContext("webgl2");

        //webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        //gl.viewport(0, 0, 540, 540);
        
        if (!gl) {
            console.error("WebGL not found");
        }
        
        var program = new Program(gl);
    }
}