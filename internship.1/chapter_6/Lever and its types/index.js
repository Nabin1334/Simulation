// Physics Simulation Variables
const canvas = document.getElementById("leverCanvas");
const ctx = canvas.getContext("2d");
let canvasWidth = 0,
  canvasHeight = 0;

// Physics State
let leverType = 1;
let leverAngle = 0;
let leverLength = 8;
let loadWeight = 50;
let effortForce = 50; // FIX: was "effaortForce" (typo)

// Physics constants
const gravity = 9.81;
let animationId = null;
let isAnimating = true;

// Fixed Fulcrum Position
let fulcrumX = 0;
let fulcrumY = 0;

// Lever Configurations
const leverConfigs = {
  1: {
    name: "First Class Lever",
    realExample: "See-saw, scissors, crowbar, hammer",
    fulcrumPos: 0,
    loadPos: -leverLength / 2 + 1,
    effortPos: leverLength / 2 - 1,
    maFormula: "MA = Effort Arm / Load Arm",
    description: "Fulcrum between effort and load",
  },
  2: {
    name: "Second Class Lever",
    realExample: "Wheelbarrow, nutcracker, bottle opener",
    fulcrumPos: -leverLength / 2 + 1,
    loadPos: 0,
    effortPos: leverLength / 2 - 1,
    maFormula: "MA = Effort Arm / Load Arm",
    description: "Load between fulcrum and effort",
  },
  3: {
    name: "Third Class Lever",
    realExample: "Fishing rod, tweezers, human arm, baseball bat",
    fulcrumPos: -leverLength / 2 + 1,
    effortPos: 0,
    loadPos: leverLength / 2 - 1,
    maFormula: "MA = Effort Arm / Load Arm (< 1)",
    description: "Effort between fulcrum and load",
  },
};

function initSimulation() {
  const container = canvas.parentElement;
  canvasWidth = container.clientWidth;
  canvasHeight = container.clientHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  fulcrumX = canvasWidth / 2;
  fulcrumY = canvasHeight * 0.65;

  if (animationId) cancelAnimationFrame(animationId); // FIX: cancel before restart
  if (isAnimating) {
    animationId = requestAnimationFrame(animatePhysics);
  }
}

function calculateRealPhysics() {
  const config = leverConfigs[leverType];

  const fulcrumPos = config.fulcrumPos;
  const loadPos = config.loadPos;
  const effortPos = config.effortPos;

  const loadDistance = Math.abs(loadPos - fulcrumPos);
  const effortDistance = Math.abs(effortPos - fulcrumPos);

  const loadTorque = loadWeight * loadDistance * Math.cos(leverAngle);
  const effortTorque = effortForce * effortDistance * Math.cos(leverAngle); // FIX: was referencing undefined "effaortForce"
  const netTorque = effortTorque - loadTorque;

  const mechanicalAdvantage = effortDistance / loadDistance;

  return {
    loadDistance,
    effortDistance,
    loadTorque,
    effortTorque,
    netTorque,
    mechanicalAdvantage,
    loadPos,
    effortPos,
    fulcrumPos,
  };
}

function animatePhysics() {
  const physics = calculateRealPhysics();

  const momentOfInertia = 1000;
  const damping = 0.92;

  const angularAcceleration = physics.netTorque / momentOfInertia;
  leverAngle += angularAcceleration * 0.02;
  leverAngle *= damping;

  const maxAngle = Math.PI / 4;
  if (Math.abs(leverAngle) > maxAngle) {
    leverAngle = maxAngle * Math.sign(leverAngle);
  }

  if (Math.abs(physics.netTorque) < 2 && Math.abs(leverAngle) < 0.01) {
    leverAngle *= 0.9;
  }

  if (isAnimating) {
    animationId = requestAnimationFrame(animatePhysics);
  }

  updateSimulation();
}

function drawSimulation() {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  skyGradient.addColorStop(0, "#87CEEB");
  skyGradient.addColorStop(1, "#5DADE2");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const groundY = fulcrumY + 150;
  ctx.fillStyle = "#27ae60";
  ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);

  ctx.strokeStyle = "#2ecc71";
  ctx.lineWidth = 2;
  for (let x = 0; x < canvasWidth; x += 15) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.quadraticCurveTo(x + 3, groundY - 12, x + 6, groundY);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(fulcrumX, fulcrumY);

  drawFulcrum();
  ctx.rotate(leverAngle);
  drawLeverBar();
  drawLoad();
  drawEffort();

  ctx.restore();
  updateDisplayInfo();
}

