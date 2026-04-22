
        // ============================================
        // REAL CAR SIMULATION ON ROAD
        // ============================================
        
        // Get canvas and context
        const canvas = document.getElementById('simulation-canvas');
        const ctx = canvas.getContext('2d');
        const coordinates = document.getElementById('coordinates');
        
        // Set canvas size to match container
        function resizeCanvas() {
            const container = document.getElementById('simulation-area');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        
        // Initial resize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // ============================================
        // REAL CAR SIMULATION OBJECT
        // ============================================
        let simulation = {
            car: {
                x: 0,
                y: 0,
                speed: 5, // m/s
                direction: 0, // Always East (0 degrees)
                isMoving: false,
                path: [],
                distance: 0,
                startTime: null,
                elapsedTime: 0,
                lastUpdateTime: Date.now(),
                smoothX: 0,
                smoothY: 0,
                wheelRotation: 0,
                velocity: 5 // Same as speed but with direction
            },
            
            // Initialize car position
            initialize: function() {
                this.car.x = 100; // Start at left side (not off-screen)
                this.car.y = canvas.height / 2; // Center of road
                this.car.smoothX = this.car.x;
                this.car.smoothY = this.car.y;
                this.car.path = [];
                this.car.lastUpdateTime = Date.now();
                this.car.wheelRotation = 0;
                this.car.distance = 0;
            },
            
            // Smooth update car position
            update: function() {
                if (!this.car.isMoving) return;
                
                const currentTime = Date.now();
                const deltaTime = (currentTime - this.car.lastUpdateTime) / 1000;
                this.car.lastUpdateTime = currentTime;
                
                // Car always moves East (direction = 0)
                const moveX = this.car.speed * 20; // Scale for better visibility
                
                // Update position
                this.car.x += moveX * deltaTime;
                
                // Smooth interpolation for display
                this.car.smoothX += (this.car.x - this.car.smoothX) * 0.2;
                
                // Update wheel rotation based on speed
                this.car.wheelRotation += this.car.speed * deltaTime * 10;
                
                // Calculate distance moved
                const distanceMoved = moveX * deltaTime;
                this.car.distance += distanceMoved;
                
                // Add to path (with smoothing)
                this.car.path.push({x: this.car.smoothX, y: this.car.smoothY});
                
                // Keep only recent path points
                if (this.car.path.length > 100) {
                    this.car.path.shift();
                }
                
                // Update time
                if (this.car.startTime) {
                    this.car.elapsedTime = (currentTime - this.car.startTime) / 1000;
                }
                
                // Stop when car reaches end of screen
                if (this.car.x > canvas.width - 100) {
                    this.car.x = canvas.width - 100;
                    this.car.smoothX = this.car.x;
                    this.pause();
                }
            },
            
            // Start the simulation
            start: function() {
                this.car.isMoving = true;
                if (!this.car.startTime) {
                    this.car.startTime = Date.now();
                }
                this.car.lastUpdateTime = Date.now();
            },
            
            // Pause the simulation
            pause: function() {
                this.car.isMoving = false;
            },
            
            // Reset simulation
            reset: function() {
                this.initialize();
                this.car.speed = 5;
                this.car.isMoving = false;
                this.car.startTime = null;
                this.car.elapsedTime = 0;
                this.car.lastUpdateTime = Date.now();
            }
        };
        
        // ============================================
        // DOM ELEMENTS
        // ============================================
        const speedSlider = document.getElementById('speed-slider');
        const speedDisplay = document.getElementById('speed-display');
        const currentSpeed = document.getElementById('current-speed');
        const currentVelocity = document.getElementById('current-velocity');
        const currentDistance = document.getElementById('current-distance');
        const currentTime = document.getElementById('current-time');
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        // ============================================
        // DRAWING FUNCTIONS - PERFECT STATIC ROAD
        // ============================================
        function draw() {
            // Clear canvas with sky background
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            drawRoad();
            drawPath();
            drawCar();
            drawIndicators();
            updateCoordinates();
        }
        
        function drawRoad() {
            const roadWidth = canvas.width;
            const laneWidth = 60;
            const totalLanes = 3;
            const totalRoadWidth = laneWidth * totalLanes;
            const roadY = canvas.height / 2 - totalRoadWidth / 2;
            
            // Draw distant mountains (static)
            drawMountains();
            
            // Draw grass (static)
            ctx.fillStyle = '#2E8B57';
            ctx.fillRect(0, 0, roadWidth, roadY);
            ctx.fillRect(0, roadY + totalRoadWidth, roadWidth, canvas.height - (roadY + totalRoadWidth));
            
            // Draw road surface with gradient for 3D effect (static)
            for (let lane = 0; lane < totalLanes; lane++) {
                const laneY = roadY + lane * laneWidth;
                
                const roadGradient = ctx.createLinearGradient(0, laneY, 0, laneY + laneWidth);
                roadGradient.addColorStop(0, '#555');
                roadGradient.addColorStop(0.5, '#444');
                roadGradient.addColorStop(1, '#555');
                ctx.fillStyle = roadGradient;
                ctx.fillRect(0, laneY, roadWidth, laneWidth);
            }
            
            // Draw road shoulders (static)
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, roadY - 8, roadWidth, 8);
            ctx.fillRect(0, roadY + totalRoadWidth, roadWidth, 8);
            
            // Draw lane markings (static, no animation)
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            
            // Draw center dashed line (static)
            ctx.setLineDash([40, 20]);
            ctx.beginPath();
            ctx.moveTo(0, roadY + totalRoadWidth / 2);
            ctx.lineTo(roadWidth, roadY + totalRoadWidth / 2);
            ctx.stroke();
            
            // Draw solid lane lines (static)
            ctx.setLineDash([]);
            for (let i = 1; i < totalLanes; i++) {
                const lineY = roadY + i * laneWidth;
                ctx.beginPath();
                ctx.moveTo(0, lineY);
                ctx.lineTo(roadWidth, lineY);
                ctx.stroke();
            }
            
            // Draw solid edge lines (static)
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, roadY);
            ctx.lineTo(roadWidth, roadY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, roadY + totalRoadWidth);
            ctx.lineTo(roadWidth, roadY + totalRoadWidth);
            ctx.stroke();
            
            // Draw distance markers (static, fixed positions)
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            
            // Fixed markers every 200 pixels (no animation)
            for (let i = 0; i < Math.floor(canvas.width / 200) + 1; i++) {
                const x = i * 200;
                
                // Draw marker line
                ctx.fillRect(x, roadY + totalRoadWidth/2 - 15, 4, 30);
                
                // Draw distance text every 400 pixels
                if (i % 2 === 0) {
                    ctx.fillText(`${i * 200}m`, x, roadY + totalRoadWidth/2 - 30);
                }
            }
            
            // Draw start and finish lines
            drawStartFinishLines(roadY, totalRoadWidth);
            
            ctx.textAlign = 'left';
        }
        
        function drawStartFinishLines(roadY, totalRoadWidth) {
            // Draw start line at 100px
            ctx.fillStyle = '#4CAF50'; // Green for start
            ctx.fillRect(100, roadY, 6, totalRoadWidth);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('START', 103, roadY - 10);
            
            // Draw finish line near end
            ctx.fillStyle = '#F44336'; // Red for finish
            ctx.fillRect(canvas.width - 150, roadY, 6, totalRoadWidth);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('FINISH', canvas.width - 147, roadY - 10);
        }
        
        function drawMountains() {
            // Draw static distant mountains
            ctx.fillStyle = '#5D4037';
            
            // Mountain 1 (static)
            ctx.beginPath();
            ctx.moveTo(-50, canvas.height / 2 - 100);
            ctx.lineTo(canvas.width * 0.3, canvas.height / 2 - 200);
            ctx.lineTo(canvas.width * 0.6, canvas.height / 2 - 100);
            ctx.lineTo(canvas.width + 50, canvas.height / 2);
            ctx.lineTo(canvas.width + 50, canvas.height / 2);
            ctx.lineTo(-50, canvas.height / 2);
            ctx.closePath();
            ctx.fill();
            
            // Mountain 2 (static)
            ctx.fillStyle = '#4E342E';
            ctx.beginPath();
            ctx.moveTo(canvas.width * 0.4, canvas.height / 2 - 100);
            ctx.lineTo(canvas.width * 0.7, canvas.height / 2 - 250);
            ctx.lineTo(canvas.width + 50, canvas.height / 2 - 50);
            ctx.lineTo(canvas.width + 50, canvas.height / 2);
            ctx.lineTo(canvas.width * 0.4, canvas.height / 2);
            ctx.closePath();
            ctx.fill();
            
            // Add some trees/foliage to mountains
            ctx.fillStyle = '#2E7D32';
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * canvas.width;
                const y = canvas.height / 2 - 150 + Math.random() * 50;
                const size = 5 + Math.random() * 10;
                drawTree(x, y, size);
            }
        }
        
        function drawTree(x, y, size) {
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - size, y + size * 2);
            ctx.lineTo(x + size, y + size * 2);
            ctx.closePath();
            ctx.fill();
        }
        
        function drawPath() {
            if (simulation.car.path.length < 2) return;
            
            // Draw path with fading effect
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(simulation.car.path[0].x, simulation.car.path[0].y);
            
            for (let i = 1; i < simulation.car.path.length; i++) {
                ctx.lineTo(simulation.car.path[i].x, simulation.car.path[i].y);
            }
            
            ctx.stroke();
            
            // Draw a fading trail effect
            if (simulation.car.path.length > 2) {
                const gradient = ctx.createLinearGradient(
                    simulation.car.path[0].x, simulation.car.path[0].y,
                    simulation.car.smoothX, simulation.car.smoothY
                );
                gradient.addColorStop(0, 'rgba(33, 150, 243, 0.1)');
                gradient.addColorStop(1, '#2196F3');
                
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(simulation.car.path[0].x, simulation.car.path[0].y);
                ctx.lineTo(simulation.car.smoothX, simulation.car.smoothY);
                ctx.stroke();
            }
        }
        
        function drawCar() {
            ctx.save();
            ctx.translate(simulation.car.smoothX, simulation.car.smoothY);
            
            // Car dimensions
            const carLength = 100;
            const carWidth = 40;
            const carHeight = 35;
            const wheelRadius = 12;
            
            // Draw car shadow (static relative to car)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, carWidth/2 + 5, carLength * 0.4, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw main car body with realistic proportions
            drawCarBody(carLength, carWidth, carHeight);
            
            // Draw wheels with rotation animation
            drawRealisticWheels(carLength, carWidth, wheelRadius);
            
            // Draw windows with reflections
            drawWindows(carLength, carWidth, carHeight);
            
            // Draw car details
            drawCarDetails(carLength, carWidth, carHeight);
            
            ctx.restore();
        }
        
        function drawCarBody(length, width, height) {
            // Main car body with metallic paint effect
            const bodyGradient = ctx.createLinearGradient(-length/2, 0, length/2, 0);
            bodyGradient.addColorStop(0, '#1E88E5'); // Dark blue
            bodyGradient.addColorStop(0.3, '#2196F3'); // Blue
            bodyGradient.addColorStop(0.7, '#64B5F6'); // Light blue
            bodyGradient.addColorStop(1, '#1E88E5'); // Dark blue
            
            // Draw car body with curved shape
            ctx.fillStyle = bodyGradient;
            ctx.beginPath();
            
            // Front curve
            ctx.ellipse(length/2 - 15, 0, 20, width/2, 0, -Math.PI/2, Math.PI/2);
            
            // Top line
            ctx.lineTo(-length/2 + 20, -width/2 + 10);
            
            // Rear curve
            ctx.ellipse(-length/2 + 15, 0, 20, width/2, 0, Math.PI/2, -Math.PI/2);
            
            // Bottom line
            ctx.lineTo(length/2 - 15, width/2);
            
            ctx.closePath();
            ctx.fill();
            
            // Add highlights for metallic effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(-length/3, -width/2 + 15);
            ctx.lineTo(length/4, -width/2 + 5);
            ctx.lineTo(length/3, -width/4);
            ctx.lineTo(-length/4, -width/4 + 10);
            ctx.closePath();
            ctx.fill();
        }
        
        function drawRealisticWheels(carLength, carWidth, wheelRadius) {
            const wheelPositions = [
                {x: -carLength/2 + 25, y: -carWidth/2 + wheelRadius},
                {x: carLength/2 - 35, y: -carWidth/2 + wheelRadius},
                {x: -carLength/2 + 25, y: carWidth/2 - wheelRadius},
                {x: carLength/2 - 35, y: carWidth/2 - wheelRadius}
            ];
            
            wheelPositions.forEach(pos => {
                drawWheel(pos.x, pos.y, wheelRadius);
            });
        }
        
        function drawWheel(x, y, radius) {
            ctx.save();
            ctx.translate(x, y);
            
            // Animate wheel rotation based on car speed
            const rotation = simulation.car.wheelRotation;
            ctx.rotate(rotation);
            
            // Draw tire
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.ellipse(0, 0, radius, radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw tire tread pattern
            ctx.strokeStyle = '#424242';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * radius * 0.3, Math.sin(angle) * radius * 0.6 * 0.3);
                ctx.lineTo(Math.cos(angle) * radius * 0.8, Math.sin(angle) * radius * 0.6 * 0.8);
                ctx.stroke();
            }
            
            // Draw wheel rim
            ctx.fillStyle = '#757575';
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw rim details (spokes)
            ctx.strokeStyle = '#BDBDBD';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3 + rotation * 0.5;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * radius * 0.45, Math.sin(angle) * radius * 0.45 * 0.6);
                ctx.stroke();
            }
            
            // Draw hub cap
            ctx.fillStyle = '#9E9E9E';
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw lug nuts
            ctx.fillStyle = '#616161';
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5;
                const nutX = Math.cos(angle) * radius * 0.35;
                const nutY = Math.sin(angle) * radius * 0.35 * 0.6;
                ctx.beginPath();
                ctx.arc(nutX, nutY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        function drawWindows(carLength, carWidth, carHeight) {
            // Draw windshield
            const windshieldGradient = ctx.createLinearGradient(0, -carWidth/2 + 10, 0, -carWidth/4);
            windshieldGradient.addColorStop(0, '#81D4FA');
            windshieldGradient.addColorStop(1, '#B3E5FC');
            
            ctx.fillStyle = windshieldGradient;
            ctx.beginPath();
            ctx.moveTo(carLength/2 - 25, -carWidth/2 + 15);
            ctx.lineTo(-carLength/4, -carWidth/2 + 10);
            ctx.lineTo(-carLength/4, -carWidth/4);
            ctx.lineTo(carLength/3, -carWidth/4);
            ctx.closePath();
            ctx.fill();
            
            // Draw side windows
            ctx.fillStyle = '#B3E5FC';
            ctx.fillRect(-carLength/4, -carWidth/4, carLength/2, carWidth/3);
            
            // Draw window frames
            ctx.strokeStyle = '#424242';
            ctx.lineWidth = 1.5;
            
            // Windshield frame
            ctx.beginPath();
            ctx.moveTo(carLength/2 - 25, -carWidth/2 + 15);
            ctx.lineTo(-carLength/4, -carWidth/2 + 10);
            ctx.lineTo(-carLength/4, -carWidth/4);
            ctx.lineTo(carLength/3, -carWidth/4);
            ctx.closePath();
            ctx.stroke();
            
            // Side window frame
            ctx.strokeRect(-carLength/4, -carWidth/4, carLength/2, carWidth/3);
            
            // Add window reflections
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(-carLength/8, -carWidth/3);
            ctx.lineTo(carLength/4, -carWidth/3);
            ctx.lineTo(carLength/4, -carWidth/5);
            ctx.lineTo(-carLength/8, -carWidth/5);
            ctx.closePath();
            ctx.fill();
        }
        
        function drawCarDetails(carLength, carWidth, carHeight) {
            // Draw headlights
            const headlightGradient = ctx.createRadialGradient(
                carLength/2 - 10, -8, 0,
                carLength/2 - 10, -8, 8
            );
            headlightGradient.addColorStop(0, '#FFFFFF');
            headlightGradient.addColorStop(0.7, '#FFEB3B');
            headlightGradient.addColorStop(1, 'rgba(255, 235, 59, 0.3)');
            
            ctx.fillStyle = headlightGradient;
            ctx.beginPath();
            ctx.ellipse(carLength/2 - 10, -8, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(carLength/2 - 10, 8, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw taillights
            const taillightGradient = ctx.createRadialGradient(
                -carLength/2 + 10, -8, 0,
                -carLength/2 + 10, -8, 8
            );
            taillightGradient.addColorStop(0, '#FFFFFF');
            taillightGradient.addColorStop(0.7, '#F44336');
            taillightGradient.addColorStop(1, 'rgba(244, 67, 54, 0.3)');
            
            ctx.fillStyle = taillightGradient;
            ctx.beginPath();
            ctx.ellipse(-carLength/2 + 10, -8, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(-carLength/2 + 10, 8, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw grill
            ctx.fillStyle = '#212121';
            ctx.fillRect(carLength/2 - 30, -6, 15, 12);
            
            // Add horizontal grill lines
            ctx.strokeStyle = '#424242';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const y = -6 + i * 3;
                ctx.beginPath();
                ctx.moveTo(carLength/2 - 30, y);
                ctx.lineTo(carLength/2 - 15, y);
                ctx.stroke();
            }
            
            // Draw front bumper
            ctx.fillStyle = '#333';
            ctx.fillRect(carLength/2 - 35, -carWidth/2 + 5, 5, carWidth - 10);
            
            // Draw rear bumper
            ctx.fillRect(-carLength/2, -carWidth/2 + 5, 5, carWidth - 10);
            
            // Draw door handles
            ctx.fillStyle = '#616161';
            ctx.fillRect(-carLength/8, -carWidth/2 + 8, 10, 3);
            ctx.fillRect(carLength/4 - 5, -carWidth/2 + 8, 10, 3);
            
            // Draw side mirrors
            ctx.fillStyle = '#1976D2';
            ctx.fillRect(carLength/2 - 20, -carWidth/2 - 5, 8, 10);
            ctx.fillRect(carLength/2 - 20, carWidth/2 - 5, 8, 10);
            
            // Draw exhaust pipe
            ctx.fillStyle = '#424242';
            ctx.fillRect(-carLength/2 + 5, carWidth/2 - 8, 8, 4);
            
            // Draw license plate
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(-carLength/2 + 20, carWidth/2 - 15, 30, 10);
            ctx.fillStyle = '#333';
            ctx.font = 'bold 8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PHY-9', -carLength/2 + 35, carWidth/2 - 8);
            ctx.textAlign = 'left';
        }
        
        function drawIndicators() {
            const indicatorX = canvas.width - 120;
            const speedY = 80;
            const velocityY = 150;
            
            // Draw speed indicator (green bar)
            ctx.fillStyle = '#4CAF50';
            const speedBarWidth = simulation.car.speed * 6;
            ctx.fillRect(indicatorX - 50, speedY - 10, speedBarWidth, 20);
            
            // Draw speed bar frame
            ctx.strokeStyle = '#388E3C';
            ctx.lineWidth = 2;
            ctx.strokeRect(indicatorX - 50, speedY - 10, 120, 20);
            
            // Draw speed label
            ctx.fillStyle = '#4CAF50';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`Speed: ${simulation.car.speed.toFixed(1)} m/s`, indicatorX - 60, speedY - 20);
            ctx.fillText(`${(simulation.car.speed * 3.6).toFixed(1)} km/h`, indicatorX - 45, speedY + 35);
            
            // Draw velocity indicator (red arrow pointing East)
            ctx.save();
            ctx.translate(indicatorX - 50, velocityY);
            
            // Arrow shaft
            ctx.strokeStyle = '#FF5722';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const arrowLength = simulation.car.speed * 5 + 20;
            ctx.lineTo(arrowLength, 0);
            ctx.stroke();
            
            // Arrow head
            ctx.fillStyle = '#FF5722';
            ctx.beginPath();
            ctx.moveTo(arrowLength, 0);
            ctx.lineTo(arrowLength - 12, -8);
            ctx.lineTo(arrowLength - 12, 8);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
            
            // Draw velocity label
            ctx.fillStyle = '#FF5722';
            ctx.fillText(`Velocity: ${simulation.car.speed.toFixed(1)} m/s East`, indicatorX - 60, velocityY - 20);
        }
        
        function updateCoordinates() {
            const distance = Math.round(simulation.car.distance / 10);
            const time = simulation.car.elapsedTime.toFixed(1);
            coordinates.textContent = `Distance: ${distance} m | Time: ${time} s | Position: ${Math.round(simulation.car.smoothX)} px`;
        }
        
        // ============================================
        // UPDATE DISPLAYS
        // ============================================
        function updateDisplays() {
            // Update control display
            speedDisplay.textContent = `${simulation.car.speed.toFixed(1)} m/s`;
            
            // Update live data
            currentSpeed.textContent = `${simulation.car.speed.toFixed(1)} m/s`;
            currentVelocity.textContent = `${simulation.car.speed.toFixed(1)} m/s East`;
            currentDistance.textContent = `${Math.round(simulation.car.distance / 10)} m`;
            currentTime.textContent = `${simulation.car.elapsedTime.toFixed(1)} s`;
        }
        
        // ============================================
        // EVENT LISTENERS
        // ============================================
        function initEventListeners() {
            // Speed slider
            speedSlider.addEventListener('input', function() {
                simulation.car.speed = parseFloat(this.value);
                updateDisplays();
            });
            
            // Start button
            startBtn.addEventListener('click', function() {
                simulation.start();
                updateDisplays();
            });
            
            // Pause button
            pauseBtn.addEventListener('click', function() {
                simulation.pause();
                updateDisplays();
            });
            
            // Reset button
            resetBtn.addEventListener('click', function() {
                simulation.reset();
                speedSlider.value = 5;
                updateDisplays();
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Space to toggle start/pause
                if (e.code === 'Space') {
                    e.preventDefault();
                    if (simulation.car.isMoving) {
                        simulation.pause();
                    } else {
                        simulation.start();
                    }
                    updateDisplays();
                }
                
                // R to reset
                if (e.code === 'KeyR') {
                    e.preventDefault();
                    simulation.reset();
                    speedSlider.value = 5;
                    updateDisplays();
                }
                
                // Arrow Up/Down for speed
                if (e.code === 'ArrowUp') {
                    e.preventDefault();
                    simulation.car.speed = Math.min(20, simulation.car.speed + 0.5);
                    speedSlider.value = simulation.car.speed;
                    updateDisplays();
                }
                if (e.code === 'ArrowDown') {
                    e.preventDefault();
                    simulation.car.speed = Math.max(0, simulation.car.speed - 0.5);
                    speedSlider.value = simulation.car.speed;
                    updateDisplays();
                }
            });
        }
        
        // ============================================
        // ANIMATION LOOP
        // ============================================
        function animate() {
            simulation.update();
            draw();
            updateDisplays();
            requestAnimationFrame(animate);
        }
        
        // ============================================
        // INITIALIZATION
        // ============================================
        function init() {
            resizeCanvas();
            simulation.initialize();
            initEventListeners();
            updateDisplays();
            animate();
            
            // Start with paused state
            simulation.pause();
        }
        
        // Start when page loads
        window.addEventListener('load', init);