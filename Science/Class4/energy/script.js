// Scene setup
let scene, camera, renderer;
let currentAnimation = null;
let droppedMeshes = [];

const imagePaths = {
  background: "6b386272ea4b3d1ea7d613a6836a5cb8.jpg",
  heat: "heatenergyyy.png",
  electrical: "electricenergy.png",
  sound: "sound_energy.webp",
  light: "heat.webp",
};
const loadedTextures = {};

init();

function init() {
  scene = new THREE.Scene();

  // Load all textures
  const loader = new THREE.TextureLoader();
  for (const key in imagePaths) {
    loadedTextures[key] = loader.load(imagePaths[key], function (texture) {
      if (key === "background") {
        scene.background = texture;
      }
    });
  }

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);

  // Setup drag and drop
  const container = document.getElementById("container");
  container.addEventListener("dragover", function (e) {
    e.preventDefault();
  });
  container.addEventListener("drop", function (e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(event.target.result, function (texture) {
          const aspect = texture.image.width / texture.image.height;
          const geometry = new THREE.PlaneGeometry(5 * aspect, 5);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(
            Math.random() * 10 - 5,
            Math.random() * 5 + 2,
            Math.random() * 10 - 5
          );
          mesh.rotation.y = Math.random() * Math.PI * 2;
          scene.add(mesh);
          droppedMeshes.push(mesh);
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // Start animation loop
  animate();
}

function showEnergy(type) {
  // Clear previous animation
  if (currentAnimation) {
    scene.remove(currentAnimation);
    currentAnimation = null;
  }

  // Update info panel
  updateInfoPanel(type);

  // Load texture for the energy type
  const texture = loadedTextures[type];
  if (!texture || !texture.image) return;

  const aspect = texture.image.width / texture.image.height;
  const geometry = new THREE.PlaneGeometry(10 * aspect, 10);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0);
  scene.add(mesh);
  currentAnimation = mesh;
}

function updateInfoPanel(type) {
  const energyNames = {
    heat: "🔥 Heat Energy",
    sound: "🔊 Sound Energy",
    light: "💡 Light Energy",
    electrical: "⚡ Electrical Energy",
  };

  const descriptions = {
    heat: "Heat energy comes from the movement of tiny particles. The faster they move, the hotter things get! Examples: Sun warming the Earth, fire, hot stove.",
    sound:
      "Sound energy travels in waves through air, water, or solids. When these waves reach our ears, we hear sounds! Examples: Music, talking, thunder.",
    light:
      "Light energy helps us see and can travel through empty space. Plants use it to make food! Examples: Sunlight, light bulbs, glow sticks.",
    electrical:
      "Electrical energy powers our devices and flows through wires. It's very useful but be careful! Examples: Batteries, power outlets, lightning.",
  };

  document.getElementById("currentEnergy").textContent = energyNames[type];
  document.getElementById("energyDescription").textContent = descriptions[type];
}

function resetScene() {
  if (currentAnimation) {
    scene.remove(currentAnimation);
    currentAnimation = null;
  }
  droppedMeshes.forEach((mesh) => scene.remove(mesh));
  droppedMeshes = [];
  document.getElementById("currentEnergy").textContent =
    "Click buttons to explore!";
  document.getElementById("energyDescription").textContent =
    "Welcome to the Energy Explorer! Learn about different forms of energy by clicking the buttons below. Drag and drop pictures to add them to the scene!";

  // Rearrange energy buttons order
  rearrangeButtons();
}

function rearrangeButtons() {
  const controls = document.getElementById("controls");
  const buttons = Array.from(
    controls.querySelectorAll('.energy-btn:not([onclick="resetScene()"])')
  );
  const resetButton = controls.querySelector(
    '.energy-btn[onclick="resetScene()"]'
  );

  // Shuffle the energy buttons
  for (let i = buttons.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
  }

  // Clear controls and re-add shuffled buttons + reset
  while (controls.firstChild) {
    controls.removeChild(controls.firstChild);
  }

  buttons.forEach((btn) => controls.appendChild(btn));
  controls.appendChild(resetButton);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
