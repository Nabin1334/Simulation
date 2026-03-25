import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js";

// --- PLANET DATA ---
const PLANETS = {
  sun: {
    name: "Sun",
    gravity: -274.0,
    color: 0xffaa00,
    emissive: 0xff5500,
    floorColor: 0xffaa33,
    skyColor: 0x1a0f00,
    bounce: 0.2,
    size: 3.0,
    fact: "The Sun's gravity is 28 times stronger than Earth's! You would weigh 28 times more!",
    emoji: "☀️",
  },
  jupiter: {
    name: "Jupiter",
    gravity: -24.8,
    color: 0xd4a35f,
    emissive: 0x5a3e1a,
    floorColor: 0x8b5a2b,
    skyColor: 0x1a1108,
    bounce: 0.4,
    size: 2.5,
    fact: "Jupiter is so big that 1300 Earths could fit inside it! Its gravity is very strong.",
    emoji: "🪐",
  },
  earth: {
    name: "Earth",
    gravity: -9.81,
    color: 0x2288ff,
    emissive: 0x114488,
    floorColor: 0x2a5a2a,
    skyColor: 0x0a1a2a,
    bounce: 0.7,
    size: 2.0,
    fact: "Earth's gravity is just right for life! It's called 1g - the standard for all planets.",
    emoji: "🌍",
  },
  venus: {
    name: "Venus",
    gravity: -8.87,
    color: 0xffaa33,
    emissive: 0x884411,
    floorColor: 0xaa5511,
    skyColor: 0x2a1a0a,
    bounce: 0.6,
    size: 1.9,
    fact: "Venus has almost the same gravity as Earth, but it's super hot - hot enough to melt lead!",
    emoji: "🟡",
  },
  mars: {
    name: "Mars",
    gravity: -3.71,
    color: 0xff6633,
    emissive: 0x552200,
    floorColor: 0x8b4513,
    skyColor: 0x1a0a05,
    bounce: 0.75,
    size: 1.7,
    fact: "Mars has only 38% of Earth's gravity. You could jump almost 3 times higher here!",
    emoji: "🔴",
  },
  moon: {
    name: "Moon",
    gravity: -1.62,
    color: 0xcccccc,
    emissive: 0x333333,
    floorColor: 0x555555,
    skyColor: 0x080808,
    bounce: 0.85,
    size: 1.5,
    fact: "Moon gravity is 1/6 of Earth's! Astronauts can jump really high and feel super light!",
    emoji: "🌙",
  },
};

// --- SIMULATION VARIABLES ---
let currentPlanet = "sun";
let gravity = PLANETS.sun.gravity;
let bounceFactor = PLANETS.sun.bounce;
let velocity = 0;
let position = 15;
let isFalling = false;
let ballRadius = 1.2;
let startHeight = 15;

// Detect mobile device
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  ) || window.innerWidth <= 768;

// --- THREE.JS SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(PLANETS.sun.skyColor);

// Camera - adjust for mobile
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

if (isMobile) {
  camera.position.set(8, 8, 18);
} else {
  camera.position.set(10, 10, 25);
}
camera.lookAt(0, 8, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
document.body.appendChild(renderer.domElement);

// Controls - optimize for mobile
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 8, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minDistance = isMobile ? 12 : 15;
controls.maxDistance = isMobile ? 30 : 40;
controls.enableZoom = true;
controls.enablePan = !isMobile; // Disable pan on mobile for better touch control
controls.enableRotate = true;
controls.rotateSpeed = isMobile ? 0.5 : 1.0;

// --- LIGHTS ---
// Ambient light
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

// Main directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = isMobile ? 512 : 1024;
dirLight.shadow.mapSize.height = isMobile ? 512 : 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 40;
dirLight.shadow.camera.left = -15;
dirLight.shadow.camera.right = 15;
dirLight.shadow.camera.top = 15;
dirLight.shadow.camera.bottom = -15;
scene.add(dirLight);

// Fill light
const fillLight = new THREE.PointLight(0x4466ff, 0.4);
fillLight.position.set(-10, 10, 10);
scene.add(fillLight);

// --- BACKGROUND STARS ---
const starsGeometry = new THREE.BufferGeometry();
const starsCount = isMobile ? 500 : 1000;
const starsPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i += 3) {
  starsPositions[i] = (Math.random() - 0.5) * 200;
  starsPositions[i + 1] = (Math.random() - 0.5) * 200;
  starsPositions[i + 2] = (Math.random() - 0.5) * 200;
}

starsGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starsPositions, 3),
);
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// --- FLOOR (Colored to match planet) ---
const floorGeometry = new THREE.CircleGeometry(30, 64);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: PLANETS.sun.floorColor,
  roughness: 0.6,
  metalness: 0.1,
  emissive: 0x000000,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Decorative rings on floor - simplify for mobile
if (!isMobile) {
  const ringGeometry = new THREE.TorusGeometry(5, 0.1, 16, 100);
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x44aaff,
    emissive: 0x112244,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  scene.add(ring);

  const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring2.scale.set(0.7, 0.7, 0.7);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = 0.05;
  scene.add(ring2);
}

// --- THE BALL (Solid, no rotation) ---
const ballGroup = new THREE.Group();

// Main ball - solid color, no rotation
const ballGeometry = new THREE.SphereGeometry(
  ballRadius,
  isMobile ? 32 : 64,
  isMobile ? 32 : 64,
);
const ballMaterial = new THREE.MeshStandardMaterial({
  color: 0xff6600,
  emissive: 0x331100,
  roughness: 0.3,
  metalness: 0.1,
});
const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
ballMesh.castShadow = true;
ballMesh.receiveShadow = true;
ballGroup.add(ballMesh);

