
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
      let effortForce = 50;

      // Physics constants
      const gravity = 9.81;
      let animationId = null;
      let isAnimating = true;

      // Fixed Fulcrum Position
      let fulcrumX = 0;
      let fulcrumY = 0;

      // Lever Configurations - CORRECTED FOR ALL CLASSES
      const leverConfigs = {
        1: {
          // First class: F between L and E
          name: "First Class Lever",
          realExample: "See-saw, scissors, crowbar, hammer",
          // Positions: F is at center (0), L on left, E on right
          fulcrumPos: 0,
          loadPos: -leverLength / 2 + 1,
          effortPos: leverLength / 2 - 1,
          maFormula: "MA = Effort Arm / Load Arm",
          description: "Fulcrum between effort and load",
        },
        2: {
          // Second class: L between F and E
          name: "Second Class Lever",
          realExample: "Wheelbarrow, nutcracker, bottle opener",
          // Positions: F on left, L in middle, E on right
          fulcrumPos: -leverLength / 2 + 1,
          loadPos: 0,
          effortPos: leverLength / 2 - 1,
          maFormula: "MA = Effort Arm / Load Arm",
          description: "Load between fulcrum and effort",
        },
        3: {
          // Third class: E between F and L
          name: "Third Class Lever",
          realExample: "Fishing rod, tweezers, human arm, baseball bat",
          // Positions: F on left, E in middle, L on right
          fulcrumPos: -leverLength / 2 + 1,
          effortPos: 0,
          loadPos: leverLength / 2 - 1,
          maFormula: "MA = Effort Arm / Load Arm (< 1)",
          description: "Effort between fulcrum and load",
        },
      };

      // Initialize Simulation
      function initSimulation() {
        const container = canvas.parentElement;
        canvasWidth = container.clientWidth;
        canvasHeight = container.clientHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Set fixed fulcrum position
        fulcrumX = canvasWidth / 2;
        fulcrumY = canvasHeight * 0.65;

        // Start physics animation
        if (isAnimating) {
          animationId = requestAnimationFrame(animatePhysics);
        }

        updateSimulation();
      }

      // Calculate REAL Physics with ACCURATE calculations
      function calculateRealPhysics() {
        const config = leverConfigs[leverType];

        // Get positions for current lever type
        const fulcrumPos = config.fulcrumPos;
        const loadPos = config.loadPos;
        const effortPos = config.effortPos;

        // Convert to display scale (pixels per meter)
        const scale = 35;
        const loadDistance = Math.abs(loadPos - fulcrumPos);
        const effortDistance = Math.abs(effortPos - fulcrumPos);

        // ACCURATE torque calculation for all lever types
        // Torque = Force × Distance × sin(90°) = Force × Distance (when angle = 0)
        // When lever rotates, we use cos(angle) to account for reduced effective force

        const loadTorque = loadWeight * loadDistance * Math.cos(leverAngle);
        const effortTorque =
          effortForce * effortDistance * Math.cos(leverAngle);

        // Net torque determines rotation direction
        // Positive = counter-clockwise (effort winning)
        // Negative = clockwise (load winning)
        const netTorque = effortTorque - loadTorque;

        // Calculate mechanical advantage
        // MA = Output Force / Input Force = Effort Distance / Load Distance
        const mechanicalAdvantage = effortDistance / loadDistance;

        return {
          loadDistance: loadDistance,
          effortDistance: effortDistance,
          loadTorque,
          effortTorque,
          netTorque,
          mechanicalAdvantage,
          loadPos,
          effortPos,
          fulcrumPos,
        };
      }

      // Physics Animation - REALISTIC for all lever types
      function animatePhysics() {
        const physics = calculateRealPhysics();

        // Realistic physics parameters for all lever types
        const momentOfInertia = 1000; // Constant moment of inertia
        const damping = 0.92; // Consistent damping for all types

        // Angular acceleration = Net Torque / Moment of Inertia
        const angularAcceleration = physics.netTorque / momentOfInertia;

        // Update lever angle
        leverAngle += angularAcceleration * 0.02;

        // Apply damping
        leverAngle *= damping;

        // Angle limits - realistic range
        const maxAngle = Math.PI / 4; // 45 degrees maximum
        if (Math.abs(leverAngle) > maxAngle) {
          leverAngle = maxAngle * Math.sign(leverAngle);
        }

        // Balance detection
        const balanceThreshold = 2;
        if (
          Math.abs(physics.netTorque) < balanceThreshold &&
          Math.abs(leverAngle) < 0.01
        ) {
          // Gradually settle to perfect balance
          leverAngle *= 0.9;
        }

        // Continue animation
        if (isAnimating) {
          animationId = requestAnimationFrame(animatePhysics);
        }

        updateSimulation();
      }

      // Draw Simulation
      function drawSimulation() {
        // Clear canvas with sky background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        skyGradient.addColorStop(0, "#87CEEB");
        skyGradient.addColorStop(1, "#5DADE2");
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw ground
        const groundY = fulcrumY + 150;
        ctx.fillStyle = "#27ae60";
        ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);

        // Draw grass
        ctx.strokeStyle = "#2ecc71";
        ctx.lineWidth = 2;
        for (let x = 0; x < canvasWidth; x += 15) {
          ctx.beginPath();
          ctx.moveTo(x, groundY);
          ctx.quadraticCurveTo(x + 3, groundY - 12, x + 6, groundY);
          ctx.stroke();
        }

        // Save context for rotation
        ctx.save();
        ctx.translate(fulcrumX, fulcrumY);

        // Draw fixed fulcrum
        drawFulcrum();

        // Rotate lever based on physics
        ctx.rotate(leverAngle);

        // Draw lever components
        drawLeverBar();
        drawLoad();
        drawEffort();

        ctx.restore();

        // Update display
        updateDisplayInfo();
      }

      // Draw Fixed Fulcrum
      function drawFulcrum() {
        // Fulcrum base
        ctx.fillStyle = "#3498db";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-20, 50);
        ctx.lineTo(20, 50);
        ctx.closePath();
        ctx.fill();

        // Pivot point
        ctx.fillStyle = "#2980b9";
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("F", 0, 0);
      }

      // Draw Lever Bar
      function drawLeverBar() {
        const barLength = leverLength * 35;

        // Draw wooden lever bar
        ctx.fillStyle = "#f39c12";
        ctx.fillRect(-barLength / 2, -8, barLength, 16);

        // Wood grain lines
        ctx.strokeStyle = "#d35400";
        ctx.lineWidth = 2;
        ctx.strokeRect(-barLength / 2, -8, barLength, 16);

        // Border
        ctx.strokeStyle = "#e67e22";
        ctx.lineWidth = 3;
        ctx.strokeRect(-barLength / 2, -8, barLength, 16);
      }

      // Draw Load
      function drawLoad() {
        const physics = calculateRealPhysics();
        const loadX = physics.loadPos * 35;

        // Calculate load size based on weight
        const loadSize = 20 + (loadWeight / 200) * 60;

        // Load shadow
        const shadowIntensity = Math.min(0.4, loadWeight / 500);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowIntensity})`;
        ctx.fillRect(
          loadX - loadSize / 2 + 3,
          -8 - loadSize + 3,
          loadSize,
          loadSize
        );

        // Load object with gradient based on weight
        const loadGradient = ctx.createLinearGradient(
          loadX - loadSize / 2,
          -8 - loadSize,
          loadX + loadSize / 2,
          -8
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

        // Border
        const borderWidth = loadWeight > 100 ? 4 : 3;
        ctx.strokeStyle = loadWeight > 100 ? "#8b0000" : "#b33939";
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(loadX - loadSize / 2, -8 - loadSize, loadSize, loadSize);

        // Weight label
        ctx.fillStyle = "white";
        const fontSize =
          loadWeight > 100 ? "bold 18px Arial" : "bold 16px Arial";
        ctx.font = fontSize;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${loadWeight}N`, loadX, -8 - loadSize / 2);

        // Load identifier
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 18px Arial";
        ctx.fillText("L", loadX, -8 - loadSize - 25);

        // Connection line
        ctx.strokeStyle = "#e74c3c";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(loadX, -8);
        ctx.lineTo(loadX, -8 - loadSize);
        ctx.stroke();
      }

      // Draw Effort
      function drawEffort() {
        const physics = calculateRealPhysics();
        const effortX = physics.effortPos * 35;

        // Effort size based on force
        const effortSize = 20 + (effortForce / 200) * 50;
        const radius = effortSize / 2;

        // Effort shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.beginPath();
        ctx.arc(effortX + 2, -8 - radius + 2, radius, 0, Math.PI * 2);
        ctx.fill();

        // Effort object with gradient
        const effortGradient = ctx.createRadialGradient(
          effortX,
          -8 - radius,
          radius / 3,
          effortX,
          -8 - radius,
          radius
        );
        effortGradient.addColorStop(0, "#7bed9f");
        effortGradient.addColorStop(0.7, "#2ecc71");
        effortGradient.addColorStop(1, "#27ae60");

        ctx.fillStyle = effortGradient;
        ctx.beginPath();
        ctx.arc(effortX, -8 - radius, radius, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = "#229954";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Effort force label
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${effortForce}N`, effortX, -8 - radius);

        // Effort identifier
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 18px Arial";
        ctx.fillText("E", effortX, -8 - radius - 20);

        // Connection line
        ctx.strokeStyle = "#2ecc71";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(effortX, -8);
        ctx.lineTo(effortX, -8 - radius);
        ctx.stroke();
      }

      // Update Display Information
      function updateDisplayInfo() {
        const physics = calculateRealPhysics();

        // Update physics display
        document.getElementById("maValue").textContent =
          physics.mechanicalAdvantage.toFixed(2);
        document.getElementById(
          "loadTorque"
        ).textContent = `${physics.loadTorque.toFixed(1)} N·m`;
        document.getElementById(
          "effortTorque"
        ).textContent = `${physics.effortTorque.toFixed(1)} N·m`;
        document.getElementById(
          "netTorque"
        ).textContent = `${physics.netTorque.toFixed(1)} N·m`;

        // Update info box
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

        // Lever state determination
        let stateText, statusText, statusColor;

        if (Math.abs(physics.netTorque) < 2) {
          stateText = "Balanced ⚖️";
          statusText = "Lever is balanced - no movement";
          statusColor = "#27ae60";
        } else if (physics.netTorque > 0) {
          stateText = "Effort Winning ↗️";
          statusText = `Effort is stronger (${physics.netTorque.toFixed(
            1
          )} N·m torque)`;
          statusColor = "#3498db";
        } else {
          stateText = "Load Winning ↘️";
          statusText = `Load is heavier (${Math.abs(physics.netTorque).toFixed(
            1
          )} N·m torque)`;
          statusColor = "#e74c3c";
        }

        document.getElementById("leverState").textContent = stateText;

        // Update status display
        const statusDisplay = document.getElementById("statusDisplay");
        statusDisplay.textContent = statusText;
        statusDisplay.style.background = statusColor;
        statusDisplay.style.border = "2px solid #ffffff";
        statusDisplay.style.animation = "none";
      }

      // Control Functions
      function changeLeverType(type) {
        leverType = type;

        // Update active button
        document.querySelectorAll(".lever-type-btn").forEach((btn, i) => {
          btn.classList.toggle("active", i === type - 1);
        });

        // Update positions for all lever types
        leverConfigs[1].loadPos = -leverLength / 2 + 1;
        leverConfigs[1].effortPos = leverLength / 2 - 1;
        leverConfigs[1].fulcrumPos = 0;

        leverConfigs[2].fulcrumPos = -leverLength / 2 + 1;
        leverConfigs[2].loadPos = 0;
        leverConfigs[2].effortPos = leverLength / 2 - 1;

        leverConfigs[3].fulcrumPos = -leverLength / 2 + 1;
        leverConfigs[3].effortPos = 0;
        leverConfigs[3].loadPos = leverLength / 2 - 1;

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

        // Update positions for all lever types
        leverConfigs[1].loadPos = -leverLength / 2 + 1;
        leverConfigs[1].effortPos = leverLength / 2 - 1;
        leverConfigs[1].fulcrumPos = 0;

        leverConfigs[2].fulcrumPos = -leverLength / 2 + 1;
        leverConfigs[2].loadPos = 0;
        leverConfigs[2].effortPos = leverLength / 2 - 1;

        leverConfigs[3].fulcrumPos = -leverLength / 2 + 1;
        leverConfigs[3].effortPos = 0;
        leverConfigs[3].loadPos = leverLength / 2 - 1;

        updateSimulation();
      }

      function resetSimulation() {
        // Reset to balanced state
        loadWeight = 50;
        effortForce = 50;
        leverLength = 8;
        leverAngle = 0;

        // Reset sliders
        document.getElementById("loadWeight").value = 50;
        document.getElementById("effortForce").value = 50;
        document.getElementById("leverLength").value = 8;

        document.getElementById("loadWeightValue").textContent = "50 N";
        document.getElementById("effortForceValue").textContent = "50 N";
        document.getElementById("leverLengthValue").textContent = "8 m";

        // Update positions
        leverConfigs[1].loadPos = -leverLength / 2 + 1;
        leverConfigs[1].effortPos = leverLength / 2 - 1;
        leverConfigs[1].fulcrumPos = 0;

        leverConfigs[2].fulcrumPos = -leverLength / 2 + 1;
        leverConfigs[2].loadPos = 0;
        leverConfigs[2].effortPos = leverLength / 2 - 1;

        leverConfigs[3].fulcrumPos = -leverLength / 2 + 1;
        leverConfigs[3].effortPos = 0;
        leverConfigs[3].loadPos = leverLength / 2 - 1;

        updateSimulation();
      }

      function autoBalance() {
        // Calculate required effort to balance current load
        const physics = calculateRealPhysics();

        // For balance: Load × Load Arm = Effort × Effort Arm
        const requiredEffort =
          (loadWeight * physics.loadDistance) / physics.effortDistance;

        // Set to required effort
        effortForce = Math.max(1, Math.min(200, Math.round(requiredEffort)));
        document.getElementById("effortForce").value = effortForce;
        document.getElementById(
          "effortForceValue"
        ).textContent = `${effortForce} N`;

        // The physics system will now balance automatically
        updateSimulation();
      }

      // Main Update Function
      function updateSimulation() {
        drawSimulation();
      }

      // Initialize
      window.addEventListener("load", () => {
        initSimulation();
        window.addEventListener("resize", initSimulation);
      });