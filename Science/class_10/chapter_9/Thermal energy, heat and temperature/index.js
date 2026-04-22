
/* =========================================================
   HEAT CONDUCTION VISUALIZATION ENGINE
   ========================================================= */

let isDarkMode = true;
let currentMaterial = 'iron';
let simTime = 0;
let heatFlowRate = 0;
let isHeating = false;

/* ---------------- Tabs ---------------- */
const tabs = document.querySelectorAll('.tab-content');
const navBtns = document.querySelectorAll('.nav-btn');

function switchTab(tabId, btnId){
  navBtns.forEach(btn => btn.classList.remove('active'));
  
  // Activate button based on ID passed
  if(btnId) {
      const activeBtn = document.getElementById(btnId);
      if(activeBtn) activeBtn.classList.add('active');
  }

  tabs.forEach(tab => {
    if(tab.id === tabId){
      tab.classList.add('active');
      if(tabId === 'tab-simulation') setTimeout(handleResize, 80);
    } else tab.classList.remove('active');
  });
}

/* ---------------- Theme Toggle ---------------- */
const themeBtn = document.getElementById('theme-btn');
let themeIconEl = document.getElementById('theme-icon');

function refreshThemeUI(){
  const leftIcon = themeBtn.querySelector('.fa-moon, .fa-sun');
  const labelEl  = themeBtn.querySelector('span');

  if(isDarkMode){
    document.body.classList.remove('light-theme');
    if(leftIcon) leftIcon.className = 'fas fa-moon';
    if(labelEl) labelEl.textContent = 'Dark Mode';
    if(themeIconEl) themeIconEl.className = 'fas fa-toggle-off';
  }else{
    document.body.classList.add('light-theme');
    if(leftIcon) leftIcon.className = 'fas fa-sun';
    if(labelEl) labelEl.textContent = 'Light Mode';
    if(themeIconEl) themeIconEl.className = 'fas fa-toggle-on';
  }
}

themeBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  applyThemeScene();
  refreshThemeUI();
});

/* ---------------- THREE Setup ---------------- */
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 160);
camera.position.set(0, 3.8, 14.5);
camera.lookAt(0, -1.1, 0);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, logarithmicDepthBuffer:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance on high-res mobile
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;

container.appendChild(renderer.domElement);

/* ---------------- Lights ---------------- */
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2); // Boosted Intensity
keyLight.position.set(6, 10, 8);
keyLight.castShadow = true;
// Optimize shadow map for mobile
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
scene.add(keyLight);

const hemi = new THREE.HemisphereLight(0xdff3ff, 0xffffff, 0.7); // Boosted Intensity
scene.add(hemi);

const rim = new THREE.DirectionalLight(0x8bdcff, 0.25);
rim.position.set(-8, 6, -8);
scene.add(rim);

