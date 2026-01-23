   const canvas = document.getElementById('circuitCanvas');
    const ctx = canvas.getContext('2d');

    // Circuit state
    let circuitOn = false;
    let voltage = 3.0;
    let resistance = 10;
    let current = 0;
    let power = 0;
    let temperature = 25;
    let heat = 0;
    let time = 0;
    let glowIntensity = 0;
    let animationId = null;

    // Electron positions
    let electronPositions = [];
    for (let i = 0; i < 20; i++) {
        electronPositions.push({
            x: 0,
            progress: i * 0.05
        });
    }

    // UI elements
    const btnOn = document.getElementById('btnOn');
    const btnOff = document.getElementById('btnOff');
    const btnReset = document.getElementById('btnReset');
    const observationText = document.getElementById('observationText');
    const voltageSlider = document.getElementById('voltageSlider');
    const resistanceSlider = document.getElementById('resistanceSlider');
    const voltageDisplay = document.getElementById('voltageDisplay');
    const resistanceDisplay = document.getElementById('resistanceDisplay');
    const tempFill = document.getElementById('tempFill');

    // Event listeners
    btnOn.addEventListener('click', () => {
        circuitOn = true;
        btnOn.disabled = true;
        btnOff.disabled = false;
        updateObservation();
        if (!animationId) {
            animate();
        }
    });

    btnOff.addEventListener('click', () => {
        circuitOn = false;
        btnOn.disabled = false;
        btnOff.disabled = true;
        updateObservation();
    });

    btnReset.addEventListener('click', () => {
        if (circuitOn) {
            btnOff.click();
        }
        voltageSlider.value = 3;
        resistanceSlider.value = 10;
        voltage = 3.0;
        resistance = 10;
        temperature = 25;
        heat = 0;
        time = 0;
        glowIntensity = 0;
        
        document.getElementById('voltageVal').textContent = voltage.toFixed(1);
        document.getElementById('resistanceVal').textContent = resistance;
        voltageDisplay.textContent = `${voltage.toFixed(1)} V`;
        resistanceDisplay.textContent = `${resistance} Ω`;
        
        updateObservation();
        updateTemperatureVisual();
    });

    voltageSlider.addEventListener('input', () => {
        voltage = parseFloat(voltageSlider.value);
        document.getElementById('voltageVal').textContent = voltage.toFixed(1);
        voltageDisplay.textContent = `${voltage.toFixed(1)} V`;
    });

    resistanceSlider.addEventListener('input', () => {
        resistance = parseInt(resistanceSlider.value);
        document.getElementById('resistanceVal').textContent = resistance;
        resistanceDisplay.textContent = `${resistance} Ω`;
    });

    function updateObservation() {
        const statusClass = circuitOn ? 'status-on' : 'status-off';
        const statusText = circuitOn ? 'ON' : 'OFF';

        if (circuitOn) {
            observationText.innerHTML = `
                <span class="status-indicator ${statusClass}"></span>
                Circuit is ${statusText}. Current is flowing, causing the filament to heat up.
                Observe the temperature rise and heat production.
            `;
        } else {
            observationText.innerHTML = `
                <span class="status-indicator ${statusClass}"></span>
                Circuit is ${statusText}. No current flow. Temperature is cooling down.
            `;
        }
    }

    function updateTemperatureVisual() {
        const tempPercentage = Math.min(100, ((temperature - 25) / 175) * 100);
        tempFill.style.width = `${tempPercentage}%`;
    }

    function drawBattery(x, y, label) {
        ctx.fillStyle = '#34495e';
        ctx.fillRect(x, y, 50, 30);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 50, y + 10, 8, 10);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x - 8, y + 10, 8, 10);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + 25, y + 20);
    }

    function drawSwitch(x, y, isOn) {
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 60, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isOn ? '#38ef7d' : '#2c3e50';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (isOn) {
            ctx.lineTo(x + 60, y);
        } else {
            ctx.lineTo(x + 55, y - 20);
        }
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Switch', x + 30, y + 30);
    }

    function drawBulb(x, y, glow) {
        // Draw the base first
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(x - 15, y + 30, 30, 20);
        
        // Draw the glass bulb
        ctx.fillStyle = glow > 0 ? `rgba(255, 255, 220, ${0.6 + glow * 0.4})` : 'rgba(255, 255, 255, 0.3)';
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw the glowing effect
        if (glow > 0) {
            // Outer glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
            gradient.addColorStop(0, `rgba(255, 255, 100, ${glow * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 200, 50, ${glow * 0.4})`);
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Inner glow
            const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
            innerGradient.addColorStop(0, `rgba(255, 255, 200, ${glow * 0.9})`);
            innerGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = innerGradient;
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Draw the filament with proper glow
        const filamentGlow = Math.min(1, glow * 1.5);
        const filamentColor = glow > 0 
            ? `rgb(255, ${Math.floor(200 + 55 * filamentGlow)}, ${Math.floor(100 - 100 * filamentGlow)})`
            : '#7f8c8d';
        
        ctx.strokeStyle = filamentColor;
        ctx.lineWidth = 3 + filamentGlow * 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        
        // Draw a more realistic filament shape
        ctx.moveTo(x - 8, y + 5);
        ctx.quadraticCurveTo(x - 5, y - 10, x, y - 5);
        ctx.quadraticCurveTo(x + 5, y - 10, x + 8, y + 5);
        ctx.stroke();
        
        // Add filament glow effect
        if (glow > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = `rgba(255, 255, 150, ${filamentGlow * 0.7})`;
            ctx.lineWidth = 2 + filamentGlow * 4;
            ctx.beginPath();
            ctx.moveTo(x - 8, y + 5);
            ctx.quadraticCurveTo(x - 5, y - 10, x, y - 5);
            ctx.quadraticCurveTo(x + 5, y - 10, x + 8, y + 5);
            ctx.stroke();
            ctx.restore();
        }
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Bulb', x, y + 70);
    }

    function drawWire(x1, y1, x2, y2, hasElectrons = true) {
        ctx.strokeStyle = circuitOn ? '#4fc3f7' : '#2c3e50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        if (hasElectrons && circuitOn) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            electronPositions.forEach(electron => {
                electron.progress = (electron.progress + 0.002) % 1;
                const ex = x1 + dx * electron.progress;
                const ey = y1 + dy * electron.progress;
                
                // Draw electron with glow effect when circuit is on
                ctx.fillStyle = '#3498db';
                ctx.beginPath();
                ctx.arc(ex, ey, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Add electron glow
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(ex, ey, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
    }

    function drawCircuit() {
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const batteryX = 100;
        const batteryY = 100;
        const switchX = 500;
        const switchY = 100;
        const bulbX = 400;
        const bulbY = 280;
        
        drawBattery(batteryX, batteryY, `${voltage / 2}V`);
        drawBattery(batteryX + 70, batteryY, `${voltage / 2}V`);
        drawSwitch(switchX, switchY, circuitOn);
        drawBulb(bulbX, bulbY, glowIntensity);
        drawWire(batteryX - 8, batteryY + 15, batteryX - 8, batteryY + 200);
        drawWire(batteryX - 8, batteryY + 200, bulbX - 30, bulbY);
        drawWire(bulbX + 30, bulbY, 680, bulbY);
        drawWire(680, bulbY, 680, switchY);
        drawWire(switchX + 60, switchY, 680, switchY);
        drawWire(batteryX + 120 + 8, batteryY + 15, switchX, switchY);
        drawWire(batteryX + 58, batteryY + 15, batteryX + 62, batteryY + 15);
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('+', batteryX + 130, batteryY + 10);
        ctx.fillStyle = '#3498db';
        ctx.fillText('-', batteryX - 25, batteryY + 10);
        
        // Draw voltage and resistance labels
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Voltage: ${voltage}V`, 700, 50);
        ctx.fillText(`Resistance: ${resistance}Ω`, 700, 70);
    }

    function updatePhysics() {
        if (circuitOn) {
            current = voltage / resistance;
            power = current * current * resistance;
            heat += power * dt;
            if (temperature < 200) {
                temperature += power * 0.08;
            }
            // Make glow intensity more responsive to power
            glowIntensity = Math.min(1, (temperature - 25) / 100);
            time += dt;
        } else {
            if (temperature > 25) {
                temperature -= 0.5;
            }
            current = 0;
            power = 0;
            glowIntensity = Math.max(0, glowIntensity - 0.02);
        }
        document.getElementById('currentVal').textContent = current.toFixed(2);
        document.getElementById('powerVal').textContent = power.toFixed(2);
        document.getElementById('tempVal').textContent = Math.round(temperature);
        document.getElementById('heatVal').textContent = heat.toFixed(2);
        updateTemperatureVisual();
    }

    function animate() {
        updatePhysics();
        drawCircuit();
        animationId = requestAnimationFrame(animate);
    }

    // Initial setup
    const dt = 1 / 60;
    document.getElementById('voltageVal').textContent = voltage.toFixed(1);
    document.getElementById('resistanceVal').textContent = resistance;
    updateTemperatureVisual();
    drawCircuit();
    animate();