 // Real Physics Constants
        const EARTH_RADIUS = 6371; // km
        const EARTH_MASS = 5.972e24; // kg
        const G = 6.67430e-11; // N⋅m²/kg²
        const SURFACE_GRAVITY = 9.80665; // m/s²
        const SCALE = 1/1000; // Visual scale
        
        // State
        let scene, camera, renderer;
        let earth, atmosphere, satellite, orbitLine;
        let height = 400;
        let angle = 0;
        let orbits = 0;
        let lastAngle = 0;
        
        // Physics
        let gravity, velocity, period, angularVelocity;
        
        function init() {
            // Scene setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0d1b2a);
            
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(20, 15, 20);
            camera.lookAt(0, 0, 0);
            
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            document.getElementById('container').appendChild(renderer.domElement);
            
            // Adjust 3D view based on window size
            adjust3DView();
            
            // Lights
            scene.add(new THREE.AmbientLight(0xffffff, 0.5));
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(10, 10, 10);
            scene.add(light);
            
            // Create objects
            createEarth();
            createAtmosphere();
            createSatellite();
            createOrbit();
            createStars();
            
            // Controls
            setupControls();
            
            // Calculate initial physics
            calculatePhysics();
            updateDisplay();
            
            // Start
            animate();
        }
        
        function adjust3DView() {
            // Adjust camera position based on window size
            if (window.innerWidth < 768) {
                camera.position.set(25, 20, 25);
                camera.lookAt(0, 0, 0);
            } else {
                camera.position.set(20, 15, 20);
                camera.lookAt(0, 0, 0);
            }
        }
        
        function createEarth() {
            const geometry = new THREE.SphereGeometry(EARTH_RADIUS * SCALE, 64, 64);
            
            // Simple Earth texture
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Ocean
            const grad = ctx.createLinearGradient(0, 0, 0, 512);
            grad.addColorStop(0, '#1a4d7a');
            grad.addColorStop(0.5, '#2d6fa8');
            grad.addColorStop(1, '#1a4d7a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1024, 512);
            
            // Land
            ctx.fillStyle = '#3a7a3f';
            for (let i = 0; i < 30; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 100 + 40, 0, Math.PI * 2);
                ctx.fill();
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            earth = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ map: texture }));
            scene.add(earth);
        }
        
        function createAtmosphere() {
            const geometry = new THREE.SphereGeometry(EARTH_RADIUS * SCALE * 1.02, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0x4fc3f7,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            atmosphere = new THREE.Mesh(geometry, material);
            scene.add(atmosphere);
        }
        
        function createSatellite() {
            const group = new THREE.Group();
            
            // Body
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.3, 0.4),
                new THREE.MeshPhongMaterial({ color: 0xff6b6b, emissive: 0xff3333, emissiveIntensity: 0.3 })
            );
            group.add(body);
            
            // Panels
            const panel = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.02, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x1a237e })
            );
            const panel1 = panel.clone();
            panel1.position.x = 0.65;
            const panel2 = panel.clone();
            panel2.position.x = -0.65;
            group.add(panel1, panel2);
            
            satellite = group;
            scene.add(satellite);
        }
        
        function createOrbit() {
            const material = new THREE.LineBasicMaterial({ color: 0xffd93d, transparent: true, opacity: 0.6 });
            orbitLine = new THREE.Line(new THREE.BufferGeometry(), material);
            scene.add(orbitLine);
        }
        
        function createStars() {
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            for (let i = 0; i < 3000; i++) {
                positions.push(
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 200
                );
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 }));
            scene.add(stars);
        }
        
        function setupControls() {
            let dragging = false;
            let prev = { x: 0, y: 0 };
            
            renderer.domElement.addEventListener('mousedown', (e) => {
                dragging = true;
                prev = { x: e.clientX, y: e.clientY };
            });
            
            renderer.domElement.addEventListener('mousemove', (e) => {
                if (dragging) {
                    const dx = e.clientX - prev.x;
                    const dy = e.clientY - prev.y;
                    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.005);
                    prev = { x: e.clientX, y: e.clientY };
                }
            });
            
            renderer.domElement.addEventListener('mouseup', () => dragging = false);
            
            renderer.domElement.addEventListener('wheel', (e) => {
                e.preventDefault();
                const dir = camera.position.clone().normalize();
                const dist = camera.position.length();
                if (e.deltaY > 0 && dist < 50) {
                    camera.position.add(dir.multiplyScalar(e.deltaY * 0.01));
                } else if (e.deltaY < 0 && dist > 10) {
                    camera.position.add(dir.multiplyScalar(e.deltaY * 0.01));
                }
            }, { passive: false });
            
            document.getElementById('height-slider').addEventListener('input', (e) => {
                height = parseFloat(e.target.value);
                document.getElementById('height-value').textContent = height.toLocaleString() + ' km';
                calculatePhysics();
                updateDisplay();
            });
            
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                
                // Adjust 3D view for responsive design
                adjust3DView();
                
                // Handle panel positioning on resize
                if (window.innerWidth < 768) {
                    // Mobile layout already handled by CSS
                } else {
                    // Desktop layout
                    const container = document.getElementById('container');
                    container.style.height = '100vh';
                    container.style.overflow = 'hidden';
                }
            });
        }
        
        // REAL PHYSICS CALCULATIONS
        function calculatePhysics() {
            const r_m = (EARTH_RADIUS + height) * 1000; // meters
            const r_km = r_m / 1000; // km
            
            // Newton's Law: g = GM/r²
            gravity = (G * EARTH_MASS) / (r_m * r_m);
            
            // Orbital velocity: v = √(GM/r)
            velocity = Math.sqrt(G * EARTH_MASS / r_m) / 1000; // km/s
            
            // Orbital period: T = 2πr/v
            period = (2 * Math.PI * r_km) / velocity; // seconds
            
            // Angular velocity: ω = v/r (THIS CONTROLS ROTATION SPEED!)
            angularVelocity = velocity / r_km; // rad/s
            angularVelocity *= 50; // Scale for visibility
            
            // Update orbit line
            const positions = [];
            const radius = r_km * SCALE;
            for (let i = 0; i <= 128; i++) {
                const a = (i / 128) * Math.PI * 2;
                positions.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
            }
            orbitLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        }
        
        function updateDisplay() {
            const r = EARTH_RADIUS + height;
            const percent = (gravity / SURFACE_GRAVITY) * 100;
            const periodMin = period / 60;
            
            // Format large numbers with commas
            const formatNumber = (num) => {
                return num.toLocaleString();
            };
            
            // Main panel
            document.getElementById('gravity').textContent = gravity.toFixed(3) + ' m/s²';
            document.getElementById('speed').textContent = velocity.toFixed(2) + ' km/s';
            document.getElementById('period').textContent = periodMin < 60 ? 
                periodMin.toFixed(1) + ' min' : 
                (periodMin / 60).toFixed(1) + ' hrs';
            
            // Data panel
            document.getElementById('height2').textContent = formatNumber(height) + ' km';
            document.getElementById('distance').textContent = formatNumber(r) + ' km';
            document.getElementById('gravity2').textContent = gravity.toFixed(3) + ' m/s²';
            document.getElementById('percent').textContent = percent.toFixed(1) + '%';
            document.getElementById('weight').textContent = percent.toFixed(1) + '%';
            document.getElementById('speed2').textContent = velocity.toFixed(2) + ' km/s';
            document.getElementById('speed-kmh').textContent = formatNumber(Math.round(velocity * 3600)) + ' km/h';
            document.getElementById('period2').textContent = periodMin < 60 ? 
                periodMin.toFixed(1) + ' min' : 
                (periodMin / 60).toFixed(1) + ' hrs';
        }
        
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate Earth
            earth.rotation.y += 0.001;
            atmosphere.rotation.y += 0.001;
            
            // Move satellite with REAL angular velocity
            angle += angularVelocity / 60;
            
            // Track orbits
            if (angle - lastAngle > Math.PI && Math.floor(lastAngle / (2 * Math.PI)) < Math.floor(angle / (2 * Math.PI))) {
                orbits++;
                document.getElementById('orbits').textContent = orbits;
            }
            lastAngle = angle;
            
            // Position satellite
            const radius = (EARTH_RADIUS + height) * SCALE;
            satellite.position.x = Math.cos(angle) * radius;
            satellite.position.z = Math.sin(angle) * radius;
            satellite.rotation.y = angle + Math.PI / 2;
            
            renderer.render(scene, camera);
        }
        
        function setHeight(h) {
            height = h;
            document.getElementById('height-slider').value = h;
            document.getElementById('height-value').textContent = h.toLocaleString() + ' km';
            calculatePhysics();
            updateDisplay();
        }
        
        init();