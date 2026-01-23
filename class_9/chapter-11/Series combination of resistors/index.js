
      // ===== STATE =====
      let isSwitchClosed = true;
      const bulbResistance = 10; // Internal resistance of bulb

      // ===== DOM ELEMENTS =====
      const electronPath = document.getElementById("electronFlow");
      const mainWire = document.getElementById("main-wire");
      const switchWire1 = document.getElementById("switch-wire1");
      const switchWire2 = document.getElementById("switch-wire2");
      const switchWire3 = document.getElementById("switch-wire3");
      const switchWire4 = document.getElementById("switch-wire4");
      const bulb = document.getElementById("bulb-visual");
      const bulbFilament = document.getElementById("bulb-filament");
      const switchLever = document.getElementById("switch-lever");
      const switchLabel = document.getElementById("switch-label");
      const switchBtn = document.getElementById("switch-btn");
      const btnText = document.getElementById("btn-text");

      // Display elements
      const dR1 = document.getElementById("disp-r1");
      const dR2 = document.getElementById("disp-r2");
      const dR3 = document.getElementById("disp-r3");
      const dV = document.getElementById("disp-voltage");
      const drop1 = document.getElementById("v-drop-1");
      const drop2 = document.getElementById("v-drop-2");
      const drop3 = document.getElementById("v-drop-3");

      // Control panel elements
      const valV = document.getElementById("val-v");
      const valR1 = document.getElementById("val-r1");
      const valR2 = document.getElementById("val-r2");
      const valR3 = document.getElementById("val-r3");
      const calcRtotal = document.getElementById("calc-rtotal");
      const calcCurrent = document.getElementById("calc-current");

      // ===== TOGGLE SWITCH =====
      function toggleSwitch() {
        isSwitchClosed = !isSwitchClosed;

        if (isSwitchClosed) {
          // Switch ON - lever rotates down
          switchLever.classList.add("on");
          switchLever.classList.remove("off");
          switchLabel.textContent = "ON";
          switchLabel.classList.add("on");
          switchLabel.classList.remove("off");
          switchBtn.classList.add("on");
          switchBtn.classList.remove("off");
          btnText.innerHTML = "🔌 SWITCH: ON";

          // Update wire colors to show connection
          updateWireColors(true);
        } else {
          // Switch OFF - lever rotates up
          switchLever.classList.remove("on");
          switchLever.classList.add("off");
          switchLabel.textContent = "OFF";
          switchLabel.classList.remove("on");
          switchLabel.classList.add("off");
          switchBtn.classList.remove("on");
          switchBtn.classList.add("off");
          btnText.innerHTML = "🔌 SWITCH: OFF";

          // Update wire colors to show disconnection
          updateWireColors(false);
        }

        updateCircuit();
      }

      // ===== UPDATE WIRE COLORS =====
      function updateWireColors(isConnected) {
        const activeColor = "#64748b"; // Normal wire color
        const inactiveColor = "#475569"; // Dim wire color when switch is off
        // Color the switch wires based on connection state
        switchWire1.style.stroke = isConnected ? activeColor : inactiveColor;
        switchWire2.style.stroke = isConnected ? activeColor : inactiveColor;
        switchWire3.style.stroke = activeColor;
        switchWire4.style.stroke = activeColor;
        mainWire.style.stroke = activeColor; // Main wire stays same color
      }

      // ===== UPDATE CIRCUIT =====
      function updateCircuit() {
        // Get input values
        const v = parseFloat(document.getElementById("in-v").value);
        const r1 = parseFloat(document.getElementById("in-r1").value);
        const r2 = parseFloat(document.getElementById("in-r2").value);
        const r3 = parseFloat(document.getElementById("in-r3").value);

        // Update control panel labels
        valV.textContent = v + " V";
        valR1.textContent = r1 + " Ω";
        valR2.textContent = r2 + " Ω";
        valR3.textContent = r3 + " Ω";

        // Update circuit component labels
        dV.textContent = v;
        dR1.textContent = r1;
        dR2.textContent = r2;
        dR3.textContent = r3;

        // Calculate total resistance
        const rTotal = r1 + r2 + r3 + bulbResistance;
        calcRtotal.textContent = rTotal;

        // Calculate current (Ohm's Law: I = V/R)
        let current = 0;
        if (isSwitchClosed && rTotal > 0) {
          current = v / rTotal;
        }

        calcCurrent.textContent = current.toFixed(4) + " A";

        // Calculate voltage drops (V = I × R)
        const vDrop1 = current * r1;
        const vDrop2 = current * r2;
        const vDrop3 = current * r3;

        drop1.textContent = vDrop1.toFixed(2);
        drop2.textContent = vDrop2.toFixed(2);
        drop3.textContent = vDrop3.toFixed(2);

        // ===== UPDATE ANIMATIONS =====

        // Electron flow animation
        if (current > 0 && isSwitchClosed) {
          let speed = Math.max(0.3, Math.min(10, 0.08 / current));
          electronPath.style.animationDuration = speed + "s";
          electronPath.style.animationPlayState = "running";
          electronPath.style.opacity = Math.min(1, 0.5 + current * 5);
        } else {
          electronPath.style.animationPlayState = "paused";
          electronPath.style.opacity = 0;
        }

        // ===== BULB BRIGHTNESS =====
        const brightness = Math.min(current * 20, 1);

        if (current > 0 && isSwitchClosed) {
          // Glass envelope glow effect
          const glowIntensity = brightness * 100;
          const colorTemp = Math.floor(255 - brightness * 55);

          bulb.style.background = `radial-gradient(ellipse at 35% 35%, 
                    rgba(255, ${250 - brightness * 50}, ${
            200 + brightness * 55
          }, ${0.95}), 
                    rgba(${colorTemp}, ${Math.max(
            180,
            255 - brightness * 80
          )}, ${Math.max(150, 230 - brightness * 100)}, 0.7))`;

          // Outer glow (multiple layers for realistic effect)
          bulb.style.boxShadow = `
                    inset -8px -8px 20px rgba(0,0,0,0.15),
                    inset 8px 8px 20px rgba(255,255,255,0.4),
                    0 0 ${20 + glowIntensity * 0.4}px ${
            brightness * 25
          }px rgba(255, 235, 100, ${brightness * 0.9}),
                    0 0 ${40 + glowIntensity * 0.7}px ${
            brightness * 45
          }px rgba(255, 220, 80, ${brightness * 0.6}),
                    0 0 ${70 + glowIntensity}px ${
            brightness * 60
          }px rgba(255, 200, 50, ${brightness * 0.4})
                `;

          // Border color change with temperature
          bulb.style.borderColor = `rgba(${Math.max(
            100,
            255 - brightness * 120
          )}, ${Math.max(80, 220 - brightness * 140)}, ${Math.max(
            60,
            180 - brightness * 140
          )}, 0.9)`;

          // Filament visibility and glow
          bulbFilament.style.opacity = brightness;

          const filamentCoil = bulbFilament.querySelector(".filament-coil");
          const filamentGlow = bulbFilament.querySelector(".filament-glow");

          if (filamentCoil) {
            const coilColor = Math.floor(235 + brightness * 20);
            filamentCoil.style.background = `radial-gradient(circle, 
                        rgba(255, ${coilColor}, ${59 + brightness * 196}, ${
              0.9 + brightness * 0.1
            }) 0%, 
                        rgba(255, ${Math.max(100, 200 - brightness * 48)}, 0, ${
              0.7 + brightness * 0.3
            }) 60%, 
                        transparent 80%)`;
            filamentCoil.style.boxShadow = `0 0 ${10 + brightness * 18}px ${
              brightness * 10
            }px rgba(255, 230, 100, ${brightness})`;
            filamentCoil.style.filter = `blur(${2 + brightness}px)`;
          }

          if (filamentGlow) {
            filamentGlow.style.background = `radial-gradient(circle, 
                        rgba(255, 245, 100, ${0.6 * brightness}) 0%, 
                        rgba(255, 220, 120, ${0.4 * brightness}) 40%,
                        transparent 70%)`;
            filamentGlow.style.filter = `blur(${5 + brightness * 4}px)`;
          }
        } else {
          // Bulb OFF - cool glass appearance
          bulb.style.background =
            "radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.95), rgba(230,230,230,0.7))";
          bulb.style.boxShadow = `
                    inset -8px -8px 20px rgba(0,0,0,0.15),
                    inset 8px 8px 20px rgba(255,255,255,0.4)`;
          bulb.style.borderColor = "rgba(180,180,180,0.9)";
          bulbFilament.style.opacity = 0;
        }
      }

      // ===== INITIALIZATION =====
      window.addEventListener("load", function () {
        // Initialize wire colors
        updateWireColors(true);
        updateCircuit();
      });