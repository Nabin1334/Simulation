import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// --- CONFIGURATION ---
const CONFIG = {
  R: 5, // Earth Radius
  tilt: 11.5 * (Math.PI / 180), // The Magnetic Tilt
  fieldColor: 0x00ffff,
  particleColor: 0xffd700, // Gold solar particles
  lines: 50,
};

// --- GLOBAL VARIABLES ---
let scene, camera, renderer, controls;
let earthGroup, magneticGroup;
let atmosphere, particleSystem, core;
let lblMagN, lblTrueN;
let particleCount = 800;
let pData = [];
let time = 0;

// --- INITIALIZATION ---
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020205); // Deep space

  // Create camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(30, 0, 0);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Create controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // Get label elements
  lblMagN = document.getElementById("lbl-magn");
  lblTrueN = document.getElementById("lbl-truen");

  // Setup button (only one button exists in HTML)
  document.getElementById("toggleAtmosphereBtn").onclick = toggleAtmosphere;
  // If you add more buttons in HTML, add their event listeners here.

  // Create all visual elements
  createEarth();
  createMagneticField();
  createParticles();
  createCore();
  createLighting();

  // Add instructions
  addInstructions();

  // Start animation
  animate();
}

// --- EARTH CREATION ---
function createEarth() {
  earthGroup = new THREE.Group();
  scene.add(earthGroup);

  // Earth sphere
  const earthGeo = new THREE.SphereGeometry(CONFIG.R, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x1a5fcc,
    specular: 0x111111,
    shininess: 10,
    emissive: 0x0a3a8c,
    emissiveIntensity: 0.1,
  });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  earthGroup.add(earth);

  // Surface details
  const bumpGeo = new THREE.SphereGeometry(CONFIG.R + 0.02, 64, 64);
  const bumpMat = new THREE.MeshPhongMaterial({
    color: 0x2a7cdd,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
  });
  const bumpSurface = new THREE.Mesh(bumpGeo, bumpMat);
  earthGroup.add(bumpSurface);

  // Rotation Axis Line (Green - True North)
  const geoAxisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -CONFIG.R * 2.5, 0),
    new THREE.Vector3(0, CONFIG.R * 2.5, 0),
  ]);
  const geoAxisMat = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.5,
  });
  const geoAxis = new THREE.Line(geoAxisGeo, geoAxisMat);
  earthGroup.add(geoAxis);

  // Atmosphere
  const atmoGeo = new THREE.SphereGeometry(CONFIG.R + 0.5, 64, 64);
  const atmoMat = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });
  atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
  scene.add(atmosphere);
}

// --- MAGNETIC FIELD CREATION ---
function createMagneticField() {
  magneticGroup = new THREE.Group();
  earthGroup.add(magneticGroup);
  magneticGroup.rotation.z = CONFIG.tilt;

  // Magnetic Axis Line (Red - Magnetic North)
  const magAxisGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -CONFIG.R * 2.5, 0),
    new THREE.Vector3(0, CONFIG.R * 2.5, 0),
  ]);
  const magAxisMat = new THREE.LineBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.8,
  });
  const magAxis = new THREE.Line(magAxisGeo, magAxisMat);
  magneticGroup.add(magAxis);

  // Field lines
  createFieldLines();
}

// --- FIELD LINE GENERATION ---
function createFieldLine(L) {
  const points = [];
  const segments = 64;

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI;

    // Skip poles (singularity)
    if (theta < 0.05 || theta > 3.09) continue;

    const r = L * Math.pow(Math.sin(theta), 2);

    if (r < CONFIG.R) continue;

    const x = r * Math.sin(theta);
    const y = r * Math.cos(theta);
    const z = 0;

    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: CONFIG.fieldColor,
    transparent: true,
    opacity: 0.15,
  });
  return new THREE.Line(geometry, material);
}

function createFieldLines() {
  // Create field lines with varying densities
  for (let i = 0; i < CONFIG.lines; i++) {
    const L = CONFIG.R * (1.2 + Math.random() * 4);
    const line = createFieldLine(L);
    const rotation = Math.random() * Math.PI * 2;
    line.rotation.y = rotation;
    magneticGroup.add(line);
  }

  // Add a few dense field lines for better visibility
  for (let i = 0; i < 8; i++) {
    const L = CONFIG.R * (1.5 + i * 0.5);
    const line = createFieldLine(L);
    line.material.opacity = 0.3;
    line.rotation.y = (i / 8) * Math.PI * 2;
    magneticGroup.add(line);
  }
}

