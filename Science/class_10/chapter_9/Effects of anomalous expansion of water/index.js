import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ========== PHYSICS (unchanged) ========== */
function density(T){
  if(T<=0) return 0.9168;
  const t=Math.min(Math.max(T,0),100);
  return(999.842594+6.793952e-2*t-9.095290e-3*t*t
        +1.001685e-4*t*t*t-1.120083e-6*Math.pow(t,4)
        +6.536332e-9*Math.pow(t,5))/1000;
}
const D4=density(4);

/* ========== RENDERER & SCENE ========== */
const canvas=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.3;
renderer.outputEncoding=THREE.sRGBEncoding;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x030a14);

const camera=new THREE.PerspectiveCamera(44,1,0.1,200);
camera.position.set(0,5.2,24);
camera.lookAt(0,2.5,0);

function resize(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  if(renderer.domElement.width===w&&renderer.domElement.height===h)return;
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

/* ========== LIGHTING ========== */
scene.add(new THREE.AmbientLight(0x1e2f4a,1.0));
const sun=new THREE.DirectionalLight(0xfff2d6,3.2);
sun.position.set(10,18,14);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:5,far:40});
sun.shadow.bias=-0.0008; sun.shadow.normalBias=0.02;
scene.add(sun);
const fill1=new THREE.DirectionalLight(0xaaccff,0.9);
fill1.position.set(-8,6,-10);
scene.add(fill1);
const fill2=new THREE.PointLight(0x1e3a5f,0.5,30);
fill2.position.set(0,-6,6);
scene.add(fill2);
const rim=new THREE.DirectionalLight(0xccddff,1.4);
rim.position.set(0,5,-16);
scene.add(rim);
const wglow=new THREE.PointLight(0x2a9df4,2.0,20);
wglow.position.set(0,0,0);
scene.add(wglow);
const heatL=new THREE.PointLight(0xff5500,0,14);
heatL.position.set(0,-4.8,0);
scene.add(heatL);
const coldL=new THREE.PointLight(0x2266ff,0,14);
coldL.position.set(0,-4.8,0);
scene.add(coldL);
const specLight=new THREE.PointLight(0xffffff,0.6,20);
specLight.position.set(4,10,8);
scene.add(specLight);

/* ========== LAB STAND (unchanged) ========== */
const tableMat=new THREE.MeshStandardMaterial({color:0x3a2c1f,roughness:0.75});
const table=new THREE.Mesh(new THREE.BoxGeometry(30,1.2,16),tableMat);
table.position.set(0,-7.8,0); table.receiveShadow=true; table.castShadow=true;
scene.add(table);
const legMat=new THREE.MeshStandardMaterial({color:0x9bb7d4,roughness:0.28,metalness:0.92});
for(let i=0;i<3;i++){
  const angle=(i/3)*Math.PI*2;
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,7.2,12),legMat);
  leg.position.set(Math.cos(angle)*3.8,-4.5+0.6,Math.sin(angle)*3.8);
  leg.rotation.z=Math.cos(angle)*0.18; leg.rotation.x=Math.sin(angle)*0.18;
  leg.castShadow=true;leg.receiveShadow=true; scene.add(leg);
}
const ringMat=new THREE.MeshStandardMaterial({color:0xc0d0e0,roughness:0.22,metalness:0.95});
const ringGeo=new THREE.TorusGeometry(4.6,0.15,16,64);
const ringMesh=new THREE.Mesh(ringGeo,ringMat);
ringMesh.rotation.x=Math.PI/2; ringMesh.position.y=-1.7;
ringMesh.castShadow=true;ringMesh.receiveShadow=true; scene.add(ringMesh);
const bplateMat=new THREE.MeshStandardMaterial({color:0x70869c,roughness:0.35,metalness:0.85});
const bplate=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.6,0.8,32),bplateMat);
bplate.position.y=-5.5; bplate.castShadow=true;bplate.receiveShadow=true; scene.add(bplate);
const hpadMat=new THREE.MeshStandardMaterial({color:0x222222,roughness:0.7,metalness:0.2,emissive:0x000000});
const hpad=new THREE.Mesh(new THREE.CylinderGeometry(4.0,4.0,0.4,32),hpadMat);
hpad.position.y=-5.0; hpad.castShadow=true;hpad.receiveShadow=true; scene.add(hpad);

