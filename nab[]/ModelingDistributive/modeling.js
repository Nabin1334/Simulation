let aSlider, bSlider, cSlider; // Declare slider variables for a, b, c
let a = 10,
  b = 10,
  c = 10; // Initial values for a, b, c

function setup() {
  createCanvas(900, 500); // Create a drawing canvas of size 900x500 pixels
  textFont("Georgia"); // Set the font for text to Georgia

  // Create slider for 'a' and set its position and width
  aSlider = createSlider(1, 50, a);
  aSlider.position(60, height - 60);
  aSlider.style("width", "200px");

  // Create slider for 'b' and set its position and width
  bSlider = createSlider(1, 50, b);
  bSlider.position(320, height - 60);
  bSlider.style("width", "200px");

  // Create slider for 'c' and set its position and width
  cSlider = createSlider(1, 50, c);
  cSlider.position(580, height - 60); 
  cSlider.style("width", "200px");
}

function draw() {
  background(255); // Set background color to white

  // Get current values from sliders
  a = aSlider.value();
  b = bSlider.value();
  c = cSlider.value();

  // Display the distributive property equation
  fill(180, 0, 80);
  textSize(28); // Set text color and size
  text(`a(b + c) = a × b + a × c`, 40, 40);
  text (a*b); // Show general equation

  // Display the equation with current values
  fill(60, 0, 180);
  textSize(24); // Change text color and size
  text(
    `${a}(${b} + ${c}) = ${a} × ${b} + ${a} × ${c} = ${a * (b + c)}`,
    40,
    80
  );

  // Set up area model dimensions
  let x0 = 120,
    y0 = 120,
    h = 180; // Top-left corner and height
  let w1 = b * 10,
    w2 = c * 10; // Widths for b and c rectangles
  strokeWeight(3); // Set line thickness

  // Draw left rectangle representing a × b
  stroke(60, 0, 180); // Set border color (blue)
  fill(240, 240, 255, 80); // Set fill color (light blue, transparent)
  rect(x0, y0, w1, h); // Draw rectangle

  // Draw right rectangle representing a × c
  stroke(0, 140, 60); // Set border color (green)
  fill(240, 255, 240, 80); // Set fill color (light green, transparent)
  rect(x0 + w1, y0, w2, h); // Draw rectangle

  // Draw vertical split line between rectangles
  stroke(180, 0, 80); // Set line color (pink)
  line(x0 + w1, y0, x0 + w1, y0 + h);

  // Add labels inside rectangles
  noStroke();
  textSize(22); // No border, set text size
  fill(60, 0, 180); // Blue text for left rectangle
  text(`${a} × ${b}`, x0 + w1 / 2 - 30, y0 + h / 2);
  fill(0, 140, 60); // Green text for right rectangle
  text(`${a} × ${c}`, x0 + w1 + w2 / 2 - 30, y0 + h / 2);

  // Show current values of a, b, c below sliders
  fill(180, 0, 80);
  textSize(18); // Pink text for a
  text(`a = ${a}`, 60, height - 80);
  fill(60, 0, 180); // Blue text for b
  text(`b = ${b}`, 320, height - 80);
  fill(0, 140, 60); // Green text for c
  text(`c = ${c}`, 580, height - 80);

  // Draw brackets for height (a)
  stroke(0);
  strokeWeight(3); // Black lines, thicker
  line(x0 - 20, y0, x0 - 20, y0 + h); // Vertical line for bracket
  line(x0 - 25, y0, x0 - 15, y0); // Top horizontal bracket
  line(x0 - 25, y0 + h, x0 - 15, y0 + h); // Bottom horizontal bracket
  noStroke();
  fill(180, 0, 80); // Pink text for a
  text(`${a}`, x0 - 45, y0 + h / 2 + 5); // Label for height

  // Draw brackets for width (b and c)
  stroke(0);
  line(x0, y0 + h + 20, x0 + w1 + w2, y0 + h + 20); // Horizontal line for bracket
  line(x0, y0 + h + 15, x0, y0 + h + 25); // Left vertical bracket
  line(x0 + w1 + w2, y0 + h + 15, x0 + w1 + w2, y0 + h + 25); // Right vertical bracket
  noStroke();
  fill(60, 0, 180); // Blue text for b
  text(`${b}`, x0 + w1 / 2 - 10, y0 + h + 40); // Label for b width
  fill(0, 140, 60); // Green text for c
  text(`${c}`, x0 + w1 + w2 / 2 - 10, y0 + h + 40); // Label for c width
}
