// Canvas setup
const canvas = document.getElementById("frictionCanvas");
const ctx = canvas.getContext("2d");

// Physics constants
const g = 9.8;
const theta = (20 * Math.PI) / 180;
const mass = 5;
const dt = 0.016;

// Simulation variables
let frictionCoefficient = 0.3;
let surfaceType = "wood";
let boxPosition = 150;
let velocity = 0;
let isMoving = false;
let distanceTraveled = 0;
let lastPosition = 150;
let staticFrictionBroken = false;

// DOM elements
const frictionSlider = document.getElementById("frictionSlider");
const frictionValue = document.getElementById("frictionValue");
const frictionValueDisplay = document.getElementById("frictionValueDisplay");
const velocitySpan = document.getElementById("velocityValue");
const distanceSpan = document.getElementById("distanceValue");
const frictionForceSpan = document.getElementById("frictionForceValue");
const netForceSpan = document.getElementById("netForceValue");
const surfaceItems = document.querySelectorAll(".surface-item");

// Force controls
const appliedForceInput = document.getElementById("appliedForceInput");
const appliedForceSpan = document.getElementById("appliedForceValue");
const increaseForceBtn = document.getElementById("increaseForceBtn");
const decreaseForceBtn = document.getElementById("decreaseForceBtn");
const applyBtn = document.getElementById("applyForceBtn");
const resetBtn = document.getElementById("resetBtn");

let appliedForce = 10;

// Physics calculations
function calculateForces() {
  const normalForce = mass * g * Math.cos(theta);
  const gravityParallel = mass * g * Math.sin(theta);
  const maxStaticFriction = frictionCoefficient * normalForce;
  const kineticFriction = frictionCoefficient * normalForce;

  let staticFriction = 0;
  if (!isMoving && !staticFrictionBroken) {
    staticFriction = Math.min(gravityParallel, maxStaticFriction);
  }

  let netForce = 0;
  if (!isMoving && !staticFrictionBroken) {
    netForce = 0;
  } else {
    const frictionDirection = velocity > 0 ? -1 : 1;
    netForce = gravityParallel + frictionDirection * kineticFriction;
  }

  return {
    normalForce,
    gravityParallel,
    maxStaticFriction,
    staticFriction,
    kineticFriction,
    netForce,
  };
}

function applyExternalForce(force) {
  // Don't apply force if it's zero or negative
  if (force <= 0) return;

  const forces = calculateForces();

  if (!isMoving && !staticFrictionBroken) {
    // Check if applied force breaks static friction
    if (force > forces.maxStaticFriction - forces.gravityParallel) {
      staticFrictionBroken = true;
      isMoving = true;
      const excessForce =
        force + forces.gravityParallel - forces.maxStaticFriction;
      velocity += (excessForce / mass) * dt * 10;
    }
    // If force is not enough, object remains stationary (no change)
  } else {
    // Already moving, add force
    velocity += (force / mass) * dt * 10;
    isMoving = true;
  }
}