/* ========== REALISTIC BEAKER - Clear, Visible, Understandable ========== */
const BR=3.9;        // Slightly larger for better visibility
const BH=12.5;       // Height
const BBOT=-4.8;     // Bottom Y

// Outer glass - very transparent, slight blue tint
const glassOuterMat=new THREE.MeshPhysicalMaterial({
  color:0xe0f0ff,
  transmission:0.98,
  roughness:0.008,
  metalness:0,
  ior:1.52,
  thickness:3.0,
  transparent:true,
  opacity:0.18,
  side:THREE.DoubleSide,
  clearcoat:1.0,
  clearcoatRoughness:0.1
});

// Main glass cylinder
const bwall=new THREE.Mesh(new THREE.CylinderGeometry(BR,BR,BH,80,1,true),glassOuterMat);
bwall.position.y=BBOT+BH/2;
bwall.castShadow=true;
bwall.receiveShadow=true;
bwall.renderOrder=15;
scene.add(bwall);

// Inner glass layer for depth
const glassInnerMat=new THREE.MeshPhysicalMaterial({
  color:0xf5faff,
  transmission:0.95,
  roughness:0.005,
  ior:1.34,
  thickness:2.0,
  transparent:true,
  opacity:0.15,
  side:THREE.BackSide
});
const binner=new THREE.Mesh(new THREE.CylinderGeometry(BR-0.15,BR-0.15,BH-0.4,80,1,true),glassInnerMat);
binner.position.y=BBOT+BH/2;
binner.renderOrder=16;
scene.add(binner);

// Bottom disc - clear glass
const bbaseMat=new THREE.MeshPhysicalMaterial({
  color:0xe0f0ff,
  transmission:0.98,
  roughness:0.01,
  ior:1.52,
  thickness:2.0,
  transparent:true,
  opacity:0.2,
  side:THREE.DoubleSide
});
const bbase=new THREE.Mesh(new THREE.CircleGeometry(BR-0.05,64),bbaseMat);
bbase.rotation.x=-Math.PI/2;
bbase.position.y=BBOT;
bbase.renderOrder=14;
scene.add(bbase);

// Thick rim at top - frosted glass look
const rimMat=new THREE.MeshStandardMaterial({
  color:0xaac0d0,
  roughness:0.25,
  metalness:0.2,
  emissive:0x112233
});
const brim=new THREE.Mesh(new THREE.TorusGeometry(BR,0.2,16,80),rimMat);
brim.rotation.x=Math.PI/2;
brim.position.y=BBOT+BH;
brim.castShadow=true;
brim.receiveShadow=true;
scene.add(brim);

// Clear volume measurement lines (engraved look)
const lineMat=new THREE.MeshStandardMaterial({color:0x88aacc,emissive:0x112244});
for(let i=1;i<=6;i++){
  const lineY=BBOT + i*1.8;
  if(lineY < BBOT+BH-0.5) {
    const line=new THREE.Mesh(new THREE.TorusGeometry(BR+0.02,0.035,8,80,Math.PI*0.03),lineMat);
    line.rotation.x=Math.PI/2;
    line.position.y=lineY;
    line.scale.set(1,0.02,1);
    line.castShadow=true;
    scene.add(line);
    
    // Small number indicators (simulated with tiny spheres)
    const numPos=new THREE.Mesh(new THREE.SphereGeometry(0.08,6),new THREE.MeshStandardMaterial({color:0xaaccff}));
    numPos.position.set(BR+0.3, lineY, 0);
    scene.add(numPos);
  }
}

// Add subtle highlight on glass edges
const edgeMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x446688});
const edgeRing=new THREE.Mesh(new THREE.TorusGeometry(BR-0.02,0.03,8,80),edgeMat);
edgeRing.rotation.x=Math.PI/2;
edgeRing.position.y=BBOT+0.2;
edgeRing.renderOrder=17;
scene.add(edgeRing);

/* ========== WATER BODY - More Visible, Realistic ========== */
const wbGeo=new THREE.CylinderGeometry(BR-0.4,BR-0.4,1,64);
wbGeo.translate(0,0.5,0);
const wbMat=new THREE.MeshPhysicalMaterial({
  color:0x3a8fe0,
  emissive:0x001122,
  transmission:0.92,
  roughness:0.02,
  metalness:0,
  thickness:5,
  ior:1.33,
  transparent:true,
  opacity:0.55,
  attenuationColor:new THREE.Color(0x2266aa),
  attenuationDistance:4.0,
  side:THREE.DoubleSide,
  depthWrite:false
});
const wbM=new THREE.Mesh(wbGeo,wbMat);
wbM.renderOrder=3;
scene.add(wbM);

