    // Circuit state
        let circuitClosed = false;
        let current = 0;
        let voltage = 1.5; // Volts
        let resistance = 10; // Ohms

        // Get canvas context
        const canvas = document.getElementById('circuit-canvas');
        const ctx = canvas.getContext('2d');

        // Component positions and dimensions
        const components = {
            battery: { x: 100, y: 200, width: 60, height: 80 },
            switch: { x: 350, y: 200, width: 80, height: 40 },
            bulb: { x: 600, y: 200, width: 60, height: 80 },
            resistor: { x: 450, y: 160, width: 40, height: 80 },
            wires: {
                top: { x: 100, y: 160, width: 600, height: 5 },
                bottom: { x: 100, y: 240, width: 600, height: 5 },
                left: { x: 100, y: 160, width: 5, height: 80 },
                right: { x: 700, y: 160, width: 5, height: 80 },
            }
        };

        // Animation control
        let animationId = null;

        // Draw the complete circuit (static parts)
        function drawCircuit() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw wires
            drawWires();

            // Draw components
            drawBattery();
            drawResistor();
            drawSwitch();
            drawBulb();
            
            // Draw labels for Ohm's Law
            drawLabels();
        }

        // Draw all wires
        function drawWires() {
            ctx.fillStyle = '#333';

            // Top wire
            ctx.fillRect(
                components.wires.top.x,
                components.wires.top.y,
                components.wires.top.width,
                components.wires.top.height
            );

            // Bottom wire
            ctx.fillRect(
                components.wires.bottom.x,
                components.wires.bottom.y,
                components.wires.bottom.width,
                components.wires.bottom.height
            );

            // Left wire
            ctx.fillRect(
                components.wires.left.x,
                components.wires.left.y,
                components.wires.left.width,
                components.wires.left.height
            );

            // Right wire
            ctx.fillRect(
                components.wires.right.x,
                components.wires.right.y,
                components.wires.right.width,
                components.wires.right.height
            );

            // Add wire connections
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(components.wires.top.x, components.wires.top.y + components.wires.top.height / 2, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(components.wires.top.x + components.wires.top.width, components.wires.top.y + components.wires.top.height / 2, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(components.wires.bottom.x, components.wires.bottom.y + components.wires.bottom.height / 2, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(components.wires.bottom.x + components.wires.bottom.width, components.wires.bottom.y + components.wires.bottom.height / 2, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw the battery
        function drawBattery() {
            const bat = components.battery;

            // Battery body
            ctx.fillStyle = '#333';
            ctx.fillRect(bat.x, bat.y, bat.width, bat.height);

            // Positive terminal
            ctx.fillStyle = '#e53935';
            ctx.fillRect(bat.x - 5, bat.y + 10, 10, 20);

            // Negative terminal
            ctx.fillStyle = '#1565c0';
            ctx.fillRect(bat.x - 5, bat.y + bat.height - 30, 10, 20);

            // Plus sign
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('+', bat.x + bat.width / 2 - 5, bat.y + 25);

            // Minus sign
            ctx.fillText('-', bat.x + bat.width / 2 - 5, bat.y + bat.height - 15);

            // Label
            ctx.font = '14px Arial';
            ctx.fillText('Battery', bat.x + bat.width / 2 - 25, bat.y + bat.height + 20);
        }

        // Draw the resistor
        function drawResistor() {
            const res = components.resistor;
            
            // Resistor body (zigzag pattern)
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(res.x, res.y + 10);
            
            // Draw zigzag pattern
            const segments = 6;
            const segmentWidth = res.width / segments;
            for (let i = 0; i <= segments; i++) {
                const x = res.x + i * segmentWidth;
                const y = res.y + 10 + (i % 2 === 0 ? 0 : 20);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Resistor ends
            ctx.fillStyle = '#ff9800';
            ctx.fillRect(res.x - 5, res.y + 8, 5, 4);
            ctx.fillRect(res.x + res.width, res.y + 8, 5, 4);
            
            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText('Resistor', res.x + res.width / 2 - 25, res.y + res.height + 20);
        }

        // Draw the switch
        function drawSwitch() {
            const sw = components.switch;

            // Switch base
            ctx.fillStyle = '#757575';
            ctx.fillRect(sw.x, sw.y, sw.width, sw.height);

            // Switch contacts
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(sw.x + 20, sw.y + sw.height / 2, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(sw.x + sw.width - 20, sw.y + sw.height / 2, 6, 0, Math.PI * 2);
            ctx.fill();

            // Switch lever
            ctx.strokeStyle = '#212121';
            ctx.lineWidth = 4;
            ctx.beginPath();

            if (circuitClosed) {
                // Closed position - lever connects the contacts
                ctx.moveTo(sw.x + 20, sw.y + sw.height / 2);
                ctx.lineTo(sw.x + sw.width - 20, sw.y + sw.height / 2);
            } else {
                // Open position - lever is angled
                ctx.moveTo(sw.x + 20, sw.y + sw.height / 2);
                ctx.lineTo(sw.x + 20 + 30, sw.y + sw.height / 2 - 20);
            }

            ctx.stroke();

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText('Switch', sw.x + sw.width / 2 - 20, sw.y + sw.height + 20);
        }

        // Draw a realistic bulb
        function drawBulb() {
            const bulb = components.bulb;
            const centerX = bulb.x + bulb.width / 2;
            const centerY = bulb.y + 30;

            // Draw glow effect when bulb is on
            if (circuitClosed && current > 0) {
                // Outer glow
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, 50
                );
                gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
                gradient.addColorStop(0.7, 'rgba(255, 255, 150, 0.4)');
                gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
                ctx.fill();
            }

            // Bulb glass (outer)
            ctx.fillStyle = (circuitClosed && current > 0) ? '#ffffcc' : '#f0f0f0';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 25, 35, 0, 0, Math.PI * 2);
            ctx.fill();

            // Bulb glass (inner highlight)
            ctx.fillStyle = (circuitClosed && current > 0) ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.ellipse(centerX - 8, centerY - 10, 10, 20, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Bulb base (metal part)
            ctx.fillStyle = '#b0b0b0';
            ctx.beginPath();
            ctx.moveTo(bulb.x + 10, bulb.y + 40);
            ctx.lineTo(bulb.x + bulb.width - 10, bulb.y + 40);
            ctx.lineTo(bulb.x + bulb.width - 5, bulb.y + bulb.height - 10);
            ctx.lineTo(bulb.x + 5, bulb.y + bulb.height - 10);
            ctx.closePath();
            ctx.fill();

            // Base screw threads
            ctx.strokeStyle = '#909090';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bulb.x + 10, bulb.y + 45);
            ctx.lineTo(bulb.x + bulb.width - 10, bulb.y + 45);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(bulb.x + 12, bulb.y + 50);
            ctx.lineTo(bulb.x + bulb.width - 12, bulb.y + 50);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(bulb.x + 8, bulb.y + 55);
            ctx.lineTo(bulb.x + bulb.width - 8, bulb.y + 55);
            ctx.stroke();

            // Filament supports
            ctx.strokeStyle = '#707070';
            ctx.lineWidth = 2;

            // Left support
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY + 15);
            ctx.lineTo(centerX - 5, centerY - 5);
            ctx.stroke();

            // Right support
            ctx.beginPath();
            ctx.moveTo(centerX + 10, centerY + 15);
            ctx.lineTo(centerX + 5, centerY - 5);
            ctx.stroke();

            // Filament
            ctx.strokeStyle = (circuitClosed && current > 0) ? '#ffeb3b' : '#a0a0a0';
            ctx.lineWidth = (circuitClosed && current > 0) ? 3 : 2;

            ctx.beginPath();
            ctx.moveTo(centerX - 5, centerY - 5);
            ctx.lineTo(centerX, centerY);
            ctx.lineTo(centerX + 5, centerY - 5);
            ctx.stroke();

            // Contact points at base
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(bulb.x + 15, bulb.y + bulb.height - 5, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(bulb.x + bulb.width - 15, bulb.y + bulb.height - 5, 3, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText('Light Bulb', centerX - 25, bulb.y + bulb.height + 20);
        }

        // Draw labels for V, I, R
        function drawLabels() {
            ctx.fillStyle = '#4fc3f7';
            ctx.font = 'bold 16px Arial';
            
            // Voltage label at battery
            ctx.fillText('V', components.battery.x + components.battery.width / 2 - 5, components.battery.y - 10);
            
            // Current label
            ctx.fillText('I', 750, 150);
            
            // Resistance label
            ctx.fillText('R', components.resistor.x + components.resistor.width / 2 - 5, components.resistor.y - 10);
        }

        // Draw current flow animation
        function drawCurrentFlow(timeMs) {
            const t = (timeMs || Date.now()) / 1000; // seconds

            // Path coordinates (follow the full rectangular loop)
            const topY = components.wires.top.y + 2;
            const bottomY = components.wires.bottom.y + 2;
            const leftX = components.wires.left.x + 2;
            const rightX = components.wires.top.x + components.wires.top.width - 2;

            // Build segments for the loop (top -> right -> bottom -> left)
            const segments = [
                { x1: leftX, y1: topY, x2: rightX, y2: topY }, // top
                { x1: rightX, y1: topY, x2: rightX, y2: bottomY }, // right
                { x1: rightX, y1: bottomY, x2: leftX, y2: bottomY }, // bottom
                { x1: leftX, y1: bottomY, x2: leftX, y2: topY }, // left
            ];

            // Calculate segment lengths and cumulative lengths
            const segLens = segments.map(s => Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
            const cumLens = [];
            let totalLen = 0;
            for (let L of segLens) {
                cumLens.push(totalLen);
                totalLen += L;
            }

            // Helper: get point (x,y) on path given distance along path (0..totalLen)
            function getPointOnPath(d) {
                d = ((d % totalLen) + totalLen) % totalLen; // wrap
                let segIndex = segLens.findIndex((L, i) => d >= cumLens[i] && d < cumLens[i] + L);
                if (segIndex === -1) segIndex = segLens.length - 1;
                const seg = segments[segIndex];
                const segStart = cumLens[segIndex];
                const segLen = segLens[segIndex];
                const localT = (d - segStart) / segLen;
                const x = seg.x1 + (seg.x2 - seg.x1) * localT;
                const y = seg.y1 + (seg.y2 - seg.y1) * localT;
                return { x, y };
            }

            // Parameters: electrons only, all moving the same direction (one-way)
            const numElectrons = 18;
            const speedElectrons = 140 * (current / 0.15); // Speed proportional to current
            const eSpacing = totalLen / numElectrons;

            // Draw electrons (negative charges) - blue - single direction around the loop
            ctx.fillStyle = '#4fc3f7';
            for (let i = 0; i < numElectrons; i++) {
                const d = (t * speedElectrons + i * eSpacing) % totalLen;
                const p = getPointOnPath(d);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Show current direction with arrows
            ctx.fillStyle = '#ff5722';
            ctx.font = 'bold 20px Arial';
            
            // Arrow on top wire
            const arrowX = 400;
            const arrowY = topY - 15;
            ctx.fillText('→', arrowX, arrowY);
            
            // Arrow on bottom wire (opposite direction)
            ctx.fillText('←', arrowX, bottomY + 20);
        }

        // Update measurements based on circuit state
        function updateMeasurements() {
            if (circuitClosed) {
                // Calculate current using Ohm's Law: I = V / R
                current = voltage / resistance;
                document.getElementById('current-value').textContent = current.toFixed(2) + ' A';
            } else {
                current = 0;
                document.getElementById('current-value').textContent = '0.00 A';
            }
            
            // Update all displays
            document.getElementById('voltage-value').textContent = voltage.toFixed(2) + ' V';
            document.getElementById('resistance-value').textContent = resistance.toFixed(1) + ' Ω';
            
            // Update Ohm's Law display
            document.getElementById('voltage-display').textContent = voltage.toFixed(2);
            document.getElementById('current-display').textContent = current.toFixed(2);
            document.getElementById('resistance-display').textContent = resistance.toFixed(1);
        }

        // Update circuit status display
        function updateCircuitStatus() {
            if (circuitClosed) {
                document.querySelector('.state-indicator').classList.add('active');
                document.querySelector('.state-text').textContent = 'Circuit Closed - Current Flowing';
                document.querySelector('.state-text').className = 'state-text closed';
                document.querySelector('.current-flow').classList.add('active');
            } else {
                document.querySelector('.state-indicator').classList.remove('active');
                document.querySelector('.state-text').textContent = 'Circuit Open - No Current Flow';
                document.querySelector('.state-text').className = 'state-text open';
                document.querySelector('.current-flow').classList.remove('active');
            }
        }

        // Animation loop
        function animate(time) {
            drawCircuit();
            if (circuitClosed && current > 0) {
                drawCurrentFlow(time || Date.now());
                animationId = requestAnimationFrame(animate);
            } else {
                // no continuous animation when open; ensure any running loop is stopped
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        }

        // Toggle circuit function
        function toggleCircuit() {
            circuitClosed = !circuitClosed;
            updateCircuitStatus();

            // Update animation
            if (circuitClosed) {
                // start animation
                if (!animationId) animationId = requestAnimationFrame(animate);
            } else {
                // stop animation
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                // redraw static state once
                drawCircuit();
            }

            updateMeasurements();
        }

        // Update voltage from slider
        function updateVoltage(value) {
            voltage = parseFloat(value);
            document.getElementById('voltage-slider-value').textContent = voltage.toFixed(2) + ' V';
            updateMeasurements();
            
            // Redraw if circuit is closed
            if (circuitClosed) {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                animationId = requestAnimationFrame(animate);
            } else {
                drawCircuit();
            }
        }

        // Update resistance from slider
        function updateResistance(value) {
            resistance = parseFloat(value);
            document.getElementById('resistance-slider-value').textContent = resistance.toFixed(1) + ' Ω';
            updateMeasurements();
            
            // Redraw if circuit is closed
            if (circuitClosed) {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                animationId = requestAnimationFrame(animate);
            } else {
                drawCircuit();
            }
        }

        // Check if click is on the switch
        function isClickOnSwitch(x, y) {
            const sw = components.switch;
            return x >= sw.x && x <= sw.x + sw.width && y >= sw.y && y <= sw.y + sw.height;
        }

        // Handle canvas clicks
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (isClickOnSwitch(x, y)) {
                toggleCircuit();
            }
        });

        // Add event listeners for buttons
        document.getElementById('toggle-circuit').addEventListener('click', toggleCircuit);

        // Add event listeners for sliders
        document.getElementById('voltage-slider').addEventListener('input', (e) => {
            updateVoltage(e.target.value);
        });

        document.getElementById('resistance-slider').addEventListener('input', (e) => {
            updateResistance(e.target.value);
        });

        // Initialize the circuit
        drawCircuit();
        updateMeasurements();
        updateCircuitStatus();
        
        // Initialize slider values
        updateVoltage(document.getElementById('voltage-slider').value);
        updateResistance(document.getElementById('resistance-slider').value);