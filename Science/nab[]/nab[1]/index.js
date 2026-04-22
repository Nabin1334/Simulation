// Global variables
let decimal1 = 0.000;
let decimal2 = 0.000;
let result = 0;
let animationPhase = 0;
let blocks1 = { ones: 0, tenths: 0, hundredths: 0, thousandths: 0 };
let blocks2 = { ones: 0, tenths: 0, hundredths: 0, thousandths: 0 };
let combinedBlocks = { ones: 0, tenths: 0, hundredths: 0, thousandths: 0 };
let finalResult = { ones: 0, tenths: 0, hundredths: 0, thousandths: 0 };
let scaleFactor = 1.0; // Default scale
const baseCanvasWidth = 900;
const baseCanvasHeight = 600;

function setup() {
    const canvas = createCanvas(baseCanvasWidth * scaleFactor, baseCanvasHeight * scaleFactor);
    canvas.parent('canvas-container');
    textAlign(CENTER, CENTER);

    // Set up button events
    document.getElementById('add-button').addEventListener('click', () => {
        decimal1 = parseFloat(document.getElementById('decimal1').value) || 0;
        decimal2 = parseFloat(document.getElementById('decimal2').value) || 0;
        if (decimal1 > 9.999 || decimal2 > 9.999) {
            alert("Please enter numbers less than 10");
            return;
        }
        animationPhase = 1;
        calculateBlocks();
    });

    document.getElementById('reset-button').addEventListener('click', () => {
        animationPhase = 0;
        document.getElementById('decimal1').value = "0.000";
        document.getElementById('decimal2').value = "0.000";
        decimal1 = 0.000;
        decimal2 = 0.000;
        calculateBlocks();
    });

    // Zoom buttons
    document.getElementById('zoom-in').addEventListener('click', () => {
        scaleFactor = Math.min(scaleFactor + 0.2, 2.0); // Max scale: 2x
        resizeCanvas(baseCanvasWidth * scaleFactor, baseCanvasHeight * scaleFactor);
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        scaleFactor = Math.max(scaleFactor - 0.2, 0.5); // Min scale: 0.5x
        resizeCanvas(baseCanvasWidth * scaleFactor, baseCanvasHeight * scaleFactor);
    });

    calculateBlocks();
}

function calculateBlocks() {
    // Calculate blocks for first decimal
    let num = decimal1;
    blocks1.ones = Math.floor(num);
    num = (num - blocks1.ones) * 10;
    blocks1.tenths = Math.floor(num);
    num = (num - blocks1.tenths) * 10;
    blocks1.hundredths = Math.floor(num);
    num = (num - blocks1.hundredths) * 10;
    blocks1.thousandths = Math.round(num);

    // Calculate blocks for second decimal
    num = decimal2;
    blocks2.ones = Math.floor(num);
    num = (num - blocks2.ones) * 10;
    blocks2.tenths = Math.floor(num);
    num = (num - blocks2.tenths) * 10;
    blocks2.hundredths = Math.floor(num);
    num = (num - blocks2.hundredths) * 10;
    blocks2.thousandths = Math.round(num);

    // Combine blocks
    combinedBlocks.ones = blocks1.ones + blocks2.ones;
    combinedBlocks.tenths = blocks1.tenths + blocks2.tenths;
    combinedBlocks.hundredths = blocks1.hundredths + blocks2.hundredths;
    combinedBlocks.thousandths = blocks1.thousandths + blocks2.thousandths;

    // Calculate final result with regrouping
    result = decimal1 + decimal2;

    finalResult.thousandths = combinedBlocks.thousandths % 10;
    let carry = Math.floor(combinedBlocks.thousandths / 10);

    finalResult.hundredths = (combinedBlocks.hundredths + carry) % 10;
    carry = Math.floor((combinedBlocks.hundredths + carry) / 10);

    finalResult.tenths = (combinedBlocks.tenths + carry) % 10;
    carry = Math.floor((combinedBlocks.tenths + carry) / 10);

    finalResult.ones = combinedBlocks.ones + carry;
}

function draw() {
    background(245);
    scale(scaleFactor); // Apply scaling to all drawings

    if (animationPhase === 0) {
        drawInitialState();
    } else if (animationPhase === 1) {
        drawCombiningAnimation();
    } else {
        drawFinalResult();
    }
}

function drawInitialState() {
    // Draw title
    fill(50);
    textSize(24 / scaleFactor);
    text("Decimal Addition with Base 10 Blocks", baseCanvasWidth / 2, 30 / scaleFactor);

    // Draw first number blocks
    drawBlocks(200, 100, blocks1, true);
    textSize(20 / scaleFactor);
    fill(0);
    text(`First Number: ${decimal1.toFixed(3)}`, 200, 70 / scaleFactor);

    // Draw plus sign
    textSize(40 / scaleFactor);
    text("+", baseCanvasWidth / 2, 150 / scaleFactor);

    // Draw second number blocks
    drawBlocks(700, 100, blocks2, true);
    textSize(20 / scaleFactor);
    fill(0);
    text(`Second Number: ${decimal2.toFixed(3)}`, 700, 70 / scaleFactor);

    // Draw instruction
    textSize(18 / scaleFactor);
    fill(100);
    text("Click 'Add Decimals' to visualize the addition", baseCanvasWidth / 2, 500 / scaleFactor);
}

