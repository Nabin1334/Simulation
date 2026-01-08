import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(25, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 8, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(15, 25, 15);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
scene.add(sun);

const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.4);
fillLight.position.set(-10, 10, -10);
scene.add(fillLight);

// Floor
const gridHelper = new THREE.GridHelper(80, 60, 0xbfdbfe, 0xe0f2fe);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

const floorGeometry = new THREE.PlaneGeometry(80, 80);
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.85,
    metalness: 0.05
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI/2;
floor.receiveShadow = true;
scene.add(floor);

// Water puddle system
const waterPuddles = [];
const maxPuddles = 30;

for (let i = 0; i < maxPuddles; i++) {
    const puddleGeo = new THREE.CircleGeometry(1, 32);
    const puddleMat = new THREE.MeshPhysicalMaterial({
        color: 0x3b82f6,
        roughness: 0.1,
        metalness: 0.05,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
        clearcoat: 0.5
    });
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.y = 0.03;
    puddle.scale.set(0, 0, 0);
    puddle.visible = false;
    scene.add(puddle);
    
    waterPuddles.push({
        mesh: puddle,
        x: 0, z: 0,
        radius: 0,
        maxRadius: 0,
        life: 0,
        growing: false,
        active: false
    });
}

// Splash particles
const splashCount = 400;
const splashGeo = new THREE.BufferGeometry();
const splashPos = new Float32Array(splashCount * 3);
const splashSizes = new Float32Array(splashCount);
const splashVel = [];

for (let i = 0; i < splashCount; i++) {
    splashPos[i * 3] = 0;
    splashPos[i * 3 + 1] = -10;
    splashPos[i * 3 + 2] = 0;
    splashSizes[i] = 0;
    splashVel.push({ x:0, y:0, z:0, life:0 });
}

splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
splashGeo.setAttribute('size', new THREE.BufferAttribute(splashSizes, 1));

const splashMat = new THREE.PointsMaterial({
    color: 0x60a5fa,
    size: 0.25,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
});

const splashSystem = new THREE.Points(splashGeo, splashMat);
scene.add(splashSystem);

// Bottle
const bottleR = 4;
const bottleH = 22;
const startWaterH = 19;

const bottleGeo = new THREE.CylinderGeometry(bottleR, bottleR, bottleH, 32);
const bottleMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, 
    metalness: 0, 
    roughness: 0.04, 
    transmission: 0.96, 
    thickness: 0.5, 
    transparent: true, 
    opacity: 0.25,
    clearcoat: 1,
    side: THREE.DoubleSide
});
const bottle = new THREE.Mesh(bottleGeo, bottleMat);
bottle.position.y = bottleH / 2;
bottle.castShadow = true;
bottle.receiveShadow = true;
scene.add(bottle);

const edges = new THREE.EdgesGeometry(bottleGeo);
const lineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 });
const wireframe = new THREE.LineSegments(edges, lineMat);
bottle.add(wireframe);

// Ruler markings
for(let i = 0; i <= bottleH; i += 2) {
    const mark = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.08, 0.08), 
        new THREE.MeshStandardMaterial({ color: 0x64748b })
    );
    mark.position.set(bottleR + 0.2, i, 0);
    scene.add(mark);
}

// Water texture
const waterCanvas = document.createElement('canvas');
waterCanvas.width = 512;
waterCanvas.height = 512;
const ctx = waterCanvas.getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 512);
gradient.addColorStop(0, '#60a5fa');
gradient.addColorStop(0.5, '#3b82f6');
gradient.addColorStop(1, '#2563eb');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 512, 512);