function updatePhysics() {
  const forces = calculateForces();

  if (isMoving || staticFrictionBroken) {
    const acceleration = forces.netForce / mass;
    velocity += acceleration * dt;
    boxPosition += velocity * 50;
    distanceTraveled += Math.abs(boxPosition - lastPosition) / 50;
    lastPosition = boxPosition;

    if (Math.abs(velocity) < 0.01 && Math.abs(forces.netForce) < 0.1) {
      velocity = 0;
      isMoving = false;
      staticFrictionBroken = false;
    }
  }

  if (boxPosition < 100) {
    boxPosition = 100;
    velocity = Math.abs(velocity) * 0.3;
  }
  if (boxPosition > canvas.width - 100) {
    boxPosition = canvas.width - 100;
    velocity = -Math.abs(velocity) * 0.3;
  }

  velocitySpan.textContent = Math.abs(velocity).toFixed(2);
  distanceSpan.textContent = distanceTraveled.toFixed(2);
  const fricForce = isMoving ? forces.kineticFriction : forces.staticFriction;
  frictionForceSpan.textContent = fricForce.toFixed(1);
  netForceSpan.textContent = forces.netForce.toFixed(1);
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB");
  gradient.addColorStop(1, "#E0F6FF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sun
  ctx.beginPath();
  ctx.arc(700, 60, 30, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700";
  ctx.fill();

  // Incline plane
  ctx.save();
  const inclineHeight = canvas.height - 80;
  const inclineEndY = inclineHeight - (canvas.width - 200) * Math.tan(theta);

  ctx.beginPath();
  ctx.moveTo(100, inclineHeight);
  ctx.lineTo(canvas.width - 100, inclineEndY);
  ctx.lineTo(canvas.width - 100, canvas.height);
  ctx.lineTo(100, canvas.height);
  ctx.closePath();

  let surfaceColor;
  switch (surfaceType) {
    case "ice":
      surfaceColor = "#a5d6f9";
      break;
    case "wood":
      surfaceColor = "#8d6e63";
      break;
    case "concrete":
      surfaceColor = "#9e9e9e";
      break;
    case "rubber":
      surfaceColor = "#424242";
      break;
    default:
      surfaceColor = "#8d6e63";
  }
  ctx.fillStyle = surfaceColor;
  ctx.fill();

  // Grass
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(100, canvas.height - 20, canvas.width - 200, 20);

  ctx.restore();

  // Draw box
  const boxX = boxPosition;
  const boxY = inclineHeight - (boxPosition - 100) * Math.tan(theta) - 30;

  ctx.save();
  ctx.translate(boxX, boxY);
  ctx.rotate(-theta);

  // Box with face
  ctx.fillStyle = isMoving ? "#ff6b6b" : "#4ecdc4";
  ctx.fillRect(-25, -25, 50, 50);
  ctx.strokeStyle = "#2c3e50";
  ctx.lineWidth = 2;
  ctx.strokeRect(-25, -25, 50, 50);

  if (!isMoving) {
    // Happy face
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(-10, -10, 4, 0, Math.PI * 2);
    ctx.arc(10, -10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.arc(-12, -12, 1.5, 0, Math.PI * 2);
    ctx.arc(8, -12, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 1.5;
    ctx.arc(0, 5, 8, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else {
    // Surprised face
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(-10, -10, 4, 0, Math.PI * 2);
    ctx.arc(10, -10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.arc(-12, -12, 1.5, 0, Math.PI * 2);
    ctx.arc(8, -12, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 10, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
  }
  ctx.restore();

  // 5kg label
  ctx.save();
  ctx.translate(boxX, boxY);
  ctx.fillStyle = "white";
  ctx.font = "bold 12px 'Comic Sans MS'";
  ctx.textAlign = "center";
  ctx.fillText("5kg", 0, 0);
  ctx.restore();
}

function animate() {
  updatePhysics();
  drawScene();
  requestAnimationFrame(animate);
}

animate();

// Event Listeners
frictionSlider.addEventListener("input", function () {
  frictionCoefficient = parseInt(this.value) / 100;
  frictionValue.textContent = frictionCoefficient.toFixed(2);
  frictionValueDisplay.textContent = frictionCoefficient.toFixed(2);
});

surfaceItems.forEach((item) => {
  item.addEventListener("click", function () {
    surfaceItems.forEach((i) => i.classList.remove("active"));
    this.classList.add("active");

    surfaceType = this.dataset.surface;
    const newFriction = parseInt(this.dataset.friction) / 100;
    frictionCoefficient = newFriction;
    frictionSlider.value = this.dataset.friction;
    frictionValue.textContent = newFriction.toFixed(2);
    frictionValueDisplay.textContent = newFriction.toFixed(2);
  });
});

function updateAppliedForceDisplay() {
  appliedForce = Math.max(0, Math.round(Number(appliedForceInput.value) || 0));
  appliedForceInput.value = appliedForce;
  appliedForceSpan.textContent = appliedForce;
}

increaseForceBtn.addEventListener("click", function () {
  appliedForce = Math.min(200, appliedForce + 1);
  appliedForceInput.value = appliedForce;
  appliedForceSpan.textContent = appliedForce;
});

decreaseForceBtn.addEventListener("click", function () {
  appliedForce = Math.max(0, appliedForce - 1);
  appliedForceInput.value = appliedForce;
  appliedForceSpan.textContent = appliedForce;
});

appliedForceInput.addEventListener("input", updateAppliedForceDisplay);
appliedForceInput.addEventListener("change", updateAppliedForceDisplay);

applyBtn.addEventListener("click", function () {
  applyExternalForce(appliedForce);
  this.style.transform = "scale(0.95)";
  setTimeout(() => (this.style.transform = ""), 100);
});

resetBtn.addEventListener("click", function () {
  boxPosition = 150;
  velocity = 0;
  isMoving = false;
  staticFrictionBroken = false;
  distanceTraveled = 0;
  lastPosition = 150;
  this.style.transform = "scale(0.95)";
  setTimeout(() => (this.style.transform = ""), 100);
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === " ") {
    applyExternalForce(appliedForce);
    e.preventDefault();
    applyBtn.style.transform = "scale(0.95)";
    setTimeout(() => (applyBtn.style.transform = ""), 100);
  } else if (e.key === "r" || e.key === "R") {
    boxPosition = 150;
    velocity = 0;
    isMoving = false;
    staticFrictionBroken = false;
    distanceTraveled = 0;
    lastPosition = 150;
    resetBtn.style.transform = "scale(0.95)";
    setTimeout(() => (resetBtn.style.transform = ""), 100);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    appliedForce = Math.min(200, appliedForce + 1);
    appliedForceInput.value = appliedForce;
    appliedForceSpan.textContent = appliedForce;
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    appliedForce = Math.max(0, appliedForce - 1);
    appliedForceInput.value = appliedForce;
    appliedForceSpan.textContent = appliedForce;
  }
});

// Initialize display
updateAppliedForceDisplay();
frictionValue.textContent = "0.30";
frictionValueDisplay.textContent = "0.30";