// Water surface with enhanced visibility
const VS=`uniform float uT; uniform float uAmp; varying vec3 vP; varying vec3 vN; varying vec2 vUv;
vec3 gw(vec2 xz,vec2 d,float a,float k,float sp,float ph){ return vec3(0.,a*sin(k*dot(d,xz)+sp*uT+ph),0.); }
void main(){ vUv=uv; vec3 p=position;
  p+=gw(p.xz,normalize(vec2(1.,0.5)), .22*uAmp,0.9,1.3,0.0);
  p+=gw(p.xz,normalize(vec2(-0.7,0.8)), .16*uAmp,1.4,1.7,1.2);
  p+=gw(p.xz,normalize(vec2(0.6,-0.6)), .12*uAmp,2.3,2.1,2.5);
  p+=gw(p.xz,normalize(vec2(0.9,0.3)), .08*uAmp,3.5,3.0,1.8);
  p+=gw(p.xz,normalize(vec2(-0.4,-0.9)), .05*uAmp,5.2,4.0,3.3);
  vP=(modelMatrix*vec4(p,1.)).xyz;
  float e=0.1; vec3 px=position+vec3(e,0,0); px+=gw(px.xz,normalize(vec2(1.,0.5)),.22*uAmp,0.9,1.3,0.0); px+=gw(px.xz,normalize(vec2(-0.7,0.8)),.16*uAmp,1.4,1.7,1.2);
  vec3 pz=position+vec3(0,0,e); pz+=gw(pz.xz,normalize(vec2(1.,0.5)),.22*uAmp,0.9,1.3,0.0); pz+=gw(pz.xz,normalize(vec2(-0.7,0.8)),.16*uAmp,1.4,1.7,1.2);
  vN=normalMatrix*normalize(cross(normalize(pz-p+vec3(0,0,e)),normalize(px-p+vec3(e,0,0))));
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const FS=`precision highp float; uniform float uT; uniform float uTemp; uniform vec3 uCam; varying vec3 vP; varying vec3 vN; varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.545);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.2;a*=.5;}return v;}
void main(){ float T=uTemp; vec3 deep; float rough, alpha, foam=0.0;
  if(T<=0.){deep=vec3(.65,.85,.96); rough=.02; alpha=.92; foam=0.;}
  else if(T<4.){float f=T/4.; deep=mix(vec3(.65,.85,.96),vec3(.20,.70,.95),f); rough=.025; alpha=.88; foam=0.;}
  else if(T<30.){float f=(T-4.)/26.; deep=mix(vec3(.20,.70,.95),vec3(.10,.50,.85),f); rough=.03; alpha=.83; foam=0.;}
  else if(T<60.){float f=(T-30.)/30.; deep=mix(vec3(.10,.50,.85),vec3(.05,.30,.70),f); rough=.045; alpha=.74; foam=0.;}
  else if(T<80.){float f=(T-60.)/20.; deep=mix(vec3(.05,.30,.70),vec3(.25,.20,.40),f); rough=.08; alpha=.60; foam=0.;}
  else if(T<98.){float f=(T-80.)/18.; deep=mix(vec3(.25,.20,.40),vec3(.65,.15,.15),f); rough=.15; alpha=.45; foam=0.;}
  else if(T<101.){ deep=vec3(.80,.50,.40); rough=.28; alpha=.28; foam=0.5; }
  else{ deep=vec3(.90,.85,.90); rough=.42; alpha=.10; foam=1.0; }
  vec3 N=normalize(vN); vec3 V=normalize(uCam-vP); vec3 L=normalize(vec3(0.8,1.0,0.6)); vec3 H=normalize(L+V);
  float nv=fbm(vUv*12.+uT*0.2); N+=vec3((nv-0.5)*0.4,(nv-0.5)*0.2,(nv-0.5)*0.4); N=normalize(N);
  float NdV=max(dot(N,V),0.); float NdL=max(dot(N,L),0.); float NdH=max(dot(N,H),0.);
  float F=0.02+0.98*pow(1.-NdV,5.); float a=rough*rough+0.001; float D=(a*a)/(3.14159*pow(NdH*NdH*(a*a-1.)+1.,2.));
  vec3 spec=vec3(1.0)*D*F*NdL*0.9; float sss=pow(max(dot(-L,-V),0.),2.5)*0.8;
  vec3 col=deep*NdL*0.7*(1.-F)+deep*sss*1.8+deep*(0.5+0.5*NdV)*0.3;
  if(foam>0.0){ float fpat=fbm(vUv*20.+uT*3.0); col=mix(col,vec3(0.95,0.95,1.0),smoothstep(0.3,0.7,fpat)*foam*0.9); }
  col+=spec; col+=vec3(0.05,0.1,0.15)*pow(1.-NdV,2.);
  gl_FragColor=vec4(col,alpha);}`;
const surfGeo=new THREE.CircleGeometry(BR-0.4,80);
surfGeo.rotateX(-Math.PI/2);
const surfMat=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,uniforms:{uT:{value:0},uAmp:{value:0.4},uTemp:{value:20},uCam:{value:camera.position}},transparent:true,depthWrite:false,side:THREE.FrontSide});
const surfM=new THREE.Mesh(surfGeo,surfMat); surfM.renderOrder=7; scene.add(surfM);

/* ========== REALISTIC ICE ========== */
function createRealisticIceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#d8ecff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for(let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.random()*0.5})`;
    ctx.lineWidth = 2 + Math.random() * 8;
    ctx.beginPath();
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    ctx.moveTo(x, y);
    for(let j = 0; j < 8; j++) {
      x += (Math.random() - 0.5) * 150;
      y += (Math.random() - 0.5) * 150;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for(let i = 0; i < 400; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random()*0.3})`;
    ctx.beginPath();
    ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 2+Math.random()*12, 0, Math.PI*2);
    ctx.fill();
  }
  for(let i = 0; i < 800; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.random()*0.2})`;
    ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.5, 1.5);
  return tex;
}

