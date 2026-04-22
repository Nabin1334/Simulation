import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- PLANET DATA ---
const SYSTEMS = {
    EARTH:   { g: -9.81, color: 0x22aaff, floor: 0x2a2a2a, sky: 0xa0c0ff, bounce: 0.7 },
    MOON:    { g: -1.62, color: 0x888888, floor: 0x555555, sky: 0x000000, bounce: 0.7 },
    MARS:    { g: -3.71, color: 0xff4400, floor: 0x8b4513, sky: 0xffccaa, bounce: 0.7 },
    JUPITER: { g: -24.79, color: 0xd4a35f, floor: 0x8B7355, sky: 0x443322, bounce: 0.5 },
    PLUTO:   { g: -0.62, color: 0xaaddff, floor: 0x334455, sky: 0x000510, bounce: 0.8 }
};

// --- PHYSICS VARS ---
let currentGravity = -9.81;
let bounceFactor = 0.7;
let velocity = new THREE.Vector3(0, 0, 0);
let isSimulating = true;
const START_HEIGHT = 20;
const BALL_RADIUS = 1.5;

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(SYSTEMS.EARTH.sky);
scene.fog = new THREE.Fog(SYSTEMS.EARTH.sky, 20, 100);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

// Responsive camera positioning
function updateCameraPosition() {
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    if (isSmallMobile) {
        camera.position.set(0, 10, 35);
    } else if (isMobile) {
        camera.position.set(0, 11, 38);
    } else {
        camera.position.set(0, 12, 40);
    }
}

updateCameraPosition();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = true;

// Mobile-friendly touch controls
if ('ontouchstart' in window) {
    controls.touchAction = 'none';
    controls.enableRotate = true;
    controls.enableDamping = true;
}

// --- LIGHTS ---
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(10, 30, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// --- MESHES ---

// Floor
const floorMat = new THREE.MeshStandardMaterial({ color: SYSTEMS.EARTH.floor, roughness: 0.8 });
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), floorMat);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// Grid
const grid = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
grid.material.opacity = 0.15;
grid.material.transparent = true;
scene.add(grid);

// Ball
const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 64, 64);
const ballMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.1, 
    metalness: 0.2 
});
const ball = new THREE.Mesh(ballGeo, ballMat);
ball.castShadow = true;
scene.add(ball);

// Initialize Ball Pos
ball.position.set(0, START_HEIGHT, 0);

// --- FUNCTIONS ---
window.setSystem = function(sysKey) {
    const data = SYSTEMS[sysKey];
    
    // Update Physics
    currentGravity = data.g;
    bounceFactor = data.bounce;
    
    // Update UI
    document.getElementById('planet-name').innerText = sysKey;
    document.getElementById('gravity-val').innerText = Math.abs(data.g).toFixed(2);

    // Update Visuals
    scene.background.setHex(data.sky);
    scene.fog.color.setHex(data.sky);
    floorMesh.material.color.setHex(data.floor);
    
    // Reset Ball
    resetBall();
}

window.resetBall = function() {
    ball.position.set(0, START_HEIGHT, 0);
    velocity.set(0, 0, 0);
    isSimulating = true;
}

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    let dt = Math.min(clock.getDelta(), 0.1); // Limit dt

    if (isSimulating) {
        // v = v + g * t
        velocity.y += currentGravity * dt;

        // p = p + v * t
        ball.position.y += velocity.y * dt;

        // Collision
        if (ball.position.y <= BALL_RADIUS) {
            ball.position.y = BALL_RADIUS;
            
            // Bounce
            velocity.y = -velocity.y * bounceFactor;

            // Stop if too slow
            if (Math.abs(velocity.y) < 0.2 && Math.abs(currentGravity) > 1.0) {
                velocity.y = 0;
                isSimulating = false; // Stop sim to save resources
            } else if (Math.abs(velocity.y) < 0.05) {
                // For low gravity planets, threshold must be lower
                velocity.y = 0;
                isSimulating = false;
            }
        }
    }

    // Squash/Stretch effect (Procedural Animation)
    // When moving fast, stretch Y, squash X/Z
    // When hitting ground (velocity reversed), squash Y, stretch X/Z
    // Simple visual hack based on velocity
    if (isSimulating) {
        const speed = Math.abs(velocity.y);
        const stretch = 1 + (speed * 0.02); 
        const squash = 1 / Math.sqrt(stretch); // preserve volume
        ball.scale.set(squash, stretch, squash);
    } else {
        ball.scale.set(1, 1, 1);
    }

    controls.update();
    renderer.render(scene, camera);
}

// --- EVENT LISTENERS ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraPosition();
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') window.resetBall();
});

// Start animation loop
animate();