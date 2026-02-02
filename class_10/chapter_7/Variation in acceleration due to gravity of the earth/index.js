
        // ENHANCED: Real gravity data with formula calculations
        const LOCATIONS = {
            huascaran: {
                name: 'Mt. Nevado Huascarán, Peru',
                shortName: 'Huascarán',
                lat: -9.1,
                lon: -77.6,
                altitude: 6768,
                g: 9.7639, // LOWEST surface gravity on Earth (measured)
                color: '#8B7355',
                reason: 'Equatorial location + extreme altitude = weakest gravity',
                theoretical_g: calculateTheoreticalGravity(-9.1, 6768)
            },
            quito: {
                name: 'Quito, Ecuador',
                shortName: 'Quito',
                lat: -0.2,
                lon: -78.5,
                altitude: 2850,
                g: 9.7803,
                color: '#FF6B6B',
                reason: 'Equatorial + high altitude',
                theoretical_g: calculateTheoreticalGravity(-0.2, 2850)
            },
            singapore: {
                name: 'Singapore',
                shortName: 'Singapore',
                lat: 1.3,
                lon: 103.8,
                altitude: 15,
                g: 9.7803,
                color: '#FFA726',
                reason: 'Equatorial at sea level',
                theoretical_g: calculateTheoreticalGravity(1.3, 15)
            },
            paris: {
                name: 'Paris, France',
                shortName: 'Paris',
                lat: 48.9,
                lon: 2.4,
                altitude: 35,
                g: 9.8094,
                color: '#4FC3F7',
                reason: 'Mid-latitude reference point',
                theoretical_g: calculateTheoreticalGravity(48.9, 35)
            },
            moscow: {
                name: 'Moscow, Russia',
                shortName: 'Moscow',
                lat: 55.8,
                lon: 37.6,
                altitude: 156,
                g: 9.8155,
                color: '#81C784',
                reason: 'High latitude location',
                theoretical_g: calculateTheoreticalGravity(55.8, 156)
            },
            arctic: {
                name: 'Arctic Ocean (North Pole)',
                shortName: 'Arctic',
                lat: 90,
                lon: 0,
                altitude: 0,
                g: 9.8322, // HIGHEST surface gravity on Earth
                color: '#E0F7FA',
                reason: 'Pole location + sea level = strongest gravity',
                theoretical_g: calculateTheoreticalGravity(90, 0)
            }
        };

        // ENHANCED: WGS84 Gravity Formula
        function calculateTheoreticalGravity(latitude, altitude) {
            const φ = latitude * Math.PI / 180; // Convert to radians
            const sinφ = Math.sin(φ);
            const sin2φ = Math.sin(2 * φ);
            
            // WGS84 gravity formula
            const g_sea = 9.780327 * (1 + 0.0053024 * sinφ * sinφ - 0.0000058 * sin2φ * sin2φ);
            
            // Altitude correction (free-air correction)
            const g_corrected = g_sea - 0.000003086 * altitude;
            
            return g_corrected;
        }

        // State
        let currentLocation = 'huascaran';
        let initialVelocity = 30;
        let dragCoefficient = 0.005; // Changed default to 5/1000 = 0.005 (Medium air)
        let isRunning = false;
        let animationId = null;
        let startTime = 0;
        let time = 0;
        let height = 0;
        let velocity = 0;
        let maxHeightReached = 0;
        let hasReachedPeak = false;

        // Canvas
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        let w, h;

        function setupCanvas() {
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = w;
            canvas.height = h;
        }
        setupCanvas();
        window.addEventListener('resize', setupCanvas);

        // Elements
        const velocitySlider = document.getElementById('velocitySlider');
        const velocityValue = document.getElementById('velocityValue');
        const dragSlider = document.getElementById('dragSlider');
        const dragValue = document.getElementById('dragValue');
        const launchBtn = document.getElementById('launchBtn');
        const resetBtn = document.getElementById('resetBtn');
        const statusBadge = document.getElementById('statusBadge');
        const phaseIndicator = document.getElementById('phaseIndicator');
        const heightValue = document.getElementById('heightValue');
        const currentVelocity = document.getElementById('currentVelocity');
        const maxHeight = document.getElementById('maxHeight');
        const timeValue = document.getElementById('timeValue');
        const gValue = document.getElementById('gValue');
        const flightTime = document.getElementById('flightTime');
        const resultInfo = document.getElementById('resultInfo');
        const resultText = document.getElementById('resultText');

        // Update displayed values
        function updateDisplay() {
            const loc = LOCATIONS[currentLocation];
            velocityValue.textContent = initialVelocity.toFixed(1);
            
            // Update drag coefficient display
            const dragSliderValue = parseFloat(dragSlider.value);
            dragValue.textContent = dragSliderValue === 0 ? '0.0 (No air)' : 
                                  dragSliderValue === 5 ? '5.0 (Medium air)' : 
                                  dragSliderValue === 10 ? '10.0 (High air)' : 
                                  `${dragSliderValue.toFixed(1)}`;
            
            gValue.textContent = loc.g.toFixed(4);
            
            // Theoretical vs measured difference
            const diff = Math.abs(loc.g - loc.theoretical_g);
            if (diff > 0.0001) {
                gValue.innerHTML = `${loc.g.toFixed(4)}<span style="font-size: 12px; color: #81d4fa;"> (calc: ${loc.theoretical_g.toFixed(4)})</span>`;
            }
            
            const theoreticalMaxHeight = (initialVelocity * initialVelocity) / (2 * loc.g);
            const theoreticalFlightTime = (2 * initialVelocity) / loc.g;
            
            maxHeight.textContent = theoreticalMaxHeight.toFixed(2);
            flightTime.textContent = theoreticalFlightTime.toFixed(3);
        }

        // Location selection
        document.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', () => {
                if (isRunning) return;
                
                document.querySelectorAll('.location-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                currentLocation = card.dataset.id;
                updateDisplay();
                drawScene();
                drawEarthVisual();
            });
        });

        // Velocity slider
        velocitySlider.addEventListener('input', () => {
            initialVelocity = parseFloat(velocitySlider.value);
            updateDisplay();
        });

        // Drag slider
        dragSlider.addEventListener('input', () => {
            dragCoefficient = parseFloat(dragSlider.value) / 1000; // Scale down for realistic values
            updateDisplay();
        });

        // Launch button
        launchBtn.addEventListener('click', () => {
            if (isRunning) {
                pause();
            } else {
                launch();
            }
        });

        // Reset button
        resetBtn.addEventListener('click', reset);

        function launch() {
            isRunning = true;
            startTime = performance.now();
            time = 0;
            height = 0;
            velocity = initialVelocity;
            maxHeightReached = 0;
            hasReachedPeak = false;
            
            launchBtn.classList.add('active');
            launchBtn.textContent = '⏸️ PAUSE';
            resetBtn.disabled = false;
            statusBadge.classList.add('active');
            statusBadge.textContent = 'Experiment Running';
            phaseIndicator.style.display = 'block';
            phaseIndicator.textContent = '⬆️ Ascending';
            
            resultInfo.style.display = 'none';
            
            animate();
        }

        function pause() {
            isRunning = false;
            cancelAnimationFrame(animationId);
            
            launchBtn.classList.remove('active');
            launchBtn.textContent = '▶️ CONTINUE';
            statusBadge.classList.remove('active');
            statusBadge.textContent = 'Paused';
        }

        function reset() {
            isRunning = false;
            if (animationId) cancelAnimationFrame(animationId);
            
            time = 0;
            height = 0;
            velocity = 0;
            maxHeightReached = 0;
            hasReachedPeak = false;
            
            launchBtn.classList.remove('active');
            launchBtn.textContent = '🚀 THROW BALL UPWARD';
            resetBtn.disabled = true;
            statusBadge.classList.remove('active');
            statusBadge.textContent = 'Ready';
            phaseIndicator.style.display = 'none';
            
            heightValue.textContent = '0.0';
            currentVelocity.textContent = '0.0';
            timeValue.textContent = '0.00';
            
            resultInfo.style.display = 'none';
            
            updateDisplay();
            drawScene();
            drawEarthVisual();
        }

        // ENHANCED: More realistic physics with air resistance
        function calculatePhysics(dt) {
            const loc = LOCATIONS[currentLocation];
            const g = loc.g;
            
            // Air resistance force (proportional to velocity squared)
            const airResistance = dragCoefficient * velocity * Math.abs(velocity);
            
            // Net acceleration (gravity + air resistance)
            const acceleration = -g - (velocity > 0 ? airResistance : -airResistance);
            
            // Update velocity and position using kinematic equations
            const newVelocity = velocity + acceleration * dt;
            const newHeight = height + velocity * dt + 0.5 * acceleration * dt * dt;
            
            return { newHeight, newVelocity, acceleration };
        }

        function animate() {
            if (!isRunning) return;
            
            const now = performance.now();
            const dt = Math.min((now - startTime) / 1000 - time, 0.05); // Cap dt for stability
            time += dt;
            
            const physics = calculatePhysics(dt);
            height = physics.newHeight;
            velocity = physics.newVelocity;
            
            // Track maximum height
            if (height > maxHeightReached) {
                maxHeightReached = height;
            }
            
            // Check for peak
            if (!hasReachedPeak && velocity <= 0) {
                hasReachedPeak = true;
                phaseIndicator.textContent = '🔝 At Peak';
                setTimeout(() => {
                    if (isRunning) phaseIndicator.textContent = '⬇️ Descending';
                }, 500);
            }
            
            // Check if landed
            if (height <= 0 && time > 0.1) {
                finish();
                return;
            }
            
            // Update displays
            heightValue.textContent = Math.max(0, height).toFixed(2);
            currentVelocity.textContent = Math.abs(velocity).toFixed(2);
            maxHeight.textContent = maxHeightReached.toFixed(2);
            timeValue.textContent = time.toFixed(3);
            
            drawScene();
            animationId = requestAnimationFrame(animate);
        }

        function finish() {
            isRunning = false;
            height = 0;
            
            const loc = LOCATIONS[currentLocation];
            const g = loc.g;
            
            // Calculate actual results (accounting for air resistance)
            const actualMaxHeight = maxHeightReached;
            const totalTime = time;
            
            heightValue.textContent = '0.0';
            currentVelocity.textContent = Math.abs(velocity).toFixed(2);
            maxHeight.textContent = actualMaxHeight.toFixed(2);
            timeValue.textContent = totalTime.toFixed(3);
            flightTime.textContent = totalTime.toFixed(3);
            
            launchBtn.classList.remove('active');
            launchBtn.textContent = '✅ COMPLETE';
            statusBadge.classList.remove('active');
            statusBadge.textContent = 'Complete';
            phaseIndicator.textContent = '✅ Landed';
            phaseIndicator.style.background = 'rgba(0, 200, 83, 0.8)';
            
            // Calculate theoretical vs actual difference
            const theoreticalMax = (initialVelocity * initialVelocity) / (2 * g);
            const percentDiff = ((actualMaxHeight - theoreticalMax) / theoreticalMax * 100).toFixed(2);
            
            resultInfo.style.display = 'block';
            resultText.innerHTML = `
                At <strong>${loc.shortName}</strong> (g = ${g.toFixed(4)} m/s²):<br>
                • Ball reached <strong>${actualMaxHeight.toFixed(2)} m</strong> high<br>
                • Theoretical max: ${theoreticalMax.toFixed(2)} m (${percentDiff}% difference)<br>
                • Total flight time: <strong>${totalTime.toFixed(3)} s</strong><br>
                • Return velocity: <strong>${Math.abs(velocity).toFixed(1)} m/s</strong><br><br>
                <em>${loc.reason}</em>
            `;
            
            drawScene();
            
            setTimeout(() => {
                phaseIndicator.style.background = '';
            }, 2000);
        }

        // ENHANCED: Clean visualization without arrows
        function drawScene() {
            const loc = LOCATIONS[currentLocation];
            
            ctx.clearRect(0, 0, w, h);
            
            // Gradient sky
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, '#000428');
            gradient.addColorStop(0.7, '#004e92');
            gradient.addColorStop(1, '#0077b6');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
            
            // Scientific grid
            drawScientificGrid();
            
            // Ground with texture
            const groundY = h - 80;
            drawGround(groundY);
            
            // Height scale
            drawHeightScale(groundY);
            
            // Person
            drawPerson(w / 2, groundY - 25);
            
            // Ball with physics visualization
            drawBall(w / 2, groundY - 25, groundY);
            
            // Location info
            drawLocationInfo(loc);
        }

        function drawScientificGrid() {
            ctx.strokeStyle = 'rgba(79, 195, 247, 0.1)';
            ctx.lineWidth = 0.5;
            
            // Vertical grid
            for (let x = 0; x < w; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            
            // Horizontal grid
            for (let y = 0; y < h; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
        }

        function drawGround(groundY) {
            const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
            groundGrad.addColorStop(0, '#1a237e');
            groundGrad.addColorStop(1, '#283593');
            ctx.fillStyle = groundGrad;
            ctx.fillRect(0, groundY, w, h - groundY);
            
            // Ground texture
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x, groundY);
                ctx.lineTo(x + 10, groundY + 10);
                ctx.stroke();
            }
            
            // Ground line
            ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(w, groundY);
            ctx.stroke();
        }

        function drawHeightScale(groundY) {
            const maxDisplayHeight = 60;
            const scale = (h - 150) / maxDisplayHeight;
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 3]);
            ctx.font = '10px "Courier New", monospace';
            ctx.fillStyle = 'rgba(129, 212, 250, 0.7)';
            
            for (let i = 0; i <= maxDisplayHeight; i += 10) {
                const y = groundY - (i * scale);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
                
                // Height labels
                ctx.fillText(`${i} m`, 10, y - 4);
                
                // Small ticks for intermediate heights
                if (i < maxDisplayHeight) {
                    for (let j = 2; j <= 8; j += 2) {
                        const smallY = groundY - ((i + j) * scale);
                        ctx.beginPath();
                        ctx.moveTo(0, smallY);
                        ctx.lineTo(15, smallY);
                        ctx.stroke();
                    }
                }
            }
            ctx.setLineDash([]);
        }

        function drawPerson(x, y) {
            // Head
            ctx.fillStyle = '#ffb74d';
            ctx.beginPath();
            ctx.arc(x, y - 35, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Body
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(x, y - 25);
            ctx.lineTo(x, y + 5);
            ctx.stroke();
            
            // Arms based on state
            if (isRunning || height > 0) {
                // Throwing motion
                ctx.beginPath();
                ctx.moveTo(x, y - 20);
                ctx.lineTo(x - 15, y - 15);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x, y - 20);
                ctx.lineTo(x + 15, y - 35);
                ctx.stroke();
            } else {
                // Resting position
                ctx.beginPath();
                ctx.moveTo(x, y - 20);
                ctx.lineTo(x - 15, y - 10);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x, y - 20);
                ctx.lineTo(x + 15, y - 10);
                ctx.stroke();
            }
            
            // Legs
            ctx.beginPath();
            ctx.moveTo(x, y + 5);
            ctx.lineTo(x - 8, y + 25);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x, y + 5);
            ctx.lineTo(x + 8, y + 25);
            ctx.stroke();
        }

        function drawBall(personX, personY, groundY) {
            const scale = (h - 150) / 60;
            const ballX = personX;
            const ballY = groundY - 25 - (height * scale);
            const ballRadius = 12;
            
            // Ball trail with fading effect
            if (height > 0 && isRunning) {
                const trailLength = Math.min(20, height * scale / 2);
                for (let i = 0; i < trailLength; i++) {
                    const alpha = 0.4 * (1 - i / trailLength);
                    const trailY = ballY + i * 2;
                    
                    ctx.fillStyle = `rgba(255, 213, 79, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(ballX, trailY, ballRadius * (1 - i / trailLength / 2), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Ball shadow (perspective effect)
            const shadowSize = ballRadius * (1 + height / 100);
            const shadowOpacity = Math.max(0.1, 0.5 - (height / 100));
            ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
            ctx.beginPath();
            ctx.ellipse(ballX, groundY - 2, shadowSize * 1.2, shadowSize * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ball with 3D effect
            const ballGrad = ctx.createRadialGradient(
                ballX - 5, ballY - 5, 0,
                ballX, ballY, ballRadius
            );
            ballGrad.addColorStop(0, LOCATIONS[currentLocation].color);
            ballGrad.addColorStop(0.7, LOCATIONS[currentLocation].color + 'aa');
            ballGrad.addColorStop(1, LOCATIONS[currentLocation].color + '66');
            
            ctx.fillStyle = ballGrad;
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Ball highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(ballX - 4, ballY - 4, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Max height line
            if (maxHeightReached > 0.5) {
                const maxY = groundY - 25 - (maxHeightReached * scale);
                ctx.strokeStyle = 'rgba(255, 107, 107, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 5]);
                ctx.beginPath();
                ctx.moveTo(0, maxY);
                ctx.lineTo(w, maxY);
                ctx.stroke();
                ctx.setLineDash([]);
                
                ctx.fillStyle = '#ff6b6b';
                ctx.font = 'bold 13px "Courier New", monospace';
                ctx.fillText(`Max: ${maxHeightReached.toFixed(2)}m`, w - 110, maxY - 8);
            }
        }

        function drawLocationInfo(loc) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(loc.shortName, 15, h - 50);
            
            ctx.font = '14px "Courier New", monospace';
            ctx.fillStyle = '#ffd54f';
            ctx.fillText(`g = ${loc.g.toFixed(4)} m/s²`, 15, h - 30);
            
            ctx.fillStyle = 'rgba(129, 212, 250, 0.9)';
            ctx.font = '12px Arial';
            ctx.fillText(`Lat: ${loc.lat}° | Alt: ${loc.altitude.toLocaleString()}m`, 15, h - 10);
            
            // Theoretical vs measured
            const diff = Math.abs(loc.g - loc.theoretical_g);
            if (diff > 0.0001) {
                ctx.fillStyle = 'rgba(255, 107, 107, 0.8)';
                ctx.font = '11px Arial';
                ctx.fillText(`Δ = ${diff.toFixed(4)} m/s²`, 15, h - 45);
            }
        }

        function drawEarthVisual() {
            const earthVisual = document.querySelector('.earth-visual');
            const loc = LOCATIONS[currentLocation];
            
            // Update earth visualization
            const earthSphere = earthVisual.querySelector('.earth-sphere');
            const earthFlatten = earthVisual.querySelector('.earth-flatten');
            
            // Adjust flattening based on latitude
            const flattening = 1 - Math.cos(Math.abs(loc.lat) * Math.PI / 180) * 0.003;
            earthFlatten.style.width = `${110 * flattening}px`;
            
            // Color based on gravity strength
            const gNormalized = (loc.g - 9.7639) / (9.8322 - 9.7639);
            const hue = 240 - (gNormalized * 60); // Blue to cyan
            earthSphere.style.background = `linear-gradient(45deg, 
                hsl(${hue}, 70%, 30%), 
                hsl(${hue}, 80%, 40%), 
                hsl(${hue}, 90%, 50%))`;
        }

        // Initialize
        updateDisplay();
        drawScene();
        drawEarthVisual();