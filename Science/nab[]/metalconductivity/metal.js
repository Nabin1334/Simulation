// script.js
let p5Instance;
let currentMaterial = null;
let bulbOn = false;
let conductors = ["copper", "iron", "aluminium", "lead"];
let insulators = ["paper", "sulphur", "wood"];

// new: switch state and DOM ref
let switchOn = false;
let switchBtn = null;

document.addEventListener("DOMContentLoaded", function () {
  // Initialize p5.js
  p5Instance = new p5(circuitSketch, "circuit-container");

  // Add event listeners to material buttons
  document.querySelectorAll(".material").forEach((material) => {
    material.addEventListener("click", function () {
      const materialType = this.getAttribute("data-material");
      testMaterial(materialType);
    });
  });

  // Grab the switch button if it exists and move it onto the board
  switchBtn = document.getElementById("switch-btn");
  const circuitContainer = document.getElementById("circuit-container");
  if (switchBtn && circuitContainer) {
    // move into board so it overlays canvas
    circuitContainer.appendChild(switchBtn);

    // basic onboard positioning (can be overridden by CSS)
    switchBtn.style.position = "absolute";
    switchBtn.style.left = "40%";
    switchBtn.style.top = "60%";
    switchBtn.style.transform = "translateX(-50%)";
    switchBtn.style.zIndex = "50";

    // ensure initial appearance
    switchBtn.disabled = true;
    updateSwitchUI();

    switchBtn.addEventListener("click", function (e) {
      if (this.disabled) return;
      // toggle physical switch
      switchOn = !switchOn;
      // update UI and simulation
      updateSwitchUI();
      bulbOn =
        switchOn && currentMaterial && conductors.includes(currentMaterial);
      // redraw immediately
      if (p5Instance && typeof p5Instance.redraw === "function")
        p5Instance.redraw();
    });
  }
});

function testMaterial(material) {
  currentMaterial = material;
  // bulb only lights if switch is ON and material is a conductor
  bulbOn = switchOn && conductors.includes(material);

  // Update the visual feedback
  document.querySelectorAll(".material").forEach((el) => {
    el.classList.remove("active");
  });

  const sel = document.querySelector(`.material[data-material="${material}"]`);
  if (sel) sel.classList.add("active");

  // enable switch when a material is selected
  if (switchBtn) {
    switchBtn.disabled = false;
    // keep switchOn as-is; update UI to reflect state
    updateSwitchUI();
  }

  if (p5Instance && typeof p5Instance.redraw === "function")
    p5Instance.redraw();
}

function updateSwitchUI() {
  if (!switchBtn) return;
  // Set aria + classes + inner indicator text if present
  switchBtn.setAttribute("aria-pressed", String(switchOn));
  if (switchOn) {
    switchBtn.classList.remove("off");
    switchBtn.classList.add("on");
    // update simple inner text if button uses plain text
    // preserve inner structure if spans exist
    const indicator =
      switchBtn.querySelector(".switch-indicator") ||
      switchBtn.firstElementChild;
    const label =
      switchBtn.querySelector(".switch-label") || switchBtn.lastElementChild;
    if (indicator) indicator.textContent = "🟢";
    if (label) label.textContent = "On";
  } else {
    switchBtn.classList.remove("on");
    switchBtn.classList.add("off");
    const indicator =
      switchBtn.querySelector(".switch-indicator") ||
      switchBtn.firstElementChild;
    const label =
      switchBtn.querySelector(".switch-label") || switchBtn.lastElementChild;
    if (indicator) indicator.textContent = "🔴";
    if (label) label.textContent = "Off";
  }
}

function circuitSketch(p) {
  p.setup = function () {
    p.createCanvas(700, 350);
    p.noLoop();
  };

  p.draw = function () {
    p.background(250);

    // Draw the battery
    drawBattery(p, 110, 170);

    // Draw the bulb
    drawBulb(p, 600, 150);

    // Draw wires
    drawWires(p);

    // Draw the material space
    drawMaterialSpace(p, 350, 150);

    // Draw the current material if any
    if (currentMaterial) {
      drawMaterial(p, 350, 150, currentMaterial);
    }

    // Draw status text
    p.fill(50);
    p.textSize(18);
    p.textAlign(p.CENTER);

    if (currentMaterial) {
      p.text(`Testing: ${currentMaterial}`, p.width / 2, 300);

      if (bulbOn) {
        p.fill(0, 150, 0);
        p.text("Circuit Complete - Bulb Lights Up!", p.width / 2, 330);
      } else {
        p.fill(150, 0, 0);
        p.text("Circuit Incomplete - Bulb Doesn't Light", p.width / 2, 330);
      }
    } else {
      p.text("Select a material to test conductivity", p.width / 2, 300);
      p.textSize(14);
      p.text("Click on any material from the panel below", p.width / 2, 330);
    }
  };

  // Redraw when the material changes
  setInterval(() => {
    p.redraw();
  }, 100);
}

