/*
Developed by AggrievedBubble in TypeScript as an alternative for
a very intensive and poorly optimised JavaScript version
*/
// The const values here can be modified to change the look and feel of the pipes
var pipeCount = 12;
var turnProbability = 0.005;
var baseTTL = 100;
var rangeTTL = 400;
var baseThickness = 2;
var rangeThickness = 4;
var baseHue = 35;
var rangeHue = 20;
var backgroundColor = 'hsla(150,80%,1%,1)';
var iterationSpeed = 15;
var maxAlpha = 0.4;
var yposrange = 300; // +- from center
var xposrange = 200; // +- from evenly spread positions
// values bellow this point should not be changed.
var pipeArray = [];
var directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
var previousTime = 0;
var container;
var canvas;
var sourcectx;
var viewportctx;
function setup() {
    createCanvas();
    initPipes();
    requestAnimationFrame(mainLoop);
}
function createCanvas() {
    container = document.querySelector(".content--canvas");
    canvas = {
        source: document.createElement("canvas"),
        viewport: document.createElement("canvas")
    };
    canvas.viewport.setAttribute('style', "\n\t\tposition: fixed;\n\t\ttop: 0;\n\t\tleft: 0;\n\t\twidth: 100%;\n\t\theight: 100%;\n\t");
    container.appendChild(canvas.viewport);
    sourcectx = canvas.source.getContext("2d");
    viewportctx = canvas.viewport.getContext("2d");
    canvas.source.width = Math.max(screen.width, screen.height);
    canvas.source.height = Math.max(screen.width, screen.height);
    canvas.viewport.width = document.documentElement.clientWidth;
    canvas.viewport.height = document.documentElement.clientHeight;
    sourcectx.fillStyle = backgroundColor;
    sourcectx.fillRect(0, 0, canvas.source.width, canvas.source.height);
    viewportctx.drawImage(canvas.source, (canvas.source.width / 2) - (canvas.viewport.width / 2), (canvas.source.height / 2) - (canvas.viewport.height / 2), canvas.viewport.width, canvas.viewport.height, 0, 0, canvas.viewport.width, canvas.viewport.height);
}
function resize() {
    canvas.viewport.width = document.documentElement.clientWidth;
    canvas.viewport.height = document.documentElement.clientHeight;
}
function initPipes() {
    for (var i = 0; i != pipeCount; i++) {
        var pipe = {
            id: i,
            thickness: baseThickness + (rangeThickness * Math.random()),
            currentLength: 0,
            position: [((canvas.source.width / pipeCount) * i) + ((canvas.source.width / pipeCount) / 2) + (Math.random() < 0.5 ? Math.random() * -xposrange : Math.random() * xposrange), (canvas.source.height / 2) + (Math.random() < 0.5 ? Math.random() * -yposrange : Math.random() * yposrange)],
            rotation: directions[Math.floor(Math.random() * directions.length)],
            hue: baseHue + rangeHue * Math.random(),
            timeToLive: baseTTL + rangeTTL * Math.random(),
            iteration: 0,
            dying: false
        };
        pipeArray = pipeArray.concat(pipe);
    }
}
function updatePipes() {
    pipeArray.forEach(function (pipe) {
        if (pipe.rotation.indexOf("N") != -1)
            pipe.position[1]++;
        if (pipe.rotation.indexOf("E") != -1)
            pipe.position[0]++;
        if (pipe.rotation.indexOf("S") != -1)
            pipe.position[1]--;
        if (pipe.rotation.indexOf("W") != -1)
            pipe.position[0]--;
        //implement turn probability
        if (Math.random() <= turnProbability) {
            if (pipe.rotation.length == 2)
                pipe.rotation = pipe.rotation[Math.round(Math.random())];
            else if (pipe.rotation == "N" || pipe.rotation == "S")
                pipe.rotation = pipe.rotation.concat(["E", "W"][Math.floor(Math.random() * 2)]);
            else
                pipe.rotation = ["N", "S"][Math.floor(Math.random() * 2)] + pipe.rotation;
        }
        sourcectx.strokeStyle = "hsla(".concat(pipe.hue, ",75%,50%,").concat(Math.min(pipe.iteration / pipe.timeToLive, maxAlpha), ")");
        sourcectx.beginPath();
        sourcectx.arc(pipe.position[0], pipe.position[1], pipe.thickness, 0, 2 * Math.PI);
        sourcectx.stroke();
        if (pipe.iteration > pipe.timeToLive)
            pipe.dying = true;
        if (pipe.dying) {
            pipe.iteration--;
        }
        else {
            pipe.iteration++;
        }
        if (pipe.iteration == -1)
            pipeArray = pipeArray.filter(function (pipe) { return pipe.iteration > 0; });
    });
    viewportctx.drawImage(canvas.source, (canvas.source.width / 2) - (canvas.viewport.width / 2), (canvas.source.height / 2) - (canvas.viewport.height / 2), canvas.viewport.width, canvas.viewport.height, 0, 0, canvas.viewport.width, canvas.viewport.height);
    requestAnimationFrame(mainLoop);
}
function mainLoop(currentTime) {
    if (previousTime === 0) {
        previousTime = currentTime;
    }
    if ((currentTime - previousTime) >= iterationSpeed) {
        updatePipes();
        previousTime = currentTime;
    }
    requestAnimationFrame(mainLoop);
}
window.addEventListener("load", setup);
window.addEventListener("resize", resize);