// Simple highlight (non-rotating)
const highlightGeometry = new THREE.SphereGeometry(ballRadius * 0.3, 16, 16);
const highlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0x442200,
  roughness: 0.2,
});
const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
highlight.position.set(0.4, 0.4, 0.4);
ballGroup.add(highlight);

ballGroup.position.set(0, startHeight, 0);
scene.add(ballGroup);

// --- GRAVITY VISUALIZATION (Path line) ---
const linePoints = [];
for (let i = 0; i <= 20; i++) {
  linePoints.push(new THREE.Vector3(0, i, 0));
}
const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x44aaff,
  transparent: true,
  opacity: 0.3,
});
const pathLine = new THREE.Line(lineGeometry, lineMaterial);
scene.add(pathLine);

// Height markers - fewer on mobile
const markerCount = isMobile ? 3 : 5;
const markerMaterial = new THREE.MeshStandardMaterial({
  color: 0x44aaff,
  emissive: 0x112244,
});
for (let i = 1; i <= markerCount; i++) {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8),
    markerMaterial,
  );
  marker.position.set(0, i * (15 / markerCount), 0);
  scene.add(marker);
}

// --- UI ELEMENTS ---
const gravityDisplay = document.getElementById("gravity-display");
const speedDisplay = document.getElementById("speed-display");
const heightDisplay = document.getElementById("height-display");
const factIcon = document.getElementById("fact-icon");
const factText = document.getElementById("fact-text");
const planetCards = document.querySelectorAll(".planet-card");
const dropBtn = document.getElementById("drop-btn");
const resetBtn = document.getElementById("reset-btn");

// --- FUNCTIONS ---
function setPlanet(planetKey) {
  const data = PLANETS[planetKey];
  if (!data) return;

  currentPlanet = planetKey;
  gravity = data.gravity;
  bounceFactor = data.bounce;

  // Update UI
  gravityDisplay.textContent = Math.abs(gravity).toFixed(1);
  factIcon.textContent = data.emoji;
  factText.innerHTML = `<span class="fact-highlight">Did you know?</span> ${data.fact}`;

  // Update scene colors
  scene.background.setHex(data.skyColor);
  floor.material.color.setHex(data.floorColor);

  // Update active card
  planetCards.forEach((card) => {
    card.classList.remove("active");
    if (card.dataset.planet === planetKey) {
      card.classList.add("active");
    }
  });

  resetBall();
}

function dropBall() {
  if (!isFalling) {
    isFalling = true;
    velocity = 0.2; // Small initial push
    position = ballGroup.position.y;

    // Visual feedback
    ballGroup.scale.set(1.1, 0.9, 1.1);
    setTimeout(() => {
      ballGroup.scale.set(1, 1, 1);
    }, 100);
  }
}

function resetBall() {
  isFalling = false;
  velocity = 0;
  ballGroup.position.y = startHeight;
  ballGroup.scale.set(1, 1, 1);
  // No rotation to reset
}

// --- EVENT LISTENERS ---
planetCards.forEach((card) => {
  card.addEventListener("click", () => {
    setPlanet(card.dataset.planet);
  });

  // Touch support for mobile
  card.addEventListener("touchstart", (e) => {
    e.preventDefault();
    setPlanet(card.dataset.planet);
  });
});

dropBtn.addEventListener("click", dropBall);
dropBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dropBall();
});

resetBtn.addEventListener("click", resetBall);
resetBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  resetBall();
});

// Keyboard controls (desktop only)
if (!isMobile) {
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      dropBall();
    } else if (e.code === "KeyR") {
      resetBall();
    }
  });
}

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
  const delta = Math.min(clock.getDelta(), 0.1);

  if (isFalling) {
    // Apply gravity
    velocity += gravity * delta;
    position += velocity * delta;

    // Update ball position
    ballGroup.position.y = position;

    // NO ROTATION - ball stays solid

    // Squash and stretch
    const speed = Math.abs(velocity);
    const stretch = Math.min(1 + speed * 0.03, 1.2);
    const squash = 1 / Math.sqrt(stretch);
    ballGroup.scale.set(squash, stretch, squash);

    // Check collision with floor
    if (position <= ballRadius) {
      position = ballRadius;
      velocity = -velocity * bounceFactor;

      // Bounce effect
      ballGroup.scale.set(1.3, 0.7, 1.3);
      setTimeout(() => {
        ballGroup.scale.set(1, 1, 1);
      }, 100);

      // Stop if very slow
      if (Math.abs(velocity) < 0.2) {
        isFalling = false;
        velocity = 0;
        ballGroup.scale.set(1, 1, 1);
      }
    }

    // Update displays
    speedDisplay.textContent = Math.abs(velocity).toFixed(1);
    heightDisplay.textContent = position.toFixed(1);
  } else {
    // Idle animation - just gentle floating, no rotation
    ballGroup.position.y = startHeight + Math.sin(Date.now() * 0.002) * 0.2;
    // NO ROTATION

    speedDisplay.textContent = "0.0";
    heightDisplay.textContent = ballGroup.position.y.toFixed(1);
  }

  // Rotate stars slowly
  stars.rotation.y += 0.0001;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener("resize", () => {
  const newIsMobile = window.innerWidth <= 768;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Adjust camera position based on new screen size
  if (newIsMobile) {
    camera.position.set(8, 8, 18);
  } else {
    camera.position.set(10, 10, 25);
  }
  camera.lookAt(0, 8, 0);

  controls.minDistance = newIsMobile ? 12 : 15;
  controls.maxDistance = newIsMobile ? 30 : 40;
  controls.enablePan = !newIsMobile;
});

// Initialize with Sun
setPlanet("sun");

// Start animation
animate();