function drawFulcrum() {
  ctx.fillStyle = "#3498db";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-20, 50);
  ctx.lineTo(20, 50);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#2980b9";
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2c3e50";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("F", 0, 0);
}

function drawLeverBar() {
  const barLength = leverLength * 35;
  ctx.fillStyle = "#f39c12";
  ctx.fillRect(-barLength / 2, -8, barLength, 16);

  ctx.strokeStyle = "#d35400";
  ctx.lineWidth = 2;
  ctx.strokeRect(-barLength / 2, -8, barLength, 16);

  ctx.strokeStyle = "#e67e22";
  ctx.lineWidth = 3;
  ctx.strokeRect(-barLength / 2, -8, barLength, 16);
}

function drawLoad() {
  const physics = calculateRealPhysics();
  const loadX = physics.loadPos * 35;
  const loadSize = 20 + (loadWeight / 200) * 60;

  const shadowIntensity = Math.min(0.4, loadWeight / 500);
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowIntensity})`;
  ctx.fillRect(loadX - loadSize / 2 + 3, -8 - loadSize + 3, loadSize, loadSize);

  const loadGradient = ctx.createLinearGradient(
    loadX - loadSize / 2,
    -8 - loadSize,
    loadX + loadSize / 2,
    -8,
  );
  if (loadWeight < 80) {
    loadGradient.addColorStop(0, "#ff9999");
    loadGradient.addColorStop(0.5, "#ff6666");
    loadGradient.addColorStop(1, "#ff3333");
  } else if (loadWeight < 140) {
    loadGradient.addColorStop(0, "#ff6b6b");
    loadGradient.addColorStop(0.5, "#e74c3c");
    loadGradient.addColorStop(1, "#c0392b");
  } else {
    loadGradient.addColorStop(0, "#ff4444");
    loadGradient.addColorStop(0.5, "#dc3545");
    loadGradient.addColorStop(1, "#b71c1c");
  }

  ctx.fillStyle = loadGradient;
  ctx.fillRect(loadX - loadSize / 2, -8 - loadSize, loadSize, loadSize);

  ctx.strokeStyle = loadWeight > 100 ? "#8b0000" : "#b33939";
  ctx.lineWidth = loadWeight > 100 ? 4 : 3;
  ctx.strokeRect(loadX - loadSize / 2, -8 - loadSize, loadSize, loadSize);

  ctx.fillStyle = "white";
  ctx.font = loadWeight > 100 ? "bold 18px Arial" : "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${loadWeight}N`, loadX, -8 - loadSize / 2);

  ctx.fillStyle = "#2c3e50";
  ctx.font = "bold 18px Arial";
  ctx.fillText("L", loadX, -8 - loadSize - 25);

  ctx.strokeStyle = "#e74c3c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(loadX, -8);
  ctx.lineTo(loadX, -8 - loadSize);
  ctx.stroke();
}

