// Number of dots to generate
// I recommend keeping this number at or under a few hundred
// More than that tends to freeze up the browser
// 300 is the most I've tried successfully
DOTS = 100;
// Size of dots
DOTSIZE = 3;
// Dot color
DOTCOLOR = "#FFFFFF"
// Line Color
LINECOLOR = "#FFFFFF"
// Max distance two dots can be apart before line between them disappears
// I recommend scaling this with dot size and canvas size
// My code scales this up automatically if the value is too low
LMIN = 100;

// Array to store all the dot objects
dotObjects = [];

// Variables for storing canvas and canvas context
let canvas;
let ctx;

function getRandomInt(max) {
    // Returns a number between 0 and max
    return Math.floor(Math.random() * max);
}

class Dot {    
    constructor() {
        // Initial dot position and direction of travel
        this.initPosition();
        // Draw the dot
        this.drawdot()
    }

    drawdot() {
        // Dots should be opaque
        ctx.globalAlpha = 1;
        // Draw dots with selected color
        ctx.fillStyle = "#FFFFFF";
        // Draw the dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, DOTSIZE, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    comparedots(other) {
        // Uses 2D distance formula to calculate distance between dots
        const distance = Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2))
        // If the dots are close enough to draw a line
        if (distance < LMIN) {
            // Create a line object between them
            new Line(this, other);
        }
    }

    initPosition() {
        // Set dot x position (left/right) on canvas
        this.x = getRandomInt(canvas.width);
        // Set dot y position (top/bottom) on canvas
        this.y = getRandomInt(canvas.height);
        // Set initial direction of dot travel
        // index 0 represents x (left/right) direction and speed
        // index 1 represents y (top/bottom) direction and speed
        // Magnitude represents speed, sign (pos/neg) represents direction
        // Gives random speed and equal random chance of either direction
        this.direction = [(getRandomInt(10)+1)/100, (getRandomInt(10)+1)/100];
        if (getRandomInt(10)>5) this.direction[0] *= -1;
        if (getRandomInt(10)>5) this.direction[1] *= -1;
    }

    movedot() {
        // Reverse x (left/right) direction if dot will move past right side of screen
        this.direction[0] = this.x >= (canvas.width - DOTSIZE) ? this.direction[0]*-1 : this.direction[0];
        // Reverse y (top/bottom) direction if dot will move past bottom side of screen
        this.direction[1] = this.y >= (canvas.height - DOTSIZE) ? this.direction[1]*-1 : this.direction[1];
        // Reverse x (left/right) direction if dot will move past left side of screen
        this.direction[0] = this.x <= DOTSIZE ? this.direction[0]*-1 : this.direction[0];
        // Reverse y (top/bottom) direction if dot will move past top side of screen
        this.direction[1] = this.y <= DOTSIZE ? this.direction[1]*-1 : this.direction[1];
        // Update dot position
        this.x += this.direction[0];
        this.y += this.direction[1];
        // Redraw dot with new position
        this.drawdot()
    }
}

class Line {
    constructor(d1, d2) {
        // Dot 1
        this.d1 = d1;
        // Dot 2
        this.d2 = d2;
        // Draw the line
        this.drawline()
    }
    drawline() {
        // Find distance between two dots
        const distance = Math.sqrt(Math.pow(this.d2.x - this.d1.x, 2) + Math.pow(this.d2.y - this.d1.y, 2))
        // Find percentage distance is of max line distance
        const percent = distance/LMIN;
        // Set transparency of line based on percentage distance of the two dots
        const alpha = Math.round(percent*100)/100;
        ctx.globalAlpha = 1 - alpha;
        // Set line color to white
        ctx.strokeStyle = "#FFFFFF";
        //Draw line
        ctx.beginPath();
        ctx.moveTo(this.d1.x, this.d1.y);
        ctx.lineTo(this.d2.x, this.d2.y);
        ctx.stroke();
    }
}

function redrawCanvas() {
    // Clear the canvas
    ctx.clearRect(0,0,canvas.width,canvas.height)
    // For all dots
    for (i=0; i < DOTS; i++) {
        // Move dot to new location
        dotObjects[i].movedot();
        // Compare each dot to each other dot
        // Start at i+1 to avoid comparing a dot to itself 
        // Or a dot to another dot twice
        for (j=i+1; j < DOTS; j++) {
            // Compares location of dots and draws line between them if necessary
            dotObjects[i].comparedots(dotObjects[j])
        } 
    }
}

function startWorker() {
    // Worker is supported on user's browser
    if(typeof(Worker) !== "undefined") {
        // Worker isn't already defined
        if(typeof(w) == "undefined") {
            // Contains a function that messages back to main thread 500 times/second 
            w = new Worker("dotmover.js");
        }
        // Message recieved from worker thread
        w.onmessage = function(event) {
            // Redraw canvas
            redrawCanvas()
        };
    }
}

document.addEventListener("DOMContentLoaded", function() {   
    // Get canvas
    canvas = document.getElementById("myCanvas");
    // Get canvas content
    ctx = canvas.getContext("2d");
    // Set canvas dimensions to take full page
    canvas.width = $(window).width().toString();
    canvas.height = $(window).height().toString();
    // Create the dots
    for (i=0; i < DOTS; i++) {
        dotObjects[i] = new Dot();
    }
    // Scale LMIN if too small
    if (DOTSIZE*2 >= LMIN*0.8) LMIN = DOTSIZE * 4

    // Background worker allows canvas drawing without effecting page functionality
    // Without a background worker, this page would loop infinitely without updating
    startWorker();
})