/* ---------------- Textures ---------------- */
function makeSkyTexture(){
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512; // Reduced texture size for better mobile performance
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0,0,0,c.height);
  grad.addColorStop(0,"#5ab2ff");
  grad.addColorStop(0.55,"#c7f2ff");
  grad.addColorStop(1,"#ffffff");
  g.fillStyle = grad; g.fillRect(0,0,c.width,c.height);

  for(let i=0;i<20;i++){
    const x=Math.random()*c.width;
    const y=Math.random()*c.height*0.55;
    const r=45+Math.random()*75;
    const cloud=g.createRadialGradient(x,y,0,x,y,r);
    cloud.addColorStop(0,"rgba(255,255,255,0.55)");
    cloud.addColorStop(0.65,"rgba(255,255,255,0.18)");
    cloud.addColorStop(1,"rgba(255,255,255,0)");
    g.fillStyle=cloud;
    g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  if(tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeWoodTexture(){
  const c=document.createElement("canvas");
  c.width=512; c.height=512; // Reduced texture size
  const g=c.getContext("2d");

  g.fillStyle="#7a4a23"; g.fillRect(0,0,c.width,c.height);

  for(let y=0;y<c.height;y+=2){
    g.fillStyle=`rgba(30,15,5,${0.05+Math.random()*0.07})`;
    g.fillRect(0,y,c.width,1);
    if(Math.random()<0.07){
      g.fillStyle=`rgba(20,10,4,${0.12+Math.random()*0.18})`;
      g.fillRect(0,y,c.width,2);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2,2);
  if(tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------------- Rod + Table + Supports ---------------- */
const rodLen = 10;
const segments = 100;

const rodGeo = new THREE.CylinderGeometry(0.25,0.25,rodLen,32,segments,true); // Slightly reduced radial segments
rodGeo.rotateZ(Math.PI/2);
const vCount = rodGeo.attributes.position.count;
rodGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(vCount*3), 3));

const rodMat = new THREE.MeshStandardMaterial({
  vertexColors:true,
  metalness:0.95,
  roughness:0.20,
  envMapIntensity:1.6
});
const rod = new THREE.Mesh(rodGeo, rodMat);
rod.castShadow = true;
scene.add(rod);

const table = new THREE.Mesh(
  new THREE.BoxGeometry(22, 0.55, 12),
  new THREE.MeshStandardMaterial({
    map: makeWoodTexture(),
    roughness: 0.62,
    metalness: 0.05
  })
);
table.position.y = -3.6;
table.receiveShadow = true;
scene.add(table);

function createSupport(x){
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65,0.85,0.22,32),
    new THREE.MeshStandardMaterial({ color:0x334155, roughness:0.75 })
  );
  base.position.y = -3.25;

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11,0.11,3.35,16),
    new THREE.MeshStandardMaterial({ color:0x94a3b8, metalness:1, roughness:0.22 })
  );
  pole.position.y = -1.55;

  const clamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.45,0.45,0.85),
    new THREE.MeshStandardMaterial({ color:0x334155, roughness:0.65 })
  );
  clamp.position.y = 0.05;

  group.add(base,pole,clamp);
  group.position.x = x;
  scene.add(group);
}
createSupport(-3);
createSupport(3);

/* =========================================================
   TORCH + REALISTIC FLAME
   ========================================================= */
const torch = new THREE.Group();
torch.position.set(-rodLen/2 + 0.65, -2.7, 0);
scene.add(torch);

const handle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.18, 0.20, 1.8, 32),
  new THREE.MeshStandardMaterial({
    color: 0x2b3442,
    metalness: 0.95,
    roughness: 0.35
  })
);
handle.position.y = 0.1;
handle.rotation.z = 0.06;
handle.castShadow = true;
torch.add(handle);

const grip = new THREE.Mesh(
  new THREE.TorusGeometry(0.21, 0.03, 14, 32),
  new THREE.MeshStandardMaterial({ color:0x111827, metalness:0.6, roughness:0.6 })
);
grip.position.y = 0.65;
grip.rotation.x = Math.PI/2;
grip.castShadow = true;
torch.add(grip);

const head = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.28, 0.55, 32),
  new THREE.MeshStandardMaterial({
    color: 0xbec6d2,
    metalness: 1.0,
    roughness: 0.18
  })
);
head.position.y = 1.15;
head.castShadow = true;
torch.add(head);

const nozzle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.12, 0.28, 24),
  new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    metalness: 1.0,
    roughness: 0.12
  })
);
nozzle.position.y = 1.45;
nozzle.castShadow = true;
torch.add(nozzle);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.11, 0.02, 10, 24),
  new THREE.MeshStandardMaterial({
    color: 0x444b55,
    emissive: 0xff6a00,
    emissiveIntensity: 0.7,
    metalness: 0.9,
    roughness: 0.25
  })
);
ring.position.y = 1.58;
ring.rotation.x = Math.PI/2;
torch.add(ring);

