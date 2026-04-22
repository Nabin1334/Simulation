// ==================== CONFIGURATION ====================
let settings = {
  flashRate: 4.1,
  intensity: 12.5,
  branches: 5,
  audioEnabled: true,
  stormActive: false,
};

let strikeCount = 0;
let lastStrikeTime = 0;
let shakeIntensity = 0;
let lightningPool = [];
let rainSystem = null;
let audioStarted = false; // Persistent sound control

const thunderAudio = new Audio("thundersound.mp3");
thunderAudio.loop = true; // Loop for continuous rumble
thunderAudio.load();

// ==================== SCENE SETUP ====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.008); // Slightly denser fog for atmosphere

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 40, 110);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// ACESFilmic gives that high-contrast cinematic look from your photo
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({
    color: 0x020202,
    roughness: 0.1,
    metalness: 0.5,
  }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -15;
scene.add(ground);

const ambient = new THREE.AmbientLight(0xffffff, 0.02);
scene.add(ambient);

// ==================== RAIN SYSTEM ====================
function initRain() {
  const geo = new THREE.BufferGeometry();
  const count = 10000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    pos[i] = (Math.random() - 0.5) * 500;
    pos[i + 1] = Math.random() * 200;
    pos[i + 2] = (Math.random() - 0.5) * 500;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x555555,
    size: 0.1,
    transparent: true,
    opacity: 0,
  });
  rainSystem = new THREE.Points(geo, mat);
  scene.add(rainSystem);
}

// ==================== CLEANER CLOUD GENERATION ====================
// Replaced smooth spheres with high-density clusters
function createCloudGroup(xOffset) {
  const group = new THREE.Group();
  // MeshLambert is better for reactive lighting
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0.8,
  });

  for (let i = 0; i < 40; i++) {
    const size = Math.random() * 5 + 3;
    const part = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), cloudMat);
    part.position.set(
      xOffset + (Math.random() - 0.5) * 35,
      45 + (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 25,
    );
    group.add(part);
  }
  scene.add(group);
  return cloudMat;
}

const cloudMatL = createCloudGroup(-40);
const cloudMatR = createCloudGroup(40);

// ==================== LIGHTNING PHYSICS ====================
function generateStrike(isMega = false) {
  if (document.hidden) return;

  const group = new THREE.Group();
  const startX = (Math.random() > 0.5 ? -40 : 40) + (Math.random() - 0.5) * 10;
  const start = new THREE.Vector3(startX, 45, 0);
  const end = new THREE.Vector3(
    startX + (Math.random() - 0.5) * 30,
    -15,
    (Math.random() - 0.5) * 20,
  );

  const pts = [];
  let curr = start.clone();
  pts.push(curr.clone());

  const segments = 22;
  for (let i = 1; i <= segments; i++) {
    curr.lerp(end, i / segments);
    curr.x += (Math.random() - 0.5) * (isMega ? 15 : 8);
    curr.z += (Math.random() - 0.5) * (isMega ? 15 : 8);
    pts.push(curr.clone());

    if (Math.random() < settings.branches / 25 && i < 18) {
      const bPts = [
        curr.clone(),
        curr
          .clone()
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 15,
              -12,
              (Math.random() - 0.5) * 15,
            ),
          ),
      ];
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(bPts),
          new THREE.LineBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.3,
          }),
        ),
      );
    }
  }

  // Core white bolt
  const bolt = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0xffffff }),
  );
  group.add(bolt);

  // Cyan plasma glow for cleaner visuals
  const glow = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts),
      20,
      isMega ? 1.0 : 0.3,
      6,
      false,
    ),
    new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.5,
    }),
  );
  group.add(glow);

  const light = new THREE.PointLight(0x4fc3f7, 0, 400);
  light.position.copy(end).y += 20;
  group.add(light);

  scene.add(group);

  // SOUND LOGIC: Start once, then persistent
  if (settings.audioEnabled && !audioStarted) {
    thunderAudio.play().catch((e) => console.log("Interaction required"));
    audioStarted = true;
  }

  lightningPool.push({
    group,
    light,
    created: Date.now(),
    life: isMega ? 800 : 400,
    maxI: isMega ? 100 : 40,
    cloudSide: startX < 0 ? cloudMatL : cloudMatR,
  });

  strikeCount++;
  document.getElementById("stat-count").textContent = strikeCount;
  document.getElementById("stat-status").textContent = isMega
    ? "Mega"
    : "Normal";

  const temp = Math.floor(28000 + Math.random() * 5000);
  const volt = (isMega ? 1.2 : 0.8 + Math.random() * 0.3).toFixed(1);
  document.getElementById("stat-temp").textContent =
    temp.toLocaleString() + "°C";
  document.getElementById("stat-volt").textContent = volt + " Billion V";

  shakeIntensity = isMega ? 3.0 : 0.6;
}

// ==================== UI LISTENERS ====================
document.getElementById("flashRate").oninput = (e) => {
  settings.flashRate = e.target.value;
  document.getElementById("v-rate").textContent = e.target.value;
};
document.getElementById("intensity").oninput = (e) => {
  settings.intensity = e.target.value;
  document.getElementById("v-int").textContent = e.target.value;
};
document.getElementById("branches").oninput = (e) => {
  settings.branches = e.target.value;
  document.getElementById("v-branch").textContent = e.target.value;
};
document.getElementById("strike-btn").onclick = () => generateStrike();
document.getElementById("mega-btn").onclick = () => generateStrike(true);

document.getElementById("audio-toggle").onclick = function () {
  settings.audioEnabled = !settings.audioEnabled;
  this.classList.toggle("active");

  if (settings.audioEnabled) {
    this.textContent = "🔊 Sound On";
    thunderAudio.play();
  } else {
    this.textContent = "🔇 Sound Off";
    thunderAudio.pause();
  }
};

document.getElementById("storm-toggle").onclick = function () {
  settings.stormActive = !settings.stormActive;
  this.classList.toggle("active");
  this.textContent = settings.stormActive ? "🌧️ Rain On" : "🌧️ Rain Off";
  rainSystem.material.opacity = settings.stormActive ? 0.4 : 0;
};

// ==================== MAIN LOOP ====================
initRain();

function animate() {
  requestAnimationFrame(animate);
  const now = Date.now();

  if (now - lastStrikeTime > 1000 / settings.flashRate) {
    generateStrike(Math.random() > 0.95);
    lastStrikeTime = now;
  }

  for (let i = lightningPool.length - 1; i >= 0; i--) {
    const item = lightningPool[i];
    const p = (now - item.created) / item.life;
    if (p >= 1) {
      scene.remove(item.group);
      item.cloudSide.emissiveIntensity = 0;
      lightningPool.splice(i, 1);
    } else {
      // Faster, cleaner fade
      const f = Math.pow(1 - p, 3);
      item.light.intensity = item.maxI * f * (settings.intensity / 10);
      item.cloudSide.emissiveIntensity = f * 4.0; // Brighter flare
    }
  }

  if (settings.stormActive) {
    const pos = rainSystem.geometry.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] -= 2;
      if (pos[i] < -15) pos[i] = 200;
    }
    rainSystem.geometry.attributes.position.needsUpdate = true;
  }

  if (shakeIntensity > 0) {
    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
    camera.position.y += (Math.random() - 0.5) * shakeIntensity;
    shakeIntensity *= 0.9;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();
