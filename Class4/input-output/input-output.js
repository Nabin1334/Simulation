// === GLOBAL VARIABLES ===
let scene, camera, renderer, controls;
let computer, monitor, keyboard, mouse, speakers, desk;
let isSystemOn = false;
let isDesktopOpen = false;
let currentAudioSource = null;
let systemStats = {
  cpu: 0,
  memory: 512,
  uptime: 0,
};

// Calculator state
let calcDisplay = "0";
let calcPrevious = null;
let calcOperation = null;
let calcWaitingForOperand = false;

// === INITIALIZATION ===
// Removed boot/loading sequence. Hide any loading-screen if present and initialize directly.
window.addEventListener("load", () => {
  const ls = document.getElementById("loading-screen");
  if (ls) ls.style.display = "none";  // hides if it exists
  initializeSystem(); // directly start
});


function startBootSequence() {
  // kept for compatibility if you want it later, but it won't be called by default
  const progressFill = document.getElementById("progress-fill");
  const bootStatus = document.getElementById("boot-status");
  let progress = 0;

  const bootSteps = [
    "Initializing hardware...",
    "Loading 3D engine...",
    "Setting up input devices...",
    "Configuring output systems...",
    "Starting system processes...",
    "System ready!",
  ];

  const bootInterval = setInterval(() => {
    progress += 16.67;
    if (progressFill) progressFill.style.width = progress + "%";

    const stepIndex = Math.floor(progress / 16.67);
    if (stepIndex < bootSteps.length && bootStatus) {
      bootStatus.textContent = bootSteps[stepIndex];
    }

    if (progress >= 100) {
      clearInterval(bootInterval);
      setTimeout(() => {
        const ls2 = document.getElementById("loading-screen");
        if (ls2) ls2.style.display = "none";
        initializeSystem();
      }, 1000);
    }
  }, 300);
}

function initializeSystem() {
  setupThreeJS();
  create3DScene();
  setupEventListeners();
  startSystemMonitoring();
  updateSystemStatus("system-state", "Online");
  updateSystemStatus("last-action", "System Initialized");
}

function setupThreeJS() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000a1a);
  scene.fog = new THREE.Fog(0x000a1a, 50, 200);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 8, 15);
  camera.lookAt(0, 0, 0);

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    precision: "highp",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000a1a, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  document.getElementById("container").appendChild(renderer.domElement);
}

function create3DScene() {
  setupLighting();
  createDesk();
  createComputer();
  createMonitor();
  createKeyboard();
  createMouse();
  createSpeakers();
  createEnvironment();
  animate();
}

function setupLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
  scene.add(ambientLight);

  // Main directional light (room lighting)
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(20, 20, 10);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 4096;
  mainLight.shadow.mapSize.height = 4096;
  mainLight.shadow.camera.near = 0.1;
  mainLight.shadow.camera.far = 100;
  mainLight.shadow.camera.left = -30;
  mainLight.shadow.camera.right = 30;
  mainLight.shadow.camera.top = 30;
  mainLight.shadow.camera.bottom = -30;
  scene.add(mainLight);

  // Desk lamp
  const deskLight = new THREE.SpotLight(0xfff5b7, 1, 30, Math.PI * 0.1, 0.3);
  deskLight.position.set(-8, 12, 5);
  deskLight.target.position.set(0, 0, 0);
  deskLight.castShadow = true;
  scene.add(deskLight);
  scene.add(deskLight.target);

  // Monitor glow
  const monitorLight = new THREE.PointLight(0x4a9eff, 0.5, 15);
  monitorLight.position.set(2, 6, 1);
  scene.add(monitorLight);

  // Computer LED lights
  const computerLED = new THREE.PointLight(0x00ff00, 0.3, 5);
  computerLED.position.set(-4, 4, 2);
  scene.add(computerLED);
}