for(let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(191, 219, 254, ${Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 4, 0, Math.PI * 2);
    ctx.fill();
}

const waterTex = new THREE.CanvasTexture(waterCanvas);
waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
waterTex.repeat.set(2, 4);

// Water column
const waterGeo = new THREE.CylinderGeometry(bottleR - 0.15, bottleR - 0.15, 1, 32);
waterGeo.translate(0, 0.5, 0);
const waterMat = new THREE.MeshPhysicalMaterial({
    map: waterTex,
    color: 0x2563eb, 
    transmission: 0.3, 
    roughness: 0.1, 
    opacity: 0.92, 
    transparent: true,
    clearcoat: 0.5,
    metalness: 0.1
});
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.scale.y = startWaterH;
waterMesh.castShadow = true;
waterMesh.receiveShadow = true;
scene.add(waterMesh);

// Water surface
const surfaceGeo = new THREE.CircleGeometry(bottleR - 0.15, 32);
const surfaceMat = new THREE.MeshPhysicalMaterial({
    color: 0x60a5fa,
    metalness: 0.2,
    roughness: 0.05,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
});
const waterSurface = new THREE.Mesh(surfaceGeo, surfaceMat);
waterSurface.rotation.x = -Math.PI / 2;
scene.add(waterSurface);

// Holes setup
const holes = [
    { id: 'top', y: 16, color: 0xef4444, mesh: null, tape: null, stream: null },
    { id: 'mid', y: 10, color: 0xf59e0b, mesh: null, tape: null, stream: null },
    { id: 'bot', y: 4, color: 0x10b981, mesh: null, tape: null, stream: null }
];

holes.forEach(h => {
    // Hole/nozzle
    const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.6, 16), 
        new THREE.MeshStandardMaterial({ 
            color: 0x1e293b,
            metalness: 0.6,
            roughness: 0.3
        })
    );
    nozzle.rotation.z = -Math.PI/2;
    nozzle.position.set(bottleR + 0.1, h.y, 0);
    nozzle.castShadow = true;
    scene.add(nozzle);
    h.mesh = nozzle;

    // Tape
    const tape = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.6, 0.6), 
        new THREE.MeshStandardMaterial({ 
            color: 0xfbbf24,
            roughness: 0.5,
            metalness: 0.1
        })
    );
    tape.position.set(bottleR + 0.5, h.y, 0);
    tape.castShadow = true;
    scene.add(tape);
    h.tape = tape;

    // Stream
    const streamMat = new THREE.MeshPhysicalMaterial({
        color: 0x3b82f6, 
        transmission: 0.5, 
        opacity: 0.95, 
        transparent: true, 
        side: THREE.DoubleSide,
        roughness: 0.08,
        metalness: 0.1,
        clearcoat: 0.3
    });
    const stream = new THREE.Mesh(new THREE.BufferGeometry(), streamMat);
    stream.visible = false;
    stream.castShadow = true;
    scene.add(stream);
    h.stream = stream;
});

// State
let isDraining = false;
let currentWaterLevel = startWaterH;
let floorWaterAmount = 0;
let time = 0;

const uiLevel = document.getElementById('val-level');
const uiFloor = document.getElementById('val-floor');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const uiVals = {
    top: document.getElementById('val-top'),
    mid: document.getElementById('val-mid'),
    bot: document.getElementById('val-bot')
};

function createSplash(x, z, intensity) {
    for (let i = 0; i < Math.min(intensity * 12, 20); i++) {
        const index = splashVel.findIndex(p => p.life <= 0);
        if (index !== -1) {
            const positions = splashGeo.attributes.position.array;
            positions[index * 3] = x + (Math.random() - 0.5) * 0.6;
            positions[index * 3 + 1] = 0.3;
            positions[index * 3 + 2] = z + (Math.random() - 0.5) * 0.6;
            
            splashVel[index] = {
                x: (Math.random() - 0.5) * intensity * 0.4,
                y: Math.random() * intensity * 0.9,
                z: (Math.random() - 0.5) * intensity * 0.4,
                life: 1
            };
        }
    }
}

function createWaterPuddle(x, z, amount) {
    let targetPuddle = waterPuddles.find(p => !p.active);
    
    if (targetPuddle) {
        targetPuddle.x = x;
        targetPuddle.z = z;
        targetPuddle.radius = 0.1;
        targetPuddle.maxRadius = Math.min(amount * 0.4, 2.5);
        targetPuddle.life = 1;
        targetPuddle.growing = true;
        targetPuddle.active = true;
        targetPuddle.mesh.position.x = x;
        targetPuddle.mesh.position.z = z;
        targetPuddle.mesh.scale.set(0.1, 0.1, 0.1);
        targetPuddle.mesh.visible = true;
        
        floorWaterAmount = Math.min(floorWaterAmount + amount * 0.15, 100);
        uiFloor.innerText = floorWaterAmount.toFixed(0) + "%";
    }
}

function startExperiment() {
    if(isDraining) return;
    isDraining = true;
    
    holes.forEach(h => {
        h.tape.visible = false;
    });
    
    document.getElementById('btn-start').style.display = 'none';
    document.getElementById('btn-reset').style.display = 'block';
    statusDot.classList.add('active');
    statusText.textContent = 'Draining Active';
}

