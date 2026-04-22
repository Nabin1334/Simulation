
        // ============================================
        // FIXED & WORKING SIMULATION
        // ============================================

        // Canvas setup
        const canvas = document.getElementById('roadCanvas');
        const ctx = canvas.getContext('2d');
        
        // ============================================
        // PHYSICS CONSTANTS (Realistic values)
        // ============================================
        const BUS_MASS = 8000; // kg - realistic bus weight
        const MAX_ACCELERATION = 2.0; // m/s² - maximum acceleration
        const MAX_DECELERATION = 2.5; // m/s² - maximum braking
        const FRICTION_COEFFICIENT = 0.015; // Rolling friction
        const AIR_RESISTANCE_COEFFICIENT = 0.3; // Air drag coefficient
        
        // ============================================
        // SIMULATION STATE
        // ============================================
        let simulation = {
            // Speed in m/s (10 km/h = 2.78 m/s initially)
            currentSpeed: 2.78, // m/s
            targetSpeed: 2.78, // m/s
            previousSpeed: 2.78, // m/s (for acceleration calculation)
            
            // Physics calculations
            acceleration: 0, // m/s²
            distance: 0, // meters
            time: 0, // seconds
            force: 0, // Newtons
            
            // Simulation state
            isRunning: true,
            animationId: null,
            lastTimestamp: 0,
            
            // Bus position
            busX: 50, // pixels
            roadOffset: 0 // for road animation
        };
        
        // ============================================
        // BUS DIMENSIONS
        // ============================================
        const BUS = {
            width: 100,
            height: 50,
            wheelRadius: 12,
            wheelRotation: 0
        };
        
        // ============================================
        // DOM ELEMENTS
        // ============================================
        const speedSlider = document.getElementById('speedSlider');
        const targetSpeedValue = document.getElementById('targetSpeedValue');
        const currentSpeedValue = document.getElementById('currentSpeedValue');
        const currentSpeedKmh = document.getElementById('currentSpeedKmh');
        const accelerationValue = document.getElementById('accelerationValue');
        const accelerationData = document.getElementById('accelerationData');
        const accelerationStatus = document.getElementById('accelerationStatus');
        const accelerationType = document.getElementById('accelerationType');
        const distanceValue = document.getElementById('distanceValue');
        const timeValue = document.getElementById('timeValue');
        const forceValue = document.getElementById('forceValue');
        
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        // ============================================
        // PHYSICS CALCULATIONS (CORRECT FORMULAS)
        // ============================================
        
        // Convert km/h to m/s
        function kmhToMs(kmh) {
            return (kmh * 1000) / 3600;
        }
        
        // Convert m/s to km/h
        function msToKmh(ms) {
            return (ms * 3600) / 1000;
        }
        
        // Calculate required acceleration to reach target speed
        function calculateRequiredAcceleration(currentSpeed, targetSpeed, deltaTime) {
            if (deltaTime <= 0) return 0;
            
            const speedDifference = targetSpeed - currentSpeed;
            
            // If we're close to target speed, use small acceleration
            if (Math.abs(speedDifference) < 0.1) {
                return speedDifference / deltaTime;
            }
            
            // Calculate acceleration needed (with limits)
            let requiredAcc = speedDifference / 2.0; // Smooth acceleration
            
            // Apply limits
            if (speedDifference > 0) {
                // Accelerating
                return Math.min(MAX_ACCELERATION, requiredAcc);
            } else {
                // Decelerating
                return Math.max(-MAX_DECELERATION, requiredAcc);
            }
        }
        
        // Calculate forces (physics realism)
        function calculateForces(speed, acceleration) {
            // Rolling friction force
            const frictionForce = FRICTION_COEFFICIENT * BUS_MASS * 9.81;
            
            // Air resistance force (increases with speed squared)
            const airResistance = AIR_RESISTANCE_COEFFICIENT * speed * speed;
            
            // Total resistance force
            const totalResistance = frictionForce + airResistance;
            
            // Net force required (F = m*a)
            const netForce = BUS_MASS * Math.abs(acceleration);
            
            // Engine force = net force + resistance
            return netForce + totalResistance;
        }
        
        // ============================================
        // CANVAS DRAWING FUNCTIONS
        // ============================================
        
        // Initialize canvas with proper dimensions
        function initCanvas() {
            const container = document.querySelector('.simulation-container');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        
        // Draw the complete scene
        function drawScene() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw sky
            ctx.fillStyle = '#dbeafe';
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
            
            // Draw grass
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.2);
            
            // Draw road
            const roadY = canvas.height * 0.8;
            const roadHeight = canvas.height * 0.2;
            
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(0, roadY, canvas.width, roadHeight);
            
            // Draw road markings
            drawRoadMarkings(roadY, roadHeight);
            
            // Draw bus
            drawBus(roadY);
            
            // Draw background elements
            drawBackground();
            
            // Draw UI indicators
            drawUIOverlay();
        }
        
        function drawRoadMarkings(roadY, roadHeight) {
            const markingWidth = 25;
            const markingHeight = 4;
            const markingSpacing = 50;
            
            // Draw center line
            ctx.fillStyle = '#fbbf24';
            for (let x = -simulation.roadOffset % markingSpacing; x < canvas.width; x += markingSpacing) {
                ctx.fillRect(x, roadY + roadHeight/2 - markingHeight/2, markingWidth, markingHeight);
            }
            
            // Draw side lines
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, roadY, canvas.width, 2);
            ctx.fillRect(0, roadY + roadHeight - 2, canvas.width, 2);
        }
        
        function drawBus(roadY) {
            const busY = roadY - BUS.height + 4;
            
            ctx.save();
            ctx.translate(simulation.busX, busY);
            
            // Bus color based on acceleration
            let busColor = '#2563eb'; // Default blue
            if (simulation.acceleration > 0.5) {
                busColor = '#10b981'; // Green for strong acceleration
            } else if (simulation.acceleration < -0.5) {
                busColor = '#ef4444'; // Red for strong deceleration
            }
            
            // Draw bus body
            ctx.fillStyle = busColor;
            ctx.fillRect(0, 0, BUS.width, BUS.height);
            
            // Draw bus top (rounded)
            ctx.fillStyle = '#1d4ed8';
            if (ctx.roundRect) {
                ctx.roundRect(0, 0, BUS.width, BUS.height * 0.4, 8);
            } else {
                ctx.fillRect(0, 0, BUS.width, BUS.height * 0.4);
            }
            ctx.fill();
            
            // Draw windows
            ctx.fillStyle = '#93c5fd';
            for (let i = 0; i < 4; i++) {
                const windowX = 8 + i * 24;
                ctx.fillRect(windowX, 8, 20, 15);
            }
            
            // Update wheel rotation
            BUS.wheelRotation += simulation.currentSpeed * 0.1;
            
            // Draw wheels
            ctx.fillStyle = '#1f2937';
            
            // Front wheel
            const frontWheelX = BUS.width - 25;
            const wheelY = BUS.height - BUS.wheelRadius;
            
            ctx.beginPath();
            ctx.arc(frontWheelX, wheelY, BUS.wheelRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Wheel spoke
            ctx.strokeStyle = '#6b7280';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(frontWheelX, wheelY);
            ctx.lineTo(
                frontWheelX + Math.cos(BUS.wheelRotation) * (BUS.wheelRadius - 4),
                wheelY + Math.sin(BUS.wheelRotation) * (BUS.wheelRadius - 4)
            );
            ctx.stroke();
            
            // Rear wheel
            const rearWheelX = 25;
            ctx.beginPath();
            ctx.arc(rearWheelX, wheelY, BUS.wheelRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Rear wheel spoke
            ctx.beginPath();
            ctx.moveTo(rearWheelX, wheelY);
            ctx.lineTo(
                rearWheelX + Math.cos(BUS.wheelRotation) * (BUS.wheelRadius - 4),
                wheelY + Math.sin(BUS.wheelRotation) * (BUS.wheelRadius - 4)
            );
            ctx.stroke();
            
            // Draw bus text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SCHOOL BUS', BUS.width/2, BUS.height/2 + 4);
            
            // Draw speed on bus
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`${msToKmh(simulation.currentSpeed).toFixed(0)} km/h`, BUS.width/2, BUS.height - 4);
            
            // Draw exhaust when accelerating
            if (simulation.acceleration > 0.3) {
                ctx.fillStyle = '#6b7280';
                for (let i = 0; i < 2; i++) {
                    const size = 2 + Math.sin(Date.now() * 0.01 + i) * 1.5;
                    ctx.beginPath();
                    ctx.arc(-8 - i * 3, BUS.height - 8, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            ctx.restore();
        }
        
        function drawBackground() {
            // Draw clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            
            // Cloud 1
            drawCloud(80, 50, 15, 18, 15);
            // Cloud 2
            drawCloud(250, 65, 18, 22, 18);
            
            // Draw trees
            for (let i = 0; i < 3; i++) {
                const treeX = 80 + i * 120;
                const treeBaseY = canvas.height * 0.6;
                
                // Tree trunk
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(treeX - 4, treeBaseY - 30, 8, 30);
                
                // Tree leaves
                ctx.fillStyle = '#228b22';
                ctx.beginPath();
                ctx.moveTo(treeX, treeBaseY - 75);
                ctx.lineTo(treeX - 20, treeBaseY - 30);
                ctx.lineTo(treeX + 20, treeBaseY - 30);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        function drawCloud(x, y, r1, r2, r3) {
            ctx.beginPath();
            ctx.arc(x, y, r1, 0, Math.PI * 2);
            ctx.arc(x + 25, y - 10, r2, 0, Math.PI * 2);
            ctx.arc(x + 50, y, r3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        function drawUIOverlay() {
            // Draw speed indicator
            drawBox(15, 15, 150, 50, 'SPEED:', `${simulation.currentSpeed.toFixed(1)} m/s`, '#2563eb');
            
            // Draw acceleration indicator
            const accColor = simulation.acceleration > 0.1 ? '#10b981' : 
                           simulation.acceleration < -0.1 ? '#ef4444' : '#6b7280';
            drawBox(canvas.width - 165, 15, 150, 50, 'ACCELERATION:', 
                   `${simulation.acceleration > 0 ? '+' : ''}${simulation.acceleration.toFixed(2)} m/s²`, 
                   accColor);
        }
        
        function drawBox(x, y, width, height, label, value, color) {
            // Box background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, width, height);
            
            // Label
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(label, x + 8, y + 18);
            
            // Value
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = color;
            ctx.fillText(value, x + 8, y + 38);
        }
        
        // ============================================
        // SIMULATION LOOP (FIXED)
        // ============================================
        
        function updateSimulation(timestamp) {
            // Calculate delta time in seconds
            const deltaTime = simulation.lastTimestamp ? 
                Math.min((timestamp - simulation.lastTimestamp) / 1000, 0.1) : 0.016;
            
            simulation.lastTimestamp = timestamp;
            
            if (simulation.isRunning) {
                // Store previous speed for acceleration calculation
                simulation.previousSpeed = simulation.currentSpeed;
                
                // Update time
                simulation.time += deltaTime;
                
                // Calculate required acceleration
                const requiredAcc = calculateRequiredAcceleration(
                    simulation.currentSpeed, 
                    simulation.targetSpeed, 
                    deltaTime
                );
                
                // Apply acceleration to speed
                simulation.currentSpeed += requiredAcc * deltaTime;
                
                // Ensure speed doesn't go negative
                if (simulation.currentSpeed < 0) simulation.currentSpeed = 0;
                
                // Don't overshoot target speed
                if (requiredAcc > 0 && simulation.currentSpeed > simulation.targetSpeed) {
                    simulation.currentSpeed = simulation.targetSpeed;
                } else if (requiredAcc < 0 && simulation.currentSpeed < simulation.targetSpeed) {
                    simulation.currentSpeed = simulation.targetSpeed;
                }
                
                // Calculate actual acceleration (based on speed change)
                simulation.acceleration = deltaTime > 0 ? 
                    (simulation.currentSpeed - simulation.previousSpeed) / deltaTime : 0;
                
                // Update distance
                simulation.distance += simulation.currentSpeed * deltaTime;
                
                // Calculate force
                simulation.force = calculateForces(simulation.currentSpeed, simulation.acceleration);
                
                // Move bus
                simulation.busX += simulation.currentSpeed * 15; // Scale for visualization
                
                // Move road for parallax effect
                simulation.roadOffset += simulation.currentSpeed * 10;
                
                // Reset bus position when off screen
                if (simulation.busX > canvas.width + BUS.width) {
                    simulation.busX = -BUS.width;
                }
            }
            
            // Update UI
            updateUI();
            
            // Draw scene
            drawScene();
            
            // Continue animation
            simulation.animationId = requestAnimationFrame(updateSimulation);
        }
        
        // ============================================
        // UI UPDATE FUNCTIONS
        // ============================================
        
        function updateUI() {
            // Update target speed display
            targetSpeedValue.textContent = Math.round(msToKmh(simulation.targetSpeed));
            
            // Update current speed display
            currentSpeedValue.textContent = simulation.currentSpeed.toFixed(1);
            currentSpeedKmh.textContent = msToKmh(simulation.currentSpeed).toFixed(1) + ' km/h';
            
            // Update acceleration display
            accelerationValue.textContent = simulation.acceleration.toFixed(2);
            accelerationData.textContent = simulation.acceleration.toFixed(2);
            
            // Update other values
            distanceValue.textContent = simulation.distance.toFixed(1);
            timeValue.textContent = simulation.time.toFixed(1);
            forceValue.textContent = Math.round(simulation.force).toLocaleString();
            
            // Update status
            updateStatus();
            
            // Update button state
            updateButtonState();
        }
        
        function updateStatus() {
            let status = '';
            let typeClass = 'zero-acc';
            let typeText = 'CONSTANT SPEED';
            
            if (simulation.currentSpeed < 0.1) {
                status = 'Bus is stopped';
                typeClass = 'zero-acc';
                typeText = 'STOPPED';
            } else if (simulation.acceleration > 0.1) {
                status = `Accelerating to ${Math.round(msToKmh(simulation.targetSpeed))} km/h`;
                typeClass = 'positive-acc';
                typeText = 'ACCELERATING';
            } else if (simulation.acceleration < -0.1) {
                status = `Decelerating to ${Math.round(msToKmh(simulation.targetSpeed))} km/h`;
                typeClass = 'negative-acc';
                typeText = 'DECELERATING';
            } else if (Math.abs(simulation.currentSpeed - simulation.targetSpeed) < 0.1) {
                status = `Constant speed: ${Math.round(msToKmh(simulation.currentSpeed))} km/h`;
                typeClass = 'zero-acc';
                typeText = 'CONSTANT SPEED';
            } else {
                status = `Adjusting speed`;
                typeClass = 'zero-acc';
                typeText = 'ADJUSTING';
            }
            
            accelerationStatus.textContent = status;
            accelerationType.textContent = typeText;
            accelerationType.className = 'acceleration-status ' + typeClass;
        }
        
        function updateButtonState() {
            if (simulation.isRunning) {
                startBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
                startBtn.classList.remove('btn-success');
                startBtn.classList.add('btn-warning');
            } else {
                startBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
                startBtn.classList.remove('btn-warning');
                startBtn.classList.add('btn-success');
            }
        }
        
        // ============================================
        // CONTROL FUNCTIONS
        // ============================================
        
        function startSimulation() {
            if (!simulation.isRunning) {
                simulation.isRunning = true;
                simulation.lastTimestamp = 0; // Reset timestamp for delta calculation
                updateButtonState();
            }
        }
        
        function stopSimulation() {
            simulation.isRunning = false;
            updateButtonState();
        }
        
        function resetSimulation() {
            // Stop current animation
            if (simulation.animationId) {
                cancelAnimationFrame(simulation.animationId);
            }
            
            // Reset simulation state
            simulation.currentSpeed = 2.78; // 10 km/h
            simulation.targetSpeed = 2.78; // 10 km/h
            simulation.previousSpeed = 2.78;
            simulation.acceleration = 0;
            simulation.distance = 0;
            simulation.time = 0;
            simulation.force = 0;
            simulation.busX = 50;
            simulation.roadOffset = 0;
            simulation.isRunning = true;
            simulation.lastTimestamp = 0;
            
            // Reset UI elements
            speedSlider.value = 10;
            
            // Restart animation
            simulation.animationId = requestAnimationFrame(updateSimulation);
            
            // Update UI
            updateUI();
        }
        
        // ============================================
        // EVENT LISTENERS
        // ============================================
        
        function setupEventListeners() {
            // Speed slider
            speedSlider.addEventListener('input', function() {
                const kmh = parseInt(this.value);
                simulation.targetSpeed = kmhToMs(kmh);
                updateUI();
            });
            
            // Control buttons
            startBtn.addEventListener('click', function() {
                if (simulation.isRunning) {
                    stopSimulation();
                } else {
                    startSimulation();
                }
            });
            
            stopBtn.addEventListener('click', function() {
                // Set target speed to 0
                simulation.targetSpeed = 0;
                speedSlider.value = 0;
                updateUI();
            });
            
            resetBtn.addEventListener('click', resetSimulation);
            
            // Keyboard controls
            document.addEventListener('keydown', function(event) {
                switch(event.key) {
                    case ' ':
                    case 'Spacebar':
                        event.preventDefault();
                        if (simulation.isRunning) {
                            stopSimulation();
                        } else {
                            startSimulation();
                        }
                        break;
                    case 'r':
                    case 'R':
                        resetSimulation();
                        break;
                    case 'ArrowUp':
                        // Increase speed by 5 km/h
                        let currentKmh = parseInt(speedSlider.value);
                        currentKmh = Math.min(50, currentKmh + 5);
                        speedSlider.value = currentKmh;
                        simulation.targetSpeed = kmhToMs(currentKmh);
                        updateUI();
                        break;
                    case 'ArrowDown':
                        // Decrease speed by 5 km/h
                        currentKmh = parseInt(speedSlider.value);
                        currentKmh = Math.max(0, currentKmh - 5);
                        speedSlider.value = currentKmh;
                        simulation.targetSpeed = kmhToMs(currentKmh);
                        updateUI();
                        break;
                }
            });
            
            // Window resize
            window.addEventListener('resize', function() {
                initCanvas();
                drawScene();
            });
        }
        
        // ============================================
        // INITIALIZATION
        // ============================================
        
        function init() {
            // Initialize canvas
            initCanvas();
            
            // Set up event listeners
            setupEventListeners();
            
            // Start simulation
            resetSimulation();
            
            // Draw initial scene
            drawScene();
        }
        
        // Start when page loads
        window.addEventListener('load', init);
        
        // ============================================
        // POLYFILL FOR roundRect IF NOT AVAILABLE
        // ============================================
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
                if (width < 2 * radius) radius = width / 2;
                if (height < 2 * radius) radius = height / 2;
                this.beginPath();
                this.moveTo(x + radius, y);
                this.arcTo(x + width, y, x + width, y + height, radius);
                this.arcTo(x + width, y + height, x, y + height, radius);
                this.arcTo(x, y + height, x, y, radius);
                this.arcTo(x, y, x + width, y, radius);
                this.closePath();
                return this;
            };
        }