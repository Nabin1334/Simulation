
        // Get canvas
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        function resizeCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        
        // Variables
        let appliedForce = 81; // N - Starting at 81N as per header
        const brickArea = 0.0025; // m²
        const originalFoamHeight = 180;
        const brickWidth = 100;
        
        // Resize canvas initially
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Set up force slider
        const forceSlider = document.getElementById('force-slider');
        forceSlider.value = appliedForce; // Set initial slider value
        
        forceSlider.addEventListener('input', function() {
            appliedForce = parseInt(this.value);
            
            // Calculate pressure
            const pressure = appliedForce / brickArea;
            const compression = Math.min(0.7, appliedForce / 200 * 0.7);
            
            // Update all displays
            updateDisplays(appliedForce, pressure, compression);
            
            // Redraw simulation
            draw(compression);
        });
        
        // Update all display elements
        function updateDisplays(force, pressure, compression) {
            // Update force displays
            document.getElementById('force-value').textContent = force + ' N';
            document.getElementById('data-force').innerHTML = force + '<span class="data-unit"> N</span>';
            document.getElementById('header-force').textContent = force + ' N';
            
            // Update pressure displays
            const pressureFormatted = Math.round(pressure).toLocaleString();
            document.getElementById('pressure-value').textContent = pressureFormatted + ' Pa';
            document.getElementById('data-pressure').innerHTML = pressureFormatted + '<span class="data-unit"> Pa</span>';
            document.getElementById('header-pressure').textContent = pressureFormatted + ' Pa';
            
            // Update compression display
            const compressionPercent = Math.round(compression * 100);
            document.getElementById('data-compression').innerHTML = compressionPercent + '<span class="data-unit"> %</span>';
            
            // Update pressure bar
            const pressureBar = document.getElementById('pressure-bar');
            const pressureWidth = Math.min(100, (pressure / 100000) * 100);
            pressureBar.style.width = pressureWidth + '%';
        }
        
        // Enhanced draw function with brown brick
        function draw(compression = 0.28) {
            // Clear canvas with gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(1, '#1e293b');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw table
            const tableY = canvas.height * 0.75;
            const tableHeight = canvas.height - tableY;
            
            // Table with 3D effect
            ctx.fillStyle = '#334155';
            ctx.fillRect(0, tableY, canvas.width, tableHeight);
            
            // Table edge
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, tableY, canvas.width, 12);
            
            // Table shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, tableY + 12, canvas.width, 6);
            
            // Draw realistic foam
            const centerX = canvas.width / 2;
            const foamWidth = Math.min(550, canvas.width * 0.75);
            const foamHeight = originalFoamHeight * (1 - compression);
            const foamY = tableY - foamHeight;
            
            // Foam gradient based on compression
            const foamGradient = ctx.createLinearGradient(0, foamY, 0, tableY);
            if (compression < 0.2) {
                foamGradient.addColorStop(0, '#e0e7ff');
                foamGradient.addColorStop(1, '#c7d2fe');
            } else if (compression < 0.4) {
                foamGradient.addColorStop(0, '#c7d2fe');
                foamGradient.addColorStop(1, '#a5b4fc');
            } else if (compression < 0.6) {
                foamGradient.addColorStop(0, '#a5b4fc');
                foamGradient.addColorStop(1, '#818cf8');
            } else {
                foamGradient.addColorStop(0, '#818cf8');
                foamGradient.addColorStop(1, '#6366f1');
            }
            
            // Draw foam with rounded corners
            ctx.fillStyle = foamGradient;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 8;
            
            const cornerRadius = 25;
            ctx.beginPath();
            ctx.moveTo(centerX - foamWidth/2 + cornerRadius, foamY);
            ctx.lineTo(centerX + foamWidth/2 - cornerRadius, foamY);
            ctx.quadraticCurveTo(centerX + foamWidth/2, foamY, centerX + foamWidth/2, foamY + cornerRadius);
            ctx.lineTo(centerX + foamWidth/2, tableY);
            ctx.lineTo(centerX - foamWidth/2, tableY);
            ctx.lineTo(centerX - foamWidth/2, foamY + cornerRadius);
            ctx.quadraticCurveTo(centerX - foamWidth/2, foamY, centerX - foamWidth/2 + cornerRadius, foamY);
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            // Draw foam cellular structure
            drawFoamCells(centerX, foamWidth, foamY, foamHeight, tableY, compression);
            
            // Draw brick with brown color
            const brickHeight = 80;
            const brickY = foamY - brickHeight;
            
            // Brick shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(centerX - brickWidth/2 + 8, brickY + 8, brickWidth, brickHeight);
            
            // Brick body with brown gradient
            const brickGradient = ctx.createLinearGradient(0, brickY, 0, brickY + brickHeight);
            brickGradient.addColorStop(0, '#92400e'); // Light brown
            brickGradient.addColorStop(0.5, '#78350f'); // Medium brown
            brickGradient.addColorStop(1, '#451a03'); // Dark brown
            
            ctx.fillStyle = brickGradient;
            ctx.fillRect(centerX - brickWidth/2, brickY, brickWidth, brickHeight);
            
            // Brick texture with darker brown
            ctx.fillStyle = 'rgba(68, 36, 10, 0.8)';
            for (let i = 0; i < 5; i++) {
                const y = brickY + 15 + i * 15;
                ctx.fillRect(centerX - brickWidth/2 + 12, y, brickWidth - 24, 4);
            }
            
            // Brick edges
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(centerX - brickWidth/2, brickY, brickWidth, brickHeight);
            
            // Draw clear compression indicator on the right
            const scaleX = centerX + foamWidth/2 + 80;
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            
            ctx.beginPath();
            ctx.moveTo(scaleX, tableY - originalFoamHeight);
            ctx.lineTo(scaleX, foamY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Compression scale markers
            ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            
            for (let i = 0; i <= 100; i += 20) {
                const yPos = tableY - originalFoamHeight + (originalFoamHeight * (i/100));
                ctx.beginPath();
                ctx.moveTo(scaleX - 10, yPos);
                ctx.lineTo(scaleX + 10, yPos);
                ctx.stroke();
                ctx.fillText(i + '%', scaleX + 18, yPos + 5);
            }
            
            // Current compression marker
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(scaleX, foamY, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw measurement grid for clarity
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            
            // Vertical measurement lines
            for (let x = centerX - foamWidth/2; x <= centerX + foamWidth/2; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, foamY);
                ctx.lineTo(x, tableY);
                ctx.stroke();
            }
            
            // Horizontal measurement lines
            for (let y = foamY; y <= tableY; y += 30) {
                ctx.beginPath();
                ctx.moveTo(centerX - foamWidth/2, y);
                ctx.lineTo(centerX + foamWidth/2, y);
                ctx.stroke();
            }
            
            // Draw labels for clarity
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            
            // Brick label
            ctx.fillText(`APPLIED FORCE: ${appliedForce} N`, centerX, brickY - 30);
            ctx.fillText('BRICK', centerX, brickY + brickHeight/2);
            
            // Foam label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '16px Arial';
            ctx.fillText('COMPRESSIBLE FOAM', centerX, foamY + foamHeight/2);
            
            // Table label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '14px Arial';
            ctx.fillText('TABLE SURFACE', centerX, tableY + 40);
            
            // Draw pressure zone visualization
            const pressure = appliedForce / brickArea;
            const maxPressure = 100000;
            const pressureIntensity = Math.min(1, pressure / maxPressure);
            
            // Draw pressure gradient effect around brick
            const pressureRadius = brickWidth/2 + 20;
            const pressureGradient = ctx.createRadialGradient(
                centerX, brickY + brickHeight/2, 0,
                centerX, brickY + brickHeight/2, pressureRadius
            );
            
            pressureGradient.addColorStop(0, `rgba(96, 165, 250, ${0.3 + pressureIntensity * 0.7})`);
            pressureGradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
            
            ctx.fillStyle = pressureGradient;
            ctx.beginPath();
            ctx.arc(centerX, brickY + brickHeight/2, pressureRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Pressure label
            ctx.fillStyle = 'rgba(96, 165, 250, 0.9)';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`PRESSURE: ${Math.round(pressure).toLocaleString()} Pa`, centerX, brickY - 60);
        }
        
        // Draw realistic foam cells
        function drawFoamCells(centerX, foamWidth, foamY, foamHeight, tableY, compression) {
            const cellSize = 16;
            const cellSpacing = 4;
            const rows = Math.floor(foamHeight / (cellSize + cellSpacing));
            const cols = Math.floor(foamWidth / (cellSize + cellSpacing));
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = centerX - foamWidth/2 + cellSpacing + col * (cellSize + cellSpacing);
                    const y = foamY + cellSpacing + row * (cellSize + cellSpacing);
                    
                    if (x < centerX - foamWidth/2 || x > centerX + foamWidth/2 - cellSize) continue;
                    if (y > tableY - cellSize) continue;
                    
                    // Cell color based on position and compression
                    const cellDepth = (y - foamY) / foamHeight;
                    const opacity = 0.6 - cellDepth * 0.4;
                    
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.strokeStyle = `rgba(200, 200, 255, ${opacity * 0.6})`;
                    ctx.lineWidth = 1.5;
                    
                    // Draw hexagonal cell
                    ctx.beginPath();
                    const centerXCell = x + cellSize/2;
                    const centerYCell = y + cellSize/2;
                    
                    for (let i = 0; i < 6; i++) {
                        const angle = Math.PI / 3 * i + Math.PI / 6;
                        const distortion = compression * 2;
                        const px = centerXCell + (cellSize/2 + Math.random() * distortion) * Math.cos(angle);
                        const py = centerYCell + (cellSize/2 + Math.random() * distortion) * Math.sin(angle);
                        
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
        
        // Initial draw and setup
        const initialCompression = Math.min(0.7, appliedForce / 200 * 0.7);
        draw(initialCompression);
        
        // Initialize displays
        updateDisplays(appliedForce, appliedForce/brickArea, initialCompression);