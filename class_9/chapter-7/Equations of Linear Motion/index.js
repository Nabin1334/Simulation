 let physicsSimulation;
        let useKMH = true;
        let activeEquation = 1;

        class PhysicsSimulation {
            constructor() {
                // Canvas setup
                this.canvas = document.getElementById('simulationCanvas');
                this.ctx = this.canvas.getContext('2d');
                
                // Physics parameters (all in SI units)
                this.u = 10; // Initial velocity (m/s) = 36 km/h
                this.a = 2;  // Acceleration (m/s²)
                this.t = 0;  // Time (s)
                this.s = 0;  // Displacement (m)
                this.v = this.u; // Current velocity (m/s)
                
                // Simulation state
                this.isRunning = false;
                this.lastTime = 0;
                this.timeScale = 1.0;
                this.timeStep = 0.5;
                
                // Visual settings
                this.pixelsPerMeter = 7;
                this.busX = 80;
                this.startX = 80;
                this.busWidth = 200; // Increased for more realistic bus
                this.busHeight = 85;
                this.trail = [];
                this.maxTrailLength = 50;
                
                // Initialize
                this.init();
            }
            
            init() {
                this.resizeCanvas();
                this.setupEventListeners();
                this.updateCalculations();
                this.draw();
                this.animate();
            }
            
            setupEventListeners() {
                // Sliders with proper unit conversion
                const setupSlider = (sliderId, callback, fillId, valueId, unit) => {
                    const slider = document.getElementById(sliderId);
                    const fill = document.getElementById(fillId);
                    const valueDisplay = document.getElementById(valueId);
                    
                    const updateFill = () => {
                        const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
                        fill.style.width = `${percent}%`;
                    };
                    
                    slider.addEventListener('input', (e) => {
                        updateFill();
                        let value = parseFloat(e.target.value);
                        
                        // Convert km/h to m/s for initial velocity
                        if (sliderId === 'initialVelocitySlider') {
                            value = value / 3.6; // Convert km/h to m/s
                        }
                        
                        callback(value);
                        this.updateDisplayValues();
                    });
                    
                    updateFill();
                };
                
                setupSlider('initialVelocitySlider', (value) => {
                    this.u = value;
                    if (!this.isRunning) this.reset();
                }, 'initialVelocityFill', 'initialVelocityValue', 'km/h');
                
                setupSlider('accelerationSlider', (value) => {
                    this.a = value;
                    if (!this.isRunning) this.reset();
                }, 'accelerationFill', 'accelerationValue', 'm/s²');
                
                setupSlider('timeSlider', (value) => {
                    this.t = value;
                    this.updateCalculations();
                    this.draw();
                }, 'timeFill', 'timeValue', 's');
                
                // Speed controls
                document.getElementById('speedSlider').addEventListener('input', (e) => {
                    this.timeScale = parseFloat(e.target.value);
                    document.getElementById('speedValue').textContent = `${this.timeScale.toFixed(1)}x`;
                });
                
                document.getElementById('timeStepSlider').addEventListener('input', (e) => {
                    this.timeStep = parseFloat(e.target.value);
                    document.getElementById('timeStepValue').textContent = `${this.timeStep.toFixed(1)}s`;
                });
                
                // Button controls
                document.getElementById('playBtn').addEventListener('click', () => this.play());
                document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
                document.getElementById('resetBtn').addEventListener('click', () => this.reset());
                
                // Unit toggle
                document.getElementById('unitToggle').addEventListener('click', () => this.toggleUnits());
                document.getElementById('speedUnitToggle').addEventListener('click', () => this.toggleUnits());
                
                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    if (e.target.tagName === 'INPUT') return;
                    
                    switch(e.key.toLowerCase()) {
                        case ' ': 
                            e.preventDefault();
                            this.togglePlayPause(); 
                            break;
                        case 'r': 
                            this.reset(); 
                            break;
                        case 'u':
                            this.toggleUnits();
                            break;
                    }
                });
                
                // Window resize
                window.addEventListener('resize', () => {
                    this.resizeCanvas();
                });
                
                // Initialize displays
                this.updateDisplayValues();
            }
            
            resizeCanvas() {
                const container = document.querySelector('.simulation-container');
                this.canvas.width = container.clientWidth;
                this.canvas.height = container.clientHeight;
            }
            
            play() {
                if (!this.isRunning) {
                    this.isRunning = true;
                    this.lastTime = performance.now();
                    
                    document.getElementById('playBtn').innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Playing</span><span class="btn-shortcut">Space</span>';
                    document.getElementById('playBtn').style.background = 'linear-gradient(135deg, #388E3C, #2E7D32)';
                    document.getElementById('statusMode').textContent = 'RUNNING';
                }
            }
            
            pause() {
                if (this.isRunning) {
                    this.isRunning = false;
                    
                    document.getElementById('playBtn').innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Play</span><span class="btn-shortcut">Space</span>';
                    document.getElementById('playBtn').style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
                    document.getElementById('statusMode').textContent = 'PAUSED';
                }
            }
            
            togglePlayPause() {
                this.isRunning ? this.pause() : this.play();
            }
            
            reset() {
                this.isRunning = false;
                this.t = 0;
                this.s = 0;
                this.v = this.u;
                this.busX = this.startX;
                this.trail = [];
                
                document.getElementById('timeSlider').value = 0;
                document.getElementById('timeValue').textContent = '0.0 s';
                document.getElementById('simulationTime').textContent = '0.0 s';
                
                document.getElementById('playBtn').innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Play</span><span class="btn-shortcut">Space</span>';
                document.getElementById('playBtn').style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)';
                document.getElementById('statusMode').textContent = 'READY';
                
                this.updateCalculations();
                this.draw();
            }
            
            toggleUnits() {
                useKMH = !useKMH;
                const unitText = useKMH ? 'km/h' : 'm/s';
                const unitToggleBtn = document.getElementById('unitToggle');
                const speedUnitToggle = document.getElementById('speedUnitToggle');
                const speedUnitDisplay = document.getElementById('speedUnitDisplay');
                const statusSpeedUnit = document.getElementById('statusSpeedUnit');
                
                unitToggleBtn.textContent = unitText;
                speedUnitToggle.textContent = unitText;
                speedUnitDisplay.textContent = unitText;
                statusSpeedUnit.textContent = unitText;
                
                // Update velocity slider
                const slider = document.getElementById('initialVelocitySlider');
                const maxVal = useKMH ? 180 : 50;
                const step = useKMH ? 5 : 1;
                const currentVal = useKMH ? Math.round(this.u * 3.6 / 5) * 5 : Math.round(this.u);
                
                slider.max = maxVal;
                slider.step = step;
                slider.value = currentVal;
                
                // Update slider labels
                const labels = slider.parentElement.querySelectorAll('.slider-labels span');
                if (labels.length >= 3) {
                    const mid = Math.round(maxVal / 2);
                    labels[0].textContent = '0';
                    labels[1].textContent = mid;
                    labels[2].textContent = maxVal + (useKMH ? ' km/h' : ' m/s');
                }
                
                this.updateDisplayValues();
            }
            
            updateDisplayValues() {
                // Update initial velocity display
                const uDisplay = useKMH ? (this.u * 3.6).toFixed(0) : this.u.toFixed(1);
                document.getElementById('initialVelocityValue').textContent = 
                    `${uDisplay} ${useKMH ? 'km/h' : 'm/s'}`;
                
                // Update slider fill
                const slider = document.getElementById('initialVelocitySlider');
                const fill = document.getElementById('initialVelocityFill');
                const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
                fill.style.width = `${percent}%`;
            }
            
            updatePhysics(deltaTime) {
                if (!this.isRunning) return;
                
                const dt = deltaTime * this.timeScale;
                this.t = Math.min(this.t + dt, 15);
                
                // Apply SUVAT Equations
                this.v = this.u + this.a * this.t;  // Equation 1: v = u + at
                this.s = (this.u * this.t) + (0.5 * this.a * this.t * this.t);  // Equation 2: s = ut + ½at²
                
                // Update bus position
                this.busX = this.startX + (this.s * this.pixelsPerMeter);
                
                // Update displays
                document.getElementById('timeSlider').value = this.t;
                document.getElementById('timeValue').textContent = `${this.t.toFixed(1)} s`;
                document.getElementById('simulationTime').textContent = `${this.t.toFixed(1)} s`;
                
                // Add to trail
                if (this.isRunning) {
                    this.trail.push({
                        x: this.busX + this.busWidth/2,
                        y: this.canvas.height * 0.7 + 40
                    });
                    
                    if (this.trail.length > this.maxTrailLength) {
                        this.trail.shift();
                    }
                }
                
                this.updateCalculations();
                this.highlightActiveEquation();
                
                if (this.t >= 15) {
                    this.pause();
                }
            }
            
            updateCalculations() {
                // Calculate using all three equations
                const calculatedV1 = this.u + (this.a * this.t);
                const calculatedS = (this.u * this.t) + (0.5 * this.a * this.t * this.t);
                const calculatedV3 = Math.sqrt(Math.max(0, (this.u * this.u) + (2 * this.a * calculatedS)));
                
                // Convert to display units
                const displayV1 = useKMH ? calculatedV1 * 3.6 : calculatedV1;
                const displayU = useKMH ? this.u * 3.6 : this.u;
                const displayV3 = useKMH ? calculatedV3 * 3.6 : calculatedV3;
                
                // Update displays
                this.updateValue('finalVelocityValue', displayV1.toFixed(1));
                this.updateValue('displacementValue', calculatedS.toFixed(1));
                this.updateValue('currentSpeedDisplay', displayV1.toFixed(1));
                this.updateValue('statusTime', this.t.toFixed(1));
                this.updateValue('statusSpeed', displayV1.toFixed(1));
                this.updateValue('statusDistance', calculatedS.toFixed(1));
                
                // Update equation results
                const unit = useKMH ? 'km/h' : 'm/s';
                document.getElementById('eq1Result').textContent = `${displayV1.toFixed(1)} ${unit}`;
                document.getElementById('eq2Result').textContent = `${calculatedS.toFixed(1)} m`;
                document.getElementById('eq3Result').textContent = `${displayV3.toFixed(1)} ${unit}`;
                
                // Update active equation based on time
                if (this.t < 3) {
                    activeEquation = 1; // v = u + at
                } else if (this.t < 8) {
                    activeEquation = 2; // s = ut + ½at²
                } else {
                    activeEquation = 3; // v² = u² + 2as
                }
            }
            
            highlightActiveEquation() {
                // Remove highlight from all equations
                ['eq1', 'eq2', 'eq3'].forEach(id => {
                    const eq = document.getElementById(id);
                    eq.classList.remove('equation-highlight');
                    eq.style.background = 'white';
                });
                
                // Highlight active equation
                const activeEq = document.getElementById(`eq${activeEquation}`);
                if (activeEq) {
                    activeEq.classList.add('equation-highlight');
                    activeEq.style.background = '#F1F8E9';
                }
            }
            
            updateValue(elementId, value) {
                const element = document.getElementById(elementId);
                if (element.textContent.replace(/[^0-9.-]/g, '') !== value) {
                    element.classList.remove('value-updated');
                    void element.offsetWidth;
                    element.textContent = value;
                    element.classList.add('value-updated');
                }
            }
            
            draw() {
                const ctx = this.ctx;
                const width = this.canvas.width;
                const height = this.canvas.height;
                
                // Clear with sky gradient
                const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
                skyGradient.addColorStop(0, '#87CEEB');
                skyGradient.addColorStop(1, '#B3E5FC');
                ctx.fillStyle = skyGradient;
                ctx.fillRect(0, 0, width, height * 0.7);
                
                // Draw grass
                const horizonY = height * 0.7;
                const grassGradient = ctx.createLinearGradient(0, horizonY, 0, height);
                grassGradient.addColorStop(0, '#7CB342');
                grassGradient.addColorStop(1, '#558B2F');
                ctx.fillStyle = grassGradient;
                ctx.fillRect(0, horizonY, width, height - horizonY);
                
                // Draw road
                const roadY = horizonY + 30;
                const roadHeight = 70;
                const roadGradient = ctx.createLinearGradient(0, roadY, 0, roadY + roadHeight);
                roadGradient.addColorStop(0, '#424242');
                roadGradient.addColorStop(1, '#212121');
                ctx.fillStyle = roadGradient;
                ctx.fillRect(0, roadY, width, roadHeight);
                
                // Draw road markings
                ctx.fillStyle = '#FFEB3B';
                for (let i = 0; i < width; i += 40) {
                    ctx.fillRect(i, roadY + roadHeight/2 - 1, 20, 2);
                }
                
                // Draw distance markers
                ctx.strokeStyle = '#4CAF50';
                ctx.lineWidth = 1;
                ctx.font = 'bold 11px Arial';
                ctx.fillStyle = '#2E7D32';
                ctx.textAlign = 'center';
                
                for (let distance = 0; distance <= 200; distance += 10) {
                    const x = this.startX + distance * this.pixelsPerMeter;
                    if (x > width - 30) break;
                    
                    ctx.beginPath();
                    ctx.moveTo(x, roadY + 10);
                    ctx.lineTo(x, roadY + 25);
                    ctx.stroke();
                    
                    if (distance % 20 === 0 && distance > 0) {
                        ctx.fillStyle = '#1B5E20';
                        ctx.fillRect(x - 22, roadY - 22, 44, 18);
                        ctx.fillStyle = 'white';
                        ctx.font = 'bold 10px Arial';
                        ctx.fillText(`${distance}m`, x, roadY - 9);
                    }
                }
                
                // Draw trail
                if (this.trail.length > 1) {
                    ctx.strokeStyle = 'rgba(76, 175, 80, 0.7)';
                    ctx.lineWidth = 3;
                    ctx.lineJoin = 'round';
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    
                    for (let i = 0; i < this.trail.length; i++) {
                        const point = this.trail[i];
                        if (i === 0) {
                            ctx.moveTo(point.x, point.y);
                        } else {
                            ctx.lineTo(point.x, point.y);
                        }
                    }
                    ctx.stroke();
                }
                
                // Draw realistic bus
                this.drawRealisticBus(ctx, roadY);
                
                // Draw physics info
                this.drawPhysicsInfo(ctx, width, roadY);
            }
            
            drawRealisticBus(ctx, roadY) {
                const busTop = roadY - this.busHeight + 25;
                
                // Bus shadow for 3D effect
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.fillRect(this.busX + 6, busTop + 6, this.busWidth, this.busHeight + 12);
                
                // Main bus body with metallic gradient
                const busGradient = ctx.createLinearGradient(
                    this.busX, busTop,
                    this.busX, busTop + this.busHeight
                );
                busGradient.addColorStop(0, '#FFA726');
                busGradient.addColorStop(0.5, '#FF9800');
                busGradient.addColorStop(1, '#F57C00');
                
                ctx.fillStyle = busGradient;
                ctx.fillRect(this.busX, busTop, this.busWidth, this.busHeight);
                
                // Bus body outline
                ctx.strokeStyle = '#E65100';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.busX, busTop, this.busWidth, this.busHeight);
                
                // Bus roof (darker top section)
                ctx.fillStyle = '#EF6C00';
                ctx.fillRect(this.busX, busTop, this.busWidth, 15);
                
                // Bus details
                this.drawBusDetails(ctx, busTop, roadY);
            }
            
            drawBusDetails(ctx, busTop, roadY) {
                // Front grille
                ctx.fillStyle = '#37474F';
                ctx.fillRect(this.busX + this.busWidth - 25, busTop + 20, 20, 30);
                
                // Headlights
                ctx.fillStyle = '#FFF59D';
                ctx.beginPath();
                ctx.arc(this.busX + this.busWidth - 12, busTop + 35, 6, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(this.busX + this.busWidth - 12, busTop + 25, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Windows with gradient
                const windowRows = 2;
                const windowCols = 4;
                const windowWidth = (this.busWidth - 60) / windowCols;
                const windowHeight = 18;
                
                for (let row = 0; row < windowRows; row++) {
                    for (let col = 0; col < windowCols; col++) {
                        const windowX = this.busX + 20 + (col * (windowWidth + 8));
                        const windowY = busTop + 20 + (row * (windowHeight + 8));
                        
                        const windowGradient = ctx.createLinearGradient(windowX, windowY, windowX, windowY + windowHeight);
                        windowGradient.addColorStop(0, '#E3F2FD');
                        windowGradient.addColorStop(1, '#90CAF9');
                        
                        ctx.fillStyle = windowGradient;
                        ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
                        
                        // Window frame
                        ctx.strokeStyle = '#1565C0';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(windowX, windowY, windowWidth, windowHeight);
                    }
                }
                
                // Door
                ctx.fillStyle = '#D32F2F';
                ctx.fillRect(this.busX + this.busWidth - 45, busTop + 25, 15, 40);
                ctx.fillStyle = '#FFEB3B';
                ctx.fillRect(this.busX + this.busWidth - 43, busTop + 40, 11, 4);
                
                // Side stripe
                ctx.strokeStyle = '#1976D2';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.busX + 10, busTop + this.busHeight - 15);
                ctx.lineTo(this.busX + this.busWidth - 10, busTop + this.busHeight - 15);
                ctx.stroke();
                
                // School bus sign
                ctx.fillStyle = '#FFEB3B';
                ctx.fillRect(this.busX + this.busWidth/2 - 30, busTop - 25, 60, 20);
                ctx.fillStyle = '#D32F2F';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('SCHOOL', this.busX + this.busWidth/2, busTop - 12);
                
                // Realistic wheels with rotation
                this.drawRealisticWheel(ctx, this.busX + 35, roadY + 15);
                this.drawRealisticWheel(ctx, this.busX + this.busWidth - 35, roadY + 15);
                
                // Wheel wells
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(this.busX + 35, busTop + this.busHeight, 20, 0, Math.PI, true);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(this.busX + this.busWidth - 35, busTop + this.busHeight, 20, 0, Math.PI, true);
                ctx.fill();
            }
            
            drawRealisticWheel(ctx, x, y) {
                // Wheel shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(x + 2, y + 2, 16, 0, Math.PI * 2);
                ctx.fill();
                
                // Tire
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(x, y, 16, 0, Math.PI * 2);
                ctx.fill();
                
                // Rim
                ctx.strokeStyle = '#424242';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.stroke();
                
                // Rim details
                ctx.strokeStyle = '#616161';
                ctx.lineWidth = 2;
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4;
                    ctx.beginPath();
                    ctx.moveTo(x + Math.cos(angle) * 4, y + Math.sin(angle) * 4);
                    ctx.lineTo(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10);
                    ctx.stroke();
                }
                
                // Hub cap
                ctx.fillStyle = '#757575';
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#9E9E9E';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            drawPhysicsInfo(ctx, width, roadY) {
                // Draw physics info box
                const infoX = width - 150;
                const infoY = 20;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.fillRect(infoX, infoY, 130, 90);
                ctx.strokeStyle = '#1565C0';
                ctx.lineWidth = 2;
                ctx.strokeRect(infoX, infoY, 130, 90);
                
                // Title
                ctx.fillStyle = '#1565C0';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('Physics Data', infoX + 10, infoY + 20);
                
                // Data
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                const unit = useKMH ? 'km/h' : 'm/s';
                const speed = useKMH ? this.v * 3.6 : this.v;
                
                ctx.fillText(`Time: ${this.t.toFixed(1)} s`, infoX + 10, infoY + 40);
                ctx.fillText(`Speed: ${speed.toFixed(1)} ${unit}`, infoX + 10, infoY + 60);
                ctx.fillText(`Distance: ${this.s.toFixed(1)} m`, infoX + 10, infoY + 80);
                ctx.fillText(`Acceleration: ${this.a.toFixed(1)} m/s²`, infoX + 10, infoY + 100);
            }
            
            animate() {
                const currentTime = performance.now();
                const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;
                this.lastTime = currentTime;
                
                this.updatePhysics(deltaTime);
                this.draw();
                
                requestAnimationFrame(() => this.animate());
            }
            
            setParameters(u, a, t) {
                this.u = u;
                this.a = a;
                this.t = t;
                
                // Update sliders based on current unit
                const sliderValue = useKMH ? Math.round(u * 3.6 / 5) * 5 : Math.round(u);
                document.getElementById('initialVelocitySlider').value = sliderValue;
                document.getElementById('accelerationSlider').value = a;
                document.getElementById('timeSlider').value = t;
                
                // Trigger updates
                document.getElementById('initialVelocitySlider').dispatchEvent(new Event('input'));
                document.getElementById('accelerationSlider').dispatchEvent(new Event('input'));
                document.getElementById('timeSlider').dispatchEvent(new Event('input'));
                
                this.updateCalculations();
                this.draw();
                
                // Visual feedback
                const event = window.event;
                if (event && event.target) {
                    event.target.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        event.target.style.transform = '';
                    }, 150);
                }
            }
        }
        
        // Global function for example clicks
        function setExample(u, a, t) {
            if (physicsSimulation) {
                physicsSimulation.setParameters(u, a, t);
            }
        }
        
        // Start simulation
        window.addEventListener('DOMContentLoaded', () => {
            physicsSimulation = new PhysicsSimulation();
            
            // Add helpful tips
            setTimeout(() => {
                const tips = [
                    "💡 Tip: Watch how the SUVAT equations update in real-time",
                    "💡 Tip: The highlighted equation shows which one is most relevant",
                    "💡 Tip: Try negative acceleration to see deceleration",
                    "💡 Tip: All physics calculations use proper SI units"
                ];
                
                let tipIndex = 0;
                setInterval(() => {
                    const footer = document.querySelector('.footer p:last-child');
                    if (footer) {
                        footer.textContent = tips[tipIndex];
                        tipIndex = (tipIndex + 1) % tips.length;
                    }
                }, 4000);
            }, 2000);
        });