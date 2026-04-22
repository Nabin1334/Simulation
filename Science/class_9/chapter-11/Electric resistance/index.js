
        // Configuration and state
        const config = {
            voltage: 9.0,
            resistance: 10
        };

        const state = {
            isOn: false,
            current: 0,
            electrons: [],
            animationId: null,
            time: 0,
            filamentTemp: 300,
            flickerValue: 1,
            bulbBrightness: 0
        };

        // DOM elements
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const currentDisplay = document.getElementById('currentDisplay');
        const resistanceDisplay = document.getElementById('resistanceDisplay');
        const formulaDisplay = document.getElementById('formulaDisplay');
        const statusBox = document.getElementById('statusBox');
        const statusLed = document.getElementById('statusLed');
        const statusText = document.getElementById('statusText');
        const statusDetails = document.getElementById('statusDetails');
        const resistanceSlider = document.getElementById('resistanceSlider');
        const sliderValue = document.getElementById('sliderValue');
        const resistanceInfo = document.getElementById('resistanceInfo');
        const toggleBtn = document.getElementById('toggleBtn');
        const resetBtn = document.getElementById('resetBtn');
        const bulbStatus = document.getElementById('bulbStatus');

        // Circuit layout
        const circuit = {
            battery: { x: 120, y: 200 },
            bulb: { x: 680, y: 200 },
            switch: { x: 400, y: 80 },
            resistor: { x: 280, y: 50, width: 240, height: 60 },
            path: {
                topLeft: { x: 120, y: 80 },
                topRight: { x: 680, y: 80 },
                bottomRight: { x: 680, y: 320 },
                bottomLeft: { x: 120, y: 320 }
            }
        };

        // Create electrons for animation
        function createElectrons() {
            const p = circuit.path;
            const w = p.topRight.x - p.topLeft.x;
            const h = p.bottomLeft.y - p.topLeft.y;
            const total = 2 * (w + h);
            const count = 45;
            
            state.electrons = [];
            for (let i = 0; i < count; i++) {
                state.electrons.push({
                    pos: (i / count) * total,
                    total: total,
                    speed: 0
                });
            }
        }

        // Get position along circuit path
        function getPos(d) {
            const p = circuit.path;
            const w = p.topRight.x - p.topLeft.x;
            const h = p.bottomLeft.y - p.topLeft.y;
            
            if (d < w) {
                return { x: p.bottomLeft.x + d, y: p.bottomLeft.y };
            } else if (d < w + h) {
                return { x: p.bottomRight.x, y: p.bottomRight.y - (d - w) };
            } else if (d < 2 * w + h) {
                return { x: p.topRight.x - (d - w - h), y: p.topRight.y };
            } else {
                return { x: p.topLeft.x, y: p.topLeft.y + (d - 2 * w - h) };
            }
        }

        // Draw battery
        function drawBattery() {
            const x = circuit.battery.x;
            const y = circuit.battery.y;
            
            // Battery body
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(x - 35, y - 70, 70, 140);
            
            // Positive terminal
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(x - 35, y - 70, 70, 22);
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(x - 12, y - 85, 24, 15);
            
            // Negative terminal
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x - 35, y + 48, 70, 22);
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(x - 12, y + 70, 24, 15);
            
            // Labels
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', x, y - 45);
            ctx.fillText('−', x, y + 40);
            ctx.font = 'bold 16px Arial';
            ctx.fillText('9V', x, y);
            
            ctx.fillStyle = '#7f8c8d';
            ctx.font = 'bold 11px Arial';
            ctx.fillText('BATTERY', x, y + 100);
        }

        // Draw REAL incandescent bulb with filament
        function drawBulb() {
            const x = circuit.bulb.x;
            const y = circuit.bulb.y;
            
            // Calculate filament temperature based on current and time
            if (state.isOn && state.current > 0) {
                // Filament temperature calculation (Ohm's Law + thermal physics)
                const power = state.current * state.current * config.resistance;
                state.filamentTemp = 300 + (power * 240); // Room temp + heating
                
                // Natural flicker effect for realism
                const flickerSpeed = 0.01;
                const flickerAmount = 0.1 + state.current * 0.05;
                state.flickerValue = 1 + (Math.sin(state.time * flickerSpeed) + 
                                       Math.sin(state.time * flickerSpeed * 1.7) + 
                                       Math.sin(state.time * flickerSpeed * 2.3)) * flickerAmount;
                state.flickerValue = Math.max(0.8, Math.min(1.2, state.flickerValue));
                
                // Calculate brightness (simplified black body radiation)
                state.bulbBrightness = Math.min((state.filamentTemp - 1600) / 1400, 1) * state.flickerValue;
            } else {
                state.filamentTemp = 300;
                state.flickerValue = 1;
                state.bulbBrightness = 0;
            }
            
            // Draw REALISTIC LIGHT GLOW (like real incandescent bulb)
            if (state.isOn && state.current > 0 && state.bulbBrightness > 0) {
                // Determine glow color based on temperature
                let glowColor;
                if (state.filamentTemp < 1600) {
                    glowColor = '#8B0000'; // Very dim red
                } else if (state.filamentTemp < 2000) {
                    glowColor = '#FF4500'; // Red-orange
                } else if (state.filamentTemp < 2500) {
                    glowColor = '#FF8C00'; // Orange
                } else if (state.filamentTemp < 3000) {
                    glowColor = '#FFD700'; // Yellow
                } else {
                    glowColor = '#FFFFE0'; // White-yellow
                }
                
                // Parse RGB from color
                const temp = document.createElement('div');
                temp.style.color = glowColor;
                document.body.appendChild(temp);
                const rgb = window.getComputedStyle(temp).color.match(/\d+/g);
                document.body.removeChild(temp);
                
                const r = parseInt(rgb[0]);
                const g = parseInt(rgb[1]);
                const b = parseInt(rgb[2]);
                
                // Draw realistic incandescent glow with multiple layers
                
                // Layer 1: Ambient room lighting (very wide, very soft)
                const ambientRadius = 100 + state.bulbBrightness * 80;
                const ambientGlow = ctx.createRadialGradient(x, y - 15, 0, x, y - 15, ambientRadius);
                ambientGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${state.bulbBrightness * 0.15})`);
                ambientGlow.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${state.bulbBrightness * 0.08})`);
                ambientGlow.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${state.bulbBrightness * 0.04})`);
                ambientGlow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                
                ctx.fillStyle = ambientGlow;
                ctx.beginPath();
                ctx.arc(x, y - 15, ambientRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Layer 2: Glass illumination (fills the bulb shape)
                const glassGlowRadius = 50 + state.bulbBrightness * 30;
                const glassGlow = ctx.createRadialGradient(x, y - 15, 0, x, y - 15, glassGlowRadius);
                glassGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${state.bulbBrightness * 0.7})`);
                glassGlow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${state.bulbBrightness * 0.4})`);
                glassGlow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                
                ctx.fillStyle = glassGlow;
                ctx.beginPath();
                ctx.arc(x, y - 15, glassGlowRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Layer 3: Filament glow (intense hot spot)
                const filamentGlowRadius = 25 + state.bulbBrightness * 15;
                const filamentGlow = ctx.createRadialGradient(x, y - 15, 0, x, y - 15, filamentGlowRadius);
                filamentGlow.addColorStop(0, `rgba(255, 255, 255, ${state.bulbBrightness * 1.5})`);
                filamentGlow.addColorStop(0.3, `rgba(255, 255, 220, ${state.bulbBrightness * 1.2})`);
                filamentGlow.addColorStop(0.7, `rgba(255, 255, 200, ${state.bulbBrightness * 0.8})`);
                filamentGlow.addColorStop(1, `rgba(255, 255, 180, 0)`);
                
                ctx.fillStyle = filamentGlow;
                ctx.beginPath();
                ctx.arc(x, y - 15, filamentGlowRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Layer 4: Hot filament core (bright white center)
                const hotSpotRadius = 8 + state.bulbBrightness * 6;
                const hotSpot = ctx.createRadialGradient(x, y - 15, 0, x, y - 15, hotSpotRadius);
                hotSpot.addColorStop(0, `rgba(255, 255, 255, ${state.bulbBrightness * 2})`);
                hotSpot.addColorStop(0.5, `rgba(255, 255, 240, ${state.bulbBrightness * 1.5})`);
                hotSpot.addColorStop(1, `rgba(255, 255, 220, 0)`);
                
                ctx.fillStyle = hotSpot;
                ctx.beginPath();
                ctx.arc(x, y - 15, hotSpotRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw heat waves (subtle distortion effect)
                if (state.bulbBrightness > 0.5) {
                    const waveCount = 3;
                    for (let i = 0; i < waveCount; i++) {
                        const waveRadius = 40 + i * 20;
                        const waveAlpha = 0.1 - (i * 0.03);
                        const waveTime = (state.time + i * 1000) * 0.001;
                        const waveOffset = Math.sin(waveTime) * 5;
                        
                        ctx.strokeStyle = `rgba(255, 200, 100, ${waveAlpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.arc(x + waveOffset, y - 15, waveRadius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            }
            
            // Draw REALISTIC GLASS BULB
            // Save context for clipping
            ctx.save();
            
            // Create clipping path for bulb shape
            ctx.beginPath();
            // Real pear-shaped incandescent bulb
            ctx.ellipse(x, y - 15, 32, 48, 0, 0, Math.PI * 2);
            ctx.clip();
            
            // Draw glass with realistic lighting
            const glassGradient = ctx.createLinearGradient(x - 32, y - 63, x + 32, y + 33);
            
            if (state.isOn && state.filamentTemp > 1600) {
                // Lit bulb: warm glow with highlights
                glassGradient.addColorStop(0, 'rgba(255, 255, 240, 0.15)'); // Top highlight
                glassGradient.addColorStop(0.3, 'rgba(255, 255, 235, 0.1)'); // Upper glass
                glassGradient.addColorStop(0.5, 'rgba(255, 250, 230, 0.08)'); // Middle
                glassGradient.addColorStop(0.7, 'rgba(255, 245, 220, 0.06)'); // Lower glass
                glassGradient.addColorStop(1, 'rgba(255, 240, 210, 0.04)'); // Bottom
            } else {
                // Unlit bulb: cold, clear glass
                glassGradient.addColorStop(0, 'rgba(240, 240, 240, 0.1)');
                glassGradient.addColorStop(0.5, 'rgba(230, 230, 230, 0.08)');
                glassGradient.addColorStop(1, 'rgba(220, 220, 220, 0.06)');
            }
            
            ctx.fillStyle = glassGradient;
            ctx.beginPath();
            ctx.ellipse(x, y - 15, 32, 48, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw glass reflections
            if (state.isOn) {
                // Main reflection (bright highlight)
                const reflection = ctx.createLinearGradient(x - 25, y - 60, x + 25, y - 60);
                reflection.addColorStop(0, 'rgba(255, 255, 255, 0)');
                reflection.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
                reflection.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
                reflection.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = reflection;
                ctx.beginPath();
                ctx.ellipse(x, y - 45, 20, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Secondary reflection
                const reflection2 = ctx.createLinearGradient(x - 15, y + 10, x + 15, y + 10);
                reflection2.addColorStop(0, 'rgba(255, 255, 255, 0)');
                reflection2.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
                reflection2.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = reflection2;
                ctx.beginPath();
                ctx.ellipse(x, y + 10, 15, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw glass imperfections and texture
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            for (let i = 0; i < 5; i++) {
                const imperfectionX = x + (Math.random() - 0.5) * 25;
                const imperfectionY = y - 15 + (Math.random() - 0.5) * 40;
                const radius = 1 + Math.random() * 3;
                
                ctx.beginPath();
                ctx.arc(imperfectionX, imperfectionY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Restore context
            ctx.restore();
            
            // Draw glass outline with realistic thickness
            ctx.strokeStyle = state.isOn ? 'rgba(255, 255, 240, 0.4)' : 'rgba(200, 200, 200, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(x, y - 15, 32, 48, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw REALISTIC METAL SCREW BASE (E26 standard)
            // Base cylinder
            const baseGradient = ctx.createLinearGradient(x - 20, y + 30, x - 20, y + 60);
            baseGradient.addColorStop(0, '#8c8c8c');
            baseGradient.addColorStop(0.3, '#7a7a7a');
            baseGradient.addColorStop(0.7, '#666666');
            baseGradient.addColorStop(1, '#595959');
            
            ctx.fillStyle = baseGradient;
            ctx.beginPath();
            // Rounded rectangle for base
            ctx.roundRect(x - 22, y + 30, 44, 32, 4);
            ctx.fill();
            
            // Screw threads (realistic spiral threads)
            ctx.strokeStyle = '#555555';
            ctx.lineWidth = 1.8;
            ctx.lineCap = 'round';
            
            // Draw 4 thread ridges
            for (let i = 0; i < 4; i++) {
                const threadY = y + 33 + i * 7;
                const threadWidth = 40 - i * 2;
                
                ctx.beginPath();
                ctx.moveTo(x - threadWidth/2, threadY);
                ctx.lineTo(x + threadWidth/2, threadY);
                ctx.stroke();
                
                // Add thread depth shadows
                ctx.strokeStyle = '#444444';
                ctx.beginPath();
                ctx.moveTo(x - threadWidth/2, threadY + 1);
                ctx.lineTo(x + threadWidth/2, threadY + 1);
                ctx.stroke();
                
                ctx.strokeStyle = '#666666';
            }
            
            // Base ridges (detail lines)
            ctx.strokeStyle = '#777777';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(x, y + 35, 20 - i*2, Math.PI * 0.25, Math.PI * 0.75);
                ctx.stroke();
            }
            
            // Bottom contact (brass/silver)
            const contactGradient = ctx.createRadialGradient(x, y + 62, 0, x, y + 62, 8);
            contactGradient.addColorStop(0, '#d4af37'); // Gold color
            contactGradient.addColorStop(1, '#b8860b');
            
            ctx.fillStyle = contactGradient;
            ctx.beginPath();
            ctx.ellipse(x, y + 62, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Base highlight
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 18, y + 32);
            ctx.lineTo(x - 18, y + 58);
            ctx.stroke();
            
            // Neck (glass to metal transition)
            const neckGradient = ctx.createLinearGradient(x - 25, y + 28, x + 25, y + 28);
            neckGradient.addColorStop(0, '#a6a6a6');
            neckGradient.addColorStop(0.5, '#b8b8b8');
            neckGradient.addColorStop(1, '#a6a6a6');
            
            ctx.fillStyle = neckGradient;
            ctx.beginPath();
            ctx.ellipse(x, y + 28, 25, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw REALISTIC TUNGSTEN FILAMENT
            if (state.isOn && state.filamentTemp > 300) {
                // Filament color based on temperature
                let filamentColor;
                if (state.filamentTemp < 1000) {
                    filamentColor = '#4a4a4a'; // Cold (not visible)
                } else if (state.filamentTemp < 1600) {
                    filamentColor = '#8b0000'; // Dark red
                } else if (state.filamentTemp < 2000) {
                    filamentColor = '#ff4500'; // Red-orange
                } else if (state.filamentTemp < 2500) {
                    filamentColor = '#ff8c00'; // Orange
                } else if (state.filamentTemp < 3000) {
                    filamentColor = '#ffd700'; // Yellow
                } else {
                    filamentColor = '#ffffe0'; // White-yellow
                }
                
                // Draw coiled tungsten filament (double-coil design)
                ctx.save();
                
                // Create clipping path for filament area
                ctx.beginPath();
                ctx.ellipse(x, y - 15, 20, 30, 0, 0, Math.PI * 2);
                ctx.clip();
                
                // Draw filament glow
                const filamentGlow = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, 25);
                filamentGlow.addColorStop(0, filamentColor);
                filamentGlow.addColorStop(0.7, `${filamentColor}80`);
                filamentGlow.addColorStop(1, `${filamentColor}00`);
                
                ctx.fillStyle = filamentGlow;
                ctx.beginPath();
                ctx.arc(x, y - 10, 25, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw coiled filament
                ctx.strokeStyle = filamentColor;
                ctx.lineWidth = state.filamentTemp > 2000 ? 2.5 : 1.5;
                ctx.lineCap = 'round';
                
                const coilRadius = 12;
                const coilHeight = 8;
                const segments = 32;
                
                ctx.beginPath();
                for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * Math.PI * 4; // 2 full coils
                    const baseX = x + Math.cos(angle) * coilRadius;
                    const baseY = (y - 10) + Math.sin(angle) * coilHeight;
                    
                    // Add micro-coiling effect
                    const microCoilRadius = 1;
                    const microAngle = angle * 3;
                    const finalX = baseX + Math.cos(microAngle) * microCoilRadius;
                    const finalY = baseY + Math.sin(microAngle) * microCoilRadius * 0.5;
                    
                    if (i === 0) {
                        ctx.moveTo(finalX, finalY);
                    } else {
                        ctx.lineTo(finalX, finalY);
                    }
                }
                ctx.stroke();
                
                // Draw support wires
                ctx.strokeStyle = '#a0a0a0';
                ctx.lineWidth = 1;
                ctx.beginPath();
                // Left support
                ctx.moveTo(x - 15, y + 5);
                ctx.lineTo(x - 12, y - 5);
                // Right support
                ctx.moveTo(x + 15, y + 5);
                ctx.lineTo(x + 12, y - 5);
                // Top support
                ctx.moveTo(x, y + 5);
                ctx.lineTo(x, y - 8);
                ctx.stroke();
                
                ctx.restore();
                
                // Draw hot spots on filament
                if (state.filamentTemp > 2000) {
                    ctx.fillStyle = '#ffffa0';
                    const hotSpotCount = Math.floor(state.filamentTemp / 800);
                    for (let i = 0; i < hotSpotCount; i++) {
                        const angle = Math.PI * 2 * (i / hotSpotCount);
                        const spotX = x + Math.cos(angle) * 10;
                        const spotY = (y - 10) + Math.sin(angle) * 5;
                        ctx.beginPath();
                        ctx.arc(spotX, spotY, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else {
                // Cold filament (thin gray wire)
                ctx.strokeStyle = '#666666';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 10, y - 10);
                ctx.lineTo(x + 10, y - 10);
                ctx.stroke();
            }
            
            // Label
            ctx.fillStyle = '#bbdefb';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('INCANDESCENT BULB', x, y + 80);
            
            // Status indicator
            if (state.isOn && state.filamentTemp > 300) {
                let statusText;
                let statusColor;
                
                if (state.filamentTemp < 1600) {
                    statusText = 'GLOWING DIM';
                    statusColor = '#8b0000';
                } else if (state.filamentTemp < 2000) {
                    statusText = 'WARM GLOW';
                    statusColor = '#ff4500';
                } else if (state.filamentTemp < 2500) {
                    statusText = 'BRIGHT';
                    statusColor = '#ff8c00';
                } else if (state.filamentTemp < 3000) {
                    statusText = 'VERY BRIGHT';
                    statusColor = '#ffd700';
                } else {
                    statusText = 'HOT WHITE';
                    statusColor = '#ffffe0';
                }
                
                ctx.fillStyle = statusColor;
                ctx.font = 'bold 11px Arial';
                ctx.fillText(statusText, x, y + 95);
            }
        }

        // Draw switch
        function drawSwitch() {
            const x = circuit.switch.x;
            const y = circuit.switch.y;
            
            // Switch body
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(x - 40, y - 20, 80, 40);
            
            // Contacts
            ctx.fillStyle = state.isOn ? '#27ae60' : '#e74c3c';
            ctx.beginPath();
            ctx.arc(x - 20, y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 20, y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Switch lever
            ctx.strokeStyle = '#95a5a6';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x - 20, y);
            if (state.isOn) {
                ctx.lineTo(x + 20, y);
            } else {
                ctx.lineTo(x - 20, y - 25);
            }
            ctx.stroke();
            
            // Knob
            ctx.fillStyle = state.isOn ? '#27ae60' : '#e74c3c';
            ctx.beginPath();
            if (state.isOn) {
                ctx.arc(x + 20, y, 6, 0, Math.PI * 2);
            } else {
                ctx.arc(x - 20, y - 25, 6, 0, Math.PI * 2);
            }
            ctx.fill();
            
            // Label
            ctx.fillStyle = '#7f8c8d';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SWITCH', x, y + 35);
        }

        // Draw resistor
        function drawResistor() {
            const r = circuit.resistor;
            
            // Calculate heat based on power
            let heat = 0;
            if (state.isOn) {
                const power = state.current * state.current * config.resistance;
                heat = Math.min(power / 10, 1);
            }
            
            // Heat glow
            if (heat > 0) {
                const g = ctx.createRadialGradient(r.x + r.width/2, r.y + r.height/2, 0, 
                                                   r.x + r.width/2, r.y + r.height/2, 100);
                g.addColorStop(0, `rgba(255,100,0,${heat * 0.5})`);
                g.addColorStop(1, 'rgba(255,100,0,0)');
                ctx.fillStyle = g;
                ctx.fillRect(r.x - 50, r.y - 50, r.width + 100, r.height + 100);
            }
            
            // Resistor body
            const gradient = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.height);
            gradient.addColorStop(0, heat > 0 ? '#ff6b35' : '#8b4513');
            gradient.addColorStop(1, heat > 0 ? '#ff4500' : '#654321');
            ctx.fillStyle = gradient;
            ctx.fillRect(r.x, r.y, r.width, r.height);
            
            // Zigzag pattern
            ctx.strokeStyle = heat > 0 ? '#ffd700' : '#d2691e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(r.x, r.y + r.height/2);
            
            const segments = 8;
            const segmentWidth = r.width / segments;
            for (let i = 0; i <= segments; i++) {
                const x = r.x + i * segmentWidth;
                const y = r.y + r.height/2 + (i % 2 === 0 ? -20 : 20);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Leads
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(r.x - 40, r.y + r.height/2);
            ctx.lineTo(r.x, r.y + r.height/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(r.x + r.width, r.y + r.height/2);
            ctx.lineTo(r.x + r.width + 40, r.y + r.height/2);
            ctx.stroke();
            
            // Label
            ctx.fillStyle = '#7f8c8d';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RESISTOR', r.x + r.width/2, r.y + r.height + 20);
        }

        // Draw wires with electric flow visualization
        function drawWires() {
            const p = circuit.path;
            
            // Draw wire glow when circuit is on
            if (state.isOn && state.current > 0) {
                const wireGlow = ctx.createLinearGradient(p.bottomLeft.x, p.bottomLeft.y, p.bottomRight.x, p.bottomRight.y);
                wireGlow.addColorStop(0, `rgba(64, 156, 255, ${0.1 + state.current * 0.05})`);
                wireGlow.addColorStop(0.5, `rgba(64, 156, 255, ${0.2 + state.current * 0.1})`);
                wireGlow.addColorStop(1, `rgba(64, 156, 255, ${0.1 + state.current * 0.05})`);
                
                ctx.strokeStyle = wireGlow;
                ctx.lineWidth = 12;
                ctx.beginPath();
                ctx.moveTo(p.bottomLeft.x, p.bottomLeft.y);
                ctx.lineTo(p.bottomRight.x, p.bottomRight.y);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(p.bottomRight.x, p.bottomRight.y);
                ctx.lineTo(p.topRight.x, p.topRight.y);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(p.topRight.x, p.topRight.y);
                ctx.lineTo(p.topLeft.x, p.topLeft.y);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(p.topLeft.x, p.topLeft.y);
                ctx.lineTo(p.bottomLeft.x, p.bottomLeft.y);
                ctx.stroke();
            }
            
            // Draw wire base
            ctx.strokeStyle = '#34495e';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(p.topLeft.x, p.topLeft.y);
            ctx.lineTo(p.topRight.x, p.topRight.y);
            ctx.lineTo(p.bottomRight.x, p.bottomRight.y);
            ctx.lineTo(p.bottomLeft.x, p.bottomLeft.y);
            ctx.closePath();
            ctx.stroke();
            
            // Switch connections
            ctx.beginPath();
            ctx.moveTo(p.topLeft.x, p.topLeft.y);
            ctx.lineTo(circuit.switch.x, circuit.switch.y - 20);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(circuit.switch.x, circuit.switch.y + 20);
            ctx.lineTo(circuit.resistor.x - 40, circuit.resistor.y + circuit.resistor.height/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(circuit.resistor.x + circuit.resistor.width + 40, 
                      circuit.resistor.y + circuit.resistor.height/2);
            ctx.lineTo(p.topRight.x, p.topRight.y);
            ctx.stroke();
            
            // Draw wire texture
            if (state.isOn && state.current > 0) {
                const speed = Math.max(0.5, Math.min(2, 9 / config.resistance));
                
                // Draw electric flow particles along wires
                ctx.fillStyle = '#3498db';
                for (let i = 0; i < 20; i++) {
                    const pos = (state.time * 0.01 + i * 0.3) % 1;
                    const segment = Math.floor(pos * 4);
                    const segmentPos = (pos * 4) % 1;
                    
                    let x, y;
                    switch(segment) {
                        case 0: // bottom wire
                            x = p.bottomLeft.x + segmentPos * (p.bottomRight.x - p.bottomLeft.x);
                            y = p.bottomLeft.y;
                            break;
                        case 1: // right wire
                            x = p.bottomRight.x;
                            y = p.bottomRight.y - segmentPos * (p.bottomRight.y - p.topRight.y);
                            break;
                        case 2: // top wire
                            x = p.topRight.x - segmentPos * (p.topRight.x - p.topLeft.x);
                            y = p.topRight.y;
                            break;
                        case 3: // left wire
                            x = p.topLeft.x;
                            y = p.topLeft.y + segmentPos * (p.bottomLeft.y - p.topLeft.y);
                            break;
                    }
                    
                    const size = 2 + Math.sin(state.time * 0.002 + i) * 1.5;
                    const alpha = 0.5 + Math.sin(state.time * 0.003 + i) * 0.3;
                    
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        // Draw electrons with realistic electric flow
        function drawElectrons() {
            if (!state.isOn || state.current <= 0) return;
            
            const speed = Math.max(0.5, Math.min(3, 12 / config.resistance));
            
            state.electrons.forEach(e => {
                // Adjust electron speed based on current
                const targetSpeed = speed;
                e.speed += (targetSpeed - e.speed) * 0.1;
                e.pos += e.speed;
                
                if (e.pos >= e.total) e.pos = 0;
                
                const pos = getPos(e.pos);
                
                // Draw electron trail/glow
                if (state.current > 0) {
                    const alpha = 0.3 + state.current * 0.1;
                    const trailLength = Math.min(15, 5 + state.current * 10);
                    
                    // Draw electron trail
                    for (let i = 0; i < trailLength; i++) {
                        const trailPos = e.pos - i * 0.5;
                        const trailAlpha = alpha * (1 - i / trailLength);
                        const trailSize = 3 * (1 - i / trailLength);
                        
                        if (trailPos >= 0) {
                            const trailPoint = getPos(trailPos);
                            ctx.fillStyle = `rgba(64, 156, 255, ${trailAlpha})`;
                            ctx.beginPath();
                            ctx.arc(trailPoint.x, trailPoint.y, trailSize, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    
                    // Electron glow
                    const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 12);
                    g.addColorStop(0, `rgba(64, 156, 255, ${0.8 + state.current * 0.3})`);
                    g.addColorStop(0.7, `rgba(64, 156, 255, ${0.3 + state.current * 0.2})`);
                    g.addColorStop(1, 'rgba(64, 156, 255, 0)');
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Electron core
                const coreSize = 3 + Math.sin(state.time * 0.01 + e.pos) * 0.5;
                ctx.fillStyle = '#3498db';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, coreSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(pos.x - 1, pos.y - 1, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw electric spark effect occasionally
                if (Math.random() < 0.01 && state.current > 0.5) {
                    const sparkSize = 1 + Math.random() * 3;
                    const sparkX = pos.x + (Math.random() - 0.5) * 8;
                    const sparkY = pos.y + (Math.random() - 0.5) * 8;
                    
                    ctx.fillStyle = '#ffca28';
                    ctx.beginPath();
                    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // Calculate current using Ohm's Law
        function calculateCurrent() {
            if (!state.isOn) return 0;
            return config.voltage / config.resistance;
        }

        // Update all displays
        function updateDisplay() {
            state.current = calculateCurrent();
            
            // Update displays
            currentDisplay.textContent = state.current.toFixed(2);
            resistanceDisplay.textContent = config.resistance;
            formulaDisplay.textContent = `Current = ${config.voltage}V ÷ ${config.resistance}Ω = ${state.current.toFixed(2)}A`;
            
            // Update circuit status
            if (state.isOn) {
                statusBox.classList.add('active');
                statusLed.classList.add('on');
                statusText.textContent = 'Circuit is ON';
                
                let statusDetail = '';
                if (state.current > 0.8) {
                    statusDetail = `High current flow (${state.current.toFixed(2)}A) - Bulb is very bright`;
                } else if (state.current > 0.3) {
                    statusDetail = `Moderate current flow (${state.current.toFixed(2)}A) - Bulb is glowing`;
                } else if (state.current > 0) {
                    statusDetail = `Low current flow (${state.current.toFixed(2)}A) - Bulb is dim`;
                } else {
                    statusDetail = 'No current flowing';
                }
                statusDetails.textContent = statusDetail;
            } else {
                statusBox.classList.remove('active');
                statusLed.classList.remove('on');
                statusText.textContent = 'Circuit is OFF';
                statusDetails.textContent = 'No current flowing. Click the switch to turn on.';
            }
            
            // Update bulb status
            updateBulbStatus();
            
            // Update slider
            sliderValue.textContent = `${config.resistance}Ω`;
            
            // Update resistance info
            let info = '';
            let color = '';
            if (config.resistance <= 3) {
                info = 'Very low resistance - DANGER: High current!';
                color = '#ef5350';
            } else if (config.resistance <= 10) {
                info = 'Low resistance - High current';
                color = '#66bb6a';
            } else if (config.resistance <= 30) {
                info = 'Medium resistance - Normal current';
                color = '#ffca28';
            } else if (config.resistance <= 70) {
                info = 'High resistance - Low current';
                color = '#ffa726';
            } else {
                info = 'Very high resistance - Very low current';
                color = '#90a4ae';
            }
            resistanceInfo.textContent = info;
            resistanceInfo.style.color = color;
        }

        // Update bulb status display
        function updateBulbStatus() {
            let statusHTML = '';
            
            if (state.isOn && state.filamentTemp > 300) {
                let bulbStatus, bulbColor;
                
                if (state.filamentTemp < 1000) {
                    bulbStatus = 'Cold - Not visible';
                    bulbColor = '#90a4ae';
                } else if (state.filamentTemp < 1600) {
                    bulbStatus = 'Very Dim Red Glow';
                    bulbColor = '#8b0000';
                } else if (state.filamentTemp < 2000) {
                    bulbStatus = 'Warm Red-Orange';
                    bulbColor = '#ff4500';
                } else if (state.filamentTemp < 2500) {
                    bulbStatus = 'Bright Orange';
                    bulbColor = '#ff8c00';
                } else if (state.filamentTemp < 3000) {
                    bulbStatus = 'Very Bright Yellow';
                    bulbColor = '#ffd700';
                } else {
                    bulbStatus = 'Hot White';
                    bulbColor = '#ffffe0';
                }
                
                statusHTML = `
                    <p style="color: ${bulbColor}; font-size: 1rem; font-weight: bold;">${bulbStatus}</p>
                    <p style="color: #bbdefb; font-size: 0.9rem; margin-top: 5px;">
                        Filament temperature: <strong>${Math.round(state.filamentTemp)}K</strong>
                    </p>
                    <p style="color: #bbdefb; font-size: 0.9rem; margin-top: 5px;">
                        Current: <strong>${state.current.toFixed(2)}A</strong> | 
                        Power: <strong>${(state.current * state.current * config.resistance).toFixed(2)}W</strong>
                    </p>
                `;
            } else {
                statusHTML = `
                    <p style="color: #90a4ae; font-size: 0.9rem;">Circuit is OFF - Bulb is not glowing</p>
                    <p style="color: #bbdefb; font-size: 0.8rem; margin-top: 5px;">Filament temperature: 300K</p>
                `;
            }
            
            bulbStatus.innerHTML = statusHTML;
        }

        // Draw entire circuit
        function drawCircuit() {
            // Clear canvas with dark background
            ctx.fillStyle = '#0a0e14';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update time for animations
            state.time += 16; // ~60fps
            
            // Draw components
            drawWires();
            drawBattery();
            drawResistor();
            drawBulb();
            drawSwitch();
            drawElectrons();
            
            // Draw switch hint
            ctx.fillStyle = '#ffca28';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Click here to toggle switch', circuit.switch.x, circuit.switch.y - 40);
        }

        // Animation loop
        function animate() {
            drawCircuit();
            updateDisplay();
            state.animationId = requestAnimationFrame(animate);
        }

        // Handle canvas click (for switch)
        function handleCanvasClick(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Check if switch was clicked
            const switchX = circuit.switch.x;
            const switchY = circuit.switch.y;
            const distance = Math.sqrt((x - switchX) ** 2 + (y - switchY) ** 2);
            
            if (distance < 40) {
                toggleCircuit();
            }
        }

        // Toggle circuit on/off
        function toggleCircuit() {
            state.isOn = !state.isOn;
            updateDisplay();
            
            if (state.isOn) {
                createElectrons();
            }
        }

        // Handle resistance slider change
        function handleResistanceChange() {
            config.resistance = parseInt(resistanceSlider.value);
            updateDisplay();
        }

        // Reset simulation
        function resetSimulation() {
            config.resistance = 10;
            state.isOn = false;
            state.filamentTemp = 300;
            state.bulbBrightness = 0;
            resistanceSlider.value = 10;
            createElectrons();
            updateDisplay();
        }

        // Initialize simulation
        function init() {
            // Set up event listeners
            canvas.addEventListener('click', handleCanvasClick);
            resistanceSlider.addEventListener('input', handleResistanceChange);
            toggleBtn.addEventListener('click', toggleCircuit);
            resetBtn.addEventListener('click', resetSimulation);
            
            // Create initial electrons
            createElectrons();
            
            // Start animation
            animate();
            
            // Initial update
            updateDisplay();
        }

        // Start when page loads
        window.addEventListener('DOMContentLoaded', init);
    