function createDesk() {
  // Desk surface
  const deskGeometry = new THREE.BoxGeometry(16, 0.5, 10);
  const deskMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b4513,
    shininess: 30,
  });
  desk = new THREE.Mesh(deskGeometry, deskMaterial);
  desk.position.set(0, -0.25, 0);
  desk.castShadow = true;
  desk.receiveShadow = true;
  scene.add(desk);

  // Desk legs
  const legGeometry = new THREE.BoxGeometry(0.3, 4, 0.3);
  const legMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });

  const legPositions = [
    [-7, -2.5, -4],
    [7, -2.5, -4],
    [-7, -2.5, 4],
    [7, -2.5, 4],
  ];

  legPositions.forEach((pos) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    leg.castShadow = true;
    scene.add(leg);
  });
}

function createComputer() {
  computer = new THREE.Group();

  // Main tower
  const towerGeometry = new THREE.BoxGeometry(2.5, 5, 4);
  const towerMaterial = new THREE.MeshPhongMaterial({
    color: 0x2a2a2a,
    shininess: 100,
  });
  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  tower.position.set(-5, 2.5, 0);
  tower.castShadow = true;
  computer.add(tower);

  // Front panel
  const panelGeometry = new THREE.BoxGeometry(2.6, 5.1, 0.1);
  const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.position.set(-3.7, 2.5, 0);
  computer.add(panel);

  // Power button
  const powerGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05);
  const powerMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    emissive: 0x002200,
  });
  const powerButton = new THREE.Mesh(powerGeometry, powerMaterial);
  powerButton.position.set(-3.65, 4.5, 0);
  powerButton.rotation.x = Math.PI / 2;
  computer.add(powerButton);
  computer.userData.powerButton = powerButton;

  // CD/DVD drive
  const driveGeometry = new THREE.BoxGeometry(2.3, 0.3, 0.05);
  const driveMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const drive = new THREE.Mesh(driveGeometry, driveMaterial);
  drive.position.set(-3.65, 3.5, 0);
  computer.add(drive);

  // Ventilation grilles
  for (let i = 0; i < 8; i++) {
    const ventGeometry = new THREE.PlaneGeometry(2, 0.1);
    const ventMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const vent = new THREE.Mesh(ventGeometry, ventMaterial);
    vent.position.set(-3.65, 1.5 + i * 0.2, 0);
    computer.add(vent);
  }

  // USB ports
  const usbGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.05);
  const usbMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  for (let i = 0; i < 4; i++) {
    const usb = new THREE.Mesh(usbGeometry, usbMaterial);
    usb.position.set(-3.65, 0.5 + i * 0.2, 0.5 + i * 0.1);
    computer.add(usb);
  }

  scene.add(computer);
}

function createMonitor() {
  monitor = new THREE.Group();

  // Monitor base
  const baseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.4);
  const baseMaterial = new THREE.MeshPhongMaterial({
    color: 0x2a2a2a,
    shininess: 100,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(2, 0.2, 0);
  base.castShadow = true;
  monitor.add(base);

  // Monitor arm
  const armGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3);
  const armMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  arm.position.set(2, 2, 0);
  arm.castShadow = true;
  monitor.add(arm);

  // Monitor bezel
  const bezelGeometry = new THREE.BoxGeometry(5, 3.5, 0.8);
  const bezelMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a1a1a,
    shininess: 150,
  });
  const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
  bezel.position.set(2, 5, 0);
  bezel.castShadow = true;
  monitor.add(bezel);

  // Monitor screen
  const screenGeometry = new THREE.BoxGeometry(4.6, 3.1, 0.1);
  const screenMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    shininess: 200,
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(2, 5, 0.35);
  monitor.add(screen);
  monitor.userData.screen = screen;

  // Screen content when on
  const contentGeometry = new THREE.PlaneGeometry(4.4, 2.9);
  const contentMaterial = new THREE.MeshBasicMaterial({
    color: 0x1e3c72,
    transparent: true,
    opacity: 0,
  });
  const screenContent = new THREE.Mesh(contentGeometry, contentMaterial);
  screenContent.position.set(2, 5, 0.41);
  monitor.add(screenContent);
  monitor.userData.content = screenContent;

  // Monitor controls
  const controlGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1);
  const controlMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

  for (let i = 0; i < 5; i++) {
    const control = new THREE.Mesh(controlGeometry, controlMaterial);
    control.position.set(1.5 + i * 0.2, 3.2, 0.4);
    control.rotation.x = Math.PI / 2;
    monitor.add(control);
  }

  // Power LED
  const ledGeometry = new THREE.SphereGeometry(0.05);
  const ledMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0x220000,
  });
  const powerLED = new THREE.Mesh(ledGeometry, ledMaterial);
  powerLED.position.set(2.2, 3.2, 0.4);
  monitor.add(powerLED);
  monitor.userData.powerLED = powerLED;

  scene.add(monitor);
}

