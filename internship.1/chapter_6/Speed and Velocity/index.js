// ============================================
        // SIMPLE PHYSICS SIMULATION
        // ============================================
        
        // Get canvas
        const canvas = document.getElementById('race-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        function resizeCanvas() {
            const container = document.querySelector('.simulation-area');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // ============================================
        // RACE SIMULATION
        // ============================================
        const race = {
            // Car 1 (Green)
            car1: {
                x: 100,
                y: 0,
                speed: 6,
                startDelay: 0,
                distance: 0,
                isMoving: false,
                hasStarted: false,
                color: '#4CAF50',
                name: 'Green Car',
                width: 60,
                height: 30
            },
            
            // Car 2 (Orange)
            car2: {
                x: 100,
                y: 0,
                speed: 4,
                startDelay: 3,
                distance: 0,
                isMoving: false,
                hasStarted: false,
                color: '#FF9800',
                name: 'Orange Car',
                width: 60,
                height: 30
            },
            
            // Race state
            isRunning: false,
            startTime: null,
            elapsedTime: 0,
            raceLength: 800,
            
            // Initialize
            init: function() {
                // Set car positions
                const middle = canvas.height / 2;
                this.car1.y = middle - 40;
                this.car2.y = middle + 40;
                
                // Reset cars
                this.resetCar(this.car1);
                this.resetCar(this.car2);
                
                this.isRunning = false;
                this.startTime = null;
                this.elapsedTime = 0;
                
                // Update displays
                this.updateDisplays();
                
                // Draw initial scene
                drawRace();
            },
            
            // Reset car
            resetCar: function(car) {
                car.x = 100;
                car.distance = 0;
                car.isMoving = false;
                car.hasStarted = false;
            },
            
            // Update race
            update: function() {
                if (!this.isRunning) return;
                
                // Update elapsed time
                if (this.startTime) {
                    this.elapsedTime = (Date.now() - this.startTime) / 1000;
                }
                
                // Update both cars
                this.updateCar(this.car1);
                this.updateCar(this.car2);
                
                // Update displays
                this.updateDisplays();
            },
            
            // Update individual car
            updateCar: function(car) {
                // Check if car should start
                if (!car.hasStarted && this.elapsedTime >= car.startDelay) {
                    car.hasStarted = true;
                    car.isMoving = true;
                    showMessage(`${car.name} has started!`, 'info');
                }
                
                if (!car.isMoving) return;
                
                // Calculate movement
                const pixelsPerMeter = (canvas.width - 200) / this.raceLength;
                const moveDistance = car.speed * pixelsPerMeter * 0.05;
                
                // Move car
                car.x += moveDistance;
                car.distance += car.speed * 0.05;
                
                // Reset if car reaches end
                if (car.x > canvas.width - 50) {
                    this.resetCar(car);
                    car.x = 100;
                    showMessage(`${car.name} finished lap!`, 'info');
                }
            },
            
            // Update all displays
            updateDisplays: function() {
                // Update speed displays
                document.getElementById('car1-display').textContent = `${this.car1.speed.toFixed(1)} m/s`;
                document.getElementById('car2-display').textContent = `${this.car2.speed.toFixed(1)} m/s`;
                
                document.getElementById('car1-time').textContent = `${this.car1.startDelay.toFixed(1)} s`;
                document.getElementById('car2-time').textContent = `${this.car2.startDelay.toFixed(1)} s`;
                
                // Update live data
                document.getElementById('live-car1-speed').textContent = this.car1.speed.toFixed(1);
                document.getElementById('live-car2-speed').textContent = this.car2.speed.toFixed(1);
                
                document.getElementById('live-car1-velocity').textContent = `${this.car1.speed.toFixed(1)} m/s`;
                document.getElementById('live-car2-velocity').textContent = `${this.car2.speed.toFixed(1)} m/s`;
                
                // Update sliders
                document.getElementById('car1-slider').value = this.car1.speed;
                document.getElementById('car2-slider').value = this.car2.speed;
                
                // Update race status
                this.updateRaceStatus();
            },
            
            // Update race status
            updateRaceStatus: function() {
                const status = document.getElementById('race-status');
                const leader = document.getElementById('leader-info');
                
                if (!this.isRunning) {
                    status.innerHTML = '<span style="color: #666;">Ready to start!</span>';
                    leader.textContent = 'Click Start Race to begin';
                    return;
                }
                
                if (this.car1.hasStarted && this.car2.hasStarted) {
                    const diff = this.car1.distance - this.car2.distance;
                    
                    if (Math.abs(diff) < 0.5) {
                        status.innerHTML = '🏁 <span style="color: #4CAF50;">Cars are tied!</span>';
                        leader.textContent = 'Very close race!';
                    } else if (diff > 0) {
                        status.innerHTML = '🏁 <span style="color: #4CAF50;">Green car is ahead</span>';
                        leader.textContent = `Leading by ${Math.abs(diff).toFixed(1)} meters`;
                    } else {
                        status.innerHTML = '🏁 <span style="color: #FF9800;">Orange car is ahead</span>';
                        leader.textContent = `Leading by ${Math.abs(diff).toFixed(1)} meters`;
                    }
                } else if (this.car1.hasStarted && !this.car2.hasStarted) {
                    status.innerHTML = '⏱️ <span style="color: #4CAF50;">Green car racing...</span>';
                    const timeLeft = this.car2.startDelay - this.elapsedTime;
                    leader.textContent = `Orange car starts in ${timeLeft.toFixed(1)}s`;
                } else if (!this.car1.hasStarted && this.car2.hasStarted) {
                    status.innerHTML = '⏱️ <span style="color: #FF9800;">Orange car racing...</span>';
                    const timeLeft = this.car1.startDelay - this.elapsedTime;
                    leader.textContent = `Green car starts in ${timeLeft.toFixed(1)}s`;
                } else {
                    status.textContent = 'Race starting...';
                    leader.textContent = 'Cars at start line';
                }
            },
            
            // Start race
            start: function() {
                this.isRunning = true;
                this.startTime = Date.now();
                
                // Update button
                document.getElementById('start-btn').innerHTML = '<i class="fas fa-running"></i> Race Running';
                document.getElementById('start-btn').style.background = 'linear-gradient(135deg, #388E3C, #2E7D32)';
                
                showMessage('Race started! Green car begins immediately.', 'info');
            },
            
            // Pause race
            pause: function() {
                this.isRunning = false;
                
                // Update button
                document.getElementById('start-btn').innerHTML = '<i class="fas fa-play"></i> Start Race';
                document.getElementById('start-btn').style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
                
                showMessage('Race paused. You can adjust settings.', 'warning');
            },
            
            // Reset race
            reset: function() {
                this.init();
                
                // Update button
                document.getElementById('start-btn').innerHTML = '<i class="fas fa-play"></i> Start Race';
                document.getElementById('start-btn').style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
                
                showMessage('Race reset. Try different speeds!', 'info');
            }
        };
        
        // ============================================
        // DRAWING FUNCTIONS
        // ============================================
        function drawRace() {
            // Clear canvas
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            drawTrack();
            drawCars();
            drawStartFinishLines();
        }
        
        function drawTrack() {
            const middle = canvas.height / 2;
            
            // Draw lanes
            ctx.fillStyle = '#424242';
            ctx.fillRect(50, middle - 50, canvas.width - 100, 30);
            ctx.fillRect(50, middle + 20, canvas.width - 100, 30);
            
            // Lane markings
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.setLineDash([15, 25]);
            
            ctx.beginPath();
            ctx.moveTo(50, middle - 35);
            ctx.lineTo(canvas.width - 50, middle - 35);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(50, middle + 35);
            ctx.lineTo(canvas.width - 50, middle + 35);
            ctx.stroke();
            
            ctx.setLineDash([]);
        }
        
        function drawStartFinishLines() {
            // Start line
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(100, canvas.height * 0.25, 8, canvas.height * 0.5);
            
            ctx.fillStyle = '#4CAF50';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('START', 104, canvas.height * 0.2);
            
            // Finish line
            ctx.fillStyle = '#F44336';
            ctx.fillRect(canvas.width - 100, canvas.height * 0.25, 8, canvas.height * 0.5);
            
            ctx.fillStyle = '#F44336';
            ctx.fillText('FINISH', canvas.width - 96, canvas.height * 0.2);
        }
        
        function drawCars() {
            drawCar(race.car1);
            drawCar(race.car2);
            
            // Draw speed indicators
            if (race.car1.hasStarted) {
                ctx.fillStyle = race.car1.color;
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${race.car1.speed.toFixed(1)} m/s`, race.car1.x, race.car1.y - 25);
            }
            
            if (race.car2.hasStarted) {
                ctx.fillStyle = race.car2.color;
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${race.car2.speed.toFixed(1)} m/s`, race.car2.x, race.car2.y - 25);
            }
        }
        
        function drawCar(car) {
            ctx.save();
            ctx.translate(car.x, car.y);
            
            // Car body
            ctx.fillStyle = car.color;
            ctx.fillRect(-30, -15, 60, 30);
            
            // Car roof
            ctx.fillStyle = car.color === '#4CAF50' ? '#388E3C' : '#F57C00';
            ctx.fillRect(-20, -25, 40, 12);
            
            // Windows
            ctx.fillStyle = '#B3E5FC';
            ctx.fillRect(-15, -20, 15, 8);
            ctx.fillRect(5, -20, 10, 8);
            
            // Wheels
            ctx.fillStyle = '#212121';
            ctx.fillRect(-25, -20, 10, 4);
            ctx.fillRect(15, -20, 10, 4);
            ctx.fillRect(-25, 16, 10, 4);
            ctx.fillRect(15, 16, 10, 4);
            
            ctx.restore();
        }
        
        // ============================================
        // CONTROLS
        // ============================================
        // Button event listeners
        document.getElementById('start-btn').addEventListener('click', function() {
            race.start();
        });
        
        document.getElementById('pause-btn').addEventListener('click', function() {
            race.pause();
        });
        
        document.getElementById('reset-btn').addEventListener('click', function() {
            race.reset();
        });
        
        // Speed sliders
        document.getElementById('car1-slider').addEventListener('input', function() {
            race.car1.speed = parseFloat(this.value);
            race.updateDisplays();
            showMessage(`Green car speed: ${this.value} m/s`, 'info');
        });
        
        document.getElementById('car2-slider').addEventListener('input', function() {
            race.car2.speed = parseFloat(this.value);
            race.updateDisplays();
            showMessage(`Orange car speed: ${this.value} m/s`, 'info');
        });
        
        // Start time adjustments
        function adjustStart(carId, change) {
            const car = carId === 'car1' ? race.car1 : race.car2;
            car.startDelay = Math.max(0, car.startDelay + change);
            race.updateDisplays();
            
            const carName = carId === 'car1' ? 'Green car' : 'Orange car';
            showMessage(`${carName} starts at ${car.startDelay.toFixed(1)} seconds`, 'info');
        }
        
        // Pre-set scenarios
        function setScenario(type) {
            if (type === 'equal') {
                race.car1.speed = 6;
                race.car2.speed = 6;
                race.car1.startDelay = 0;
                race.car2.startDelay = 0;
                showMessage('Equal race: Both cars same speed, start together', 'info');
            } else if (type === 'catchup') {
                race.car1.speed = 5;
                race.car2.speed = 8;
                race.car1.startDelay = 0;
                race.car2.startDelay = 3;
                showMessage('Catch up: Orange car faster but starts 3s later', 'info');
            }
            
            race.updateDisplays();
        }
        
        // ============================================
        // MESSAGE SYSTEM
        // ============================================
        function showMessage(text, type) {
            // Remove existing message
            const existing = document.querySelector('.message');
            if (existing) existing.remove();
            
            // Create new message
            const msg = document.createElement('div');
            msg.className = `message ${type}`;
            msg.innerHTML = `
                <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <div>${text}</div>
            `;
            
            document.body.appendChild(msg);
            
            // Auto remove after 4 seconds
            setTimeout(() => {
                if (msg.parentElement) {
                    msg.remove();
                }
            }, 4000);
        }
        
        // ============================================
        // KEYBOARD SHORTCUTS
        // ============================================
        document.addEventListener('keydown', function(e) {
            // Space to toggle start/pause
            if (e.code === 'Space') {
                e.preventDefault();
                if (race.isRunning) {
                    race.pause();
                } else {
                    race.start();
                }
            }
            
            // R to reset
            if (e.code === 'KeyR') {
                e.preventDefault();
                race.reset();
            }
        });
        
        // ============================================
        // ANIMATION LOOP
        // ============================================
        function animate() {
            race.update();
            drawRace();
            requestAnimationFrame(animate);
        }
        
        // ============================================
        // INITIALIZE
        // ============================================
        race.init();
        animate();
        
        // Welcome message
        setTimeout(() => {
            showMessage('Welcome! Click Start Race to begin. Use sliders to adjust speeds.', 'info');
        }, 1000);