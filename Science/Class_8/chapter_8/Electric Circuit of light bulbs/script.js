// --- CONFIGURATION & STATE ---
      const CONFIG = {
        voltage: 1.5,
        resistance: 10,
        wireColor: '#3a3a3a',
        wireWidth: 6,
        electronColor: '#00e5ff',
        electronSpeed: 2, // pixels per frame multiplier
        battery: { x: 100, y: 250, width: 60, height: 100 },
        bulb: { x: 650, y: 250, radius: 45 },
        switch: { x: 375, y: 100, width: 100, height: 40 }
      };

      const state = {
        isClosed: false,
        current: 0,
        electrons: [],
        lastFrameTime: 0
      };

      // --- SETUP CANVAS ---
      const canvas = document.getElementById('circuitCanvas');
      const ctx = canvas.getContext('2d');
      const voltDisplay = document.getElementById('volts');
      const ampDisplay = document.getElementById('amps');
      const statusLed = document.getElementById('statusLed');
      const statusText = document.getElementById('statusText');

      // Define Wire Path (Loop)
      // Coordinates form a rectangle: Top-Left, Top-Right, Bottom-Right, Bottom-Left
      // Note: Battery is on Left (Vertical), Switch on Top (Horizontal), Bulb on Right (Vertical)
      const nodes = {
        tl: { x: 100, y: 100 },
        tr: { x: 650, y: 100 },
        br: { x: 650, y: 400 },
        bl: { x: 100, y: 400 }
      };

      // --- INITIALIZE ELECTRONS ---
      // We create particles distributed along the perimeter of the circuit
      function initElectrons() {
        const perimeter = (nodes.tr.x - nodes.tl.x) * 2 + (nodes.bl.y - nodes.tl.y) * 2;
        const count = 30; // Number of electrons
        const gap = perimeter / count;
        
        state.electrons = [];
        
        for (let i = 0; i < count; i++) {
          state.electrons.push({
            dist: i * gap, // Distance traveled along the loop
            totalLen: perimeter
          });
        }
      }

      initElectrons();

      // --- PHYSICS & LOGIC ---
      function toggleCircuit() {
        state.isClosed = !state.isClosed;
        
        // Update UI
        if (state.isClosed) {
          state.current = CONFIG.voltage / CONFIG.resistance;
          statusLed.className = 'led on';
          statusText.textContent = "CIRCUIT CLOSED";
          statusText.style.color = "var(--success-color)";
        } else {
          state.current = 0;
          statusLed.className = 'led off';
          statusText.textContent = "CIRCUIT OPEN";
          statusText.style.color = "var(--danger-color)";
        }
        
        ampDisplay.textContent = state.current.toFixed(2);
      }

      function updateElectrons(dt) {
        if (!state.isClosed) return;

        // Speed depends on current (visual representation)
        const speed = CONFIG.electronSpeed * (state.current > 0 ? 1 : 0); 
        
        state.electrons.forEach(e => {
          e.dist += speed;
          if (e.dist > e.totalLen) e.dist -= e.totalLen;
        });
      }

      // Helper to get X,Y based on distance along the rectangular loop
      // Path: Battery(-) -> Bottom Wire -> Bulb -> Top Wire (Switch) -> Battery(+)
      // Flow direction: Counter-Clockwise (Electron flow from - to +)
      function getPositionAtLength(dist) {
        // Segments lengths
        const w = nodes.tr.x - nodes.tl.x; // width
        const h = nodes.bl.y - nodes.tl.y; // height
        
        // Loop starts at bottom-left (Battery Negative), goes Right -> Up -> Left -> Down
        if (dist < w) {
          // Bottom wire (Left to Right)
          return { x: nodes.bl.x + dist, y: nodes.bl.y };
        } else if (dist < w + h) {
          // Right wire (Bottom to Top) - Through Bulb
          return { x: nodes.br.x, y: nodes.br.y - (dist - w) };
        } else if (dist < w * 2 + h) {
          // Top wire (Right to Left) - Through Switch
          return { x: nodes.tr.x - (dist - (w + h)), y: nodes.tr.y };
        } else {
          // Left wire (Top to Bottom) - Through Battery
          return { x: nodes.tl.x, y: nodes.tl.y + (dist - (2 * w + h)) };
        }
      }

      // --- DRAWING FUNCTIONS ---

      function drawWires() {
        ctx.strokeStyle = CONFIG.wireColor;
        ctx.lineWidth = CONFIG.wireWidth;
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(nodes.tl.x, nodes.tl.y); // Top Left
        ctx.lineTo(nodes.tr.x, nodes.tr.y); // Top Right
        ctx.lineTo(nodes.br.x, nodes.br.y); // Bottom Right
        ctx.lineTo(nodes.bl.x, nodes.bl.y); // Bottom Left
        ctx.lineTo(nodes.tl.x, nodes.tl.y); // Close loop
        ctx.stroke();

        // Draw Nodes (Joints)
        ctx.fillStyle = '#555';
        [nodes.tl, nodes.tr, nodes.br, nodes.bl].forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, CONFIG.wireWidth, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      function drawElectrons() {
        if (!state.isClosed) return; // Don't draw movement if open (or draw static?)

        ctx.fillStyle = CONFIG.electronColor;
        ctx.shadowBlur = 5;
        ctx.shadowColor = CONFIG.electronColor;

        state.electrons.forEach(e => {
          const pos = getPositionAtLength(e.dist);
          // Hide electrons inside the battery body for realism? No, show flow.
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.shadowBlur = 0; // Reset
      }

      function drawBattery() {
        const x = CONFIG.battery.x;
        const y = (nodes.tl.y + nodes.bl.y) / 2; // Center vertically between wires
        const w = 40;
        const h = 140;

        ctx.save();
        ctx.translate(x, y);

        // Battery Body (Cylinder gradient)
        const grad = ctx.createLinearGradient(-w/2, 0, w/2, 0);
        grad.addColorStop(0, '#333');
        grad.addColorStop(0.5, '#666');
        grad.addColorStop(1, '#222');
        
        ctx.fillStyle = grad;
        ctx.fillRect(-w/2, -h/2, w, h);

        // Positive Terminal (Top nub) - Actually in our loop, Top is positive
        // Let's make Top Positive.
        ctx.fillStyle = '#c62828'; // Red band at top
        ctx.fillRect(-w/2, -h/2, w, 20);
        
        // Metal Nub
        ctx.fillStyle = '#ccc';
        ctx.fillRect(-10, -h/2 - 10, 20, 10);

        // Negative Terminal (Bottom)
        ctx.fillStyle = '#1565c0'; // Blue band
        ctx.fillRect(-w/2, h/2 - 20, w, 20);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1.5V', 0, 0);

        // Signs
        ctx.font = 'bold 20px Arial';
        ctx.fillText('+', 0, -h/2 + 35);
        ctx.fillText('-', 0, h/2 - 35);

        ctx.restore();
      }

      function drawBulb() {
        const x = nodes.tr.x; // Right side
        const y = (nodes.tr.y + nodes.br.y) / 2; // Center vertically
        
        ctx.save();
        ctx.translate(x, y);

        // 1. Glow Effect (Behind bulb)
        if (state.isClosed) {
          const glow = ctx.createRadialGradient(0, -20, 10, 0, -20, 120);
          glow.addColorStop(0, 'rgba(255, 255, 200, 1)');
          glow.addColorStop(0.2, 'rgba(255, 220, 100, 0.6)');
          glow.addColorStop(1, 'rgba(255, 255, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, -20, 120, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Bulb Glass
        ctx.beginPath();
        ctx.arc(0, -20, 45, 0, Math.PI * 2); // Main sphere
        ctx.fillStyle = state.isClosed ? 'rgba(255, 255, 230, 0.8)' : 'rgba(230, 230, 230, 0.2)';
        ctx.fill();
        
        // Glass Reflection
        ctx.beginPath();
        ctx.arc(-15, -35, 8, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();

        ctx.strokeStyle = '#rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Base (Screw)
        const grad = ctx.createLinearGradient(-15, 20, 15, 20);
        grad.addColorStop(0, '#999');
        grad.addColorStop(0.5, '#fff');
        grad.addColorStop(1, '#777');
        ctx.fillStyle = grad;
        
        // Draw threads
        ctx.fillRect(-15, 20, 30, 10);
        ctx.fillRect(-15, 32, 30, 10);
        ctx.fillRect(-15, 44, 30, 10);
        
        // Bottom tip
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(-15, 54);
        ctx.lineTo(15, 54);
        ctx.lineTo(5, 65);
        ctx.lineTo(-5, 65);
        ctx.fill();
        ctx.fillStyle = '#555'; // Contact
        ctx.beginPath();
        ctx.arc(0, 68, 5, 0, Math.PI*2);
        ctx.fill();

        // 4. Internal Supports & Filament
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 20);
        ctx.lineTo(-5, -10); // Left support
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(10, 20);
        ctx.lineTo(5, -10); // Right support
        ctx.stroke();

        // Filament (Zig Zag)
        ctx.strokeStyle = state.isClosed ? '#fff' : '#555';
        ctx.lineWidth = state.isClosed ? 3 : 1;
        if (state.isClosed) {
            ctx.shadowColor = "#ffeb3b";
            ctx.shadowBlur = 20;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.beginPath();
        ctx.moveTo(-5, -10);
        ctx.lineTo(-2, -25);
        ctx.lineTo(2, -10);
        ctx.lineTo(5, -25);
        ctx.lineTo(5, -10); // Connection to right support
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset

        ctx.restore();
      }

      function drawSwitch() {
        const x = (nodes.tl.x + nodes.tr.x) / 2; // Top center
        const y = nodes.tl.y;

        ctx.save();
        ctx.translate(x, y);

        // Base Plate
        ctx.fillStyle = '#333';
        ctx.fillRect(-40, -5, 80, 10);

        // Terminals
        ctx.fillStyle = '#d4af37'; // Gold
        ctx.beginPath();
        ctx.arc(-30, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(30, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // The Knife (Arm)
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-30, 0); // Pivot point

        if (state.isClosed) {
          ctx.lineTo(30, 0); // Closed (flat)
        } else {
          ctx.lineTo(10, -35); // Open (angled up)
        }
        ctx.stroke();

        // Handle
        if (state.isClosed) {
           ctx.fillStyle = '#c0392b';
           ctx.fillRect(30, -3, 15, 6);
        } else {
            // Draw handle at angle
            ctx.translate(10, -35);
            ctx.rotate(-0.8); // Angle of the handle
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(0, -3, 15, 6);
        }

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SWITCH', 0, 30);

        ctx.restore();
      }

      // --- MAIN LOOP ---
      function animate(timestamp) {
        if (!state.lastFrameTime) state.lastFrameTime = timestamp;
        const dt = timestamp - state.lastFrameTime;
        state.lastFrameTime = timestamp;

        // Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update Physics
        updateElectrons(dt);

        // Draw Components (Order matters for layering)
        drawWires();
        drawBattery();
        drawSwitch(); // Wires go under switch
        
        // Draw Electrons on top of wires but under bulb/switch mechanics?
        // Actually electrons inside wires.
        drawElectrons();

        drawBulb();

        requestAnimationFrame(animate);
      }

      // --- INTERACTION ---
      // Mouse/Touch Interaction for the Switch
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if click is near the switch (Top Center)
        const swX = (nodes.tl.x + nodes.tr.x) / 2;
        const swY = nodes.tl.y;

        // Simple distance check
        if (Math.abs(clickX - swX) < 60 && Math.abs(clickY - swY) < 60) {
          toggleCircuit();
        }
      });

      document.getElementById('toggleBtn').addEventListener('click', toggleCircuit);

      // Start
      requestAnimationFrame(animate);