function createKeyboard() {
  keyboard = new THREE.Group();

  // Keyboard base
  const baseGeometry = new THREE.BoxGeometry(5, 0.4, 2);
  const baseMaterial = new THREE.MeshPhongMaterial({
    color: 0x2a2a2a,
    shininess: 100,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(1, 0.2, 3.5);
  base.castShadow = true;
  keyboard.add(base);

  // Create individual keys
  const keyGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.3);
  const keyMaterial = new THREE.MeshPhongMaterial({
    color: 0x404040,
    shininess: 50,
  });

  // Standard keyboard layout
  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  keyboard.userData.keys = [];

  rows.forEach((row, rowIndex) => {
    row.forEach((keyLabel, colIndex) => {
      const key = new THREE.Mesh(keyGeometry, keyMaterial.clone());
      key.position.set(-1.5 + colIndex * 0.4, 0.45, 2.8 + rowIndex * 0.4);
      key.castShadow = true;
      key.userData.label = keyLabel;
      keyboard.add(key);
      keyboard.userData.keys.push(key);
    });
  });

  // Space bar
  const spaceGeometry = new THREE.BoxGeometry(2, 0.2, 0.3);
  const space = new THREE.Mesh(spaceGeometry, keyMaterial.clone());
  space.position.set(1, 0.45, 4.4);
  space.castShadow = true;
  space.userData.label = "Space";
  keyboard.add(space);
  keyboard.userData.keys.push(space);

  scene.add(keyboard);
}

function createMouse() {
  mouse = new THREE.Group();

  // Mouse body
  const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
  bodyGeometry.vertices?.forEach((vertex) => {
    vertex.y = Math.max(0, vertex.y); // Round the top
  });
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333,
    shininess: 100,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(5, 0.25, 3.5);
  body.castShadow = true;
  mouse.add(body);

  // Left button
  const leftButtonGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.6);
  const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
  const leftButton = new THREE.Mesh(leftButtonGeometry, buttonMaterial);
  leftButton.position.set(4.8, 0.55, 3.3);
  mouse.add(leftButton);
  mouse.userData.leftButton = leftButton;

  // Right button
  const rightButton = new THREE.Mesh(
    leftButtonGeometry,
    buttonMaterial.clone()
  );
  rightButton.position.set(5.2, 0.55, 3.3);
  mouse.add(rightButton);
  mouse.userData.rightButton = rightButton;

  // Scroll wheel
  const wheelGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3);
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.position.set(5, 0.55, 3.3);
  wheel.rotation.z = Math.PI / 2;
  mouse.add(wheel);

  // Mouse cable
  const cableGeometry = new THREE.CylinderGeometry(0.02, 0.02, 3);
  const cableMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
  const cable = new THREE.Mesh(cableGeometry, cableMaterial);
  cable.position.set(5, 0.1, 1.5);
  cable.rotation.x = Math.PI / 2;
  mouse.add(cable);

  scene.add(mouse);
}

