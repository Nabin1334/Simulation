// Initialize with strict mode
        'use strict';

        // Canvas setup
        const canvas = document.getElementById('roadCanvas');
        const ctx = canvas.getContext('2d');
        let devicePixelRatio = window.devicePixelRatio || 1;

        // Physics constants
        const PIXELS_PER_METER = 5; // Scale: 5 pixels = 1 meter
        const MAX_CANVAS_WIDTH = 1200;

        // Car object with realistic physics
        const car = {
            x: 80,
            y: 0,
            width: 70,
            height: 35,
            velocity: 0,
            acceleration: 2.0,
            initialVelocity: 0,
            wheelRotation: 0,
            maxSpeed: 30 // m/s (≈108 km/h)
        };

        // Simulation state
        const simulation = {
            time: 0,
            distance: 0,
            isRunning: false,
            lastTimestamp: 0,
            animationId: null,
            frameCount: 0,
            physicsUpdateInterval: 16 // ms ≈ 60fps
        };

        // Road elements
        const road = {
            lines: [],
            markers: [],
            trees: [],
            clouds: [],
            mountainPeaks: []
        };

        // DOM Elements
        const dom = {
            accSlider: document.getElementById('accSlider'),
            startSpeedSlider: document.getElementById('startSpeedSlider'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            accValue: document.getElementById('accValue'),
            startSpeedValue: document.getElementById('startSpeedValue'),
            timeDisplay: document.getElementById('timeDisplay'),
            distanceDisplay: document.getElementById('distanceDisplay'),
            speedDisplay: document.getElementById('speedDisplay'),
            accDisplay: document.getElementById('accDisplay'),
            currentSpeed: document.getElementById('currentSpeed')
        };

        // Initialize responsive canvas
        function initCanvas() {
            const container = document.querySelector('.road-container');
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            // Set canvas dimensions with device pixel ratio
            canvas.width = Math.min(width * devicePixelRatio, MAX_CANVAS_WIDTH * devicePixelRatio);
            canvas.height = height * devicePixelRatio;
            
            // Scale context for high DPI displays
            ctx.scale(devicePixelRatio, devicePixelRatio);
            
            // Set car y-position based on canvas height
            car.y = height * 0.65;
            
            // Initialize road elements
            initRoadElements(width, height);
        }

        // Initialize road elements
        function initRoadElements(width, height) {
            // Road lines
            road.lines = [];
            for (let i = 0; i < 15; i++) {
                road.lines.push({
                    x: i * 120,
                    y: height * 0.78,
                    width: 60,
                    height: 4
                });
            }

            // Trees
            road.trees = [];
            for (let i = 0; i < 8; i++) {
                road.trees.push({
                    x: i * 150 + 30,
                    y: height * 0.82,
                    height: 40 + Math.random() * 30,
                    type: Math.floor(Math.random() * 3)
                });
            }

            // Clouds
            road.clouds = [];
            for (let i = 0; i < 5; i++) {
                road.clouds.push({
                    x: Math.random() * width,
                    y: Math.random() * height * 0.4 + 20,
                    size: 30 + Math.random() * 40,
                    speed: 0.2 + Math.random() * 0.3
                });
            }

            // Mountain peaks
            road.mountainPeaks = [];
            for (let i = 0; i < 7; i++) {
                road.mountainPeaks.push({
                    x: (i / 6) * width,
                    y: height * 0.5 - Math.sin(i * 0.8) * 40,
                    height: 60 + Math.random() * 40
                });
            }
        }

        // Update display values
        function updateDisplays() {
            dom.accValue.textContent = `${car.acceleration.toFixed(1)} m/s²`;
            dom.startSpeedValue.textContent = `${car.initialVelocity.toFixed(1)} m/s`;
            dom.timeDisplay.textContent = simulation.time.toFixed(1);
            dom.distanceDisplay.textContent = simulation.distance.toFixed(1);
            dom.speedDisplay.textContent = car.velocity.toFixed(1);
            dom.accDisplay.textContent = car.acceleration.toFixed(1);
            dom.currentSpeed.textContent = car.velocity.toFixed(1);
        }

        // Calculate physics with accurate equations
        function updatePhysics(deltaTime) {
            // Update time
            simulation.time += deltaTime;
            
            // Calculate velocity using: v = u + at
            car.velocity = car.initialVelocity + (car.acceleration * simulation.time);
            
            // Cap maximum speed
            if (Math.abs(car.velocity) > car.maxSpeed) {
                car.velocity = Math.sign(car.velocity) * car.maxSpeed;
            }
            
            // Calculate distance using: s = ut + ½at²
            simulation.distance = (car.initialVelocity * simulation.time) + 
                                 (0.5 * car.acceleration * simulation.time * simulation.time);
            
            // Update car position (convert meters to pixels)
            const maxX = canvas.width / devicePixelRatio - car.width - 50;
            car.x = Math.min(80 + (simulation.distance * PIXELS_PER_METER), maxX);
            
            // Update wheel rotation
            car.wheelRotation += car.velocity * 0.1;
        }

        // Update road elements
        function updateRoadElements(width, height) {
            // Update road lines
            road.lines.forEach(line => {
                line.x -= car.velocity * 2;
                if (line.x < -line.width) {
                    line.x = width + line.width;
                }
            });

            // Update trees
            road.trees.forEach(tree => {
                tree.x -= car.velocity * 0.5;
                if (tree.x < -100) {
                    tree.x = width + 100;
                    tree.height = 40 + Math.random() * 30;
                }
            });

            // Update clouds
            road.clouds.forEach(cloud => {
                cloud.x -= cloud.speed;
                if (cloud.x < -cloud.size * 2) {
                    cloud.x = width + cloud.size;
                    cloud.y = Math.random() * height * 0.4 + 20;
                }
            });
        }

        // Draw scene
        function drawScene() {
            const width = canvas.width / devicePixelRatio;
            const height = canvas.height / devicePixelRatio;
            
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw sky gradient
            const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
            skyGradient.addColorStop(0, '#87CEEB');
            skyGradient.addColorStop(1, '#4A90E2');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, width, height * 0.6);
            
            // Draw sun
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(width - 80, 60, 35, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw mountains
            ctx.fillStyle = '#2C5282';
            ctx.beginPath();
            ctx.moveTo(0, height * 0.6);
            road.mountainPeaks.forEach(peak => {
                ctx.lineTo(peak.x, peak.y);
            });
            ctx.lineTo(width, height * 0.6);
            ctx.fill();
            
            // Draw ground
            ctx.fillStyle = '#2D5016';
            ctx.fillRect(0, height * 0.6, width, height * 0.4);
            
            // Draw trees
            road.trees.forEach(tree => {
                // Tree trunk
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(tree.x, tree.y, 12, -tree.height);
                
                // Tree leaves
                ctx.fillStyle = tree.type === 0 ? '#228B22' : tree.type === 1 ? '#32CD32' : '#2E8B57';
                ctx.beginPath();
                ctx.arc(tree.x + 6, tree.y - tree.height, 20, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw road
            ctx.fillStyle = '#444';
            ctx.fillRect(0, height * 0.75, width, 60);
            
            // Draw road lines
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 4;
            ctx.setLineDash([20, 25]);
            road.lines.forEach(line => {
                ctx.beginPath();
                ctx.moveTo(line.x, line.y);
                ctx.lineTo(line.x + line.width, line.y);
                ctx.stroke();
            });
            ctx.setLineDash([]);
            
            // Draw road edges
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, height * 0.75);
            ctx.lineTo(width, height * 0.75);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, height * 0.75 + 60);
            ctx.lineTo(width, height * 0.75 + 60);
            ctx.stroke();
            
            // Draw car shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(car.x + 8, car.y + car.height - 5, car.width, 10);
            
            // Draw car body
            const carGradient = ctx.createLinearGradient(car.x, car.y, car.x, car.y + car.height);
            carGradient.addColorStop(0, '#E74C3C');
            carGradient.addColorStop(1, '#C0392B');
            ctx.fillStyle = carGradient;
            ctx.fillRect(car.x, car.y, car.width, car.height);
            
            // Draw car top
            ctx.fillStyle = '#C0392B';
            ctx.beginPath();
            ctx.roundRect(car.x + 10, car.y - 18, car.width - 20, 20, 10);
            ctx.fill();
            
            // Draw windows
            ctx.fillStyle = '#A3D9FF';
            // Front window
            ctx.fillRect(car.x + car.width - 25, car.y - 12, 20, 12);
            // Side windows
            ctx.fillRect(car.x + 20, car.y + 5, 15, 10);
            ctx.fillRect(car.x + car.width - 35, car.y + 5, 15, 10);
            
            // Draw headlights
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(car.x + car.width, car.y + 10, 7, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw wheels with rotation
            ctx.save();
            ctx.translate(car.x + 15, car.y + car.height);
            ctx.rotate(car.wheelRotation);
            drawWheel(0, 0);
            ctx.restore();
            
            ctx.save();
            ctx.translate(car.x + car.width - 15, car.y + car.height);
            ctx.rotate(car.wheelRotation);
            drawWheel(0, 0);
            ctx.restore();
            
            // Draw clouds
            road.clouds.forEach(cloud => {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.size * 0.6, cloud.y - cloud.size * 0.3, cloud.size * 0.8, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.size * 1.2, cloud.y, cloud.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw speed indicator
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${car.velocity.toFixed(1)} m/s`, car.x + car.width / 2, car.y - 30);
            
            // Draw acceleration status
            if (car.acceleration !== 0) {
                ctx.fillStyle = car.acceleration > 0 ? '#00C853' : '#FF5252';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                const status = car.acceleration > 0 ? 'Accelerating' : 'Decelerating';
                ctx.fillText(`${status}: ${Math.abs(car.acceleration).toFixed(1)} m/s²`, car.x + car.width / 2, car.y - 50);
            }
        }

        // Draw wheel helper
        function drawWheel(x, y) {
            // Wheel
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Wheel hub
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Main simulation loop
        function simulationLoop(timestamp) {
            if (!simulation.lastTimestamp) simulation.lastTimestamp = timestamp;
            
            const deltaTime = Math.min((timestamp - simulation.lastTimestamp) / 1000, 0.1); // Cap at 0.1s
            simulation.lastTimestamp = timestamp;
            
            if (simulation.isRunning) {
                updatePhysics(deltaTime);
                updateRoadElements(canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
                updateDisplays();
                drawScene();
            }
            
            simulation.animationId = requestAnimationFrame(simulationLoop);
        }

        // Event listeners
        dom.accSlider.addEventListener('input', function() {
            car.acceleration = parseFloat(this.value);
            if (!simulation.isRunning) updateDisplays();
        });

        dom.startSpeedSlider.addEventListener('input', function() {
            car.initialVelocity = parseFloat(this.value);
            if (!simulation.isRunning) {
                car.velocity = car.initialVelocity;
                updateDisplays();
            }
        });

        dom.startBtn.addEventListener('click', function() {
            if (!simulation.isRunning) {
                simulation.isRunning = true;
                simulation.lastTimestamp = 0;
                if (!simulation.animationId) {
                    simulation.animationId = requestAnimationFrame(simulationLoop);
                }
            }
        });

        dom.pauseBtn.addEventListener('click', function() {
            simulation.isRunning = false;
        });

        dom.resetBtn.addEventListener('click', function() {
            simulation.isRunning = false;
            
            // Reset simulation
            simulation.time = 0;
            simulation.distance = 0;
            car.velocity = car.initialVelocity;
            car.x = 80;
            car.wheelRotation = 0;
            
            // Reset road elements
            initRoadElements(canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
            
            updateDisplays();
            drawScene();
        });

        // Initialize and start
        function init() {
            // Set initial slider values
            dom.accSlider.value = car.acceleration;
            dom.startSpeedSlider.value = car.initialVelocity;
            
            // Initialize canvas
            initCanvas();
            
            // Initial draw
            drawScene();
            updateDisplays();
            
            // Start animation loop
            simulation.animationId = requestAnimationFrame(simulationLoop);
        }

        // Handle resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                devicePixelRatio = window.devicePixelRatio || 1;
                initCanvas();
                drawScene();
            }, 250);
        });

        // Handle orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                devicePixelRatio = window.devicePixelRatio || 1;
                initCanvas();
                drawScene();
            }, 500);
        });

        // Add roundRect polyfill for older browsers
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

        // Initialize when page loads
        window.addEventListener('DOMContentLoaded', init);
        window.addEventListener('load', init);