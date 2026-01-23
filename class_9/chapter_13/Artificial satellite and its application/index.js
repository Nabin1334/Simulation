
        // Configuration
        const CONFIG = {
            EARTH_RADIUS: 10,
            REAL_EARTH_RADIUS_KM: 6371,
            SATELLITE_COUNT: 6,
            GROUND_STATIONS: 6,
            COLORS: {
                earth: 0x1a3a5f,
                atmosphere: 0x0066ff,
                leo: 0x00ff66,
                meo: 0xffa500,
                geo: 0xff4757,
                ground: 0x8e44ad,
                comm: 0x00ffff
            },
            ORBITS: {
                LEO: { radius: 10.6, speed: 0.02 },
                MEO: { radius: 41.7, speed: 0.0026 },
                GEO: { radius: 66.2, speed: 0.0013 }
            }
        };

        // Global variables
        let scene, camera, renderer, controls;
        let earthGroup, earth, clouds, satellites = [];
        let groundStations = [];
        let communicationBeams = [];
        let orbitPaths = [];
        let isRunning = true;
        let orbitType = 'LEO';
        let isMobile = false;
        let hasInteracted = false;
        let speedMultiplier = 1;
        let showOrbits = true;
        let showClouds = true;

        // Detect mobile device
        function detectMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.innerWidth <= 768;
        }

        // Initialize the simulation
        function init() {
            isMobile = detectMobile();
            hasInteracted = false;
            
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);
            scene.fog = new THREE.FogExp2(0x020205, 0.005);

            // Create camera with adjusted settings for mobile
            camera = new THREE.PerspectiveCamera(
                45,
                document.getElementById('simulation-container').clientWidth / 
                document.getElementById('simulation-container').clientHeight,
                0.1,
                isMobile ? 1000 : 2000
            );
            camera.position.set(isMobile ? 80 : 100, isMobile ? 40 : 60, isMobile ? 80 : 100);

            // Create renderer with device pixel ratio support
            renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(
                document.getElementById('simulation-container').clientWidth,
                document.getElementById('simulation-container').clientHeight
            );
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
            document.getElementById('simulation-container').appendChild(renderer.domElement);

            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, isMobile ? 0.4 : 0.3);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 0.8 : 1.0);
            directionalLight.position.set(500, 0, 0);
            scene.add(directionalLight);

            // Create stars
            createStars();

            // Create Earth group
            earthGroup = new THREE.Group();
            scene.add(earthGroup);

            // Create Earth
            createEarth();

            // Create ground stations
            createGroundStations();

            // Create initial satellites
            for (let i = 0; i < CONFIG.SATELLITE_COUNT; i++) {
                createSatellite();
            }

            // Setup orbit controls with mobile optimizations
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            controls.minDistance = isMobile ? 20 : 15;
            controls.maxDistance = isMobile ? 300 : 500;
            controls.enableZoom = true;
            controls.enablePan = !isMobile;
            controls.enableRotate = true;
            
            if (isMobile) {
                controls.touches = {
                    ONE: THREE.TOUCH.ROTATE,
                    TWO: THREE.TOUCH.DOLLY_PAN
                };
            }

            // Setup button controls
            setupControls();

            // Add interaction listeners
            setupInteractionListeners();

            // Handle initial resize
            handleResize();

            // Update stats
            updateStats();

            // Start animation
            animate();
        }

        // Create star background
        function createStars() {
            const starGeometry = new THREE.BufferGeometry();
            const starCount = isMobile ? 1500 : 3000;
            const positions = new Float32Array(starCount * 3);

            for (let i = 0; i < starCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * (isMobile ? 1000 : 2000);
                positions[i + 1] = (Math.random() - 0.5) * (isMobile ? 1000 : 2000);
                positions[i + 2] = (Math.random() - 0.5) * (isMobile ? 1000 : 2000);
            }

            starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const starMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: isMobile ? 0.8 : 1.2,
                sizeAttenuation: true
            });

            const stars = new THREE.Points(starGeometry, starMaterial);
            scene.add(stars);
        }

        // Create Earth
        function createEarth() {
            const loader = new THREE.TextureLoader();
            const earthTexture = loader.load('https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg');
            const nightTexture = loader.load('https://www.solarsystemscope.com/textures/download/2k_earth_nightmap.jpg');
            const specularTexture = loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
            const normalTexture = loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
            const cloudsTexture = loader.load('https://threejs.org/examples/textures/planets/earth_clouds_2048.jpg');

            // Earth sphere
            const geometry = new THREE.SphereGeometry(CONFIG.EARTH_RADIUS, isMobile ? 32 : 64, isMobile ? 32 : 64);
            const material = new THREE.MeshPhongMaterial({
                map: earthTexture,
                emissiveMap: nightTexture,
                emissive: new THREE.Color(0x444444),
                emissiveIntensity: 2.5,
                specularMap: specularTexture,
                normalMap: normalTexture,
                normalScale: new THREE.Vector2(0.8, 0.8),
                specular: 0x333333,
                shininess: 10
            });
            earth = new THREE.Mesh(geometry, material);
            earthGroup.add(earth);

            // Clouds
            const cloudsGeometry = new THREE.SphereGeometry(CONFIG.EARTH_RADIUS * 1.01, isMobile ? 32 : 64, isMobile ? 32 : 64);
            const cloudsMaterial = new THREE.MeshPhongMaterial({
                map: cloudsTexture,
                transparent: true,
                opacity: 0.8,
                depthWrite: false
            });
            clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
            earthGroup.add(clouds);

            // Atmosphere
            const atmosphereGeometry = new THREE.SphereGeometry(CONFIG.EARTH_RADIUS + 1.2, isMobile ? 32 : 64, isMobile ? 32 : 64);
            const atmosphereMaterial = new THREE.MeshBasicMaterial({
                color: CONFIG.COLORS.atmosphere,
                transparent: true,
                opacity: 0.08,
                side: THREE.BackSide
            });
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            earthGroup.add(atmosphere);
        }

        // Create ground stations
        function createGroundStations() {
            const locations = [
                { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
                { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
                { name: 'Tokyo, Japan', lat: 35.6895, lon: 139.6917 },
                { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
                { name: 'Cape Town, South Africa', lat: -33.9249, lon: 18.4241 },
                { name: 'Moscow, Russia', lat: 55.7558, lon: 37.6173 }
            ];

            locations.forEach((loc, i) => {
                const phi = (90 - loc.lat) * Math.PI / 180;
                const theta = loc.lon * Math.PI / 180;
                
                const x = CONFIG.EARTH_RADIUS * Math.sin(phi) * Math.cos(theta);
                const y = CONFIG.EARTH_RADIUS * Math.sin(phi) * Math.sin(theta);
                const z = CONFIG.EARTH_RADIUS * Math.cos(phi);
                
                // Create antenna
                const baseGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.8, isMobile ? 6 : 8);
                const baseMaterial = new THREE.MeshStandardMaterial({ color: CONFIG.COLORS.ground });
                const base = new THREE.Mesh(baseGeometry, baseMaterial);
                
                const dishGeometry = new THREE.CircleGeometry(0.8, isMobile ? 12 : 16);
                const dishMaterial = new THREE.MeshStandardMaterial({ 
                    color: CONFIG.COLORS.ground,
                    side: THREE.DoubleSide
                });
                const dish = new THREE.Mesh(dishGeometry, dishMaterial);
                dish.rotation.x = Math.PI / 2;
                dish.position.y = 0.6;
                
                const station = new THREE.Group();
                station.add(base);
                station.add(dish);
                station.position.set(x, y, z);
                station.lookAt(earthGroup.position);
                station.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
                
                station.userData = {
                    type: 'ground',
                    name: loc.name,
                    location: loc.name
                };
                
                earthGroup.add(station);
                groundStations.push(station);
            });
        }

        // Get inclination based on orbit type
        function getInclination(orbitType) {
            if (orbitType === 'GEO') {
                return 0; // Equatorial
            } else if (orbitType === 'MEO') {
                return 55 * Math.PI / 180; // Typical for GPS
            } else {
                return Math.PI / 2 * (0.8 + Math.random() * 0.4); // Near-polar for LEO
            }
        }

        // Get satellite name
        function getSatelliteName(orbitType) {
            const leoNames = ['ISS', 'Hubble', 'Starlink', 'Iridium', 'Terra', 'Aqua', 'Landsat', 'Sentinel'];
            const meoNames = ['GPS', 'GLONASS', 'Galileo', 'BeiDou', 'Navstar', 'Inmarsat', 'Compass', 'QZSS'];
            const geoNames = ['GOES', 'Intelsat', 'Eutelsat', 'SES', 'DirecTV', 'EchoStar', 'Himawari', 'Insat'];
            const names = {LEO: leoNames, MEO: meoNames, GEO: geoNames};
            return names[orbitType][Math.floor(Math.random() * names[orbitType].length)];
        }

        // Create a satellite
        function createSatellite() {
            const orbit = CONFIG.ORBITS[orbitType];
            const angle = Math.random() * Math.PI * 2;
            const radius = orbit.radius;
            const inclination = getInclination(orbitType);
            
            const satelliteGroup = new THREE.Group();
            
            // Simplified geometry for mobile
            const bodyGeometry = isMobile ? 
                new THREE.BoxGeometry(0.6, 0.3, 0.9) : 
                new THREE.BoxGeometry(0.8, 0.4, 1.2);
            
            const bodyMaterial = new THREE.MeshStandardMaterial({ 
                color: CONFIG.COLORS[orbitType.toLowerCase()],
                emissive: CONFIG.COLORS[orbitType.toLowerCase()],
                emissiveIntensity: 0.3
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            satelliteGroup.add(body);
            
            // Solar panels
            const panelGeometry = isMobile ? 
                new THREE.BoxGeometry(1.5, 0.04, 0.6) : 
                new THREE.BoxGeometry(2, 0.05, 0.8);
            
            const panelMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffff00,
                emissive: 0xffff00,
                emissiveIntensity: 0.2
            });
            
            const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
            leftPanel.position.x = -0.9;
            satelliteGroup.add(leftPanel);
            
            const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
            rightPanel.position.x = 0.9;
            satelliteGroup.add(rightPanel);
            
            // Antenna
            const antennaGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, isMobile ? 6 : 8);
            const antenna = new THREE.Mesh(antennaGeometry, panelMaterial);
            antenna.position.z = -0.6;
            satelliteGroup.add(antenna);
            
            // Position satellite
            satelliteGroup.position.x = radius * Math.cos(angle);
            satelliteGroup.position.y = radius * Math.sin(angle) * Math.cos(inclination);
            satelliteGroup.position.z = radius * Math.sin(angle) * Math.sin(inclination);
            
            // Store satellite data
            satelliteGroup.userData = {
                type: 'satellite',
                orbitType: orbitType,
                angle: angle,
                radius: radius,
                baseSpeed: orbit.speed,
                speed: orbit.speed * speedMultiplier * (isMobile ? 1.5 : 1),
                inclination: inclination,
                name: getSatelliteName(orbitType),
                applications: getSatelliteApplications()
            };
            
            scene.add(satelliteGroup);
            satellites.push(satelliteGroup);
            
            // Create orbit path
            if (showOrbits) {
                createOrbitPath(satelliteGroup);
            }
            
            updateStats();
            return satelliteGroup;
        }

        // Create orbit visualization
        function createOrbitPath(satellite) {
            const points = [];
            const radius = satellite.userData.radius;
            const inclination = satellite.userData.inclination;
            const segments = isMobile ? 32 : 64;
            
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle) * Math.cos(inclination);
                const z = radius * Math.sin(angle) * Math.sin(inclination);
                points.push(new THREE.Vector3(x, y, z));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineDashedMaterial({
                color: CONFIG.COLORS[satellite.userData.orbitType.toLowerCase()],
                transparent: true,
                opacity: 0.3,
                dashSize: 0.5,
                gapSize: 0.3
            });
            
            const orbitPath = new THREE.Line(geometry, material);
            orbitPath.computeLineDistances();
            scene.add(orbitPath);
            satellite.userData.orbitPath = orbitPath;
            orbitPaths.push(orbitPath);
        }

        // Update satellite positions
        function updateSatellites() {
            if (!isRunning) return;
            
            satellites.forEach(satellite => {
                const data = satellite.userData;
                data.angle += data.speed;
                
                // Update position
                satellite.position.x = data.radius * Math.cos(data.angle);
                satellite.position.y = data.radius * Math.sin(data.angle) * Math.cos(data.inclination);
                satellite.position.z = data.radius * Math.sin(data.angle) * Math.sin(data.inclination);
                
                // Rotate solar panels
                satellite.children[1].rotation.y += 0.01 * speedMultiplier;
                satellite.children[2].rotation.y += 0.01 * speedMultiplier;
                
                // Update orientation
                const da = 0.01;
                const lookAtPoint = new THREE.Vector3(
                    data.radius * Math.cos(data.angle + da),
                    data.radius * Math.sin(data.angle + da) * Math.cos(data.inclination),
                    data.radius * Math.sin(data.angle + da) * Math.sin(data.inclination)
                );
                satellite.lookAt(lookAtPoint);
                
                // Occasionally establish communication
                if (Math.random() > (isMobile ? 0.995 : 0.98) && hasInteracted) {
                    establishCommunication(satellite);
                }
            });
        }

        // Establish communication link
        function establishCommunication(satellite) {
            let nearestStation = null;
            let minDistance = Infinity;
            
            groundStations.forEach(station => {
                const stationWorldPos = station.getWorldPosition(new THREE.Vector3());
                const distance = satellite.position.distanceTo(stationWorldPos);
                const dot = stationWorldPos.dot(satellite.position);
                if (distance < minDistance && distance < (CONFIG.ORBITS.GEO.radius * 1.2) && dot > CONFIG.EARTH_RADIUS * CONFIG.EARTH_RADIUS) {
                    minDistance = distance;
                    nearestStation = station;
                }
            });
            
            if (nearestStation) {
                const stationWorldPos = nearestStation.getWorldPosition(new THREE.Vector3());
                const beamGeometry = new THREE.CylinderGeometry(0.03, 0.1, minDistance, isMobile ? 6 : 8);
                const beamMaterial = new THREE.MeshBasicMaterial({
                    color: CONFIG.COLORS.comm,
                    transparent: true,
                    opacity: 0.6,
                    side: THREE.DoubleSide
                });
                const beam = new THREE.Mesh(beamGeometry, beamMaterial);
                
                beam.position.copy(satellite.position.clone().add(stationWorldPos).multiplyScalar(0.5));
                beam.lookAt(stationWorldPos);
                beam.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
                
                scene.add(beam);
                communicationBeams.push({
                    mesh: beam,
                    lifetime: 0,
                    maxLifetime: isMobile ? 1 : 2
                });
                updateStats();
            }
        }

        // Update communication beams
        function updateCommunicationBeams() {
            for (let i = communicationBeams.length - 1; i >= 0; i--) {
                const beam = communicationBeams[i];
                beam.lifetime += 0.016 * speedMultiplier;
                beam.mesh.material.opacity = 0.6 * (1 - beam.lifetime / beam.maxLifetime);
                
                if (beam.lifetime >= beam.maxLifetime) {
                    scene.remove(beam.mesh);
                    communicationBeams.splice(i, 1);
                    updateStats();
                }
            }
        }

        // Get satellite applications
        function getSatelliteApplications() {
            switch(orbitType) {
                case 'LEO':
                    return "Earth Observation, Internet, Scientific Research";
                case 'MEO':
                    return "Navigation, Regional Communications";
                case 'GEO':
                    return "Weather Monitoring, TV Broadcasting, Global Communications";
                default:
                    return "Multiple Applications";
            }
        }

        // Setup controls
        function setupControls() {
            const controlsPanel = document.getElementById('controls-panel');
            const dragHandle = document.getElementById('drag-handle');
            
            // Toggle controls panel on mobile
            if (dragHandle) {
                dragHandle.addEventListener('click', () => {
                    controlsPanel.classList.toggle('collapsed');
                });
            }

            // Button event listeners
            document.getElementById('start-simulation').addEventListener('click', () => {
                isRunning = true;
                updateStatusIndicator();
                updateStats();
                markInteraction();
            });
            
            document.getElementById('pause-simulation').addEventListener('click', () => {
                isRunning = false;
                updateStatusIndicator();
                updateStats();
                markInteraction();
            });
            
            document.getElementById('add-satellite').addEventListener('click', () => {
                createSatellite();
                markInteraction();
            });
            
            document.getElementById('show-communication').addEventListener('click', () => {
                if (satellites.length > 0) {
                    const satellite = satellites[Math.floor(Math.random() * satellites.length)];
                    const station = groundStations[Math.floor(Math.random() * groundStations.length)];
                    establishCommunication(satellite, station);
                }
                markInteraction();
            });
            
            document.getElementById('reset-simulation').addEventListener('click', () => {
                satellites.forEach(sat => {
                    scene.remove(sat);
                    if (sat.userData.orbitPath) scene.remove(sat.userData.orbitPath);
                });
                satellites = [];
                
                communicationBeams.forEach(beam => scene.remove(beam.mesh));
                communicationBeams = [];
                
                orbitPaths.forEach(path => scene.remove(path));
                orbitPaths = [];
                
                for (let i = 0; i < CONFIG.SATELLITE_COUNT; i++) {
                    createSatellite();
                }
                updateStats();
                markInteraction();
            });
            
            document.getElementById('change-orbit').addEventListener('click', () => {
                const orbits = ['LEO', 'MEO', 'GEO'];
                const currentIndex = orbits.indexOf(orbitType);
                orbitType = orbits[(currentIndex + 1) % orbits.length];
                
                satellites.forEach((sat, index) => {
                    sat.userData.orbitType = orbitType;
                    sat.userData.name = getSatelliteName(orbitType);
                    sat.userData.applications = getSatelliteApplications();
                    sat.userData.inclination = getInclination(orbitType);
                    
                    const orbit = CONFIG.ORBITS[orbitType];
                    sat.userData.radius = orbit.radius;
                    sat.userData.baseSpeed = orbit.speed;
                    sat.userData.speed = orbit.speed * speedMultiplier * (isMobile ? 1.5 : 1);
                    
                    sat.children[0].material.color.set(CONFIG.COLORS[orbitType.toLowerCase()]);
                    sat.children[0].material.emissive.set(CONFIG.COLORS[orbitType.toLowerCase()]);
                    
                    if (sat.userData.orbitPath) {
                        scene.remove(sat.userData.orbitPath);
                    }
                    if (showOrbits) {
                        createOrbitPath(sat);
                    }
                });
                updateStats();
                markInteraction();
            });
            
            document.getElementById('speed-up').addEventListener('click', () => {
                speedMultiplier = 2;
                satellites.forEach(sat => {
                    sat.userData.speed = sat.userData.baseSpeed * speedMultiplier * (isMobile ? 1.5 : 1);
                });
                updateStats();
                markInteraction();
            });
            
            document.getElementById('speed-normal').addEventListener('click', () => {
                speedMultiplier = 1;
                satellites.forEach(sat => {
                    sat.userData.speed = sat.userData.baseSpeed * speedMultiplier * (isMobile ? 1.5 : 1);
                });
                updateStats();
                markInteraction();
            });
            
            document.getElementById('toggle-orbits').addEventListener('click', () => {
                showOrbits = !showOrbits;
                if (showOrbits) {
                    satellites.forEach(sat => {
                        if (!sat.userData.orbitPath) {
                            createOrbitPath(sat);
                        }
                    });
                } else {
                    satellites.forEach(sat => {
                        if (sat.userData.orbitPath) {
                            scene.remove(sat.userData.orbitPath);
                            sat.userData.orbitPath = null;
                        }
                    });
                }
                updateStats();
                markInteraction();
            });
            
            document.getElementById('toggle-clouds').addEventListener('click', () => {
                showClouds = !showClouds;
                clouds.visible = showClouds;
                updateStats();
                markInteraction();
            });
        }

        // Setup interaction listeners
        function setupInteractionListeners() {
            // Mark interaction on any user action
            document.addEventListener('click', markInteraction);
            document.addEventListener('touchstart', markInteraction);
            document.addEventListener('keydown', markInteraction);
            
            // Handle window resize
            window.addEventListener('resize', handleResize);
            
            // Handle orientation change
            window.addEventListener('orientationchange', () => {
                setTimeout(handleResize, 100);
            });
        }

        // Handle resize
        function handleResize() {
            const container = document.getElementById('simulation-container');
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        // Update status indicator
        function updateStatusIndicator() {
            const statusIndicator = document.querySelector('.status-indicator');
            const statusText = document.getElementById('status-text');
            if (statusIndicator && statusText) {
                statusIndicator.style.background = isRunning ? '#00ff00' : '#ff4757';
                statusIndicator.style.animation = isRunning ? 'pulse 2s infinite' : 'none';
                statusText.textContent = isRunning ? 'Simulation Active' : 'Simulation Paused';
            }
        }

        // Update statistics
        function updateStats() {
            document.getElementById('satellite-count').textContent = satellites.length;
            document.getElementById('orbit-type').textContent = orbitType;
            document.getElementById('sim-speed').textContent = speedMultiplier + 'x';
            document.getElementById('comm-links').textContent = communicationBeams.length;
        }

        // Mark user interaction
        function markInteraction() {
            hasInteracted = true;
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            if (isRunning) {
                earthGroup.rotation.y += 0.0005 * speedMultiplier;
                clouds.rotation.y += 0.0008 * speedMultiplier;
            }
            
            updateSatellites();
            updateCommunicationBeams();
            controls.update();
            renderer.render(scene, camera);
        }

        // Initialize on load
        window.addEventListener('DOMContentLoaded', init);
        
        // Prevent context menu on mobile
        document.addEventListener('contextmenu', (e) => {
            if (isMobile) e.preventDefault();
        });