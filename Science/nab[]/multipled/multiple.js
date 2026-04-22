function setup() {
  createCanvas(800, 250);
}

function draw() {
  background(255);
  
  let n = 0;  // Change this to the divisor
  let m = 0; // Change this to the dividend
  let unit = 20; // Pixels per unit for scaling
  let tapeHeight = 30;
  
  // Draw top tape: purple for n (single segment)
  fill(150, 100, 200); // Purple
  noStroke();
  rect(50, 30, n * unit, tapeHeight);
  fill(0);
  textSize(16);
  text(n, 20, 50); // Label
  
  // Draw bottom tape: orange for m
  fill(255, 140, 0); // Orange
  rect(50, 120, m * unit, tapeHeight);
  
  // Draw black vertical divisions every n units
  stroke(0);
  strokeWeight(2);
  for (let i = 0; i <= Math.floor(m / n) * n; i += n) {
    line(50 + i * unit, 120, 50 + i * unit, 120 + tapeHeight);
  }
  // If there's a remainder, draw the last full line and note
  if (m % n !== 0) {
    // Draw the end line
    line(50 + m * unit, 120, 50 + m * unit, 120 + tapeHeight);
    // Optional: highlight remainder in different color (red)
    fill(255, 0, 0, 150); // Semi-transparent red
    noStroke();
    rect(50 + Math.floor(m / n) * n * unit, 120, (m % n) * unit, tapeHeight);
  } else {
    // Draw the end line if exact
    line(50 + m * unit, 120, 50 + m * unit, 120 + tapeHeight);
  }
  
  // Label for bottom tape
  fill(0);
  text(m, 20, 140);
  
  // Display result
  textSize(18);
  if (m % n === 0) {
    text(m + " is a multiple of " + n + " (fits exactly " + (m / n) + " times).", 50, 200);
  } else {
    text(m + " is not a multiple of " + n + " (remainder: " + (m % n) + ").", 50, 200);
  }
}