function drawEffort() {
  const physics = calculateRealPhysics();
  const effortX = physics.effortPos * 35;
  const effortSize = 20 + (effortForce / 200) * 50; // FIX: was "effaortForce"
  const radius = effortSize / 2;

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.arc(effortX + 2, -8 - radius + 2, radius, 0, Math.PI * 2);
  ctx.fill();

  const effortGradient = ctx.createRadialGradient(
    effortX,
    -8 - radius,
    radius / 3,
    effortX,
    -8 - radius,
    radius,
  );
  effortGradient.addColorStop(0, "#7bed9f");
  effortGradient.addColorStop(0.7, "#2ecc71");
  effortGradient.addColorStop(1, "#27ae60");

  ctx.fillStyle = effortGradient;
  ctx.beginPath();
  ctx.arc(effortX, -8 - radius, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#229954";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${effortForce}N`, effortX, -8 - radius); // FIX: was "effaortForce"

  ctx.fillStyle = "#2c3e50";
  ctx.font = "bold 18px Arial";
  ctx.fillText("E", effortX, -8 - radius - 20);

  ctx.strokeStyle = "#2ecc71";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(effortX, -8);
  ctx.lineTo(effortX, -8 - radius);
  ctx.stroke();
}

function updateDisplayInfo() {
  const physics = calculateRealPhysics();

  document.getElementById("maValue").textContent =
    physics.mechanicalAdvantage.toFixed(2);
  document.getElementById("loadTorque").textContent =
    `${physics.loadTorque.toFixed(1)} N·m`;
  document.getElementById("effortTorque").textContent =
    `${physics.effortTorque.toFixed(1)} N·m`;
  document.getElementById("netTorque").textContent =
    `${physics.netTorque.toFixed(1)} N·m`;

  document.getElementById("currentLeverType").textContent =
    leverConfigs[leverType].name;
  document.getElementById("leverDescription").textContent =
    leverConfigs[leverType].description;
  document.getElementById("maDisplay").textContent =
    physics.mechanicalAdvantage.toFixed(2);
  document.getElementById("maFormula").textContent =
    leverConfigs[leverType].maFormula;
  document.getElementById("realExample").textContent =
    leverConfigs[leverType].realExample;

  let stateText, statusText;

  if (Math.abs(physics.netTorque) < 2) {
    stateText = "Balanced ⚖️";
    statusText = "Lever is balanced — no movement";
  } else if (physics.netTorque > 0) {
    stateText = "Effort Winning ↗️";
    statusText = `Effort is stronger (${physics.netTorque.toFixed(1)} N·m torque)`;
  } else {
    stateText = "Load Winning ↘️";
    statusText = `Load is heavier (${Math.abs(physics.netTorque).toFixed(1)} N·m torque)`;
  }

  document.getElementById("leverState").textContent = stateText;
  document.getElementById("statusDisplay").textContent = statusText;
}

function changeLeverType(type) {
  leverType = type;
  document.querySelectorAll(".lever-type-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i === type - 1);
  });
  updatePositions();
  updateSimulation();
}

function updateLoadWeight(value) {
  loadWeight = parseInt(value);
  document.getElementById("loadWeightValue").textContent = `${value} N`;
  updateSimulation();
}

function updateEffortForce(value) {
  effortForce = parseInt(value);
  document.getElementById("effortForceValue").textContent = `${value} N`;
  updateSimulation();
}

function updateLeverLength(value) {
  leverLength = parseFloat(value);
  document.getElementById("leverLengthValue").textContent = `${value} m`;
  updatePositions();
  updateSimulation();
}

function updatePositions() {
  leverConfigs[1].loadPos = -leverLength / 2 + 1;
  leverConfigs[1].effortPos = leverLength / 2 - 1;
  leverConfigs[1].fulcrumPos = 0;

  leverConfigs[2].fulcrumPos = -leverLength / 2 + 1;
  leverConfigs[2].loadPos = 0;
  leverConfigs[2].effortPos = leverLength / 2 - 1;

  leverConfigs[3].fulcrumPos = -leverLength / 2 + 1;
  leverConfigs[3].effortPos = 0;
  leverConfigs[3].loadPos = leverLength / 2 - 1;
}

function resetSimulation() {
  loadWeight = 50;
  effortForce = 50;
  leverLength = 8;
  leverAngle = 0;

  document.getElementById("loadWeight").value = 50;
  document.getElementById("effortForce").value = 50;
  document.getElementById("leverLength").value = 8;

  document.getElementById("loadWeightValue").textContent = "50 N";
  document.getElementById("effortForceValue").textContent = "50 N";
  document.getElementById("leverLengthValue").textContent = "8 m";

  updatePositions();
  updateSimulation();
}

function autoBalance() {
  const physics = calculateRealPhysics();
  const requiredEffort =
    (loadWeight * physics.loadDistance) / physics.effortDistance;
  effortForce = Math.max(1, Math.min(200, Math.round(requiredEffort)));
  document.getElementById("effortForce").value = effortForce;
  document.getElementById("effortForceValue").textContent = `${effortForce} N`;
  updateSimulation();
}

function updateSimulation() {
  drawSimulation();
}

window.addEventListener("load", () => {
  initSimulation();
  window.addEventListener("resize", initSimulation);
});
