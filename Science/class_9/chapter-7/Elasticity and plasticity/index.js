// Canvas setup
        const canvas = document.getElementById('physicsCanvas');
        const ctx = canvas.getContext('2d');
        
        // Graph canvases
        const lengthGraph = document.getElementById('lengthGraph');
        const forceGraph = document.getElementById('forceGraph');
        const deformGraph = document.getElementById('deformGraph');
        const lengthCtx = lengthGraph.getContext('2d');
        const forceCtx = forceGraph.getContext('2d');
        const deformCtx = deformGraph.getContext('2d');
        
        // Initialize canvas size
        function resizeCanvas() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            updateGraphSize();
        }
        
        function updateGraphSize() {
            lengthGraph.width = lengthGraph.parentElement.clientWidth;
            forceGraph.width = forceGraph.parentElement.clientWidth;
            deformGraph.width = deformGraph.parentElement.clientWidth;
        }
        
        // Physics state
        let currentMode = 'elastic';
        let isDragging = false;
        let mouseX = 0;
        let lastTime = 0;
        let autoStretch = false;
        let autoPhase = 0;
        
        // Physics properties
        const physics = {
            // Shared properties
            originalLength: 300,
            currentLength: 300,
            appliedForce: 0,
            deformation: 0,
            
            // Elastic properties
            stiffness: 0.05,  // Spring constant
            damping: 0.95,    // Energy loss
            velocity: 0,
            
            // Plastic properties
            yieldStrength: 25,  // Force needed for permanent deformation
            permanentDeformation: 0,
            plasticLength: 300,
            hasYielded: false
        };
        
        // Data history for graphs
        const dataHistory = {
            length: [],
            force: [],
            deformation: [],
            timestamps: []
        };
        
        // Initialize
        function init() {
            resizeCanvas();
            
            // Event listeners
            canvas.addEventListener('mousedown', startDrag);
            canvas.addEventListener('mousemove', drag);
            canvas.addEventListener('mouseup', endDrag);
            canvas.addEventListener('mouseleave', endDrag);
            
            canvas.addEventListener('touchstart', handleTouch);
            canvas.addEventListener('touchmove', handleTouch);
            canvas.addEventListener('touchend', endDrag);
            
            window.addEventListener('resize', resizeCanvas);
            
            // Control listeners
            document.getElementById('stiffness').addEventListener('input', updateStiffness);
            document.getElementById('damping').addEventListener('input', updateDamping);
            document.getElementById('yieldStrength').addEventListener('input', updateYieldStrength);
            
            // Tooltip
            canvas.addEventListener('mouseenter', () => {
                document.getElementById('helpTooltip').style.display = 'block';
            });
            
            canvas.addEventListener('mouseleave', () => {
                document.getElementById('helpTooltip').style.display = 'none';
            });
            
            // Start animation
            requestAnimationFrame(animate);
            
            // Update UI
            updateUI();
        }
        
        // Handle touch events
        function handleTouch(e) {
            e.preventDefault();
            if (e.touches.length > 0) {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.touches[0].clientX - rect.left;
                
                if (e.type === 'touchstart') {
                    startDrag(e);
                } else if (e.type === 'touchmove') {
                    drag(e);
                }
            }
        }
        
        // Switch material type
        function switchMaterial(type) {
            currentMode = type;
            
            // Update button states
            document.querySelector('.elastic-btn').classList.toggle('active', type === 'elastic');
            document.querySelector('.plastic-btn').classList.toggle('active', type === 'plastic');
            
            // Update mode indicator
            const indicator = document.getElementById('modeIndicator');
            indicator.textContent = type === 'elastic' ? 'ELASTIC MODE' : 'PLASTIC MODE';
            indicator.className = type === 'elastic' ? 'mode-indicator elastic-mode' : 'mode-indicator plastic-mode';
            
            // Update UI
            updateUI();
        }
        
        // Update control values
        function updateStiffness(e) {
            physics.stiffness = parseFloat(e.target.value);
            document.getElementById('stiffnessValue').textContent = physics.stiffness.toFixed(2);
        }
        
        function updateDamping(e) {
            physics.damping = parseFloat(e.target.value);
            document.getElementById('dampingValue').textContent = physics.damping.toFixed(2);
        }
        
        function updateYieldStrength(e) {
            physics.yieldStrength = parseInt(e.target.value);
            document.getElementById('yieldStrengthValue').textContent = physics.yieldStrength + ' N';
            document.getElementById('yieldPoint').textContent = physics.yieldStrength + ' N';
        }
        
        // Start dragging
        function startDrag(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            mouseX = x - rect.left;
            
            const ballX = 150 + physics.currentLength;
            const ballY = canvas.height / 2;
            const ballRadius = 40;
            
            const distance = Math.sqrt(Math.pow(mouseX - ballX, 2) + Math.pow(canvas.height/2 - ballY, 2));
            
            if (distance < ballRadius) {
                isDragging = true;
                canvas.style.cursor = 'grabbing';
                
                if (currentMode === 'plastic') {
                    physics.hasYielded = false;
                }
            }
        }
        
        // Handle dragging
        function drag(e) {
            if (!isDragging) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const dragX = x - rect.left;
            
            // Calculate new length with limits
            let targetLength = dragX - 150;
            targetLength = Math.max(100, Math.min(500, targetLength));
            
            // Calculate applied force (simplified Hooke's Law)
            const stretch = targetLength - physics.originalLength;
            physics.appliedForce = Math.abs(stretch * physics.stiffness * 100);
            
            if (currentMode === 'elastic') {
                // Elastic: Direct control of spring
                physics.currentLength = targetLength;
                
                // Calculate velocity for animation
                physics.velocity = (targetLength - physics.currentLength) * 0.5;
                
            } else {
                // Plastic: Check yield strength
                if (physics.appliedForce > physics.yieldStrength) {
                    // Plastic deformation occurs
                    physics.hasYielded = true;
                    physics.permanentDeformation = targetLength - physics.originalLength;
                    physics.plasticLength = targetLength;
                    physics.currentLength = targetLength;
                } else {
                    // Elastic behavior before yielding
                    physics.currentLength = targetLength;
                    physics.permanentDeformation = 0;
                }
            }
            
            updateUI();
        }
        
        // End dragging
        function endDrag() {
            isDragging = false;
            canvas.style.cursor = 'default';
            physics.appliedForce = 0;
            
            if (currentMode === 'plastic' && physics.hasYielded) {
                // Permanent deformation stays
                physics.originalLength = physics.plasticLength;
            }
            
            updateUI();
        }
        
        // Reset experiment
        function resetExperiment() {
            physics.originalLength = 300;
            physics.currentLength = 300;
            physics.appliedForce = 0;
            physics.velocity = 0;
            physics.permanentDeformation = 0;
            physics.plasticLength = 300;
            physics.hasYielded = false;
            
            dataHistory.length = [];
            dataHistory.force = [];
            dataHistory.deformation = [];
            dataHistory.timestamps = [];
            
            updateUI();
        }
        
        // Toggle auto-stretch
        function toggleAutoStretch() {
            autoStretch = !autoStretch;
            autoPhase = 0;
            document.getElementById('autoBtnText').textContent = 
                autoStretch ? 'Stop Auto-Stretch' : 'Start Auto-Stretch';
        }
        
        // Update physics simulation
        function updatePhysics(deltaTime) {
            if (autoStretch) {
                // Auto-stretch animation
                autoPhase += deltaTime * 0.001;
                const targetLength = 300 + Math.sin(autoPhase) * 200;
                physics.currentLength += (targetLength - physics.currentLength) * 0.05;
                physics.appliedForce = Math.abs((physics.currentLength - 300) * physics.stiffness * 100);
                
                if (currentMode === 'plastic' && physics.appliedForce > physics.yieldStrength) {
                    physics.hasYielded = true;
                    physics.permanentDeformation = physics.currentLength - 300;
                    physics.plasticLength = physics.currentLength;
                }
            }
            
            if (!isDragging && !autoStretch) {
                if (currentMode === 'elastic') {
                    // Spring physics simulation
                    const stretch = physics.currentLength - physics.originalLength;
                    const acceleration = -physics.stiffness * stretch - physics.velocity * 0.1;
                    
                    physics.velocity += acceleration * deltaTime * 0.016;
                    physics.velocity *= physics.damping;
                    physics.currentLength += physics.velocity;
                    
                    // Prevent overshoot
                    if (Math.abs(stretch) < 1 && Math.abs(physics.velocity) < 0.1) {
                        physics.currentLength = physics.originalLength;
                        physics.velocity = 0;
                    }
                } else if (currentMode === 'plastic' && physics.hasYielded) {
                    // Plastic material stays deformed
                    physics.currentLength = physics.plasticLength;
                } else {
                    // Plastic material returns to original if not yielded
                    physics.currentLength += (physics.originalLength - physics.currentLength) * 0.1;
                }
            }
            
            // Calculate deformation percentage
            physics.deformation = ((physics.currentLength - physics.originalLength) / physics.originalLength) * 100;
            
            // Store data for graphs
            const now = Date.now();
            dataHistory.length.push(physics.currentLength);
            dataHistory.force.push(physics.appliedForce);
            dataHistory.deformation.push(Math.abs(physics.deformation));
            dataHistory.timestamps.push(now);
            
            // Keep only last 50 data points
            if (dataHistory.length.length > 50) {
                dataHistory.length.shift();
                dataHistory.force.shift();
                dataHistory.deformation.shift();
                dataHistory.timestamps.shift();
            }
        }
        
        // Update UI displays
        function updateUI() {
            // Update numeric displays
            document.getElementById('currentLength').textContent = Math.round(physics.currentLength) + ' px';
            document.getElementById('originalLength').textContent = Math.round(physics.originalLength) + ' px';
            document.getElementById('appliedForce').textContent = physics.appliedForce.toFixed(1) + ' N';
            document.getElementById('deformation').textContent = physics.deformation.toFixed(1) + '%';
            
            // Update deformation type
            const deformType = document.getElementById('deformationType');
            if (currentMode === 'elastic') {
                deformType.textContent = 'Elastic (Temporary)';
                deformType.style.color = '#00b09b';
            } else {
                if (physics.hasYielded) {
                    deformType.textContent = 'Plastic (Permanent)';
                    deformType.style.color = '#ff416c';
                } else {
                    deformType.textContent = 'Elastic (Not Yielded)';
                    deformType.style.color = '#00b09b';
                }
            }
            
            // Update graphs
            drawGraphs();
        }
        
        // Draw the main simulation
        function drawSimulation() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerY = canvas.height / 2;
            const startX = 150;
            
            // Draw background grid
            drawGrid();
            
            // Draw fixed wall
            drawWall(ctx, startX - 50, centerY - 80);
            
            // Draw material based on mode
            if (currentMode === 'elastic') {
                drawSpring(ctx, startX, centerY, physics.currentLength);
            } else {
                drawPlasticMaterial(ctx, startX, centerY, physics.currentLength);
            }
            
            // Draw draggable ball
            drawBall(ctx, startX + physics.currentLength, centerY);
            
            // Draw physics info on canvas
            drawCanvasInfo(ctx, startX + physics.currentLength + 60, centerY - 100);
            
            // Draw yield point indicator for plastic mode
            if (currentMode === 'plastic') {
                const yieldLength = physics.yieldStrength / (physics.stiffness * 100) + physics.originalLength;
                drawYieldIndicator(ctx, startX + yieldLength, centerY);
            }
        }
        
        // Draw grid background
        function drawGrid() {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
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
        }
        
        // Draw fixed wall
        function drawWall(ctx, x, y) {
            // Wall base
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(x, y, 40, 160);
            
            // Wall texture
            ctx.fillStyle = '#34495e';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(x, y + i * 32, 40, 8);
            }
            
            // Wall label
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('FIXED END', x - 30, y + 180);
        }
        
        // Draw spring for elastic mode
        function drawSpring(ctx, startX, centerY, length) {
            const coils = 12;
            const coilHeight = 40;
            const coilWidth = length / coils;
            
            ctx.strokeStyle = '#00b09b';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(startX, centerY);
            
            for (let i = 0; i < coils; i++) {
                const x1 = startX + i * coilWidth;
                const x2 = startX + (i + 0.25) * coilWidth;
                const x3 = startX + (i + 0.75) * coilWidth;
                const x4 = startX + (i + 1) * coilWidth;
                
                ctx.bezierCurveTo(x2, centerY - coilHeight, x3, centerY - coilHeight, x4, centerY);
                
                if (i < coils - 1) {
                    ctx.bezierCurveTo(x4, centerY + coilHeight, x4 + coilWidth * 0.25, centerY + coilHeight, x4 + coilWidth * 0.5, centerY);
                }
            }
            
            ctx.stroke();
            
            // Draw spring label
            ctx.fillStyle = '#00b09b';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SPRING (Elastic)', startX + length / 2, centerY - 80);
        }
        
        // Draw plastic material
        function drawPlasticMaterial(ctx, startX, centerY, length) {
            // Material gradient
            const gradient = ctx.createLinearGradient(startX, centerY - 30, startX + length, centerY + 30);
            
            if (physics.hasYielded) {
                gradient.addColorStop(0, '#ff416c');
                gradient.addColorStop(0.5, '#ff9a76');
                gradient.addColorStop(1, '#ff416c');
            } else {
                gradient.addColorStop(0, '#ff9a76');
                gradient.addColorStop(1, '#ff6b6b');
            }
            
            // Main material body
            ctx.fillStyle = gradient;
            ctx.fillRect(startX, centerY - 30, length, 60);
            
            // Material texture
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < length; i += 20) {
                ctx.fillRect(startX + i, centerY - 30, 8, 60);
            }
            
            // Original length indicator
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = physics.hasYielded ? '#ff416c' : '#ff9a76';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX + physics.originalLength, centerY - 50);
            ctx.lineTo(startX + physics.originalLength, centerY + 50);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Material label
            ctx.fillStyle = physics.hasYielded ? '#ff416c' : '#ff6b6b';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PLASTIC MATERIAL', startX + length / 2, centerY - 80);
        }
        
        // Draw draggable ball
        function drawBall(ctx, x, y) {
            // Ball shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(x + 5, y + 5, 38, 0, Math.PI * 2);
            ctx.fill();
            
            // Ball gradient
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
            gradient.addColorStop(0, currentMode === 'elastic' ? '#96c93d' : '#ff9a76');
            gradient.addColorStop(1, currentMode === 'elastic' ? '#00b09b' : '#ff416c');
            
            // Ball body
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
            
            // Ball highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(x - 15, y - 15, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Ball text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('DRAG', x, y);
            
            // Force arrow when dragging
            if (isDragging) {
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                ctx.moveTo(x + 45, y);
                ctx.lineTo(x + 120, y);
                ctx.stroke();
                
                // Arrow head
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(x + 120, y);
                ctx.lineTo(x + 105, y - 10);
                ctx.lineTo(x + 105, y + 10);
                ctx.closePath();
                ctx.fill();
                
                ctx.fillStyle = '#e74c3c';
                ctx.font = 'bold 14px Arial';
                ctx.fillText('APPLYING FORCE', x + 80, y - 20);
            }
        }
        
        // Draw yield point indicator
        function drawYieldIndicator(ctx, x, y) {
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(x, y - 70);
            ctx.lineTo(x, y + 70);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('YIELD POINT', x, y - 85);
        }
        
        // Draw physics info on canvas
        function drawCanvasInfo(ctx, x, y) {
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 16px Arial';
            
            if (currentMode === 'elastic') {
                ctx.fillText(`Elastic Material`, x, y);
                ctx.font = '14px Arial';
                ctx.fillText(`Stiffness: ${physics.stiffness.toFixed(2)}`, x, y + 25);
                ctx.fillText(`Force: ${physics.appliedForce.toFixed(1)} N`, x, y + 50);
                ctx.fillText(`Returns to original shape`, x, y + 75);
            } else {
                ctx.fillText(`Plastic Material`, x, y);
                ctx.font = '14px Arial';
                ctx.fillText(`Yield: ${physics.yieldStrength} N`, x, y + 25);
                ctx.fillText(`Force: ${physics.appliedForce.toFixed(1)} N`, x, y + 50);
                
                if (physics.hasYielded) {
                    ctx.fillStyle = '#e74c3c';
                    ctx.fillText(`PERMANENT DEFORMATION!`, x, y + 75);
                } else {
                    ctx.fillText(`Below yield point`, x, y + 75);
                }
            }
        }
        
        // Draw real-time graphs
        function drawGraphs() {
            drawGraph(lengthCtx, dataHistory.length, '#00b09b', 'Length');
            drawGraph(forceCtx, dataHistory.force, '#ff416c', 'Force');
            drawGraph(deformCtx, dataHistory.deformation, 
                     currentMode === 'elastic' ? '#00b09b' : '#ff416c', 'Deform');
        }
        
        function drawGraph(ctx, data, color, label) {
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;
            
            // Clear graph
            ctx.clearRect(0, 0, width, height);
            
            if (data.length < 2) return;
            
            // Draw grid
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();
            
            // Find data range
            const max = Math.max(...data, 1);
            const min = Math.min(...data, 0);
            const range = max - min || 1;
            
            // Draw graph line
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < data.length; i++) {
                const x = (i / data.length) * width;
                const y = height - ((data[i] - min) / range) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Draw label
            ctx.fillStyle = '#2c3e50';
            ctx.font = '10px Arial';
            ctx.fillText(label, 5, 12);
        }
        
        // Animation loop
        function animate(timestamp) {
            if (!lastTime) lastTime = timestamp;
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;
            
            updatePhysics(deltaTime);
            drawSimulation();
            updateUI();
            
            requestAnimationFrame(animate);
        }
        
        // Initialize on load
        window.addEventListener('load', init);