const iceRealTex = createRealisticIceTexture();

const iceVolGeo = new THREE.CylinderGeometry(BR-0.4, BR-0.4, 1, 64);
iceVolGeo.translate(0, -0.5, 0);
const iceVolMat = new THREE.MeshPhysicalMaterial({
  color: 0xc8e4ff,
  map: iceRealTex,
  roughness: 0.65,
  metalness: 0.0,
  transmission: 0.15,
  ior: 1.31,
  transparent: true,
  opacity: 0,
  emissive: 0x111122,
  side: THREE.DoubleSide
});
const iceVol = new THREE.Mesh(iceVolGeo, iceVolMat);
iceVol.renderOrder = 9;
scene.add(iceVol);

const iceTopGeo = new THREE.CircleGeometry(BR-0.4, 64);
iceTopGeo.rotateX(-Math.PI/2);
const iceTopMat = new THREE.MeshStandardMaterial({
  color: 0xe0f0ff,
  roughness: 0.4,
  metalness: 0.0,
  emissive: 0x112233,
  transparent: true,
  opacity: 0
});
const iceTop = new THREE.Mesh(iceTopGeo, iceTopMat);
iceTop.renderOrder = 10;
scene.add(iceTop);

const iceCrystals = [];
const crystalTex = (() => {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(32,0); ctx.lineTo(32,64); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,32); ctx.lineTo(64,32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12,12); ctx.lineTo(52,52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(52,12); ctx.lineTo(12,52); ctx.stroke();
  ctx.fillStyle = 'rgba(200,230,255,0.6)';
  ctx.beginPath(); ctx.arc(32,32,20,0,Math.PI*2); ctx.fill();
  return new THREE.CanvasTexture(c);
})();

for(let i=0; i<30; i++) {
  const mat = new THREE.SpriteMaterial({ map: crystalTex, color: 0xaaccff, transparent: true, opacity: 0 });
  const spr = new THREE.Sprite(mat);
  spr.visible = false;
  scene.add(spr);
  iceCrystals.push({ mesh: spr, active: false, offset: 0, speed: 0 });
}