/* ---------- Flame sprites ---------- */
function makeGlowSprite(colorA, colorB){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128; // Reduced size
  const g = c.getContext('2d');

  const grad = g.createRadialGradient(64,70,5,64,70,60);
  grad.addColorStop(0, colorA);
  grad.addColorStop(0.35, colorB);
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0,0,128,128);

  const tex = new THREE.CanvasTexture(c);
  if(tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const flameTexOuter = makeGlowSprite("rgba(255,170,0,0.95)", "rgba(255,70,0,0.45)");
const flameTexInner = makeGlowSprite("rgba(255,255,255,0.95)", "rgba(255,190,0,0.55)");

const flameOuter = new THREE.Sprite(new THREE.SpriteMaterial({
  map: flameTexOuter,
  transparent:true,
   blending: THREE.AdditiveBlending,
  depthWrite:false
}));
flameOuter.position.set(0, 2.05, 0.05);
flameOuter.scale.set(1.2, 2.1, 1);
torch.add(flameOuter);

const flameInner = new THREE.Sprite(new THREE.SpriteMaterial({
  map: flameTexInner,
  transparent:true,
  blending: THREE.AdditiveBlending,
  depthWrite:false
}));
flameInner.position.set(0, 1.92, 0.06);
flameInner.scale.set(0.75, 1.45, 1);
torch.add(flameInner);

const flameLight = new THREE.PointLight(0xff7a00, 2.4, 10);
flameLight.position.set(0, 1.95, 0.25);
flameLight.castShadow = true;
torch.add(flameLight);

/* =========================================================
   HEAT SHIMMER PARTICLES
   ========================================================= */
const heatParticleCount = 180; // Reduced for performance
const heatGeom = new THREE.BufferGeometry();
const heatPos = new Float32Array(heatParticleCount*3);
for(let i=0;i<heatParticleCount;i++){
  heatPos[i*3+0] = torch.position.x + (Math.random()-0.5)*2.2;
  heatPos[i*3+1] = -2.3 + Math.random()*2.4;
  heatPos[i*3+2] = (Math.random()-0.5)*3.2;
}
heatGeom.setAttribute('position', new THREE.BufferAttribute(heatPos,3));
const heatMat = new THREE.PointsMaterial({
  color: 0xff6a00,
  size: 0.05,
  transparent:true,
  opacity: 0.30,
  blending: THREE.AdditiveBlending,
  depthWrite:false
});
const heatPoints = new THREE.Points(heatGeom, heatMat);
scene.add(heatPoints);

/* =========================================================
   HEAT FLOW PARTICLES
   ========================================================= */
const flowCount = 100; // Reduced for performance
const flowGeom = new THREE.BufferGeometry();
const flowPos = new Float32Array(flowCount*3);
const flowVel = new Float32Array(flowCount);

for(let i=0;i<flowCount;i++){
  const t = Math.random();
  flowPos[i*3+0] = -rodLen/2 + t*rodLen;
  flowPos[i*3+1] = -0.05 + (Math.random()-0.5)*0.2;
  flowPos[i*3+2] = (Math.random()-0.5)*0.22;
  flowVel[i] = 0.8 + Math.random()*1.6;
}
flowGeom.setAttribute('position', new THREE.BufferAttribute(flowPos,3));
const flowMat = new THREE.PointsMaterial({
  color: 0xffcc66,
  size: 0.045,
  transparent:true,
  opacity: 0.0,
  blending: THREE.AdditiveBlending,
  depthWrite:false
});
const flow = new THREE.Points(flowGeom, flowMat);
scene.add(flow);

/* =========================================================
   PHYSICS - ITERATIVE WAVE PROPAGATION (FULL ROD)
   ========================================================= */
const physics = {
  temps: new Float32Array(segments).fill(20),
  k: 0.22,              // thermal conductivity
  playing: false,
  sourceTemp: 20,       // torch current temp
  targetTemp: 800,      // slider target
  time: 0,
  speed: 2.0,           // Animation speed
  elapsedTime: 0,
  maxTemp: 1200,
  coolingFactor: 0.01   // How fast heat dissipates to environment
};

let tempNext = new Float32Array(segments);
const clock = new THREE.Clock();

/* Update HUD */
function updateHUD() {
  const hot = physics.temps[0];
  const far = physics.temps[segments-1];
  const diff = hot - far;
  
  document.getElementById('hud-temp-hot').innerText = Math.round(hot) + "°C";
  document.getElementById('hud-temp').innerText = Math.round(far) + "°C";
  
  const heatFlowEl = document.getElementById('hud-state');
  if (diff > 200) {
    heatFlowEl.innerText = "Rapid Heating";
    heatFlowEl.style.color = "#ef4444";
  } else if (diff > 100) {
    heatFlowEl.innerText = "Strong Flow";
    heatFlowEl.style.color = "#f59e0b";
  } else if (diff > 30) {
    heatFlowEl.innerText = "Heat Flowing";
    heatFlowEl.style.color = "#06b6d4";
  } else if (diff > 5) {
    heatFlowEl.innerText = "Slow Transfer";
    heatFlowEl.style.color = "#6366f1";
  } else {
    heatFlowEl.innerText = "Equilibrium";
    heatFlowEl.style.color = "#10b981";
  }
  
  const statusEl = document.getElementById('hud-status');
  if (physics.playing) {
    statusEl.innerText = "Heating";
    statusEl.style.color = "#f59e0b";
  } else if (physics.sourceTemp > 25) {
    statusEl.innerText = "Cooling";
    statusEl.style.color = "#06b6d4";
  } else {
    statusEl.innerText = "Ready";
    statusEl.style.color = "#10b981";
  }
  
  heatFlowRate = Math.round((hot - far) * physics.k * 12);
  document.getElementById('stat-heat-flow').textContent = heatFlowRate + " W/m²";
  document.getElementById('stat-time').textContent = Math.round(physics.elapsedTime) + "s";
}

/* Buttons */
document.getElementById('play-btn').onclick = function(){
  physics.playing = !physics.playing;

  if (physics.playing) {
    this.innerHTML = '<i class="fas fa-pause"></i> Pause'; // Shortened for mobile
    this.classList.remove('pulse');
    // Instant jump for responsiveness
    physics.sourceTemp = physics.targetTemp;
  } else {
    this.innerHTML = '<i class="fas fa-play"></i> Start';
    this.classList.add('pulse');
  }

  updateHUD();
};

document.getElementById('reset-btn').onclick = function(){
  physics.playing = false;
  physics.temps.fill(20);
  physics.elapsedTime = 0;
  physics.sourceTemp = 20;
  
  document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i> Start';
  document.getElementById('play-btn').classList.add('pulse');
  
  // Reset rod scale
  rod.scale.set(1, 1, 1);
  
  flowMat.opacity = 0.0;
  // Graph reset removed
  updateHUD();
};

// SLIDER EVENT HANDLER
document.getElementById('heat-slider').oninput = (e) => {
  physics.targetTemp = 200 + e.target.value * 10; // Range: 200-1200°C
  document.getElementById('temp-display').innerText = Math.round(physics.targetTemp) + "°C";
  
  // Immediate color update when adjusting slider
  if (physics.playing) {
    updateRodColors();
  }
};

const BASE_COLORS = {
  glass: new THREE.Color(0x78c7ff),    // Lighter blue for glass
  iron:  new THREE.Color(0xffffff),    // PURE WHITE for Iron
  copper:new THREE.Color(0xffdec0)     // PALE PEACH for Copper
};

const materialBtns = Array.from(document.querySelectorAll('.material-btn'));
function setMaterial(type){
  currentMaterial = type;
  materialBtns.forEach(b=>b.classList.remove('active'));
  const btn = materialBtns.find(b => b.textContent.toLowerCase().includes(type));
  if(btn) btn.classList.add('active');

  physics.playing = false;
  physics.temps.fill(20);
  physics.elapsedTime = 0;
  physics.sourceTemp = 20;
  
  document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i> Start';
  document.getElementById('play-btn').classList.add('pulse');
  flowMat.opacity = 0.0;
  
  // Reset expansion
  rod.scale.set(1,1,1);

  let conductivityText = "Medium";
  
  if(type==='glass'){
    physics.k = 0.03;           // Very low conductivity for glass
    conductivityText = "Low";
    rodMat.metalness = 0.10; 
    rodMat.roughness = 0.10;
    rodMat.opacity = 0.35; 
    rodMat.transparent = true;
  }
  if(type==='iron'){
    physics.k = 0.15;           // Medium conductivity for iron
    conductivityText = "Medium";
    rodMat.metalness = 0.50;    // LOWER METALNESS to show bright color
    rodMat.roughness = 0.30;
    rodMat.opacity = 1; 
    rodMat.transparent = false;
  }
  if(type==='copper'){
    physics.k = 0.40;           // High conductivity for copper
    conductivityText = "High";
    rodMat.metalness = 0.50;    // LOWER METALNESS to show bright color
    rodMat.roughness = 0.30;
    rodMat.opacity = 1; 
    rodMat.transparent = false;
  }
  
  rodMat.needsUpdate = true;
  document.getElementById('stat-conductivity').innerText = conductivityText;
  
  // Graph reset removed
  updateHUD();
}

/* Theme */
function applyThemeScene(){
  if(isDarkMode){
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.045);
    keyLight.intensity = 1.2; // Boosted
    hemi.intensity = 0.8;     // Boosted
    flameLight.intensity = 2.4;
    heatMat.opacity = 0.30;
  }else{
    scene.background = makeSkyTexture();
    scene.fog = new THREE.FogExp2(0xcfeeff, 0.017);
    keyLight.intensity = 1.4;
    hemi.intensity = 0.85;
    flameLight.intensity = 2.0;
    heatMat.opacity = 0.22;
  }
}

