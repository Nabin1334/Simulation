
        // DOM Elements
        const bus = document.getElementById('bus');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');
        const speedSlider = document.getElementById('speedSlider');
        const currentMaxSpeedEl = document.getElementById('currentMaxSpeed');
        const currentSpeedEl = document.getElementById('currentSpeed');
        const currentSpeedDisplay = document.getElementById('currentSpeedDisplay');
        const distanceEl = document.getElementById('distance');
        const timeElapsedEl = document.getElementById('timeElapsed');
        const statusText = document.getElementById('statusText');
        const canvas = document.getElementById('speedGraph');
        const ctx = canvas.getContext('2d');

        // Perfect graph dimensions
        let graphWidth, graphHeight;
        
        function updateGraphDimensions() {
            const container = canvas.parentElement;
            graphWidth = container.clientWidth;
            graphHeight = container.clientHeight;
            canvas.width = graphWidth;
            canvas.height = graphHeight;
        }

        // Simulation Variables
        let isRunning = false;
        let isPaused = false;
        let currentTime = 0;
        let busPosition = 0;
        let currentSpeed = 0;
        let currentDistance = 0;
        let animationId = null;
        
        // Constants
        const roadWidth = 800;
        const totalDistance = 1000;
        let maxSpeed = 20;
        let acceleration = 3;
        let deceleration = 4;
        
        // Graph data
        let graphData = [];
        let maxGraphPoints = 800;

        // Initialize
        function init() {
            updateGraphDimensions();
            resetSimulation();
            updateDisplay();
            
            currentMaxSpeedEl.textContent = maxSpeed;
            speedSlider.value = maxSpeed;
            
            window.addEventListener('resize', updateGraphDimensions);
            setupEventListeners();
        }

        // Event Listeners
        function setupEventListeners() {
            startBtn.addEventListener('click', function() {
                if (!isRunning && !isPaused) {
                    isRunning = true;
                    startBtn.disabled = true;
                    stopBtn.disabled = false;
                    bus.classList.add('moving');
                    updateStatus(`Starting journey at ${maxSpeed} m/s...`);
                    animate();
                } else if (isPaused) {
                    isPaused = false;
                    isRunning = true;
                    startBtn.disabled = true;
                    stopBtn.disabled = false;
                    bus.classList.add('moving');
                    updateStatus("Journey resumed!");
                    animate();
                }
            });

            stopBtn.addEventListener('click', function() {
                if (isRunning) {
                    isRunning = false;
                    isPaused = true;
                    startBtn.disabled = false;
                    stopBtn.disabled = true;
                    bus.classList.remove('moving');
                    updateStatus("Journey paused.");
                    
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                    }
                }
            });

            resetBtn.addEventListener('click', function() {
                resetSimulation();
                updateStatus(`Ready to start. Maximum speed: ${maxSpeed} m/s`);
            });

            speedSlider.addEventListener('input', function() {
                maxSpeed = parseInt(this.value);
                currentMaxSpeedEl.textContent = maxSpeed;
                
                acceleration = Math.min(5, 2 + (maxSpeed / 20));
                deceleration = Math.min(6, 3 + (maxSpeed / 20));
                
                if (!isRunning) {
                    updateStatus(`Maximum speed set to ${maxSpeed} m/s. Click "Start Journey" to begin.`);
                    drawGraph();
                } else {
                    updateStatus(`Maximum speed changed to ${maxSpeed} m/s.`);
                }
            });
        }

        // Reset Simulation
        function resetSimulation() {
            isRunning = false;
            isPaused = false;
            currentTime = 0;
            busPosition = 0;
            currentSpeed = 0;
            currentDistance = 0;
            graphData = [];
            
            bus.style.left = "20px";
            bus.classList.remove('moving');
            startBtn.disabled = false;
            stopBtn.disabled = true;
            
            updateDisplay();
            drawGraph();
            
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }

        // Animation Loop
        function animate() {
            if (!isRunning) return;
            
            currentTime += 0.1;
            const distanceToEnd = (roadWidth - busPosition) * (totalDistance / roadWidth);
            
            if (busPosition < roadWidth) {
                const distanceFromStart = busPosition * (totalDistance / roadWidth);
                
                // Acceleration phase
                if (distanceFromStart < 200 && currentSpeed < maxSpeed) {
                    currentSpeed = Math.min(maxSpeed, currentSpeed + acceleration * 0.1);
                }
                // Constant speed phase
                else if (distanceFromStart < 800 && distanceToEnd > 200) {
                    if (currentSpeed < maxSpeed) {
                        currentSpeed = Math.min(maxSpeed, currentSpeed + 0.5);
                    } else if (currentSpeed > maxSpeed) {
                        currentSpeed = Math.max(maxSpeed, currentSpeed - 0.5);
                    }
                }
                // Deceleration phase
                else if (distanceToEnd < 200 && currentSpeed > 0) {
                    currentSpeed = Math.max(0, currentSpeed - deceleration * 0.1);
                }
                // Stop
                else if (busPosition >= roadWidth) {
                    currentSpeed = 0;
                }
                
                // Move bus
                const pixelsPerMeter = roadWidth / totalDistance;
                busPosition += currentSpeed * pixelsPerMeter * 0.1;
                currentDistance = (busPosition / roadWidth) * totalDistance;
                
                // Update bus position
                const simulationArea = document.querySelector('.simulation-area');
                const areaWidth = simulationArea.clientWidth - 40;
                const newLeft = 20 + (busPosition / roadWidth) * areaWidth;
                bus.style.left = `${newLeft}px`;
                
                // Animate wheels
                const wheels = document.querySelectorAll('.wheel');
                const rotation = currentDistance * 720 / (Math.PI * 0.5);
                wheels.forEach(wheel => {
                    wheel.style.transform = `rotate(${rotation}deg)`;
                });
            } 
            else {
                currentSpeed = 0;
                endJourney();
                return;
            }
            
            // Store graph data
            if (graphData.length < maxGraphPoints) {
                graphData.push({
                    time: currentTime,
                    speed: currentSpeed
                });
            } else {
                graphData.shift();
                graphData.push({
                    time: currentTime,
                    speed: currentSpeed
                });
            }
            
            updateDisplay();
            drawGraph();
            animationId = requestAnimationFrame(animate);
        }

        // Update Display
        function updateDisplay() {
            currentSpeedEl.textContent = currentSpeed.toFixed(1);
            currentSpeedDisplay.textContent = currentSpeed.toFixed(1);
            distanceEl.textContent = Math.round(currentDistance);
            timeElapsedEl.textContent = currentTime.toFixed(1);
            
            if (busPosition >= roadWidth) {
                updateStatus("🎉 Journey completed! Bus reached destination.");
            } else if (currentSpeed === 0) {
                updateStatus(busPosition === 0 ? "Bus is at starting point." : "Bus is stopped.");
            } else if (currentSpeed < maxSpeed) {
                if (currentDistance < 200) {
                    updateStatus(`Accelerating... (${currentSpeed.toFixed(1)}/${maxSpeed} m/s)`);
                } else if (currentDistance > 800) {
                    updateStatus("Slowing down for arrival...");
                } else {
                    updateStatus(`Approaching max speed (${currentSpeed.toFixed(1)}/${maxSpeed} m/s)`);
                }
            } else {
                updateStatus(`Traveling at constant speed (${currentSpeed.toFixed(1)} m/s)`);
            }
        }

        function updateStatus(message) {
            statusText.textContent = message;
        }

        function endJourney() {
            isRunning = false;
            startBtn.disabled = true;
            stopBtn.disabled = true;
            bus.classList.remove('moving');
            
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            updateStatus("🎉 Journey completed! Bus reached destination.");
        }

        // Draw Perfect Graph
        function drawGraph() {
            if (!ctx || !graphWidth || !graphHeight) return;
            
            // Clear canvas with gradient
            const gradient = ctx.createLinearGradient(0, 0, graphWidth, graphHeight);
            gradient.addColorStop(0, '#f8f9fa');
            gradient.addColorStop(1, '#edf2f7');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, graphWidth, graphHeight);
            
            const padding = 60;
            const graphInnerWidth = graphWidth - padding * 2;
            const graphInnerHeight = graphHeight - padding * 2;
            
            // Draw graph area
            ctx.fillStyle = 'white';
            ctx.fillRect(padding, padding, graphInnerWidth, graphInnerHeight);
            
            // Draw grid
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            
            // Main grid lines
            for (let i = 0; i <= 60; i += 10) {
                const x = padding + (i/60) * graphInnerWidth;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, padding + graphInnerHeight);
                ctx.stroke();
            }
            
            for (let i = 0; i <= 40; i += 10) {
                const y = padding + graphInnerHeight - (i/40) * graphInnerHeight;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(padding + graphInnerWidth, y);
                ctx.stroke();
            }
            
            // Fine grid lines
            ctx.strokeStyle = '#f7fafc';
            for (let i = 0; i <= 60; i += 2) {
                const x = padding + (i/60) * graphInnerWidth;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, padding + graphInnerHeight);
                ctx.stroke();
            }
            
            for (let i = 0; i <= 40; i += 2) {
                const y = padding + graphInnerHeight - (i/40) * graphInnerHeight;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(padding + graphInnerWidth, y);
                ctx.stroke();
            }
            
            // Draw axes
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, padding + graphInnerHeight);
            ctx.moveTo(padding, padding + graphInnerHeight);
            ctx.lineTo(padding + graphInnerWidth, padding + graphInnerHeight);
            ctx.stroke();
            
            // Axis labels
            ctx.font = '14px Arial';
            ctx.fillStyle = '#2c3e50';
            ctx.textAlign = 'center';
            ctx.fillText('Time (seconds)', padding + graphInnerWidth/2, padding + graphInnerHeight + 40);
            
            ctx.save();
            ctx.translate(30, padding + graphInnerHeight/2);
            ctx.rotate(-Math.PI/2);
            ctx.fillText('Velocity (m/s)', 0, 0);
            ctx.restore();
            
            // Scale numbers
            ctx.font = '12px Arial';
            ctx.fillStyle = '#4a5568';
            
            for (let i = 0; i <= 60; i += 10) {
                const x = padding + (i/60) * graphInnerWidth;
                ctx.fillText(i.toString(), x, padding + graphInnerHeight + 20);
            }
            
            for (let i = 0; i <= 40; i += 10) {
                const y = padding + graphInnerHeight - (i/40) * graphInnerHeight;
                ctx.textAlign = 'right';
                ctx.fillText(i.toString(), padding - 10, y + 4);
            }
            
            // Max speed line
            const maxSpeedY = padding + graphInnerHeight - (maxSpeed/40) * graphInnerHeight;
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(padding, maxSpeedY);
            ctx.lineTo(padding + graphInnerWidth, maxSpeedY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw graph line
            if (graphData.length > 1) {
                // Fill area
                ctx.beginPath();
                const first = graphData[0];
                let startX = padding + (first.time/60) * graphInnerWidth;
                let startY = padding + graphInnerHeight - (first.speed/40) * graphInnerHeight;
                ctx.moveTo(startX, startY);
                
                for (let i = 1; i < graphData.length; i++) {
                    const point = graphData[i];
                    const x = padding + (point.time/60) * graphInnerWidth;
                    const y = padding + graphInnerHeight - (point.speed/40) * graphInnerHeight;
                    ctx.lineTo(x, y);
                }
                
                ctx.lineTo(padding + (currentTime/60) * graphInnerWidth, padding + graphInnerHeight);
                ctx.lineTo(padding, padding + graphInnerHeight);
                ctx.closePath();
                
                const areaGradient = ctx.createLinearGradient(0, padding, 0, padding + graphInnerHeight);
                areaGradient.addColorStop(0, 'rgba(231, 76, 60, 0.15)');
                areaGradient.addColorStop(1, 'rgba(231, 76, 60, 0.05)');
                ctx.fillStyle = areaGradient;
                ctx.fill();
                
                // Draw line
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                
                for (let i = 1; i < graphData.length; i++) {
                    const point = graphData[i];
                    const x = padding + (point.time/60) * graphInnerWidth;
                    const y = padding + graphInnerHeight - (point.speed/40) * graphInnerHeight;
                    ctx.lineTo(x, y);
                }
                
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.stroke();
                
                // Current point
                if (currentTime > 0 && currentSpeed > 0) {
                    const x = padding + (currentTime/60) * graphInnerWidth;
                    const y = padding + graphInnerHeight - (currentSpeed/40) * graphInnerHeight;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#2ecc71';
                    ctx.fill();
                    
                    // Label
                    ctx.font = 'bold 12px Arial';
                    ctx.fillStyle = '#2ecc71';
                    ctx.textAlign = 'right';
                    ctx.fillText(`${currentSpeed.toFixed(1)} m/s`, padding - 15, y + 4);
                    
                    ctx.textAlign = 'center';
                    ctx.fillText(`${currentTime.toFixed(1)} s`, x, padding + graphInnerHeight + 15);
                }
            }
            
            // Phase labels
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            
            ctx.fillStyle = '#27ae60';
            ctx.fillText('Acceleration', padding + (10/60) * graphInnerWidth, padding + 25);
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('Constant Speed', padding + graphInnerWidth/2, padding + 25);
            
            ctx.fillStyle = '#3498db';
            ctx.fillText('Deceleration', padding + graphInnerWidth - (10/60) * graphInnerWidth, padding + 25);
        }

        // Initialize
        init();