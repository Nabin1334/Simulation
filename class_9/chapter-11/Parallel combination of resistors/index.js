
      const state = {
        isOn: false,
        v: 12,
        r1: 100,
        r2: 200,
        rBulb: 50,
        i1: 0,
        i2: 0,
        iBulb: 0,
        brightness: 0,
      };

      const els = {
        switch: document.getElementById("switch-visual"),
        btn: document.getElementById("btn-power"),
        btnText: document.getElementById("btn-text"),
        circuitStatus: document.getElementById("circuit-status"),
        bulbStatusDot: document.getElementById("bulb-status-dot"),
        bulbStatusText: document.getElementById("bulb-status-text"),
        bulbGlowOuter: document.getElementById("bulb-glow-outer"),
        bulbGlowMiddle: document.getElementById("bulb-glow-middle"),
        bulbGlowInner: document.getElementById("bulb-glow-inner"),
        bulbHotspot: document.getElementById("bulb-hotspot"),
        bulbFilament: document.getElementById("bulb-filament"),
        v: document.getElementById("input-voltage"),
        r1: document.getElementById("input-r1"),
        r2: document.getElementById("input-r2"),
        rBulb: document.getElementById("input-bulb"),
        dispV: document.getElementById("val-v"),
        dispR1: document.getElementById("val-r1"),
        dispR2: document.getElementById("val-r2"),
        dispBulb: document.getElementById("val-bulb"),
        statI1: document.getElementById("stat-i1"),
        statI2: document.getElementById("stat-i2"),
        statI3: document.getElementById("stat-i3"),
        statIt: document.getElementById("stat-it"),
        statBrightness: document.getElementById("stat-brightness"),
      };

      let glowInterval = null;
      let flickerInterval = null;

      function togglePower() {
        state.isOn = !state.isOn;

        if (state.isOn) {
          // Turn ON
          els.switch.classList.remove("switch-open");
          els.switch.classList.add("switch-closed");
          els.btnText.textContent = "Turn Off";
          els.btn.className = "power-btn btn-off";
          els.circuitStatus.textContent = "Circuit is ON";
          els.circuitStatus.className = "status status-on";

          // Start bulb glow
          startBulbGlow();
        } else {
          // Turn OFF
          els.switch.classList.remove("switch-closed");
          els.switch.classList.add("switch-open");
          els.btnText.textContent = "Turn On";
          els.btn.className = "power-btn btn-on";
          els.circuitStatus.textContent = "Circuit is OFF";
          els.circuitStatus.className = "status status-off";

          // Stop bulb glow
          stopBulbGlow();
        }

        calculate();
      }

      function startBulbGlow() {
        // Clear any existing intervals
        if (glowInterval) clearInterval(glowInterval);
        if (flickerInterval) clearInterval(flickerInterval);

        // Gradual glow animation
        let progress = 0;
        const duration = 1000; // 1 second to full brightness
        const steps = 50;
        const stepTime = duration / steps;

        glowInterval = setInterval(() => {
          progress += 1 / steps;
          const easedProgress = easeOutQuad(progress);

          // Update brightness
          state.brightness = Math.round(easedProgress * 100);
          updateBulbGlow(easedProgress);

          // Update status
          els.bulbStatusDot.classList.add("on");
          els.bulbStatusText.textContent = `Bulb: ${state.brightness}%`;

          if (progress >= 1) {
            clearInterval(glowInterval);

            // Start flicker effect
            startFlickerEffect();
          }
        }, stepTime);
      }

      function stopBulbGlow() {
        // Clear intervals
        if (glowInterval) clearInterval(glowInterval);
        if (flickerInterval) clearInterval(flickerInterval);

        // Reset bulb
        updateBulbGlow(0);

        // Update status
        els.bulbStatusDot.classList.remove("on");
        els.bulbStatusText.textContent = "Bulb is OFF";
        state.brightness = 0;
      }

      function updateBulbGlow(intensity) {
        // Make it MUCH brighter by using higher opacity values
        const outerOpacity = Math.min(intensity * 0.8, 0.8); // Up to 80% opacity
        const middleOpacity = Math.min(intensity * 1.0, 1.0); // Up to 100% opacity
        const innerOpacity = Math.min(intensity * 1.2, 1.0); // Even brighter inner glow
        const hotspotOpacity = Math.min(intensity * 1.5, 1.0); // Very bright hotspot

        // Apply opacities
        els.bulbGlowOuter.style.opacity = outerOpacity;
        els.bulbGlowMiddle.style.opacity = middleOpacity;
        els.bulbGlowInner.style.opacity = innerOpacity;
        els.bulbHotspot.style.opacity = hotspotOpacity;

        // Increase blur for larger glow
        els.bulbGlowOuter.style.filter = `blur(${40 + intensity * 40}px)`;
        els.bulbGlowMiddle.style.filter = `blur(${30 + intensity * 30}px)`;
        els.bulbGlowInner.style.filter = `blur(${20 + intensity * 20}px)`;

        // Update filament color based on temperature
        if (intensity > 0) {
          let r, g, b;
          if (intensity < 0.3) {
            r = 150 + Math.floor(intensity * 350);
            g = 30;
            b = 0;
          } else if (intensity < 0.7) {
            r = 255;
            g = 80 + Math.floor((intensity - 0.3) * 440);
            b = 0;
          } else {
            r = 255;
            g = 255;
            b = 120 + Math.floor((intensity - 0.7) * 135);
          }
          els.bulbFilament.style.stroke = `rgb(${r}, ${g}, ${b})`;
          els.bulbFilament.style.strokeWidth = 3.5 + intensity * 2.5 + "px";
          els.bulbFilament.style.filter = `drop-shadow(0 0 ${10 + intensity * 25}px rgb(${r}, ${g}, ${b}))`;
        } else {
          els.bulbFilament.style.stroke = "#bdc3c7";
          els.bulbFilament.style.strokeWidth = "3px";
          els.bulbFilament.style.filter = "none";
        }
      }

      function startFlickerEffect() {
        flickerInterval = setInterval(() => {
          if (!state.isOn) return;

          // Add realistic flicker
          const flicker = 1 + (Math.random() - 0.5) * 0.15; // ±15% variation
          const currentIntensity = (state.brightness / 100) * flicker;

          // Apply flicker
          els.bulbGlowOuter.style.opacity = Math.min(
            currentIntensity * 0.8,
            0.8,
          );
          els.bulbGlowMiddle.style.opacity = Math.min(
            currentIntensity * 1.0,
            1.0,
          );
          els.bulbGlowInner.style.opacity = Math.min(
            currentIntensity * 1.2,
            1.0,
          );
        }, 80); // Update every 80ms for smooth flicker
      }

      function easeOutQuad(x) {
        return 1 - (1 - x) * (1 - x);
      }

      function calculate() {
        // Get values
        state.v = parseFloat(els.v.value);
        state.r1 = parseFloat(els.r1.value);
        state.r2 = parseFloat(els.r2.value);
        state.rBulb = parseFloat(els.rBulb.value);

        if (state.isOn) {
          // Calculate currents
          state.i1 = state.v / state.r1;
          state.i2 = state.v / state.r2;
          state.iBulb = state.v / state.rBulb;

          // Calculate brightness (based on power: P = V²/R)
          const maxPower = (24 * 24) / 5; // Max voltage with min resistance
          const currentPower = (state.v * state.v) / state.rBulb;
          state.brightness = Math.round((currentPower / maxPower) * 100);

          // Update glow if circuit is on
          const intensity = state.brightness / 100;
          updateBulbGlow(intensity);
        } else {
          state.i1 = 0;
          state.i2 = 0;
          state.iBulb = 0;
          state.brightness = 0;
        }

        // Update displays
        updateDisplays();
      }

      function updateDisplays() {
        // Update value displays
        els.dispV.innerText = state.v.toFixed(1) + " V";
        els.dispR1.innerText = state.r1 + " Ω";
        els.dispR2.innerText = state.r2 + " Ω";
        els.dispBulb.innerText = state.rBulb + " Ω";

        // Update meter readings
        els.statI1.innerText = state.i1.toFixed(3) + " A";
        els.statI2.innerText = state.i2.toFixed(3) + " A";
        els.statI3.innerText = state.iBulb.toFixed(3) + " A";
        els.statIt.innerText =
          (state.i1 + state.i2 + state.iBulb).toFixed(3) + " A";
        els.statBrightness.innerText = state.brightness + "%";

        // Update bulb status
        if (state.isOn) {
          els.bulbStatusText.textContent = `Bulb: ${state.brightness}%`;
        }
      }

      // Event listeners
      els.switch.addEventListener("click", togglePower);

      els.v.addEventListener("input", function () {
        state.v = parseFloat(this.value);
        els.dispV.innerText = state.v.toFixed(1) + " V";
        if (state.isOn) calculate();
      });

      els.r1.addEventListener("input", function () {
        state.r1 = parseFloat(this.value);
        els.dispR1.innerText = state.r1 + " Ω";
        if (state.isOn) calculate();
      });

      els.r2.addEventListener("input", function () {
        state.r2 = parseFloat(this.value);
        els.dispR2.innerText = state.r2 + " Ω";
        if (state.isOn) calculate();
      });

      els.rBulb.addEventListener("input", function () {
        state.rBulb = parseFloat(this.value);
        els.dispBulb.innerText = state.rBulb + " Ω";
        if (state.isOn) calculate();
      });

      // Initialize
      window.addEventListener("DOMContentLoaded", () => {
        updateDisplays();
      });