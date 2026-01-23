 // === EXACT COPY OF YOUR CIRCUIT SIMULATION CODE ===
        // Physics Constants
        const COPPER_RESISTIVITY = 1.68e-8; // Ω·m at 20°C
        const TEMP_COEFFICIENT = 0.0039; // /°C for copper
        const VOLTAGE = 1.5; // Volts
        
        // Circuit state
        let circuitClosed = false;
        let current = 0;
        let resistance = 0;
        let power = 0;
        
        // Resistance factors (using copper wire)
        let wireLength = 1.0; // meters
        let wireDiameter = 1.0; // mm (will convert to area)
        let temperature = 20; // °C
        
        // Get canvas context
        const canvas = document.getElementById("circuit-canvas");
        const ctx = canvas.getContext("2d");
        
        // Component positions and dimensions
        const components = {
            battery: { x: 100, y: 250, width: 60, height: 80 },
            switch: { x: 300, y: 250, width: 80, height: 40 },
            variableResistor: { x: 500, y: 250, width: 120, height: 80 },
            bulb: { x: 700, y: 250, width: 60, height: 80 },
            wires: {
                top: { x: 100, y: 210, width: 600, height: 5 },
                bottom: { x: 100, y: 290, width: 600, height: 5 },
                left: { x: 100, y: 210, width: 5, height: 80 },
                right: { x: 700, y: 210, width: 5, height: 80 },
            },
        };
        
        // Animation
        let electronPosition = 0;
        let animationId = null;
        
        // Calculate cross-sectional area from diameter
        function calculateArea(diameterMM) {
            const radiusM = (diameterMM / 1000) / 2; // Convert mm to m, then get radius
            return Math.PI * radiusM * radiusM; // Area in m²
        }
        
        // Calculate resistance with all factors
        function calculateResistance() {
            // Calculate area in m²
            const areaM2 = calculateArea(wireDiameter);
            
            // Base resistance at 20°C: R = ρL/A
            let R = (COPPER_RESISTIVITY * wireLength) / areaM2;
            
            // Adjust for temperature if not at 20°C
            if (temperature !== 20) {
                const tempChange = temperature - 20;
                R = R * (1 + TEMP_COEFFICIENT * tempChange);
            }
            
            // Minimum resistance to prevent division by zero
            return Math.max(0.001, R);
        }
        
        // Update all measurements
        function updateMeasurements() {
            resistance = calculateResistance();
            
            // Calculate area for display (in mm²)
            const areaMM2 = Math.PI * Math.pow(wireDiameter/2, 2);
            
            if (circuitClosed) {
                // Calculate current using Ohm's Law: I = V / R
                current = VOLTAGE / resistance;
                power = VOLTAGE * current;
                
                document.getElementById("current-value").textContent = current.toFixed(3) + " A";
                document.getElementById("power-value").textContent = power.toFixed(3) + " W";
                
                // Update circuit status on left side
                document.querySelector(".status-indicator").classList.add("active");
                document.querySelector(".status-text").textContent = "Circuit Closed - Current Flowing";
                document.querySelector(".status-text").className = "status-text closed";
                document.querySelector(".current-flow-indicator").classList.add("active");
            } else {
                current = 0;
                power = 0;
                document.getElementById("current-value").textContent = "0.000 A";
                document.getElementById("power-value").textContent = "0.000 W";
                
                // Update circuit status on left side
                document.querySelector(".status-indicator").classList.remove("active");
                document.querySelector(".status-text").textContent = "Circuit Open - No Current Flow";
                document.querySelector(".status-text").className = "status-text open";
                document.querySelector(".current-flow-indicator").classList.remove("active");
            }
            
            // Update all displays
            document.getElementById("resistance-value").textContent = resistance.toFixed(3) + " Ω";
            document.getElementById("length-value").textContent = wireLength.toFixed(1) + " m";
            document.getElementById("area-value").textContent = areaMM2.toFixed(3) + " mm²";
            document.getElementById("temp-value").textContent = temperature + "°C";
            
            // Update temperature effect text
            const tempEffect = document.getElementById("temp-effect");
            if (temperature > 20) {
                const increasePercent = ((temperature - 20) * TEMP_COEFFICIENT * 100).toFixed(1);
                tempEffect.textContent = `+${increasePercent}% resistance increase from 20°C`;
            } else if (temperature < 20) {
                const decreasePercent = ((20 - temperature) * TEMP_COEFFICIENT * 100).toFixed(1);
                tempEffect.textContent = `-${decreasePercent}% resistance decrease from 20°C`;
            } else {
                tempEffect.textContent = "Base temperature (20°C)";
            }
            
            // Update equation display
            updateEquationDisplay();
            
            // Update wire visualization
            updateWireVisualization();
        }
        
        // Update wire visualization
        function updateWireVisualization() {
            const wireViz = document.getElementById("wire-visualization");
            const areaMM2 = Math.PI * Math.pow(wireDiameter/2, 2);
            
            // Calculate visual dimensions
            const visualLength = Math.max(100, Math.min(400, wireLength * 80)); // px
            const visualHeight = Math.max(10, Math.min(40, wireDiameter * 15)); // px
            
            wireViz.innerHTML = `
                <div class="wire-label">Length: ${wireLength.toFixed(1)}m | Diameter: ${wireDiameter.toFixed(1)}mm | Area: ${areaMM2.toFixed(3)}mm²</div>
                <div class="wire-segment" id="wire-element" style="width: ${visualLength}px; height: ${visualHeight}px;"></div>
            `;
            
            // Add electron animation
            const wireElement = document.getElementById("wire-element");
            const numElectrons = Math.max(3, Math.min(20, Math.floor(8 / wireDiameter)));
            
            for (let i = 0; i < numElectrons; i++) {
                const electron = document.createElement('div');
                electron.className = 'electron';
                electron.style.left = `${(i / numElectrons) * 100}%`;
                wireElement.appendChild(electron);
            }
            
            // Start electron animation if circuit is closed
            if (circuitClosed) {
                startElectronAnimation();
            }
        }
        
        // Animate electrons in wire
        function startElectronAnimation() {
            if (animationId) cancelAnimationFrame(animationId);
            
            const electrons = document.querySelectorAll('.electron');
            if (electrons.length === 0) return;
            
            // Speed is inversely proportional to resistance (higher resistance = slower electrons)
            const speed = circuitClosed ? 0.5 / Math.sqrt(resistance) : 0;
            
            function animate() {
                electronPosition = (electronPosition + speed) % 100;
                
                electrons.forEach((electron, index) => {
                    const offset = (electronPosition + (index * 100 / electrons.length)) % 100;
                    electron.style.left = `${offset}%`;
                });
                
                if (circuitClosed) {
                    animationId = requestAnimationFrame(animate);
                }
            }
            
            animate();
        }
        
        // Update equation display with current values
        function updateEquationDisplay() {
            const areaM2 = calculateArea(wireDiameter);
            const tempEffect = temperature !== 20 ? ` × [1 + ${TEMP_COEFFICIENT.toFixed(4)}×(${temperature}-20)]` : '';
            
            // Update the equation in the UI
            const equationEl = document.getElementById('equation-details');
            if (equationEl) {
                equationEl.innerHTML = `
                    <strong>R = ρL/A${tempEffect}</strong><br>
                    = (${COPPER_RESISTIVITY.toExponential(2)} × ${wireLength.toFixed(1)}) / ${areaM2.toExponential(2)}${tempEffect}<br>
                    = <strong>${resistance.toFixed(3)} Ω</strong> | 
                    <strong>I = V/R</strong> = ${VOLTAGE} / ${resistance.toFixed(3)} = <strong>${current.toFixed(3)} A</strong>
                `;
            }
        }
        
        // Draw the complete circuit
        function drawCircuit() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw wires
            drawWires();
            
            // Draw components
            drawBattery();
            drawSwitch();
            drawVariableResistor();
            drawBulb();
            
            // Draw electron flow if circuit is closed
            if (circuitClosed) {
                drawElectronFlow();
            }
        }
        
        // Draw all wires
        function drawWires() {
            ctx.fillStyle = "#555";
            
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
            ctx.fillStyle = "#777";
            [components.wires.top.x, components.wires.top.x + components.wires.top.width,
             components.wires.bottom.x, components.wires.bottom.x + components.wires.bottom.width].forEach(x => {
                ctx.beginPath();
                ctx.arc(x, components.wires.top.y + components.wires.top.height/2, 6, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        // Draw the battery
        function drawBattery() {
            const bat = components.battery;
            
            // Battery body
            ctx.fillStyle = "#333";
            ctx.fillRect(bat.x, bat.y, bat.width, bat.height);
            
            // Terminals
            ctx.fillStyle = "#e53935";
            ctx.fillRect(bat.x - 5, bat.y + 10, 10, 20);
            
            ctx.fillStyle = "#1565c0";
            ctx.fillRect(bat.x - 5, bat.y + bat.height - 30, 10, 20);
            
            // Labels
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px Arial";
            ctx.fillText("+", bat.x + bat.width/2 - 4, bat.y + 25);
            ctx.fillText("-", bat.x + bat.width/2 - 4, bat.y + bat.height - 15);
            
            ctx.font = "14px Arial";
            ctx.fillText(`${VOLTAGE}V`, bat.x + bat.width/2 - 15, bat.y + bat.height + 20);
        }
        
        // Draw the switch
        function drawSwitch() {
            const sw = components.switch;
            
            // Switch base
            ctx.fillStyle = "#757575";
            ctx.fillRect(sw.x, sw.y, sw.width, sw.height);
            
            // Switch contacts
            ctx.fillStyle = "#FFD700";
            ctx.beginPath();
            ctx.arc(sw.x + 20, sw.y + sw.height/2, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(sw.x + sw.width - 20, sw.y + sw.height/2, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Switch lever
            ctx.strokeStyle = "#212121";
            ctx.lineWidth = 4;
            ctx.beginPath();
            
            if (circuitClosed) {
                // Closed position - lever connects the contacts
                ctx.moveTo(sw.x + 20, sw.y + sw.height/2);
                ctx.lineTo(sw.x + sw.width - 20, sw.y + sw.height/2);
            } else {
                // Open position - lever is angled
                ctx.moveTo(sw.x + 20, sw.y + sw.height/2);
                ctx.lineTo(sw.x + 20 + 30, sw.y + sw.height/2 - 20);
            }
            
            ctx.stroke();
            
            // Label
            ctx.fillStyle = "#fff";
            ctx.font = "14px Arial";
            ctx.fillText("Switch", sw.x + sw.width/2 - 20, sw.y + sw.height + 20);
        }
        
        // Draw the variable resistor
        function drawVariableResistor() {
            const res = components.variableResistor;
            
            // Resistor body with color based on resistance
            const resistanceNorm = Math.min(1, resistance / 0.1); // Normalize for copper wire
            const r = Math.floor(200 + 55 * resistanceNorm);
            const g = Math.floor(200 * (1 - resistanceNorm));
            const b = Math.floor(100 * (1 - resistanceNorm));
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(res.x, res.y, res.width, res.height);
            
            // Resistor leads
            ctx.strokeStyle = "#777";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(res.x, res.y + res.height/2);
            ctx.lineTo(res.x - 20, res.y + res.height/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(res.x + res.width, res.y + res.height/2);
            ctx.lineTo(res.x + res.width + 20, res.y + res.height/2);
            ctx.stroke();
            
            // Zigzag pattern inside resistor
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 3;
            const zigzagCount = Math.max(3, Math.min(12, Math.floor(resistance * 50)));
            const segmentWidth = res.width / zigzagCount;
            
            ctx.beginPath();
            ctx.moveTo(res.x, res.y + res.height/2);
            
            for (let i = 0; i < zigzagCount; i++) {
                const x1 = res.x + i * segmentWidth;
                const x2 = res.x + (i + 0.5) * segmentWidth;
                const x3 = res.x + (i + 1) * segmentWidth;
                
                if (i % 2 === 0) {
                    ctx.lineTo(x2, res.y + 15);
                    ctx.lineTo(x3, res.y + res.height/2);
                } else {
                    ctx.lineTo(x2, res.y + res.height - 15);
                    ctx.lineTo(x3, res.y + res.height/2);
                }
            }
            
            ctx.stroke();
            
            // Label
            ctx.fillStyle = "#fff";
            ctx.font = "14px Arial";
            ctx.fillText("Variable Resistor", res.x + res.width/2 - 40, res.y + res.height + 20);
            
            // Resistance value
            ctx.fillStyle = "#4fc3f7";
            ctx.font = "bold 14px Arial";
            ctx.fillText(`${resistance.toFixed(3)}Ω`, res.x + res.width/2 - 25, res.y - 10);
            
            // Temperature effect indicator if not at 20°C
            if (temperature !== 20) {
                ctx.fillStyle = temperature > 20 ? "#ff5722" : "#2196f3";
                ctx.font = "12px Arial";
                const tempText = temperature > 20 ? `+${temperature-20}°C` : `${temperature-20}°C`;
                ctx.fillText(tempText, res.x + res.width/2 - 15, res.y - 25);
            }
        }
        
        // Draw the bulb
        function drawBulb() {
            const bulb = components.bulb;
            const centerX = bulb.x + bulb.width/2;
            const centerY = bulb.y + 30;
            
            // Draw glow effect when bulb is on
            if (circuitClosed && current > 0) {
                const brightness = Math.min(255, 150 + current * 200);
                const glowRadius = Math.min(60, 30 + current * 20);
                
                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
                gradient.addColorStop(0, `rgba(${brightness}, ${brightness}, 100, 0.9)`);
                gradient.addColorStop(0.7, `rgba(${brightness}, ${brightness}, 50, 0.4)`);
                gradient.addColorStop(1, `rgba(${brightness}, ${brightness}, 0, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Bulb glass - brightness depends on current
            const bulbBrightness = circuitClosed ? Math.min(255, 200 + current * 100) : 180;
            ctx.fillStyle = `rgb(${bulbBrightness}, ${bulbBrightness}, 150)`;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 25, 35, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Bulb base
            ctx.fillStyle = "#b0b0b0";
            ctx.beginPath();
            ctx.moveTo(bulb.x + 10, bulb.y + 40);
            ctx.lineTo(bulb.x + bulb.width - 10, bulb.y + 40);
            ctx.lineTo(bulb.x + bulb.width - 5, bulb.y + bulb.height - 10);
            ctx.lineTo(bulb.x + 5, bulb.y + bulb.height - 10);
            ctx.closePath();
            ctx.fill();
            
            // Filament - brightness and thickness depend on current
            const filamentBrightness = circuitClosed ? 255 : 150;
            ctx.strokeStyle = circuitClosed ? `rgb(${filamentBrightness}, ${filamentBrightness}, 50)` : "#a0a0a0";
            ctx.lineWidth = circuitClosed ? Math.max(2, Math.min(5, current * 3)) : 2;
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY - 5);
            ctx.lineTo(centerX, centerY);
            ctx.lineTo(centerX + 8, centerY - 5);
            ctx.stroke();
            
            // Label
            ctx.fillStyle = circuitClosed ? "#ffeb3b" : "#fff";
            ctx.font = "14px Arial";
            ctx.fillText("Light Bulb", centerX - 25, bulb.y + bulb.height + 20);
            
            // Current indicator
            if (circuitClosed) {
                ctx.fillStyle = "#4caf50";
                ctx.font = "bold 12px Arial";
                ctx.fillText(`${current.toFixed(3)}A`, centerX - 20, bulb.y - 15);
            }
        }
        
        // Draw electron flow
        function drawElectronFlow() {
            const t = Date.now() / 1000;
            
            // Electron speed depends on current (drift velocity)
            const electronSpeed = current * 50; // Simplified model
            
            // Draw electrons along the top wire
            const topY = components.wires.top.y + components.wires.top.height/2;
            const startX = components.wires.top.x + 20;
            const endX = components.wires.top.x + components.wires.top.width - 20;
            const wireLengthPx = endX - startX;
            
            const numElectrons = Math.max(5, Math.min(25, Math.floor(current * 10)));
            const spacing = wireLengthPx / numElectrons;
            
            for (let i = 0; i < numElectrons; i++) {
                const x = (startX + i * spacing + t * electronSpeed) % wireLengthPx;
                if (x > startX && x < endX) {
                    // Draw electron
                    ctx.fillStyle = "#4fc3f7";
                    ctx.beginPath();
                    ctx.arc(x, topY, 5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Electron glow
                    const gradient = ctx.createRadialGradient(x, topY, 0, x, topY, 8);
                    gradient.addColorStop(0, "rgba(79, 195, 247, 0.8)");
                    gradient.addColorStop(1, "rgba(79, 195, 247, 0)");
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(x, topY, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Toggle circuit function
        function toggleCircuit() {
            circuitClosed = !circuitClosed;
            
            if (circuitClosed) {
                startElectronAnimation();
            } else {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
            
            updateMeasurements();
            drawCircuit();
        }
        
        // Reset all factors to default
        function resetFactors() {
            wireLength = 1.0;
            wireDiameter = 1.0;
            temperature = 20;
            
            // Update sliders
            document.getElementById("length-slider").value = wireLength;
            document.getElementById("area-slider").value = wireDiameter;
            document.getElementById("temp-slider").value = temperature;
            
            updateMeasurements();
            drawCircuit();
        }
        
        // Check if click is on the switch
        function isClickOnSwitch(x, y) {
            const sw = components.switch;
            return x >= sw.x && x <= sw.x + sw.width && y >= sw.y && y <= sw.y + sw.height;
        }
        
        // Initialize
        function init() {
            // Set canvas size
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            drawCircuit();
            updateMeasurements();
            
            // Add event listeners
            document.getElementById("toggle-circuit").addEventListener("click", toggleCircuit);
            document.getElementById("reset-factors").addEventListener("click", resetFactors);
            
            // Length slider
            document.getElementById("length-slider").addEventListener("input", function(e) {
                wireLength = parseFloat(e.target.value);
                updateMeasurements();
                drawCircuit();
            });
            
            // Area (diameter) slider
            document.getElementById("area-slider").addEventListener("input", function(e) {
                wireDiameter = parseFloat(e.target.value);
                updateMeasurements();
                drawCircuit();
            });
            
            // Temperature slider
            document.getElementById("temp-slider").addEventListener("input", function(e) {
                temperature = parseInt(e.target.value);
                updateMeasurements();
                drawCircuit();
            });
            
            // Handle canvas clicks on switch
            canvas.addEventListener("click", (event) => {
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                if (isClickOnSwitch(x, y)) {
                    toggleCircuit();
                }
            });
            
            // Handle window resize
            window.addEventListener("resize", function() {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                init();
            });
        }
        
        // Start the simulation
        init();