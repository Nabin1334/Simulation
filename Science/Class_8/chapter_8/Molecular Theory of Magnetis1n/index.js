// Get canvas and context
        const canvas = document.getElementById('magnetCanvas');
        const ctx = canvas.getContext('2d');
        
        // State variables
        let currentState = 'demagnetized';
        let molecules = [];
        
        // Colors
        const colors = {
            molecule: '#9b59b6',
            north: '#e74c3c',
            south: '#3498db',
            background: '#f8f9fa'
        };
        
        // Set canvas size
        function resizeCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            createMolecules();
            drawMolecules();
        }
        
        // Molecule class
        class Molecule {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.min(canvas.width, canvas.height) * 0.03;
                this.angle = 0;
                this.targetAngle = 0;
                this.animationSpeed = 0.05;
                this.isAnimating = false;
            }
            
            update() {
                // Animate toward target angle
                if (Math.abs(this.angle - this.targetAngle) > 0.01) {
                    this.isAnimating = true;
                    
                    // Calculate shortest angle difference
                    let angleDiff = this.targetAngle - this.angle;
                    angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
                    
                    // Move toward target
                    this.angle += angleDiff * this.animationSpeed;
                    
                    // Snap to target when close
                    if (Math.abs(angleDiff) < 0.05) {
                        this.angle = this.targetAngle;
                        this.isAnimating = false;
                    }
                } else {
                    this.isAnimating = false;
                }
            }
            
            draw() {
                const length = this.size * 2.5;
                
                // Save context
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                
                // Draw molecule body (ellipse)
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size/1.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = colors.molecule;
                ctx.fill();
                
                // Draw outline
                ctx.strokeStyle = '#8e44ad';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                // Draw north pole (red)
                ctx.beginPath();
                ctx.arc(length/2, 0, this.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = colors.north;
                ctx.fill();
                
                // Draw south pole (blue)
                ctx.beginPath();
                ctx.arc(-length/2, 0, this.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = colors.south;
                ctx.fill();
                
                // Draw connecting line
                ctx.beginPath();
                ctx.moveTo(length/2, 0);
                ctx.lineTo(-length/2, 0);
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Draw arrowhead on north pole
                ctx.beginPath();
                ctx.moveTo(length/2, 0);
                ctx.lineTo(length/2 - this.size * 0.6, -this.size * 0.4);
                ctx.lineTo(length/2 - this.size * 0.6, this.size * 0.4);
                ctx.closePath();
                ctx.fillStyle = colors.north;
                ctx.fill();
                
                // Restore context
                ctx.restore();
            }
        }
        
        // Create molecules in a grid
        function createMolecules() {
            molecules = [];
            
            const moleculeSize = Math.min(canvas.width, canvas.height) * 0.03;
            const spacing = moleculeSize * 4;
            
            // Calculate grid
            const cols = Math.floor(canvas.width / spacing);
            const rows = Math.floor(canvas.height / spacing);
            
            // Center the grid
            const startX = (canvas.width - (cols - 1) * spacing) / 2;
            const startY = (canvas.height - (rows - 1) * spacing) / 2;
            
            // Create molecules
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = startX + col * spacing;
                    const y = startY + row * spacing;
                    const molecule = new Molecule(x, y);
                    
                    // Set initial angle based on current state
                    if (currentState === 'demagnetized') {
                        molecule.angle = Math.random() * Math.PI * 2;
                        molecule.targetAngle = molecule.angle;
                    } else {
                        molecule.angle = (Math.random() - 0.5) * 0.5;
                        molecule.targetAngle = 0;
                    }
                    
                    molecules.push(molecule);
                }
            }
        }
        
        // Update molecules based on current state
        function updateMolecules() {
            molecules.forEach(molecule => {
                if (currentState === 'demagnetized') {
                    // Set random target angles for unmagnetized
                    molecule.targetAngle = Math.random() * Math.PI * 2;
                } else {
                    // Set aligned target angles for magnetized
                    molecule.targetAngle = (Math.random() - 0.5) * 0.3; // Slight variation
                }
            });
        }
        
        // Draw all molecules
        function drawMolecules() {
            // Clear canvas with background color
            ctx.fillStyle = colors.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw magnetic field indicator if magnetized
            if (currentState === 'magnetized') {
                drawMagneticField();
            }
            
            // Update and draw molecules
            let anyAnimating = false;
            
            molecules.forEach(molecule => {
                molecule.update();
                molecule.draw();
                
                if (molecule.isAnimating) {
                    anyAnimating = true;
                }
            });
            
            // Draw N and S labels if magnetized
            if (currentState === 'magnetized') {
                drawMagnetLabels();
            }
            
            // Continue animation if any molecules are still moving
            if (anyAnimating) {
                requestAnimationFrame(drawMolecules);
            }
        }
        
        // Draw magnetic field lines
        function drawMagneticField() {
            ctx.strokeStyle = 'rgba(231, 76, 60, 0.15)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            // Draw curved field lines from left to right
            for (let y = 30; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                
                // Control points for curve
                const cp1x = canvas.width * 0.3;
                const cp1y = y + 15;
                const cp2x = canvas.width * 0.7;
                const cp2y = y - 15;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, canvas.width, y);
                ctx.stroke();
            }
            
            ctx.setLineDash([]);
        }
        
        // Draw magnet labels (N and S)
        function drawMagnetLabels() {
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = colors.north;
            ctx.textAlign = 'center';
            ctx.fillText('N', canvas.width * 0.15, 30);
            
            ctx.fillStyle = colors.south;
            ctx.fillText('S', canvas.width * 0.85, 30);
        }
        
        // Update status display
        function updateStatus() {
            const statusDisplay = document.getElementById('statusDisplay');
            
            if (currentState === 'demagnetized') {
                statusDisplay.textContent = 'Unmagnetized State: Molecules are randomly arranged';
                statusDisplay.className = 'status-display demagnetized';
            } else {
                statusDisplay.textContent = 'Magnetized State: Molecules are orderly arranged';
                statusDisplay.className = 'status-display magnetized';
            }
        }
        
        // Setup button controls
        function setupControls() {
            const btnDemagnetized = document.getElementById('btn-demagnetized');
            const btnMagnetized = document.getElementById('btn-magnetized');
            
            btnDemagnetized.addEventListener('click', () => {
                currentState = 'demagnetized';
                btnDemagnetized.classList.add('active');
                btnMagnetized.classList.remove('active');
                updateMolecules();
                updateStatus();
                drawMolecules();
            });
            
            btnMagnetized.addEventListener('click', () => {
                currentState = 'magnetized';
                btnMagnetized.classList.add('active');
                btnDemagnetized.classList.remove('active');
                updateMolecules();
                updateStatus();
                drawMolecules();
            });
        }
        
        // Initialize
        window.addEventListener('load', () => {
            resizeCanvas();
            setupControls();
            updateStatus();
        });
        
        window.addEventListener('resize', () => {
            resizeCanvas();
        });
        
        // Auto-animate every few seconds to show molecules have slight motion
        setInterval(() => {
            if (currentState === 'demagnetized') {
                // Add slight random movement to unmagnetized molecules
                molecules.forEach(molecule => {
                    molecule.targetAngle += (Math.random() - 0.5) * 0.1;
                });
                drawMolecules();
            }
        }, 2000);