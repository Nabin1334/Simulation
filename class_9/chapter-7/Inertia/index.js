
      // Canvas setup
      const canvas = document.getElementById("inertiaCanvas");
      const ctx = canvas.getContext("2d");

      // Set canvas to full container size
      function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        objectX = canvas.width / 2;
        objectY = canvas.height / 2;
      }

      // Pure Inertia Variables (NO ACCELERATION PHYSICS)
      let objectX = 0;
      let objectY = 0;
      let velocity = 0;
      let isMoving = false;
      let mass = 1000;
      let distance = 0;
      let startTime = 0;
      let elapsedTime = 0;
      let momentum = 0;

      // Object properties
      let objectRadius = 40;

      // Starfield for space effect
      let stars = [];

      // Initialize starfield
      function initStarfield() {
        stars = [];
        const starCount = Math.min(100, (canvas.width * canvas.height) / 1000);
        for (let i = 0; i < starCount; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            brightness: Math.random() * 0.3 + 0.2,
          });
        }
      }

      // DOM Elements
      const massValue = document.getElementById("massValue");
      const velocityValue = document.getElementById("velocityValue");
      const directionValue = document.getElementById("directionValue");
      const distanceValue = document.getElementById("distanceValue");
      const timeValue = document.getElementById("timeValue");
      const inertiaValue = document.getElementById("inertiaValue");
      const currentState = document.getElementById("currentState");
      const objectStatus = document.getElementById("objectStatus");
      const momentumIndicator = document.getElementById("momentumIndicator");

      const givePushBtn = document.getElementById("givePush");
      const stopObjectBtn = document.getElementById("stopObject");
      const changeMass1Btn = document.getElementById("changeMass1");
      const changeMass2Btn = document.getElementById("changeMass2");
      const changeMass3Btn = document.getElementById("changeMass3");
      const changeMass4Btn = document.getElementById("changeMass4");

      // Initialize canvas
      resizeCanvas();
      initStarfield();

      // Handle window resize with debounce
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          resizeCanvas();
          initStarfield();
        }, 100);
      });

      // Handle orientation change
      window.addEventListener("orientationchange", () => {
        setTimeout(() => {
          resizeCanvas();
          initStarfield();
          objectX = canvas.width / 2;
          objectY = canvas.height / 2;
        }, 300);
      });

      // Set initial object position
      objectY = canvas.height / 2;
      objectX = canvas.width / 2;

      // Draw clean light background
      function drawBackground() {
        // Draw light blue background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#e8f4f8");
        gradient.addColorStop(1, "#d1e7f0");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw very subtle grid lines
        ctx.strokeStyle = "rgba(200, 220, 230, 0.3)";
        ctx.lineWidth = 1;

        // Adjust grid density based on screen size
        const gridSize = canvas.width > 768 ? 50 : canvas.width > 480 ? 30 : 20;

        // Vertical lines
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Draw subtle stars for space effect
        ctx.fillStyle = "rgba(180, 200, 220, 0.4)";
        stars.forEach((star) => {
          ctx.globalAlpha = star.brightness;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw center reference point
        ctx.fillStyle = "rgba(44, 128, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          Math.min(8, canvas.width * 0.01),
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "rgba(44, 128, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          Math.min(8, canvas.width * 0.01),
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Draw the object
      function drawObject() {
        // Scale object size based on screen
        const screenScale = Math.min(canvas.width, canvas.height) / 800;
        const baseRadius = 20 * screenScale;
        objectRadius = baseRadius + (mass / 1000) * screenScale;

        // Draw motion trail if moving
        if (isMoving && velocity !== 0) {
          ctx.fillStyle = "rgba(44, 128, 255, 0.1)";
          const trailLength = Math.min(5, Math.abs(velocity) * 2);
          for (let i = 0; i < trailLength; i++) {
            ctx.beginPath();
            ctx.arc(
              objectX - velocity * i * 0.5 * screenScale,
              objectY,
              objectRadius * 0.8,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Object glow
        const glow = ctx.createRadialGradient(
          objectX,
          objectY,
          objectRadius * 0.8,
          objectX,
          objectY,
          objectRadius * 2
        );
        glow.addColorStop(0, "rgba(44, 128, 255, 0.6)");
        glow.addColorStop(1, "rgba(44, 128, 255, 0)");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(objectX, objectY, objectRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Object main body
        const objectGradient = ctx.createRadialGradient(
          objectX,
          objectY,
          0,
          objectX,
          objectY,
          objectRadius
        );
        objectGradient.addColorStop(0, "#2c80ff");
        objectGradient.addColorStop(1, "#0060c0");

        ctx.fillStyle = objectGradient;
        ctx.beginPath();
        ctx.arc(objectX, objectY, objectRadius, 0, Math.PI * 2);
        ctx.fill();

        // Object outline
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(objectX, objectY, objectRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw mass label on object
        ctx.fillStyle = "#ffffff";
        const fontSize = Math.max(12, objectRadius * 0.4);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(`${mass} kg`, objectX, objectY + 5);

        // Velocity vector and arrow removed as requested
      }

      // Pure inertia physics (NO acceleration after initial push)
      function updateInertiaPhysics() {
        if (isMoving && velocity !== 0) {
          // Update time
          elapsedTime = (Date.now() - startTime) / 1000;

          // Pure inertia: constant velocity motion
          const prevX = objectX;
          const speedScale = Math.min(canvas.width, canvas.height) / 800;
          objectX += velocity * speedScale;

          // Update distance
          distance += Math.abs(objectX - prevX) / 100;

          // Calculate momentum
          momentum = mass * Math.abs(velocity);

          // Update all displays
          updateDisplays();

          // Check boundaries (wrap around in space)
          if (objectX < -objectRadius) {
            objectX = canvas.width + objectRadius;
          } else if (objectX > canvas.width + objectRadius) {
            objectX = -objectRadius;
          }

          // Update stars movement
          stars.forEach((star) => {
            star.x -= velocity * 0.1 * speedScale;
            if (star.x < -10) star.x = canvas.width + 10;
            if (star.x > canvas.width + 10) star.x = -10;
          });
        }
      }

      // Update all displays
      function updateDisplays() {
        // Update values
        velocityValue.textContent = `${Math.abs(velocity).toFixed(1)} m/s`;
        distanceValue.textContent = `${distance.toFixed(1)} m`;
        timeValue.textContent = `${elapsedTime.toFixed(1)} s`;
        momentumIndicator.textContent = `MOMENTUM: ${momentum.toFixed(
          0
        )} kg·m/s`;

        // Update direction
        if (velocity > 0) {
          directionValue.textContent = "→ RIGHT";
        } else if (velocity < 0) {
          directionValue.textContent = "← LEFT";
        } else {
          directionValue.textContent = "STATIONARY";
        }

        // Update state
        if (isMoving) {
          currentState.textContent = "IN MOTION";
          objectStatus.textContent = "STATUS: Moving at constant velocity";
        } else {
          currentState.textContent = "AT REST";
          objectStatus.textContent = "STATUS: Object at rest";
        }

        // Update inertia display based on mass
        if (mass < 500) {
          inertiaValue.textContent = "LOW INERTIA";
        } else if (mass < 2000) {
          inertiaValue.textContent = "MEDIUM INERTIA";
        } else if (mass < 5000) {
          inertiaValue.textContent = "HIGH INERTIA";
        } else {
          inertiaValue.textContent = "VERY HIGH INERTIA";
        }
      }

      // Give initial push
      function givePush() {
        if (isMoving) return;

        isMoving = true;
        startTime = Date.now();
        elapsedTime = 0;

        // Adjust velocity scale for mobile
        const velocityScale =
          canvas.width > 768 ? 5 : canvas.width > 480 ? 4 : 3;

        // Set constant velocity (not acceleration!)
        // Heavier objects get less velocity from same push (inertia!)
        velocity = velocityScale / Math.sqrt(mass / 100);

        // Update displays immediately
        updateDisplays();
      }

      // Stop the object (apply external force)
      function stopObject() {
        isMoving = false;
        velocity = 0;
        momentum = 0;
        updateDisplays();
      }

      // Change mass
      function changeMass(newMass) {
        mass = newMass;
        massValue.textContent = `${mass} kg`;

        // Reset simulation
        isMoving = false;
        velocity = 0;
        distance = 0;
        elapsedTime = 0;
        momentum = 0;
        objectX = canvas.width / 2;

        updateDisplays();
      }

      // Main draw function
      function draw() {
        drawBackground();
        drawObject();
      }

      // Animation loop
      function animate() {
        updateInertiaPhysics();
        draw();
        requestAnimationFrame(animate);
      }

      // Event Listeners
      givePushBtn.addEventListener("click", givePush);
      stopObjectBtn.addEventListener("click", stopObject);

      changeMass1Btn.addEventListener("click", () => changeMass(100));
      changeMass2Btn.addEventListener("click", () => changeMass(1000));
      changeMass3Btn.addEventListener("click", () => changeMass(5000));
      changeMass4Btn.addEventListener("click", () => changeMass(10000));

      // Touch event for mobile
      givePushBtn.addEventListener("touchend", (e) => {
        e.preventDefault();
        givePush();
      });

      stopObjectBtn.addEventListener("touchend", (e) => {
        e.preventDefault();
        stopObject();
      });

      // Keyboard controls
      document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
          e.preventDefault();
          givePush();
        } else if (e.code === "KeyS") {
          stopObject();
        } else if (e.code === "Digit1") {
          changeMass(100);
        } else if (e.code === "Digit2") {
          changeMass(1000);
        } else if (e.code === "Digit3") {
          changeMass(5000);
        } else if (e.code === "Digit4") {
          changeMass(10000);
        }
      });

      // Initialize
      updateDisplays();
      animate();