function createSpeakers() {
  speakers = new THREE.Group();

  // Left speaker
  const speakerGeometry = new THREE.BoxGeometry(1, 2, 1.2);
  const speakerMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a1a1a,
    shininess: 80,
  });

  const leftSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
  leftSpeaker.position.set(-2, 1, 1);
  leftSpeaker.castShadow = true;
  speakers.add(leftSpeaker);

  const rightSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial.clone());
  rightSpeaker.position.set(6, 1, 1);
  rightSpeaker.castShadow = true;
  speakers.add(rightSpeaker);

  // Speaker drivers (woofers)
  const driverGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.1);
  const driverMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

  const leftDriver = new THREE.Mesh(driverGeometry, driverMaterial);
  leftDriver.position.set(-2, 1.2, 1.61);
  leftDriver.rotation.x = Math.PI / 2;
  speakers.add(leftDriver);

  const rightDriver = new THREE.Mesh(driverGeometry, driverMaterial.clone());
  rightDriver.position.set(6, 1.2, 1.61);
  rightDriver.rotation.x = Math.PI / 2;
  speakers.add(rightDriver);

  // Tweeters
  const tweeterGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.05);
  const tweeterMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });

  const leftTweeter = new THREE.Mesh(tweeterGeometry, tweeterMaterial);
  leftTweeter.position.set(-2, 0.6, 1.61);
  leftTweeter.rotation.x = Math.PI / 2;
  speakers.add(leftTweeter);

  const rightTweeter = new THREE.Mesh(tweeterGeometry, tweeterMaterial.clone());
  rightTweeter.position.set(6, 0.6, 1.61);
  rightTweeter.rotation.x = Math.PI / 2;
  speakers.add(rightTweeter);

  // Power LEDs
  const ledGeometry = new THREE.SphereGeometry(0.03);
  const ledMaterial = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    emissive: 0x000022,
  });

  const leftLED = new THREE.Mesh(ledGeometry, ledMaterial);
  leftLED.position.set(-2, 0.2, 1.61);
  speakers.add(leftLED);
  speakers.userData.leftLED = leftLED;

  const rightLED = new THREE.Mesh(ledGeometry, ledMaterial.clone());
  rightLED.position.set(6, 0.2, 1.61);
  speakers.add(rightLED);
  speakers.userData.rightLED = rightLED;

  scene.add(speakers);
}

function createEnvironment() {
  // Floor
  const floorGeometry = new THREE.PlaneGeometry(50, 50);
  const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x404040,
    shininess: 10,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -5;
  floor.receiveShadow = true;
  scene.add(floor);

  // Wall
  const wallGeometry = new THREE.PlaneGeometry(50, 30);
  const wallMaterial = new THREE.MeshPhongMaterial({
    color: 0x606060,
    shininess: 5,
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(0, 10, -15);
  wall.receiveShadow = true;
  scene.add(wall);

  // Window
  const windowGeometry = new THREE.PlaneGeometry(8, 6);
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.7,
  });
  const window_mesh = new THREE.Mesh(windowGeometry, windowMaterial);
  window_mesh.position.set(-10, 8, -14.9);
  scene.add(window_mesh);
}

function setupEventListeners() {
  // Window resize
  window.addEventListener("resize", onWindowResize);

  // Keyboard input
  document.addEventListener("keydown", handleKeyboardInput);
  document.addEventListener("keyup", handleKeyboardUp);

  // Mouse input
  renderer.domElement.addEventListener("click", handleMouseClick);
  renderer.domElement.addEventListener("mousemove", handleMouseMove);

  // Virtual keyboard
  setupVirtualKeyboard();
}

function handleKeyboardInput(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    return; // Allow normal input in form elements
  }

  updateSystemStatus("active-input", "Keyboard");
  updateSystemStatus("last-action", `Key Pressed: ${event.key}`);

  // Light up corresponding key
  const key = findKeyByLabel(event.key.toUpperCase());
  if (key) {
    animateKeyPress(key);
  }

  // Add to text editor if desktop is open
  if (
    isDesktopOpen &&
    document.getElementById("text-editor") === document.activeElement
  ) {
    return; // Let normal typing work
  }

  event.preventDefault();
}

function handleKeyboardUp(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    return;
  }
  // Reset key animation
  const key = findKeyByLabel(event.key.toUpperCase());
  if (key) {
    resetKeyPress(key);
  }
}

