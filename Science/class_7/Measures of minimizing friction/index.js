
        const sim = document.getElementById('simulation');
        const vehicle = document.getElementById('vehicle');
        const wheel1 = document.getElementById('wheel1');
        const wheel2 = document.getElementById('wheel2');
        const modeEl = document.getElementById('mode');
        const muEl = document.getElementById('mu');
        const distEl = document.getElementById('distance');
        const timeEl = document.getElementById('time');

        const g = 9.81;
        const mass = 10; // kg
        const initialV = 15; // m/s
        const pixelsPerMeter = 40; // Visual scaling

        let v = 0;
        let pos = 0;
        let startTime = 0;
        let animationId = null;
        let currentMu = 0;
        let mode = '';

        function start(type) {
            reset();
            mode = type;
            switch(type) {
                case 'rough':   currentMu = 0.80; modeEl.textContent = "Rough Surface (Sliding)"; break;
                case 'smooth':  currentMu = 0.40; modeEl.textContent = "Smooth Sliding"; break;
                case 'lubricated': currentMu = 0.05; modeEl.textContent = "Lubricated (Oil)"; break;
                case 'bearing': currentMu = 0.002; modeEl.textContent = "Ball Bearings!"; break;
            }
            muEl.textContent = currentMu.toFixed(3);
            
            // Visual feedback
            if (type === 'bearing') {
                wheel1.classList.add('spinning');
                wheel2.classList.add('spinning');
            } else {
                wheel1.classList.remove('spinning');
                wheel2.classList.remove('spinning');
            }
            if (type === 'lubricated') addOilDrops();

            v = initialV;
            pos = 0;
            startTime = performance.now();
            vehicle.style.left = '20px';
            animate();
        }

        function animate() {
            const dt = 0.016; // ~60 FPS
            const a = -currentMu * g; // deceleration
            v += a * dt;
            if (v < 0) v = 0;

            pos += v * dt;
            const pixelPos = 20 + pos * pixelsPerMeter;
            vehicle.style.left = pixelPos + 'px';

            const elapsed = (performance.now() - startTime) / 1000;
            timeEl.textContent = elapsed.toFixed(1);
            distEl.textContent = pos.toFixed(1);

            if (v > 0.01 && pixelPos < sim.offsetWidth - 150) {
                animationId = requestAnimationFrame(animate);
            } else {
                if (mode === 'bearing') {
                    modeEl.textContent = "Ball Bearings Win!";
                }
            }
        }

        function addOilDrops() {
            for(let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const drop = document.createElement('div');
                    drop.className = 'oil-drop';
                    drop.style.left = Math.random() * 100 + '%';
                    sim.appendChild(drop);
                    setTimeout(() => drop.remove(), 3000);
                }, i * 150);
            }
        }

        function reset() {
            cancelAnimationFrame(animationId);
            v = 0; pos = 0;
            vehicle.style.left = '20px';
            distEl.textContent = '0.0';
            timeEl.textContent = '0.0';
            wheel1.classList.remove('spinning');
            wheel2.classList.remove('spinning');
            document.querySelectorAll('.oil-drop').forEach(d => d.remove());
        }