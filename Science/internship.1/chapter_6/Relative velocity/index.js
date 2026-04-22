
        // ====================
        // Simulation Setup
        // ====================
        const canvas = document.getElementById('simulationCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match container
        function resizeCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // ====================
        // Simulation Variables
        // ====================
        let isPlaying = false; // Start with simulation paused
        let simulationTime = 0;
        let timeScale = 1.0;
        
        // Car properties - start with zero velocity
        const cars = {
            A: {
                x: canvas.width * 0.3,
                y: canvas.height * 0.5,
                vx: 0, // Start at rest
                vy: 0,
                targetVx: -10.0, // Target velocity (value from slider)
                width: 60,
                height: 30,
                color: '#3498db',
                label: 'A',
                trail: []
            },
            B: {
                x: canvas.width * 0.7,
                y: canvas.height * 0.5,
                vx: 0, // Start at rest
                vy: 0,
                targetVx: 15.0, // Target velocity (value from slider)
                width: 60,
                height: 30,
                color: '#e74c3c',
                label: 'B',
                trail: []
            }
        };
        
        // Reference point
        const referencePoint = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 8
        };
        
        // ====================
        // Control Elements
        // ====================
        const carAVelocitySlider = document.getElementById('carAVelocity');
        const carBVelocitySlider = document.getElementById('carBVelocity');
        const timeScaleSlider = document.getElementById('timeScale');
        const carAValue = document.getElementById('carAValue');
        const carBValue = document.getElementById('carBValue');
        const timeScaleValue = document.getElementById('timeScaleValue');
        const startBtn = document.getElementById('startBtn');
        const stepBtn = document.getElementById('stepBtn');
        const resetBtn = document.getElementById('resetBtn');
        const relABValue = document.getElementById('relABValue');
        const relBAValue = document.getElementById('relBAValue');
        const relABDirection = document.getElementById('relABDirection');
        const relBADirection = document.getElementById('relBADirection');
        const statusIndicator = document.getElementById('statusIndicator');
        
        // ====================
        // Control Functions
        // ====================
        
        // Update car A target velocity
        carAVelocitySlider.addEventListener('input', function() {
            cars.A.targetVx = parseFloat(this.value);
            carAValue.textContent = `${cars.A.targetVx.toFixed(1)} m/s`;
            
            // If simulation is running, update actual velocity immediately
            if (isPlaying) {
                cars.A.vx = cars.A.targetVx;
            }
            
            updateRelativeVelocityDisplay();
        });
        
        // Update car B target velocity
        carBVelocitySlider.addEventListener('input', function() {
            cars.B.targetVx = parseFloat(this.value);
            carBValue.textContent = `${cars.B.targetVx.toFixed(1)} m/s`;
            
            // If simulation is running, update actual velocity immediately
            if (isPlaying) {
                cars.B.vx = cars.B.targetVx;
            }
            
            updateRelativeVelocityDisplay();
        });
        
        // Update time scale
        timeScaleSlider.addEventListener('input', function() {
            timeScale = parseFloat(this.value);
            timeScaleValue.textContent = `${timeScale.toFixed(1)}x`;
        });
        
        // Start/Pause button
        startBtn.addEventListener('click', function() {
            isPlaying = !isPlaying;
            
            if (isPlaying) {
                // Start simulation - set velocities to target values
                cars.A.vx = cars.A.targetVx;
                cars.B.vx = cars.B.targetVx;
                
                this.innerHTML = '<i class="fas fa-pause"></i> Pause Simulation';
                this.className = 'sim-button pause-btn';
                statusIndicator.innerHTML = '<i class="fas fa-play-circle"></i> Simulation is Running - Cars are Moving';
                statusIndicator.style.borderLeftColor = '#2ecc71';
                statusIndicator.style.backgroundColor = '#d5f4e6';
                statusIndicator.style.borderColor = '#c8f7c5';
            } else {
                // Pause simulation - set velocities to 0
                cars.A.vx = 0;
                cars.B.vx = 0;
                
                this.innerHTML = '<i class="fas fa-play"></i> Start Simulation';
                this.className = 'sim-button start-btn';
                statusIndicator.innerHTML = '<i class="fas fa-pause-circle"></i> Simulation is Paused - Cars are at Rest Position';
                statusIndicator.style.borderLeftColor = '#f39c12';
                statusIndicator.style.backgroundColor = '#fff3cd';
                statusIndicator.style.borderColor = '#ffeaa7';
            }
            
            updateRelativeVelocityDisplay();
        });
        
        // Step button - move one step forward
        stepBtn.addEventListener('click', function() {
            // Temporarily set velocities for one step
            const tempVxA = cars.A.vx;
            const tempVxB = cars.B.vx;
            
            // Set velocities to target values for one step
            cars.A.vx = cars.A.targetVx;
            cars.B.vx = cars.B.targetVx;
            
            // Update positions for one step
            updateCarPositions();
            
            // Reset velocities to 0 after step
            cars.A.vx = 0;
            cars.B.vx = 0;
            
            // Draw the updated frame
            draw();
            
            // Restore previous velocities if simulation was running
            if (isPlaying) {
                cars.A.vx = cars.A.targetVx;
                cars.B.vx = cars.B.targetVx;
            } else {
                cars.A.vx = 0;
                cars.B.vx = 0;
            }
        });
        
        // Reset button
        resetBtn.addEventListener('click', function() {
            // Reset car positions
            cars.A.x = canvas.width * 0.3;
            cars.B.x = canvas.width * 0.7;
            
            // Reset velocities to 0 (rest position)
            cars.A.vx = 0;
            cars.B.vx = 0;
            
            // Reset target velocities to textbook values
            cars.A.targetVx = -10.0;
            cars.B.targetVx = 15.0;
            
            // Reset sliders
            carAVelocitySlider.value = -10;
            carBVelocitySlider.value = 15;
            timeScaleSlider.value = 1;
            
            // Reset displays
            carAValue.textContent = `${cars.A.targetVx.toFixed(1)} m/s`;
            carBValue.textContent = `${cars.B.targetVx.toFixed(1)} m/s`;
            timeScaleValue.textContent = '1.0x';
            timeScale = 1.0;
            
            // Reset trails
            cars.A.trail = [];
            cars.B.trail = [];
            
            // Reset time
            simulationTime = 0;
            
            // Stop simulation
            isPlaying = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Simulation';
            startBtn.className = 'sim-button start-btn';
            
            // Update status indicator
            statusIndicator.innerHTML = '<i class="fas fa-pause-circle"></i> Simulation is Paused - Cars are at Rest Position';
            statusIndicator.style.borderLeftColor = '#f39c12';
            statusIndicator.style.backgroundColor = '#fff3cd';
            statusIndicator.style.borderColor = '#ffeaa7';
            
            // Update relative velocity display
            updateRelativeVelocityDisplay();
        });
        
        // Example scenario buttons
        document.querySelectorAll('.example-card').forEach(card => {
            card.addEventListener('click', function() {
                const va = parseFloat(this.dataset.va);
                const vb = parseFloat(this.dataset.vb);
                
                // Update target velocities
                cars.A.targetVx = va;
                cars.B.targetVx = vb;
                
                // Update sliders
                carAVelocitySlider.value = va;
                carBVelocitySlider.value = vb;
                
                // Update displays
                carAValue.textContent = `${va.toFixed(1)} m/s`;
                carBValue.textContent = `${vb.toFixed(1)} m/s`;
                
                // If simulation is running, update actual velocities immediately
                if (isPlaying) {
                    cars.A.vx = cars.A.targetVx;
                    cars.B.vx = cars.B.targetVx;
                }
                
                updateRelativeVelocityDisplay();
            });
        });
        
        // ====================
        // Simulation Functions
        // ====================
        
        // Update relative velocity display
        function updateRelativeVelocityDisplay() {
            // V_AB = V_A - V_B
            const vAB = cars.A.vx - cars.B.vx;
            // V_BA = V_B - V_A
            const vBA = cars.B.vx - cars.A.vx;
            
            relABValue.textContent = `${vAB.toFixed(1)} m/s`;
            relBAValue.textContent = `${vBA.toFixed(1)} m/s`;
            
            // Update direction indicators
            if (vAB === 0) {
                relABDirection.textContent = '(At Rest)';
            } else {
                relABDirection.textContent = `(${Math.abs(vAB).toFixed(1)} m/s ${vAB < 0 ? 'West' : 'East'})`;
            }
            
            if (vBA === 0) {
                relBADirection.textContent = '(At Rest)';
            } else {
                relBADirection.textContent = `(${Math.abs(vBA).toFixed(1)} m/s ${vBA < 0 ? 'West' : 'East'})`;
            }
        }
        
        // Update car positions
        function updateCarPositions() {
            if (!isPlaying) return;
            
            // Calculate time increment based on time scale
            const deltaTime = 0.05 * timeScale;
            simulationTime += deltaTime;
            
            // Update positions based on velocities
            cars.A.x += cars.A.vx * deltaTime * 2; // Multiply by 2 for better visibility
            cars.B.x += cars.B.vx * deltaTime * 2;
            
            // Add current position to trail (for visualization)
            if (simulationTime % 0.5 < 0.05) { // Add to trail every 0.5 seconds
                cars.A.trail.push({x: cars.A.x, y: cars.A.y});
                cars.B.trail.push({x: cars.B.x, y: cars.B.y});
                
                // Limit trail length
                if (cars.A.trail.length > 20) cars.A.trail.shift();
                if (cars.B.trail.length > 20) cars.B.trail.shift();
            }
            
            // Reset positions when cars go off screen
            if (cars.A.x < -100 || cars.A.x > canvas.width + 100) {
                cars.A.x = canvas.width * 0.3;
                cars.A.trail = [];
            }
            
            if (cars.B.x < -100 || cars.B.x > canvas.width + 100) {
                cars.B.x = canvas.width * 0.7;
                cars.B.trail = [];
            }
        }
        
        // Draw reference grid
        function drawGrid() {
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;
            
            // Vertical lines
            for (let x = 0; x <= canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y <= canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
        
        // Draw reference line and point
        function drawReference() {
            // Draw reference line MN
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, canvas.height/2);
            ctx.lineTo(canvas.width - 50, canvas.height/2);
            ctx.stroke();
            
            // Draw reference point P
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(referencePoint.x, referencePoint.y, referencePoint.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw labels
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 16px Arial';
            ctx.fillText("M", 40, canvas.height/2 + 20);
            ctx.fillText("N", canvas.width - 60, canvas.height/2 + 20);
            ctx.fillText("P", referencePoint.x - 5, referencePoint.y - 10);
            
            ctx.font = '14px Arial';
            ctx.fillText("Reference Point", referencePoint.x - 45, referencePoint.y + 25);
            ctx.fillText("Reference Line MN", canvas.width/2 - 70, canvas.height/2 + 40);
        }
        
        // Draw car trails
        function drawTrail(car) {
            if (car.trail.length < 2) return;
            
            ctx.strokeStyle = car.color + '80'; // Semi-transparent
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(car.trail[0].x, car.trail[0].y);
            
            for (let i = 1; i < car.trail.length; i++) {
                ctx.lineTo(car.trail[i].x, car.trail[i].y);
            }
            
            ctx.stroke();
        }
        
        // Draw a car
        function drawCar(car) {
            // Draw car body
            ctx.fillStyle = car.color;
            ctx.fillRect(car.x - car.width/2, car.y - car.height/2, car.width, car.height);
            
            // Draw car windows
            ctx.fillStyle = '#aed6f1';
            const windowWidth = 15;
            const windowHeight = 15;
            const windowY = car.y - car.height/2 + 5;
            
            // Front window
            ctx.fillRect(car.x - car.width/2 + 5, windowY, windowWidth, windowHeight);
            // Middle window
            ctx.fillRect(car.x - car.width/2 + 25, windowY, windowWidth, windowHeight);
            // Back window
            ctx.fillRect(car.x + car.width/2 - 20, windowY, windowWidth, windowHeight);
            
            // Draw car outline
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.strokeRect(car.x - car.width/2, car.y - car.height/2, car.width, car.height);
            
            // Draw wheels
            ctx.fillStyle = '#2c3e50';
            // Front wheel
            ctx.fillRect(car.x - car.width/2 + 10, car.y + car.height/2 - 5, 8, 8);
            // Back wheel
            ctx.fillRect(car.x + car.width/2 - 18, car.y + car.height/2 - 5, 8, 8);
            
            // Draw car label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(car.label, car.x, car.y);
        }
        
        // Draw velocity vectors - Modified to not draw blue and red arrows on cars
        function drawVelocityVectors() {
            // REMOVED: Draw velocity vector for Car A (blue arrow)
            // REMOVED: Draw velocity vector for Car B (red arrow)
            
            // Draw relative velocity vectors (only if at least one car is moving)
            const vAB = cars.A.vx - cars.B.vx;
            const vBA = cars.B.vx - cars.A.vx;
            
            if (vAB !== 0) {
                // V_AB from Car A - Changed position to be below the car instead of on it
                drawVector(cars.A.x, cars.A.y + 50, vAB, 0, '#2ecc71', `V_AB = ${Math.abs(vAB).toFixed(1)} m/s`, 8);
            } else {
                // Show at rest indicator for relative velocity - moved below car
                ctx.fillStyle = '#2ecc71';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("V_AB = 0 m/s (At Rest)", cars.A.x, cars.A.y + 50);
            }
            
            if (vBA !== 0) {
                // V_BA from Car B - Changed position to be below the car instead of on it
                drawVector(cars.B.x, cars.B.y + 50, vBA, 0, '#9b59b6', `V_BA = ${Math.abs(vBA).toFixed(1)} m/s`, 8);
            } else {
                // Show at rest indicator for relative velocity - moved below car
                ctx.fillStyle = '#9b59b6';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("V_BA = 0 m/s (At Rest)", cars.B.x, cars.B.y + 50);
            }
        }
        
        // Draw a vector arrow
        function drawVector(x, y, vx, vy, color, label, scale) {
            const scaledVx = vx * scale;
            const scaledVy = vy * scale;
            
            // Draw vector line
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + scaledVx, y + scaledVy);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw arrowhead
            const angle = Math.atan2(scaledVy, scaledVx);
            ctx.beginPath();
            ctx.moveTo(x + scaledVx, y + scaledVy);
            ctx.lineTo(
                x + scaledVx - 10 * Math.cos(angle - Math.PI / 6),
                y + scaledVy - 10 * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                x + scaledVx - 10 * Math.cos(angle + Math.PI / 6),
                y + scaledVy - 10 * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            
            // Draw label
            ctx.fillStyle = color;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + scaledVx/2, y + scaledVy/2 - 15);
        }
        
        // Draw simulation info
        function drawInfo() {
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Time: ${simulationTime.toFixed(1)} s`, 20, 30);
            
            // Draw legend - Updated to reflect only relative velocity arrows
            const legendY = 60;
            const legendItems = [
                {color: '#2ecc71', text: 'V_AB (A relative to B)'},
                {color: '#9b59b6', text: 'V_BA (B relative to A)'},
                {color: cars.A.color, text: 'Car A'},
                {color: cars.B.color, text: 'Car B'}
            ];
            
            legendItems.forEach((item, i) => {
                ctx.fillStyle = item.color;
                ctx.fillRect(20, legendY + i * 25 - 10, 15, 15);
                ctx.fillStyle = '#2c3e50';
                ctx.font = '14px Arial';
                ctx.fillText(item.text, 40, legendY + i * 25);
            });
        }
        
        // Main draw function
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#f0f8ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            drawGrid();
            
            // Draw reference line and point
            drawReference();
            
            // Draw car trails (only if simulation is running)
            if (isPlaying) {
                drawTrail(cars.A);
                drawTrail(cars.B);
            }
            
            // Update and draw cars
            updateCarPositions();
            drawCar(cars.A);
            drawCar(cars.B);
            
            // Draw velocity vectors (without blue and red arrows on cars)
            drawVelocityVectors();
            
            // Draw simulation info
            drawInfo();
        }
        
        // ====================
        // Animation Loop
        // ====================
        function animate() {
            draw();
            requestAnimationFrame(animate);
        }
        
        // ====================
        // Initialize Simulation
        // ====================
        
        // Initialize relative velocity display
        updateRelativeVelocityDisplay();
        
        // Start animation loop
        animate();