/* =========================================================
   UPDATE PHYSICS - ITERATIVE WAVE PROPAGATION (FULL ROD)
   ========================================================= */
function updatePhysics(dtReal){
  const dt = Math.min(0.05, dtReal); // Cap delta time for stability

  if (physics.playing) {
    physics.elapsedTime += dt;

    // 1. Heat Source Logic
    // Smoothly ramp the torch temp to the target slider value
    physics.sourceTemp += (physics.targetTemp - physics.sourceTemp) * 0.1;

    // Apply heat to the first FEW segments (simulate a flame width)
    const flameWidth = 5; 
    for(let i=0; i<flameWidth; i++) {
        const factor = 1 - (i / flameWidth); 
        physics.temps[i] += (physics.sourceTemp - physics.temps[i]) * 0.3 * factor; // Increased driving force
    }

    tempNext.set(physics.temps);

    // 2. Material Properties (Adjusted for FULL propagation)
    let diffusionRate, coolingRate;
    
    // Values tuned so diffusion >> cooling, allowing full travel
    if(currentMaterial === 'glass') {
      diffusionRate = 1.0;   
      coolingRate = 0.02;    
    } else if(currentMaterial === 'iron') {
      diffusionRate = 8.0;   // High diffusion
      coolingRate = 0.005;   // Very low cooling to reach end
    } else { // copper
      diffusionRate = 18.0;  // Extremely high diffusion
      coolingRate = 0.002;   // Minimal cooling
    }

    // 3. Conduction Loop (Iterate multiple times for stability at high speeds)
    const iterations = 8; // More iterations for smoothness
    for(let k=0; k<iterations; k++) {
        for (let i = 1; i < segments - 1; i++) {
            const leftTemp = physics.temps[i - 1];
            const centerTemp = physics.temps[i];
            const rightTemp = physics.temps[i + 1];
            
            // Standard 1D Heat Equation
            const conduction = (diffusionRate / iterations) * (leftTemp + rightTemp - 2 * centerTemp);
            
            // Newton's Law of Cooling
            const cooling = (coolingRate / iterations) * (centerTemp - 20); 

            physics.temps[i] += (conduction - cooling) * dt;
        }
        // Boundary condition: right tip cools to air
        physics.temps[segments-1] += ((diffusionRate/iterations) * (physics.temps[segments-2] - physics.temps[segments-1]) - (coolingRate/iterations)*(physics.temps[segments-1]-20)) * dt;
    }
    
    // Graph update removed

  } else {
    // Slower Cooldown logic - 100x slower than before
    for(let i = 0; i < segments; i++){
        // Cooling factor reduced from 0.5 to 0.005 for realistic heat retention
        physics.temps[i] -= 0.005 * (physics.temps[i] - 20) * dt;
    }
    // Also cool the source temp slowly
    physics.sourceTemp -= 0.1 * (physics.sourceTemp - 20) * dt;
  }
  
  // --- THERMAL EXPANSION LOGIC ---
  // Calculate average temperature
  let totalTemp = 0;
  for(let i=0; i<segments; i++) totalTemp += physics.temps[i];
  const avgTemp = totalTemp / segments;
  
  // Coefficient of expansion (arbitrary scaling for visual effect)
  let expansionCoeff = 0.00005; // Base
  if(currentMaterial === 'iron') expansionCoeff = 0.00012;
  if(currentMaterial === 'copper') expansionCoeff = 0.00018; // Copper expands more
  if(currentMaterial === 'glass') expansionCoeff = 0.00002;  // Glass expands very little
  
  // Calculate new scale (1.0 is base length)
  // Delta T = avgTemp - 20
  const expansion = 1.0 + (avgTemp - 20) * expansionCoeff;
  
  // Apply scaling to the rod mesh (Y-axis is length because of rotation)
  rod.scale.y = expansion;
  // -------------------------------

  updateHUD();
}

