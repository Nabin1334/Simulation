let scene, camera, renderer, character, block, distanceLine;
let leftLeg, rightLeg;
let animationRunning = false;
let animationStartTime = 0;
let currentElapsed = 0;

const initialCharacterX = -2;
const initialBlockX = -1.3;

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  const aspect = window.innerWidth / (window.innerHeight - 70);
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0, 5, 12);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight - 70);
  renderer.shadowMap.enabled = true;
  document.getElementById("three-container").appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(0, 20, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Ground - Extra long for follow-cam
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 10),
    new THREE.MeshPhongMaterial({ color: 0x222222 }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
  scene.add(new THREE.GridHelper(5000, 2500, 0x444444, 0x222222));

  // --- CHARACTER ---
  character = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.7, 0.3),
    new THREE.MeshPhongMaterial({ color: 0x3498db }),
  );
  body.position.y = 1.0;
  character.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 24),
    new THREE.MeshPhongMaterial({ color: 0xffdbac }),
  );
  head.position.y = 1.45;
  character.add(head);

  const armGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
  const armMat = new THREE.MeshPhongMaterial({ color: 0xffdbac });
  character.leftArm = new THREE.Mesh(armGeo, armMat);
  character.leftArm.position.set(-0.2, 1.2, 0.15);
  character.leftArm.rotation.x = -Math.PI / 2.2;
  character.add(character.leftArm);
  character.rightArm = new THREE.Mesh(armGeo, armMat);
  character.rightArm.position.set(0.2, 1.2, 0.15);
  character.rightArm.rotation.x = -Math.PI / 2.2;
  character.add(character.rightArm);

  const legGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
  leftLeg = new THREE.Mesh(
    legGeo,
    new THREE.MeshPhongMaterial({ color: 0x2c3e50 }),
  );
  leftLeg.position.set(-0.12, 0.3, 0);
  character.add(leftLeg);
  rightLeg = new THREE.Mesh(
    legGeo,
    new THREE.MeshPhongMaterial({ color: 0x2c3e50 }),
  );
  rightLeg.position.set(0.12, 0.3, 0);
  character.add(rightLeg);

  character.rotation.y = Math.PI / 2;
  character.position.set(initialCharacterX, 0, 0);
  scene.add(character);

  // --- BLOCK ---
  block = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.6, 1.2),
    new THREE.MeshPhongMaterial({ color: 0xe67e22 }),
  );
  block.position.set(initialBlockX + 0.6, 0.8, 0);
  block.castShadow = true;
  scene.add(block);

  // --- DISTANCE LINE ---
  distanceLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x3498db, linewidth: 2 }),
  );
  scene.add(distanceLine);

  window.addEventListener("resize", onWindowResize);
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / (window.innerHeight - 70);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 70);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  if (animationRunning) {
    const targetCamX = character.position.x + 4;
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
  }
}

function updateSimulation(timestamp) {
  if (!animationRunning) return;
  if (animationStartTime === 0) animationStartTime = timestamp;

  const f = parseFloat(document.getElementById("force-input").value) || 0;
  const targetD =
    parseFloat(document.getElementById("distance-input").value) || 0;

  const velocity = f / 15;
  currentElapsed = (timestamp - animationStartTime) / 1000;
  const currentMovedX = velocity * currentElapsed;

  if (currentMovedX >= targetD) {
    character.position.x = initialCharacterX + targetD;
    block.position.x = initialBlockX + 0.6 + targetD;
    handleStop();
    return;
  }

  character.position.x = initialCharacterX + currentMovedX;
  block.position.x = initialBlockX + 0.6 + currentMovedX;

  // Animation Cycle
  const walkCycle = currentElapsed * velocity * 5;
  leftLeg.rotation.x = Math.sin(walkCycle) * 0.5;
  rightLeg.rotation.x = -Math.sin(walkCycle) * 0.5;

  // Stabilized Tilt - пропорционально силе
  character.rotation.z = -Math.min(0.25, f / 300);

  distanceLine.geometry.setFromPoints([
    new THREE.Vector3(initialBlockX + 0.6, 0.05, 0),
    new THREE.Vector3(block.position.x, 0.05, 0),
  ]);

  const currentWork = f * currentMovedX;
  document.getElementById("work-output").textContent = currentWork.toFixed(1);
  document.getElementById("power-output").textContent = (
    currentElapsed > 0 ? currentWork / currentElapsed : 0
  ).toFixed(1);
  document.getElementById("time-display").textContent =
    currentElapsed.toFixed(1);

  requestAnimationFrame(updateSimulation);
}

function handleStart() {
  // Immediate reset if we are not at the start to prevent jumping glitches
  if (character.position.x !== initialCharacterX) {
    handleReset();
  }

  animationRunning = true;
  animationStartTime = 0;
  document.getElementById("start-btn").disabled = true;
  document.getElementById("stop-btn").disabled = false;
  requestAnimationFrame(updateSimulation);
}

function handleStop() {
  animationRunning = false;
  document.getElementById("start-btn").disabled = false;
  document.getElementById("stop-btn").disabled = true;
}

function handleReset() {
  animationRunning = false;
  animationStartTime = 0;
  camera.position.set(0, 5, 12);
  character.position.set(initialCharacterX, 0, 0);
  character.rotation.set(0, Math.PI / 2, 0);
  block.position.set(initialBlockX + 0.6, 0.8, 0);
  leftLeg.rotation.x = 0;
  rightLeg.rotation.x = 0;
  distanceLine.geometry.setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ]);
  document.getElementById("work-output").textContent = "0";
  document.getElementById("power-output").textContent = "0";
  document.getElementById("time-display").textContent = "0.0";
}

document.addEventListener("DOMContentLoaded", () => {
  initThree();
  document.getElementById("start-btn").addEventListener("click", handleStart);
  document.getElementById("stop-btn").addEventListener("click", handleStop);
  document.getElementById("reset-btn").addEventListener("click", handleReset);
});
