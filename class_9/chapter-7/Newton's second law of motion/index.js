
      // ========================
      // REAL PHYSICS SIMULATION
      // ========================

      const canvas = document.getElementById("simCanvas");
      const ctx = canvas.getContext("2d");

      // Get DOM Elements
      const elements = {
        force: {
          input: document.getElementById("input-force"),
          display: document.getElementById("disp-force"),
        },
        mass: {
          input: document.getElementById("input-mass"),
          display: document.getElementById("disp-mass"),
        },
        friction: {
          input: document.getElementById("input-friction"),
          display: document.getElementById("disp-friction"),
        },
        outputs: {
          acc: document.getElementById("out-acc"),
          vel: document.getElementById("out-vel"),
          dist: document.getElementById("out-dist"),
          time: document.getElementById("out-time"),
        },
        formula: document.getElementById("formula-display"),
        buttons: {
          push: document.getElementById("btn-push"),
          reset: document.getElementById("btn-reset"),
        },
      };

      // ========================
      // PHYSICS STATE
      // ========================
      const state = {
        // Core physics
        x: 100,
        v: 0,
        a: 0,
        mass: 50,
        force: 200,
        friction: 0.3,

        // Simulation settings
        pixelScale: 8,
        groundY: 0,
        isPushing: false,
        totalDistance: 0,
        pushStartTime: 0,
        pushDuration: 0,
        maxPushDuration: 2.5,
        gravity: 9.81,

        // Visual elements
        trailPoints: [],
        particles: [],
        lastUpdateTime: 0,
      };

      // ========================
      // INITIALIZATION
      // ========================
      function init() {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        setupEventListeners();
        updateUI();
        updateFormula();

        requestAnimationFrame(animate);
      }

      function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        state.groundY = canvas.height * 0.75;
      }

      // ========================
      // EVENT HANDLERS
      // ========================
      function setupEventListeners() {
        // Force slider
        elements.force.input.addEventListener("input", (e) => {
          state.force = parseInt(e.target.value);
          elements.force.display.textContent = state.force + " N";
          if (state.isPushing) stopPush();
          updateFormula();
        });

        // Mass slider
        elements.mass.input.addEventListener("input", (e) => {
          state.mass = parseInt(e.target.value);
          elements.mass.display.textContent = state.mass + " kg";
          if (state.isPushing) stopPush();
          updateFormula();
        });

        // Friction slider
        elements.friction.input.addEventListener("input", (e) => {
          state.friction = parseFloat(e.target.value);
          elements.friction.display.textContent =
            state.friction.toFixed(1) + " μ";
          updateFormula();
        });

        // Push button
        elements.buttons.push.addEventListener("click", () => {
          if (!state.isPushing && Math.abs(state.v) < 0.1) {
            startPush();
          }
        });

        // Reset button
        elements.buttons.reset.addEventListener("click", resetSimulation);

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
          if (
            e.code === "Space" &&
            !state.isPushing &&
            Math.abs(state.v) < 0.1
          ) {
            startPush();
            e.preventDefault();
          } else if (e.code === "KeyR") {
            resetSimulation();
            e.preventDefault();
          }
        });
      }

      // ========================
      // REAL PHYSICS CALCULATIONS
      // ========================
      function calculateNetForce() {
        // Normal force = mass × gravity
        const normalForce = state.mass * state.gravity;

        // Friction force = friction coefficient × normal force
        const frictionForce = state.friction * normalForce;

        let netForce = 0;

        if (state.isPushing) {
          // When pushing: Net force = Applied force - Friction
          netForce = state.force - frictionForce;

          // Object won't move if applied force <= static friction
          if (netForce <= 0) {
            netForce = 0;
            if (state.v === 0) {
              return 0; // Won't start moving
            }
          }
        } else {
          // When not pushing: Only friction acts (deceleration)
          if (Math.abs(state.v) > 0.01) {
            netForce = -Math.sign(state.v) * frictionForce;
          } else {
            netForce = 0;
            state.v = 0;
          }
        }

        return netForce;
      }

      function updatePhysics(deltaTime) {
        // Update push duration
        if (state.isPushing) {
          state.pushDuration += deltaTime;
          if (state.pushDuration >= state.maxPushDuration) {
            stopPush();
          }
        }

        // Calculate net force and acceleration
        const netForce = calculateNetForce();
        state.a = netForce / state.mass;

        // Update velocity and position
        state.v += state.a * deltaTime;

        // Stop if velocity is very small
        if (Math.abs(state.v) < 0.05 && !state.isPushing) {
          state.v = 0;
          state.a = 0;
        }

        const dx = state.v * deltaTime * state.pixelScale;
        state.x += dx;
        state.totalDistance += Math.abs(state.v * deltaTime);

        // Add trail points when moving
        if (Math.abs(state.v) > 0.1) {
          const boxSize = getBoxSize();
          state.trailPoints.push({
            x: state.x + boxSize.width / 2,
            y: state.groundY - boxSize.height / 2,
            alpha: 1.0,
            time: Date.now(),
          });

          // Keep only recent points
          const maxAge = 1500;
          state.trailPoints = state.trailPoints.filter(
            (p) => Date.now() - p.time < maxAge
          );

          // Fade trail points
          state.trailPoints.forEach((p) => (p.alpha *= 0.93));
        }

        // Wall collision with friction
        const boxSize = getBoxSize();
        if (state.x + boxSize.width > canvas.width - 30) {
          state.x = canvas.width - boxSize.width - 30;
          state.v = -state.v * 0.3; // Bounce with energy loss

          // Create particles on impact
          createImpactParticles(
            state.x + boxSize.width,
            state.groundY - boxSize.height / 2
          );

          if (state.isPushing) stopPush();
        }

        // Left boundary
        if (state.x < 30) {
          state.x = 30;
          state.v = Math.max(state.v, 0);
        }

        // Update particles
        updateParticles(deltaTime);

        // Update UI
        updateUI();
        updateFormula();
      }

      function getBoxSize() {
        const baseSize = 50;
        const massFactor = state.mass * 0.12;
        return {
          width: baseSize + massFactor,
          height: baseSize + massFactor,
        };
      }

      // ========================
      // SIMULATION CONTROL
      // ========================
      function startPush() {
        state.isPushing = true;
        state.pushStartTime = performance.now();
        state.pushDuration = 0;
        state.trailPoints = [];

        elements.buttons.push.textContent = "PUSHING...";
        elements.buttons.push.classList.add("running");

        createForceParticles();
      }

      function stopPush() {
        state.isPushing = false;
        elements.buttons.push.textContent = "APPLY FORCE";
        elements.buttons.push.classList.remove("running");
      }

      function resetSimulation() {
        state.x = 100;
        state.v = 0;
        state.a = 0;
        state.isPushing = false;
        state.totalDistance = 0;
        state.pushDuration = 0;
        state.trailPoints = [];
        state.particles = [];

        elements.buttons.push.textContent = "APPLY FORCE";
        elements.buttons.push.classList.remove("running");

        updateUI();
        updateFormula();
      }

      // ========================
      // VISUAL EFFECTS
      // ========================
      function createForceParticles() {
        const boxSize = getBoxSize();
        const particleCount = Math.min(Math.floor(state.force / 30), 15);

        for (let i = 0; i < particleCount; i++) {
          state.particles.push({
            x: state.x - 10,
            y: state.groundY - boxSize.height / 2 + Math.random() * 15 - 7.5,
            vx: 2 + Math.random() * 3,
            vy: Math.random() * 2 - 1,
            life: 1.0,
            size: 2 + Math.random() * 3,
            color: "#4CAF50",
          });
        }
      }

      function createImpactParticles(x, y) {
        for (let i = 0; i < 8; i++) {
          state.particles.push({
            x: x,
            y: y,
            vx: -Math.abs(state.v) * 2 * (0.5 + Math.random()),
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            size: 1 + Math.random() * 3,
            color: "#F44336",
          });
        }
      }

      function updateParticles(deltaTime) {
        state.particles = state.particles.filter((particle) => {
          particle.x += particle.vx * deltaTime * 30;
          particle.y += particle.vy * deltaTime * 30;
          particle.vy += 0.2 * deltaTime * 30; // Gravity
          particle.life -= 0.8 * deltaTime;

          return particle.life > 0 && particle.y < canvas.height;
        });
      }

      // ========================
      // UI UPDATES
      // ========================
      function updateUI() {
        elements.outputs.acc.textContent = Math.abs(state.a).toFixed(2);
        elements.outputs.vel.textContent = Math.abs(state.v).toFixed(2);
        elements.outputs.dist.textContent = state.totalDistance.toFixed(1);
        elements.outputs.time.textContent = state.pushDuration.toFixed(1);
      }

      function updateFormula() {
        // Calculate net force for display
        const normalForce = state.mass * state.gravity;
        const frictionForce = state.friction * normalForce;
        const netForce = state.force - frictionForce;
        const acceleration = (netForce > 0 ? netForce / state.mass : 0).toFixed(
          2
        );

        elements.formula.textContent = `a = (${
          state.force
        }N - ${frictionForce.toFixed(1)}N) ÷ ${
          state.mass
        }kg = ${acceleration} m/s²`;
      }

      // ========================
      // RENDERING
      // ========================
      function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw sky
        drawSky();

        // Draw surface
        drawSurface();

        // Draw trail
        drawTrail();

        // Draw object
        drawObject();

        // Draw pusher
        if (state.isPushing) drawPusher();

        // Draw particles
        drawParticles();

        // Draw physics info
        drawPhysicsInfo();
      }

      function drawSky() {
        const gradient = ctx.createLinearGradient(0, 0, 0, state.groundY);
        gradient.addColorStop(0, "#4a90e2");
        gradient.addColorStop(1, "#87CEEB");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, state.groundY);
      }

      function drawSurface() {
        const surfaceHeight = canvas.height - state.groundY;

        // Main surface with friction texture
        const gradient = ctx.createLinearGradient(
          0,
          state.groundY,
          0,
          canvas.height
        );

        if (state.friction < 0.2) {
          // Smooth surface
          gradient.addColorStop(0, "#90A4AE");
          gradient.addColorStop(1, "#B0BEC5");
        } else if (state.friction < 0.5) {
          // Medium surface
          gradient.addColorStop(0, "#78909C");
          gradient.addColorStop(1, "#90A4AE");
        } else {
          // Rough surface
          gradient.addColorStop(0, "#5D4037");
          gradient.addColorStop(1, "#795548");
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, state.groundY, canvas.width, surfaceHeight);

        // Draw surface texture based on friction
        drawSurfaceTexture();

        // Draw distance markers
        drawDistanceMarkers();
      }

      function drawSurfaceTexture() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        const textureSize = state.friction < 0.3 ? 25 : 15;

        for (let x = 0; x < canvas.width; x += textureSize) {
          for (let y = state.groundY; y < canvas.height; y += textureSize) {
            if ((x + y) % (textureSize * 2) === 0) {
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      }

      function drawDistanceMarkers() {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1;
        ctx.fillStyle = "#fff";
        ctx.font = "11px Arial";
        ctx.textAlign = "center";

        for (let i = 0; i <= canvas.width / state.pixelScale; i += 5) {
          const x = i * state.pixelScale;
          const isMajor = i % 10 === 0;

          if (isMajor && i > 0) {
            ctx.beginPath();
            ctx.moveTo(x, state.groundY - 8);
            ctx.lineTo(x, state.groundY);
            ctx.stroke();

            ctx.fillText(i + "m", x, state.groundY - 12);
          }
        }
      }

      function drawTrail() {
        if (state.trailPoints.length < 2) return;

        ctx.strokeStyle = "rgba(33, 150, 243, 0.6)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        for (let i = 1; i < state.trailPoints.length; i++) {
          const prev = state.trailPoints[i - 1];
          const curr = state.trailPoints[i];

          ctx.globalAlpha = curr.alpha;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      function drawObject() {
        const boxSize = getBoxSize();
        const x = state.x;
        const y = state.groundY - boxSize.height;

        // Draw shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(x + 3, y + 3, boxSize.width, boxSize.height);

        // Draw main box
        const gradient = ctx.createLinearGradient(x, y, x, y + boxSize.height);
        gradient.addColorStop(0, "#FF5252");
        gradient.addColorStop(1, "#D32F2F");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, boxSize.width, boxSize.height);

        // Draw border
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxSize.width, boxSize.height);

        // Draw mass label
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.min(18, 14 + state.mass * 0.04)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          state.mass + " kg",
          x + boxSize.width / 2,
          y + boxSize.height / 2
        );

        // Draw force indicator if pushing
        if (state.isPushing) {
          ctx.font = "bold 16px Arial";
          ctx.fillStyle = "#4CAF50";
          ctx.fillText(
            "→ " + state.force + " N",
            x + boxSize.width / 2,
            y - 20
          );
        }
      }

      function drawPusher() {
        const boxSize = getBoxSize();
        const pusherX = state.x - 40;
        const pusherY = state.groundY - boxSize.height / 2;

        ctx.save();
        ctx.translate(pusherX, pusherY);

        // Draw pusher
        ctx.strokeStyle = "#37474F";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";

        // Body
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -30);
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(-12, -38, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        ctx.moveTo(-12, -30);
        ctx.lineTo(40, 0);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, 20);
        ctx.moveTo(0, 0);
        ctx.lineTo(12, 16);
        ctx.stroke();

        ctx.restore();

        // Draw pushing indicator
        ctx.fillStyle = "rgba(244, 67, 54, 0.9)";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PUSHING!", pusherX, pusherY - 45);
      }

      function drawParticles() {
        state.particles.forEach((particle) => {
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      function drawPhysicsInfo() {
        // Calculate friction force for display
        const frictionForce = (
          state.friction *
          state.mass *
          state.gravity
        ).toFixed(1);

        ctx.fillStyle = "rgba(26, 35, 126, 0.9)";
        ctx.font = "13px Arial";
        ctx.textAlign = "left";

        const startY = 25;
        const lineHeight = 18;

        ctx.fillText(`Force: ${state.force} N`, 15, startY);
        ctx.fillText(`Mass: ${state.mass} kg`, 15, startY + lineHeight);
        ctx.fillStyle = "#795548";
        ctx.fillText(
          `Friction: ${state.friction.toFixed(1)} μ`,
          15,
          startY + lineHeight * 2
        );
        ctx.fillStyle = "#F44336";
        ctx.fillText(
          `Accel: ${Math.abs(state.a).toFixed(2)} m/s²`,
          15,
          startY + lineHeight * 3
        );
        ctx.fillStyle = "#2196F3";
        ctx.fillText(
          `Velocity: ${Math.abs(state.v).toFixed(2)} m/s`,
          15,
          startY + lineHeight * 4
        );
      }

      // ========================
      // ANIMATION LOOP
      // ========================
      let lastFrameTime = 0;

      function animate(currentTime) {
        const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
        lastFrameTime = currentTime;

        updatePhysics(deltaTime);
        draw();

        requestAnimationFrame(animate);
      }

      // ========================
      // START SIMULATION
      // ========================
      window.addEventListener("load", init);
      if (document.readyState === "complete") {
        init();
      }