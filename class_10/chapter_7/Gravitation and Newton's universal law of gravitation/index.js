 import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


    
    // --- PHYSICS CONFIGURATION ---
    const PHYSICS = {
        G: 1.5,                    // Gravitational constant
        sunMass: 5000,             // Initial sun mass
        earthMass: 10,             // Initial earth mass
        initDist: 120,             // Initial distance
        dt: 0.015,                 // Physics time step
        timeScale: 1.0,            // Simulation speed
        minDistance: 50,           // Minimum orbital distance
        maxDistance: 500           // Maximum orbital distance
    };

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 80, 250);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const loader = new THREE.TextureLoader();

    // --- UNIVERSE BACKGROUND ---
    const starGeo = new THREE.SphereGeometry(1000, 64, 64);
    const starMat = new THREE.MeshBasicMaterial({
        map: loader.load('https://threejs.org/examples/textures/planets/stars.jpg'),
        side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(starGeo, starMat));

    // --- SUN CREATION ---
    const sunGroup = new THREE.Group();
    scene.add(sunGroup);

    const sunGeo = new THREE.SphereGeometry(12, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({
        map: loader.load('https://threejs.org/examples/textures/lava/lavatile.jpg'),
        color: 0xffddaa
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    const glowMat = new THREE.SpriteMaterial({
        map: loader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png'),
        color: 0xffaa00,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const sunGlow = new THREE.Sprite(glowMat);
    sunGlow.scale.set(100, 100, 1);
    sunGroup.add(sunGlow);

    const sunLight = new THREE.PointLight(0xffffff, 5, 2000, 0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    scene.add(new THREE.AmbientLight(0x111111));

    // --- EARTH CREATION ---
    const earthOrbitGroup = new THREE.Group();
    scene.add(earthOrbitGroup);

    const earthTiltGroup = new THREE.Group();
    earthTiltGroup.rotation.z = 23.5 * (Math.PI / 180);
    earthOrbitGroup.add(earthTiltGroup);

    const earthGeo = new THREE.SphereGeometry(5, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
        map: loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
        bumpMap: loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
        bumpScale: 0.15,
        specularMap: loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
        roughness: 0.6,
        metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthTiltGroup.add(earthMesh);

    const cloudGeo = new THREE.SphereGeometry(5.1, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
        map: loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png'),
        transparent: true,
        opacity: 0.6,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthTiltGroup.add(cloudMesh);

    // Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(5.35, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        uniforms: { 
            c: { type: "f", value: 0.6 },
            p: { type: "f", value: 4.0 },
            glowColor: { type: "c", value: new THREE.Color(0x3399ff) },
            viewVector: { type: "v3", value: camera.position }
        },
        vertexShader: `
            uniform vec3 viewVector;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize( normalMatrix * normal );
                vec3 vNormel = normalize( normalMatrix * viewVector );
                intensity = pow( c - dot(vNormal, vNormel), p );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4( glow, 1.0 );
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthTiltGroup.add(atmosMesh);

    // --- PHYSICS VARIABLES ---
    let r_vec = new THREE.Vector3();
    let pos = new THREE.Vector3(PHYSICS.initDist, 0, 0);
    let vel = new THREE.Vector3();
    let orbitPeriod = 0;
    let orbitTimer = 0;
    let lastAngle = 0;
    let totalForce = 0;

    // Store initial state for reset
    const initialState = {
        sunMass: PHYSICS.sunMass,
        earthMass: PHYSICS.earthMass,
        distance: PHYSICS.initDist,
        timeScale: PHYSICS.timeScale
    };

    // --- UI ELEMENTS ---
    const uiElements = {
        sunMass: document.getElementById('val-m1'),
        earthMass: document.getElementById('val-m2'),
        distance: document.getElementById('val-r'),
        velocity: document.getElementById('val-v'),
        force: document.getElementById('val-f'),
        period: document.getElementById('val-period'),
        sunMassValue: document.getElementById('sun-mass-value'),
        earthMassValue: document.getElementById('earth-mass-value'),
        distanceValue: document.getElementById('distance-value'),
        timeValue: document.getElementById('time-value'),
        forceIndicator: document.getElementById('force-indicator-bar'),
        sunImpact: document.getElementById('sun-impact'),
        earthImpact: document.getElementById('earth-impact'),
        distanceImpact: document.getElementById('distance-impact')
    };

    // --- PHYSICS FUNCTIONS ---
    function calculateOrbitalVelocity() {
        // Circular orbit velocity: v = √(G * M / r)
        return Math.sqrt((PHYSICS.G * PHYSICS.sunMass) / pos.length());
    }

    function updateOrbitParameters() {
        const r = pos.length();
        const currentVelocity = vel.length();
        
        // Calculate orbital period for circular/elliptical orbits
        if (r > 0 && currentVelocity > 0) {
            // Semi-major axis approximation
            const specificEnergy = (currentVelocity * currentVelocity) / 2 - (PHYSICS.G * PHYSICS.sunMass) / r;
            const semiMajorAxis = -PHYSICS.G * PHYSICS.sunMass / (2 * specificEnergy);
            orbitPeriod = 2 * Math.PI * Math.sqrt(Math.abs(semiMajorAxis * semiMajorAxis * semiMajorAxis) / (PHYSICS.G * PHYSICS.sunMass));
        }
        
        // Update orbit timer
        const currentAngle = Math.atan2(pos.z, pos.x);
        const angleDiff = Math.abs(currentAngle - lastAngle);
        if (angleDiff > 0.1) { // Detect significant movement
            orbitTimer += PHYSICS.dt * PHYSICS.timeScale;
            lastAngle = currentAngle;
        }
        
        // Calculate gravitational force
        totalForce = (PHYSICS.G * PHYSICS.sunMass * PHYSICS.earthMass) / (r * r);
        
        // Update force indicator
        const maxForce = (PHYSICS.G * 20000 * 200) / (50 * 50); // Maximum possible force
        const forceRatio = Math.min(totalForce / maxForce, 1);
        uiElements.forceIndicator.style.width = `${forceRatio * 100}%`;
        
        // Update UI
        uiElements.sunMass.textContent = `${PHYSICS.sunMass} units`;
        uiElements.earthMass.textContent = `${PHYSICS.earthMass} units`;
        uiElements.distance.textContent = `${r.toFixed(1)} units`;
        uiElements.velocity.textContent = `${currentVelocity.toFixed(2)} u/s`;
        uiElements.force.textContent = `${totalForce.toFixed(2)} N`;
        uiElements.period.textContent = orbitPeriod > 0 ? `${orbitPeriod.toFixed(1)} s` : 'Calculating...';
        
        // Update impact indicators
        const baseSunMass = initialState.sunMass;
        const baseEarthMass = initialState.earthMass;
        const baseDistance = initialState.distance;
        
        uiElements.sunImpact.textContent = `×${(PHYSICS.sunMass / baseSunMass).toFixed(2)}`;
        uiElements.earthImpact.textContent = `×${(PHYSICS.earthMass / baseEarthMass).toFixed(2)}`;
        uiElements.distanceImpact.textContent = `×${((baseDistance * baseDistance) / (r * r)).toFixed(2)}`;
    }

    function applyGravity() {
        // Calculate gravitational force
        r_vec.subVectors(new THREE.Vector3(0, 0, 0), pos);
        const r = r_vec.length();
        
        const forceMagnitude = (PHYSICS.G * PHYSICS.sunMass * PHYSICS.earthMass) / (r * r);
        r_vec.normalize();
        const acceleration = r_vec.multiplyScalar(forceMagnitude / PHYSICS.earthMass);

        // Apply physics with time scaling
        const scaledDt = PHYSICS.dt * PHYSICS.timeScale;
        vel.add(acceleration.multiplyScalar(scaledDt));
        pos.add(vel.clone().multiplyScalar(scaledDt));
    }

    function updateVisualScales() {
        // Update sun scale based on mass (cube root for volume)
        const sunScale = Math.pow(PHYSICS.sunMass / initialState.sunMass, 1/3);
        sunMesh.scale.set(sunScale, sunScale, sunScale);
        sunGlow.scale.set(100 * sunScale, 100 * sunScale, 1);
        sunLight.intensity = 5 * (PHYSICS.sunMass / initialState.sunMass);
        
        // Update earth scale based on mass
        const earthScale = Math.pow(PHYSICS.earthMass / initialState.earthMass, 1/3);
        earthMesh.scale.set(earthScale, earthScale, earthScale);
        cloudMesh.scale.set(earthScale, earthScale, earthScale);
        atmosMesh.scale.set(earthScale, earthScale, earthScale);
    }

    function setCircularOrbit() {
        const vCirc = calculateOrbitalVelocity();
        const perpendicular = new THREE.Vector3(-pos.z, 0, pos.x).normalize();
        vel.copy(perpendicular.multiplyScalar(vCirc));
    }

    function setEllipticalOrbit() {
        const vCirc = calculateOrbitalVelocity();
        const vElliptical = vCirc * 0.7; // 70% of circular velocity for elliptical orbit
        const perpendicular = new THREE.Vector3(-pos.z, 0, pos.x).normalize();
        vel.copy(perpendicular.multiplyScalar(vElliptical));
    }

    function resetSimulation() {
        PHYSICS.sunMass = initialState.sunMass;
        PHYSICS.earthMass = initialState.earthMass;
        PHYSICS.initDist = initialState.distance;
        PHYSICS.timeScale = initialState.timeScale;
        
        // Reset position and velocity
        pos.set(PHYSICS.initDist, 0, 0);
        setCircularOrbit();
        
        // Reset sliders
        document.getElementById('sun-mass').value = PHYSICS.sunMass;
        document.getElementById('earth-mass').value = PHYSICS.earthMass;
        document.getElementById('distance').value = PHYSICS.initDist;
        document.getElementById('time-scale').value = 10;
        
        // Update UI
        updateSliders();
        updateVisualScales();
        orbitTimer = 0;
        lastAngle = 0;
    }

    function setRealisticValues() {
        PHYSICS.sunMass = 330000;  // Scaled real values
        PHYSICS.earthMass = 1;
        PHYSICS.initDist = 150;
        
        // Update sliders
        document.getElementById('sun-mass').value = PHYSICS.sunMass;
        document.getElementById('earth-mass').value = PHYSICS.earthMass;
        document.getElementById('distance').value = PHYSICS.initDist;
        
        // Reset position
        pos.set(PHYSICS.initDist, 0, 0);
        setCircularOrbit();
        
        updateSliders();
        updateVisualScales();
    }

    function updateSliders() {
        uiElements.sunMassValue.textContent = PHYSICS.sunMass;
        uiElements.earthMassValue.textContent = PHYSICS.earthMass;
        uiElements.distanceValue.textContent = PHYSICS.initDist;
        uiElements.timeValue.textContent = `${PHYSICS.timeScale.toFixed(1)}x`;
    }

    // --- EVENT HANDLERS ---
    function setupEventListeners() {
        // Mass sliders
        document.getElementById('sun-mass').addEventListener('input', (e) => {
            PHYSICS.sunMass = parseInt(e.target.value);
            updateSliders();
            updateVisualScales();
            setCircularOrbit(); // Maintain circular orbit with new mass
        });
        
        document.getElementById('earth-mass').addEventListener('input', (e) => {
            PHYSICS.earthMass = parseInt(e.target.value);
            updateSliders();
            updateVisualScales();
        });
        
        // Distance slider
        document.getElementById('distance').addEventListener('input', (e) => {
            PHYSICS.initDist = parseInt(e.target.value);
            updateSliders();
            
            // Update position while maintaining direction
            const direction = pos.clone().normalize();
            pos.copy(direction.multiplyScalar(PHYSICS.initDist));
            setCircularOrbit();
        });
        
        // Time scale slider
        document.getElementById('time-scale').addEventListener('input', (e) => {
            const sliderValue = parseInt(e.target.value);
            PHYSICS.timeScale = sliderValue / 10;
            updateSliders();
        });
        
        // Control buttons
        document.getElementById('circular-btn').addEventListener('click', setCircularOrbit);
        document.getElementById('elliptical-btn').addEventListener('click', setEllipticalOrbit);
        document.getElementById('reset-btn').addEventListener('click', resetSimulation);
        document.getElementById('real-values-btn').addEventListener('click', setRealisticValues);
        
        // Panel toggle
        document.getElementById('toggle-panel').addEventListener('click', () => {
            const panel = document.getElementById('ui-panel');
            panel.classList.toggle('ui-collapsed');
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);
        
        // Apply physics
        applyGravity();
        
        // Update orbit parameters
        updateOrbitParameters();
        
        // Update visuals
        earthOrbitGroup.position.copy(pos);
        earthMesh.rotation.y += 0.002 * PHYSICS.timeScale;
        cloudMesh.rotation.y += 0.0025 * PHYSICS.timeScale;
        sunMesh.rotation.y += 0.001 * PHYSICS.timeScale;
        
        // Update atmosphere shader
        atmosMesh.material.uniforms.viewVector.value = 
            new THREE.Vector3().subVectors(camera.position, earthOrbitGroup.position);
        
        // Update controls
        controls.update();
        renderer.render(scene, camera);
    }

    // --- INITIALIZATION ---
    function init() {
        // Set initial velocity for circular orbit
        setCircularOrbit();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial slider update
        updateSliders();
        updateVisualScales();
        
        // Start animation
        animate();
    }

    // Start everything
    init();