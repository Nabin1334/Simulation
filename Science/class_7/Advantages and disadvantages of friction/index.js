
      // Canvas setup
      const canvas = document.getElementById("frictionCanvas");
      const ctx = canvas.getContext("2d");

      // Physics constants
      const g = 9.8; // m/s²
      const theta = (20 * Math.PI) / 180; // 20° incline in radians
      const mass = 5; // kg
      const dt = 0.016; // Time step (60 FPS)

      // Simulation variables
      let frictionCoefficient = 0.3;
      let surfaceType = "wood";
      let boxPosition = 150;
      let velocity = 0;
      let isMoving = false;
      let distanceTraveled = 0;
      let lastPosition = 150;
      let staticFrictionBroken = false;

      // Physics calculations
      function calculateForces() {
        // Normal force
        const normalForce = mass * g * Math.cos(theta);

        // Gravity component parallel to incline
        const gravityParallel = mass * g * Math.sin(theta);

        // Maximum static friction
        const maxStaticFriction = frictionCoefficient * normalForce;

        // Static friction (before movement)
        let staticFriction = 0;
        if (!isMoving && !staticFrictionBroken) {
          // Static friction equals gravity component to prevent movement
          staticFriction = Math.min(gravityParallel, maxStaticFriction);
        }

        // Kinetic friction (during movement)
        const kineticFriction = frictionCoefficient * normalForce;

        // Net force
        let netForce = 0;
        if (!isMoving && !staticFrictionBroken) {
          // No net force when static friction holds
          netForce = 0;
        } else {
          // During movement, friction opposes motion
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
        const forces = calculateForces();

        // Check if applied force breaks static friction
        if (!isMoving && !staticFrictionBroken) {
          if (force > forces.maxStaticFriction - forces.gravityParallel) {
            staticFrictionBroken = true;
            isMoving = true;
            // Apply excess force to accelerate
            const excessForce =
              force + forces.gravityParallel - forces.maxStaticFriction;
            velocity += (excessForce / mass) * dt * 10;
          }
        } else {
          // Already moving, add force
          velocity += (force / mass) * dt * 10;
          isMoving = true;
        }
      }

      function updatePhysics() {
        const forces = calculateForces();

        if (isMoving || staticFrictionBroken) {
          // Update velocity: v = v0 + a·dt, where a = F_net / m
          const acceleration = forces.netForce / mass;
          velocity += acceleration * dt;

          // Update position
          boxPosition += velocity * 50; // Scale for visualization

          // Calculate distance
          distanceTraveled += Math.abs(boxPosition - lastPosition) / 50;
          lastPosition = boxPosition;

          // Stop if velocity becomes very small
          if (Math.abs(velocity) < 0.01 && Math.abs(forces.netForce) < 0.1) {
            velocity = 0;
            isMoving = false;
            staticFrictionBroken = false;
          }
        }

        // Boundary constraints
        if (boxPosition < 100) {
          boxPosition = 100;
          velocity = Math.abs(velocity) * 0.3; // Inelastic collision
        }

        if (boxPosition > canvas.width - 100) {
          boxPosition = canvas.width - 100;
          velocity = -Math.abs(velocity) * 0.3; // Inelastic collision
        }

        // Update display
        document.getElementById("velocityValue").textContent =
          Math.abs(velocity).toFixed(2);
        document.getElementById("distanceValue").textContent =
          distanceTraveled.toFixed(2);
        document.getElementById("frictionForceValue").textContent = (
          isMoving ? forces.kineticFriction : forces.staticFriction
        ).toFixed(1);
        document.getElementById("netForceValue").textContent =
          forces.netForce.toFixed(1);
      }

      function drawScene() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#e3f2fd");
        gradient.addColorStop(1, "#f3e5f5");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw incline plane
        ctx.save();

        const inclineHeight = canvas.height - 100;
        const inclineEndY =
          inclineHeight - (canvas.width - 200) * Math.tan(theta);

        // Incline surface
        ctx.beginPath();
        ctx.moveTo(100, inclineHeight);
        ctx.lineTo(canvas.width - 100, inclineEndY);
        ctx.lineTo(canvas.width - 100, canvas.height);
        ctx.lineTo(100, canvas.height);
        ctx.closePath();

        // Surface color based on type
        let surfaceColor;
        switch (surfaceType) {
          case "ice":
            surfaceColor = "#e3f2fd";
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

        // Surface texture
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width - 200; i += 20) {
          const x = 100 + i;
          const y = inclineHeight - i * Math.tan(theta);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 10, y - 10 * Math.tan(theta));
          ctx.stroke();
        }

        // Draw angle indicator
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(150, inclineHeight - 50);
        ctx.lineTo(150, inclineHeight);
        ctx.lineTo(250, inclineHeight);
        ctx.stroke();

        // Angle arc
        ctx.beginPath();
        ctx.arc(150, inclineHeight, 40, 0, -theta, true);
        ctx.stroke();

        // Angle label
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 16px Arial";
        ctx.fillText("θ = 20°", 180, inclineHeight - 60);

        // Surface label
        ctx.fillStyle = "#2c3e50";
        ctx.font = "18px Arial";
        ctx.fillText(
          `${
            surfaceType.charAt(0).toUpperCase() + surfaceType.slice(1)
          } Surface`,
          canvas.width / 2 - 60,
          inclineEndY + 40
        );
        ctx.font = "14px Arial";
        ctx.fillText(
          `μ = ${frictionCoefficient.toFixed(2)}`,
          canvas.width / 2 - 30,
          inclineEndY + 60
        );

        ctx.restore();

        // Draw box
        const boxY = inclineHeight - (boxPosition - 100) * Math.tan(theta) - 30;

        ctx.fillStyle = isMoving ? "#e74c3c" : "#3498db";
        ctx.fillRect(boxPosition - 30, boxY - 30, 60, 60);

        // Box border
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 2;
        ctx.strokeRect(boxPosition - 30, boxY - 30, 60, 60);

        // Box label
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("5 kg", boxPosition, boxY);

        // Draw force vectors if moving
        if (isMoving) {
          // Velocity vector
          ctx.strokeStyle = "#e74c3c";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(boxPosition, boxY);
          ctx.lineTo(boxPosition + velocity * 20, boxY);
          ctx.stroke();

          // Arrow head
          ctx.beginPath();
          ctx.moveTo(boxPosition + velocity * 20, boxY);
          ctx.lineTo(boxPosition + velocity * 20 - 8, boxY - 5);
          ctx.lineTo(boxPosition + velocity * 20 - 8, boxY + 5);
          ctx.closePath();
          ctx.fillStyle = "#e74c3c";
          ctx.fill();
        }

        // Draw physics info
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillText(
          "Real Physics: Box remains stationary until force exceeds static friction",
          20,
          30
        );
      }

      function animate() {
        updatePhysics();
        drawScene();
        requestAnimationFrame(animate);
      }

      // Initialize simulation
      animate();

      // Event Listeners
      const frictionSlider = document.getElementById("frictionSlider");
      const frictionValue = document.getElementById("frictionValue");

      frictionSlider.addEventListener("input", function () {
        frictionCoefficient = parseInt(this.value) / 100;
        frictionValue.textContent = frictionCoefficient.toFixed(2);
      });

      const surfaceButtons = document.querySelectorAll(".surface-btn");
      surfaceButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
          surfaceButtons.forEach((b) => b.classList.remove("active"));
          this.classList.add("active");

          surfaceType = this.dataset.surface;
          const newFriction = parseInt(this.dataset.friction) / 100;
          frictionCoefficient = newFriction;
          frictionSlider.value = this.dataset.friction;
          frictionValue.textContent = newFriction.toFixed(2);
        });
      });

      // Applied force controls
      let appliedForce = 10;
      const appliedForceInput = document.getElementById("appliedForceInput");
      const appliedForceValue = document.getElementById("appliedForceValue");
      const increaseForceBtn = document.getElementById("increaseForceBtn");
      const decreaseForceBtn = document.getElementById("decreaseForceBtn");

      function updateAppliedForceDisplay() {
        // keep appliedForce non-negative integer
        appliedForce = Math.max(
          0,
          Math.round(Number(appliedForceInput.value) || 0)
        );
        appliedForceInput.value = appliedForce;
        appliedForceValue.textContent = appliedForce;
      }

      increaseForceBtn.addEventListener("click", function () {
        appliedForce += 1;
        appliedForceInput.value = appliedForce;
        updateAppliedForceDisplay();
      });

      decreaseForceBtn.addEventListener("click", function () {
        appliedForce = Math.max(0, appliedForce - 1);
        appliedForceInput.value = appliedForce;
        updateAppliedForceDisplay();
      });

      appliedForceInput.addEventListener("input", updateAppliedForceDisplay);
      appliedForceInput.addEventListener("change", updateAppliedForceDisplay);

      document
        .getElementById("applyForceBtn")
        .addEventListener("click", function () {
          applyExternalForce(appliedForce);
        });

      document
        .getElementById("resetBtn")
        .addEventListener("click", function () {
          boxPosition = 150;
          velocity = 0;
          isMoving = false;
          staticFrictionBroken = false;
          distanceTraveled = 0;
          lastPosition = 150;
        });

      // Add keyboard shortcut
      document.addEventListener("keydown", function (e) {
        if (e.key === " ") {
          applyExternalForce(appliedForce);
          e.preventDefault();
        } else if (e.key === "r" || e.key === "R") {
          boxPosition = 150;
          velocity = 0;
          isMoving = false;
          staticFrictionBroken = false;
          distanceTraveled = 0;
          lastPosition = 150;
        } else if (e.key === "ArrowUp") {
          // increase applied force
          appliedForce += 1;
          appliedForceInput.value = appliedForce;
          updateAppliedForceDisplay();
        } else if (e.key === "ArrowDown") {
          appliedForce = Math.max(0, appliedForce - 1);
          appliedForceInput.value = appliedForce;
          updateAppliedForceDisplay();
        }
      });