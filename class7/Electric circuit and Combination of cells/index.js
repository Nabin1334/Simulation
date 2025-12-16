
        // Circuit states for each configuration
        const circuits = [
            { 
                id: 1, 
                closed: false, 
                cells: 1, 
                brightness: 0.6, // Normal brightness for 1 cell
                bulbClass: 'on-normal',
                filamentClass: 'on-normal'
            },
            { 
                id: 2, 
                closed: false, 
                cells: 2, 
                brightness: 0.8, // Brighter for 2 cells
                bulbClass: 'on-bright',
                filamentClass: 'on-bright'
            },
            { 
                id: 3, 
                closed: false, 
                cells: 3, 
                brightness: 1.0, // Very bright for 3 cells
                bulbClass: 'on-very-bright',
                filamentClass: 'on-very-bright'
            }
        ];

        // Initialize canvas contexts
        const canvas1 = document.getElementById('circuit1');
        const ctx1 = canvas1.getContext('2d');
        const canvas2 = document.getElementById('circuit2');
        const ctx2 = canvas2.getContext('2d');
        const canvas3 = document.getElementById('circuit3');
        const ctx3 = canvas3.getContext('2d');

        // Animation IDs
        const animationIds = [null, null, null];

        // Draw circuit with specified number of cells
        function drawCircuit(ctx, cellCount, circuitClosed, circuitId) {
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;
            
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw background
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, width, height);
            
            // Circuit parameters
            const startX = 50;
            const cellSpacing = 50;
            const cellWidth = 30;
            const cellHeight = 60;
            const wireY = height / 2;
            const bulbX = width - 80;
            const switchX = width - 180;
            
            // Draw horizontal wire (main wire)
            ctx.strokeStyle = circuitClosed ? '#e74c3c' : '#7f8c8d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, wireY);
            ctx.lineTo(width - 50, wireY);
            ctx.stroke();
            
            // Draw cells in series
            for (let i = 0; i < cellCount; i++) {
                const cellX = startX + i * cellSpacing;
                
                // Draw cell body
                ctx.fillStyle = '#34495e';
                ctx.fillRect(cellX, wireY - cellHeight/2, cellWidth, cellHeight);
                
                // Draw positive terminal (red)
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(cellX + cellWidth/2 - 4, wireY - cellHeight/2 - 8, 8, 8);
                
                // Draw negative terminal (blue)
                ctx.fillStyle = '#3498db';
                ctx.fillRect(cellX + cellWidth/2 - 4, wireY + cellHeight/2, 8, 8);
                
                // Draw plus/minus signs
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('+', cellX + cellWidth/2 - 3, wireY - cellHeight/2 + 20);
                ctx.fillText('−', cellX + cellWidth/2 - 3, wireY + cellHeight/2 - 10);
                
                // Draw cell number
                ctx.fillStyle = '#2c3e50';
                ctx.font = '10px Arial';
                ctx.fillText(`${i+1}`, cellX + cellWidth/2 - 3, wireY - cellHeight/2 - 15);
            }
            
            // Draw connecting wire from last cell to switch
            if (cellCount > 0) {
                const lastCellX = startX + (cellCount - 1) * cellSpacing + cellWidth;
                ctx.strokeStyle = circuitClosed ? '#e74c3c' : '#7f8c8d';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(lastCellX, wireY);
                ctx.lineTo(switchX - 10, wireY);
                ctx.stroke();
            }
            
            // Draw switch
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(switchX - 20, wireY - 15, 40, 30);
            
            // Draw switch contacts
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(switchX - 10, wireY, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(switchX + 10, wireY, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw switch lever
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 4;
            ctx.beginPath();
            if (circuitClosed) {
                ctx.moveTo(switchX - 10, wireY);
                ctx.lineTo(switchX + 10, wireY);
            } else {
                ctx.moveTo(switchX - 10, wireY);
                ctx.lineTo(switchX - 10, wireY - 15);
            }
            ctx.stroke();
            
            // Draw wire from switch to bulb
            ctx.strokeStyle = circuitClosed ? '#e74c3c' : '#7f8c8d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(switchX + 10, wireY);
            ctx.lineTo(bulbX - 25, wireY);
            ctx.stroke();
            
            // Draw bulb
            const bulbRadius = 25;
            const bulbCenterX = bulbX;
            const bulbCenterY = wireY;
            
            // Draw bulb glow if circuit is closed
            if (circuitClosed) {
                const circuit = circuits[circuitId - 1];
                let glowColor, glowRadius;
                
                // Set different glow based on number of cells
                switch(circuitId) {
                    case 1: // 1 cell - normal glow
                        glowColor = 'rgba(255, 235, 59, 0.4)';
                        glowRadius = bulbRadius * 1.5;
                        break;
                    case 2: // 2 cells - brighter glow
                        glowColor = 'rgba(255, 255, 0, 0.5)';
                        glowRadius = bulbRadius * 1.8;
                        break;
                    case 3: // 3 cells - very bright glow
                        glowColor = 'rgba(255, 255, 200, 0.6)';
                        glowRadius = bulbRadius * 2.2;
                        break;
                }
                
                const gradient = ctx.createRadialGradient(
                    bulbCenterX, bulbCenterY, 0,
                    bulbCenterX, bulbCenterY, glowRadius
                );
                gradient.addColorStop(0, glowColor);
                gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(bulbCenterX, bulbCenterY, glowRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw bulb glass with different color based on brightness
            let bulbGlassColor;
            if (!circuitClosed) {
                bulbGlassColor = '#f5f5f5';
            } else {
                switch(circuitId) {
                    case 1: bulbGlassColor = '#fff9c4'; break; // Light yellow for 1 cell
                    case 2: bulbGlassColor = '#ffeb3b'; break; // Yellow for 2 cells
                    case 3: bulbGlassColor = '#ffd600'; break; // Bright yellow for 3 cells
                }
            }
            
            ctx.fillStyle = bulbGlassColor;
            ctx.beginPath();
            ctx.arc(bulbCenterX, bulbCenterY, bulbRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bulb base
            ctx.fillStyle = '#bdbdbd';
            ctx.beginPath();
            ctx.moveTo(bulbCenterX - 15, bulbCenterY + bulbRadius);
            ctx.lineTo(bulbCenterX + 15, bulbCenterY + bulbRadius);
            ctx.lineTo(bulbCenterX + 10, bulbCenterY + bulbRadius + 20);
            ctx.lineTo(bulbCenterX - 10, bulbCenterY + bulbRadius + 20);
            ctx.closePath();
            ctx.fill();
            
            // Draw bulb filament with different color based on brightness
            let filamentColor, filamentWidth;
            if (!circuitClosed) {
                filamentColor = '#757575';
                filamentWidth = 2;
            } else {
                switch(circuitId) {
                    case 1: // 1 cell
                        filamentColor = '#ff9800';
                        filamentWidth = 3;
                        break;
                    case 2: // 2 cells
                        filamentColor = '#ff5722';
                        filamentWidth = 4;
                        break;
                    case 3: // 3 cells
                        filamentColor = '#ff3d00';
                        filamentWidth = 5;
                        break;
                }
            }
            
            ctx.strokeStyle = filamentColor;
            ctx.lineWidth = filamentWidth;
            ctx.beginPath();
            ctx.moveTo(bulbCenterX - 8, bulbCenterY - 5);
            ctx.lineTo(bulbCenterX, bulbCenterY);
            ctx.lineTo(bulbCenterX + 8, bulbCenterY - 5);
            ctx.stroke();
            
            // Draw wire from bulb back to first cell (completing the circuit)
            ctx.strokeStyle = circuitClosed ? '#e74c3c' : '#7f8c8d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(bulbCenterX + 25, wireY);
            ctx.lineTo(width - 50, wireY);
            ctx.stroke();
            
            // Draw vertical connection from bulb to bottom wire
            ctx.beginPath();
            ctx.moveTo(width - 50, wireY);
            ctx.lineTo(width - 50, wireY + 60);
            ctx.lineTo(startX, wireY + 60);
            ctx.lineTo(startX, wireY);
            ctx.stroke();
            
            // Draw current flow animation if circuit is closed
            if (circuitClosed && animationIds[circuitId - 1]) {
                drawCurrentFlow(ctx, circuitId);
            }
        }

        // Draw animated current flow INSIDE the wires
        function drawCurrentFlow(ctx, circuitId) {
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;
            const wireY = height / 2;
            const startX = 50;
            const bulbX = width - 80;
            
            // Animation time
            const time = Date.now() * 0.001;
            const circuit = circuits[circuitId - 1];
            const speed = circuit.brightness * 3; // Speed increases with brightness
            
            // Wire path coordinates (INSIDE the wires)
            const wirePath = [
                // Top horizontal wire (left to right) - INSIDE the wire
                {x: startX, y: wireY, length: bulbX - startX - 25, direction: 'right'},
                // Right vertical wire (top to bottom) - INSIDE the wire
                {x: bulbX, y: wireY - 60, length: 60, direction: 'down'},
                // Bottom horizontal wire (right to left) - INSIDE the wire
                {x: bulbX, y: wireY + 60, length: bulbX - startX, direction: 'left'},
                // Left vertical wire (bottom to top) - INSIDE the wire
                {x: startX, y: wireY + 60, length: 60, direction: 'up'}
            ];
            
            // Calculate total path length
            let totalLength = 0;
            wirePath.forEach(segment => {
                totalLength += segment.length;
            });
            
            // Draw electrons along the path INSIDE wires
            const numElectrons = Math.floor(8 * circuit.brightness);
            const electronSpacing = totalLength / numElectrons;
            
            for (let i = 0; i < numElectrons; i++) {
                const pos = (time * speed + i * electronSpacing) % totalLength;
                
                // Find which segment the electron is on
                let accumulatedLength = 0;
                let segmentIndex = 0;
                for (let j = 0; j < wirePath.length; j++) {
                    if (pos < accumulatedLength + wirePath[j].length) {
                        segmentIndex = j;
                        break;
                    }
                    accumulatedLength += wirePath[j].length;
                }
                
                const segment = wirePath[segmentIndex];
                const segmentPos = pos - accumulatedLength;
                
                let x, y;
                
                // Calculate position INSIDE the wire based on direction
                switch(segment.direction) {
                    case 'right':
                        x = segment.x + segmentPos;
                        y = segment.y;
                        break;
                    case 'down':
                        x = segment.x;
                        y = segment.y + segmentPos;
                        break;
                    case 'left':
                        x = segment.x - segmentPos;
                        y = segment.y;
                        break;
                    case 'up':
                        x = segment.x;
                        y = segment.y - segmentPos;
                        break;
                }
                
                // Draw electron with size based on brightness
                const electronSize = 3 + circuit.brightness;
                ctx.fillStyle = '#3498db';
                ctx.beginPath();
                ctx.arc(x, y, electronSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Toggle circuit function
        function toggleCircuit(circuitId) {
            const circuit = circuits[circuitId - 1];
            circuit.closed = !circuit.closed;
            
            // Update bulb visual
            const bulb = document.getElementById(`bulb${circuitId}`);
            const filament = document.getElementById(`filament${circuitId}`);
            const switchBtn = document.getElementById(`switch${circuitId}`);
            
            // Remove all existing classes
            bulb.className = 'bulb-visual';
            filament.className = 'bulb-filament';
            
            if (circuit.closed) {
                // Add appropriate classes based on circuit
                bulb.classList.add(circuit.bulbClass);
                filament.classList.add(circuit.filamentClass);
                switchBtn.textContent = 'Switch OFF';
                switchBtn.classList.add('off');
                
                // Start animation
                if (!animationIds[circuitId - 1]) {
                    function animate() {
                        drawCircuit(
                            circuitId === 1 ? ctx1 : circuitId === 2 ? ctx2 : ctx3,
                            circuit.cells,
                            circuit.closed,
                            circuitId
                        );
                        animationIds[circuitId - 1] = requestAnimationFrame(animate);
                    }
                    animationIds[circuitId - 1] = requestAnimationFrame(animate);
                }
            } else {
                bulb.classList.add('off');
                filament.classList.add('off');
                switchBtn.textContent = 'Toggle Switch';
                switchBtn.classList.remove('off');
                
                // Stop animation
                if (animationIds[circuitId - 1]) {
                    cancelAnimationFrame(animationIds[circuitId - 1]);
                    animationIds[circuitId - 1] = null;
                }
                
                // Draw static circuit
                drawCircuit(
                    circuitId === 1 ? ctx1 : circuitId === 2 ? ctx2 : ctx3,
                    circuit.cells,
                    circuit.closed,
                    circuitId
                );
            }
        }

        // Initialize circuits
        function initCircuits() {
            circuits.forEach(circuit => {
                drawCircuit(
                    circuit.id === 1 ? ctx1 : circuit.id === 2 ? ctx2 : ctx3,
                    circuit.cells,
                    circuit.closed,
                    circuit.id
                );
            });
            
            // Add event listeners for switches
            document.getElementById('switch1').addEventListener('click', () => toggleCircuit(1));
            document.getElementById('switch2').addEventListener('click', () => toggleCircuit(2));
            document.getElementById('switch3').addEventListener('click', () => toggleCircuit(3));
        }

        // Start the experiment
        window.onload = initCircuits;