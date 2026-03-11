
      // Canvas setup
      const canvas = document.getElementById("mainCanvas");
      const ctx = canvas.getContext("2d");

      // State
      let state = {
        mode: "bike", // 'bike' or 'hydro'
        isRunning: false,
        speed: 5,
        showFieldLines: true,

        // Bike physics
        bikeX: 70,
        bikeVx: 0,
        wheelAngle: 0,

        // Hydro physics
        waterFlow: 0,
        turbineAngle: 0,
        coilAngle: 0,

        // Output
        voltage: 0,
        current: 0,

        // Smoothing for bulb (prevents flicker)
        smoothBrightness: 0,
      };

      // Constants
      const GROUND_Y = 410;
      const BIKE_SPEED = 2.8;

      // UI Elements
      const btnBikeMode = document.getElementById("btnBikeMode");
      const btnHydroMode = document.getElementById("btnHydroMode");
      const btnStart = document.getElementById("btnStart");
      const btnStop = document.getElementById("btnStop");
      const btnReset = document.getElementById("btnReset");
      const speedSlider = document.getElementById("speedSlider");
      const speedValue = document.getElementById("speedValue");
      const showFieldLines = document.getElementById("showFieldLines");
      const statusLed = document.getElementById("statusLed");
      const statusText = document.getElementById("statusText");
      const voltageDisplay = document.getElementById("voltageDisplay");
      const currentDisplay = document.getElementById("currentDisplay");
      const powerDisplay = document.getElementById("powerDisplay");
      const voltageBar = document.getElementById("voltageBar");
      const currentBar = document.getElementById("currentBar");
      const outputType = document.getElementById("outputType");
      const infoContent = document.getElementById("infoContent");
      const canvasTitle = document.getElementById("canvasTitle");
      const canvasSubtitle = document.getElementById("canvasSubtitle");
      const canvasFooter = document.getElementById("canvasFooter");

      // Event Listeners
      btnBikeMode.addEventListener("click", () => switchMode("bike"));
      btnHydroMode.addEventListener("click", () => switchMode("hydro"));
      btnStart.addEventListener("click", () => {
        state.isRunning = true;
        updateUI();
      });
      btnStop.addEventListener("click", () => {
        state.isRunning = false;
        updateUI();
      });
      btnReset.addEventListener("click", reset);
      speedSlider.addEventListener("input", (e) => {
        state.speed = parseInt(e.target.value);
        speedValue.textContent = state.speed + "x";
      });
      showFieldLines.addEventListener("change", (e) => {
        state.showFieldLines = e.target.checked;
      });

      // Mode switching
      function switchMode(mode) {
        state.mode = mode;
        state.isRunning = false;
        reset();

        if (mode === "bike") {
          btnBikeMode.className = "mode-button active";
          btnHydroMode.className = "mode-button inactive";
          canvasTitle.textContent = "🚴 BICYCLE DYNAMO SIMULATION";
          canvasSubtitle.textContent = "DC GENERATOR";
          outputType.textContent = "⚡ DC Output (Rectified)";
          canvasFooter.innerHTML = `
                    <span>⚡ Real smooth bulb glow</span>
                    <span>⚡ Brightness follows speed</span>
                    <span>⚡ Loops forever in START mode</span>
                `;
          infoContent.innerHTML = `
                    <p class="info-text">
                        <strong>Bicycle Dynamo:</strong> Wheel rotation drives a friction roller that spins the armature.
                    </p>
                    <p class="info-text">
                        The rotating coil cuts magnetic field lines, inducing AC voltage. A <strong>split-ring commutator</strong> rectifies this to pulsating DC.
                    </p>
                    <div class="info-highlight">
                        <div class="info-highlight-text">Output: ~6V DC for bicycle lamp</div>
                    </div>
                `;
        } else {
          btnBikeMode.className = "mode-button inactive";
          btnHydroMode.className = "mode-button active";
          canvasTitle.textContent = "💧 HYDROELECTRIC POWER PLANT";
          canvasSubtitle.textContent = "AC GENERATOR";
          outputType.textContent = "⚡ AC Output (Sinusoidal)";
          canvasFooter.innerHTML = `
                    <span>💧 Water flows through penstock</span>
                    <span>⚙️ Turbine converts hydraulic to mechanical energy</span>
                    <span>💡 Real smooth AC bulb glow</span>
                `;
          infoContent.innerHTML = `
                    <p class="info-text">
                        <strong>Hydroelectric Plant:</strong> High-pressure water spins the Pelton wheel turbine at high speed.
                    </p>
                    <p class="info-text">
                        The turbine drives the generator rotor within a magnetic field. <strong>Slip rings</strong> allow continuous AC output.
                    </p>
                    <div class="info-highlight">
                        <div class="info-highlight-text">Output: ~220V AC for power grid</div>
                    </div>
                `;
        }
        updateUI();
      }

      // Reset function
      function reset() {
        state.bikeX = 70;
        state.bikeVx = 0;
        state.wheelAngle = 0;
        state.turbineAngle = 0;
        state.coilAngle = 0;
        state.waterFlow = 0;
        state.voltage = 0;
        state.current = 0;
        state.smoothBrightness = 0;
        updateUI();
      }

      // Update UI
      function updateUI() {
        // Status indicator
        if (state.isRunning) {
          statusLed.classList.add("active");
          statusText.classList.add("active");
          statusText.textContent = "RUNNING";
        } else {
          statusLed.classList.remove("active");
          statusText.classList.remove("active");
          statusText.textContent = "STOPPED";
        }

        // Output displays
        const absVoltage = Math.abs(state.voltage);
        const absCurrent = Math.abs(state.current);
        const power = absVoltage * absCurrent;

        voltageDisplay.innerHTML = `${absVoltage.toFixed(1)} <span class="output-unit">V</span>`;
        currentDisplay.innerHTML = `${absCurrent.toFixed(2)} <span class="output-unit">A</span>`;
        powerDisplay.innerHTML = `${power.toFixed(1)} <span class="output-unit">W</span>`;

        // Progress bars
        const maxVoltage = state.mode === "bike" ? 6 : 220;
        const maxCurrent = state.mode === "bike" ? 0.5 : 10;
        voltageBar.style.width =
          Math.min(100, (absVoltage / maxVoltage) * 100) + "%";
        currentBar.style.width =
          Math.min(100, (absCurrent / maxCurrent) * 100) + "%";
      }

      // Physics update
      function updatePhysics() {
        if (state.mode === "bike") {
          if (state.isRunning) {
            state.bikeVx = BIKE_SPEED * (state.speed / 5);
            state.bikeX += state.bikeVx;

            // Loop
            if (state.bikeX > 950) state.bikeX = 70;
            if (state.bikeX < 50) state.bikeX = 950;

            state.wheelAngle += state.bikeVx * 0.1;

            // DC output - smooth waveform
            const rawAC = Math.sin(state.wheelAngle);
            const rectified =
              Math.abs(rawAC) * 0.8 +
              Math.abs(Math.cos(state.wheelAngle)) * 0.2;
            state.voltage = rectified * 6 * (state.speed / 5);
            state.current = rectified * 0.5 * (state.speed / 5);
          } else {
            state.bikeVx *= 0.99;
            if (Math.abs(state.bikeVx) < 0.01) state.bikeVx = 0;
            state.bikeX += state.bikeVx;

            if (state.bikeX > 950) state.bikeX = 950;
            if (state.bikeX < 50) state.bikeX = 50;

            state.wheelAngle += state.bikeVx * 0.1;

            if (Math.abs(state.bikeVx) > 0) {
              const rawAC = Math.sin(state.wheelAngle);
              const rectified =
                Math.abs(rawAC) * 0.8 +
                Math.abs(Math.cos(state.wheelAngle)) * 0.2;
              state.voltage =
                rectified *
                6 *
                (state.speed / 5) *
                (Math.abs(state.bikeVx) / BIKE_SPEED);
              state.current =
                rectified *
                0.5 *
                (state.speed / 5) *
                (Math.abs(state.bikeVx) / BIKE_SPEED);
            } else {
              state.voltage = 0;
              state.current = 0;
            }
          }
        } else {
          // HYDRO MODE
          if (state.isRunning) {
            state.waterFlow = Math.min(1.5, state.waterFlow + 0.01);
            state.turbineAngle += state.waterFlow * 0.1;
            state.coilAngle += state.waterFlow * 0.1;

            // AC output - smooth sine wave with harmonics for realism
            const sinVal = Math.sin(state.coilAngle);
            const smoothAC =
              sinVal * 0.85 +
              Math.sin(state.coilAngle * 2) * 0.1 +
              Math.sin(state.coilAngle * 3) * 0.05;
            state.voltage =
              smoothAC * 220 * (state.speed / 5) * (state.waterFlow / 1.5);
            state.current =
              Math.abs(smoothAC) *
              10 *
              (state.speed / 5) *
              (state.waterFlow / 1.5);
          } else {
            state.waterFlow = Math.max(0, state.waterFlow - 0.01);
            if (state.waterFlow > 0) {
              state.turbineAngle += state.waterFlow * 0.05;
              state.coilAngle += state.waterFlow * 0.05;

              const sinVal = Math.sin(state.coilAngle);
              const smoothAC =
                sinVal * 0.85 +
                Math.sin(state.coilAngle * 2) * 0.1 +
                Math.sin(state.coilAngle * 3) * 0.05;
              state.voltage =
                smoothAC * 220 * (state.speed / 5) * (state.waterFlow / 1.5);
              state.current =
                Math.abs(smoothAC) *
                10 *
                (state.speed / 5) *
                (state.waterFlow / 1.5);
            } else {
              state.waterFlow = 0;
              state.voltage = 0;
              state.current = 0;
            }
          }
        }

        // Smooth brightness for bulbs (prevents flicker)
        const targetBrightness = Math.min(
          1,
          Math.abs(state.voltage) / (state.mode === "bike" ? 6 : 220),
        );
        state.smoothBrightness =
          state.smoothBrightness * 0.95 + targetBrightness * 0.05;
      }

      // Draw bike scene
      function drawBikeScene() {
        const x = state.bikeX;
        const y = GROUND_Y - 24;
        const rearWheelX = x - 38;
        const frontWheelX = x + 38;
        const wheelY = GROUND_Y;

        // Sky background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        skyGradient.addColorStop(0, "#1a3f5a");
        skyGradient.addColorStop(0.5, "#2a5a7a");
        skyGradient.addColorStop(1, "#3a6a8a");
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, GROUND_Y);

        // Sun
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ffeb3b";
        ctx.fillStyle = "#ffd54f";
        ctx.beginPath();
        ctx.arc(850, 100, 50, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Road
        ctx.fillStyle = "#1d2e1d";
        ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

        ctx.strokeStyle = "#e3d48b";
        ctx.lineWidth = 5;
        ctx.setLineDash([20, 35]);
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y - 8);
        ctx.lineTo(canvas.width, GROUND_Y - 8);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ground texture
        ctx.fillStyle = "#3a513a";
        for (let i = 0; i < 50; i++) {
          const gx = 20 + i * 20;
          const gy = GROUND_Y + 5 + (i % 3) * 3;
          ctx.beginPath();
          ctx.arc(gx, gy, 2, 0, 2 * Math.PI);
          ctx.fill();
        }

        ctx.shadowColor = "#00000040";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        // Draw wheel function
        const drawWheel = (wx, wy) => {
          ctx.save();
          ctx.translate(wx, wy);
          ctx.rotate(state.wheelAngle);

          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, 2 * Math.PI);
          ctx.fillStyle = "#2f2f2f";
          ctx.fill();
          ctx.strokeStyle = "#a9a9a9";
          ctx.lineWidth = 3;
          ctx.stroke();

          for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const angle = (i / 8) * Math.PI * 2;
            ctx.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
            ctx.strokeStyle = "#c0c0c0";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, 2 * Math.PI);
          ctx.fillStyle = "#6f6f6f";
          ctx.fill();
          ctx.strokeStyle = "#c0c0c0";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.restore();
        };

        drawWheel(rearWheelX, wheelY);
        drawWheel(frontWheelX, wheelY);

        // Frame
        ctx.shadowBlur = 6;
        ctx.strokeStyle = "#d8cfb0";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(rearWheelX - 8, y - 10);
        ctx.lineTo(frontWheelX + 8, y - 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rearWheelX - 8, y - 10);
        ctx.lineTo(frontWheelX, wheelY - 8);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rearWheelX - 5, y - 12);
        ctx.lineTo(rearWheelX - 5, wheelY - 14);
        ctx.stroke();

        // Seat
        ctx.fillStyle = "#564b3b";
        ctx.beginPath();
        ctx.ellipse(rearWheelX - 9, y - 31, 12, 8, 0.1, 0, 2 * Math.PI);
        ctx.fill();

        // Handlebar
        ctx.beginPath();
        ctx.moveTo(frontWheelX + 12, y - 26);
        ctx.lineTo(frontWheelX + 28, y - 32);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "#846f50";
        ctx.stroke();

        // Dynamo
        const dynamoX = rearWheelX - 12;
        const dynamoY = wheelY - 28;

        ctx.shadowBlur = 8;
        ctx.fillStyle = "#4f5055";
        ctx.beginPath();
        ctx.ellipse(dynamoX, dynamoY, 9, 5, -0.2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#7d7f85";
        ctx.beginPath();
        ctx.ellipse(dynamoX + 1, dynamoY - 1, 5, 3, -0.2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dynamoX + 6, dynamoY + 5, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "#33373b";
        ctx.fill();
        ctx.strokeStyle = "#b0b0b0";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Magnetic poles
        ctx.fillStyle = "rgba(255, 51, 51, 0.6)";
        ctx.fillRect(dynamoX - 8, dynamoY - 12, 14, 8);
        ctx.strokeStyle = "#ff3333";
        ctx.lineWidth = 1;
        ctx.strokeRect(dynamoX - 8, dynamoY - 12, 14, 8);

        ctx.fillStyle = "rgba(51, 51, 255, 0.6)";
        ctx.fillRect(dynamoX - 8, dynamoY + 4, 14, 8);
        ctx.strokeStyle = "#3333ff";
        ctx.lineWidth = 1;
        ctx.strokeRect(dynamoX - 8, dynamoY + 4, 14, 8);

        // Rotating coil
        ctx.save();
        ctx.translate(dynamoX, dynamoY);
        ctx.rotate(state.wheelAngle * 1.5);

        ctx.strokeStyle = "#ff8800";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(0, 6);
        ctx.stroke();

        ctx.restore();

        // Labels for poles
        ctx.font = "bold 10px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 3;
        ctx.fillText("N", dynamoX - 2, dynamoY - 14);
        ctx.fillText("S", dynamoX - 2, dynamoY + 14);
        ctx.shadowBlur = 0;

        // Headlight - SMOOTH REAL GLOW (no ON/OFF text, just pure glow)
        const headlightX = frontWheelX + 24;
        const headlightY = wheelY - 34;
        const brightness = state.smoothBrightness;

        // Light cone - appears smoothly
        if (brightness > 0.05) {
          ctx.shadowBlur = 20 + 40 * brightness;
          ctx.shadowColor = "#ffdd99";

          const gradient = ctx.createRadialGradient(
            headlightX,
            headlightY,
            5,
            headlightX + 60,
            headlightY + 50,
            150,
          );
          gradient.addColorStop(0, `rgba(255, 249, 230, ${brightness})`);
          gradient.addColorStop(
            0.3,
            `rgba(255, 239, 176, ${brightness * 0.8})`,
          );
          gradient.addColorStop(0.8, `rgba(128, 117, 77, 0)`);
          ctx.fillStyle = gradient;

          ctx.beginPath();
          ctx.moveTo(headlightX - 15, headlightY);
          ctx.lineTo(headlightX + 120, headlightY + 80);
          ctx.lineTo(headlightX - 40, headlightY + 80);
          ctx.closePath();
          ctx.fill();
        }

        // Bulb with smooth glow
        ctx.shadowBlur = 20 + 40 * brightness;
        ctx.shadowColor = brightness > 0.1 ? "#ffdd99" : "#222";

        const bulbGradient = ctx.createRadialGradient(
          headlightX,
          headlightY,
          2,
          headlightX,
          headlightY,
          12,
        );
        bulbGradient.addColorStop(0, brightness > 0.1 ? "#ffffff" : "#cccccc");
        bulbGradient.addColorStop(
          0.4,
          brightness > 0.3 ? "#fff9c4" : "#888888",
        );
        bulbGradient.addColorStop(
          0.7,
          brightness > 0.5 ? "#ffeb3b" : "#555555",
        );
        bulbGradient.addColorStop(1, brightness > 0.7 ? "#ffb300" : "#333333");
        ctx.fillStyle = bulbGradient;

        ctx.beginPath();
        ctx.arc(headlightX, headlightY, 12, 0, 2 * Math.PI);
        ctx.fill();

        // Filament
        ctx.strokeStyle = brightness > 0.3 ? "#ff6f00" : "#444444";
        ctx.lineWidth = 1.5 + brightness * 1.5;
        ctx.shadowBlur = brightness * 30;
        ctx.beginPath();
        ctx.moveTo(headlightX - 4, headlightY - 2);
        ctx.lineTo(headlightX + 4, headlightY + 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(headlightX - 4, headlightY + 2);
        ctx.lineTo(headlightX + 4, headlightY - 2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Educational Labels - clean without ON/OFF
        ctx.font = "bold 13px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;

        ctx.fillText("⚡ DC DYNAMO", dynamoX - 35, dynamoY - 25);

        // Friction contact
        ctx.strokeStyle = "#ff9800";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(dynamoX + 6, dynamoY + 5, 12, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "11px Arial";
        ctx.fillText("Friction Roller", dynamoX - 25, dynamoY + 25);

        ctx.shadowBlur = 0;
        ctx.setLineDash([]);

        // Magnetic field lines
        if (state.showFieldLines) {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = "#00ffaa";
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;

          for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            for (let t = 0; t < Math.PI; t += 0.1) {
              const fx = dynamoX + i * 6;
              const fy = dynamoY + 15 - 30 * Math.sin(t);
              const fz = Math.cos(t) * 8;
              if (t === 0) ctx.moveTo(fx + fz, fy);
              else ctx.lineTo(fx + fz, fy);
            }
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // Draw hydro scene
      function drawHydroScene() {
        // Background
        ctx.fillStyle = "#1a2d3f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Water reservoir
        ctx.fillStyle = "#2a5a7a";
        ctx.fillRect(0, 80, 350, 200);

        // Water surface waves
        ctx.strokeStyle = "#4a8aaa";
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 85 + i * 8);
          for (let x = 0; x < 350; x += 20) {
            const y =
              85 + i * 8 + Math.sin(x * 0.1 + state.turbineAngle * 0.5) * 3;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Dam
        ctx.fillStyle = "#555555";
        ctx.fillRect(330, 80, 40, 380);

        for (let i = 0; i < 10; i++) {
          ctx.strokeStyle = "#444444";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(330, 80 + i * 40);
          ctx.lineTo(370, 80 + i * 40);
          ctx.stroke();
        }

        // Penstock pipe
        ctx.fillStyle = "#666666";
        ctx.fillRect(350, 250, 150, 50);

        // Pipe bands
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = "#777777";
          ctx.fillRect(360 + i * 35, 245, 10, 60);
        }

        // Water flow inside pipe
        if (state.waterFlow > 0.1) {
          ctx.save();
          ctx.globalAlpha = 0.5 * (state.waterFlow / 1.5);
          const flowOffset = (state.turbineAngle * 20) % 40;
          for (let i = 0; i < 10; i++) {
            const fx = 360 + ((i * 40 + flowOffset) % 140);
            ctx.fillStyle = "#4a8aaa";
            ctx.beginPath();
            ctx.ellipse(fx, 275, 15, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
          }
          ctx.restore();
        }

        // Turbine house
        ctx.fillStyle = "#444444";
        ctx.fillRect(480, 220, 180, 200);

        ctx.fillStyle = "#333333";
        ctx.beginPath();
        ctx.moveTo(470, 220);
        ctx.lineTo(570, 180);
        ctx.lineTo(670, 220);
        ctx.closePath();
        ctx.fill();

        // Water jet from nozzle
        const turbineX = 540;
        const turbineY = 320;

        if (state.waterFlow > 0.1) {
          ctx.save();
          ctx.globalAlpha = 0.7 * (state.waterFlow / 1.5);
          ctx.fillStyle = "#4a8aaa";
          ctx.beginPath();
          ctx.moveTo(500, 275);
          ctx.lineTo(520, 270);
          ctx.lineTo(turbineX - 40, turbineY - 10);
          ctx.lineTo(turbineX - 50, turbineY + 10);
          ctx.closePath();
          ctx.fill();

          // Water droplets
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(
              turbineX - 40 + Math.cos(angle + state.turbineAngle) * 15,
              turbineY + Math.sin(angle + state.turbineAngle) * 15,
              4,
              0,
              2 * Math.PI,
            );
            ctx.fillStyle = "#6aaacc";
            ctx.fill();
          }
          ctx.restore();
        }

        // Turbine - rotates
        ctx.save();
        ctx.translate(turbineX, turbineY);
        ctx.rotate(state.turbineAngle);

        ctx.fillStyle = "#888888";
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 3;
        ctx.stroke();

        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const bx = Math.cos(angle) * 40;
          const by = Math.sin(angle) * 40;

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(angle + Math.PI / 2);

          ctx.fillStyle = "#aaaaaa";
          ctx.beginPath();
          ctx.arc(0, 0, 12, Math.PI, 2 * Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#999999";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
        }

        ctx.fillStyle = "#555555";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();

        // Shaft
        ctx.fillStyle = "#777777";
        ctx.fillRect(turbineX + 40, turbineY - 8, 100, 16);

        // Generator
        const genX = 700;
        const genY = 320;

        ctx.fillStyle = "#555555";
        ctx.fillRect(genX - 60, genY - 80, 120, 160);
        ctx.fillStyle = "#444444";
        ctx.fillRect(genX - 50, genY - 70, 100, 140);

        // Rotating coil
        ctx.save();
        ctx.translate(genX, genY);
        ctx.rotate(state.coilAngle);

        ctx.fillStyle = "#ff8800";
        ctx.strokeStyle = "#ff6600";
        ctx.lineWidth = 3;
        ctx.fillRect(-30, -50, 60, 100);
        ctx.strokeRect(-30, -50, 60, 100);

        for (let i = 0; i < 8; i++) {
          ctx.strokeStyle = "#cc6600";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-30, -50 + i * 12);
          ctx.lineTo(30, -50 + i * 12);
          ctx.stroke();
        }

        ctx.restore();

        // Slip rings
        ctx.fillStyle = "#ddaa44";
        ctx.beginPath();
        ctx.arc(genX + 50, genY - 20, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(genX + 50, genY + 20, 10, 0, 2 * Math.PI);
        ctx.fill();

        // Brushes
        ctx.fillStyle = "#333333";
        ctx.fillRect(genX + 60, genY - 25, 15, 10);
        ctx.fillRect(genX + 60, genY + 15, 15, 10);

        // Magnets
        ctx.fillStyle = "#ff3333";
        ctx.fillRect(genX - 70, genY - 90, 30, 80);
        ctx.fillStyle = "#3333ff";
        ctx.fillRect(genX - 70, genY + 10, 30, 80);

        // Labels
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("N", genX - 60, genY - 40);
        ctx.fillText("S", genX - 60, genY + 60);

        // Power lines
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(genX + 75, genY - 20);
        ctx.lineTo(genX + 150, genY - 80);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(genX + 75, genY + 20);
        ctx.lineTo(genX + 150, genY - 60);
        ctx.stroke();

        // Light Bulb - REAL SMOOTH AC GLOW (no ON/OFF text)
        const bulbX = 850;
        const bulbY = 200;
        const brightness = state.smoothBrightness;

        // Wire to bulb
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(genX + 150, genY - 70);
        ctx.lineTo(bulbX, bulbY + 40);
        ctx.stroke();

        // Bulb fixture
        ctx.fillStyle = "#333333";
        ctx.fillRect(bulbX - 15, bulbY + 35, 30, 10);

        // Light glow - smooth
        if (brightness > 0.05) {
          ctx.shadowBlur = 20 + 60 * brightness;
          ctx.shadowColor = "#ffaa00";

          const glowGradient = ctx.createRadialGradient(
            bulbX,
            bulbY,
            5,
            bulbX + 80,
            bulbY + 50,
            200,
          );
          glowGradient.addColorStop(0, `rgba(255, 249, 196, ${brightness})`);
          glowGradient.addColorStop(
            0.3,
            `rgba(255, 235, 59, ${brightness * 0.8})`,
          );
          glowGradient.addColorStop(
            0.6,
            `rgba(255, 152, 0, ${brightness * 0.4})`,
          );
          glowGradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glowGradient;

          ctx.beginPath();
          ctx.moveTo(bulbX - 20, bulbY);
          ctx.lineTo(bulbX + 150, bulbY + 100);
          ctx.lineTo(bulbX - 50, bulbY + 100);
          ctx.closePath();
          ctx.fill();
        }

        // Bulb
        ctx.shadowBlur = 20 + 60 * brightness;
        ctx.shadowColor = brightness > 0.1 ? "#ffaa00" : "#222";

        const bulbGradient = ctx.createRadialGradient(
          bulbX,
          bulbY,
          2,
          bulbX,
          bulbY,
          25,
        );
        bulbGradient.addColorStop(0, brightness > 0.1 ? "#ffffff" : "#aaaaaa");
        bulbGradient.addColorStop(
          0.3,
          brightness > 0.3 ? "#fff59d" : "#777777",
        );
        bulbGradient.addColorStop(
          0.6,
          brightness > 0.5 ? "#ffb74d" : "#555555",
        );
        bulbGradient.addColorStop(1, brightness > 0.7 ? "#ff9800" : "#333333");
        ctx.fillStyle = bulbGradient;

        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 25, 0, 2 * Math.PI);
        ctx.fill();

        // Filament
        ctx.strokeStyle = brightness > 0.3 ? "#ff6f00" : "#444444";
        ctx.lineWidth = 2 + brightness * 2;
        ctx.shadowBlur = brightness * 40;
        ctx.beginPath();
        ctx.moveTo(bulbX - 8, bulbY - 5);
        ctx.lineTo(bulbX + 8, bulbY + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bulbX - 8, bulbY + 5);
        ctx.lineTo(bulbX + 8, bulbY - 5);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // No ON/OFF label - just clean bulb

        // Tower
        ctx.fillStyle = "#777777";
        ctx.fillRect(genX + 145, genY - 120, 10, 160);

        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(genX + 130, genY - 100);
        ctx.lineTo(genX + 170, genY - 100);
        ctx.stroke();

        // Magnetic field lines
        if (state.showFieldLines) {
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = "#00ffaa";
          ctx.lineWidth = 2;

          for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            for (let t = 0; t < Math.PI; t += 0.1) {
              const fx = genX - 55 + i * 12;
              const fy = genY - 5 + 90 - 180 * Math.sin(t);
              const fz = Math.cos(t) * 15;
              if (t === 0) ctx.moveTo(fx + fz, fy);
              else ctx.lineTo(fx + fz, fy);
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        // Ground
        ctx.fillStyle = "#2a4a2a";
        ctx.fillRect(0, 420, canvas.width, canvas.height - 420);

        // Labels
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;

        ctx.fillText("Water Reservoir", 100, 60);
        ctx.fillText("Penstock Pipe", 385, 235);
        ctx.fillText("Pelton Turbine", turbineX - 50, turbineY - 80);
        ctx.fillText("AC Generator", genX - 45, genY - 110);

        // Water flow indicator
        if (state.waterFlow > 0.1) {
          ctx.strokeStyle = "#4a8aaa";
          ctx.fillStyle = "#4a8aaa";
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(420, 275);
          ctx.lineTo(450, 275);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(450, 275);
          ctx.lineTo(445, 270);
          ctx.lineTo(445, 280);
          ctx.closePath();
          ctx.fill();

          ctx.font = "12px Arial";
          ctx.fillStyle = "#6aaacc";
          ctx.fillText("Water Flow →", 410, 265);
        }

        ctx.shadowBlur = 0;
        ctx.setLineDash([]);

        // Real-time info box
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(20, 20, 300, state.isRunning ? 125 : 105);

        ctx.strokeStyle = "#4a8aaa";
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 300, state.isRunning ? 125 : 105);

        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#4a8aaa";
        ctx.fillText("💧 HYDROELECTRIC - How It Works:", 30, 40);

        ctx.font = "12px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("1. Water pressure → High-speed jet", 30, 60);
        ctx.fillText("2. Jet spins Pelton turbine buckets", 30, 78);
        ctx.fillText("3. Generator coil rotates in magnets", 30, 96);
        ctx.fillText("4. Slip rings deliver AC power", 30, 114);

        if (state.isRunning && state.waterFlow > 0.1) {
          ctx.fillStyle = "#ffeb3b";
          ctx.fillText("✓ Generating AC Power!", 30, 136);
        } else if (state.isRunning) {
          ctx.fillStyle = "#ffeb3b";
          ctx.fillText("⏳ Turbine starting...", 30, 136);
        } else {
          ctx.fillStyle = "#ff6b6b";
          ctx.fillText("⏸ Turbine Stopped", 30, 128);
        }
      }

      // Main animation loop
      function animate() {
        updatePhysics();
        updateUI();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (state.mode === "bike") {
          drawBikeScene();
        } else {
          drawHydroScene();
        }

        requestAnimationFrame(animate);
      }

      // Start animation
      animate();