function handleMouseClick(event) {
  updateSystemStatus("active-input", "Mouse");
  updateSystemStatus("last-action", "Mouse Clicked");

  // Animate mouse click
  animateMouseClick();

  // Calculate mouse position for interaction
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Raycasting for 3D object interaction
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    handleObjectClick(object);
  }
}

function handleMouseMove(event) {
  updateSystemStatus("active-input", "Mouse");

  // Update system status with mouse position
  const rect = renderer.domElement.getBoundingClientRect();
  const x = Math.round(event.clientX - rect.left);
  const y = Math.round(event.clientY - rect.top);

  // Throttle updates for performance
  if (Math.random() > 0.9) {
    updateSystemStatus("last-action", `Mouse: (${x}, ${y})`);
  }
}

function handleObjectClick(object) {
  // Check if monitor was clicked
  if (monitor.children.includes(object)) {
    powerOnMonitor();
  }
  // Check if computer was clicked
  else if (computer.children.includes(object)) {
    bootSystem();
  }
  // Check if keyboard was clicked
  else if (keyboard.children.includes(object)) {
    if (object.userData.label) {
      simulateKeyPress(object.userData.label);
    }
  }
}

function setupVirtualKeyboard() {
  const keys = document.querySelectorAll("#virtual-keyboard .key");
  keys.forEach((key) => {
    key.addEventListener("click", () => {
      const keyText = key.textContent;
      simulateKeyPress(keyText);

      // Find and animate 3D key
      const key3D = findKeyByLabel(keyText);
      if (key3D) {
        animateKeyPress(key3D);
        setTimeout(() => resetKeyPress(key3D), 200);
      }
    });
  });
}

function findKeyByLabel(label) {
  if (!keyboard.userData.keys) return null;
  return keyboard.userData.keys.find(
    (key) =>
      key.userData.label === label || key.userData.label === label.toLowerCase()
  );
}

function animateKeyPress(key) {
  const originalY = key.position.y;
  key.position.y = originalY - 0.05;
  key.material.color.setHex(0x00ff00);
}

function resetKeyPress(key) {
  key.position.y = 0.45;
  key.material.color.setHex(0x404040);
}

function animateMouseClick() {
  if (mouse.userData.leftButton) {
    const button = mouse.userData.leftButton;
    const originalY = button.position.y;
    button.position.y = originalY - 0.02;
    button.material.color.setHex(0x00ff00);

    setTimeout(() => {
      button.position.y = originalY;
      button.material.color.setHex(0x444444);
    }, 150);
  }
}

function simulateKeyPress(key) {
  updateSystemStatus("last-action", `Virtual Key: ${key}`);

  // Add to text editor if focused
  const textEditor = document.getElementById("text-editor");
  if (textEditor && document.activeElement === textEditor) {
    const start = textEditor.selectionStart;
    const end = textEditor.selectionEnd;
    const text = textEditor.value;

    let insertText = key;
    if (key === "Space") insertText = " ";
    if (key === "Enter") insertText = "\n";
    if (key === "⌫") {
      if (start > 0) {
        textEditor.value = text.slice(0, start - 1) + text.slice(end);
        textEditor.selectionStart = textEditor.selectionEnd = start - 1;
      }
      return;
    }

    textEditor.value = text.slice(0, start) + insertText + text.slice(end);
    textEditor.selectionStart = textEditor.selectionEnd =
      start + insertText.length;
    textEditor.focus();
  }
}

// === SYSTEM CONTROL FUNCTIONS ===

function powerOnMonitor() {
  if (monitor.userData.powerLED) {
    monitor.userData.powerLED.material.color.setHex(0x00ff00);
    monitor.userData.powerLED.material.emissive.setHex(0x002200);
  }

  if (monitor.userData.content) {
    monitor.userData.content.material.opacity = 1;
    monitor.userData.content.material.color.setHex(0x1e3c72);
  }

  updateSystemStatus("active-output", "Monitor");
  updateSystemStatus("system-state", "Monitor On");
  updateSystemStatus("last-action", "Monitor Powered On");
  isSystemOn = true;
}