/* ========== REALISTIC STEAM ========== */
function createSteamTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(230, 240, 255, 0.9)');
  gradient.addColorStop(0.6, 'rgba(200, 220, 250, 0.5)');
  gradient.addColorStop(0.8, 'rgba(180, 200, 240, 0.2)');
  gradient.addColorStop(1, 'rgba(160, 180, 220, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  for(let i = 0; i < 2000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = Math.hypot(x-128, y-128);
    if(r < 100) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()*0.2})`;
      ctx.fillRect(x-2, y-2, 4, 4);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

const steamTex = createSteamTexture();
const NSTEAM = 600;
let steamParticles = [];

for(let i=0; i<NSTEAM; i++) {
  const mat = new THREE.SpriteMaterial({
    map: steamTex,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.NormalBlending,
    color: 0xffffff
  });
  const spr = new THREE.Sprite(mat);
  spr.visible = false;
  scene.add(spr);
  steamParticles.push({
    mesh: spr,
    life: 0,
    maxLife: 2 + Math.random() * 4,
    x: 0, z: 0,
    vx: 0, vy: 0, vz: 0,
    scaleBase: 0.5 + Math.random() * 2,
    rotSpeed: (Math.random()-0.5)*0.02,
    turbulence: 0.02 + Math.random()*0.04
  });
}

function spawnSteam(p, topY, T) {
  p.mesh.visible = true;
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * (BR - 0.8);
  p.x = Math.cos(angle) * radius;
  p.z = Math.sin(angle) * radius;
  p.mesh.position.set(p.x, topY + 0.1 + Math.random()*0.3, p.z);
  p.life = 0;
  const intensity = Math.min(1, (T-70)/40);
  p.maxLife = 1.5 + Math.random() * 4 + intensity * 4;
  p.vy = 0.8 + Math.random() * 2.5 + intensity * 3;
  p.vx = (Math.random() - 0.5) * 0.6 + (Math.random()-0.5)*intensity*0.8;
  p.vz = (Math.random() - 0.5) * 0.6 + (Math.random()-0.5)*intensity*0.8;
  p.scaleBase = 0.4 + Math.random() * 2.2 + intensity * 1.5;
  p.turbulence = 0.02 + Math.random()*0.06 + intensity*0.05;
  if(T >= 100) p.mesh.material.color.setHSL(0.0, 0, 1.0);
  else if(T > 90) p.mesh.material.color.setHSL(0.05, 0.2, 0.95);
  else p.mesh.material.color.setHSL(0.6, 0.2, 0.9);
}

/* ========== BUBBLES ========== */
const NBUB=120, bubs=[];
const bubG=new THREE.SphereGeometry(1,16,12);
for(let i=0;i<NBUB;i++){ const m=new THREE.Mesh(bubG,new THREE.MeshPhysicalMaterial({color:0xf0faff,transmission:0.98,roughness:0.01,thickness:0.2,ior:1.0,transparent:true,opacity:0.4,depthWrite:false})); m.visible=false; scene.add(m); bubs.push({mesh:m,on:false,x:0,y:0,z:0,vy:0,wx:0,wz:0,ws:0,r:.08,ph:0}); }
function spawnBub(b,topY,T){ b.on=true; const a=Math.random()*Math.PI*2, rd=Math.random()*(BR-1.5); b.x=Math.cos(a)*rd; b.z=Math.sin(a)*rd; b.y=BBOT+1.0; b.r=T>100?.18+Math.random()*.3:.06+Math.random()*.12; b.vy=.5+Math.random()*2.5; b.wx=(Math.random()-.5)*.5; b.wz=(Math.random()-.5)*.5; b.ws=1.2+Math.random()*3.0; b.ph=Math.random()*Math.PI*2; b.mesh.scale.setScalar(b.r); b.mesh.visible=true; }

/* ========== STATE with EVAPORATION ========== */
const BH_WATER=9.0;  // Slightly more water for better visibility
let targetT=20, simT=20, curTop=BBOT+BH_WATER, curIceH=0;
let evaporationFactor = 1.0;
const HEAT_RATE=10;
document.getElementById('sl').addEventListener('input',function(){targetT=parseFloat(this.value);});

const FACTS={'-15':"Ice! ...",'-5':"...",'0':"Freezing/melting point ...",'1':"⚠️ ANOMALOUS ZONE ...",'4':"⭐ MAXIMUM DENSITY ...",'10':"Normal liquid water ...",'30':"Warm water ...",'60':"Hot water ...",'80':"Nucleate boiling ...",'96':"Vigorous boiling ...",'100':"BOILING POINT ...",'110':"Superheated steam ..."};
function getFact(T){const ks=Object.keys(FACTS).map(Number).sort((a,b)=>a-b); for(let i=ks.length-1;i>=0;i--)if(T>=ks[i]) return FACTS[ks[i]]; return FACTS['-15'];}
function fl(id,on){document.getElementById(id).classList[on?'add':'remove']('v');}
function ec(id,on,cls){const el=document.getElementById(id); ['cice','cblu','cgld','cred','cgrn','cpur'].forEach(c=>el.classList.remove(c)); el.classList[on?'add':'remove']('on'); if(on&&cls)el.classList.add(cls);}

function ui(T){
  const den=density(T), vol=D4/den, exp=(vol-1)*100;
  let tc='#38bdf8';
  if(T<0)tc='#93c5fd'; else if(T<4)tc='#a78bfa'; else if(T<30)tc='#38bdf8'; else if(T<70)tc='#fbbf24'; else if(T<100)tc='#fb923c'; else tc='#f87171';
  document.getElementById('tnum').innerHTML=T.toFixed(1)+'<span class="t-deg">°C</span>'; document.getElementById('tnum').style.color=tc;
  let ph,pc,pb,pbr;
  if(T<0){ph='🧊 Solid Ice';pc='#93c5fd';pb='rgba(147,197,253,.12)';pbr='rgba(147,197,253,.3)';}
  else if(T<4){ph='❄️ Anomalous Liquid';pc='#a78bfa';pb='rgba(167,139,250,.12)';pbr='rgba(167,139,250,.3)';}
  else if(T<100){ph='💧 Liquid Water';pc='#38bdf8';pb='rgba(56,189,248,.12)';pbr='rgba(56,189,248,.3)';}
  else{ph='♨️ Steam (Gas)';pc='#f87171';pb='rgba(248,113,113,.12)';pbr='rgba(248,113,113,.3)';}
  const pill=document.getElementById('ppill'); pill.textContent=ph;pill.style.color=pc;pill.style.background=pb;pill.style.borderColor=pbr;
  document.getElementById('sden').textContent=den.toFixed(5); document.getElementById('sden').style.color=tc;
  document.getElementById('svol').textContent=vol.toFixed(5);
  document.getElementById('sexp').textContent=(exp>=0?'+':'')+exp.toFixed(3)+'%';
  document.getElementById('sexp').style.color=Math.abs(exp)<.003?'#fbbf24':exp>0?'#fb923c':'#38bdf8';
  document.getElementById('ssta').textContent=T<0?'Solid Ice':T<100?'Liquid':'Gas';
  document.getElementById('fact').textContent=getFact(T);
  const fb=document.getElementById('fact');
  if(T<0){fb.style.background='rgba(147,197,253,.06)';fb.style.borderColor='rgba(147,197,253,.18)';}
  else if(T<4){fb.style.background='rgba(167,139,250,.06)';fb.style.borderColor='rgba(167,139,250,.18)';}
  else if(T<100){fb.style.background='rgba(56,189,248,.06)';fb.style.borderColor='rgba(56,189,248,.18)';}
  else{fb.style.background='rgba(248,113,113,.06)';fb.style.borderColor='rgba(248,113,113,.18)';}
  document.getElementById('bfact').textContent=getFact(T);
  let ps='Liquid Water';
  if(T<0)ps='Solid Ice — Frozen Water';
  else if(T<4)ps='Anomalous Expansion Zone (0–4°C)';
  else if(T<4.8)ps='⭐ Maximum Density — 4°C';
  else if(T>=100)ps='♨️ Steam — Gas Phase';
  document.getElementById('ophase').textContent=ps; document.getElementById('ophase').style.color=tc;
  document.getElementById('oden').textContent=`ρ = ${den.toFixed(5)} g/cm³`; document.getElementById('oden').style.color=tc;
  fl('fl-ice',T<-.3); fl('fl-cold',T>.2&&T<4.6); fl('fl-4c',T>3.2&&T<5.2); fl('fl-bub',T>62&&T<100); fl('fl-stm',T>80);
  const diff=targetT-simT, bb=document.getElementById('bbox'), bd=document.getElementById('bdot'), bt=document.getElementById('btxt');
  if(Math.abs(diff)>1.5){ bb.style.background=diff>0?'rgba(124,45,18,.4)':'rgba(23,37,84,.4)'; bb.style.borderColor=diff>0?'rgba(251,146,60,.25)':'rgba(96,165,250,.25)'; bd.style.background=diff>0?'#fb923c':'#60a5fa'; bt.textContent=diff>0?'🔥 Heating — burner ON':'❄️ Cooling — temperature falling'; bt.style.color=diff>0?'#fb923c':'#60a5fa'; }
  else{ bb.style.background='rgba(255,255,255,.03)'; bb.style.borderColor='rgba(255,255,255,.07)'; bd.style.background='#334155'; bt.textContent='— Stable temperature'; bt.style.color='rgba(255,255,255,.35)'; }
  ec('e1',T<5,T<0?'cice':'cblu'); ec('e2',T<12,'cblu'); ec('e3',T>2&&T<8,'cgld'); ec('e4',T<1,'cred'); ec('e5',T<1,'cred'); ec('e6',T>=80,'cgrn');
}

/* ========== ANIMATION LOOP ========== */
let clk=0, lt=performance.now();
function frame(){
  requestAnimationFrame(frame);
  resize();
  const now=performance.now();
  const dt=Math.min((now-lt)*.001,.05); lt=now; clk+=dt;

  const diff=targetT-simT;
  if(Math.abs(diff)>.05){ simT+=Math.sign(diff)*HEAT_RATE*dt; if(Math.sign(targetT-simT)!==Math.sign(diff))simT=targetT; }
  const T=simT;

  if(diff>1.5){ const i=Math.min(diff/45,1); hpadMat.emissive.setHex(0xff5500); hpadMat.emissiveIntensity=i*2.5; heatL.intensity=i*1.8; coldL.intensity=0; }
  else if(diff<-1.5){ const i=Math.min(-diff/45,1); hpadMat.emissive.setHex(0x2266ff); hpadMat.emissiveIntensity=i*1.8; coldL.intensity=i*1.2; heatL.intensity=0; }
  else{ hpadMat.emissiveIntensity=0; heatL.intensity=0; coldL.intensity=0; }

  // Evaporation
  if(T > 70) {
    const evapRate = (T-70) / 100 * 0.15;
    evaporationFactor = Math.max(0.4, evaporationFactor - evapRate * dt);
  } else {
    evaporationFactor = Math.min(1.0, evaporationFactor + 0.02 * dt);
  }
  
  const den = density(T);
  const thermalVol = D4 / den;
  const baseHeight = BH_WATER * thermalVol * evaporationFactor;
  const tgt = BBOT + baseHeight;
  
  curTop += (tgt - curTop) * 0.07;
  const wH = Math.max(0.1, curTop - BBOT);
  
  surfM.position.y = curTop;
  wbM.position.y = BBOT;
  wbM.scale.y = wH;

  const wc=new THREE.Color();
  if(T<=0)wc.setHex(0x5a9ed9);
  else if(T<4)wc.setHex(0x1e96d0);
  else if(T<40)wc.setHex(0x1269b0);
  else if(T<80)wc.setHex(0x1d3a70);
  else if(T<100)wc.setHex(0x7a2e1a);
  else wc.setHex(0x8a8a96);
  wbMat.color.lerp(wc,.06);
  wbMat.opacity = T>=100 ? 0.15 : 0.55;

  let amp=0;
  if(T>0)amp=T<8?.008+T*.009: T<40?.07+(T-8)*.003: T<80?.13+(T-40)*.006: T<100?.28+(T-80)*.015:.58;
  surfMat.uniforms.uAmp.value+=(amp-surfMat.uniforms.uAmp.value)*.1;
  surfMat.uniforms.uT.value=clk;
  surfMat.uniforms.uTemp.value=T;
  surfMat.uniforms.uCam.value.copy(camera.position);

  const gc=new THREE.Color();
  if(T<0)gc.setHex(0x4fa0e0);
  else if(T<4)gc.setHex(0x35d0fa);
  else if(T<40)gc.setHex(0x0d9eef);
  else if(T<80)gc.setHex(0xfb9f2a);
  else gc.setHex(0xff6b35);
  wglow.color.lerp(gc,.08);
  wglow.position.y=curTop-3.0;
  wglow.intensity=T>=100?.25:2.2;

  // Ice
  const iceTarget = T < 0 ? Math.min(2.5, (-T)/6 * 2.8) : 0;
  curIceH += (iceTarget - curIceH) * 0.05;

  if(curIceH > 0.05) {
    iceVol.visible = true;
    iceTop.visible = true;
    iceVol.position.y = curTop - curIceH/2;
    iceVol.scale.y = curIceH;
    iceTop.position.y = curTop + 0.02;
    const iceOp = Math.min(0.92, curIceH/1.8);
    iceVol.material.opacity = iceOp;
    iceTop.material.opacity = iceOp * 0.9;
    iceRealTex.offset.x += 0.0002;
    iceRealTex.offset.y += 0.0001;
    let crystalCount = Math.floor(curIceH * 12);
    for(let i=0; i<iceCrystals.length; i++) {
      if(i < crystalCount) {
        if(!iceCrystals[i].active) {
          iceCrystals[i].active = true;
          iceCrystals[i].mesh.visible = true;
          const angle = Math.random()*Math.PI*2;
          const rad = (BR-0.8) * Math.random();
          iceCrystals[i].mesh.position.set(
            Math.cos(angle)*rad,
            curTop + 0.05 + Math.random()*0.3,
            Math.sin(angle)*rad
          );
          iceCrystals[i].mesh.material.opacity = 0.5 + Math.random()*0.4;
          iceCrystals[i].mesh.scale.set(0.3+Math.random()*0.4, 0.3+Math.random()*0.4, 1);
        }
        iceCrystals[i].mesh.position.y += Math.sin(clk + i)*0.002;
      } else {
        if(iceCrystals[i].active) {
          iceCrystals[i].active = false;
          iceCrystals[i].mesh.visible = false;
        }
      }
    }
  } else {
    iceVol.visible = false;
    iceTop.visible = false;
    iceCrystals.forEach(c => { c.active = false; c.mesh.visible = false; });
  }

  // Bubbles
  const maxB = T<62 ? 0 : T<80 ? 8 : T<93 ? 35 : T<100 ? 80 : 150;
  let nB=0;
  bubs.forEach(b=>{
    if(!b.on){ if(nB<maxB && Math.random()<(T>95?.6:.1)){ spawnBub(b,curTop,T); nB++; } return; }
    nB++; b.y+=b.vy*dt;
    b.mesh.position.set(b.x+Math.sin(clk*b.ws+b.ph)*b.wx*0.8, b.y, b.z+Math.cos(clk*b.ws*0.7+b.ph)*b.wz*0.8);
    b.r*=(1+dt*.05); b.mesh.scale.setScalar(b.r);
    if(b.y>curTop+.6){ b.on=false; b.mesh.visible=false; }
  });

  // Steam
  const steamBaseCount = T < 70 ? 0 : T < 82 ? 20 : T < 92 ? 80 : T < 100 ? 180 : 380;
  const maxSteam = Math.min(NSTEAM, Math.floor(steamBaseCount));
  let nS = 0;
  steamParticles.forEach(p => {
    if(!p.mesh.visible) {
      if(nS < maxSteam && Math.random() < (T>98 ? 0.4 : 0.1)) {
        spawnSteam(p, curTop, T);
        nS++;
      }
      return;
    }
    nS++;
    p.life += dt;
    if(p.life > p.maxLife) {
      p.mesh.visible = false;
      return;
    }
    const lifeFactor = p.life / p.maxLife;
    p.vx += (Math.random()-0.5) * p.turbulence * dt * 15;
    p.vz += (Math.random()-0.5) * p.turbulence * dt * 15;
    p.vy += 0.02 * dt * 20;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    p.mesh.rotation.z += p.rotSpeed * dt * 30;
    const scale = p.scaleBase * (0.8 + lifeFactor * 2.2);
    p.mesh.scale.set(scale, scale, 1);
    let op;
    if(lifeFactor < 0.2) op = lifeFactor * 4.5;
    else if(lifeFactor > 0.7) op = (1 - lifeFactor) * 3.3;
    else op = 0.9;
    op *= (T > 100 ? 1.2 : 0.9);
    p.mesh.material.opacity = Math.min(1.0, op);
    if(p.mesh.position.y > curTop + 9) p.mesh.visible = false;
  });

  const bg=new THREE.Color();
  if(T<0)bg.setHex(0x020812);
  else if(T<4)bg.setHex(0x04101c);
  else if(T<40)bg.setHex(0x03111f);
  else if(T<80)bg.setHex(0x140a02);
  else bg.setHex(0x300808);
  scene.background.lerp(bg,.04);

  ui(T);
  renderer.render(scene,camera);
}

ui(20);
frame();