/* =========================================================
   ROD COLOR UPDATE - GLOWING EFFECT (BRIGHT ORANGE MAX)
   ========================================================= */
function updateRodColors(){
  const colors = rodGeo.attributes.color;
  const pos = rodGeo.attributes.position;
  const base = BASE_COLORS[currentMaterial];
  
  // Define heat colors (Blackbody radiation approximation)
  // Dark Red -> Bright Orange (No White)
  const heatColor1 = new THREE.Color(0x330000); // Black/Dark Red start
  const heatColor2 = new THREE.Color(0xcc0000); // Dull Red
  const heatColor3 = new THREE.Color(0xff4400); // Cherry Red
  const heatColor4 = new THREE.Color(0xffaa00); // MAX: Bright Vibrant Orange

  const col = new THREE.Color();
  const mixColor = new THREE.Color();

  for (let i = 0; i < vCount; i++) {
    const x = pos.getX(i);
    // Map position to segment index
    const ratio = (x + rodLen / 2) / rodLen;
    const idx = Math.min(segments - 1, Math.max(0, Math.floor(ratio * segments)));

    const temp = physics.temps[idx];
    
    // Start with base material color
    col.copy(base);

    // Visual Thresholds (degrees C) - Lowered start point for visual effect at end of rod
    if (temp > 180) {
        let t = 0;
        
        if (temp < 400) {
            // Base -> Dull Red
            t = (temp - 180) / 220;
            mixColor.copy(heatColor2);
            col.lerp(mixColor, t * 0.85); 
        } else if (temp < 750) {
            // Dull Red -> Cherry Red
            t = (temp - 400) / 350;
            col.copy(heatColor2).lerp(heatColor3, t);
        } else {
            // Cherry Red -> Bright Orange (Max)
            t = (temp - 750) / 450; 
            t = Math.min(1, t);
            col.copy(heatColor3).lerp(heatColor4, t);
        }
    }
    
    colors.setXYZ(i, col.r, col.g, col.b);
  }
  colors.needsUpdate = true;
}

