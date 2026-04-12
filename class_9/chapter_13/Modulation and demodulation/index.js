const canvas = document.getElementById("simCanvas");
      const ctx = canvas.getContext("2d");

      // State variables
      let time = 0;
      const speed = 2; // Animation speed

      // DOM Elements
      const inputs = {
        audioFreq: document.getElementById("audioFreq"),
        audioAmp: document.getElementById("audioAmp"),
        carrierFreq: document.getElementById("carrierFreq"),
      };

      const labels = {
        freq: document.getElementById("freqVal"),
        amp: document.getElementById("ampVal"),
      };

      // Update labels on input
      inputs.audioFreq.addEventListener("input", (e) => {
        labels.freq.innerText =
          e.target.value < 2 ? "Low" : e.target.value > 4 ? "High" : "Med";
      });

      // Helper: Draw a sine wave
      function drawWave(
        ctx,
        xStart,
        yCenter,
        width,
        amplitude,
        frequency,
        phase,
        color,
        label,
      ) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        for (let x = 0; x < width; x++) {
          // Determine y based on sine formula
          // x is effectively time in the static drawing sense
          const t = (x + phase) * 0.05;
          const y = yCenter + Math.sin(t * frequency) * amplitude;

          if (x === 0) ctx.moveTo(xStart + x, y);
          else ctx.lineTo(xStart + x, y);
        }
        ctx.stroke();

        // Label
        if (label) {
          ctx.fillStyle = color;
          ctx.font = "12px Arial";
          ctx.fillText(label, xStart, yCenter - amplitude - 10);
        }
      }

      // Helper: Draw AM Modulated Wave
      function drawAMWave(
        ctx,
        xStart,
        yCenter,
        width,
        cAmp,
        cFreq,
        mAmp,
        mFreq,
        phase,
      ) {
        ctx.beginPath();
        ctx.strokeStyle = "#4facfe"; // Cyan
        ctx.lineWidth = 2;

        for (let x = 0; x < width; x++) {
          const t = (x + phase) * 0.05;

          // AM Formula: (Carrier_Amp + Message_Wave) * Carrier_Wave
          // Message Wave = mAmp * sin(mFreq * t)
          const envelope = cAmp + mAmp * Math.sin(t * mFreq);
          const y = yCenter + envelope * Math.sin(t * cFreq);

          if (x === 0) ctx.moveTo(xStart + x, y);
          else ctx.lineTo(xStart + x, y);
        }
        ctx.stroke();

        // Draw Envelope (Ghost lines) for educational clarity
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.setLineDash([5, 5]);
        for (let x = 0; x < width; x++) {
          const t = (x + phase) * 0.05;
          const envelope = cAmp + mAmp * Math.sin(t * mFreq);
          if (x === 0) ctx.moveTo(xStart + x, yCenter + envelope);
          else ctx.lineTo(xStart + x, yCenter + envelope);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Helper: Draw simple icons
      function drawIcon(ctx, type, x, y) {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;

        if (type === "mic") {
          // Microphone head
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
          // Handle
          ctx.strokeRect(x - 5, y + 10, 10, 20);
          // Stand
          ctx.beginPath();
          ctx.moveTo(x, y + 30);
          ctx.lineTo(x, y + 45);
          ctx.moveTo(x - 10, y + 45);
          ctx.lineTo(x + 10, y + 45);
          ctx.stroke();
        } else if (type === "antenna") {
          // Tower
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 15, y + 60); // Left leg
          ctx.moveTo(x, y);
          ctx.lineTo(x + 15, y + 60); // Right leg
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 60); // Center
          // Cross bars
          ctx.moveTo(x - 5, y + 15);
          ctx.lineTo(x + 5, y + 15);
          ctx.moveTo(x - 10, y + 35);
          ctx.lineTo(x + 10, y + 35);
          ctx.stroke();

          // Waves radiating
          ctx.beginPath();
          ctx.strokeStyle = "rgba(255,0,85,0.7)";
          ctx.arc(x, y, 10, -Math.PI, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, 20, -Math.PI, 0);
          ctx.stroke();
        } else if (type === "speaker") {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 10, y - 10);
          ctx.lineTo(x + 10, y + 10);
          ctx.lineTo(x, y);
          ctx.fill();
          ctx.strokeRect(x - 5, y - 5, 5, 10);
          // Sound waves
          ctx.beginPath();
          ctx.strokeStyle = "#ffff00";
          ctx.arc(x + 12, y, 5, -0.5, 0.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x + 12, y, 10, -0.5, 0.5);
          ctx.stroke();
        }
      }

      function drawBox(ctx, label, x, y, w, h) {
        ctx.fillStyle = "#333";
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "10px Arial";
        ctx.fillText(label, x + w / 2, y + h / 2 + 3);
      }

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fetch current values
        const mFreq = parseFloat(inputs.audioFreq.value);
        const mAmp = parseFloat(inputs.audioAmp.value);
        const cFreq = parseFloat(inputs.carrierFreq.value);
        const cAmp = 30; // Constant carrier base amplitude

        // --- SECTION 1: TRANSMITTER (Modulation) ---

        // 1. Audio Source (Mic)
        drawIcon(ctx, "mic", 50, 100);
        ctx.fillStyle = "#ccc";
        ctx.fillText("Source", 50, 160);

        // 2. Message Signal (The Audio)
        // Draw connecting line
        ctx.beginPath();
        ctx.strokeStyle = "#555";
        ctx.moveTo(60, 100);
        ctx.lineTo(100, 100);
        ctx.stroke();

        drawWave(
          ctx,
          100,
          100,
          150,
          mAmp,
          mFreq,
          time,
          "#00ff00",
          "Message Signal (Audio)",
        );

        // 3. Carrier Generator (Oscillator - abstract)
        drawBox(ctx, "Oscillator", 100, 200, 60, 30);
        drawWave(ctx, 180, 215, 70, 15, cFreq, time, "#ff0055", "Carrier");

        // 4. Modulator Box
        drawBox(ctx, "MODULATOR", 270, 80, 80, 150);

        // Lines into Modulator
        ctx.beginPath();
        ctx.moveTo(250, 100);
        ctx.lineTo(270, 100); // Audio in
        ctx.moveTo(250, 215);
        ctx.lineTo(270, 215); // Carrier in
        ctx.stroke();

        // 5. Transmitting Antenna
        // Line from modulator to antenna
        ctx.beginPath();
        ctx.moveTo(350, 150);
        ctx.lineTo(400, 150);
        ctx.stroke();
        drawIcon(ctx, "antenna", 400, 90);

        // --- SECTION 2: AIR (Transmission) ---
        // Draw the AM wave travelling through "space"
        drawAMWave(ctx, 430, 150, 250, cAmp, cFreq, mAmp, mFreq, time);

        ctx.fillStyle = "#aaa";
        ctx.fillText("TRANSMISSION (Air)", 555, 230);

        // --- SECTION 3: RECEIVER (Demodulation) ---

        // 6. Receiving Antenna
        drawIcon(ctx, "antenna", 700, 90);

        // 7. Demodulator
        // Line from antenna to demodulator
        ctx.beginPath();
        ctx.moveTo(700, 150);
        ctx.lineTo(750, 150);
        ctx.stroke();
        drawBox(ctx, "DEMODULATOR", 750, 110, 90, 80);

        // 8. Output (Speaker)
        // The demodulator extracts the "Envelope" (The Message)
        ctx.beginPath();
        ctx.moveTo(840, 150);
        ctx.lineTo(880, 150);
        ctx.stroke();

        // Draw the recovered wave (same as message)
        drawWave(
          ctx,
          880,
          150,
          80,
          mAmp,
          mFreq,
          time,
          "#ffff00",
          "Recovered Audio",
        );

        // Connection to speaker
        ctx.beginPath();
        ctx.moveTo(960, 150);
        ctx.lineTo(970, 150);
        ctx.stroke();
        drawIcon(ctx, "speaker", 980, 150);

        // Increment time for animation
        time -= speed;
        requestAnimationFrame(animate);
      }

      // Start
      animate();