function drawCombiningAnimation() {
    background(245);

    // Draw title
    fill(50);
    textSize(24 / scaleFactor);
    text("Adding Decimals with Base 10 Blocks", baseCanvasWidth / 2, 30 / scaleFactor);

    // Draw combined blocks in the center
    drawBlocks(baseCanvasWidth / 2, 300, combinedBlocks, true);

    // Draw labels
    textSize(20 / scaleFactor);
    fill(0);
    text(`Combined: ${decimal1.toFixed(3)} + ${decimal2.toFixed(3)} = ${(decimal1 + decimal2).toFixed(3)}`, baseCanvasWidth / 2, 200 / scaleFactor);
    text(`Result after regrouping: ${result.toFixed(3)}`, baseCanvasWidth / 2, 500 / scaleFactor);

    // After a delay, move to next phase
    if (frameCount % 120 === 0) {
        animationPhase = 2;
    }
}

function drawFinalResult() {
    background(245);

    // Draw title
    fill(50);
    textSize(24 / scaleFactor);
    text("Final Result after Regrouping", baseCanvasWidth / 2, 30 / scaleFactor);

    // Draw final result blocks
    drawBlocks(baseCanvasWidth / 2, 300, finalResult, true);

    // Draw the result
    textSize(28 / scaleFactor);
    fill(39, 174, 96);
    text(`${decimal1.toFixed(3)} + ${decimal2.toFixed(3)} = ${result.toFixed(3)}`, baseCanvasWidth / 2, 500 / scaleFactor);
}

function drawBlocks(x, y, blocks, isOpaque) {
    const spacing = 60 / scaleFactor;
    const size = 40 / scaleFactor;
    const alpha = isOpaque ? 255 : 100;

    stroke(0);
    strokeWeight(1 / scaleFactor);

    // Draw ones (cubes)
    for (let i = 0; i < blocks.ones && i < 10; i++) {
        drawCube(x - 200 + i * spacing, y, size, alpha);
    }

    // Draw tenths (flats)
    for (let i = 0; i < blocks.tenths && i < 10; i++) {
        drawFlat(x - 200 + i * spacing, y + 80 / scaleFactor, size, alpha);
    }

    // Draw hundredths (rods)
    for (let i = 0; i < blocks.hundredths && i < 10; i++) {
        drawRod(x - 200 + i * spacing, y + 160 / scaleFactor, size, alpha);
    }

    // Draw thousandths (units)
    for (let i = 0; i < blocks.thousandths && i < 10; i++) {
        drawUnit(x - 200 + i * spacing, y + 240 / scaleFactor, size / 2, alpha);
    }

    // Draw labels
    fill(0, alpha);
    textSize(14 / scaleFactor);
    text("Ones", x - 260, y);
    text("Tenths", x - 260, y + 80 / scaleFactor);
    text("Hundredths", x - 260, y + 160 / scaleFactor);
    text("Thousandths", x - 260, y + 240 / scaleFactor);
}

function drawCube(x, y, size, alpha) {
    // Draw a 3D-looking cube
    fill(231, 76, 60, alpha);
    rect(x, y, size, size);

    // Draw top
    fill(192, 57, 43, alpha);
    beginShape();
    vertex(x, y);
    vertex(x + size * 0.3, y - size * 0.3);
    vertex(x + size * 1.3, y - size * 0.3);
    vertex(x + size, y);
    endShape(CLOSE);

    // Draw side
    fill(165, 47, 38, alpha);
    beginShape();
    vertex(x + size, y);
    vertex(x + size * 1.3, y - size * 0.3);
    vertex(x + size * 1.3, y + size * 0.7);
    vertex(x + size, y + size);
    endShape(CLOSE);
}

function drawFlat(x, y, size, alpha) {
    // Draw a flat (10x10 grid for tenths)
    fill(52, 152, 219, alpha);
    rect(x, y, size, size / 4);

    // Draw lines to represent the grid
    stroke(0, alpha);
    for (let i = 1; i < 10; i++) {
        line(x + i * size / 10, y, x + i * size / 10, y + size / 4);
    }
}

function drawRod(x, y, size, alpha) {
    // Draw a rod (10 units for hundredths)
    fill(46, 204, 113, alpha);
    rect(x, y, size / 2, size / 10);

    // Draw lines to represent the units
    stroke(0, alpha);
    for (let i = 1; i < 10; i++) {
        line(x + i * size / 20, y, x + i * size / 20, y + size / 10);
    }
}

function drawUnit(x, y, size, alpha) {
    // Draw a small unit cube (for thousandths)
    fill(243, 156, 18, alpha);
    rect(x, y, size, size);
}