/* Effects */
function updateEffects(){
  physics.time += 0.08;

  // Flame animation
  const flameIntensity = physics.playing
    ? Math.min(1, physics.targetTemp / physics.maxTemp)
    : 0;

  const flick = 0.25 + flameIntensity * 1.35 + Math.sin(physics.time * 7) * 0.08;

  flameOuter.visible = physics.playing;
  flameInner.visible = physics.playing;
  flameOuter.scale.set(1.2 * flick, 2.2 * flick, 1);
  flameInner.scale.set(0.75 * flick, 1.5 * flick, 1);
  flameLight.intensity = physics.playing ? 2.5 * flameIntensity : 0;

  // Heat shimmer
  const pAttr = heatPoints.geometry.attributes.position;
  const particleSpeed = physics.playing ? 0.04 : 0.01;
  
  for(let i=0;i<heatParticleCount;i++){
    const y = pAttr.getY(i) + particleSpeed + Math.random()*0.01;
    pAttr.setY(i, y);
    if(y > 2.2){
      pAttr.setX(i, torch.position.x + (Math.random()-0.5)*2.2);
      pAttr.setY(i, -2.2 + Math.random()*0.6);
      pAttr.setZ(i, (Math.random()-0.5)*3.2);
    }
  }
  pAttr.needsUpdate = true;

  // Heat flow particles
  const fAttr = flow.geometry.attributes.position;
  if(physics.playing){
    const flowSpeed = 0.025 * (1 + physics.k * 2);
    
    for(let i=0;i<flowCount;i++){
      let x = fAttr.getX(i);
      x += flowSpeed * flowVel[i];
      
      if(x > rodLen/2){
        x = -rodLen/2 + Math.random()*0.8;
        fAttr.setY(i, -0.05 + (Math.random()-0.5)*0.2);
        fAttr.setZ(i, (Math.random()-0.5)*0.22);
      }
      fAttr.setX(i, x);
    }
    
    const diff = physics.temps[0] - physics.temps[segments-1];
    const maxDiff = physics.maxTemp - 20;
    flowMat.opacity = Math.min(0.6, (diff / maxDiff) * 1.2);
    
    const tempRatio = physics.temps[0] / physics.maxTemp;
    flowMat.color.setHSL(0.08 + tempRatio * 0.05, 0.8, 0.6 + tempRatio * 0.3);
  } else {
    flowMat.opacity *= 0.92;
  }
  fAttr.needsUpdate = true;
}

