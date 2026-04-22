
        class PowerMonitoringSystem {
            constructor() {
                this.canvas = document.getElementById('circuit-canvas');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.width = 1200;
                this.canvas.height = 700;
                
                this.chartCanvas = document.getElementById('power-chart');
                this.chartCtx = this.chartCanvas.getContext('2d');
                this.chartCanvas.width = this.chartCanvas.clientWidth * 2;
                this.chartCanvas.height = 360;
                
                this.mainSwitchOn = false;
                this.voltage = 220;
                this.electricityRate = 0.12;
                
                this.loads = {
                    bulb1: { power: 60, on: false, consumption: 0, startTime: null, glow: 0, color: '#ffff99' },
                    bulb2: { power: 60, on: false, consumption: 0, startTime: null, glow: 0, color: '#ffff99' },
                    bulb3: { power: 40, on: false, consumption: 0, startTime: null, glow: 0, color: '#ffffcc' }
                };
                
                this.totalConsumption = 0;
                this.peakPower = 0;
                this.avgPower = 0;
                this.powerReadings = [];
                this.runtime = 0;
                this.startTime = null;
                
                this.powerHistory = [];
                this.maxHistory = 100;
                
                this.electrons = [];
                this.wireGlow = [];
                this.initElectrons();
                
                this.init();
                this.animate();
            }
            
            init() {
                document.getElementById('main-switch').addEventListener('click', () => this.toggleMainSwitch());
                document.getElementById('reset-meter').addEventListener('click', () => this.resetMeter());
                
                document.querySelectorAll('.load-toggle').forEach(toggle => {
                    toggle.addEventListener('click', () => this.toggleLoad(toggle.dataset.load));
                });
                
                document.getElementById('voltage-slider').addEventListener('input', (e) => {
                    this.voltage = parseInt(e.target.value);
                    document.getElementById('voltage-value').textContent = `${this.voltage} V`;
                    this.updateDisplays();
                });
                
                document.getElementById('rate-slider').addEventListener('input', (e) => {
                    this.electricityRate = parseInt(e.target.value) / 100;
                    document.getElementById('rate-value').textContent = `$${this.electricityRate.toFixed(2)} /kWh`;
                    this.updateDisplays();
                });
                
                setInterval(() => this.updateMetrics(), 100);
            }
            
            initElectrons() {
                const wireSegments = this.getWireSegments();
                wireSegments.forEach(segment => {
                    const segmentLength = Math.sqrt(
                        Math.pow(segment.x2 - segment.x1, 2) + 
                        Math.pow(segment.y2 - segment.y1, 2)
                    );
                    const numElectrons = Math.floor(segmentLength / 20);
                    
                    for (let i = 0; i < numElectrons; i++) {
                        this.electrons.push({
                            segmentIndex: segment.index,
                            progress: Math.random(),
                            speed: 0.002 + Math.random() * 0.001,
                            radius: 2 + Math.random() * 1,
                            glow: Math.random() * Math.PI * 2,
                            active: segment.active
                        });
                    }
                });
                
                for (let i = 0; i < 50; i++) {
                    this.wireGlow.push({
                        progress: Math.random(),
                        intensity: 0,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
            
            getWireSegments() {
                const segments = [];
                let index = 0;
                
                segments.push({ x1: 100, y1: 350, x2: 300, y2: 350, index: index++, active: true });
                segments.push({ x1: 300, y1: 350, x2: 450, y2: 350, index: index++, active: true });
                segments.push({ x1: 450, y1: 350, x2: 600, y2: 350, index: index++, active: true });
                segments.push({ x1: 600, y1: 350, x2: 600, y2: 250, index: index++, active: true });
                segments.push({ x1: 600, y1: 250, x2: 700, y2: 250, index: index++, active: true });
                
                segments.push({ x1: 700, y1: 250, x2: 1100, y2: 250, index: index++, active: true });
                
                segments.push({ x1: 750, y1: 250, x2: 750, y2: 170, index: index++, active: this.loads.bulb1.on });
                segments.push({ x1: 900, y1: 250, x2: 900, y2: 170, index: index++, active: this.loads.bulb2.on });
                segments.push({ x1: 1050, y1: 250, x2: 1050, y2: 170, index: index++, active: this.loads.bulb3.on });
                
                segments.push({ x1: 750, y1: 270, x2: 750, y2: 300, index: index++, active: this.loads.bulb1.on });
                segments.push({ x1: 900, y1: 270, x2: 900, y2: 300, index: index++, active: this.loads.bulb2.on });
                segments.push({ x1: 1050, y1: 270, x2: 1050, y2: 300, index: index++, active: this.loads.bulb3.on });
                
                segments.push({ x1: 750, y1: 300, x2: 750, y2: 450, index: index++, active: this.loads.bulb1.on });
                segments.push({ x1: 900, y1: 300, x2: 900, y2: 450, index: index++, active: this.loads.bulb2.on });
                segments.push({ x1: 1050, y1: 300, x2: 1050, y2: 450, index: index++, active: this.loads.bulb3.on });
                
                segments.push({ x1: 750, y1: 450, x2: 600, y2: 450, index: index++, active: true });
                segments.push({ x1: 900, y1: 450, x2: 750, y2: 450, index: index++, active: true });
                segments.push({ x1: 1050, y1: 450, x2: 900, y2: 450, index: index++, active: true });
                
                segments.push({ x1: 600, y1: 450, x2: 600, y2: 600, index: index++, active: true });
                segments.push({ x1: 600, y1: 600, x2: 100, y2: 600, index: index++, active: true });
                segments.push({ x1: 100, y1: 600, x2: 100, y2: 420, index: index++, active: true });
                
                return segments;
            }
            
            toggleMainSwitch() {
                this.mainSwitchOn = !this.mainSwitchOn;
                
                if (this.mainSwitchOn) {
                    this.startTime = Date.now();
                    document.getElementById('status-led').classList.add('active');
                    document.getElementById('status-text').textContent = 'SYSTEM ACTIVE';
                } else {
                    Object.keys(this.loads).forEach(id => {
                        if (this.loads[id].on) this.toggleLoad(id);
                    });
                    this.startTime = null;
                    document.getElementById('status-led').classList.remove('active');
                    document.getElementById('status-text').textContent = 'SYSTEM STANDBY';
                }
            }
            
            toggleLoad(loadId) {
                if (!this.mainSwitchOn && !this.loads[loadId].on) return;
                
                const load = this.loads[loadId];
                load.on = !load.on;
                
                const toggle = document.querySelector(`.load-toggle[data-load="${loadId}"]`);
                const item = document.querySelector(`.load-item[data-load="${loadId}"]`);
                
                if (load.on) {
                    toggle.classList.add('on');
                    item.classList.add('active');
                    load.startTime = Date.now();
                    if (load.glow !== undefined) {
                        load.glow = Math.random() * Math.PI * 2;
                    }
                } else {
                    toggle.classList.remove('on');
                    item.classList.remove('active');
                    if (load.startTime) {
                        const duration = (Date.now() - load.startTime) / 3600000;
                        load.consumption += (load.power / 1000) * duration;
                        load.startTime = null;
                        if (load.glow !== undefined) load.glow = 0;
                    }
                }
                
                this.updateWireSegments();
            }
            
            updateWireSegments() {
                this.electrons.forEach(electron => {
                    const wireSegments = this.getWireSegments();
                    const segment = wireSegments.find(s => s.index === electron.segmentIndex);
                    if (segment) {
                        electron.active = segment.active && this.mainSwitchOn;
                    }
                });
            }
            
            getTotalPower() {
                return Object.values(this.loads).reduce((sum, load) => 
                    sum + (load.on ? load.power : 0), 0
                );
            }
            
            updateMetrics() {
                const now = Date.now();
                
                Object.keys(this.loads).forEach(id => {
                    const load = this.loads[id];
                    if (load.on && load.glow !== undefined) {
                        load.glow += 0.05;
                    }
                });
                
                this.electrons.forEach(electron => {
                    if (electron.active) {
                        electron.progress += electron.speed * (this.getTotalPower() / 100);
                        if (electron.progress > 1) electron.progress = 0;
                        electron.glow += 0.1;
                        if (electron.glow > Math.PI * 2) electron.glow = 0;
                    }
                });
                
                this.wireGlow.forEach(g => {
                    g.progress += 0.005;
                    if (g.progress > 1) g.progress = 0;
                    g.intensity = Math.sin(g.phase + now * 0.01) * 0.5 + 0.5;
                    g.phase += 0.02;
                });
                
                Object.keys(this.loads).forEach(id => {
                    const load = this.loads[id];
                    if (load.on && load.startTime) {
                        const duration = (now - load.startTime) / 3600000;
                        const current = (load.power / 1000) * duration;
                        document.getElementById(`${id}-consumption`).textContent = 
                            (load.consumption + current).toFixed(6) + ' kWh';
                    }
                });
                
                if (this.mainSwitchOn && this.startTime) {
                    const totalDuration = (now - this.startTime) / 1000;
                    this.runtime = totalDuration;
                    
                    const h = Math.floor(totalDuration / 3600);
                    const m = Math.floor((totalDuration % 3600) / 60);
                    const s = Math.floor(totalDuration % 60);
                    document.getElementById('runtime-display').textContent = 
                        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                }
                
                const power = this.getTotalPower();
                this.powerReadings.push(power);
                if (this.powerReadings.length > 100) this.powerReadings.shift();
                
                if (power > this.peakPower) this.peakPower = power;
                this.avgPower = this.powerReadings.reduce((a, b) => a + b, 0) / this.powerReadings.length;
                
                const totalCurrent = Object.values(this.loads).reduce((sum, load) => {
                    let consumption = load.consumption;
                    if (load.on && load.startTime) {
                        const duration = (now - load.startTime) / 3600000;
                        consumption += (load.power / 1000) * duration;
                    }
                    return sum + consumption;
                }, 0);
                
                this.totalConsumption = totalCurrent;
                this.powerHistory.push(power);
                if (this.powerHistory.length > this.maxHistory) this.powerHistory.shift();
                
                this.updateDisplays();
                this.drawChart();
            }
            
            updateDisplays() {
                document.getElementById('kwh-display').textContent = this.totalConsumption.toFixed(6);
                document.getElementById('voltage-display').textContent = this.voltage + ' V';
                document.getElementById('current-display').textContent = 
                    (this.getTotalPower() / this.voltage).toFixed(2) + ' A';
                document.getElementById('power-display').textContent = this.getTotalPower().toFixed(1) + ' W';
                document.getElementById('peak-display').textContent = this.peakPower.toFixed(1) + ' W';
                document.getElementById('avg-display').textContent = this.avgPower.toFixed(1) + ' W';
                
                const cost = this.totalConsumption * this.electricityRate;
                document.getElementById('cost-display').textContent = '$' + cost.toFixed(4);
                document.getElementById('rate-display').textContent = `$${this.electricityRate.toFixed(2)}/kWh`;
            }
            
            drawChart() {
                const ctx = this.chartCtx;
                const w = this.chartCanvas.width;
                const h = this.chartCanvas.height;
                
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 2;
                for (let i = 0; i <= 4; i++) {
                    const y = (h / 4) * i;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                }
                
                if (this.powerHistory.length > 1) {
                    const max = Math.max(...this.powerHistory, 100);
                    
                    ctx.strokeStyle = '#00ff88';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    
                    this.powerHistory.forEach((power, i) => {
                        const x = (i / this.maxHistory) * w;
                        const y = h - (power / max) * h * 0.9;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    
                    ctx.stroke();
                    
                    const gradient = ctx.createLinearGradient(0, 0, 0, h);
                    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.lineTo(w, h);
                    ctx.lineTo(0, h);
                    ctx.closePath();
                    ctx.fill();
                }
            }
            
            resetMeter() {
                Object.keys(this.loads).forEach(id => {
                    this.loads[id].consumption = 0;
                    this.loads[id].startTime = null;
                    if (this.loads[id].glow !== undefined) this.loads[id].glow = 0;
                    document.getElementById(`${id}-consumption`).textContent = '0.000 kWh';
                });
                
                this.totalConsumption = 0;
                this.peakPower = 0;
                this.avgPower = 0;
                this.powerReadings = [];
                this.runtime = 0;
                this.startTime = this.mainSwitchOn ? Date.now() : null;
                this.powerHistory = [];
                
                this.updateDisplays();
            }
            
            drawCircuit() {
                this.ctx.fillStyle = '#0a1929';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.drawGrid();
                this.drawAllWires(); // Draw wires FIRST (background)
                this.drawComponentsOnTop(); // Draw components on TOP of wires
                
                if (this.mainSwitchOn && this.getTotalPower() > 0) {
                    this.drawWireGlow();
                    this.drawElectrons();
                }
            }
            
            drawGrid() {
                this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.1)';
                this.ctx.lineWidth = 1;
                
                for (let x = 0; x < this.canvas.width; x += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }
                
                for (let y = 0; y < this.canvas.height; y += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }
            }
            
            drawAllWires() {
                const active = this.mainSwitchOn;
                const wireColor = active ? '#00ff88' : '#666';
                
                this.ctx.strokeStyle = wireColor;
                this.ctx.lineWidth = 6;
                this.ctx.lineCap = 'round';
                
                // Main wiring
                this.ctx.beginPath();
                this.ctx.moveTo(100, 350);
                this.ctx.lineTo(300, 350);
                this.ctx.moveTo(450, 350);
                this.ctx.lineTo(600, 350);
                this.ctx.lineTo(600, 250);
                this.ctx.lineTo(700, 250);
                this.ctx.stroke();
                
                // Distribution wire
                this.ctx.beginPath();
                this.ctx.moveTo(700, 250);
                this.ctx.lineTo(1100, 250);
                this.ctx.stroke();
                
                // Bulb vertical wires (these go BEHIND bulbs)
                const bulbs = [
                    { id: 'bulb1', x: 750, y: 200 },
                    { id: 'bulb2', x: 900, y: 200 },
                    { id: 'bulb3', x: 1050, y: 200 }
                ];
                
                bulbs.forEach(bulb => {
                    const isOn = this.loads[bulb.id].on && active;
                    this.ctx.strokeStyle = isOn ? '#00ff88' : '#666';
                    
                    // Wire going up to bulb (background)
                    this.ctx.beginPath();
                    this.ctx.moveTo(bulb.x, 250);
                    this.ctx.lineTo(bulb.x, 170); // Stop at bulb base
                    this.ctx.stroke();
                    
                    // Wire going down from bulb (background)
                    this.ctx.beginPath();
                    this.ctx.moveTo(bulb.x, 270); // Start below bulb
                    this.ctx.lineTo(bulb.x, 300);
                    this.ctx.lineTo(bulb.x, 450);
                    this.ctx.stroke();
                });
                
                // Common return wires
                this.ctx.strokeStyle = wireColor;
                this.ctx.beginPath();
                this.ctx.moveTo(750, 450);
                this.ctx.lineTo(600, 450);
                this.ctx.moveTo(900, 450);
                this.ctx.lineTo(750, 450);
                this.ctx.moveTo(1050, 450);
                this.ctx.lineTo(900, 450);
                this.ctx.stroke();
                
                // Return to power source
                this.ctx.beginPath();
                this.ctx.moveTo(600, 450);
                this.ctx.lineTo(600, 600);
                this.ctx.lineTo(100, 600);
                this.ctx.lineTo(100, 420);
                this.ctx.stroke();
            }
            
            drawComponentsOnTop() {
                this.drawPowerSource(100, 280);
                this.drawCircuitBreaker(320, 320);
                this.drawMeter(600, 280);
                
                // Draw bulbs on TOP of wires
                const bulbs = [
                    { id: 'bulb1', x: 750, y: 200 },
                    { id: 'bulb2', x: 900, y: 200 },
                    { id: 'bulb3', x: 1050, y: 200 }
                ];
                
                bulbs.forEach(bulb => {
                    const isOn = this.loads[bulb.id].on && this.mainSwitchOn;
                    this.drawRealBulb(bulb.x, bulb.y, bulb.id, isOn);
                });
            }
            
            drawWireGlow() {
                const totalPower = this.getTotalPower();
                const intensity = Math.min(totalPower / 100, 0.7);
                
                this.ctx.lineWidth = 8;
                this.ctx.lineCap = 'round';
                
                const wireSegments = this.getWireSegments();
                
                wireSegments.forEach(segment => {
                    if (segment.active) {
                        this.drawGlowingWire(segment.x1, segment.y1, segment.x2, segment.y2, intensity);
                    }
                });
            }
            
            drawGlowingWire(x1, y1, x2, y2, intensity) {
                const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
                gradient.addColorStop(0, `rgba(0, 255, 136, ${intensity * 0.4})`);
                gradient.addColorStop(0.5, `rgba(0, 255, 200, ${intensity * 0.6})`);
                gradient.addColorStop(1, `rgba(0, 255, 136, ${intensity * 0.4})`);
                
                this.ctx.strokeStyle = gradient;
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                
                this.ctx.shadowBlur = 20 * intensity;
                this.ctx.shadowColor = '#00ff88';
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
                
                this.ctx.strokeStyle = `rgba(0, 255, 200, ${intensity * 0.8})`;
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
            
            drawRealBulb(x, y, id, isOn) {
                const load = this.loads[id];
                
                // Bulb socket - goes ON TOP of wires
                this.ctx.fillStyle = '#444';
                this.ctx.fillRect(x - 15, y + 70, 30, 15);
                
                // Socket contacts
                this.ctx.fillStyle = '#888';
                this.ctx.fillRect(x - 12, y + 75, 24, 5);
                
                // Bulb base (metal part)
                this.ctx.fillStyle = isOn ? '#bbb' : '#888';
                this.ctx.beginPath();
                this.ctx.ellipse(x, y + 65, 20, 8, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Bulb screw threads
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(
                        x + Math.cos(angle) * 18,
                        y + 65 + Math.sin(angle) * 8
                    );
                    this.ctx.lineTo(
                        x + Math.cos(angle) * 15,
                        y + 65 + Math.sin(angle) * 8
                    );
                    this.ctx.stroke();
                }
                
                if (isOn) {
                    // Create realistic glow effect with multiple layers
                    const glowIntensity = (Math.sin(load.glow) + 1) * 0.3 + 0.4;
                    const glowRadius = 40 + Math.sin(load.glow * 2) * 8;
                    
                    // Draw multiple glow layers for realistic light
                    for (let i = 3; i > 0; i--) {
                        const layerRadius = glowRadius * (i / 3);
                        const layerAlpha = glowIntensity * (0.4 / i);
                        
                        const outerGradient = this.ctx.createRadialGradient(
                            x, y + 40, 0,
                            x, y + 40, layerRadius
                        );
                        
                        if (id === 'bulb3') {
                            outerGradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
                            outerGradient.addColorStop(0.5, `rgba(220, 240, 255, ${layerAlpha * 0.5})`);
                            outerGradient.addColorStop(1, 'rgba(200, 230, 255, 0)');
                        } else {
                            outerGradient.addColorStop(0, `rgba(255, 255, 220, ${layerAlpha})`);
                            outerGradient.addColorStop(0.5, `rgba(255, 240, 180, ${layerAlpha * 0.5})`);
                            outerGradient.addColorStop(1, 'rgba(255, 230, 150, 0)');
                        }
                        
                        this.ctx.fillStyle = outerGradient;
                        this.ctx.beginPath();
                        this.ctx.arc(x, y + 40, layerRadius, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    
                    // Bulb glass with warm glow
                    const bulbGradient = this.ctx.createRadialGradient(
                        x - 10, y + 30, 0,
                        x, y + 40, 25
                    );
                    
                    if (id === 'bulb3') {
                        bulbGradient.addColorStop(0, '#ffffff');
                        bulbGradient.addColorStop(0.3, '#e6f0ff');
                        bulbGradient.addColorStop(1, '#ccdfff');
                    } else {
                        bulbGradient.addColorStop(0, load.color);
                        bulbGradient.addColorStop(0.7, '#ffff66');
                        bulbGradient.addColorStop(1, '#ffcc33');
                    }
                    
                    this.ctx.fillStyle = bulbGradient;
                    this.ctx.beginPath();
                    this.ctx.ellipse(x, y + 40, 25, 35, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Glass reflection highlights
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.beginPath();
                    this.ctx.ellipse(x - 8, y + 25, 8, 12, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Filament with realistic glow
                    const filamentGlow = Math.sin(load.glow * 4) * 0.2 + 0.8;
                    
                    // Main filament glow
                    this.ctx.strokeStyle = `rgba(255, ${id === 'bulb3' ? '240' : '200'}, ${id === 'bulb3' ? '200' : '100'}, ${filamentGlow})`;
                    this.ctx.lineWidth = 3;
                    this.ctx.lineCap = 'round';
                    
                    // Coiled filament design for realism
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - 8, y + 35);
                    for (let i = 0; i < 5; i++) {
                        const radius = 3;
                        const angle = i * Math.PI * 0.5;
                        this.ctx.lineTo(
                            x - 8 + radius * Math.cos(angle),
                            y + 35 + radius * Math.sin(angle)
                        );
                    }
                    this.ctx.stroke();
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - 4, y + 40);
                    for (let i = 0; i < 5; i++) {
                        const radius = 3;
                        const angle = i * Math.PI * 0.5;
                        this.ctx.lineTo(
                            x - 4 + radius * Math.cos(angle),
                            y + 40 + radius * Math.sin(angle)
                        );
                    }
                    this.ctx.stroke();
                    
                    // Hot filament core (brighter center)
                    this.ctx.strokeStyle = `rgb(255, ${id === 'bulb3' ? '180' : '120'}, 0)`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - 8, y + 35);
                    for (let i = 0; i < 5; i++) {
                        const radius = 2;
                        const angle = i * Math.PI * 0.5;
                        this.ctx.lineTo(
                            x - 8 + radius * Math.cos(angle),
                            y + 35 + radius * Math.sin(angle)
                        );
                    }
                    this.ctx.stroke();
                    
                    // Random sparkles for added realism
                    if (Math.random() > 0.7) {
                        const sparkX = x - 10 + Math.random() * 20;
                        const sparkY = y + 30 + Math.random() * 30;
                        const sparkSize = Math.random() * 2 + 1;
                        
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.beginPath();
                        this.ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    
                    // Light beams radiating from bulb
                    this.ctx.strokeStyle = `rgba(255, 255, 200, 0.15)`;
                    this.ctx.lineWidth = 1;
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2;
                        const length = 15 + Math.random() * 10;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y + 40);
                        this.ctx.lineTo(
                            x + Math.cos(angle) * length,
                            y + 40 + Math.sin(angle) * length
                        );
                        this.ctx.stroke();
                    }
                } else {
                    // Bulb when off - clear glass appearance
                    const offGradient = this.ctx.createRadialGradient(
                        x - 10, y + 30, 0,
                        x, y + 40, 25
                    );
                    offGradient.addColorStop(0, '#f0f0f0');
                    offGradient.addColorStop(0.5, '#d8d8d8');
                    offGradient.addColorStop(1, '#b0b0b0');
                    
                    this.ctx.fillStyle = offGradient;
                    this.ctx.beginPath();
                    this.ctx.ellipse(x, y + 40, 25, 35, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Cold filament (not glowing)
                    this.ctx.strokeStyle = '#666';
                    this.ctx.lineWidth = 2;
                    this.ctx.lineCap = 'round';
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - 8, y + 35);
                    this.ctx.lineTo(x + 8, y + 35);
                    this.ctx.moveTo(x - 4, y + 40);
                    this.ctx.lineTo(x + 4, y + 40);
                    this.ctx.stroke();
                }
                
                // Support wires inside bulb
                this.ctx.strokeStyle = '#888';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + 65);
                this.ctx.lineTo(x, y + 50);
                this.ctx.stroke();
                
                // Bulb label with power rating
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 11px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${load.power}W`, x, y + 85);
            }
            
            drawElectrons() {
                const totalPower = this.getTotalPower();
                if (totalPower === 0) return;
                
                const intensity = Math.min(totalPower / 100, 0.8);
                const wireSegments = this.getWireSegments();
                
                this.electrons.forEach(electron => {
                    if (!electron.active) return;
                    
                    const segment = wireSegments.find(s => s.index === electron.segmentIndex);
                    if (!segment) return;
                    
                    const x = segment.x1 + (segment.x2 - segment.x1) * electron.progress;
                    const y = segment.y1 + (segment.y2 - segment.y1) * electron.progress;
                    
                    const glow = (Math.sin(electron.glow) + 1) * 0.5;
                    
                    const gradient = this.ctx.createRadialGradient(
                        x, y, 0,
                        x, y, electron.radius * 2.5
                    );
                    gradient.addColorStop(0, `rgba(0, 255, 200, ${intensity * (0.6 + glow * 0.4)})`);
                    gradient.addColorStop(0.7, `rgba(0, 255, 136, ${intensity * 0.3})`);
                    gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, electron.radius * 2.5, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = `rgba(0, 255, 200, ${intensity * 0.9})`;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, electron.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    for (let i = 1; i <= 2; i++) {
                        const trailProgress = electron.progress - i * 0.015;
                        if (trailProgress < 0) continue;
                        
                        const trailX = segment.x1 + (segment.x2 - segment.x1) * trailProgress;
                        const trailY = segment.y1 + (segment.y2 - segment.y1) * trailProgress;
                        const trailAlpha = intensity * (1 - i * 0.5) * 0.2;
                        
                        this.ctx.fillStyle = `rgba(0, 255, 200, ${trailAlpha})`;
                        this.ctx.beginPath();
                        this.ctx.arc(trailX, trailY, electron.radius * (1 - i * 0.3), 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                });
            }
            
            drawPowerSource(x, y) {
                const grad = this.ctx.createLinearGradient(x, y, x, y + 140);
                grad.addColorStop(0, '#e74c3c');
                grad.addColorStop(1, '#c0392b');
                this.ctx.fillStyle = grad;
                this.ctx.fillRect(x, y, 80, 140);
                
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.fillRect(x + 10, y + 10, 60, 30);
                
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(x + 25, y - 10, 30, 10);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 32px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('~', x + 40, y + 70);
                this.ctx.fillText('~', x + 40, y + 120);
                
                this.ctx.font = 'bold 18px Arial';
                this.ctx.fillText(`${this.voltage}V`, x + 40, y + 95);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '14px Arial';
                this.ctx.fillText('AC SUPPLY', x + 40, y + 160);
            }
            
            drawCircuitBreaker(x, y) {
                this.ctx.fillStyle = '#34495e';
                this.ctx.fillRect(x, y, 120, 60);
                
                this.ctx.strokeStyle = '#2c3e50';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(x + 5, y + 5, 110, 50);
                
                this.ctx.fillStyle = '#f39c12';
                this.ctx.beginPath();
                this.ctx.arc(x + 30, y + 30, 10, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(x + 90, y + 30, 10, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.strokeStyle = this.mainSwitchOn ? '#00ff88' : '#e74c3c';
                this.ctx.lineWidth = 6;
                this.ctx.beginPath();
                
                if (this.mainSwitchOn) {
                    this.ctx.moveTo(x + 30, y + 30);
                    this.ctx.lineTo(x + 90, y + 30);
                } else {
                    this.ctx.moveTo(x + 30, y + 30);
                    this.ctx.lineTo(x + 60, y + 5);
                }
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('MAIN BREAKER', x + 60, y + 75);
            }
            
            drawMeter(x, y) {
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.fillRect(x, y, 120, 140);
                
                this.ctx.strokeStyle = '#34495e';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(x + 5, y + 5, 110, 130);
                
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(x + 15, y + 15, 90, 50);
                
                this.ctx.fillStyle = '#00ff88';
                this.ctx.font = 'bold 14px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('SMART METER', x + 60, y + 35);
                
                if (this.mainSwitchOn) {
                    this.ctx.fillStyle = '#00ff88';
                    this.ctx.font = 'bold 18px monospace';
                    this.ctx.fillText(`${this.getTotalPower()} W`, x + 60, y + 60);
                }
                
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x + 60, y + 100, 25, Math.PI, 0, false);
                this.ctx.stroke();
                
                for (let i = 0; i <= 5; i++) {
                    const angle = Math.PI + (i / 5) * Math.PI;
                    this.ctx.beginPath();
                    this.ctx.moveTo(
                        x + 60 + Math.cos(angle) * 20,
                        y + 100 + Math.sin(angle) * 20
                    );
                    this.ctx.lineTo(
                        x + 60 + Math.cos(angle) * 25,
                        y + 100 + Math.sin(angle) * 25
                    );
                    this.ctx.stroke();
                }
                
                const power = this.getTotalPower();
                const maxPower = 200;
                const angle = Math.PI + Math.min(power / maxPower, 1) * Math.PI;
                
                this.ctx.strokeStyle = this.mainSwitchOn ? '#ff4444' : '#666';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x + 60, y + 100);
                this.ctx.lineTo(
                    x + 60 + Math.cos(angle) * 20,
                    y + 100 + Math.sin(angle) * 20
                );
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                this.ctx.arc(x + 60, y + 100, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = this.getTotalPower() > 0 ? '#00ff00' : '#666';
                this.ctx.beginPath();
                this.ctx.arc(x + 90, y + 105, 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                if (this.getTotalPower() > 0) {
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowColor = '#00ff00';
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
            
            animate() {
                this.drawCircuit();
                requestAnimationFrame(() => this.animate());
            }
        }
        
        window.addEventListener('DOMContentLoaded', () => {
            new PowerMonitoringSystem();
        });