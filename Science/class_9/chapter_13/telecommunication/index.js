
        // --- CONFIG & ASSETS ---
        const EARTH_RADIUS = 5;
        // Using externally hosted textures for realism
        const TEXTURE_URLS = {
            earthColor: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
            earthbump: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
            earthspec: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
            clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
            galaxy: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/starfield.png' 
        };

        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(12, 6, 15); // Angled view

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better color handling
        renderer.outputEncoding = THREE.sRGBEncoding;
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.minDistance = 7;
        controls.maxDistance = 50;

        // --- LIGHTING (The Sun) ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Dim starlight
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(50, 20, -30); // Sunlight from the side/back
        scene.add(sunLight);
        
        // A subtle backlight to outline the planet
        const backLight = new THREE.PointLight(0x5555ff, 0.6, 0);
        backLight.position.set(-30, 10, 40);
        scene.add(backLight);


        // --- TEXTURE LOADER MANAGER ---
        const loadingElem = document.getElementById('loading');
        const textureLoader = new THREE.TextureLoader();
        const manager = new THREE.LoadingManager();
        manager.onLoad = function ( ) { loadingElem.style.display = 'none'; };
        const loader = new THREE.TextureLoader(manager);


        // --- OBJECTS ---
        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // 1. STARFIELD BACKGROUND
        const starGeo = new THREE.SphereGeometry(90, 64, 64);
        const starMat = new THREE.MeshBasicMaterial({
            map: loader.load(TEXTURE_URLS.galaxy),
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6
        });
        const starMesh = new THREE.Mesh(starGeo, starMat);
        scene.add(starMesh);


        // 2. REALISTIC EARTH SURFACE
        const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
        const earthMat = new THREE.MeshPhongMaterial({
            map: loader.load(TEXTURE_URLS.earthColor),
            normalMap: loader.load(TEXTURE_URLS.earthbump), // Gives texture depth
            normalScale: new THREE.Vector2(0.5, 0.5),
            specularMap: loader.load(TEXTURE_URLS.earthspec), // Makes oceans shiny, land matte
            specular: new THREE.Color(0x333333),
            shininess: 15
        });
        const earthMesh = new THREE.Mesh(earthGeo, earthMat);
        mainGroup.add(earthMesh);


        // 3. CLOUDS LAYER (Slightly larger sphere)
        const cloudGeo = new THREE.SphereGeometry(EARTH_RADIUS + 0.05, 64, 64);
        const cloudMat = new THREE.MeshPhongMaterial({
            map: loader.load(TEXTURE_URLS.clouds),
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        const cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
        mainGroup.add(cloudsMesh);


        // 4. ATMOSPHERE GLOW (Subtle Fresnel effect)
        const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS + 0.2, 64, 64);
        // Using a custom shader approach for a realistic rim glow is complex, 
        // so we use a simpler additive blending trick here for robustness.
        const atmosMat = new THREE.MeshLambertMaterial({
            color: 0x44aaff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide // Render inside so it glows on edges
        });
        const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
        mainGroup.add(atmosMesh);


        // --- TELECOMMUNICATION OVERLAYS ---

        const telecomGroup = new THREE.Group();
        mainGroup.add(telecomGroup); // Attach to Earth so it rotates with it

        // Helpers
        function getVectorOnSphere(radius, phi, theta) {
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            return new THREE.Vector3(x, y, z);
        }

        const surfaceNodes = [];
        const signalPackets = [];

        // Generate Major Cities/Hubs positions (approximate placement based on visual density)
        const nodeCount = 50;
        const nodeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        // Make nodes look like glowing city lights
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffcc88 }); 

        for (let i = 0; i < nodeCount; i++) {
            // Use fibonacci sphere algorithm for even distribution, then add noise to cluster them slightly like continents
            const phi = Math.acos(-1 + (2 * i) / nodeCount);
            const theta = Math.sqrt(nodeCount * Math.PI) * phi + (Math.random()*0.5);
            // Ensure they are slightly above ground
            const position = getVectorOnSphere(EARTH_RADIUS + 0.01, phi, theta); 

            // Simple check to try and place more nodes near equator/mid-latitudes (where land usually is)
            if(Math.abs(position.y) < EARTH_RADIUS * 0.8) {
                const node = new THREE.Mesh(nodeGeo, nodeMat);
                node.position.copy(position);
                telecomGroup.add(node);
                surfaceNodes.push(position);
            }
        }

        // Fiber Optic Connections (Subtler lines)
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x0088ff, 
            transparent: true, 
            opacity: 0.25, // More transparent to blend with textures
            linewidth: 1 
        });
        
        surfaceNodes.forEach((startPos, i) => {
            // Connect to nearest neighbors
            let connections = 0;
            for(let j = i + 1; j < surfaceNodes.length && connections < 3; j++) {
                const dist = startPos.distanceTo(surfaceNodes[j]);
                if (dist < 3.0) { 
                    connections++;
                    // Lower arc height for realism (cables follow surface more closely)
                    const midHeight = EARTH_RADIUS + 0.1 + (dist * 0.1);
                    const midPoint = startPos.clone().add(surfaceNodes[j]).multiplyScalar(0.5).normalize().multiplyScalar(midHeight);
                    const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, surfaceNodes[j]);
                    
                    const points = curve.getPoints(30);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, lineMat);
                    telecomGroup.add(line);

                    // Signal Data Packet
                    if(Math.random() > 0.5) { // Not every line has a packet constantly
                        const packetMesh = new THREE.Mesh(
                            new THREE.SphereGeometry(0.035, 6, 6),
                            new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.8 })
                        );
                        telecomGroup.add(packetMesh);
                        signalPackets.push({
                            curve: curve,
                            speed: 0.002 + Math.random() * 0.004, // Slower, more realistic speed
                            pos: Math.random(),
                            mesh: packetMesh
                        });
                    }
                }
            }
        });

        // Satellites (Microwave Links) - Not attached to mainGroup, they orbit independently
        const satellites = [];
        const satGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8); // More realistic body
        const satMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 100, specular: 0xffffff }); // Metallic look
        const panelGeo = new THREE.BoxGeometry(0.6, 0.02, 0.2);
        const panelMat = new THREE.MeshPhongMaterial({ color: 0x222244, shininess: 80 }); // Solar panel look

        for(let i=0; i<6; i++) {
            const satGroupPivot = new THREE.Group(); 
            const satMesh = new THREE.Mesh(satGeo, satMat);
            satMesh.rotation.x = Math.PI / 2;
            const panelLeft = new THREE.Mesh(panelGeo, panelMat); panelLeft.position.x = -0.4;
            const panelRight = new THREE.Mesh(panelGeo, panelMat); panelRight.position.x = 0.4;
            satMesh.add(panelLeft); satMesh.add(panelRight);

            // Add a small blinking light to the satellite
            const blinker = new THREE.PointLight(0xff0000, 1, 2);
            satMesh.add(blinker);

            const orbitAlt = EARTH_RADIUS + 2 + (Math.random() * 2);
            satMesh.position.set(orbitAlt, 0, 0);
            satGroupPivot.add(satMesh);
            
            // Random orbital inclinations
            satGroupPivot.rotation.z = (Math.random() - 0.5) * Math.PI;
            satGroupPivot.rotation.y = Math.random() * Math.PI * 2;
            
            scene.add(satGroupPivot);
            satellites.push({ pivot: satGroupPivot, mesh: satMesh, speed: 0.002 + Math.random() * 0.005, blinker: blinker });
        }

        // Satellite Uplinks (Dynamic lasers)
        const satLineMat = new THREE.LineBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
        const uplinks = [];
        for(let i=0; i<8; i++) {
            const line = new THREE.Line(new THREE.BufferGeometry(), satLineMat);
            scene.add(line);
            // Select random ground node and random satellite index
            uplinks.push({ 
                mesh: line, 
                targetNodeVec: surfaceNodes[Math.floor(Math.random()*surfaceNodes.length)], 
                satIndex: i % satellites.length 
            });
        }


        // --- ANIMATION LOOP ---
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            controls.update();

            // Rotate Clouds independent of Earth surface
            cloudsMesh.rotation.y += delta * 0.02;
            cloudsMesh.rotation.x += delta * 0.005;

            // Animate Signal Packets on fiber lines
            signalPackets.forEach(packet => {
                packet.pos += packet.speed;
                if(packet.pos > 1) packet.pos = 0;
                const point = packet.curve.getPoint(packet.pos);
                packet.mesh.position.copy(point);
            });

            // Animate Satellites orbits
            satellites.forEach((sat, idx) => {
                sat.pivot.rotation.y += sat.speed;
                // Blinking light effect
                sat.blinker.intensity = Math.sin(time * 5 + idx) > 0 ? 1.5 : 0;
            });

            // Update Uplink Geometry (Connecting moving Earth to moving Satellites)
            uplinks.forEach((link, i) => {
                const satObj = satellites[link.satIndex];
                
                // 1. Get Satellite World Position
                const satWorldPos = new THREE.Vector3();
                satObj.mesh.getWorldPosition(satWorldPos);

                // 2. Get Earth Node World Position
                // The node vector is local to the mainGroup (which rotates).
                // We need to transform it into world space.
                const nodeWorldPos = link.targetNodeVec.clone();
                nodeWorldPos.applyMatrix4(mainGroup.matrixWorld);

                // Only draw line if the satellite has line-of-sight (is somewhat above the horizon relative to the node)
                // Simple check: distance between them shouldn't be huge (meaning it's on the other side)
                if (satWorldPos.distanceTo(nodeWorldPos) < EARTH_RADIUS * 2.2) {
                     const points = [nodeWorldPos, satWorldPos];
                     link.mesh.geometry.setFromPoints(points);
                     link.mesh.visible = true;
                     // Flicker effect on uplinks
                     link.mesh.material.opacity = 0.2 + Math.abs(Math.sin(time * 10 + i)) * 0.3;
                } else {
                    link.mesh.visible = false;
                }
            });

            renderer.render(scene, camera);
        }

        // Handle Window Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();