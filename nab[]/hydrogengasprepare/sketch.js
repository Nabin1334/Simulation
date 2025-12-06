// sketch.js
// Main p5.js sketch for the hydrogen gas preparation simulation

let acidLevel = 200;
let gasProduction = 0;
let bubbles = [];
let gasJarBubbles = [];
let isReacting = false;
let waterLevel = 150;
let hydrogenGasLevel = 0;

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent("canvas-container");
  noStroke();
}

function draw() {
  background(240);

  drawWaterTrough();
  drawWoulfeBottle();
  drawDeliveryTube();
  drawThistleFunnel();
  drawAcid();
  drawZinc();

  if (isReacting) {
    produceBubbles();
    acidLevel = max(100, acidLevel - 0.1);
    waterLevel = max(50, waterLevel - 0.2);
    hydrogenGasLevel = min(250, hydrogenGasLevel + 0.4);
  }

  drawBubbles();
  drawGasJar();
  drawLabels();
}

function drawWaterTrough() {
  // Water trough
  fill(77, 182, 172);
  rect(550, 250, 180, 250, 10);

  // Water
  fill(100, 181, 246, 180);
  rect(550, 250 + (250 - waterLevel), 180, waterLevel, 10);
}

function drawWoulfeBottle() {
  // Woulfe's bottle
  fill(141, 10, 99);
  rect(200, 200, 150, 250, 20);

  // Bottle neck
  rect(232, 150, 80, 50, 10);
}

function drawDeliveryTube() {
  // Delivery tube
  fill(161, 136, 127);
  // Horizontal part
  rect(310, 230, 170, 15);
  // Vertical part going into water
  rect(450, 240, 15, 130);
  // Curved part
  arc(455, 370, 25, 36, 0, PI);
  // Part inside water trough
  rect(450, 370, 12, 80);

  // Extension: Connect tube to beehive shelf
  // Horizontal tube inside trough to beehive shelf
  rect(450, 450, 110, 12); // Extends tube to the right, towards beehive shelf
}

function drawThistleFunnel() {
  // Thistle funnel
  fill(120, 144, 150);
  // Funnel stem (increase length from 190 to 250)
  rect(260, 129, 20, 250);
  // Funnel top
  ellipse(275, 150, 90, 30);
  // Funnel opening
  fill(240);
  ellipse(280, 155, 75, 6);
}

function drawAcid() {
  // Acid in bottle
  fill(79, 195, 247, 150);
  rect(200, 200 + (250 - acidLevel), 150, acidLevel, 20);
}

function drawZinc() {
  // Granulated zinc
  for (let i = 0; i < 20; i++) {
    fill(255, 183, 77);
    let x = random(210, 340);
    let y = random(380, 430);
    ellipse(x, y, 8, 8);
  }
}

function drawBubbles() {
  // Draw bubbles in the bottle and tube
  for (let bubble of bubbles) {
    fill(200, 230, 255, 200);
    ellipse(bubble.x, bubble.y, bubble.size);
  }

  // Draw bubbles in the gas jar
  for (let bubble of gasJarBubbles) {
    fill(200, 230, 255, 200);
    ellipse(bubble.x, bubble.y, bubble.size);
  }
}

function drawGasJar() {
  // Gas jar
  fill(224, 224, 224, 150);
  rect(570, 100, 140, 350, 5);

  // Hydrogen gas collected
  fill(220, 240, 255, 100);
  rect(570, 100 + (350 - hydrogenGasLevel), 140, hydrogenGasLevel, 5);

  // Water in gas jar
  fill(100, 181, 246, 120);
  rect(570, 100 + (350 - waterLevel), 140, waterLevel, 5);

  // Beehive shelf
  fill(144, 164, 174);
  rect(570, 450, 140, 10);
  // Holes in beehive shelf
  fill(100, 181, 246);
  ellipse(610, 455, 10, 5);
  ellipse(650, 455, 10, 5);
  ellipse(690, 455, 10, 5);
}

function drawLabels() {
  fill(0);
  textSize(16);
  textStyle(BOLD);

  text("Dilute Acid", 180, 190);
  text("Granulated Zinc", 180, 470);
  text("Hydrogen Gas", 580, 90);
  text("Water Trough", 580, 240);
  text("Beehive Shelf", 580, 440);

  textSize(14);
  textStyle(NORMAL);
  text("Woulfe's Bottle", 210, 170);
  text("Thistle Funnel", 240, 130);
  text("Delivery Tube", 380, 310);
}

function produceBubbles() {
  // Create bubbles in the bottle
  if (frameCount % 10 === 0) {
    bubbles.push({
      x: random(210, 340),
      y: random(380, 430),
      size: random(5, 12),
      speed: random(1, 3),
    });
  }

  // Move bubbles upward
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].y -= bubbles[i].speed;

    // If bubbles reach the top of the acid, move them into the tube
    if (bubbles[i].y < 200 + (250 - acidLevel)) {
      bubbles[i].x = 350;
      bubbles[i].y = 320;

      // After moving through tube, create bubbles in the gas jar
      if (random() > 0.8) {
        gasJarBubbles.push({
          x: random(610, 690),
          y: 450,
          size: random(8, 15),
          speed: random(2, 4),
        });
      }
    }

    // Remove bubbles that go too high
    if (bubbles[i].y < 0) {
      bubbles.splice(i, 1);
    }
  }

  // Move bubbles in gas jar upward
  for (let i = gasJarBubbles.length - 1; i >= 0; i--) {
    gasJarBubbles[i].y -= gasJarBubbles[i].speed;

    // Remove bubbles that reach the top
    if (gasJarBubbles[i].y < 100) {
      gasJarBubbles.splice(i, 1);
    }
  }
}