/* Resize */
function handleResize(){
  const w = container.clientWidth || 1;
  const h = container.clientHeight || 1;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', handleResize);
// Orientation change handling for mobile
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100);
});

/* =========================================================
   EVENT LISTENERS REPLACEMENT (NO INLINE ONCLICK)
   ========================================================= */

// Navigation Events
document.getElementById('btn-tab-sim').addEventListener('click', function() {
    switchTab('tab-simulation', 'btn-tab-sim');
});
document.getElementById('btn-tab-ov').addEventListener('click', function() {
    switchTab('tab-overview', 'btn-tab-ov');
});
document.getElementById('btn-tab-act').addEventListener('click', function() {
    switchTab('tab-activities', 'btn-tab-act');
});

// Material Selection Events
document.getElementById('btn-mat-glass').addEventListener('click', function() {
    setMaterial('glass');
});
document.getElementById('btn-mat-iron').addEventListener('click', function() {
    setMaterial('iron');
});
document.getElementById('btn-mat-copper').addEventListener('click', function() {
    setMaterial('copper');
});


/* Animate */
function animate(){
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  updatePhysics(dt);
  updateRodColors();
  updateEffects();
  renderer.render(scene, camera);
}

/* INIT */
refreshThemeUI();
applyThemeScene();
setMaterial('iron');
setTimeout(handleResize, 60);
animate();