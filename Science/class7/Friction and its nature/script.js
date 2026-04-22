
      // Physics Simulation - Friction on an Inclined Plane
      document.addEventListener("DOMContentLoaded", function () {
        // Get canvas and context
        const canvas = document.getElementById("physicsCanvas");
        const ctx = canvas.getContext("2d");

        // DPR-aware canvas resize for crisp rendering on high-DPI displays
        function resizeCanvas() {
          const dpr = window.devicePixelRatio || 1;
          const w = canvas.parentElement.clientWidth;
          const h = canvas.parentElement.clientHeight;
          // keep CSS size and set internal pixel size multiplied by dpr
          canvas.style.width = w + "px";
          canvas.style.height = h + "px";
          canvas.width = Math.max(1, Math.floor(w * dpr));
          canvas.height = Math.max(1, Math.floor(h * dpr));
          // scale drawing operations to account for DPR
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        // Set initial size
        resizeCanvas();

        // Physics constants
        const PHYSICS = {
          mass: 10, // kg
          gravity: 9.8, // m/s²
          boxSize: 70, // Increased box size for better visibility
          timeStep: 0.016, // seconds per frame (60 FPS)
          velocityScale: 2.5, // Increased for better visualization
          initialBoxX: 120, // Initial box position - moved backward (left)
        };

        // Surface properties (friction coefficients)
        const SURFACES = {
          ice: {
            name: "Ice",
            color: "#b3e5fc",
            staticFriction: 0.1,
            kineticFriction: 0.05,
            description: "Very slippery surface",
          },
          wood: {
            name: "Wood",
            color: "#8B4513",
            staticFriction: 0.4,
            kineticFriction: 0.3,
            description: "Moderate friction surface",
          },
          concrete: {
            name: "Concrete",
            color: "#9e9e9e",
            staticFriction: 0.7,
            kineticFriction: 0.6,
            description: "High friction surface",
          },
          rubber: {
            name: "Rubber",
            color: "#2d3436",
            staticFriction: 1.0,
            kineticFriction: 0.8,
            description: "Very high friction surface",
          },
        };

        // Simulation state
        let state = {
          surfaceAngle: 0, // degrees
          currentSurface: SURFACES.ice,
          boxX: PHYSICS.initialBoxX,
          velocity: 0,
          acceleration: 0,
          isMoving: false,
          animationId: null,
          wasMoving: false, // Track if box was moving on previous frame
        };

        // UI Elements
        const angleSlider = document.getElementById("angleSlider");
        const angleValue = document.getElementById("angleValue");
        const currentAngle = document.getElementById("currentAngle");
        const boxStatus = document.getElementById("boxStatus");
        const criticalAngleValue =
          document.getElementById("criticalAngleValue");
        const normalForce = document.getElementById("normalForce");
        const parallelForce = document.getElementById("parallelForce");
        const frictionForceValue =
          document.getElementById("frictionForceValue");
        const maxStaticFriction = document.getElementById("maxStaticFriction");
        const netForce = document.getElementById("netForce");
        const velocityValue = document.getElementById("velocityValue");
        const accelerationValue = document.getElementById("accelerationValue");

        // Initialize UI
        updateUI();

        // Calculate all physics forces
        function calculateForces() {
          const angleRad = (state.surfaceAngle * Math.PI) / 180;

          // Weight force
          const weight = PHYSICS.mass * PHYSICS.gravity;

          // Normal force
          const normal = weight * Math.cos(angleRad);

          // Parallel (downhill) force
          const parallel = weight * Math.sin(angleRad);

          // Friction force (depends on whether box is moving)
          const frictionCoeff = state.isMoving
            ? state.currentSurface.kineticFriction
            : state.currentSurface.staticFriction;

          const friction = frictionCoeff * normal;

          // Max static friction (for comparison)
          const maxStatic = state.currentSurface.staticFriction * normal;

          // Net force
          let net = 0;
          if (state.isMoving) {
            net = parallel - friction;
          } else {
            // When not moving, friction matches parallel force up to max static friction
            net = 0;
          }

          // Compute critical angle from static friction (degrees)
          const criticalAngleDeg =
            (Math.atan(state.currentSurface.staticFriction) * 180) / Math.PI;

          return {
            weight: weight,
            normal: normal,
            parallel: parallel,
            friction: friction,
            maxStatic: maxStatic,
            net: net,
            criticalAngle: criticalAngleDeg,
          };
        }

        // Helper to set angle with clamping to slider max (45°)
        function setAngle(angle) {
          const maxAngle = parseFloat(angleSlider.max) || 45;
          const minAngle = parseFloat(angleSlider.min) || 0;
          const clamped = Math.min(Math.max(angle, minAngle), maxAngle);
          state.surfaceAngle = clamped;
          angleSlider.value = clamped;
          updateUI();
          checkForSlide();
          if (!state.isMoving) drawScene();
        }

        // Check if box should start moving based on current angle
        function checkForSlide() {
          const forces = calculateForces();

          // Box should start moving if parallel force exceeds max static friction
          // AND we're not already moving
          if (!state.isMoving && forces.parallel > forces.maxStatic) {
            state.isMoving = true;
            // Start animation if not already running
            if (!state.animationId) {
              state.animationId = requestAnimationFrame(updatePhysics);
            }
          }
          // Box should stop if parallel force is less than or equal to friction
          // This can happen if angle is reduced while box is moving
          else if (
            state.isMoving &&
            forces.parallel <= forces.friction &&
            state.velocity < 0.1
          ) {
            state.isMoving = false;
            state.velocity = 0;
            state.acceleration = 0;
          }
        }

        // Update physics simulation
        function updatePhysics() {
          const forces = calculateForces();
          const angleRad = (state.surfaceAngle * Math.PI) / 180;

          // Update motion if box is sliding
          if (state.isMoving) {
            // Acceleration = F_net / mass
            state.acceleration = forces.net / PHYSICS.mass;

            // Update velocity
            state.velocity += state.acceleration * PHYSICS.timeStep;

            // Ensure velocity doesn't go negative
            if (state.velocity < 0) state.velocity = 0;

            // Update position (convert m/s to pixels)
            state.boxX +=
              state.velocity * PHYSICS.velocityScale * Math.cos(angleRad);

            // Stop at bottom of incline
            const inclineLength = canvas.width * 0.7;
            if (state.boxX > inclineLength) {
              state.boxX = inclineLength;
              state.velocity = 0;
              state.acceleration = 0;
              state.isMoving = false;
            }
          }

          // Update UI with current values
          updateUI();

          // Draw the scene
          drawScene();

          // Continue animation if box is moving
          if (state.isMoving) {
            state.animationId = requestAnimationFrame(updatePhysics);
          } else {
            state.animationId = null;
          }

          // Track if box was moving
          state.wasMoving = state.isMoving;
        }

        // Draw the entire scene
        function drawScene() {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw sky
          drawSky();

          // Draw surface - positioned higher up
          drawSurface();

          // Draw box
          drawBox();

          // Draw forces (disabled - arrows removed from canvas)
          // drawForces();

          // Draw angle indicator
          drawAngleIndicator();

          // Draw physics info (disabled - removed from screen as unnecessary)
          // drawPhysicsInfo();
        }

        // Draw sky background
        function drawSky() {
          // Sky gradient
          const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          skyGradient.addColorStop(0, "#87CEEB");
          skyGradient.addColorStop(0.5, "#E0F7FA");
          skyGradient.addColorStop(1, "#B2EBF2");

          ctx.fillStyle = skyGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw sun
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(canvas.width - 80, 70, 40, 0, Math.PI * 2);
          ctx.fill();

          // Draw clouds - positioned higher
          drawCloud(150, 60, 45);
          drawCloud(400, 40, 55);
          drawCloud(650, 70, 50);
        }

        // Helper to draw a cloud
        function drawCloud(x, y, size) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
          ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.35, 0, Math.PI * 2);
          ctx.arc(x + size * 0.6, y, size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw the inclined surface - positioned higher up
        function drawSurface() {
          const angleRad = (state.surfaceAngle * Math.PI) / 180;
          const startX = 50;
          const startY = canvas.height * 0.35; // Moved higher up
          const endX = canvas.width * 0.85;
          const endY = startY + (endX - startX) * Math.tan(angleRad);

          // Draw surface
          ctx.fillStyle = state.currentSurface.color;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineTo(endX, canvas.height);
          ctx.lineTo(startX, canvas.height);
          ctx.closePath();
          ctx.fill();

          // Draw surface border
          ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Draw texture on surface
          ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
          for (let x = startX; x < endX; x += 30) {
            const y = startY + (x - startX) * Math.tan(angleRad);
            ctx.fillRect(x, y, 20, 5);
          }

          // Draw surface label
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(endX + 10, startY, 150, 35);
          ctx.fillStyle = "white";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "left";
          ctx.fillText(state.currentSurface.name, endX + 20, startY + 23);
        }

        // Draw the box on the surface
        function drawBox() {
          const angleRad = (state.surfaceAngle * Math.PI) / 180;
          const startX = 50;
          const startY = canvas.height * 0.35; // Same as surface startY

          // Calculate box position along the incline
          const boxCenterX = state.boxX;
          const boxCenterY =
            startY +
            (state.boxX - startX) * Math.tan(angleRad) -
            PHYSICS.boxSize / 2;

          // Save context state for rotation
          ctx.save();

          // Translate to box center and rotate
          ctx.translate(boxCenterX, boxCenterY);
          ctx.rotate(angleRad);

          // Draw box shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          ctx.fillRect(
            -PHYSICS.boxSize / 2 + 8,
            -PHYSICS.boxSize / 2 + 8,
            PHYSICS.boxSize,
            PHYSICS.boxSize
          );

          // Draw box with better gradient
          const boxGradient = ctx.createLinearGradient(
            -PHYSICS.boxSize / 2,
            -PHYSICS.boxSize / 2,
            PHYSICS.boxSize / 2,
            PHYSICS.boxSize / 2
          );
          boxGradient.addColorStop(0, "#FF5252");
          boxGradient.addColorStop(0.5, "#FF6B6B");
          boxGradient.addColorStop(1, "#FF5252");

          ctx.fillStyle = boxGradient;
          ctx.fillRect(
            -PHYSICS.boxSize / 2,
            -PHYSICS.boxSize / 2,
            PHYSICS.boxSize,
            PHYSICS.boxSize
          );

          // Draw box border
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 4;
          ctx.strokeRect(
            -PHYSICS.boxSize / 2,
            -PHYSICS.boxSize / 2,
            PHYSICS.boxSize,
            PHYSICS.boxSize
          );

          // Draw mass label
          ctx.fillStyle = "#fff";
          ctx.font = "bold 20px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("10 kg", 0, 0);

          // Draw face expression based on motion
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 3;

          // Eyes
          ctx.beginPath();
          ctx.arc(-18, -12, 6, 0, Math.PI * 2);
          ctx.arc(18, -12, 6, 0, Math.PI * 2);
          ctx.fill();

          // Mouth
          ctx.beginPath();
          if (state.isMoving) {
            // Surprised mouth (circle) when sliding
            ctx.arc(0, 15, 10, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // Smile when stationary
            ctx.arc(0, 15, 12, 0.2, Math.PI - 0.2);
            ctx.stroke();
          }

          // Restore context
          ctx.restore();
        }

        // Draw force vectors with better visibility
        function drawForces() {
          const forces = calculateForces();
          const angleRad = (state.surfaceAngle * Math.PI) / 180;
          const startX = 50;
          const startY = canvas.height * 0.35; // Same as surface startY

          // Box center position
          const boxCenterX = state.boxX;
          const boxCenterY =
            startY +
            (state.boxX - startX) * Math.tan(angleRad) -
            PHYSICS.boxSize / 2;

          // Scale factor for force visualization
          const forceScale = 0.3; // Increased for better visibility

          // Weight force (yellow, straight down)
          drawArrow(
            boxCenterX,
            boxCenterY,
            boxCenterX,
            boxCenterY + forces.weight * forceScale,
            "#FFD700",
            "Weight",
            forces.weight.toFixed(1) + " N",
            5
          );

          // Normal force (blue, perpendicular to surface)
          const normalX = -Math.sin(angleRad) * forces.normal * forceScale;
          const normalY = -Math.cos(angleRad) * forces.normal * forceScale;
          drawArrow(
            boxCenterX,
            boxCenterY,
            boxCenterX + normalX,
            boxCenterY + normalY,
            "#3498db",
            "Normal",
            forces.normal.toFixed(1) + " N",
            5
          );

          // Parallel force (red, down the incline)
          const parallelX = Math.cos(angleRad) * forces.parallel * forceScale;
          const parallelY = Math.sin(angleRad) * forces.parallel * forceScale;
          drawArrow(
            boxCenterX,
            boxCenterY,
            boxCenterX + parallelX,
            boxCenterY + parallelY,
            "#e74c3c",
            "F∥",
            forces.parallel.toFixed(1) + " N",
            6
          );

          // Friction force (green, up the incline)
          const frictionX = -Math.cos(angleRad) * forces.friction * forceScale;
          const frictionY = -Math.sin(angleRad) * forces.friction * forceScale;
          // Use a generic label to avoid showing 'Static Friction' on-screen
          const frictionType = "Friction";
          drawArrow(
            boxCenterX,
            boxCenterY,
            boxCenterX + frictionX,
            boxCenterY + frictionY,
            "#2ecc71",
            frictionType,
            forces.friction.toFixed(1) + " N",
            6
          );
        }

        // Helper to draw an arrow
        function drawArrow(
          fromX,
          fromY,
          toX,
          toY,
          color,
          label,
          value,
          lineWidth
        ) {
          const headLength = 18;
          const angle = Math.atan2(toY - fromY, toX - fromX);

          // Draw line
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.stroke();

          // Draw arrowhead
          ctx.beginPath();
          ctx.moveTo(toX, toY);
          ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();

          // Labels removed to reduce on-canvas clutter (values shown in side data cards)
        }

        // Draw angle indicator
        function drawAngleIndicator() {
          const centerX = 120;
          const centerY = canvas.height * 0.35; // Same as surface startY
          const radius = 70;
          const angleRad = (state.surfaceAngle * Math.PI) / 180;

          // Yellow lines removed to clean up canvas
          // // Draw arc
          // ctx.strokeStyle = "#FFD700";
          // ctx.lineWidth = 4;
          // ctx.beginPath();
          // ctx.arc(centerX, centerY, radius, 0, angleRad);
          // ctx.stroke();
          //
          // // Draw horizontal line
          // ctx.beginPath();
          // ctx.moveTo(centerX, centerY);
          // ctx.lineTo(centerX + radius, centerY);
          // ctx.stroke();
          //
          // // Draw angle line
          // ctx.beginPath();
          // ctx.moveTo(centerX, centerY);
          // ctx.lineTo(
          //   centerX + Math.cos(angleRad) * radius,
          //   centerY + Math.sin(angleRad) * radius
          // );
          // ctx.stroke();

          // Draw angle text with background
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(centerX - 60, centerY + radius + 15, 120, 40);

          ctx.fillStyle = "#FFD700";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            "θ = " + state.surfaceAngle.toFixed(1) + "°",
            centerX,
            centerY + radius + 40
          );
        }

        // Draw physics info
        function drawPhysicsInfo() {
          // Disabled: physics info panel drawing suppressed to keep canvas clean
          return;
          const forces = calculateForces();

          // Draw info box
          ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
          ctx.fillRect(20, 20, 350, 140);

          ctx.fillStyle = "#FFD700";
          ctx.font = "bold 18px Arial";
          ctx.textAlign = "left";
          ctx.fillText("Surface: " + state.currentSurface.name, 35, 45);

          ctx.fillStyle = "white";
          ctx.font = "14px Arial";
          // Static friction numeric removed from canvas display
          ctx.fillText(
            "Kinetic friction (μₖ): " + state.currentSurface.kineticFriction,
            35,
            90
          );
          ctx.fillText(
            "Critical angle: " + forces.criticalAngle.toFixed(1) + "°",
            35,
            110
          );

          ctx.font = "bold 16px Arial";
          ctx.fillText("F∥: " + forces.parallel.toFixed(1) + " N", 35, 135);
          ctx.fillText(
            "F_friction: " + forces.friction.toFixed(1) + " N",
            200,
            135
          );

          if (forces.parallel > forces.maxStaticFriction) {
            ctx.fillStyle = "#FF6B6B";
            ctx.fillText("⚠️ WILL SLIDE!", 280, 45);
          } else {
            ctx.fillStyle = "#4CAF50";
            ctx.fillText("✓ HELD", 280, 45);
          }
        }

        // Update all UI elements with current values
        function updateUI() {
          const forces = calculateForces();

          // Update angle display
          angleValue.textContent = state.surfaceAngle.toFixed(1) + "°";
          currentAngle.textContent = state.surfaceAngle.toFixed(1) + "°";

          // Update critical angle in status area
          criticalAngleValue.textContent =
            forces.criticalAngle.toFixed(1) + "°";

          // Update force values
          normalForce.textContent = forces.normal.toFixed(1) + " N";
          parallelForce.textContent = forces.parallel.toFixed(1) + " N";
          frictionForceValue.textContent = forces.friction.toFixed(1) + " N";
          maxStaticFriction.textContent = forces.maxStatic.toFixed(1) + " N";
          netForce.textContent = forces.net.toFixed(1) + " N";
          velocityValue.textContent = state.velocity.toFixed(2) + " m/s";
          accelerationValue.textContent =
            state.acceleration.toFixed(2) + " m/s²";

          // Update box status
          let statusText = "HELD";
          let statusClass = "status-held";
          let statusDetail = "Static";

          if (state.isMoving) {
            statusText = "SLIDING!";
            statusClass = "status-sliding";
            statusDetail = "Kinetic";
          } else if (forces.parallel > forces.maxStatic) {
            statusText = "READY TO SLIDE";
            statusClass = "status-critical";
            statusDetail = "Unstable";
          }

          boxStatus.innerHTML = `${statusText} <span class="status-indicator ${statusClass}">${statusDetail}</span>`;
        }

        // Reset simulation to initial state
        function resetSimulation() {
          state.boxX = PHYSICS.initialBoxX;
          state.velocity = 0;
          state.acceleration = 0;
          state.isMoving = false;

          if (state.animationId) {
            cancelAnimationFrame(state.animationId);
            state.animationId = null;
          }

          updateUI();
          drawScene();
        }

        // Event Listeners

        // Angle slider
        angleSlider.addEventListener("input", function () {
          setAngle(parseFloat(this.value));
        });

        // Angle slider change (when released)
        angleSlider.addEventListener("change", function () {
          // Check again after slider is released
          checkForSlide();
        });

        // Angle preset buttons
        document.querySelectorAll(".angle-preset").forEach((btn) => {
          btn.addEventListener("click", function () {
            // Update active state
            document
              .querySelectorAll(".angle-preset")
              .forEach((b) => b.classList.remove("active"));
            this.classList.add("active");

            // Set angle (clamped)
            const angle = parseFloat(this.getAttribute("data-angle"));
            setAngle(angle);
          });
        });

        // Surface material buttons
        document.querySelectorAll(".surface-btn").forEach((btn) => {
          btn.addEventListener("click", function () {
            // Update active state
            document
              .querySelectorAll(".surface-btn")
              .forEach((b) => b.classList.remove("active"));
            this.classList.add("active");

            // Set surface
            const surfaceType = this.getAttribute("data-surface");
            state.currentSurface = SURFACES[surfaceType];

            // Reset simulation when changing surface
            resetSimulation();
          });
        });

        // Reset button
        document
          .getElementById("resetBtn")
          .addEventListener("click", resetSimulation);

        // Handle window resize
        window.addEventListener("resize", function () {
          resizeCanvas();
          // Reset simulation to avoid mis-positioning during layout changes
          resetSimulation();
          drawScene();
        });

        // Initial draw
        drawScene();

        // Start animation loop for continuous checking
        function animationLoop() {
          // Check if we need to start/stop sliding
          checkForSlide();

          // If box is moving, updatePhysics will handle the animation
          // If not, we still need to redraw occasionally for UI updates
          if (!state.isMoving && !state.animationId) {
            updateUI();
            drawScene();
          }

          // Continue loop
          requestAnimationFrame(animationLoop);
        }

        // Start the animation loop
        animationLoop();
      });