
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const forceEl = document.getElementById('force-val');
        const reactionForceEl = document.getElementById('reaction-force-val');
        const velEl = document.getElementById('vel-val');
        const particleRateEl = document.getElementById('particle-rate');
        const fuelPercentEl = document.getElementById('fuel-percent');
        const fuelFillEl = document.getElementById('fuel-fill');
        const forceFillEl = document.getElementById('force-fill');
        const resetBtn = document.getElementById('reset-btn');

        canvas.width = window.innerWidth - 320;
        canvas.height = window.innerHeight;

        // Physics Constants
        const GRAVITY = 0.05; // Artificial gravity
        const MAX_FUEL = 1000;
        const INITIAL_FUEL = MAX_FUEL;
        const BASE_THRUST = 0.25;
        
        // Simulation state
        let particles = [];
        let stars = [];
        let isThrusting = false;
        let fuel = INITIAL_FUEL;
        let particleCount = 0;
        let framesSinceLastParticle = 0;

        // Rocket object
        const rocket = {
            x: canvas.width / 2,
            y: canvas.height - 100,
            vy: 0,
            width: 30,
            height: 60,
            mass: 10,
            thrust: BASE_THRUST,
            flameSize: 1,
            angle: 0,
            maxHeight: canvas.height - 100
        };

        // Initialize stars for background
        function initStars() {
            stars = [];
            for(let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    brightness: Math.random() * 0.5 + 0.5
                });
            }
        }

        // Particle class for fuel exhaust
        class Particle {
            constructor(x, y, vx, vy, size = Math.random() * 4 + 2) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.life = 1.0;
                this.size = size;
                this.color = {
                    r: 255,
                    g: 100 + Math.random() * 155,
                    b: 0
                };
            }
            
            update() {
                // Apply gravity and air resistance
                this.vy += GRAVITY * 0.5;
                this.vx *= 0.98; // Air resistance
                
                this.x += this.vx;
                this.y += this.vy;
                this.life -= 0.015 + Math.random() * 0.01;
                
                // Color shifts as particle cools
                this.color.g *= 0.99;
            }
            
            draw() {
                const alpha = this.life;
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Glow effect
                if (this.life > 0.5) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.3})`;
                    ctx.fill();
                }
            }
        }

        // Handle user input
        function handleInput() {
            // Mouse controls
            canvas.onmousedown = () => isThrusting = true;
            canvas.onmouseup = () => isThrusting = false;
            
            // Keyboard controls
            window.onkeydown = (e) => { 
                if(e.code === 'Space') {
                    isThrusting = true;
                    e.preventDefault(); // Prevent spacebar from scrolling
                }
                if(e.code === 'KeyR') resetSimulation();
            };
            
            window.onkeyup = (e) => { 
                if(e.code === 'Space') isThrusting = false;
            };
            
            // Reset button
            resetBtn.onclick = resetSimulation;
        }

        // Reset simulation to initial state
        function resetSimulation() {
            rocket.x = canvas.width / 2;
            rocket.y = canvas.height - 100;
            rocket.vy = 0;
            rocket.angle = 0;
            rocket.flameSize = 1;
            rocket.maxHeight = canvas.height - 100;
            
            fuel = INITIAL_FUEL;
            particles = [];
            particleCount = 0;
            
            updateUI();
        }

        // Update simulation state
        function update() {
            // Track particle emission rate
            framesSinceLastParticle++;
            if (framesSinceLastParticle >= 60) {
                particleCount = 0;
                framesSinceLastParticle = 0;
            }
            
            if (isThrusting && fuel > 0) {
                // ACTION: Ejecting particles downward
                const particleIntensity = 1 + Math.min(rocket.thrust * 2, 3);
                const particlesToCreate = Math.floor(particleIntensity * 4);
                
                for(let i = 0; i < particlesToCreate; i++) {
                    if (fuel <= 0) break;
                    
                    // Calculate particle velocity based on thrust
                    const speed = 3 + rocket.thrust * 3;
                    const spread = 1.5;
                    
                    particles.push(new Particle(
                        rocket.x + (Math.random() - 0.5) * rocket.width/2, 
                        rocket.y + rocket.height, 
                        (Math.random() - 0.5) * spread, 
                        Math.random() * speed/2 + speed
                    ));
                    
                    fuel -= 0.5;
                    particleCount++;
                }
                
                // REACTION: Rocket moves upward (Newton's 3rd Law)
                // Force = mass * acceleration
                const force = rocket.thrust * rocket.mass;
                rocket.vy -= force / rocket.mass;
                
                // Increase thrust while holding for more dramatic effect
                rocket.thrust = Math.min(rocket.thrust + 0.005, BASE_THRUST * 2);
                rocket.flameSize = Math.min(rocket.flameSize + 0.05, 2);
                
                // Update UI
                const actionForce = (force * 10).toFixed(2);
                forceEl.innerText = actionForce + " N";
                reactionForceEl.innerText = actionForce + " N";
                
                // Update force visualization
                const forcePercent = Math.min(rocket.thrust / (BASE_THRUST * 2) * 100, 100);
                forceFillEl.style.width = forcePercent + "%";
                
            } else {
                // No thrust
                rocket.thrust = Math.max(rocket.thrust - 0.01, BASE_THRUST);
                rocket.flameSize = Math.max(rocket.flameSize - 0.05, 1);
                
                forceEl.innerText = "0.00 N";
                reactionForceEl.innerText = "0.00 N";
                forceFillEl.style.width = "0%";
            }
            
            // Apply gravity
            rocket.vy += GRAVITY;
            rocket.y += rocket.vy;
            
            // Track maximum height
            rocket.maxHeight = Math.min(rocket.maxHeight, rocket.y);
            
            // Ground collision
            if (rocket.y > canvas.height - 100) {
                rocket.y = canvas.height - 100;
                rocket.vy = 0;
                
                // Bounce effect if falling fast
                if (rocket.vy > 3) {
                    rocket.vy = -rocket.vy * 0.3;
                }
            }
            
            // Ceiling collision
            if (rocket.y < 50) {
                rocket.y = 50;
                rocket.vy = 0;
            }
            
            // Slight tilt based on velocity
            rocket.angle = rocket.vy * 0.02;
            
            // Update particles
            particles.forEach((p, i) => {
                p.update();
                if (p.life <= 0) particles.splice(i, 1);
            });
            
            // Update UI
            updateUI();
        }

        // Update UI elements
        function updateUI() {
            // Velocity (absolute value for display)
            velEl.innerText = Math.abs(rocket.vy).toFixed(2) + " m/s";
            
            // Particle emission rate
            particleRateEl.innerText = particleCount;
            
            // Fuel percentage
            const fuelPercent = Math.max(0, (fuel / MAX_FUEL * 100)).toFixed(0);
            fuelPercentEl.innerText = fuelPercent + "%";
            fuelFillEl.style.width = fuelPercent + "%";
            
            // Change fuel color based on level
            if (fuelPercent < 20) {
                fuelFillEl.style.background = "linear-gradient(90deg, #ff0000, #ff4400)";
            } else if (fuelPercent < 50) {
                fuelFillEl.style.background = "linear-gradient(90deg, #ff4400, #ffaa00)";
            } else {
                fuelFillEl.style.background = "linear-gradient(90deg, #ff4400, #ffaa00)";
            }
        }

        // Draw everything
        function draw() {
            // Clear canvas with gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#0a0a1a");
            gradient.addColorStop(1, "#1a1a2e");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars
            drawStars();
            
            // Draw ground
            drawGround();
            
            // Draw particles
            particles.forEach(p => p.draw());
            
            // Draw rocket
            drawRocket();
            
            // Draw altitude indicator
            drawAltitude();
        }

        // Draw starry background
        function drawStars() {
            stars.forEach(star => {
                ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw ground
        function drawGround() {
            ctx.fillStyle = "#1a2a1a";
            ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
            
            // Ground texture
            ctx.fillStyle = "#2a3a2a";
            for(let i = 0; i < canvas.width; i += 20) {
                ctx.fillRect(i, canvas.height - 100, 10, 5);
            }
            
            // Ground label
            ctx.fillStyle = "#aaa";
            ctx.font = "12px Inter";
            ctx.fillText("GROUND", 20, canvas.height - 80);
        }

        // Draw rocket with flame effects
        function drawRocket() {
            ctx.save();
            ctx.translate(rocket.x + rocket.width/2, rocket.y);
            ctx.rotate(rocket.angle);
            ctx.translate(-rocket.width/2, 0);
            
            // Rocket body
            const bodyGradient = ctx.createLinearGradient(0, 0, 0, rocket.height);
            bodyGradient.addColorStop(0, "#ecf0f1");
            bodyGradient.addColorStop(1, "#bdc3c7");
            ctx.fillStyle = bodyGradient;
            ctx.fillRect(0, 0, rocket.width, rocket.height);
            
            // Rocket details
            ctx.fillStyle = "#34495e";
            ctx.fillRect(5, 10, rocket.width-10, 10); // Window
            ctx.fillRect(10, 30, rocket.width-20, 15); // Panel
            
            // Nose cone
            const noseGradient = ctx.createLinearGradient(0, -20, 0, 0);
            noseGradient.addColorStop(0, "#e74c3c");
            noseGradient.addColorStop(1, "#c0392b");
            ctx.fillStyle = noseGradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rocket.width/2, -20);
            ctx.lineTo(rocket.width, 0);
            ctx.fill();
            
            // Flame when thrusting
            if (isThrusting && fuel > 0) {
                const flameLength = 30 * rocket.flameSize;
                const flameWidth = 15 * rocket.flameSize;
                
                // Flame gradient
                const flameGradient = ctx.createLinearGradient(0, rocket.height, 0, rocket.height + flameLength);
                flameGradient.addColorStop(0, "#ffaa00");
                flameGradient.addColorStop(0.5, "#ff4400");
                flameGradient.addColorStop(1, "transparent");
                
                ctx.fillStyle = flameGradient;
                ctx.beginPath();
                ctx.moveTo(rocket.width/2 - flameWidth/2, rocket.height);
                ctx.lineTo(rocket.width/2 + flameWidth/2, rocket.height);
                ctx.lineTo(rocket.width/2, rocket.height + flameLength);
                ctx.closePath();
                ctx.fill();
                
                // Flame particles
                for(let i = 0; i < 5; i++) {
                    const x = rocket.width/2 + (Math.random() - 0.5) * 10;
                    const y = rocket.height + Math.random() * flameLength;
                    const size = Math.random() * 3 + 1;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, 0.8)`;
                    ctx.fill();
                }
            }
            
            ctx.restore();
        }

        // Draw altitude indicator
        function drawAltitude() {
            const altitude = Math.max(0, rocket.maxHeight - rocket.y);
            const maxAlt = canvas.height - 150;
            const altPercent = Math.min(altitude / maxAlt, 1);
            
            // Altitude bar on the side
            const barWidth = 20;
            const barHeight = 200;
            const barX = canvas.width - 40;
            const barY = 50;
            
            // Bar background
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Altitude fill
            const fillGradient = ctx.createLinearGradient(barX, barY + barHeight, barX, barY);
            fillGradient.addColorStop(0, "#00ff88");
            fillGradient.addColorStop(1, "#00d2ff");
            ctx.fillStyle = fillGradient;
            ctx.fillRect(barX, barY + barHeight * (1 - altPercent), barWidth, barHeight * altPercent);
            
            // Altitude text
            ctx.fillStyle = "#fff";
            ctx.font = "12px Inter";
            ctx.textAlign = "center";
            ctx.fillText("ALT", barX + barWidth/2, barY - 10);
            ctx.fillText(Math.round(altitude) + "m", barX + barWidth/2, barY + barHeight + 20);
        }

        // Main animation loop
        function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth - 320;
            canvas.height = window.innerHeight;
            
            // Reset rocket position
            if (rocket.x > canvas.width) {
                rocket.x = canvas.width / 2;
            }
            
            // Reinitialize stars
            initStars();
        });

        // Initialize and start simulation
        initStars();
        handleInput();
        loop();