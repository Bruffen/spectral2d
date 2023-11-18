var canvas = document.querySelector("#c");

/*
var w = canvas.clientWidth;
var h = canvas.clientHeight;
canvas.width  = w;
canvas.height = h;
*/
canvas.width  = 960;
canvas.height = 540;

var spectral = new Renderer(canvas);