function drawBattery(p, x, y) {
  // Battery body
  p.fill(255);
  p.stroke(0);
  p.strokeWeight(2);
  p.rect(x - 20, y - 40, 40, 80, 5);

  // Positive terminal
  p.fill(50);
  p.rect(x - 10, y - 45, 20, 5, 2);

  // Negative terminal
  p.fill(50);
  p.rect(x - 10, y + 40, 20, 5, 2);

  // Plus sign
  p.strokeWeight(3);
  p.stroke(0);
  p.line(x, y - 30, x, y - 20);
  p.line(x - 5, y - 25, x + 5, y - 25);

  // Minus sign
  p.line(x - 5, y + 30, x + 5, y + 30);
}

function drawBulb(p, x, y) {
  // Bulb glow if on
  if (bulbOn) {
    p.drawingContext.shadowBlur = 30;
    p.drawingContext.shadowColor = p.color(255, 255, 0);
  }

  // Bulb glass
  p.fill(bulbOn ? p.color(255, 255, 100) : p.color(240, 240, 220));
  p.stroke(0);
  p.strokeWeight(1);
  p.ellipse(x, y, 50, 50);

  p.drawingContext.shadowBlur = 0;

  // Bulb base
  p.fill(150);
  p.rect(x - 15, y + 20, 30, 20, 3);

  // Bulb tip
  p.fill(100);
  p.ellipse(x, y + 30, 20, 10);

  // Filament
  if (bulbOn) {
    p.stroke(255, 255, 0);
    p.strokeWeight(3);
  } else {
    p.stroke(100);
    p.strokeWeight(1);
  }
  p.line(x - 10, y, x + 10, y);
  p.line(x - 10, y, x, y + 5);
  p.line(x + 10, y, x, y + 5);
}

function drawWires(p) {
  p.stroke(0);
  p.strokeWeight(3);
  p.noFill();

  // From battery positive to material space
  p.line(110, 130, 150, 130);
  p.line(150, 130, 150, 100);
  p.line(150, 100, 320, 100);
  p.line(320, 100, 320, 130);

  // From material space to bulb
  p.line(380, 130, 410, 130);
  p.line(410, 130, 410, 100);
  p.line(410, 100, 580, 100);
  p.line(580, 100, 580, 130);

  // From bulb to battery negative
  p.line(610, 170, 580, 170);
  p.line(580, 170, 580, 215);
  p.line(582, 215, 120, 215);
  //p.line(125, 200, 120, 180);

  // optional: highlight wires when circuit complete
  if (bulbOn) {
    p.stroke(30, 180, 30);
    p.strokeWeight(3);
    // top path (left)
    // p.line(110, 130, 320, 130);
    // // bridge across material space
    // p.line(320, 130, 380, 130);
    // // top path (right)
    // p.line(380, 130, 580, 130);
    // // bottom return
    // p.line(580, 170, 120, 215);
  }
}

function drawMaterialSpace(p, x, y) {
  p.stroke(100);
  p.strokeWeight(1);
  p.fill(240);
  p.rect(x - 30, y - 30, 60, 60, 5);

  // Draw connection points
  p.fill(bulbOn ? colorGreen() : 100);
  p.ellipse(x - 30, y, 10, 10);
  p.ellipse(x + 30, y, 10, 10);

  // If conductive and switch closed, draw bridge
  if (currentMaterial && conductors.includes(currentMaterial) && switchOn) {
    p.stroke(30, 180, 30);
    p.strokeWeight(4);
    p.line(x - 30, y, x + 30, y);
  }

  // Label
  p.fill(0);
  p.noStroke();
  p.textSize(14);
  p.text("Test Space", x, y + 50);
}

function colorGreen() {
  // helper for p5 color fallback when calling outside p5 context
  // return a value that p5 uses; inside draw functions p.color is used
  return [30, 180, 30];
}

function drawMaterial(p, x, y, material) {
  // Draw different representations for different materials
  switch (material) {
    case "copper":
      p.fill(184, 115, 51); // Copper color
      p.stroke(150, 100, 50);
      break;
    case "iron":
      p.fill(200, 200, 200); // Iron color
      p.stroke(150, 150, 150);
      break;
    case "aluminium":
      p.fill(170, 170, 180); // Aluminum color
      p.stroke(140, 140, 150);
      break;
    case "lead":
      p.fill(120, 120, 120);
      p.stroke(90, 90, 90);
      break;
    case "paper":
      p.fill(250, 250, 240); // Paper color
      p.stroke(200, 200, 190);
      break;
    case "sulphur":
      p.fill(255, 255, 0); // Sulfur yellow
      p.stroke(200, 200, 0);
      break;
    case "wood":
      p.fill(150, 100, 50); // Wood brown
      p.stroke(120, 80, 40);
      break;
  }

  p.strokeWeight(1);
  p.rect(x - 25, y - 25, 50, 50, 3);

  // Draw texture based on material
  if (material === "wood") {
    // Wood grain
    p.stroke(120, 80, 40);
    for (let i = 0; i < 5; i++) {
      p.line(x - 25, y - 25 + i * 10, x + 25, y - 25 + i * 10);
    }
  } else if (material === "paper") {
    // Paper lines
    p.stroke(230, 230, 220);
    for (let i = 0; i < 5; i++) {
      p.line(x - 25, y - 25 + i * 10, x + 25, y - 25 + i * 10);
    }
  }

  // Label
  p.fill(0);
  p.noStroke();
  p.textSize(12);
  p.text(material.charAt(0).toUpperCase() + material.slice(1), x, y);
}
