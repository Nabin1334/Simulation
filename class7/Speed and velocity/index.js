 // ============================================
        // WORKING SIMULATION CODE - STARTS IN PAUSED STATE
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
        // SIMULATION OBJECT - STARTS IN PAUSED STATE
        // ============================================
        let simulation = {
            car: {
                x: 0,
                y: 0,
                speed: 5,
                direction: 45, // degrees
                isMoving: false, // CHANGED: Starts as false (paused)
                path: [],
                distance: 0,
                startTime: null,
                elapsedTime: 0
            },
            
            // Initialize car position in center
            initialize: function() {
                this.car.x = canvas.width / 2;
                this.car.y = canvas.height / 2;
                this.car.path = [{x: this.car.x, y: this.car.y}];
            },
            
            // Update car position (only if moving)
            update: function() {
                if (!this.car.isMoving) return; // Only update if car is moving
                
                // Convert direction to radians
                const angle = this.car.direction * Math.PI / 180;
                
                // Calculate movement
                const moveX = Math.cos(angle) * this.car.speed;
                const moveY = Math.sin(angle) * this.car.speed;
                
                // Update position
                this.car.x += moveX;
                this.car.y += moveY;
                
                // Calculate distance
                const distanceMoved = Math.sqrt(moveX * moveX + moveY * moveY);
                this.car.distance += distanceMoved;
                
                // Add to path
                this.car.path.push({x: this.car.x, y: this.car.y});
                if (this.car.path.length > 100) {
                    this.car.path.shift();
                }
                
                // Update time (only if car is moving)
                if (this.car.startTime) {
                    this.car.elapsedTime = (Date.now() - this.car.startTime) / 1000;
                }
                
                // Check boundaries and bounce
                const margin = 30;
                if (this.car.x < margin || this.car.x > canvas.width - margin ||
                    this.car.y < margin || this.car.y > canvas.height - margin) {
                    this.bounce();
                }
            },
            
            // Handle bouncing
            bounce: function() {
                const margin = 30;
                
                // Left boundary
                if (this.car.x < margin) {
                    this.car.x = margin;
                    this.car.direction = 180 - this.car.direction;
                }
                // Right boundary
                else if (this.car.x > canvas.width - margin) {
                    this.car.x = canvas.width - margin;
                    this.car.direction = 180 - this.car.direction;
                }
                // Top boundary
                if (this.car.y < margin) {
                    this.car.y = margin;
                    this.car.direction = -this.car.direction;
                }
                // Bottom boundary
                else if (this.car.y > canvas.height - margin) {
                    this.car.y = canvas.height - margin;
                    this.car.direction = -this.car.direction;
                }
                
                // Keep direction in 0-360 range
                if (this.car.direction < 0) this.car.direction += 360;
                if (this.car.direction >= 360) this.car.direction -= 360;
            },
            
            // Start the simulation
            start: function() {
                this.car.isMoving = true;
                if (!this.car.startTime) {
                    this.car.startTime = Date.now();
                }
            },
            
            // Pause the simulation
            pause: function() {
                this.car.isMoving = false;
            },
            
            // Reset simulation
            reset: function() {
                this.initialize();
                this.car.speed = 5;
                this.car.direction = 45;
                this.car.isMoving = false; // Reset to paused state
                this.car.distance = 0;
                this.car.startTime = null;
                this.car.elapsedTime = 0;
            }
        };
        
        // ============================================
        // DOM ELEMENTS
        // ============================================
        const speedSlider = document.getElementById('speed-slider');
        const directionSlider = document.getElementById('direction-slider');
        const speedDisplay = document.getElementById('speed-display');
        const directionDisplay = document.getElementById('direction-display');
        const currentSpeed = document.getElementById('current-speed');
        const currentVelocity = document.getElementById('current-velocity');
        const currentDistance = document.getElementById('current-distance');
        const currentTime = document.getElementById('current-time');
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        // ============================================
        // DRAWING FUNCTIONS
        // ============================================
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            drawGrid();
            drawPath();
            drawCar();
            drawIndicators();
            updateCoordinates();
        }
        
        function drawGrid() {
            // Draw grid lines
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            
            // Vertical lines
            for (let x = 0; x < canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // Center lines
            ctx.strokeStyle = '#b0b0b0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        }
        
        function drawPath() {
            if (simulation.car.path.length < 2) return;
            
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(simulation.car.path[0].x, simulation.car.path[0].y);
            
            for (let i = 1; i < simulation.car.path.length; i++) {
                ctx.lineTo(simulation.car.path[i].x, simulation.car.path[i].y);
            }
            
            ctx.stroke();
        }
        
        function drawCar() {
            ctx.save();
            ctx.translate(simulation.car.x, simulation.car.y);
            ctx.rotate(simulation.car.direction * Math.PI / 180);
            
            // Car body
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(-25, -15, 50, 30);
            
            // Car windows
            ctx.fillStyle = '#B3E5FC';
            ctx.fillRect(-15, -10, 20, 8);
            ctx.fillRect(5, -10, 15, 8);
            
            // Wheels
            ctx.fillStyle = '#212121';
            ctx.fillRect(-20, -20, 10, 5);
            ctx.fillRect(10, -20, 10, 5);
            ctx.fillRect(-20, 15, 10, 5);
            ctx.fillRect(10, 15, 10, 5);
            
            // Front
            ctx.fillStyle = '#2E7D32';
            ctx.fillRect(20, -12, 5, 24);
            
            ctx.restore();
        }
        
        function drawIndicators() {
            // Draw speed circle (green)
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            const radius = simulation.car.speed * 8;
            ctx.arc(simulation.car.x, simulation.car.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw velocity arrow (red)
            const angle = simulation.car.direction * Math.PI / 180;
            // Keep a small, constant arrow to indicate direction only
            const arrowLength = 30;
            const endX = simulation.car.x + Math.cos(angle) * arrowLength;
            const endY = simulation.car.y + Math.sin(angle) * arrowLength;
            
            ctx.strokeStyle = '#FF5722';
            ctx.fillStyle = '#FF5722';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(simulation.car.x, simulation.car.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Draw arrowhead
            const arrowSize = 12;
            const arrowAngle = Math.atan2(endY - simulation.car.y, endX - simulation.car.x);
            
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
                endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
            );
            ctx.lineTo(
                endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
                endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
            
            // Draw compass
            drawCompass();
        }
        
        function drawCompass() {
            const compassX = canvas.width - 80;
            const compassY = 80;
            const radius = 35;
            
            // Compass circle
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(compassX, compassY, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Direction needle
            const needleAngle = simulation.car.direction * Math.PI / 180;
            ctx.strokeStyle = '#FF5722';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(compassX, compassY);
            ctx.lineTo(
                compassX + Math.cos(needleAngle) * radius * 0.8,
                compassY + Math.sin(needleAngle) * radius * 0.8
            );
            ctx.stroke();
        }
        
        function updateCoordinates() {
            coordinates.textContent = `Position: (${Math.round(simulation.car.x)}, ${Math.round(simulation.car.y)})`;
        }
        
        // ============================================
        // UPDATE DISPLAYS
        // ============================================
        function updateDisplays() {
            // Update control displays
            speedDisplay.textContent = `${simulation.car.speed.toFixed(1)} m/s`;
            directionDisplay.textContent = `${Math.round(simulation.car.direction)}°`;
            
            // Update live data
            currentSpeed.textContent = `${simulation.car.speed.toFixed(1)} m/s`;
            currentVelocity.textContent = `${simulation.car.speed.toFixed(1)} m/s at ${Math.round(simulation.car.direction)}°`;
            currentDistance.textContent = `${Math.round(simulation.car.distance)} m`;
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
            
            // Direction slider
            directionSlider.addEventListener('input', function() {
                simulation.car.direction = parseFloat(this.value);
                updateDisplays();
            });
            
            // Start button - User must click to start
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
                directionSlider.value = 45;
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
                    directionSlider.value = 45;
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
            simulation.initialize(); // Initialize car position
            initEventListeners();
            updateDisplays();
            animate(); // Start animation loop (car won't move yet)
            
            // REMOVED AUTO-START: Car starts in PAUSED state
            // User must click "Start Simulation" to begin
        }
        
        // Start when page loads
        window.addEventListener('load', init);