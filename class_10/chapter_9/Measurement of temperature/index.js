
    // --- Realistic p5 sketch ---
    let currentType = 'liquid';  
    let targetTemp = 28.5;       // The actual temperature of the environment/object
    let displayedTemp = 28.5;    // The temperature the thermometer is currently reading
    let bubbles = [];            // For boiling effect

    // Update target temp from slider
    document.getElementById('tempSlider').addEventListener('input', (e) => {
        targetTemp = parseFloat(e.target.value);
        document.getElementById('targetTempValue').innerText = targetTemp.toFixed(1) + ' °C';
    });

    const sketch = function(p) {
        p.setup = function() {
            let canvas = p.createCanvas(520, 280);
            canvas.parent('p5canvas');
            p.textFont('system-ui');
            p.strokeCap(p.ROUND);
            p.frameRate(60); // Faster framerate for smooth animations
            
            // Initialize bubbles
            for(let i=0; i<15; i++) {
                bubbles.push({ x: p.random(180, 260), y: p.random(200, 270), speed: p.random(1, 3), size: p.random(2, 6) });
            }
        };

        p.draw = function() {
            p.clear();
            p.setGradient(0, 0, p.width, p.height, p.color(240, 248, 255), p.color(215, 228, 245));

            // SIMULATE REAL-LIFE RESPONSE TIMES (Thermal Inertia)
            if (currentType === 'liquid') {
                displayedTemp += (targetTemp - displayedTemp) * 0.015; // Slow
                drawEnvironment(p, targetTemp, 'liquid');
                drawLiquid(p, displayedTemp);
            } 
            else if (currentType === 'digital') {
                displayedTemp += (targetTemp - displayedTemp) * 0.08; // Medium
                drawEnvironment(p, targetTemp, 'liquid');
                drawDigital(p, displayedTemp);
            } 
            else if (currentType === 'radiation') {
                displayedTemp += (targetTemp - displayedTemp) * 0.4; // Instant
                drawEnvironment(p, targetTemp, 'solid');
                drawRadiation(p, displayedTemp);
            }

            // tiny label with current READ temperature
            p.fill(20, 40, 80);
            p.noStroke();
            p.textSize(14);
            p.textAlign(p.RIGHT);
            p.text('Thermometer Reading: ' + displayedTemp.toFixed(1) + ' °C', 500, 30);
            p.textAlign(p.LEFT);
        };

        p.setGradient = function(x, y, w, h, c1, c2) {
            p.noFill();
            for (let i = y; i <= y + h; i++) {
                let inter = p.map(i, y, y + h, 0, 1);
                let c = p.lerpColor(c1, c2, inter);
                p.stroke(c);
                p.line(x, i, x + w, i);
            }
        };

        // --- DRAW REALISTIC ENVIRONMENTS ---
        function drawEnvironment(p, temp, type) {
            p.push();
            if (type === 'liquid') {
                // Draw a beaker of water
                let waterColor;
                if (temp <= 0) waterColor = p.color(180, 230, 255, 200); // Ice blue
                else if (temp >= 100) waterColor = p.color(255, 200, 200, 200); // Hot water
                else waterColor = p.color(100, 180, 255, 150); // Normal water
                
                p.fill(waterColor);
                p.noStroke();
                p.rect(170, 180, 100, 100, 10); // Water volume

                // Draw beaker glass
                p.stroke(200, 220, 240);
                p.strokeWeight(3);
                p.noFill();
                p.rect(170, 140, 100, 140, 10); 
                p.stroke(255); // Glass highlight
                p.line(175, 150, 175, 270);

                // Boiling bubbles if >= 100
                if (temp >= 100) {
                    p.fill(255, 255, 255, 150);
                    p.noStroke();
                    for(let b of bubbles) {
                        p.ellipse(b.x, b.y, b.size);
                        b.y -= b.speed;
                        if (b.y < 180) b.y = 270; // Reset bubble
                    }
                }
            } else if (type === 'solid') {
                // Draw a metal block that glows as it gets hot
                let heatColor = p.color(100, 100, 110); // Base metal
                if (temp > 50) {
                    heatColor = p.lerpColor(p.color(100, 100, 110), p.color(255, 80, 0), p.map(temp, 50, 150, 0, 1));
                }
                p.fill(heatColor);
                p.stroke(50);
                p.strokeWeight(2);
                p.rect(60, 50, 110, 110, 12);
                
                // Add heat waves if very hot
                if (temp > 80) {
                    p.stroke(255, 150, 50, 150);
                    p.noFill();
                    let waveOffset = p.frameCount * 0.05;
                    for(let i=0; i<3; i++) {
                        p.bezier(80 + i*25, 40, 90 + i*25 + p.sin(waveOffset)*10, 20, 70 + i*25 - p.sin(waveOffset)*10, 0, 80 + i*25, -20);
                    }
                }
            }
            p.pop();
        }

        // ----- LIQUID -----
        function drawLiquid(p, t) {
            let fillRatio = p.constrain(p.map(t, -10, 110, 0.05, 0.95), 0.05, 0.95);
            let colH = 160 * fillRatio;   
            let bulbY = 250;

            p.push();
            // glass tube
            p.stroke(30, 60, 120);
            p.strokeWeight(2);
            p.fill(255, 255, 255, 200);
            p.rect(210, 50, 20, 190, 10);

            // red liquid column
            p.noStroke();
            p.fill(210, 40, 40, 240);
            p.rect(214, 50 + (190 - colH), 12, colH, 5);

            // bulb inside the beaker
            p.fill(210, 40, 40);
            p.ellipse(220, bulbY, 35, 35);
            p.fill(255, 200, 200, 150); // bulb highlight
            p.ellipse(214, bulbY-6, 10, 10);

            // Glass tube highlight
            p.stroke(255);
            p.strokeWeight(2);
            p.line(214, 60, 214, 230);

            // scale marks
            p.stroke(40);
            p.strokeWeight(1.5);
            for (let i=0; i<=4; i++) {
                let y = 60 + i*40;
                p.line(235, y, 245, y);
            }
            p.fill(20,50,95);
            p.noStroke();
            p.textSize(12);
            p.text("110°", 250, 65);
            p.text("-10°", 250, 225);
            p.pop();
        }

        // ----- DIGITAL -----
        function drawDigital(p, t) {
            p.push();
            // Metal probe dropping into beaker
            p.stroke(180);
            p.strokeWeight(8);
            p.line(220, 120, 220, 260); // Probe shaft
            p.stroke(220); // highlight
            p.strokeWeight(2);
            p.line(218, 120, 218, 260);

            // main body
            p.fill(40, 50, 60);
            p.stroke(20);
            p.strokeWeight(2);
            p.rect(170, 40, 100, 80, 15);

            // lcd screen
            p.fill(160, 190, 150); // Classic green LCD
            p.noStroke();
            p.rect(180, 50, 80, 45, 5);
            // LCD shadow
            p.fill(0, 0, 0, 30);
            p.rect(180, 50, 80, 5, 5);

            // big temperature
            p.fill(10, 40, 10);
            p.textFont('Courier New'); // Digital-ish font
            p.textSize(22);
            p.textStyle(p.BOLD);
            // Add a tiny bit of noise/flicker to the decimals if it's changing
            let displayVal = t.toFixed(1);
            p.text(displayVal + '°C', 185, 80);
            p.pop();
        }

        // ----- RADIATION -----
        function drawRadiation(p, t) {
            p.push();
            // IR gun shape
            p.fill(240, 190, 50); // Industrial yellow
            p.stroke(40);
            p.strokeWeight(2);
            p.rect(250, 70, 130, 60, 10);
            p.fill(50);
            p.rect(290, 120, 40, 90, 10); // handle
            p.fill(200, 50, 50);
            p.rect(275, 130, 15, 30, 5); // Trigger

            // LCD on side of gun
            p.fill(180, 220, 255);
            p.rect(280, 85, 70, 30, 5);
            p.fill(0);
            p.textSize(16);
            p.text(t.toFixed(0) + '°C', 290, 106);

            // lens
            p.fill(30);
            p.rect(240, 75, 10, 50);

            // Laser pointer targeting system
            p.stroke(255, 0, 0, 150);
            p.strokeWeight(2);
            p.drawingContext.setLineDash([10, 5]);
            p.line(240, 90, 170, 90);
            p.line(240, 110, 170, 110);
            p.drawingContext.setLineDash([]);
            
            // Pulsing laser dot on the metal block
            let pulse = p.sin(p.frameCount * 0.2) * 5;
            p.noStroke();
            p.fill(255, 0, 0, 200);
            p.ellipse(170, 90, 8 + pulse, 8 + pulse);
            p.ellipse(170, 110, 8 + pulse, 8 + pulse);
            p.pop();
        }
    };

    // instantiate sketch
    const p5Instance = new p5(sketch);

    // ----- simple button logic -----
    const btnLiquid = document.getElementById('btnLiquid');
    const btnDigital = document.getElementById('btnDigital');
    const btnRadiation = document.getElementById('btnRadiation');
    const infoTitle = document.getElementById('infoTitle');
    const infoDesc = document.getElementById('infoDesc');
    const dynamicFact = document.getElementById('dynamicFact');

    function setActive(btn) {
        [btnLiquid, btnDigital, btnRadiation].forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    btnLiquid.addEventListener('click', () => {
        setActive(btnLiquid);
        currentType = 'liquid';
        infoTitle.innerHTML = '🌡️ Liquid Thermometer';
        infoDesc.innerHTML = `<strong>How it works</strong> Liquid expands when heated, rising in a thin glass tube.<br>
        <strong>Range</strong> –10 °C … 110 °C · <strong>Uses</strong> Home, school, labs.`;
        dynamicFact.innerText = '➡️ Notice how slowly the liquid reacts to temperature changes (High thermal inertia).';
    });

    btnDigital.addEventListener('click', () => {
        setActive(btnDigital);
        currentType = 'digital';
        infoTitle.innerHTML = '📟 Digital Thermometer';
        infoDesc.innerHTML = `<strong>How it works</strong> Electrical resistance changes with temperature, a microprocessor reads it.<br>
        <strong>Range</strong> –50 °C … 300 °C · <strong>Uses</strong> Medical, kitchen, industry.`;
        dynamicFact.innerText = '➡️ Faster response time, usually requiring a thermistor or thermocouple probe.';
    });

    btnRadiation.addEventListener('click', () => {
        setActive(btnRadiation);
        currentType = 'radiation';
        infoTitle.innerHTML = '🔥 Radiation (Infrared)';
        infoDesc.innerHTML = `<strong>How it works</strong> Measures infrared energy emitted by an object — no physical contact needed.<br>
        <strong>Range</strong> –30 °C … 1500 °C · <strong>Uses</strong> Electrical panels, engines, moving parts.`;
        dynamicFact.innerText = '➡️ Instantaneous reading! Try moving the slider rapidly.';
    });