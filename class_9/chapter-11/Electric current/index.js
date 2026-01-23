
      class CircuitSimulator {
        constructor() {
          this.circuitClosed = false;
          this.current = 0;
          this.voltage = 1.5;
          this.resistance = 10.0;
          this.power = 0;
          this.bulbBrightness = 1.0;

          this.canvas = document.getElementById("circuit-canvas");
          this.ctx = this.canvas.getContext("2d");

          this.components = {
            battery: { x: 120, y: 225, width: 70, height: 90 },
            switch: { x: 400, y: 225, width: 100, height: 50 },
            bulb: { x: 700, y: 225, width: 80, height: 100 },
            resistor: { x: 550, y: 225, width: 60, height: 40 },
            wires: {
              top: { x: 120, y: 180, width: 660, height: 6 },
              bottom: { x: 120, y: 270, width: 660, height: 6 },
              left: { x: 120, y: 180, width: 6, height: 90 },
              right: { x: 780, y: 180, width: 6, height: 90 },
            },
          };

          this.animationId = null;
          this.electrons = [];
          this.initElectrons();

          this.currentValueElement = document.getElementById("current-value");
          this.voltageValueElement = document.getElementById("voltage-value");
          this.resistanceValueElement =
            document.getElementById("resistance-value");
          this.powerValueElement = document.getElementById("power-value");
          this.powerEquationElement = document.getElementById("power-equation");

          this.init();
        }

        init() {
          this.drawCircuit();
          this.updateMeasurements();

          this.canvas.addEventListener("click", (e) =>
            this.handleCanvasClick(e)
          );
          document
            .getElementById("toggle-circuit")
            .addEventListener("click", () => this.toggleCircuit());
          document
            .getElementById("reset-circuit")
            .addEventListener("click", () => this.resetCircuit());
          document
            .getElementById("change-voltage")
            .addEventListener("click", () => this.changeVoltage());

          document.addEventListener("keydown", (e) => {
            if (e.code === "Space" || e.code === "KeyS") {
              this.toggleCircuit();
              e.preventDefault();
            }
            if (e.code === "KeyR") {
              this.resetCircuit();
            }
            if (e.code === "KeyV") {
              this.changeVoltage();
            }
            if (e.code === "KeyB") {
              this.changeBulbBrightness();
            }
          });
        }

        initElectrons() {
          this.electrons = [];
          const numElectrons = 25;

          for (let i = 0; i < numElectrons; i++) {
            this.electrons.push({
              x:
                this.components.battery.x +
                this.components.battery.width +
                10 +
                i * 30,
              y: this.components.wires.top.y + 3,
              speed: 2 + Math.random() * 1,
              radius: 4 + Math.random() * 2,
              offset: i * 0.5,
            });
          }
        }

        drawCircuit() {
          const gradient = this.ctx.createLinearGradient(
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );
          gradient.addColorStop(0, "#0a0a1a");
          gradient.addColorStop(1, "#11112a");
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          this.drawGrid();
          this.drawWires();
          this.drawBattery();
          this.drawResistor();
          this.drawSwitch();
          this.drawBulb();
          this.drawLabels();

          if (this.circuitClosed) {
            this.drawCurrentFlow();
          }
        }

        drawGrid() {
          this.ctx.strokeStyle = "rgba(100, 150, 255, 0.05)";
          this.ctx.lineWidth = 1;

          for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
          }

          for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
          }
        }

        drawWires() {
          const wires = this.components.wires;
          this.ctx.fillStyle = this.circuitClosed ? "#4fc3f7" : "#666";

          if (this.circuitClosed) {
            const gradient = this.ctx.createLinearGradient(
              0,
              0,
              this.canvas.width,
              0
            );
            gradient.addColorStop(0, "#2e86c1");
            gradient.addColorStop(0.5, "#4fc3f7");
            gradient.addColorStop(1, "#2e86c1");
            this.ctx.fillStyle = gradient;
          }

          this.ctx.fillRect(
            wires.top.x,
            wires.top.y,
            wires.top.width,
            wires.top.height
          );
          this.ctx.fillRect(
            wires.bottom.x,
            wires.bottom.y,
            wires.bottom.width,
            wires.bottom.height
          );
          this.ctx.fillRect(
            wires.left.x,
            wires.left.y,
            wires.left.width,
            wires.left.height
          );
          this.ctx.fillRect(
            wires.right.x,
            wires.right.y,
            wires.right.width,
            wires.right.height
          );

          this.ctx.fillStyle = this.circuitClosed ? "#ffeb3b" : "#888";
          this.drawWireJunction(
            wires.top.x,
            wires.top.y + wires.top.height / 2
          );
          this.drawWireJunction(
            wires.top.x + wires.top.width,
            wires.top.y + wires.top.height / 2
          );
          this.drawWireJunction(
            wires.bottom.x,
            wires.bottom.y + wires.bottom.height / 2
          );
          this.drawWireJunction(
            wires.bottom.x + wires.bottom.width,
            wires.bottom.y + wires.bottom.height / 2
          );
        }

        drawWireJunction(x, y) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, 10, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.fillStyle = "#222";
          this.ctx.beginPath();
          this.ctx.arc(x, y, 5, 0, Math.PI * 2);
          this.ctx.fill();
        }

        drawBattery() {
          const bat = this.components.battery;

          this.ctx.fillStyle = "#333";
          this.ctx.fillRect(bat.x, bat.y, bat.width, bat.height);

          this.ctx.fillStyle = "#444";
          this.ctx.fillRect(bat.x + 5, bat.y + 5, bat.width - 10, 15);

          this.ctx.fillStyle = "#e53935";
          this.ctx.fillRect(bat.x - 8, bat.y + 15, 10, 25);

          this.ctx.fillStyle = "#1565c0";
          this.ctx.fillRect(bat.x - 8, bat.y + bat.height - 40, 10, 25);

          this.ctx.fillStyle = "#fff";
          this.ctx.font = "bold 16px Arial";
          this.ctx.fillText("+", bat.x + bat.width / 2 - 5, bat.y + 30);
          this.ctx.fillText(
            "-",
            bat.x + bat.width / 2 - 5,
            bat.y + bat.height - 20
          );

          this.ctx.font = "14px Arial";
          this.ctx.fillText(
            `${this.voltage}V`,
            bat.x + bat.width / 2 - 15,
            bat.y + bat.height / 2 + 5
          );
        }

        drawResistor() {
          const res = this.components.resistor;

          this.ctx.fillStyle = this.circuitClosed ? "#ff9800" : "#888";
          this.ctx.fillRect(res.x, res.y, res.width, res.height);

          this.ctx.fillStyle = "#333";
          this.ctx.fillRect(res.x + 10, res.y, 5, res.height);
          this.ctx.fillRect(res.x + 25, res.y, 5, res.height);
          this.ctx.fillRect(res.x + 40, res.y, 5, res.height);

          this.ctx.fillStyle = "#fff";
          this.ctx.font = "14px Arial";
          this.ctx.fillText(
            `${this.resistance}Ω`,
            res.x + res.width / 2 - 15,
            res.y + res.height + 20
          );
        }

        drawSwitch() {
          const sw = this.components.switch;

          this.ctx.fillStyle = "#5d4037";
          this.ctx.fillRect(sw.x, sw.y, sw.width, sw.height);

          this.ctx.fillStyle = "#ffd700";
          this.ctx.beginPath();
          this.ctx.arc(sw.x + 25, sw.y + sw.height / 2, 8, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.beginPath();
          this.ctx.arc(
            sw.x + sw.width - 25,
            sw.y + sw.height / 2,
            8,
            0,
            Math.PI * 2
          );
          this.ctx.fill();

          this.ctx.strokeStyle = "#212121";
          this.ctx.lineWidth = 6;
          this.ctx.lineCap = "round";
          this.ctx.beginPath();

          if (this.circuitClosed) {
            this.ctx.moveTo(sw.x + 25, sw.y + sw.height / 2);
            this.ctx.lineTo(sw.x + sw.width - 25, sw.y + sw.height / 2);
          } else {
            this.ctx.moveTo(sw.x + 25, sw.y + sw.height / 2);
            this.ctx.lineTo(sw.x + 25 + 40, sw.y + sw.height / 2 - 30);
          }

          this.ctx.stroke();

          this.ctx.fillStyle = this.circuitClosed ? "#4caf50" : "#f44336";
          if (this.circuitClosed) {
            this.ctx.beginPath();
            this.ctx.arc(
              sw.x + sw.width - 25,
              sw.y + sw.height / 2,
              12,
              0,
              Math.PI * 2
            );
            this.ctx.fill();
          } else {
            this.ctx.beginPath();
            this.ctx.arc(
              sw.x + 25 + 40,
              sw.y + sw.height / 2 - 30,
              12,
              0,
              Math.PI * 2
            );
            this.ctx.fill();
          }
        }

        drawBulb() {
          const bulb = this.components.bulb;
          const centerX = bulb.x + bulb.width / 2;
          const centerY = bulb.y + bulb.height / 2;

          // Draw glow effect when bulb is on and circuit is closed
          if (this.circuitClosed && this.bulbBrightness > 0) {
            const glowIntensity = this.bulbBrightness * (this.current / 0.15);

            // Outer glow
            const outerGlow = this.ctx.createRadialGradient(
              centerX,
              centerY,
              0,
              centerX,
              centerY,
              100 * glowIntensity
            );
            outerGlow.addColorStop(
              0,
              `rgba(255, 255, 180, ${0.3 * glowIntensity})`
            );
            outerGlow.addColorStop(
              0.5,
              `rgba(255, 255, 150, ${0.15 * glowIntensity})`
            );
            outerGlow.addColorStop(1, `rgba(255, 255, 100, 0)`);

            this.ctx.fillStyle = outerGlow;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 100 * glowIntensity, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner glow
            const innerGlow = this.ctx.createRadialGradient(
              centerX,
              centerY,
              0,
              centerX,
              centerY,
              60 * glowIntensity
            );
            innerGlow.addColorStop(
              0,
              `rgba(255, 255, 200, ${0.6 * glowIntensity})`
            );
            innerGlow.addColorStop(1, `rgba(255, 255, 150, 0)`);

            this.ctx.fillStyle = innerGlow;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 60 * glowIntensity, 0, Math.PI * 2);
            this.ctx.fill();

            // Flicker effect for realism
            if (Math.random() > 0.7) {
              const flickerGlow = this.ctx.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                40
              );
              flickerGlow.addColorStop(
                0,
                `rgba(255, 255, 220, ${0.8 * glowIntensity})`
              );
              flickerGlow.addColorStop(1, `rgba(255, 255, 180, 0)`);

              this.ctx.fillStyle = flickerGlow;
              this.ctx.beginPath();
              this.ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
              this.ctx.fill();
            }
          }

          // Bulb glass (more realistic shape)
          this.ctx.fillStyle = this.circuitClosed
            ? `rgba(255, 255, 220, ${0.9 + 0.1 * this.bulbBrightness})`
            : "rgba(224, 224, 224, 0.9)";

          // Draw bulb shape (teardrop)
          this.ctx.beginPath();
          this.ctx.moveTo(centerX, bulb.y + 10);
          this.ctx.bezierCurveTo(
            centerX - 35,
            bulb.y + 10,
            centerX - 40,
            centerY,
            centerX,
            centerY + 30
          );
          this.ctx.bezierCurveTo(
            centerX + 40,
            centerY,
            centerX + 35,
            bulb.y + 10,
            centerX,
            bulb.y + 10
          );
          this.ctx.closePath();
          this.ctx.fill();

          // Glass highlights
          this.ctx.fillStyle = this.circuitClosed
            ? "rgba(255, 255, 255, 0.6)"
            : "rgba(255, 255, 255, 0.4)";
          this.ctx.beginPath();
          this.ctx.ellipse(
            centerX - 10,
            centerY - 15,
            15,
            25,
            0.3,
            0,
            Math.PI * 2
          );
          this.ctx.fill();

          // Bulb base
          this.ctx.fillStyle = "#8b7355";
          this.ctx.beginPath();
          this.ctx.moveTo(bulb.x + 20, centerY + 20);
          this.ctx.lineTo(bulb.x + bulb.width - 20, centerY + 20);
          this.ctx.lineTo(bulb.x + bulb.width - 15, bulb.y + bulb.height - 10);
          this.ctx.lineTo(bulb.x + 15, bulb.y + bulb.height - 10);
          this.ctx.closePath();
          this.ctx.fill();

          // Base screw threads
          this.ctx.strokeStyle = "#6b5b45";
          this.ctx.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(bulb.x + 15 + i * 5, centerY + 25 + i * 6);
            this.ctx.lineTo(
              bulb.x + bulb.width - 15 - i * 5,
              centerY + 25 + i * 6
            );
            this.ctx.stroke();
          }

          // Filament (glows when on)
          this.ctx.strokeStyle = this.circuitClosed
            ? `rgba(255, ${200 + 55 * this.bulbBrightness}, 0, 0.9)`
            : "rgba(160, 160, 160, 0.7)";
          this.ctx.lineWidth = this.circuitClosed ? 5 : 2;
          this.ctx.lineCap = "round";

          this.ctx.beginPath();
          this.ctx.moveTo(centerX - 15, centerY);
          this.ctx.bezierCurveTo(
            centerX - 10,
            centerY - 10,
            centerX - 5,
            centerY - 5,
            centerX,
            centerY - 8
          );
          this.ctx.bezierCurveTo(
            centerX + 5,
            centerY - 5,
            centerX + 10,
            centerY - 10,
            centerX + 15,
            centerY
          );
          this.ctx.stroke();

          // Additional filament support wires
          this.ctx.strokeStyle = "#ffd700";
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(centerX - 20, centerY + 5);
          this.ctx.lineTo(centerX - 15, centerY);
          this.ctx.moveTo(centerX + 20, centerY + 5);
          this.ctx.lineTo(centerX + 15, centerY);
          this.ctx.stroke();

          // Contact points
          this.ctx.fillStyle = "#ffd700";
          this.ctx.beginPath();
          this.ctx.arc(
            bulb.x + 25,
            bulb.y + bulb.height - 8,
            4,
            0,
            Math.PI * 2
          );
          this.ctx.fill();

          this.ctx.beginPath();
          this.ctx.arc(
            bulb.x + bulb.width - 25,
            bulb.y + bulb.height - 8,
            4,
            0,
            Math.PI * 2
          );
          this.ctx.fill();

          // Brightness indicator
          if (this.circuitClosed) {
            this.ctx.fillStyle = "#fff";
            this.ctx.font = "12px Arial";
            this.ctx.fillText(
              `Brightness: ${Math.round(this.bulbBrightness * 100)}%`,
              centerX - 35,
              bulb.y + bulb.height + 20
            );
          }
        }

        drawLabels() {
          this.ctx.fillStyle = "#fff";
          this.ctx.font = "bold 16px Arial";
          this.ctx.fillText(
            "Dry Cell",
            this.components.battery.x + this.components.battery.width / 2 - 25,
            this.components.battery.y + this.components.battery.height + 30
          );
          this.ctx.fillText(
            "Switch",
            this.components.switch.x + this.components.switch.width / 2 - 20,
            this.components.switch.y + this.components.switch.height + 30
          );
          this.ctx.fillText(
            "Light Bulb",
            this.components.bulb.x + this.components.bulb.width / 2 - 30,
            this.components.bulb.y + this.components.bulb.height + 30
          );
          this.ctx.fillText(
            "Resistor",
            this.components.resistor.x +
              this.components.resistor.width / 2 -
              25,
            this.components.resistor.y - 10
          );
        }

        drawCurrentFlow() {
          const time = Date.now() / 1000;

          this.electrons.forEach((electron, i) => {
            const progress = (time * electron.speed + electron.offset) % 4;

            if (progress < 1) {
              electron.x =
                this.components.wires.top.x +
                10 +
                progress * this.components.wires.top.width;
              electron.y = this.components.wires.top.y + 3;
            } else if (progress < 2) {
              const localProgress = progress - 1;
              electron.x = this.components.wires.right.x + 3;
              electron.y =
                this.components.wires.right.y +
                localProgress * this.components.wires.right.height;
            } else if (progress < 3) {
              const localProgress = progress - 2;
              electron.x =
                this.components.wires.bottom.x +
                this.components.wires.bottom.width -
                localProgress * this.components.wires.bottom.width;
              electron.y = this.components.wires.bottom.y + 3;
            } else {
              const localProgress = progress - 3;
              electron.x = this.components.wires.left.x + 3;
              electron.y =
                this.components.wires.left.y +
                this.components.wires.left.height -
                localProgress * this.components.wires.left.height;
            }

            this.ctx.fillStyle = "#4fc3f7";
            this.ctx.beginPath();
            this.ctx.arc(
              electron.x,
              electron.y,
              electron.radius,
              0,
              Math.PI * 2
            );
            this.ctx.fill();

            const glowGradient = this.ctx.createRadialGradient(
              electron.x,
              electron.y,
              0,
              electron.x,
              electron.y,
              electron.radius * 3
            );
            glowGradient.addColorStop(0, "rgba(79, 195, 247, 0.8)");
            glowGradient.addColorStop(1, "rgba(79, 195, 247, 0)");

            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(
              electron.x,
              electron.y,
              electron.radius * 3,
              0,
              Math.PI * 2
            );
            this.ctx.fill();

            this.ctx.fillStyle = "#fff";
            this.ctx.font = "10px Arial";
            this.ctx.fillText("-", electron.x - 3, electron.y + 3);
          });

          this.drawCurrentArrows();
        }

        drawCurrentArrows() {
          this.ctx.fillStyle = "#ff5252";

          this.drawArrow(
            this.components.wires.top.x + this.components.wires.top.width / 2,
            this.components.wires.top.y + 3,
            this.components.wires.top.x +
              this.components.wires.top.width / 2 +
              30,
            this.components.wires.top.y + 3,
            10
          );

          this.drawArrow(
            this.components.wires.right.x + 3,
            this.components.wires.right.y +
              this.components.wires.right.height / 2,
            this.components.wires.right.x + 3,
            this.components.wires.right.y +
              this.components.wires.right.height / 2 +
              30,
            10
          );

          this.drawArrow(
            this.components.wires.bottom.x +
              this.components.wires.bottom.width / 2,
            this.components.wires.bottom.y + 3,
            this.components.wires.bottom.x +
              this.components.wires.bottom.width / 2 -
              30,
            this.components.wires.bottom.y + 3,
            10
          );

          this.drawArrow(
            this.components.wires.left.x + 3,
            this.components.wires.left.y +
              this.components.wires.left.height / 2,
            this.components.wires.left.x + 3,
            this.components.wires.left.y +
              this.components.wires.left.height / 2 -
              30,
            10
          );
        }

        drawArrow(fromX, fromY, toX, toY, size) {
          const angle = Math.atan2(toY - fromY, toX - fromX);

          this.ctx.beginPath();
          this.ctx.moveTo(fromX, fromY);
          this.ctx.lineTo(toX, toY);
          this.ctx.strokeStyle = "#ff5252";
          this.ctx.lineWidth = 3;
          this.ctx.stroke();

          this.ctx.beginPath();
          this.ctx.moveTo(toX, toY);
          this.ctx.lineTo(
            toX - size * Math.cos(angle - Math.PI / 6),
            toY - size * Math.sin(angle - Math.PI / 6)
          );
          this.ctx.lineTo(
            toX - size * Math.cos(angle + Math.PI / 6),
            toY - size * Math.sin(angle + Math.PI / 6)
          );
          this.ctx.closePath();
          this.ctx.fillStyle = "#ff5252";
          this.ctx.fill();
        }

        updateMeasurements() {
          if (this.circuitClosed) {
            this.current = this.voltage / this.resistance;
            this.power = this.voltage * this.current;

            this.currentValueElement.innerHTML = `${this.current.toFixed(
              2
            )}<span class="measurement-unit">A</span>`;
            this.powerValueElement.innerHTML = `${this.power.toFixed(
              2
            )}<span class="measurement-unit">W</span>`;
            this.powerEquationElement.textContent = `${this.power.toFixed(
              2
            )} W`;
          } else {
            this.current = 0;
            this.power = 0;

            this.currentValueElement.innerHTML = `0.00<span class="measurement-unit">A</span>`;
            this.powerValueElement.innerHTML = `0.00<span class="measurement-unit">W</span>`;
            this.powerEquationElement.textContent = `0.00 W`;
          }

          this.voltageValueElement.innerHTML = `${this.voltage.toFixed(
            2
          )}<span class="measurement-unit">V</span>`;
          this.resistanceValueElement.innerHTML = `${this.resistance.toFixed(
            1
          )}<span class="measurement-unit">Ω</span>`;
        }

        toggleCircuit() {
          this.circuitClosed = !this.circuitClosed;

          const stateIndicator = document.querySelector(".state-indicator");
          const stateText = document.querySelector(".state-text");
          const currentFlow = document.querySelector(".current-flow");

          if (this.circuitClosed) {
            stateIndicator.classList.add("active");
            stateText.textContent = "Circuit Closed - Current Flowing";
            stateText.className = "state-text closed";
            currentFlow.classList.add("active");

            if (!this.animationId) {
              this.animate();
            }

            this.showNotification("Circuit Closed - Bulb is ON!");
          } else {
            stateIndicator.classList.remove("active");
            stateText.textContent = "Circuit Open - No Current Flow";
            stateText.className = "state-text open";
            currentFlow.classList.remove("active");

            if (this.animationId) {
              cancelAnimationFrame(this.animationId);
              this.animationId = null;
            }

            this.showNotification("Circuit Open - Bulb is OFF");
          }

          this.updateMeasurements();
          this.drawCircuit();
        }

        changeBulbBrightness() {
          if (!this.circuitClosed) {
            this.showNotification(
              "Circuit must be closed to adjust bulb brightness"
            );
            return;
          }

          const brightnessLevels = [0.3, 0.6, 1.0, 1.5, 2.0];
          const currentIndex = brightnessLevels.indexOf(this.bulbBrightness);
          this.bulbBrightness =
            brightnessLevels[(currentIndex + 1) % brightnessLevels.length];

          this.resistance = 10.0 / this.bulbBrightness;
          this.showNotification(
            `Bulb brightness set to ${Math.round(this.bulbBrightness * 100)}%`
          );

          this.updateMeasurements();
          this.drawCircuit();
        }

        resetCircuit() {
          this.circuitClosed = false;
          this.voltage = 1.5;
          this.resistance = 10.0;
          this.bulbBrightness = 1.0;

          const stateIndicator = document.querySelector(".state-indicator");
          const stateText = document.querySelector(".state-text");
          const currentFlow = document.querySelector(".current-flow");

          stateIndicator.classList.remove("active");
          stateText.textContent = "Circuit Open - No Current Flow";
          stateText.className = "state-text open";
          currentFlow.classList.remove("active");

          if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
          }

          this.updateMeasurements();
          this.drawCircuit();

          this.showNotification("Circuit reset to initial state");
        }

        changeVoltage() {
          const voltages = [1.5, 3.0, 4.5, 6.0, 9.0, 12.0];
          const currentIndex = voltages.indexOf(this.voltage);
          this.voltage = voltages[(currentIndex + 1) % voltages.length];

          this.showNotification(`Voltage changed to ${this.voltage}V`);

          this.updateMeasurements();
          this.drawCircuit();
        }

        showNotification(message) {
          const notification = document.createElement("div");
          notification.textContent = message;
          notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.85);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    z-index: 1000;
                    border-left: 5px solid #4fc3f7;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
                    animation: slideIn 0.3s ease;
                    font-size: 1rem;
                    max-width: 300px;
                `;

          document.body.appendChild(notification);

          setTimeout(() => {
            notification.style.animation = "slideOut 0.3s ease";
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 300);
          }, 3000);
        }

        handleCanvasClick(event) {
          const rect = this.canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          // Check if click is on the switch
          const sw = this.components.switch;
          if (
            x >= sw.x &&
            x <= sw.x + sw.width &&
            y >= sw.y &&
            y <= sw.y + sw.height
          ) {
            this.toggleCircuit();
            return;
          }

          // Check if click is on the battery
          const bat = this.components.battery;
          if (
            x >= bat.x &&
            x <= bat.x + bat.width &&
            y >= bat.y &&
            y <= bat.y + bat.height
          ) {
            this.changeVoltage();
            return;
          }

          // Check if click is on the bulb
          const bulb = this.components.bulb;
          const bulbCenterX = bulb.x + bulb.width / 2;
          const bulbCenterY = bulb.y + bulb.height / 2;
          const distance = Math.sqrt(
            (x - bulbCenterX) ** 2 + (y - bulbCenterY) ** 2
          );

          // Check if click is within bulb area (ellipse)
          if (distance < 50) {
            this.changeBulbBrightness();
            return;
          }
        }

        animate() {
          this.drawCircuit();

          if (this.circuitClosed) {
            this.animationId = requestAnimationFrame(() => this.animate());
          }
        }
      }

      window.addEventListener("DOMContentLoaded", () => {
        const simulator = new CircuitSimulator();

        const style = document.createElement("style");
        style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
        document.head.appendChild(style);
      });