// --- PARTICLES CREATION ---
function createParticles() {
  const particleGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(particleCount * 3);

  // Create inner and outer radiation belts
  for (let i = 0; i < particleCount; i++) {
    const isInnerBelt = i < particleCount / 2;
    pData.push({
      L:
        CONFIG.R *
        (isInnerBelt ? 1.5 + Math.random() * 1 : 3 + Math.random() * 4),
      phi: Math.random() * Math.PI * 2,
      theta: Math.random() * Math.PI,
      speed: 0.005 + Math.random() * 0.01,
      colorMultiplier: isInnerBelt ? 1.2 : 0.8,
    });
  }

  particleGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(pPositions, 3)
  );

  const particleMat = new THREE.PointsMaterial({
    color: CONFIG.particleColor,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  particleSystem = new THREE.Points(particleGeo, particleMat);
  magneticGroup.add(particleSystem);
}

// --- CORE CREATION ---
function createCore() {
  const coreGeo = new THREE.SphereGeometry(CONFIG.R * 0.3, 32, 32);
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0xff5500,
    emissive: 0xff3300,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.7,
  });
  core = new THREE.Mesh(coreGeo, coreMat);
  earthGroup.add(core);
}

// --- LIGHTING ---
function createLighting() {
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(50, 10, 20);
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xff5500, 0.5, 100);
  pointLight.position.set(0, 0, 0);
  earthGroup.add(pointLight);
}

// --- INSTRUCTIONS ---
function addInstructions() {
  const instructions = document.createElement("div");
  instructions.id = "instructions";
  instructions.innerHTML = `
        <div>Controls:</div>
        <div>• Click & Drag: Rotate View</div>
        <div>• Scroll: Zoom In/Out</div>
        <div>• A: Toggle Atmosphere</div>
        <div>• Space: Toggle Auto-Rotate</div>
        <div>• R: Reset View</div>
    `;
  document.body.appendChild(instructions);
}

// --- ANIMATION ---
function animate() {
  requestAnimationFrame(animate);

  time += 0.016; // ~60 FPS

  // Earth rotation
  earthGroup.rotation.y += 0.002;

  // Core pulsation
  core.scale.setScalar(1 + 0.05 * Math.sin(time * 2));

  // Update particles
  updateParticles();

  // Atmosphere animation
  atmosphere.material.opacity = 0.1 + 0.05 * Math.sin(time * 0.5);

  // Field line animation
  animateFieldLines();

  // Update labels
  updateLabels();

  // Update controls and render
  controls.update();
  renderer.render(scene, camera);
}

function updateParticles() {
  const pos = particleSystem.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const p = pData[i];
    p.theta += p.speed;
    if (p.theta > Math.PI) p.theta = 0;

    const r = p.L * Math.pow(Math.sin(p.theta), 2);
    const x = r * Math.sin(p.theta) * Math.cos(p.phi);
    const z = r * Math.sin(p.theta) * Math.sin(p.phi);
    const y = r * Math.cos(p.theta);

    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    // Add some drift
    p.phi += 0.0001;
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;
}

function animateFieldLines() {
  magneticGroup.children.forEach((child, i) => {
    if (child.type === "Line") {
      child.material.opacity = 0.15 + 0.1 * Math.sin(time * 0.3 + i * 0.01);
    }
  });
}

// --- LABEL POSITIONING ---
function updateLabels() {
  const magTip = new THREE.Vector3(0, CONFIG.R * 2.5, 0);
  const magAxis = magneticGroup.children.find((child) => child.type === "Line");
  if (magAxis) {
    magTip.applyMatrix4(magAxis.matrixWorld);
  }

  const trueTip = new THREE.Vector3(0, CONFIG.R * 2.5, 0);
  const geoAxis = earthGroup.children.find((child) => child.type === "Line");
  if (geoAxis) {
    trueTip.applyMatrix4(geoAxis.matrixWorld);
  }

  [magTip, trueTip].forEach((vec, idx) => {
    vec.project(camera);
    const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(vec.y * 0.5) + 0.5) * window.innerHeight;
    const el = idx === 0 ? lblMagN : lblTrueN;

    if (vec.z > 1 || !el) {
      el.style.display = "none";
    } else {
      el.style.display = "block";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    }
  });
}

// --- EVENT HANDLERS ---
function toggleAtmosphere() {
  atmosphere.visible = !atmosphere.visible;
  // Optionally update button style if desired
}

function toggleAutoRotate() {
  controls.autoRotate = !controls.autoRotate;
}

function resetView() {
  controls.reset();
  camera.position.set(30, 0, 0);
  controls.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateLabels();
}

function onKeyDown(e) {
  switch (e.key.toLowerCase()) {
    case "a":
      toggleAtmosphere();
      break;
    case " ":
      toggleAutoRotate();
      e.preventDefault(); // Prevent spacebar from scrolling
      break;
    case "r":
      resetView();
      break;
  }
}

// --- INITIALIZE AND START ---
// Add event listeners
window.addEventListener("resize", onWindowResize);
document.addEventListener("keydown", onKeyDown);

// Start the application when DOM is loaded
window.addEventListener("DOMContentLoaded", init);

// Console instructions
console.log(
  "Controls: A - Toggle Atmosphere | Space - Toggle Auto-Rotation | R - Reset View"
);
