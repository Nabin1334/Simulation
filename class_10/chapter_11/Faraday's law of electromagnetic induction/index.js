
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { DragControls } from 'three/addons/controls/DragControls.js';

        // ============================================
        // SCENE SETUP
        // ============================================
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e14);
        scene.fog = new THREE.Fog(0x0a0e14, 40, 100);

        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(15, 12, 35);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMap.resolution = 2048;
        document.body.appendChild(renderer.domElement);

        // ============================================
        // LIGHTING SETUP
        // ============================================
        scene.add(new THREE.AmbientLight(0x505070, 1.0));

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
        mainLight.position.set(15, 25, 20);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 80;
        mainLight.shadow.camera.left = -40;
        mainLight.shadow.camera.right = 40;
        mainLight.shadow.camera.top = 40;
        mainLight.shadow.camera.bottom = -40;
        mainLight.shadow.bias = -0.0005;
        scene.add(mainLight);

        const fillLight = new THREE.PointLight(0x7799ff, 0.6);
        fillLight.position.set(-20, 8, -15);
        scene.add(fillLight);

        // ============================================
        // ENVIRONMENT
        // ============================================
        const tableMat = new THREE.MeshStandardMaterial({
            color: 0x1a1f2e,
            roughness: 0.85,
            metalness: 0.1
        });
        const table = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), tableMat);
        table.rotation.x = -Math.PI / 2;
        table.position.y = -5;
        table.receiveShadow = true;
        scene.add(table);

        const grid = new THREE.GridHelper(80, 40, 0x334455, 0x1f2a3a);
        grid.position.y = -4.9;
        scene.add(grid);

        // ============================================
        // COIL APPARATUS
        // ============================================
        const coilGroup = new THREE.Group();
        const coilRadius = 3.8;
        const coilLength = 14;
        const numTurns = 12;

        // Coil former (plastic tube)
        const formerGeo = new THREE.CylinderGeometry(coilRadius - 0.15, coilRadius - 0.15, coilLength, 32);
        formerGeo.rotateZ(Math.PI / 2);
        const formerMat = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.6,
            metalness: 0.1,
            transparent: true,
            opacity: 0.3
        });
        const former = new THREE.Mesh(formerGeo, formerMat);
        former.receiveShadow = true;
        coilGroup.add(former);

        // Coil stand
        const standGeo = new THREE.BoxGeometry(10, 2.5, 5.5);
        const standMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.95,
            metalness: 0
        });
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.y = -3;
        stand.castShadow = true;
        stand.receiveShadow = true;
        coilGroup.add(stand);

        // Copper wire helix
        const copperMat = new THREE.MeshStandardMaterial({
            color: 0xb8722f,
            metalness: 0.92,
            roughness: 0.25,
            emissive: 0x331100
        });

        class HelixCurve extends THREE.Curve {
            constructor(turns, radius, length) {
                super();
                this.turns = turns;
                this.radius = radius;
                this.length = length;
            }
            getPoint(t) {
                const x = (t - 0.5) * this.length;
                const angle = t * Math.PI * 2 * this.turns;
                const y = Math.cos(angle) * this.radius;
                const z = Math.sin(angle) * this.radius;
                return new THREE.Vector3(x, y, z);
            }
        }

        const coilPath = new HelixCurve(numTurns, coilRadius, coilLength);
        const coilGeo = new THREE.TubeGeometry(coilPath, 500, 0.32, 16, false);
        const coilMesh = new THREE.Mesh(coilGeo, copperMat);
        coilMesh.castShadow = true;
        coilGroup.add(coilMesh);

        // Coil terminals
        const terminalMat = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            metalness: 0.95,
            roughness: 0.15
        });
        const termGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16);
        
        const termL = new THREE.Mesh(termGeo, terminalMat);
        termL.position.set(-7, 0, 0);
        termL.rotation.z = Math.PI / 2;
        termL.castShadow = true;
        coilGroup.add(termL);

        const termR = new THREE.Mesh(termGeo, terminalMat);
        termR.position.set(7, 0, 0);
        termR.rotation.z = Math.PI / 2;
        termR.castShadow = true;
        coilGroup.add(termR);

        scene.add(coilGroup);

        // ============================================
        // 3D GALVANOMETER (Properly Integrated)
        // ============================================
        const meterGroup = new THREE.Group();
        meterGroup.position.set(0, -1, 18);

        // Meter housing
        const housingGeo = new THREE.BoxGeometry(5, 4, 2);
        const housingMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.7,
            metalness: 0.3
        });
        const housing = new THREE.Mesh(housingGeo, housingMat);
        housing.castShadow = true;
        housing.receiveShadow = true;
        meterGroup.add(housing);

        // Meter dial (circular face)
        const dialGeo = new THREE.CircleGeometry(1.6, 32);
        const dialCanv = document.createElement('canvas');
        dialCanv.width = 512;
        dialCanv.height = 512;
        const dialCtx = dialCanv.getContext('2d');

        // Radial gradient background
        const gradient = dialCtx.createRadialGradient(256, 256, 50, 256, 256, 256);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#cccccc');
        dialCtx.fillStyle = gradient;
        dialCtx.fillRect(0, 0, 512, 512);

        // Scale markings
        dialCtx.strokeStyle = '#000000';
        dialCtx.lineWidth = 3;
        for (let i = 0; i <= 10; i++) {
            const angle = Math.PI + (i / 10) * Math.PI;
            const x1 = 256 + Math.cos(angle) * 220;
            const y1 = 256 + Math.sin(angle) * 220;
            const x2 = 256 + Math.cos(angle) * 250;
            const y2 = 256 + Math.sin(angle) * 250;
            dialCtx.beginPath();
            dialCtx.moveTo(x1, y1);
            dialCtx.lineTo(x2, y2);
            dialCtx.stroke();
        }

        // Labels
        dialCtx.fillStyle = '#000000';
        dialCtx.font = 'bold 40px Arial';
        dialCtx.textAlign = 'center';
        dialCtx.textBaseline = 'middle';
        dialCtx.fillText('−', 100, 256);
        dialCtx.fillText('0', 256, 450);
        dialCtx.fillText('+', 412, 256);

        // Needle pivot point
        dialCtx.fillStyle = '#333333';
        dialCtx.beginPath();
        dialCtx.arc(256, 256, 15, 0, Math.PI * 2);
        dialCtx.fill();

        const dialTex = new THREE.CanvasTexture(dialCanv);
        const dialMat = new THREE.MeshBasicMaterial({ map: dialTex });
        const dial = new THREE.Mesh(dialGeo, dialMat);
        dial.position.z = 1.01;
        meterGroup.add(dial);

        // Meter needle (red pointer)
        const needleGeo = new THREE.BoxGeometry(0.12, 1.2, 0.08);
        needleGeo.translate(0, 0.6, 0);
        const needleMat = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            metalness: 0.8,
            roughness: 0.2
        });
        const needle = new THREE.Mesh(needleGeo, needleMat);
        needle.position.z = 1.02;
        needle.userData.isNeedle = true;
        meterGroup.add(needle);

        // Connection terminals on meter
        const meterTermGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 12);
        const meterTermMat = new THREE.MeshStandardMaterial({
            color: 0xffcc00,
            metalness: 0.99,
            roughness: 0.05
        });
        
        const meterTermL = new THREE.Mesh(meterTermGeo, meterTermMat);
        meterTermL.position.set(-2.3, -2, 0);
        meterTermL.rotation.z = Math.PI / 2;
        meterTermL.castShadow = true;
        meterGroup.add(meterTermL);

        const meterTermR = new THREE.Mesh(meterTermGeo, meterTermMat);
        meterTermR.position.set(2.3, -2, 0);
        meterTermR.rotation.z = Math.PI / 2;
        meterTermR.castShadow = true;
        meterGroup.add(meterTermR);

        scene.add(meterGroup);

        // ============================================
        // CIRCUIT WIRES (Connected to Meter)
        // ============================================
        const wireMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8,
            metalness: 0.2
        });

        function createWirePath(start, end, sag = 3) {
            const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
            mid.y -= sag;
            return new THREE.QuadraticBezierCurve3(start, mid, end);
        }

        // Left wire: coil terminal → meter left terminal
        const wireL = new THREE.Mesh(
            new THREE.TubeGeometry(
                createWirePath(new THREE.Vector3(-7, 0, 0), new THREE.Vector3(-2.3, -3, 18), 2),
                60, 0.12, 8, false
            ),
            wireMat
        );
        wireL.castShadow = true;
        scene.add(wireL);

        // Right wire: coil terminal → meter right terminal
        const wireR = new THREE.Mesh(
            new THREE.TubeGeometry(
                createWirePath(new THREE.Vector3(7, 0, 0), new THREE.Vector3(2.3, -3, 18), 2),
                60, 0.12, 8, false
            ),
            wireMat
        );
        wireR.castShadow = true;
        scene.add(wireR);

        // ============================================
        // BAR MAGNET
        // ============================================
        // Create proper N/S pole texture
        const magCanvas = document.createElement('canvas');
        magCanvas.width = 512;
        magCanvas.height = 256;
        const magCtx = magCanvas.getContext('2d');

        // Left side - North Pole (Red)
        magCtx.fillStyle = '#d32f2f';
        magCtx.fillRect(0, 0, 256, 256);

        // Right side - South Pole (Blue)
        magCtx.fillStyle = '#1565c0';
        magCtx.fillRect(256, 0, 256, 256);

        // Center divider
        magCtx.fillStyle = '#ffffff';
        magCtx.fillRect(248, 0, 16, 256);

        // Labels
        magCtx.fillStyle = '#ffffff';
        magCtx.font = 'bold 120px Arial';
        magCtx.textAlign = 'center';
        magCtx.textBaseline = 'middle';
        magCtx.shadowColor = 'rgba(0,0,0,0.8)';
        magCtx.shadowBlur = 8;
        magCtx.fillText('N', 128, 128);
        magCtx.fillText('S', 384, 128);

        const magTex = new THREE.CanvasTexture(magCanvas);
        magTex.anisotropy = 16;

        const magMat = new THREE.MeshStandardMaterial({
            map: magTex,
            metalness: 0.6,
            roughness: 0.25,
            emissive: 0x1a1a1a
        });

        const magnetGeo = new THREE.BoxGeometry(10, 2.4, 2.4);
        const magnetMesh = new THREE.Mesh(magnetGeo, magMat);
        magnetMesh.position.set(18, 0, 0);
        magnetMesh.castShadow = true;
        magnetMesh.receiveShadow = true;
        scene.add(magnetMesh);

        // ============================================
        // CONTROLS
        // ============================================
        const orbit = new OrbitControls(camera, renderer.domElement);
        orbit.enableDamping = true;
        orbit.dampingFactor = 0.06;
        orbit.maxPolarAngle = Math.PI / 2 - 0.1;
        orbit.autoRotate = false;

        const drag = new DragControls([magnetMesh], camera, renderer.domElement);
        drag.addEventListener('dragstart', () => {
            orbit.enabled = false;
        });
        drag.addEventListener('drag', (event) => {
            event.object.position.y = 0;
            event.object.position.z = 0;
            if (event.object.position.x > 28) event.object.position.x = 28;
            if (event.object.position.x < -28) event.object.position.x = -28;
        });
        drag.addEventListener('dragend', () => {
            orbit.enabled = true;
        });

        // ============================================
        // PHYSICS & CALCULATIONS
        // ============================================
        const clock = new THREE.Clock();
        let lastPosX = magnetMesh.position.x;
        let lastFlux = 0;
        let smoothVel = 0;
        let smoothNeedle = 0;

        // Constants
        const N_TURNS = 12;
        const COIL_RESISTANCE = 12.0; // Ohms
        const COIL_CENTER = 0;
        const COIL_RADIUS = 3.8;
        const MAGNET_STRENGTH = 80; // Arbitrary field strength constant
        const MAX_NEEDLE_ANGLE = 85; // Degrees

        // UI Elements
        const posEl = document.getElementById('pos-value');
        const velEl = document.getElementById('vel-value');
        const fluxEl = document.getElementById('flux-value');
        const dfluxEl = document.getElementById('dflux-value');
        const emfEl = document.getElementById('emf-value');
        const currentEl = document.getElementById('current-value');
        const resistanceEl = document.getElementById('resistance-value');

        function calculateFlux(magnetX) {
            // Magnetic flux through one coil loop
            // Simplified dipole model: B ∝ 1/r²
            const distance = Math.abs(magnetX - COIL_CENTER);
            const fieldStrength = MAGNET_STRENGTH / Math.pow(Math.max(1, distance), 2.5);
            const coilArea = Math.PI * COIL_RADIUS * COIL_RADIUS;
            return fieldStrength * coilArea;
        }

        function animate() {
            requestAnimationFrame(animate);
            const dt = Math.min(clock.getDelta(), 0.033);

            const currentX = magnetMesh.position.x;
            const rawVel = (currentX - lastPosX) / (dt || 0.016);

            // Smooth velocity (filter hand jitter)
            smoothVel = smoothVel * 0.75 + rawVel * 0.25;

            // Calculate flux through one coil turn
            const flux = calculateFlux(currentX);

            // Rate of change of flux (dΦ/dt)
            const dflux = (flux - lastFlux) / (dt || 0.016);

            // FARADAY'S LAW: ε = -N × dΦ/dt
            const emf = Math.abs(N_TURNS * dflux);

            // OHM'S LAW: I = ε / R
            const current = emf / COIL_RESISTANCE;

            // Suppress noise when magnet is stationary
            if (Math.abs(smoothVel) < 0.02) {
                smoothVel = 0;
            }

            // Update UI
            posEl.textContent = currentX.toFixed(2) + ' m';
            velEl.textContent = smoothVel.toFixed(3) + ' m/s';
            fluxEl.textContent = (flux / 100).toFixed(3) + ' Wb';
            dfluxEl.textContent = (dflux / 100).toFixed(4) + ' Wb/s';
            emfEl.textContent = emf.toFixed(4) + ' V';
            currentEl.textContent = current.toFixed(4) + ' A';
            resistanceEl.textContent = COIL_RESISTANCE.toFixed(1) + ' Ω';

            // Update 3D needle angle (lerped for smooth motion)
            let targetAngle = (current / 0.1) * MAX_NEEDLE_ANGLE; // Scale to 0.1A max
            targetAngle = Math.max(-MAX_NEEDLE_ANGLE, Math.min(MAX_NEEDLE_ANGLE, targetAngle));
            
            smoothNeedle += (targetAngle - smoothNeedle) * 0.15;
            needle.rotation.z = (smoothNeedle * Math.PI) / 180;

            // Copper coil glow effect with high current
            const glowIntensity = Math.min(current * 3, 0.6);
            copperMat.emissive.setHSL(0.07, 1, glowIntensity * 0.25);

            lastPosX = currentX;
            lastFlux = flux;

            orbit.update();
            renderer.render(scene, camera);
        }

        animate();

        // ============================================
        // WINDOW RESIZE
        // ============================================
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
  