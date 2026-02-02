 // ===== SIMPLE PHYSICS CONSTANTS =====
        const GRAVITY = 9.8;           // m/s² - How fast gravity accelerates objects
        const AIR_RESISTANCE = 0.001;  // Realistic air resistance coefficient
        const PARACHUTE_DRAG = 0.015;  // Parachute drag coefficient
        const TERMINAL_VELOCITY = 55;  // Terminal velocity for human (m/s)
        const GROUND_LEVEL = 0;        // Ground is at 0 meters

        // ===== CANVAS SETUP =====
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // ===== GAME STATE =====
        let isJumping = false;
        let isLanded = false;
        let time = 0;
        let impactSpeed = 0;

        let jumper = {
            height: 4000,        // meters above ground
            speed: 0,            // m/s downward
            verticalSpeed: 0,    // vertical velocity
            horizontalSpeed: 0,  // horizontal velocity from wind
            weight: 85,          // kg
            parachuteOpen: false,
            x: 0,                // screen position
            y: 0,
            rotation: 0,
            legAngle: 0,
            armAngle: 0,
            isOnGround: false,
            bounce: 0
        };

        let settings = {
            startHeight: 4000,
            windSpeed: 5,
            groundHeight: 0
        };

        // ===== DOM ELEMENTS =====
        const UI = {
            status: document.getElementById('status'),
            startBtn: document.getElementById('startBtn'),
            deployBtn: document.getElementById('deployBtn'),
            resetBtn: document.getElementById('resetBtn'),
            
            heightSlider: document.getElementById('heightSlider'),
            weightSlider: document.getElementById('weightSlider'),
            windSlider: document.getElementById('windSlider'),
            
            heightVal: document.getElementById('heightVal'),
            weightVal: document.getElementById('weightVal'),
            windVal: document.getElementById('windVal'),
            
            speed: document.getElementById('speed'),
            height: document.getElementById('height'),
            time: document.getElementById('time'),
            distance: document.getElementById('distance'),
            
            hudSpeed: document.getElementById('hudSpeed'),
            hudHeight: document.getElementById('hudHeight'),
            hudStatus: document.getElementById('hudStatus'),
            hudImpact: document.getElementById('hudImpact'),
            
            helpBtn: document.getElementById('helpBtn'),
            helpModal: document.getElementById('helpModal')
        };

        // ===== INITIALIZE =====
        function init() {
            isJumping = false;
            isLanded = false;
            time = 0;
            impactSpeed = 0;
            
            jumper.height = parseFloat(UI.heightSlider.value);
            jumper.speed = 0;
            jumper.verticalSpeed = 0;
            jumper.weight = parseFloat(UI.weightSlider.value);
            jumper.parachuteOpen = false;
            jumper.isOnGround = false;
            jumper.bounce = 0;
            jumper.rotation = 0;
            
            settings.startHeight = jumper.height;
            settings.windSpeed = parseFloat(UI.windSlider.value);
            
            jumper.x = canvas.width / 2;
            jumper.y = 50;
            
            UI.status.textContent = `Ready to jump from ${jumper.height} meters!`;
            UI.status.className = 'status-box';
            UI.startBtn.disabled = false;
            UI.deployBtn.disabled = true;
            UI.hudImpact.textContent = '0 m/s';
            
            updateDisplay();
            draw();
        }

        // ===== PHYSICS UPDATE =====
        function updatePhysics(dt) {
            if (!isJumping || isLanded) return;
            
            time += dt;
            
            // Calculate air resistance based on current speed and parachute state
            let dragCoefficient = jumper.parachuteOpen ? PARACHUTE_DRAG : AIR_RESISTANCE;
            let airDrag = dragCoefficient * jumper.verticalSpeed * jumper.verticalSpeed;
            
            // Gravity minus air resistance
            let acceleration = GRAVITY - airDrag;
            
            // Update vertical speed
            jumper.verticalSpeed += acceleration * dt;
            
            // Terminal velocity limit (55 m/s without parachute, 8 m/s with parachute)
            let maxSpeed = jumper.parachuteOpen ? 8 : TERMINAL_VELOCITY;
            if (jumper.verticalSpeed > maxSpeed) {
                jumper.verticalSpeed = maxSpeed;
            }
            
            // Update height
            jumper.height -= jumper.verticalSpeed * dt;
            
            // Calculate horizontal movement from wind (only if parachute is open)
            if (jumper.parachuteOpen) {
                jumper.horizontalSpeed = settings.windSpeed * 0.1;
                jumper.x += jumper.horizontalSpeed * dt * 10; // Scale for visualization
                
                // Keep jumper within bounds
                jumper.x = Math.max(50, Math.min(canvas.width - 50, jumper.x));
            }
            
            // Update screen position with proper perspective
            let progress = 1 - (jumper.height / settings.startHeight);
            jumper.y = 50 + progress * (canvas.height - 200);
            
            // Update rotation during free fall
            if (!jumper.parachuteOpen) {
                jumper.rotation += dt * 0.5;
                jumper.legAngle = Math.sin(time * 3) * 0.3;
                jumper.armAngle = Math.sin(time * 2) * 0.5;
            } else {
                // Stabilize with parachute
                jumper.rotation *= 0.9;
                jumper.legAngle = 0.1;
                jumper.armAngle = 0.2;
            }
            
            // Check for landing
            if (jumper.height <= settings.groundHeight) {
                handleLanding();
            }
            
            updateDisplay();
            updateStatus();
        }

        // ===== HANDLE LANDING =====
        function handleLanding() {
            isJumping = false;
            isLanded = true;
            jumper.height = settings.groundHeight;
            impactSpeed = jumper.verticalSpeed;
            jumper.isOnGround = true;
            
            // Calculate landing impact
            if (jumper.parachuteOpen) {
                if (impactSpeed < 3) {
                    UI.status.textContent = `✅ PERFECT LANDING! Impact: ${impactSpeed.toFixed(1)} m/s`;
                    UI.status.className = 'status-box status-parachute';
                    jumper.bounce = 0.1;
                } else if (impactSpeed < 6) {
                    UI.status.textContent = `⚠️ HARD LANDING! Impact: ${impactSpeed.toFixed(1)} m/s - Roll to absorb impact!`;
                    UI.status.className = 'status-box status-falling';
                    jumper.bounce = 0.3;
                } else if (impactSpeed < 8) {
                    UI.status.textContent = `⚠️ DANGEROUS LANDING! Impact: ${impactSpeed.toFixed(1)} m/s - Possible injury!`;
                    UI.status.className = 'status-box status-danger';
                    jumper.bounce = 0.5;
                } else {
                    UI.status.textContent = `💥 CRASH LANDING! Impact: ${impactSpeed.toFixed(1)} m/s - Too fast for parachute!`;
                    UI.status.className = 'status-box status-danger';
                    jumper.bounce = 1.0;
                }
            } else {
                // No parachute - always fatal
                UI.status.textContent = `💥 FATAL CRASH! No parachute - Impact: ${impactSpeed.toFixed(1)} m/s`;
                UI.status.className = 'status-box status-danger';
                jumper.bounce = 2.0;
            }
            
            // Position jumper on ground
            jumper.y = canvas.height - 100;
            UI.hudStatus.textContent = 'Landed';
            UI.hudImpact.textContent = impactSpeed.toFixed(1) + ' m/s';
        }

        // ===== UPDATE STATUS MESSAGES =====
        function updateStatus() {
            if (!isJumping) return;
            
            UI.hudStatus.textContent = jumper.parachuteOpen ? 'Parachute' : 'Free Fall';
            UI.hudImpact.textContent = jumper.verticalSpeed.toFixed(1) + ' m/s';
            
            if (jumper.parachuteOpen) {
                UI.status.textContent = `Parachute open! Descending at ${jumper.verticalSpeed.toFixed(1)} m/s`;
                UI.status.className = 'status-box status-parachute';
            } else if (jumper.height < 200) {
                UI.status.textContent = `⚠️ CRITICAL! ${Math.round(jumper.height)}m - DEPLOY NOW!`;
                UI.status.className = 'status-box status-danger';
            } else if (jumper.height < 500) {
                UI.status.textContent = `⚠️ DANGER ZONE! ${Math.round(jumper.height)}m - Open parachute immediately!`;
                UI.status.className = 'status-box status-danger';
            } else if (jumper.height < 1000) {
                UI.status.textContent = `⚠️ Prepare to deploy! Height: ${Math.round(jumper.height)}m`;
                UI.status.className = 'status-box status-falling';
            } else {
                UI.status.textContent = `Free falling! Speed: ${jumper.verticalSpeed.toFixed(1)} m/s (${Math.round(jumper.verticalSpeed * 3.6)} km/h)`;
                UI.status.className = 'status-box status-falling';
            }
        }

        // ===== UPDATE ALL DISPLAYS =====
        function updateDisplay() {
            UI.speed.textContent = jumper.verticalSpeed.toFixed(1) + ' m/s';
            UI.height.textContent = Math.round(jumper.height) + ' m';
            UI.time.textContent = time.toFixed(1) + ' s';
            UI.distance.textContent = Math.round(jumper.height) + ' m';
            
            UI.hudSpeed.textContent = jumper.verticalSpeed.toFixed(1) + ' m/s';
            UI.hudHeight.textContent = Math.round(jumper.height) + ' m';
            
            if (isLanded) {
                UI.hudImpact.textContent = impactSpeed.toFixed(1) + ' m/s';
            }
        }

        // ===== DRAWING FUNCTIONS =====
        function draw() {
            // Clear with sky gradient
            const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGrad.addColorStop(0, '#87CEEB'); // Light blue at top
            skyGrad.addColorStop(0.7, '#B0E2FF'); // Medium blue
            skyGrad.addColorStop(1, '#E0F6FF'); // Very light blue at bottom
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw sun with glow effect
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(canvas.width - 100, 80, 40, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw clouds
            drawClouds();
            
            // Draw ground with perspective
            drawGround();
            
            // Draw landing target
            drawTarget();
            
            // Draw jumper
            drawJumper();
            
            // Draw landing effect if bounced
            if (jumper.bounce > 0) {
                drawLandingEffect();
            }
        }

        function drawClouds() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            // Draw multiple clouds at different heights
            for(let i = 0; i < 3; i++) {
                const x = (canvas.width * 0.2 * i + time * 10) % (canvas.width + 300) - 150;
                const y = 100 + i * 50;
                const size = 30 + i * 10;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.arc(x + size * 0.7, y - 10, size * 0.8, 0, Math.PI * 2);
                ctx.arc(x - size * 0.7, y + 10, size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawGround() {
            // Draw distant hills
            ctx.fillStyle = '#2E8B57';
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 60);
            for(let x = 0; x <= canvas.width; x += 20) {
                const y = canvas.height - 60 + Math.sin(x * 0.01 + time * 0.1) * 10;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            ctx.fill();
            
            // Draw main ground
            ctx.fillStyle = '#228B22';
            ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
            
            // Draw grass details
            ctx.strokeStyle = '#196F3D';
            ctx.lineWidth = 1;
            for(let i = 0; i < canvas.width; i += 10) {
                const height = 5 + Math.random() * 10;
                ctx.beginPath();
                ctx.moveTo(i, canvas.height - 60);
                ctx.lineTo(i + Math.random() * 4 - 2, canvas.height - 60 - height);
                ctx.stroke();
            }
        }

        function drawTarget() {
            const targetX = canvas.width / 2;
            const targetY = canvas.height - 30;
            
            // Outer circle
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, 60, 0, Math.PI * 2);
            ctx.stroke();
            
            // Middle circle
            ctx.strokeStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner circle
            ctx.strokeStyle = '#00FF00';
            ctx.beginPath();
            ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.setLineDash([]);
        }

        function drawJumper() {
            ctx.save();
            
            // Apply bounce effect if landed
            let bounceOffset = 0;
            if (jumper.isOnGround && jumper.bounce > 0) {
                bounceOffset = Math.sin(time * 10) * jumper.bounce * 10;
                jumper.bounce *= 0.9; // Reduce bounce over time
                if (jumper.bounce < 0.01) jumper.bounce = 0;
            }
            
            ctx.translate(jumper.x, jumper.y + bounceOffset);
            
            if (!jumper.isOnGround) {
                ctx.rotate(jumper.rotation);
            }
            
            // Draw parachute if open and in air
            if (jumper.parachuteOpen && !jumper.isOnGround) {
                drawParachute();
            }
            
            // Draw jumper body
            drawJumperBody();
            
            ctx.restore();
        }

        function drawParachute() {
            const chuteSize = 60;
            const chuteY = -80;
            
            // Parachute canopy
            const chuteGrad = ctx.createRadialGradient(0, chuteY, 0, 0, chuteY, chuteSize);
            chuteGrad.addColorStop(0, '#FF6347');
            chuteGrad.addColorStop(1, '#DC143C');
            
            ctx.fillStyle = chuteGrad;
            ctx.beginPath();
            
            // Draw realistic parachute shape
            for(let i = 0; i <= 20; i++) {
                const angle = Math.PI + (i / 20) * Math.PI;
                const x = Math.cos(angle) * chuteSize;
                const y = Math.sin(angle) * chuteSize * 0.6 + chuteY;
                if(i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            // Parachute lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.5;
            for(let i = -6; i <= 6; i += 2) {
                ctx.beginPath();
                ctx.moveTo(i * 8, chuteY + 10);
                ctx.lineTo(i * 2, -25);
                ctx.stroke();
            }
        }

        function drawJumperBody() {
            const scale = 1.5;
            
            // Head with helmet
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, -25 * scale, 10 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            // Goggles
            ctx.fillStyle = 'rgba(30, 144, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(0, -25 * scale, 8 * scale, 0.2, Math.PI - 0.2);
            ctx.fill();
            
            // Body
            const bodyGrad = ctx.createLinearGradient(-10 * scale, -15 * scale, 10 * scale, 25 * scale);
            bodyGrad.addColorStop(0, '#DC143C');
            bodyGrad.addColorStop(1, '#8B0000');
            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-8 * scale, -15 * scale, 16 * scale, 30 * scale);
            
            // Arms
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4 * scale;
            ctx.lineCap = 'round';
            
            let leftArmAngle = jumper.armAngle;
            let rightArmAngle = -jumper.armAngle;
            
            if (jumper.isOnGround) {
                leftArmAngle = Math.PI / 4;
                rightArmAngle = -Math.PI / 4;
            }
            
            ctx.beginPath();
            ctx.moveTo(-8 * scale, -10 * scale);
            ctx.lineTo(-20 * scale, 5 * scale);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(8 * scale, -10 * scale);
            ctx.lineTo(20 * scale, 5 * scale);
            ctx.stroke();
            
            // Legs
            let leftLegAngle = jumper.legAngle;
            let rightLegAngle = -jumper.legAngle;
            
            if (jumper.isOnGround) {
                leftLegAngle = Math.PI / 6;
                rightLegAngle = -Math.PI / 6;
            }
            
            ctx.beginPath();
            ctx.moveTo(-4 * scale, 15 * scale);
            ctx.lineTo(-12 * scale, 35 * scale);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(4 * scale, 15 * scale);
            ctx.lineTo(12 * scale, 35 * scale);
            ctx.stroke();
            
            // Boots
            ctx.fillStyle = '#2F4F4F';
            ctx.beginPath();
            ctx.arc(-12 * scale, 40 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(12 * scale, 40 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            // Safety harness
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-6 * scale, 5 * scale);
            ctx.lineTo(6 * scale, 5 * scale);
            ctx.lineTo(6 * scale, 10 * scale);
            ctx.lineTo(-6 * scale, 10 * scale);
            ctx.closePath();
            ctx.stroke();
        }

        function drawLandingEffect() {
            // Draw landing dust/impact effect
            const effectSize = jumper.bounce * 50;
            const alpha = jumper.bounce * 0.5;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(jumper.x, canvas.height - 60, effectSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // ===== GAME LOOP =====
        let lastTime = 0;
        function gameLoop(timestamp) {
            const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
            lastTime = timestamp;
            
            updatePhysics(dt);
            draw();
            
            requestAnimationFrame(gameLoop);
        }

        // ===== EVENT HANDLERS =====
        UI.startBtn.addEventListener('click', () => {
            isJumping = true;
            isLanded = false;
            UI.startBtn.disabled = true;
            UI.deployBtn.disabled = false;
            UI.status.textContent = 'Jumping! Free falling...';
            UI.status.className = 'status-box status-falling';
        });

        UI.deployBtn.addEventListener('click', () => {
            if (isJumping && !jumper.parachuteOpen) {
                jumper.parachuteOpen = true;
                // Gradual slowdown instead of instant
                jumper.verticalSpeed *= 0.7;
                UI.deployBtn.disabled = true;
                UI.status.textContent = 'Parachute deployed! Slowing down...';
                UI.status.className = 'status-box status-parachute';
            }
        });

        UI.resetBtn.addEventListener('click', init);

        // Sliders
        UI.heightSlider.addEventListener('input', e => {
            UI.heightVal.textContent = e.target.value + 'm';
            if (!isJumping) init();
        });

        UI.weightSlider.addEventListener('input', e => {
            UI.weightVal.textContent = e.target.value + 'kg';
            jumper.weight = parseFloat(e.target.value);
        });

        UI.windSlider.addEventListener('input', e => {
            UI.windVal.textContent = e.target.value + ' m/s';
            settings.windSpeed = parseFloat(e.target.value);
        });

        // Keyboard
        window.addEventListener('keydown', e => {
            if (e.code === 'Space' && isJumping && !jumper.parachuteOpen) {
                e.preventDefault();
                UI.deployBtn.click();
            }
            
            // R key to reset
            if (e.code === 'KeyR') {
                e.preventDefault();
                UI.resetBtn.click();
            }
            
            // P key to deploy parachute
            if (e.code === 'KeyP' && isJumping && !jumper.parachuteOpen) {
                e.preventDefault();
                UI.deployBtn.click();
            }
        });

        // Help Modal
        UI.helpBtn.addEventListener('click', () => {
            UI.helpModal.classList.add('show');
        });

        function closeHelp() {
            UI.helpModal.classList.remove('show');
        }

        // ===== START =====
        init();
        gameLoop();
        
        console.log('🪂 Physics Lab Ready!');
        console.log('Learn about gravity, air resistance, and terminal velocity!');
        console.log('Controls: SPACE = Deploy parachute, R = Reset, P = Deploy parachute');