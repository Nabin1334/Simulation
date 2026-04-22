(function() {
    'use strict';
    
    const canvas = document.getElementById('labCanvas');
    const ctx = canvas.getContext('2d');
    
    const tempValue = document.getElementById('tempValue');
    const mercuryLevel = document.getElementById('mercuryLevel');
    const statusIndicator = document.getElementById('statusIndicator');
    const zeroMark = document.getElementById('zeroMark');
    const hundredMark = document.getElementById('hundredMark');
    const actionButton = document.getElementById('actionButton');
    const resetButton = document.getElementById('resetButton');
    const instructionBox = document.getElementById('instructionBox');
    
    const state = {
        currentStep: 0,
        maxReachedStep: 0,
        temperature: 22.5,
        targetTemp: 22.5,
        
        thermoX: 600,
        thermoY: 300,
        targetX: 600,
        targetY: 300,
        isDragging: false,
        
        iceBathReady: false,
        boilingSetupReady: false,
        zeroMarkY: null,
        hundredMarkY: null,
        scaleCalibrated: false,
        
        animFrame: 0,
        stabilizing: false,
        stabilityCounter: 0,
        
        inIceBath: false,
        inSteam: false
    };
    
    const THERMO = {
        bulbRadius: 40,
        bulbY: 495,
        tubeWidth: 26,
        tubeHeight: 350,
        tubeTop: 145,
        boreWidth: 8,
        scaleWidth: 45,
        scalePadding: 35
    };
    
    const POSITIONS = {
        center: { x: 600, y: 300 },
        iceBath: { x: 250, y: 400 },
        steam: { x: 950, y: 300 }
    };
    
    const EASING = 0.08;
    const TEMP_CHANGE_RATE = 0.12;
    const STABILITY_THRESHOLD = 0.15;
    const STABILITY_FRAMES = 25;
    
    const steps = [
        {
            title: "🧊 Step 1: Prepare Ice Bath",
            instruction: "Set up a beaker with ice and water. The ice-water mixture maintains exactly 0°C - your lower fixed point reference.",
            action: () => {
                state.iceBathReady = true;
                updateUI();
            },
            canSkipTo: true
        },
        {
            title: "❄️ Step 2: Immerse in Ice Water",
            instruction: "Drag the thermometer bulb into the ice bath on the left. Red mercury will contract as it cools to exactly 0°C.",
            action: () => {
                state.targetX = POSITIONS.iceBath.x;
                state.targetY = POSITIONS.iceBath.y;
                state.targetTemp = 0;
                state.stabilizing = true;
                actionButton.disabled = true;
                statusIndicator.textContent = "Cooling...";
                statusIndicator.style.color = "#67e8f9";
                updateUI();
            },
            canSkipTo: true
        },
        {
            title: "📍 Step 3: Mark 0°C Point",
            instruction: "Red mercury stabilized at exactly 0°C. Click to mark this level on the scale - your lower fixed point.",
            action: () => {
                state.zeroMarkY = getMercuryTop();
                state.targetX = POSITIONS.center.x;
                state.targetY = POSITIONS.center.y;
                state.targetTemp = 22.5;
                state.stabilizing = false;
                zeroMark.textContent = "✓ Set";
                zeroMark.style.color = "#8fecb0";
                statusIndicator.textContent = "Marked";
                statusIndicator.style.color = "#8fecb0";
                updateUI();
            },
            requiresStable: true
        },
        {
            title: "🔥 Step 4: Prepare Boiling Water",
            instruction: "Set up boiling water with steam. The steam above is exactly 100°C at standard pressure - your upper fixed point.",
            action: () => {
                state.boilingSetupReady = true;
                state.iceBathReady = false;
                updateUI();
            },
            canSkipTo: state.zeroMarkY !== null
        },
        {
            title: "💨 Step 5: Place in Steam",
            instruction: "Drag the thermometer into the steam on the right. Red mercury will expand and rise to exactly 100°C.",
            action: () => {
                state.targetX = POSITIONS.steam.x;
                state.targetY = POSITIONS.steam.y;
                state.targetTemp = 100;
                state.stabilizing = true;
                actionButton.disabled = true;
                statusIndicator.textContent = "Heating...";
                statusIndicator.style.color = "#fbbf24";
                updateUI();
            },
            canSkipTo: state.zeroMarkY !== null
        },
        {
            title: "📍 Step 6: Mark 100°C Point",
            instruction: "Red mercury stabilized at exactly 100°C. Click to mark this level - your upper fixed point.",
            action: () => {
                state.hundredMarkY = getMercuryTop();
                state.targetX = POSITIONS.center.x;
                state.targetY = POSITIONS.center.y;
                state.targetTemp = 22.5;
                state.stabilizing = false;
                hundredMark.textContent = "✓ Set";
                hundredMark.style.color = "#8fecb0";
                statusIndicator.textContent = "Marked";
                statusIndicator.style.color = "#8fecb0";
                updateUI();
            },
            requiresStable: true
        },
        {
            title: "📏 Step 7: Create Celsius Scale",
            instruction: "Divide the distance between 0°C and 100°C into 100 equal divisions. Each represents 1°C. Calibration complete!",
            action: () => {
                state.scaleCalibrated = true;
                state.boilingSetupReady = false;
                actionButton.textContent = "✓ Complete";
                actionButton.disabled = true;
                statusIndicator.textContent = "Complete";
                statusIndicator.style.color = "#8fecb0";
                state.targetTemp = 25 + Math.random() * 15;
                updateUI();
            },
            canSkipTo: state.zeroMarkY !== null && state.hundredMarkY !== null
        }
    ];
    
    // Step chip click handlers
    document.querySelectorAll('.step-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const stepNum = parseInt(this.dataset.step);
            if (!this.classList.contains('locked') && !this.classList.contains('active')) {
                jumpToStep(stepNum);
            }
        });
    });
    
    function jumpToStep(stepNum) {
        if (stepNum <= state.maxReachedStep || steps[stepNum].canSkipTo) {
            state.currentStep = stepNum;
            
            // Execute the step action
            if (stepNum < steps.length) {
                steps[stepNum].action();
            }
            
            refreshChips();
            updateUI();
        }
    }
    
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    // Unified pointer handling for mouse and touch
    function handlePointerStart(x, y) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (x - rect.left) * scaleX;
        const my = (y - rect.top) * scaleY;
        
        // Check if clicking on thermometer (considering bulb position)
        const thermoScreenY = state.thermoY;
        const bulbScreenY = thermoScreenY - 300 + THERMO.bulbY;
        
        const dx = mx - state.thermoX;
        const dy = my - bulbScreenY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Also check tube area
        const tubeTop = thermoScreenY - 300 + THERMO.tubeTop;
        const tubeBottom = thermoScreenY - 300 + THERMO.bulbY + THERMO.bulbRadius;
        const inTubeX = Math.abs(mx - state.thermoX) < 50;
        const inTubeY = my >= tubeTop && my <= tubeBottom;
        
        if (distance < 80 || (inTubeX && inTubeY)) {
            state.isDragging = true;
            dragOffsetX = mx - state.thermoX;
            dragOffsetY = my - state.thermoY;
            canvas.style.cursor = 'grabbing';
            
            // Cancel any automated movement
            state.targetX = state.thermoX;
            state.targetY = state.thermoY;
        }
    }
    
    function handlePointerMove(x, y) {
        if (!state.isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (x - rect.left) * scaleX;
        const my = (y - rect.top) * scaleY;
        
        // Update thermometer position
        state.thermoX = mx - dragOffsetX;
        state.thermoY = my - dragOffsetY;
        
        // Keep within bounds
        state.thermoX = Math.max(150, Math.min(canvas.width - 150, state.thermoX));
        state.thermoY = Math.max(200, Math.min(canvas.height - 100, state.thermoY));
        
        // Update target to current position to prevent snapping back
        state.targetX = state.thermoX;
        state.targetY = state.thermoY;
        
        updateImmediateTemperature();
    }
    
    function handlePointerEnd() {
        if (state.isDragging) {
            state.isDragging = false;
            canvas.style.cursor = 'grab';
        }
    }
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handlePointerStart(e.clientX, e.clientY);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
    });
    
    canvas.addEventListener('mouseup', handlePointerEnd);
    canvas.addEventListener('mouseleave', handlePointerEnd);
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handlePointerStart(touch.clientX, touch.clientY);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        handlePointerEnd();
    });
    canvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        handlePointerEnd();
    });
    
    function updateImmediateTemperature() {
        const distToIce = Math.hypot(state.thermoX - POSITIONS.iceBath.x, state.thermoY - POSITIONS.iceBath.y);
        const distToSteam = Math.hypot(state.thermoX - POSITIONS.steam.x, state.thermoY - POSITIONS.steam.y);
        
        const wasInIce = state.inIceBath;
        const wasInSteam = state.inSteam;
        
        // More forgiving detection zones - 120 pixels
        if (state.iceBathReady && distToIce < 120) {
            state.inIceBath = true;
            state.inSteam = false;
            state.targetTemp = 0;
            
            // Immediate temperature response when in ice bath
            if (state.isDragging) {
                const proximity = 1 - (distToIce / 120);
                state.temperature = state.temperature * 0.7 + 0 * 0.3 * proximity;
            }
        } else if (state.boilingSetupReady && distToSteam < 120) {
            state.inIceBath = false;
            state.inSteam = true;
            state.targetTemp = 100;
            
            // Immediate temperature response when in steam
            if (state.isDragging) {
                const proximity = 1 - (distToSteam / 120);
                state.temperature = state.temperature * 0.7 + 100 * 0.3 * proximity;
            }
        } else {
            state.inIceBath = false;
            state.inSteam = false;
            state.targetTemp = 22.5;
        }
        
        if (!wasInIce && state.inIceBath) {
            statusIndicator.textContent = "In Ice Bath";
            statusIndicator.style.color = "#67e8f9";
        } else if (!wasInSteam && state.inSteam) {
            statusIndicator.textContent = "In Steam";
            statusIndicator.style.color = "#fbbf24";
        } else if (!state.inIceBath && !state.inSteam && (wasInIce || wasInSteam)) {
            statusIndicator.textContent = "Ambient";
            statusIndicator.style.color = "#e3f0ff";
        }
    }
    
    function getMercuryTop() {
        // Realistic mercury expansion: 0°C at bottom, 100°C at top
        const tempRange = 110; // -10 to 100
        const normalizedTemp = (state.temperature + 10) / tempRange;
        const clampedTemp = Math.max(0, Math.min(1, normalizedTemp));
        
        const mercuryRange = THERMO.tubeHeight - 40;
        return THERMO.tubeTop + 20 + mercuryRange * (1 - clampedTemp);
    }
    
    function calculateCalibratedTemp() {
        if (!state.scaleCalibrated || !state.zeroMarkY || !state.hundredMarkY) {
            return null;
        }
        
        const currentY = getMercuryTop();
        const span = state.zeroMarkY - state.hundredMarkY;
        const pos = (state.zeroMarkY - currentY) / span;
        return pos * 100;
    }
    
    function drawBackground() {
        const grad = ctx.createLinearGradient(0, 500, 0, 600);
        grad.addColorStop(0, '#8b9bb0');
        grad.addColorStop(1, '#6b7e99');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 500, canvas.width, 100);
        
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    function drawIceBath() {
        if (!state.iceBathReady) return;
        
        const x = POSITIONS.iceBath.x;
        const y = POSITIONS.iceBath.y;
        
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(103, 232, 249, 0.5)';
        
        ctx.strokeStyle = '#b8d0f0';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(200, 235, 255, 0.4)';
        
        ctx.beginPath();
        ctx.moveTo(x - 80, y - 45);
        ctx.lineTo(x - 80, y + 115);
        ctx.arcTo(x, y + 138, x + 80, y + 115, 20);
        ctx.lineTo(x + 80, y - 45);
        ctx.stroke();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(103, 232, 249, 0.55)';
        ctx.fillRect(x - 77, y - 5, 154, 120);
        
        ctx.shadowBlur = 12;
        for (let i = 0; i < 10; i++) {
            const wobble = Math.sin((state.animFrame + i * 28) * 0.012) * 2.5;
            const ix = x - 60 + (i % 4) * 38 + wobble;
            const iy = y + 5 + Math.floor(i / 4) * 38 + Math.sin(state.animFrame * 0.02 + i) * 2;
            
            ctx.fillStyle = 'rgba(248, 253, 255, 0.96)';
            ctx.strokeStyle = '#67e8f9';
            ctx.lineWidth = 2.8;
            
            ctx.save();
            ctx.translate(ix, iy);
            ctx.rotate(Math.sin((state.animFrame + i * 38) * 0.007) * 0.1);
            ctx.fillRect(-15, -15, 30, 30);
            ctx.strokeRect(-15, -15, 30, 30);
            
            ctx.strokeStyle = 'rgba(103, 232, 249, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-9, -9);
            ctx.lineTo(9, 9);
            ctx.moveTo(9, -9);
            ctx.lineTo(-9, 9);
            ctx.stroke();
            
            ctx.restore();
        }
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let r = 0; r < 3; r++) {
            const offset = state.animFrame * 0.02 + r;
            ctx.beginPath();
            ctx.ellipse(x, y + 40 + Math.sin(offset) * 3, 60 + Math.sin(offset) * 5, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Inter';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 34, 68, 0.9)';
        ctx.shadowBlur = 14;
        ctx.fillText('🧊 Ice Bath 0°C', x, y - 70);
        
        ctx.restore();
    }
    
    function drawBoilingSetup() {
        if (!state.boilingSetupReady) return;
        
        const x = POSITIONS.steam.x;
        const y = POSITIONS.steam.y;
        
        ctx.save();
        
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 90, y + 230);
        ctx.lineTo(x + 90, y + 230);
        ctx.stroke();
        
        const flicker = Math.sin(state.animFrame * 0.16) * 0.15 + 0.85;
        const flicker2 = Math.cos(state.animFrame * 0.21) * 0.12 + 0.88;
        
        ctx.shadowBlur = 38;
        ctx.shadowColor = 'rgba(255, 140, 0, 0.75)';
        
        ctx.fillStyle = `rgba(59, 130, 246, ${0.6 * flicker})`;
        ctx.beginPath();
        ctx.ellipse(x, y + 195, 58 * flicker2, 46, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(249, 115, 22, ${0.8 * flicker})`;
        ctx.beginPath();
        ctx.ellipse(x, y + 195, 48 * flicker2, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(253, 224, 71, ${flicker})`;
        ctx.beginPath();
        ctx.ellipse(x, y + 195, 32 * flicker2, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(255, 235, 210, 0.35)';
        
        ctx.beginPath();
        ctx.ellipse(x, y + 115, 82, 56, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillRect(x - 30, y + 55, 60, 60);
        ctx.strokeRect(x - 30, y + 55, 60, 60);
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.38)';
        ctx.beginPath();
        ctx.ellipse(x, y + 110, 77, 51, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 14; i++) {
            const bx = x - 50 + (i % 5) * 23 + Math.sin(state.animFrame * 0.07 + i) * 12;
            const by = y + 80 + ((state.animFrame * 1.4 + i * 20) % 90);
            if (by < y + 55 || by > y + 140) continue;
            
            const size = 3.5 + Math.sin(state.animFrame * 0.09 + i) * 1.8;
            ctx.beginPath();
            ctx.arc(bx, by, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 32;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        
        for (let i = 0; i < 8; i++) {
            const offset = state.animFrame * 0.03 + i * 0.5;
            const sx = x - 55 + i * 20 + Math.sin(offset) * 25;
            const sy = y - 25 - ((state.animFrame * 0.8 + i * 35) % 140);
            if (sy > y + 55) continue;
            
            const alpha = Math.max(0, 0.6 - (y - sy) / 200);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 16 - i * 1.2 + Math.sin(offset) * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Inter';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(85, 34, 0, 0.9)';
        ctx.shadowBlur = 14;
        ctx.fillText('💨 Boiling Water 100°C', x, y - 30);
        
        ctx.restore();
    }
    
    function drawThermometer() {
        const x = state.thermoX;
        const y = state.thermoY;
        
        ctx.save();
        ctx.translate(0, y - 300);
        
        ctx.shadowBlur = 32;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
        ctx.shadowOffsetX = 14;
        ctx.shadowOffsetY = 14;
        
        const tubeGrad = ctx.createLinearGradient(x - THERMO.tubeWidth/2, 0, x + THERMO.tubeWidth/2, 0);
        tubeGrad.addColorStop(0, 'rgba(195, 215, 235, 0.98)');
        tubeGrad.addColorStop(0.15, 'rgba(240, 247, 252, 0.98)');
        tubeGrad.addColorStop(0.85, 'rgba(240, 247, 252, 0.98)');
        tubeGrad.addColorStop(1, 'rgba(195, 215, 235, 0.98)');
        
        ctx.fillStyle = tubeGrad;
        ctx.strokeStyle = '#7a92ab';
        ctx.lineWidth = 3.2;
        
        ctx.beginPath();
        ctx.roundRect(x - THERMO.tubeWidth/2, THERMO.tubeTop, THERMO.tubeWidth, THERMO.tubeHeight, [15, 15, 0, 0]);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        const bulbGrad = ctx.createRadialGradient(x - 15, THERMO.bulbY - 15, 0, x, THERMO.bulbY, THERMO.bulbRadius);
        bulbGrad.addColorStop(0, 'rgba(254, 255, 255, 0.98)');
        bulbGrad.addColorStop(0.6, 'rgba(240, 247, 252, 0.98)');
        bulbGrad.addColorStop(1, 'rgba(195, 215, 235, 0.98)');
        
        ctx.beginPath();
        ctx.arc(x, THERMO.bulbY, THERMO.bulbRadius, 0, Math.PI * 2);
        ctx.fillStyle = bulbGrad;
        ctx.fill();
        ctx.strokeStyle = '#7a92ab';
        ctx.lineWidth = 3.2;
        ctx.stroke();
        
        const mercBulbGrad = ctx.createRadialGradient(x - 12, THERMO.bulbY - 12, 0, x, THERMO.bulbY, THERMO.bulbRadius - 9);
        mercBulbGrad.addColorStop(0, '#f87171');
        mercBulbGrad.addColorStop(0.5, '#dc2626');
        mercBulbGrad.addColorStop(1, '#b91c1c');
        
        ctx.beginPath();
        ctx.arc(x, THERMO.bulbY, THERMO.bulbRadius - 9, 0, Math.PI * 2);
        ctx.fillStyle = mercBulbGrad;
        ctx.fill();
        
        const mercTop = getMercuryTop();
        const mercGrad = ctx.createLinearGradient(x - THERMO.boreWidth/2, 0, x + THERMO.boreWidth/2, 0);
        mercGrad.addColorStop(0, '#b91c1c');
        mercGrad.addColorStop(0.3, '#dc2626');
        mercGrad.addColorStop(0.7, '#dc2626');
        mercGrad.addColorStop(1, '#b91c1c');
        
        ctx.fillStyle = mercGrad;
        const mercHeight = THERMO.bulbY - THERMO.bulbRadius + 9 - mercTop;
        if (mercHeight > 0) {
            ctx.fillRect(x - THERMO.boreWidth/2, mercTop, THERMO.boreWidth, mercHeight);
        }
        
        ctx.fillStyle = '#fca5a5';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(x, mercTop - 3.5, THERMO.boreWidth/2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(x - 9, THERMO.tubeTop + 24);
        ctx.lineTo(x - 9, THERMO.tubeTop + THERMO.tubeHeight - 24);
        ctx.stroke();
        
        const scaleX = x - THERMO.tubeWidth/2 - THERMO.scalePadding;
        
        ctx.fillStyle = '#2a2a2a';
        ctx.textAlign = 'right';
        ctx.font = 'bold 13px Inter';
        
        for (let temp = -10; temp <= 110; temp += 10) {
            const tempFraction = (temp + 10) / 120;
            const tickY = THERMO.tubeTop + 20 + (THERMO.tubeHeight - 40) * (1 - tempFraction);
            
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = temp % 20 === 0 ? 2.5 : 1.8;
            ctx.beginPath();
            ctx.moveTo(scaleX + 5, tickY);
            ctx.lineTo(scaleX + THERMO.scaleWidth - 5, tickY);
            ctx.stroke();
            
            if (temp >= 0 && temp <= 100) {
                ctx.fillText(temp + '°', scaleX - 8, tickY + 4);
            }
        }
        
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 1.2;
        for (let temp = -5; temp <= 105; temp += 10) {
            const tempFraction = (temp + 10) / 120;
            const tickY = THERMO.tubeTop + 20 + (THERMO.tubeHeight - 40) * (1 - tempFraction);
            
            ctx.beginPath();
            ctx.moveTo(scaleX + 15, tickY);
            ctx.lineTo(scaleX + THERMO.scaleWidth - 15, tickY);
            ctx.stroke();
        }
        
        const paperX = x - THERMO.tubeWidth/2 - THERMO.scalePadding;
        const paperW = THERMO.scaleWidth;
        
        if (state.zeroMarkY !== null) {
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(paperX, state.zeroMarkY);
            ctx.lineTo(paperX + paperW, state.zeroMarkY);
            ctx.stroke();
            
            ctx.fillStyle = '#1a1a1a';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('0°C', paperX + paperW/2, state.zeroMarkY - 8);
        }
        
        if (state.hundredMarkY !== null) {
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(paperX, state.hundredMarkY);
            ctx.lineTo(paperX + paperW, state.hundredMarkY);
            ctx.stroke();
            
            ctx.fillStyle = '#1a1a1a';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('100°C', paperX + paperW/2, state.hundredMarkY - 8);
        }
        
        if (state.scaleCalibrated && state.zeroMarkY && state.hundredMarkY) {
            const span = state.zeroMarkY - state.hundredMarkY;
            const div = span / 10;
            
            ctx.fillStyle = '#1a1a1a';
            ctx.font = 'bold 13px Inter';
            ctx.textAlign = 'center';
            
            for (let i = 1; i < 10; i++) {
                const tickY = state.hundredMarkY + div * i;
                
                if (i % 2 === 0) {
                    ctx.strokeStyle = '#2563eb';
                    ctx.lineWidth = 3.5;
                    ctx.beginPath();
                    ctx.moveTo(paperX + 5, tickY);
                    ctx.lineTo(paperX + paperW - 5, tickY);
                    ctx.stroke();
                    
                    const temp = 100 - (i * 10);
                    ctx.fillText(temp + '°', paperX + paperW/2, tickY - 6);
                } else {
                    ctx.strokeStyle = '#64748b';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(paperX + 12, tickY);
                    ctx.lineTo(paperX + paperW - 12, tickY);
                    ctx.stroke();
                }
            }
        }
        
        ctx.restore();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackground();
        drawIceBath();
        drawBoilingSetup();
        drawThermometer();
        
        // Only ease to target position if not dragging
        if (!state.isDragging) {
            const dx = state.targetX - state.thermoX;
            const dy = state.targetY - state.thermoY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Only auto-move if there's a significant difference
            if (distance > 5) {
                state.thermoX += dx * EASING;
                state.thermoY += dy * EASING;
                updateImmediateTemperature();
            } else if (distance > 0.5) {
                // Snap to final position when very close
                state.thermoX = state.targetX;
                state.thermoY = state.targetY;
                updateImmediateTemperature();
            }
        }
        
        // Temperature change with faster response
        let changeRate = TEMP_CHANGE_RATE;
        if (state.inIceBath || state.inSteam) {
            changeRate = TEMP_CHANGE_RATE * 2.5; // Even faster when in special zones
        }
        
        const tempDiff = state.targetTemp - state.temperature;
        if (Math.abs(tempDiff) > 0.05) {
            state.temperature += tempDiff * changeRate;
        } else {
            state.temperature = state.targetTemp;
        }
        
        updateDisplay();
        
        // Check for stability
        if (state.stabilizing) {
            if (Math.abs(state.temperature - state.targetTemp) < STABILITY_THRESHOLD) {
                state.stabilityCounter++;
                if (state.stabilityCounter >= STABILITY_FRAMES) {
                    state.stabilizing = false;
                    state.stabilityCounter = 0;
                    actionButton.disabled = false;
                    statusIndicator.textContent = "Stable ✓";
                    statusIndicator.style.color = "#8fecb0";
                }
            } else {
                state.stabilityCounter = 0;
            }
        }
        
        state.animFrame++;
        requestAnimationFrame(animate);
    }
    
    function updateDisplay() {
        tempValue.textContent = state.temperature.toFixed(1);
        
        const mercPercent = ((state.temperature + 10) / 120) * 100;
        mercuryLevel.textContent = mercPercent.toFixed(0) + '%';
    }
    
    function updateUI() {
        if (state.currentStep < steps.length) {
            const step = steps[state.currentStep];
            instructionBox.innerHTML = `
                <div class="instruction-title">${step.title}</div>
                <div>${step.instruction}</div>
            `;
            
            if (state.currentStep === 0) {
                actionButton.textContent = '▶ Start';
            } else if (state.currentStep === steps.length - 1) {
                actionButton.textContent = '✓ Complete';
            } else {
                actionButton.textContent = `▶ Continue`;
            }
        }
    }
    
    function refreshChips() {
        for (let i = 0; i < 7; i++) {
            const chip = document.getElementById(`step${i}`);
            if (chip) {
                chip.classList.remove('active', 'completed', 'locked');
                
                if (i < state.currentStep) {
                    chip.classList.add('completed');
                } else if (i === state.currentStep) {
                    chip.classList.add('active');
                } else if (i > state.maxReachedStep && (!steps[i] || !steps[i].canSkipTo)) {
                    chip.classList.add('locked');
                }
            }
        }
    }
    
    function nextStep() {
        if (state.currentStep >= steps.length) return;
        
        // Check if step requires stability
        if (steps[state.currentStep].requiresStable && state.stabilizing) {
            return; // Can't proceed until stable
        }
        
        steps[state.currentStep].action();
        state.currentStep++;
        
        // Track max reached step
        if (state.currentStep > state.maxReachedStep) {
            state.maxReachedStep = state.currentStep;
        }
        
        refreshChips();
    }
    
    function reset() {
        state.currentStep = 0;
        state.maxReachedStep = 0;
        state.temperature = 22.5;
        state.targetTemp = 22.5;
        state.thermoX = POSITIONS.center.x;
        state.thermoY = POSITIONS.center.y;
        state.targetX = POSITIONS.center.x;
        state.targetY = POSITIONS.center.y;
        state.iceBathReady = false;
        state.boilingSetupReady = false;
        state.zeroMarkY = null;
        state.hundredMarkY = null;
        state.scaleCalibrated = false;
        state.stabilizing = false;
        state.stabilityCounter = 0;
        state.inIceBath = false;
        state.inSteam = false;
        
        zeroMark.textContent = "Not Set";
        zeroMark.style.color = "#e3f0ff";
        hundredMark.textContent = "Not Set";
        hundredMark.style.color = "#e3f0ff";
        statusIndicator.textContent = "Ready";
        statusIndicator.style.color = "#e3f0ff";
        actionButton.disabled = false;
        
        updateUI();
        updateDisplay();
        refreshChips();
    }
    
    actionButton.addEventListener('click', nextStep);
    resetButton.addEventListener('click', reset);
    
    updateUI();
    updateDisplay();
    refreshChips();
    animate();
})();