function powerOffMonitor() {
  if (monitor.userData.powerLED) {
    monitor.userData.powerLED.material.color.setHex(0xff0000);
    monitor.userData.powerLED.material.emissive.setHex(0x220000);
  }

  if (monitor.userData.content) {
    monitor.userData.content.material.opacity = 0;
  }

  closeDesktop();
  updateSystemStatus("active-output", "None");
  updateSystemStatus("system-state", "Monitor Off");
  updateSystemStatus("last-action", "Monitor Powered Off");
  isSystemOn = false;
}

function openDesktop() {
  if (!isSystemOn) {
    powerOnMonitor();
  }

  document.getElementById("desktop-screen").style.display = "block";
  document.getElementById("desktop-screen").classList.add("boot-animation");
  isDesktopOpen = true;

  updateSystemStatus("system-state", "Desktop Active");
  updateSystemStatus("last-action", "Desktop Opened");

  // Focus text editor
  setTimeout(() => {
    const te = document.getElementById("text-editor");
    if (te) te.focus();
  }, 1000);
}

function closeDesktop() {
  const ds = document.getElementById("desktop-screen");
  if (ds) ds.style.display = "none";
  const vk = document.getElementById("virtual-keyboard");
  if (vk) vk.style.display = "none";
  isDesktopOpen = false;

  updateSystemStatus("system-state", isSystemOn ? "Monitor On" : "Standby");
  updateSystemStatus("last-action", "Desktop Closed");
}

function toggleVirtualKeyboard() {
  const keyboard = document.getElementById("virtual-keyboard");
  if (keyboard.style.display === "none" || !keyboard.style.display) {
    keyboard.style.display = "block";
    updateSystemStatus("last-action", "Virtual Keyboard Shown");
  } else {
    keyboard.style.display = "none";
    updateSystemStatus("last-action", "Virtual Keyboard Hidden");
  }
}

function testMouseClick() {
  animateMouseClick();
  updateSystemStatus("active-input", "Mouse");
  updateSystemStatus("last-action", "Mouse Test Clicked");
}

function playSystemSound() {
  playBeep(800, 0.2);
  animateSpeakers();
  updateSystemStatus("active-output", "Speakers");
  updateSystemStatus("last-action", "System Beep Played");
  showAudioVisualizer();
}

function playMusic() {
  playMelody();
  animateSpeakers();
  updateSystemStatus("active-output", "Speakers");
  updateSystemStatus("last-action", "Music Playing");
  showAudioVisualizer();
}

function stopAllAudio() {
  if (currentAudioSource) {
    currentAudioSource.stop();
    currentAudioSource = null;
  }
  hideAudioVisualizer();
  resetSpeakers();
  updateSystemStatus("active-output", "None");
  updateSystemStatus("last-action", "Audio Stopped");
}

function bootSystem() {
  // Animate computer power button
  if (computer.userData.powerButton) {
    computer.userData.powerButton.material.color.setHex(0x00ff00);
    computer.userData.powerButton.material.emissive.setHex(0x004400);
  }

  updateSystemStatus("system-state", "Booting");
  updateSystemStatus("last-action", "System Boot Started");

  setTimeout(() => {
    powerOnMonitor();
    setTimeout(openDesktop, 1000);
  }, 2000);
}

function shutdownSystem() {
  closeDesktop();
  powerOffMonitor();
  stopAllAudio();

  if (computer.userData.powerButton) {
    computer.userData.powerButton.material.color.setHex(0xff0000);
    computer.userData.powerButton.material.emissive.setHex(0x220000);
  }

  updateSystemStatus("system-state", "Shutdown");
  updateSystemStatus("active-input", "None");
  updateSystemStatus("active-output", "None");
  updateSystemStatus("last-action", "System Shutdown");
  isSystemOn = false;
}

// === AUDIO FUNCTIONS ===

function playBeep(frequency = 440, duration = 0.5) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);

  currentAudioSource = oscillator;
}

