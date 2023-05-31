
/*
Developed by AggrievedBubble in TypeScript as an alternative for
a very intensive and poorly optimised JavaScript version
*/ 

// The const values here can be modified to change the look and feel of the pipes

const pipeCount: number = 12;
const turnProbability: number = 0.005;
const baseTTL: number = 100;
const rangeTTL: number = 400;
const baseThickness: number = 2;
const rangeThickness: number = 4;
const baseHue: number = 35;
const rangeHue: number = 20;
const backgroundColor:string = 'hsla(150,80%,1%,1)';
const iterationSpeed: number = 15;
const maxAlpha = 0.4;
const yposrange = 300; // +- from center
const xposrange = 200; // +- from evenly spread positions

// values bellow this point should not be changed.

var pipeArray: Pipe[] = [];
var directions: string[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

var previousTime:DOMHighResTimeStamp = 0;

var container;
var canvas: { source: HTMLCanvasElement; viewport: HTMLCanvasElement;}
var sourcectx: CanvasRenderingContext2D | null
var viewportctx: CanvasRenderingContext2D | null

function setup(): void {
	createCanvas();
	initPipes();
	requestAnimationFrame(mainLoop);
}

function createCanvas(): void {
	container = document.querySelector(".content--canvas");
	canvas = {
		source: document.createElement("canvas"),
		viewport: document.createElement("canvas")
	}
	canvas.viewport.setAttribute('style', `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	`); 
	container!.appendChild(canvas.viewport);
	sourcectx = canvas.source.getContext("2d");
	viewportctx = canvas.viewport.getContext("2d");

	canvas.source.width = Math.max(screen.width, screen.height);
	canvas.source.height = Math.max(screen.width, screen.height);

	canvas.viewport.width = document.documentElement.clientWidth;
	canvas.viewport.height = document.documentElement.clientHeight;

	sourcectx!.fillStyle = backgroundColor;
	sourcectx!.fillRect(0, 0, canvas.source.width, canvas.source.height);

	viewportctx!.drawImage(canvas.source, (canvas.source.width/2)-(canvas.viewport.width/2), (canvas.source.height/2)-(canvas.viewport.height/2), canvas.viewport.width, canvas.viewport.height, 0, 0, canvas.viewport.width, canvas.viewport.height);
}

function resize(): void {
	canvas.viewport.width = document.documentElement.clientWidth;
	canvas.viewport.height = document.documentElement.clientHeight;
}

type Pipe = {
	readonly id: number;
	readonly thickness: number;
	currentLength: number;
	position: number[];
	rotation: string;
	hue: number;
	timeToLive: number;
	iteration: number;
	dying: boolean;
}

function initPipes(): void {

	for (let i:number = 0; i != pipeCount; i++) {
		
		let pipe: Pipe = {
			id: i,
			thickness: baseThickness + (rangeThickness * Math.random()),
			currentLength: 0,
			position: [ ((canvas.source.width/pipeCount) * i) + ((canvas.source.width/pipeCount) / 2) + (Math.random() < 0.5 ? Math.random()*-xposrange : Math.random()*xposrange), (canvas.source.height / 2) + (Math.random() < 0.5 ? Math.random()*-yposrange : Math.random()*yposrange) ],
			rotation: directions[Math.floor(Math.random() * directions.length)],
			hue: baseHue + rangeHue*Math.random(),
			timeToLive: baseTTL + rangeTTL*Math.random(),
			iteration: 0,
			dying: false
		};
		
		pipeArray = pipeArray.concat(pipe);

	}

}

function updatePipes(): void {

	pipeArray.forEach((pipe) => {

		if (pipe.rotation.indexOf("N") != -1) pipe.position[1]++;
		if (pipe.rotation.indexOf("E") != -1) pipe.position[0]++;
		if (pipe.rotation.indexOf("S") != -1) pipe.position[1]--;
		if (pipe.rotation.indexOf("W") != -1) pipe.position[0]--;

		//implement turn probability
		if (Math.random() <= turnProbability) {

			if (pipe.rotation.length == 2) pipe.rotation = pipe.rotation[Math.round(Math.random())];
			else if (pipe.rotation == "N" || pipe.rotation == "S") pipe.rotation = pipe.rotation.concat(["E", "W"][Math.floor(Math.random() * 2)]);
			else pipe.rotation = ["N", "S"][Math.floor(Math.random() * 2)] + pipe.rotation;
			
		}

		sourcectx!.strokeStyle = `hsla(${pipe.hue},75%,50%,${Math.min(pipe.iteration/pipe.timeToLive, maxAlpha)})`;
		sourcectx!.beginPath();
		sourcectx!.arc(pipe.position[0], pipe.position[1], pipe.thickness, 0, 2*Math.PI);
		sourcectx!.stroke();

		if (pipe.iteration > pipe.timeToLive) pipe.dying = true;

		if (pipe.dying) {
			pipe.iteration--
		} else {
			pipe.iteration++
		}

		if (pipe.iteration == -1) pipeArray = pipeArray.filter(pipe => pipe.iteration > 0);

	})

	viewportctx!.drawImage(canvas.source, (canvas.source.width/2)-(canvas.viewport.width/2), (canvas.source.height/2)-(canvas.viewport.height/2), canvas.viewport.width, canvas.viewport.height, 0, 0, canvas.viewport.width, canvas.viewport.height);

	requestAnimationFrame(mainLoop);

}

function mainLoop(currentTime: DOMHighResTimeStamp) {
	if (previousTime === 0) {
		previousTime = currentTime;
	}

	if ((currentTime - previousTime) >= iterationSpeed) {
		updatePipes()
		previousTime = currentTime;
	}

	requestAnimationFrame(mainLoop)
}

window.addEventListener("load", setup);
window.addEventListener("resize", resize);
