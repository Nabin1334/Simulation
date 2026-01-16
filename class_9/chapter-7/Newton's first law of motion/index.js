
        // Canvas setup
        const canvas = document.getElementById('simulationCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        function resizeCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        
        // Physics state
        let mode = 'space'; // 'space' or 'earth'
        let mass = 1000; // kg
        let velocity = 0;
        let isMoving = false;
        let distance = 0;
        let startTime = 0;
        let elapsedTime = 0;
        let momentum = 0;
        
        // Object properties
        let objectX = 0;
        let objectY = 0;
        let objectRadius = 40;
        let objectDirection = 0; // Angle in radians
        
        // Environment particles
        let particles = [];
        let stars = [];
        
        // Initialize stars
        function initStars() {
            stars = [];
            const starCount = Math.min(100, (canvas.width * canvas.height) / 2000);
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    brightness: Math.random() * 0.5 + 0.3
                });
            }
        }
        
        // Initialize particles for Earth mode
        function initParticles() {
            particles = [];
            const particleCount = Math.min(50, (canvas.width * canvas.height) / 4000);
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 3 + 1,
                    opacity: Math.random() * 0.3 + 0.1
                });
            }
        }
        
        // DOM Elements
        const speedValue = document.getElementById('speedValue');
        const massValue = document.getElementById('massValue');
        const distanceValue = document.getElementById('distanceValue');
        const timeValue = document.getElementById('timeValue');
        const momentumDisplay = document.getElementById('momentumDisplay');
        const statusDisplay = document.getElementById('statusDisplay');
        const physicsInfo = document.getElementById('physicsInfo');
        const modeLabel = document.getElementById('modeLabel');
        
        const btnSpace = document.getElementById('btnSpace');
        const btnEarth = document.getElementById('btnEarth');
        const btnPush = document.getElementById('btnPush');
        const btnReset = document.getElementById('btnReset');
        const massButtons = document.querySelectorAll('.mass-btn');
        
        // Initialize
        resizeCanvas();
        window.addEventListener('resize', () => {
            resizeCanvas();
            initStars();
            initParticles();
            objectX = canvas.width / 2;
            objectY = canvas.height / 2;
        });
        
        // Set initial object position
        objectX = canvas.width / 2;
        objectY = canvas.height / 2;
        objectRadius = 40;
        
        // Draw space environment
        function drawSpaceEnvironment() {
            // Dark blue gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(1, '#1e293b');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars
            ctx.fillStyle = '#ffffff';
            stars.forEach(star => {
                ctx.globalAlpha = star.brightness;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            
            // Draw very subtle grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            const gridSize = 50;
            
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
        
        // Draw Earth environment
        function drawEarthEnvironment() {
            // Light gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#e0f2fe');
            gradient.addColorStop(1, '#bae6fd');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw particles (air/friction representation)
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around screen
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                ctx.fillStyle = `rgba(100, 116, 139, ${particle.opacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw ground
            const groundHeight = canvas.height * 0.2;
            ctx.fillStyle = '#475569';
            ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
            
            // Draw ground texture
            ctx.fillStyle = '#334155';
            for (let i = 0; i < canvas.width; i += 20) {
                ctx.fillRect(i, canvas.height - groundHeight, 10, 5);
            }
        }
        
        // Draw the object
        function drawObject() {
            // Scale object size based on mass
            const baseRadius = 30;
            objectRadius = baseRadius + (mass / 5000) * 20;
            
            // Draw object shadow
            ctx.fillStyle = mode === 'space' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.arc(objectX + 3, objectY + 3, objectRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw object with gradient
            const gradient = ctx.createRadialGradient(
                objectX - objectRadius * 0.3,
                objectY - objectRadius * 0.3,
                0,
                objectX,
                objectY,
                objectRadius
            );
            
            if (mode === 'space') {
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#1d4ed8');
            } else {
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#047857');
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(objectX, objectY, objectRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw object highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(
                objectX - objectRadius * 0.3,
                objectY - objectRadius * 0.3,
                objectRadius * 0.3,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Draw object outline
            ctx.strokeStyle = mode === 'space' ? '#1d4ed8' : '#047857';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(objectX, objectY, objectRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw mass label on object
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(14, objectRadius * 0.4)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${mass} kg`, objectX, objectY);
            
            // Draw motion effect if moving
            if (isMoving && velocity > 0.5) {
                ctx.save();
                ctx.globalAlpha = Math.min(0.3, velocity / 20);
                
                // Motion blur
                const blurLength = Math.min(objectRadius * 2, velocity * 10);
                ctx.fillStyle = mode === 'space' ? '#3b82f6' : '#10b981';
                
                ctx.beginPath();
                ctx.ellipse(
                    objectX - Math.cos(objectDirection) * blurLength / 2,
                    objectY - Math.sin(objectDirection) * blurLength / 2,
                    blurLength,
                    objectRadius * 0.7,
                    objectDirection,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                ctx.restore();
            }
        }
        
        // Update physics
        function updatePhysics() {
            if (isMoving && velocity > 0) {
                // Update time
                elapsedTime = (Date.now() - startTime) / 1000;
                
                // Store previous position for distance calculation
                const prevX = objectX;
                const prevY = objectY;
                
                // Update position
                objectX += Math.cos(objectDirection) * velocity;
                objectY += Math.sin(objectDirection) * velocity;
                
                // Update distance
                const dx = objectX - prevX;
                const dy = objectY - prevY;
                distance += Math.sqrt(dx * dx + dy * dy) / 100;
                
                // Calculate momentum
                momentum = mass * velocity;
                
                // Apply friction in Earth mode
                if (mode === 'earth') {
                    velocity *= 0.99; // Friction effect
                    if (velocity < 0.05) {
                        velocity = 0;
                        isMoving = false;
                    }
                }
                
                // Update displays
                updateDisplays();
                
                // Screen wrapping
                if (objectX < -objectRadius) objectX = canvas.width + objectRadius;
                if (objectX > canvas.width + objectRadius) objectX = -objectRadius;
                if (objectY < -objectRadius) objectY = canvas.height + objectRadius;
                if (objectY > canvas.height + objectRadius) objectY = -objectRadius;
                
                // Update stars/particles parallax
                if (mode === 'space') {
                    stars.forEach(star => {
                        star.x -= Math.cos(objectDirection) * velocity * 0.05;
                        star.y -= Math.sin(objectDirection) * velocity * 0.05;
                        
                        if (star.x < -10) star.x = canvas.width + 10;
                        if (star.x > canvas.width + 10) star.x = -10;
                        if (star.y < -10) star.y = canvas.height + 10;
                        if (star.y > canvas.height + 10) star.y = -10;
                    });
                }
            }
        }
        
        // Update all displays
        function updateDisplays() {
            // Update numeric values
            speedValue.textContent = `${velocity.toFixed(2)} m/s`;
            massValue.textContent = `${mass} kg`;
            distanceValue.textContent = `${distance.toFixed(1)} m`;
            timeValue.textContent = `${elapsedTime.toFixed(1)} s`;
            momentumDisplay.textContent = `MOMENTUM: ${momentum.toFixed(0)} kg·m/s`;
            
            // Update status
            if (isMoving) {
                if (mode === 'space') {
                    statusDisplay.textContent = 'STATUS: Constant Velocity Motion';
                    statusDisplay.className = 'status-display status-space';
                } else {
                    statusDisplay.textContent = 'STATUS: Slowing Down (Friction)';
                    statusDisplay.className = 'status-display status-earth';
                }
            } else {
                statusDisplay.textContent = 'STATUS: Object at Rest';
                statusDisplay.className = 'status-display status-space';
            }
            
            // Update physics info
            if (mode === 'space') {
                physicsInfo.innerHTML = `
                    <strong>Space Physics (Vacuum):</strong><br>
                    • Zero friction and air resistance<br>
                    • Object maintains constant velocity<br>
                    • Perfect demonstration of inertia<br>
                    • Once moving, continues forever
                `;
            } else {
                physicsInfo.innerHTML = `
                    <strong>Earth Physics (Atmosphere):</strong><br>
                    • Air resistance and friction present<br>
                    • Unbalanced force acts on object<br>
                    • Object gradually slows down<br>
                    • Demonstrates need for continuous force
                `;
            }
        }
        
        // Set environment mode
        function setMode(newMode) {
            mode = newMode;
            
            // Update buttons
            btnSpace.className = newMode === 'space' ? 'mode-btn active' : 'mode-btn';
            btnEarth.className = newMode === 'earth' ? 'mode-btn active' : 'mode-btn';
            
            // Update label
            modeLabel.textContent = newMode === 'space' ? 'SPACE' : 'EARTH';
            
            // Initialize environment
            if (mode === 'space') {
                initStars();
            } else {
                initParticles();
            }
            
            // Reset simulation
            resetSimulation();
        }
        
        // Set object mass
        function setMass(newMass) {
            mass = newMass;
            
            // Update buttons
            massButtons.forEach(btn => {
                btn.className = parseInt(btn.dataset.mass) === mass ? 'mass-btn active' : 'mass-btn';
            });
            
            // Update display
            massValue.textContent = `${mass} kg`;
            
            // Reset simulation
            resetSimulation();
        }
        
        // Apply force to object
        function applyForce() {
            if (isMoving) return;
            
            isMoving = true;
            startTime = Date.now();
            elapsedTime = 0;
            distance = 0;
            
            // Set initial velocity (inverse relationship with mass)
            const baseForce = 6;
            velocity = baseForce / Math.sqrt(mass / 500);
            
            // Set random direction
            objectDirection = Math.random() * Math.PI * 2;
            
            updateDisplays();
        }
        
        // Reset simulation
        function resetSimulation() {
            isMoving = false;
            velocity = 0;
            distance = 0;
            elapsedTime = 0;
            momentum = 0;
            
            // Reset object position
            objectX = canvas.width / 2;
            objectY = canvas.height / 2;
            
            updateDisplays();
        }
        
        // Main draw function
        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw environment based on mode
            if (mode === 'space') {
                drawSpaceEnvironment();
            } else {
                drawEarthEnvironment();
            }
            
            // Draw object
            drawObject();
        }
        
        // Animation loop
        function animate() {
            updatePhysics();
            draw();
            requestAnimationFrame(animate);
        }
        
        // Event Listeners
        btnSpace.addEventListener('click', () => setMode('space'));
        btnEarth.addEventListener('click', () => setMode('earth'));
        btnPush.addEventListener('click', applyForce);
        btnReset.addEventListener('click', resetSimulation);
        
        massButtons.forEach(btn => {
            btn.addEventListener('click', () => setMass(parseInt(btn.dataset.mass)));
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                applyForce();
            } else if (e.code === 'KeyR') {
                resetSimulation();
            }
        });
        
        // Initialize
        setMode('space');
        setMass(1000);
        animate();