function playMelody() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const melody = [523.25, 587.33, 659.25, 698.46, 783.99]; // C D E F G
  let time = audioContext.currentTime;

  melody.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = freq;
    oscillator.type = "triangle";

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.1, time + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

    oscillator.start(time);
    oscillator.stop(time + 0.5);

    time += 0.5;
    if (index === 0) currentAudioSource = oscillator;
  });
}

function animateSpeakers() {
  if (speakers.userData.leftLED) {
    speakers.userData.leftLED.material.color.setHex(0x00ff00);
    speakers.userData.leftLED.material.emissive.setHex(0x004400);
  }
  if (speakers.userData.rightLED) {
    speakers.userData.rightLED.material.color.setHex(0x00ff00);
    speakers.userData.rightLED.material.emissive.setHex(0x004400);
  }

  setTimeout(resetSpeakers, 3000);
}

function resetSpeakers() {
  if (speakers.userData.leftLED) {
    speakers.userData.leftLED.material.color.setHex(0x0000ff);
    speakers.userData.leftLED.material.emissive.setHex(0x000022);
  }
  if (speakers.userData.rightLED) {
    speakers.userData.rightLED.material.color.setHex(0x0000ff);
    speakers.userData.rightLED.material.emissive.setHex(0x000022);
  }
}

function showAudioVisualizer() {
  const visualizer = document.getElementById("audio-visualizer");
  if (visualizer) visualizer.style.display = "block";

  const container = document.getElementById("visualizer-container");
  if (container) {
    container.innerHTML = "";

    for (let i = 0; i < 20; i++) {
      const bar = document.createElement("div");
      bar.className = "visualizer-bar";
      bar.style.height = Math.random() * 60 + 10 + "px";
      container.appendChild(bar);
    }

    // Animate bars
    const bars = container.children;
    const animateVisualizerBars = () => {
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.height = Math.random() * 60 + 10 + "px";
      }
    };

    const interval = setInterval(animateVisualizerBars, 100);
    setTimeout(() => {
      clearInterval(interval);
      hideAudioVisualizer();
    }, 5000);
  }
}

function hideAudioVisualizer() {
  const visualizer = document.getElementById("audio-visualizer");
  if (visualizer) visualizer.style.display = "none";
}

// === CALCULATOR FUNCTIONS ===

function appendToCalc(value) {
  const display = document.getElementById("calc-display");

  if (calcWaitingForOperand) {
    display.textContent = value;
    calcWaitingForOperand = false;
  } else {
    display.textContent =
      display.textContent === "0" ? value : display.textContent + value;
  }
}

function clearCalculator() {
  const display = document.getElementById("calc-display");
  display.textContent = "0";
  calcPrevious = null;
  calcOperation = null;
  calcWaitingForOperand = false;
}

function deleteLast() {
  const display = document.getElementById("calc-display");
  display.textContent = display.textContent.slice(0, -1) || "0";
}

function calculateResult() {
  const display = document.getElementById("calc-display");
  const current = parseFloat(display.textContent);

  if (calcPrevious !== null && calcOperation && !calcWaitingForOperand) {
    let result;
    switch (calcOperation) {
      case "+":
        result = calcPrevious + current;
        break;
      case "-":
        result = calcPrevious - current;
        break;
      case "*":
        result = calcPrevious * current;
        break;
      case "/":
        result = current !== 0 ? calcPrevious / current : "Error";
        break;
      default:
        return;
    }

    display.textContent = result;
    calcPrevious = result;
    calcOperation = null;
    calcWaitingForOperand = true;
  } else if (calcOperation) {
    calcPrevious = current;
    calcWaitingForOperand = true;
  }
}

// === FILE SYSTEM FUNCTIONS ===

function openFile(fileType) {
  const fileActions = {
    document: "Opening text document...",
    image: "Loading image file...",
    music: "Starting music player...",
    video: "Launching video player...",
    folder: "Opening folder contents...",
    program: "Executing program...",
  };

  updateSystemStatus("last-action", fileActions[fileType] || "Opening file...");

  if (fileType === "music") {
    playMusic();
  }

  // Simulate file loading
  setTimeout(() => {
    updateSystemStatus(
      "last-action",
      `${
        fileType.charAt(0).toUpperCase() + fileType.slice(1)
      } opened successfully`
    );
  }, 1500);
}