function resetExperiment() {
    isDraining = false;
    currentWaterLevel = startWaterH;
    waterMesh.scale.y = startWaterH;
    floorWaterAmount = 0;
    
    waterPuddles.forEach(p => {
        p.active = false;
        p.mesh.visible = false;
        p.mesh.scale.set(0, 0, 0);
    });
    
    splashVel.forEach(p => p.life = 0);
    
    holes.forEach(h => {
        h.tape.visible = true;
        h.stream.visible = false;
        if (h.stream.geometry) h.stream.geometry.dispose();
    });

    document.getElementById('btn-start').style.display = 'block';
    document.getElementById('btn-reset').style.display = 'none';
    uiLevel.innerText = "100%";
    uiFloor.innerText = "0%";
    Object.values(uiVals).forEach(el => el.innerText = "0 cm");
    statusDot.classList.remove('active');
    statusText.textContent = 'Ready to Start';
}

document.getElementById('btn-start').addEventListener('click', startExperiment);
document.getElementById('btn-reset').addEventListener('click', resetExperiment);

function updatePhysics() {
    if(!isDraining) return;

    const gravity = 9.81;
    let totalOutflow = 0;

    holes.forEach(h => {
        const head = currentWaterLevel - h.y;

        if (head <= 0) {
            h.stream.visible = false;
            uiVals[h.id].innerText = "0 cm";
        } else {
            h.stream.visible = true;
            
            const velocity = Math.sqrt(2 * gravity * head);
            totalOutflow += velocity;

            const curvePoints = [];
            const origin = new THREE.Vector3(bottleR + 0.4, h.y, 0);
            
            let t = 0;
            let x = 0; 
            let y = 0;
            let impactX = 0;
            
            while(true) {
                x = velocity * t;
                y = -0.5 * gravity * t * t;
                
                const worldY = origin.y + y;
                if(worldY < 0.1) {
                    impactX = origin.x + x;
                    const impactZ = (Math.random() - 0.5) * 0.4;
                    
                    curvePoints.push(new THREE.Vector3(impactX, 0.1, impactZ));
                    
                    if (Math.random() > 0.6) {
                        createSplash(impactX, impactZ, velocity * 0.15);
                        createWaterPuddle(impactX, impactZ, velocity * 0.08);
                    }
                    
                    break; 
                }
                
                curvePoints.push(new THREE.Vector3(origin.x + x, worldY, 0));
                t += 0.04;
            }

            if (h.stream.geometry) h.stream.geometry.dispose();
            
            const curve = new THREE.CatmullRomCurve3(curvePoints);
            const radius = 0.2 * Math.min(1, head / 8);
            h.stream.geometry = new THREE.TubeGeometry(curve, 40, radius, 12, false);

            uiVals[h.id].innerText = (x * 2).toFixed(1) + " cm";
        }
    });

    if (currentWaterLevel > 0) {
        const dropAmount = totalOutflow * 0.006;
        currentWaterLevel = Math.max(0, currentWaterLevel - dropAmount);
        
        waterMesh.scale.y = currentWaterLevel;
        waterSurface.position.y = currentWaterLevel;
        waterSurface.rotation.z = Math.sin(time * 0.5) * 0.02;
        
        const pct = (currentWaterLevel / startWaterH) * 100;
        uiLevel.innerText = pct.toFixed(0) + "%";
        
        if (currentWaterLevel <= 0.1) {
            isDraining = false;
            statusDot.classList.remove('active');
            statusText.textContent = 'Container Empty';
        }
    }
    
    // Update puddles
    waterPuddles.forEach(puddle => {
        if (puddle.active) {
            if (puddle.growing) {
                puddle.radius = Math.min(puddle.radius + 0.02, puddle.maxRadius);
                puddle.mesh.scale.set(puddle.radius, puddle.radius, puddle.radius);
                
                if (puddle.radius >= puddle.maxRadius) puddle.growing = false;
            }
            
            puddle.life -= 0.002;
            
            if (puddle.life <= 0) {
                puddle.active = false;
                puddle.mesh.visible = false;
            }
        }
    });
    
    // Update splash
    const positions = splashGeo.attributes.position.array;
    const sizes = splashGeo.attributes.size.array;
    
    splashVel.forEach((particle, index) => {
        if (particle.life > 0) {
            positions[index * 3] += particle.x;
            positions[index * 3 + 1] += particle.y;
            positions[index * 3 + 2] += particle.z;
            
            particle.y -= 0.015;
            particle.life -= 0.02;
            sizes[index] = 0.25 * particle.life;
            
            if (positions[index * 3 + 1] < 0.05) {
                positions[index * 3 + 1] = 0.05;
                particle.y = -particle.y * 0.3;
            }
        } else {
            positions[index * 3 + 1] = -10;
            sizes[index] = 0;
        }
    });
    
    splashGeo.attributes.position.needsUpdate = true;
    splashGeo.attributes.size.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.016;
    
    waterTex.offset.y -= 0.002;
    
    controls.update();
    updatePhysics();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();