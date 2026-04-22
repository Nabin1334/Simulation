// Canvas setup
const canvas = document.getElementById("simulation-canvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
function resizeCanvas() {
  const container = document.getElementById("simulation-area");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Car position and state
let carX = 100; // Starting X position
const carY = 200; // Fixed Y position
const carWidth = 60;
const carHeight = 30;
const wheelRadius = 8;

// Simulation variables
let speed = 500; // m/s (increased to 500)
let isRunning = false;
let timeElapsed = 0;
let distanceTraveled = 0;
let lastTimestamp = null;

// DOM elements
const speedSlider = document.getElementById("speed-slider");
const speedInput = document.getElementById("speed-input");
const setSpeedBtn = document.getElementById("set-speed-btn");
const speedDisplay = document.getElementById("speed-display");
const currentSpeedEl = document.getElementById("current-speed");
const currentVelocityEl = document.getElementById("current-velocity");
const currentDistanceEl = document.getElementById("current-distance");
const currentTimeEl = document.getElementById("current-time");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

// Function to update speed display
function updateSpeedDisplay(value) {
  // Ensure value is a number and within bounds
  let numValue = parseFloat(value);
  if (isNaN(numValue)) numValue = 500;
  if (numValue < 1) numValue = 1;
  if (numValue > 1000) numValue = 1000;

  speed = numValue;

  // Update all displays
  speedSlider.value = speed;
  speedInput.value = speed;
  speedDisplay.textContent = speed + " m/s";
  currentSpeedEl.textContent = speed + " m/s";
  currentVelocityEl.textContent = speed + " m/s →";
}

// Speed slider event
speedSlider.addEventListener("input", (e) => {
  updateSpeedDisplay(e.target.value);
});

// Set button click event
setSpeedBtn.addEventListener("click", () => {
  updateSpeedDisplay(speedInput.value);
});

// Input enter key event
speedInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    updateSpeedDisplay(speedInput.value);
  }
});

// Input blur event (when clicking away)
speedInput.addEventListener("blur", () => {
  updateSpeedDisplay(speedInput.value);
});

// Button events
startBtn.addEventListener("click", () => {
  isRunning = true;
  lastTimestamp = null; // Reset timestamp to avoid delta time issues
});

pauseBtn.addEventListener("click", () => {
  isRunning = false;
});

resetBtn.addEventListener("click", () => {
  // Reset position and stats
  carX = 100;
  timeElapsed = 0;
  distanceTraveled = 0;
  isRunning = false;

  // Update displays
  currentDistanceEl.textContent = "0 m";
  currentTimeEl.textContent = "0 s";

  // Redraw
  drawCanvas();
});

// Draw function
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw road
  ctx.fillStyle = "#333";
  ctx.fillRect(0, carY + carHeight / 2 + 5, canvas.width, 10);

  // Draw road lines
  ctx.strokeStyle = "#FFF";
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 30]);
  ctx.beginPath();
  ctx.moveTo(0, carY + carHeight / 2 + 10);
  ctx.lineTo(canvas.width, carY + carHeight / 2 + 10);
  ctx.stroke();
  ctx.setLineDash([]); // Reset

  // Draw car
  // Car body
  ctx.fillStyle = "#FF5722";
  ctx.fillRect(carX - carWidth / 2, carY - carHeight / 2, carWidth, carHeight);

  // Windows
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(carX - carWidth / 2 + 5, carY - carHeight / 2 + 3, 15, 10);
  ctx.fillRect(carX + carWidth / 2 - 20, carY - carHeight / 2 + 3, 15, 10);

  // Wheels
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(
    carX - carWidth / 3,
    carY + carHeight / 2 + wheelRadius / 2,
    wheelRadius,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    carX + carWidth / 3,
    carY + carHeight / 2 + wheelRadius / 2,
    wheelRadius,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Speed label (positioned on left side, away from car)
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#4CAF50";
  ctx.fillText("⚡ SPEED: " + speed + " m/s", 20, 50);

  // Velocity label (positioned on right side, away from car)
  ctx.fillStyle = "#FF5722";

  // Calculate text width to position it properly
  const velocityText = "VELOCITY: " + speed + " m/s →";
  ctx.font = "bold 16px Arial";
  const textWidth = ctx.measureText(velocityText).width;

  // Position on right side with padding
  ctx.fillText(velocityText, canvas.width - textWidth - 20, 50);
}

// Animation loop
function animate(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    requestAnimationFrame(animate);
    return;
  }

  if (isRunning) {
    // Calculate delta time in seconds
    const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.1); // Limit to 100ms

    // Update car position - reduced pixels per meter for higher speed range
    const pixelsPerMeter = 2; // Reduced from 6 to 2 to handle higher speeds
    const movement = speed * deltaTime * pixelsPerMeter;

    carX += movement;

    // Update stats
    timeElapsed += deltaTime;
    distanceTraveled += speed * deltaTime;

    // Wrap around when car goes off screen
    if (carX > canvas.width + carWidth) {
      carX = -carWidth;
    }

    // Update displays
    // Format distance with appropriate units (km for large distances)
    if (distanceTraveled >= 1000) {
      currentDistanceEl.textContent =
        (distanceTraveled / 1000).toFixed(2) + " km";
    } else {
      currentDistanceEl.textContent = distanceTraveled.toFixed(1) + " m";
    }
    currentTimeEl.textContent = timeElapsed.toFixed(1) + " s";
  }

  // Draw everything
  drawCanvas();

  lastTimestamp = timestamp;
  requestAnimationFrame(animate);
}

// Start animation
requestAnimationFrame(animate);

// Initial draw
drawCanvas();