// === SYSTEM MONITORING ===

function startSystemMonitoring() {
  setInterval(() => {
    // Simulate CPU usage
    systemStats.cpu = Math.floor(Math.random() * 30) + 5;
    updateSystemStatus("cpu-usage", systemStats.cpu + "%");

    // Simulate memory usage changes
    systemStats.memory = 512 + Math.floor(Math.random() * 256);
    updateSystemStatus("memory-usage", systemStats.memory + "MB");

    // Update uptime
    systemStats.uptime += 1;
  }, 2000);
}

function updateSystemStatus(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

// === 3D ANIMATION LOOP ===

function animate() {
  requestAnimationFrame(animate);

  // Gentle ambient animations
//   if (computer) {
//     computer.rotation.y += 0.002;
//   }

  if (speakers) {
    speakers.position.y = Math.sin(Date.now() * 0.001) * 0.01;
  }

  if (monitor && isSystemOn) {
    // Monitor screen flicker effect
    if (monitor.userData.content) {
      monitor.userData.content.material.opacity =
        0.9 + Math.sin(Date.now() * 0.01) * 0.1;
    }
  }

  // Auto-rotate camera for better viewing
  // camera.position.x = Math.cos(Date.now() * 0.0005) * 15;
  // camera.position.z = Math.sin(Date.now() * 0.0005) * 15;
  //camera.lookAt(0, 2, 0);

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// === UTILITY FUNCTIONS ===

function flashComponent(component, color, duration = 500) {
  if (!component || !component.material) return;

  const originalColor = component.material.color.getHex();
  component.material.color.setHex(color);

  setTimeout(() => {
    component.material.color.setHex(originalColor);
  }, duration);
}

function createParticleEffect(position, color = 0x00ff00) {
  const particleCount = 20;
  const particles = new THREE.Group();

  for (let i = 0; i < particleCount; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.02);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: color });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);

    particle.position.copy(position);
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      Math.random() * 0.3,
      (Math.random() - 0.5) * 0.2
    );

    particles.add(particle);
  }

  scene.add(particles);

  // Animate particles
  const animateParticles = () => {
    particles.children.forEach((particle) => {
      particle.position.add(particle.userData.velocity);
      particle.userData.velocity.y -= 0.01; // gravity
      particle.material.opacity -= 0.02;
    });

    if (particles.children[0]?.material.opacity > 0) {
      requestAnimationFrame(animateParticles);
    } else {
      scene.remove(particles);
    }
  };

  animateParticles();
}

// === ERROR HANDLING ===

window.addEventListener("error", (event) => {
  console.error("System Error:", event.error);
  updateSystemStatus("system-state", "Error");
  updateSystemStatus("last-action", "System Error Detected");
});

// === PERFORMANCE OPTIMIZATION ===

function optimizePerformance() {
  // Reduce quality on low-end devices
  if (navigator.hardwareConcurrency < 4) {
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
  }

  // Pause animations when not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else {
      renderer.setAnimationLoop(animate);
    }
  });
}

// Initialize performance optimizations
optimizePerformance();

// === ACCESSIBILITY FEATURES ===

function addAccessibilitySupport() {
  // Add keyboard navigation for controls
  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      // Handle tab navigation
      event.preventDefault();
    }

    if (event.key === "Enter" || event.key === " ") {
      // Handle activation
      const focused = document.activeElement;
      if (focused.classList.contains("control-btn")) {
        focused.click();
      }
    }
  });
  // Add ARIA labels
  const cp = document.getElementById("controls-panel");
  if (cp) cp.setAttribute("role", "region");
  if (cp)
    cp.setAttribute("aria-label", "Computer System Controls");
}
// Initialize accessibility
addAccessibilitySupport();

console.log("🖥️ Realistic 3D Computer I/O System Initialized Successfully!");
console.log(
  "📊 Features: Real keyboard/mouse input, working calculator, file system, audio output"
);
console.log("🎮 Instructions: Use control panel to interact with the system");