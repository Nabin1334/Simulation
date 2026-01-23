
        // Circuit simulator with ON/OFF button
        const canvas = document.getElementById('circuitCanvas');
        const ctx = canvas.getContext('2d');
        
        // Circuit state
        let circuit = {
            voltage: 12,
            resistance: 6,
            isRunning: false,
            time: 0,
            lastTime: 0,
            animationId: null,
            electronOffset: 0
        };

        // DOM elements
        const voltageSlider = document.getElementById('voltageSlider');
        const resistanceSlider = document.getElementById('resistanceSlider');
        const voltageValue = document.getElementById('voltageValue');
        const resistanceValue = document.getElementById('resistanceValue');
        const powerBtn = document.getElementById('powerBtn');
        const powerText = document.getElementById('powerText');
        const resetBtn = document.getElementById('resetBtn');

        // Initialize
        updateDisplay();
        drawCircuit();
        updatePowerButton();

        // Update power button appearance
        function updatePowerButton() {
            if (circuit.isRunning) {
                powerBtn.classList.remove('off');
                powerBtn.classList.add('on');
                powerText.textContent = 'Turn OFF';
                powerBtn.innerHTML = '<i class="fas fa-power-off"></i><span id="powerText">Turn OFF</span>';
            } else {
                powerBtn.classList.remove('on');
                powerBtn.classList.add('off');
                powerText.textContent = 'Turn ON';
                powerBtn.innerHTML = '<i class="fas fa-power-off"></i><span id="powerText">Turn ON</span>';
            }
        }

        // Voltage slider
        voltageSlider.addEventListener('input', (e) => {
            circuit.voltage = Number(e.target.value);
            voltageValue.textContent = circuit.voltage.toFixed(1) + ' V';
            updateDisplay();
            drawCircuit();
        });

        // Resistance slider
        resistanceSlider.addEventListener('input', (e) => {
            circuit.resistance = Number(e.target.value);
            resistanceValue.textContent = circuit.resistance.toFixed(1) + ' Ω';
            updateDisplay();
            drawCircuit();
        });

        // Voltage preset buttons
        document.querySelectorAll('[data-voltage]').forEach(button => {
            button.addEventListener('click', (e) => {
                const voltage = parseFloat(e.target.dataset.voltage);
                circuit.voltage = voltage;
                voltageSlider.value = voltage;
                voltageValue.textContent = voltage.toFixed(1) + ' V';
                
                // Update active state
                document.querySelectorAll('[data-voltage]').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                updateDisplay();
                drawCircuit();
            });
        });

        // Resistance preset buttons
        document.querySelectorAll('[data-resistance]').forEach(button => {
            button.addEventListener('click', (e) => {
                const resistance = parseFloat(e.target.dataset.resistance);
                circuit.resistance = resistance;
                resistanceSlider.value = resistance;
                resistanceValue.textContent = resistance.toFixed(1) + ' Ω';
                
                // Update active state
                document.querySelectorAll('[data-resistance]').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                updateDisplay();
                drawCircuit();
            });
        });

        // Power ON/OFF button
        powerBtn.addEventListener('click', () => {
            circuit.isRunning = !circuit.isRunning;
            
            if (circuit.isRunning) {
                circuit.lastTime = Date.now();
                animate();
            } else {
                if (circuit.animationId) {
                    cancelAnimationFrame(circuit.animationId);
                }
            }
            
            updatePowerButton();
            drawCircuit();
        });

        // Reset button
        resetBtn.addEventListener('click', () => {
            circuit.isRunning = false;
            circuit.time = 0;
            circuit.electronOffset = 0;
            circuit.lastTime = 0;
            
            if (circuit.animationId) {
                cancelAnimationFrame(circuit.animationId);
            }
            
            updatePowerButton();
            updateDisplay();
            drawCircuit();
        });

        // Calculate circuit values
        function calculateValues() {
            const current = circuit.voltage / circuit.resistance;
            const power = circuit.voltage * current;
            const energy = power * circuit.time;
            
            return { current, power, energy };
        }

        // Update all displays
        function updateDisplay() {
            const { current, power, energy } = calculateValues();
            
            // Update main values
            document.getElementById('currentValue').textContent = current.toFixed(2);
            document.getElementById('powerValue').textContent = power.toFixed(2);
            document.getElementById('energyValue').textContent = energy.toFixed(2);
            document.getElementById('timeValue').textContent = circuit.time.toFixed(2);
        }

        // Draw the circuit
        function drawCircuit() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const circuitWidth = 450;
            const circuitHeight = 250;
            
            // Draw connecting wires with glow effect
            ctx.strokeStyle = '#4fd1c7';
            ctx.lineWidth = 5;
            ctx.shadowColor = '#4fd1c7';
            ctx.shadowBlur = circuit.isRunning ? 10 : 0;
            
            ctx.beginPath();
            ctx.moveTo(centerX - circuitWidth/2, centerY - circuitHeight/2);
            ctx.lineTo(centerX + circuitWidth/2, centerY - circuitHeight/2);
            ctx.lineTo(centerX + circuitWidth/2, centerY + circuitHeight/2);
            ctx.lineTo(centerX - circuitWidth/2, centerY + circuitHeight/2);
            ctx.closePath();
            ctx.stroke();
            
            ctx.shadowBlur = 0; // Reset shadow
            
            // Draw battery
            const batteryX = centerX - circuitWidth/2;
            const batteryY = centerY;
            
            // Battery body with gradient
            const batteryGradient = ctx.createLinearGradient(batteryX - 50, batteryY - 40, batteryX, batteryY + 40);
            batteryGradient.addColorStop(0, circuit.isRunning ? '#48bb78' : '#e53e3e');
            batteryGradient.addColorStop(1, circuit.isRunning ? '#38a169' : '#c53030');
            
            ctx.fillStyle = batteryGradient;
            ctx.fillRect(batteryX - 50, batteryY - 40, 50, 80);
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 3;
            ctx.strokeRect(batteryX - 50, batteryY - 40, 50, 80);
            
            // Battery terminals
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(batteryX - 60, batteryY - 15, 10, 30);
            
            // Plus symbol
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', batteryX - 25, batteryY + 10);
            
            // Voltage label
            ctx.fillStyle = circuit.isRunning ? '#48bb78' : '#2d3748';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(circuit.voltage.toFixed(1) + 'V', batteryX - 25, batteryY - 60);
            
            // Draw resistor
            const resistorX = centerX + circuitWidth/2;
            const resistorY = centerY;
            
            // Resistor zigzag with heat effect
            const { current } = calculateValues();
            const resistorHeat = circuit.isRunning ? Math.min(1, current / 6) : 0;
            
            ctx.strokeStyle = resistorHeat > 0.7 ? '#f56565' : resistorHeat > 0.4 ? '#ed8936' : '#3182ce';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(resistorX, resistorY - 50);
            
            const zigzagSteps = 8;
            const zigzagWidth = 25;
            const zigzagHeight = 100 / zigzagSteps;
            
            for (let i = 0; i < zigzagSteps; i++) {
                const x = resistorX + (i % 2 === 0 ? zigzagWidth : -zigzagWidth);
                const y = resistorY - 50 + (i + 1) * zigzagHeight;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Resistor box with heat glow
            if (resistorHeat > 0.5 && circuit.isRunning) {
                ctx.fillStyle = `rgba(245, 101, 101, ${resistorHeat * 0.3})`;
                ctx.fillRect(resistorX - 35, resistorY - 60, 70, 120);
            }
            
            ctx.fillStyle = 'rgba(49, 130, 206, 0.1)';
            ctx.fillRect(resistorX - 35, resistorY - 60, 70, 120);
            ctx.strokeStyle = resistorHeat > 0.7 ? '#f56565' : '#3182ce';
            ctx.lineWidth = 3;
            ctx.strokeRect(resistorX - 35, resistorY - 60, 70, 120);
            
            // Resistance label
            ctx.fillStyle = circuit.isRunning ? '#48bb78' : '#2d3748';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(circuit.resistance.toFixed(1) + 'Ω', resistorX, resistorY - 75);
            
            // Draw bulb
            const bulbX = centerX;
            const bulbY = centerY - circuitHeight/2;
            
            // Bulb glow effect
            const brightness = circuit.isRunning ? Math.min(current / 4, 1) : 0;
            
            if (brightness > 0) {
                const gradient = ctx.createRadialGradient(bulbX, bulbY, 0, bulbX, bulbY, 60);
                gradient.addColorStop(0, `rgba(255, 255, 200, ${brightness})`);
                gradient.addColorStop(0.5, `rgba(255, 200, 50, ${brightness * 0.7})`);
                gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(bulbX, bulbY, 60, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Bulb body with glass effect
            const bulbGradient = ctx.createRadialGradient(bulbX, bulbY - 10, 0, bulbX, bulbY, 30);
            bulbGradient.addColorStop(0, brightness > 0.3 ? '#ffeb3b' : '#f7fafc');
            bulbGradient.addColorStop(1, brightness > 0.3 ? '#ff9800' : '#e2e8f0');
            
            ctx.fillStyle = bulbGradient;
            ctx.beginPath();
            ctx.arc(bulbX, bulbY, 30, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Bulb base
            ctx.fillStyle = '#a0aec0';
            ctx.fillRect(bulbX - 15, bulbY + 25, 30, 20);
            ctx.strokeRect(bulbX - 15, bulbY + 25, 30, 20);
            
            // Bulb filament
            ctx.strokeStyle = brightness > 0.3 ? '#ff6b6b' : '#718096';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(bulbX - 10, bulbY - 5);
            ctx.lineTo(bulbX - 5, bulbY + 5);
            ctx.lineTo(bulbX + 5, bulbY - 5);
            ctx.lineTo(bulbX + 10, bulbY + 5);
            ctx.stroke();
            
            // Draw electrons if circuit is running
            if (circuit.isRunning) {
                const { current } = calculateValues();
                const numElectrons = 15;
                const speed = current * 4;
                
                for (let i = 0; i < numElectrons; i++) {
                    const totalPath = circuitWidth * 2 + circuitHeight * 2;
                    const offset = (circuit.electronOffset + (i * totalPath / numElectrons)) % totalPath;
                    
                    let ex, ey;
                    
                    if (offset < circuitWidth) {
                        // Top edge (left to right)
                        ex = centerX - circuitWidth/2 + offset;
                        ey = centerY - circuitHeight/2;
                    } else if (offset < circuitWidth + circuitHeight) {
                        // Right edge (top to bottom)
                        ex = centerX + circuitWidth/2;
                        ey = centerY - circuitHeight/2 + (offset - circuitWidth);
                    } else if (offset < circuitWidth * 2 + circuitHeight) {
                        // Bottom edge (right to left)
                        ex = centerX + circuitWidth/2 - (offset - circuitWidth - circuitHeight);
                        ey = centerY + circuitHeight/2;
                    } else {
                        // Left edge (bottom to top)
                        ex = centerX - circuitWidth/2;
                        ey = centerY + circuitHeight/2 - (offset - circuitWidth * 2 - circuitHeight);
                    }
                    
                    // Electron with glow
                    ctx.fillStyle = '#fbbf24';
                    ctx.beginPath();
                    ctx.arc(ex, ey, 8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Minus sign
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('-', ex, ey + 4);
                }
                
                circuit.electronOffset += speed;
            }
            
            // Draw labels with icons
            ctx.fillStyle = '#2d3748';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('🔋 Battery', batteryX - 50, batteryY + 90);
            ctx.fillText('🔄 Resistor', resistorX - 35, resistorY + 95);
            ctx.fillText('💡 Bulb', bulbX - 20, bulbY + 70);
            
            // Draw current direction arrows
            if (circuit.isRunning) {
                ctx.fillStyle = '#3182ce';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                
                // Arrow on top wire
                ctx.fillText('→', centerX, centerY - circuitHeight/2 - 20);
                
                // Arrow on right wire
                ctx.save();
                ctx.translate(centerX + circuitWidth/2 + 20, centerY);
                ctx.rotate(Math.PI / 2);
                ctx.fillText('→', 0, 0);
                ctx.restore();
                
                // Arrow on bottom wire
                ctx.fillText('←', centerX, centerY + circuitHeight/2 + 20);
                
                // Arrow on left wire
                ctx.save();
                ctx.translate(centerX - circuitWidth/2 - 20, centerY);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText('→', 0, 0);
                ctx.restore();
            }
            
            // Draw circuit status
            ctx.fillStyle = circuit.isRunning ? '#48bb78' : '#e53e3e';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(circuit.isRunning ? 'CIRCUIT ON' : 'CIRCUIT OFF', centerX, centerY + 120);
        }

        // Animation loop
        function animate() {
            if (!circuit.isRunning) return;
            
            const now = Date.now();
            if (circuit.lastTime === 0) circuit.lastTime = now;
            const deltaTime = (now - circuit.lastTime) / 1000;
            circuit.lastTime = now;
            
            circuit.time += deltaTime;
            updateDisplay();
            drawCircuit();
            
            circuit.animationId = requestAnimationFrame(animate);
        }