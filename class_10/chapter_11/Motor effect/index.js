'use strict';

// === motor state ===
const S = {
  I:2, B:1, simSpeed:1, dir:1, playing:true,
  angle:0, omega:0, loadTorque:0.02
};

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.bias = 0.0001;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0f12);
scene.fog = new THREE.FogExp2(0x0c0f12, 0.018);

const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.05, 300);
camera.position.set(8.5, 5.5, 13);
camera.lookAt(0, 0.5, 0);

// === orbit ===
let drag=false, px=0, py=0, theta=0.65, phi=0.48, dist=15.5;
function camUpdate(){
  camera.position.set(
    dist*Math.sin(theta)*Math.cos(phi),
    dist*Math.sin(phi),
    dist*Math.cos(theta)*Math.cos(phi));
  camera.lookAt(0,0.5,0);
}
camUpdate();
canvas.addEventListener('mousedown',e=>{drag=true;px=e.clientX;py=e.clientY});
canvas.addEventListener('mouseup',()=>drag=false);
canvas.addEventListener('mousemove',e=>{
  if(!drag)return;
  theta-=(e.clientX-px)*0.0032; phi=Math.max(-0.1,Math.min(1.15,phi+(e.clientY-py)*0.0032));
  px=e.clientX;py=e.clientY;camUpdate();
});
canvas.addEventListener('wheel',e=>{dist=Math.max(5.5,Math.min(27,dist+e.deltaY*0.01));camUpdate();},{passive:true});
canvas.addEventListener('touchstart',e=>{drag=true;px=e.touches[0].clientX;py=e.touches[0].clientY},{passive:true});
canvas.addEventListener('touchend',()=>drag=false);
canvas.addEventListener('touchmove',e=>{
  if(!drag)return;
  theta-=(e.touches[0].clientX-px)*0.0032; phi=Math.max(-0.1,Math.min(1.15,phi+(e.touches[0].clientY-py)*0.0032));
  px=e.touches[0].clientX;py=e.touches[0].clientY;camUpdate();
},{passive:true});

// === textures (unchanged) ===
function mkSteelTex(w=512,h=512){
  const cv=document.createElement('canvas'); cv.width=w;cv.height=h;
  const c=cv.getContext('2d');
  c.fillStyle='#5d656f'; c.fillRect(0,0,w,h);
  for(let i=0;i<600;i++){
    const y=Math.random()*h, a=Math.random()*0.06+0.01;
    c.strokeStyle=`rgba(255,255,255,${a})`; c.lineWidth=0.6;
    c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();
  }
  c.fillStyle='rgba(0,0,0,0.03)';
  for(let i=0;i<100;i++){c.fillRect(Math.random()*w,Math.random()*h,Math.random()*5+1,1);}
  return new THREE.CanvasTexture(cv);
}
function mkCopperTex(w=512,h=512){
  const cv=document.createElement('canvas'); cv.width=w;cv.height=h;
  const c=cv.getContext('2d');
  const g=c.createLinearGradient(0,0,w*0.3,h*0.2);
  g.addColorStop(0,'#b5672a'); g.addColorStop(0.5,'#cf823b'); g.addColorStop(1,'#a85e22');
  c.fillStyle=g; c.fillRect(0,0,w,h);
  for(let i=0;i<1200;i++){
    const x=Math.random()*w,y=Math.random()*h,a=Math.random()*0.09;
    c.fillStyle=`rgba(50,25,5,${a})`; c.fillRect(x,y,2,1);
  }
  return new THREE.CanvasTexture(cv);
}
function mkLamTex(w=512,h=64){
  const cv=document.createElement('canvas'); cv.width=w;cv.height=h;
  const c=cv.getContext('2d');
  c.fillStyle='#3c414b'; c.fillRect(0,0,w,h);
  const lh=5;
  for(let y=0;y<h;y+=lh+1.2){
    c.fillStyle='#555d6b'; c.fillRect(0,y,w,lh-0.8);
    c.fillStyle='#252a32'; c.fillRect(0,y+lh-0.8,w,1.5);
  }
  return new THREE.CanvasTexture(cv);
}
function mkWoodTex(w=1024,h=1024){
  const cv=document.createElement('canvas'); cv.width=w;cv.height=h;
  const c=cv.getContext('2d');
  c.fillStyle='#5a4a38'; c.fillRect(0,0,w,h);
  for(let i=0;i<300;i++){
    const y=i*(h/300)+Math.random()*6;
    const a=Math.random()*0.15+0.07;
    c.strokeStyle=`rgba(30,20,8,${a})`;
    c.lineWidth=Math.random()*2.2+1;
    c.beginPath();c.moveTo(0,y);
    let cx=0;
    while(cx<w){const nx=cx+Math.random()*30+10;c.lineTo(nx,y+(Math.random()-0.5)*4);cx=nx;}
    c.stroke();
  }
  return new THREE.CanvasTexture(cv);
}
const steelTex  = mkSteelTex(); steelTex.wrapS=steelTex.wrapT=THREE.RepeatWrapping; steelTex.repeat.set(1.5,2);
const copperTex = mkCopperTex();
const lamTex    = mkLamTex(); lamTex.wrapS=THREE.RepeatWrapping; lamTex.repeat.set(4,1);
const woodTex   = mkWoodTex(); woodTex.wrapS=woodTex.wrapT=THREE.RepeatWrapping; woodTex.repeat.set(5,3);

// === MATERIALS: ONLY MAGNETS MADE TRANSPARENT, EVERYTHING ELSE UNCHANGED ===
const M = {
  steel : new THREE.MeshStandardMaterial({map:steelTex, color:0xb0b8c5, metalness:0.94, roughness:0.32, emissive:0x000000}),
  steelDark:new THREE.MeshStandardMaterial({color:0x404854,metalness:0.9,roughness:0.5}),
  chrome: new THREE.MeshStandardMaterial({color:0xf0f4ff,metalness:1.0,roughness:0.06,emissive:0x000000}),
  copper: new THREE.MeshStandardMaterial({map:copperTex,color:0xc87c3a,metalness:0.96,roughness:0.2}),
  copperDull:new THREE.MeshStandardMaterial({color:0xb46c2a,metalness:0.8,roughness:0.35}),
  lam  : new THREE.MeshStandardMaterial({map:lamTex, color:0x5a6070, metalness:0.7, roughness:0.6}),
  carbon:new THREE.MeshStandardMaterial({color:0x282e36,metalness:0.1,roughness:0.9}),
  mica : new THREE.MeshStandardMaterial({color:0xcbc2a8,metalness:0.0, roughness:0.8}),
  // North & South magnets: TRANSPARENT with strong emissive glow so they stand out
  Npole: new THREE.MeshStandardMaterial({color:0x3399ff, metalness:0.2, roughness:0.2, emissive:0x2266cc, emissiveIntensity:1.2, transparent:true, opacity:0.65}),
  Spole: new THREE.MeshStandardMaterial({color:0xff5533, metalness:0.2, roughness:0.2, emissive:0xcc3300, emissiveIntensity:1.2, transparent:true, opacity:0.65}),
  paint: new THREE.MeshStandardMaterial({color:0x2f353e,metalness:0.2, roughness:0.75}),
  wood : new THREE.MeshStandardMaterial({map:woodTex, color:0x826a48, metalness:0.0, roughness:0.9}),
  brass: new THREE.MeshStandardMaterial({color:0xc0a064,metalness:0.88,roughness:0.22}),
};

// lights
scene.add(new THREE.HemisphereLight(0xfff2e2, 0x283542, 0.75));
const key = new THREE.DirectionalLight(0xfff5e6, 3.0);
key.position.set(6, 12, 7); key.castShadow=true;
key.shadow.mapSize.set(2048,2048); key.shadow.camera.near=0.5; key.shadow.camera.far=45;
key.shadow.camera.left=-8; key.shadow.camera.right=8; key.shadow.camera.top=8; key.shadow.camera.bottom=-8;
key.shadow.bias=-0.0003;
scene.add(key);
const fill = new THREE.DirectionalLight(0xc8d8ff, 1.4);
fill.position.set(-8, 4, 5); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffeedd, 0.9);
rim.position.set(-2, -2, -10); scene.add(rim);

// pole glows (enhanced to complement transparent magnets)
const nGlow = new THREE.PointLight(0x4488ff, 3.2, 9); nGlow.position.set(0,5.5,0); scene.add(nGlow);
const sGlow = new THREE.PointLight(0xff5533, 3.2, 9); sGlow.position.set(0,-5.5,0); scene.add(sGlow);
const sparkLightA = new THREE.PointLight(0xffaa44, 0, 3.0); sparkLightA.position.set(2.2, 0.7, 0.9); scene.add(sparkLightA);
const sparkLightB = new THREE.PointLight(0xffaa44, 0, 3.0); sparkLightB.position.set(2.2, -0.7, -0.9); scene.add(sparkLightB);

// bench
const bench = new THREE.Mesh(new THREE.BoxGeometry(28,0.5,20), M.wood);
bench.position.y = -3.95; bench.receiveShadow=true; bench.castShadow=false; scene.add(bench);
const trim = new THREE.Mesh(new THREE.BoxGeometry(28,0.2,0.4), M.steelDark);
trim.position.set(0,-3.7,10); trim.receiveShadow=true; scene.add(trim);

// motor frame group
const frameGroup = new THREE.Group(); scene.add(frameGroup);

function addBox(parent,w,h,d,x,y,z,mat,cast=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; parent.add(m); return m;
}
function addCyl(parent,rT,rB,h,segs,x,y,z,mat,rotX=0,rotZ=0){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rT,rB,h,segs),mat);
  m.position.set(x,y,z); m.rotation.x=rotX; m.rotation.z=rotZ;
  m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}

// yoke (unchanged, opaque)
addBox(frameGroup, 0.9,9.0,5.6, -3.5,0,0, M.steel);
addBox(frameGroup, 6.8,0.9,5.6, 0,3.9,0, M.steel);
addBox(frameGroup, 6.8,0.9,5.6, 0,-3.9,0, M.steel);
addBox(frameGroup, 0.25,9.0,5.6, 3.5,0,0, M.steelDark);
// bolt heads
for(const [bx,by,bz] of [[-3.4,3.5,2.5],[-3.4,3.5,-2.5],[-3.4,-3.5,2.5],[-3.4,-3.5,-2.5],
                          [3.4,3.5,2.5],[3.4,3.5,-2.5],[3.4,-3.5,2.5],[3.4,-3.5,-2.5]]){
  addCyl(frameGroup,0.2,0.2,0.22,10, bx,by,bz, M.brass,0,0);
}

// === MAGNETS (TRANSPARENT, GLOWING) ===
const magnetTop = new THREE.Group();
const magnetBottom = new THREE.Group();
frameGroup.add(magnetTop);
frameGroup.add(magnetBottom);

// North pole (top) - transparent blue
addBox(magnetTop, 6.0,1.2,5.2, 0,0,0, M.Npole);
addBox(magnetTop, 6.0,0.3,5.5, 0,-0.7,0, M.Npole);
magnetTop.position.set(0, 5.5, 0);

// South pole (bottom) - transparent red
addBox(magnetBottom, 6.0,1.2,5.2, 0,0,0, M.Spole);
addBox(magnetBottom, 6.0,0.3,5.5, 0,0.7,0, M.Spole);
magnetBottom.position.set(0, -5.5, 0);

// === LABELS (unchanged, still solid for clarity) ===
function makeLabel(text,color){
  const cv=document.createElement('canvas'); cv.width=128;cv.height=128;
  const c=cv.getContext('2d');
  c.font='bold 80px "Inter",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
  c.fillStyle=color; c.shadowColor=color; c.shadowBlur=25;
  c.fillText(text,64,64);
  const t=new THREE.CanvasTexture(cv);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
  sp.scale.set(1.2,1.2,1); return sp;
}
const nLbl=makeLabel('N','#88aaff'); nLbl.position.set(0,5.0,2.8); scene.add(nLbl);
const sLbl=makeLabel('S','#ff8888'); sLbl.position.set(0,-5.0,2.8); scene.add(sLbl);

// bearing housings
function makeBearingBell(xPos){
  const g=new THREE.Group(); g.position.x=xPos; frameGroup.add(g);
  const bell=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,0.6,36),M.steel);
  bell.rotation.z=Math.PI/2; bell.castShadow=true; g.add(bell);
  const bOuter=new THREE.Mesh(new THREE.TorusGeometry(0.65,0.18,14,36),M.steelDark);
  bOuter.rotation.y=Math.PI/2; g.add(bOuter);
  const bInner=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.1,12,24),M.chrome);
  bInner.rotation.y=Math.PI/2; g.add(bInner);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    const ball=new THREE.Mesh(new THREE.SphereGeometry(0.11,8,8),M.chrome);
    ball.position.set(0, Math.sin(a)*0.55, Math.cos(a)*0.55); g.add(ball);
  }
}
makeBearingBell(-3.3);
makeBearingBell(3.3);

// === ROTOR (unchanged) ===
const rotorGroup = new THREE.Group(); scene.add(rotorGroup);
const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,12.5,20), M.chrome);
shaft.rotation.z = Math.PI/2; shaft.castShadow=true; rotorGroup.add(shaft);
const coreGeo = new THREE.CylinderGeometry(1.55,1.55,4.6,40);
const core = new THREE.Mesh(coreGeo, M.lam);
core.rotation.z=Math.PI/2; core.castShadow=true; rotorGroup.add(core);
for(let i=-2.1;i<=2.1;i+=0.22){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.55,0.018,8,36), M.steelDark);
  ring.rotation.y=Math.PI/2; ring.position.x=i; rotorGroup.add(ring);
}
const slotMat = new THREE.MeshStandardMaterial({color:0x181c22,metalness:0.0,roughness:1.0});
for(let s=0;s<6;s++){
  const a=s/6*Math.PI*2;
  const slot=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.28,0.24),slotMat);
  slot.rotation.z=Math.PI/2;
  slot.position.set(0, Math.sin(a)*1.45, Math.cos(a)*1.45);
  slot.rotation.x=a;
  rotorGroup.add(slot);
}
const windingMats = [
  new THREE.MeshStandardMaterial({color:0xc47a3a,metalness:0.95,roughness:0.16}),
  new THREE.MeshStandardMaterial({color:0xb86a2a,metalness:0.95,roughness:0.16}),
  new THREE.MeshStandardMaterial({color:0xd1843a,metalness:0.95,roughness:0.16}),
];
function buildCoilGroup(angleRad, mat){
  const g = new THREE.Group(); rotorGroup.add(g);
  const r=1.45, hl=2.15;
  for(let side=0;side<2;side++){
    const a = angleRad + side*Math.PI;
    for(let w=0;w<3;w++){
      const wr = r + (w-1)*0.12;
      const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,hl*2,6), mat);
      bar.rotation.z=Math.PI/2; bar.position.set(0, Math.sin(a)*wr, Math.cos(a)*wr);
      g.add(bar);
    }
  }
  for(let end=-1;end<=1;end+=2){
    for(let w=0;w<3;w++){
      const wr = r+(w-1)*0.12;
      const pts=[];
      for(let t=0;t<=16;t++){
        const ta = angleRad + (t/16)*Math.PI;
        const bulge = 0.3+Math.abs(Math.sin(t/16*Math.PI))*0.4;
        pts.push(new THREE.Vector3(end*(hl+bulge*0.45), Math.sin(ta)*(wr+bulge*0.1), Math.cos(ta)*(wr+bulge*0.1)));
      }
      const curve=new THREE.CatmullRomCurve3(pts);
      const tGeo=new THREE.TubeGeometry(curve,14,0.055,6,false);
      const tube=new THREE.Mesh(tGeo,mat); tube.castShadow=true; g.add(tube);
    }
  }
  return g;
}
for(let i=0;i<3;i++) buildCoilGroup(i/3*Math.PI, windingMats[i]);

// commutator
const commGroup=new THREE.Group(); commGroup.position.x=2.8; rotorGroup.add(commGroup);
const nSeg=8;
for(let i=0;i<nSeg;i++){
  const a0=i/nSeg*Math.PI*2, a1=(i+0.88)/nSeg*Math.PI*2;
  const pts=[new THREE.Vector2(0.6,0), new THREE.Vector2(0.71,0), new THREE.Vector2(0.71,0.75), new THREE.Vector2(0.6,0.75)];
  const geo=new THREE.LatheGeometry(pts, 1, a0, a1-a0);
  commGroup.add(new THREE.Mesh(geo, M.copper));
}
const collar=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,0.75,28),M.steel);
collar.rotation.x=Math.PI/2; commGroup.add(collar);

// brushes
const brushAssembly=new THREE.Group(); brushAssembly.position.x=2.8; scene.add(brushAssembly);
function makeBrush(posY){
  const g=new THREE.Group(); g.position.set(0,posY,0); brushAssembly.add(g);
  const holder=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.45,0.9),M.brass);
  g.add(holder);
  const brush=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.4,0.7),M.carbon);
  brush.position.set(0,-0.03,0); g.add(brush);
  for(let i=0;i<4;i++){ 
    const coil=new THREE.Mesh(new THREE.TorusGeometry(0.15,0.025,6,12),M.steel);
    coil.position.set(0, 0.55+i*0.12, 0); g.add(coil);
  }
}
makeBrush(0.75);
makeBrush(-0.75);

// field lines (barely visible)
const fieldGroup=new THREE.Group(); scene.add(fieldGroup);
const fLineMat=new THREE.LineBasicMaterial({color:0x6080cc,transparent:true,opacity:0.12});
for(let z=-1.8;z<=1.8;z+=1.2){
  for(let x=-1.5;x<=1.5;x+=1.2){
    const pts=[]; 
    for(let t=0;t<=20;t++){
      const yt = 2.0 - t/20*4.0;
      const off = Math.sin(t/20*Math.PI)*0.3*Math.abs(x);
      pts.push(new THREE.Vector3(x+off, yt, z));
    }
    fieldGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fLineMat));
  }
}

// force arrows
const arrowGroup=new THREE.Group(); scene.add(arrowGroup);
function makeArrow3D(color){
  const g=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.25,metalness:0,roughness:0.4});
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.9,8),mat));
  const head=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.55,8),mat);
  head.position.y=1.2; g.add(head);
  return g;
}
const arrowTop=makeArrow3D(0x44dd88); arrowTop.position.set(0,1.7,0); arrowGroup.add(arrowTop);
const arrowBot=makeArrow3D(0x44dd88); arrowBot.position.set(0,-1.7,0); arrowBot.rotation.z=Math.PI; arrowGroup.add(arrowBot);

// sparks
const SPARK_COUNT=120;
const sparkPositions=new Float32Array(SPARK_COUNT*3);
const sparkVelocities=[];
const sparkLife=new Float32Array(SPARK_COUNT);
for(let i=0;i<SPARK_COUNT;i++){ sparkVelocities.push([0,0,0]); sparkLife[i]=0; }
const sparkGeo=new THREE.BufferGeometry();
sparkGeo.setAttribute('position',new THREE.BufferAttribute(sparkPositions,3));
const sparkTex=()=>{
  const cv=document.createElement('canvas');cv.width=32;cv.height=32;
  const c=cv.getContext('2d');
  const g=c.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,'#ffb060'); g.addColorStop(0.5,'#ff7010'); g.addColorStop(1,'#ff300000');
  c.fillStyle=g;c.fillRect(0,0,32,32);
  return new THREE.CanvasTexture(cv);
};
const sparkMat=new THREE.PointsMaterial({size:0.16,map:sparkTex(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const sparks=new THREE.Points(sparkGeo,sparkMat);
sparks.position.x=2.8; scene.add(sparks);

function emitSparks(dt){
  const speed=Math.abs(S.omega);
  if(speed<0.15) return;
  const rate=Math.min(speed*2.8,7)*dt*60;
  for(let i=0;i<SPARK_COUNT;i++){
    if(sparkLife[i]>0){
      sparkLife[i]-=dt*3.0;
      const v=sparkVelocities[i];
      sparkPositions[i*3]  += v[0]*dt;
      sparkPositions[i*3+1]+= v[1]*dt;
      sparkPositions[i*3+2]+= v[2]*dt;
      v[1]-=2.8*dt;
      if(sparkLife[i]<=0) sparkPositions[i*3+1]=-999;
    } else if(Math.random()<rate/SPARK_COUNT){
      const side=Math.random()>0.5?0.75:-0.75;
      sparkPositions[i*3]= (Math.random()-0.5)*0.6;
      sparkPositions[i*3+1]=side;
      sparkPositions[i*3+2]=(Math.random()-0.5)*0.6;
      sparkVelocities[i]=[(Math.random()-0.5)*1.4, (Math.random()*2+1.2)*Math.sign(side), (Math.random()-0.5)*1.4];
      sparkLife[i]=Math.random()*0.45+0.15;
    }
  }
  sparkGeo.attributes.position.needsUpdate=true;
}

// X-ray toggle (affects ONLY magnet opacity - other materials unchanged)
let xrayActive=false;
function toggleXray(){
  xrayActive=!xrayActive;
  document.getElementById('btn-xray').classList.toggle('on',xrayActive);
  // Only change magnet opacity - other materials remain as originally defined
  const targetOpacity = xrayActive ? 0.25 : 0.65;
  if (M.Npole) M.Npole.opacity = targetOpacity;
  if (M.Spole) M.Spole.opacity = targetOpacity;
}
function toggleArrows(){
  arrowsOn=!arrowsOn;
  arrowGroup.visible=arrowsOn;
  document.getElementById('btn-arrows').classList.toggle('on',arrowsOn);
}
let arrowsOn=true;

window.togglePlay = ()=>{
  S.playing=!S.playing;
  const b=document.getElementById('btn-pp');
  b.textContent=S.playing?'⏸ PAUSE':'▶ PLAY';
  b.classList.toggle('on',S.playing);
};
window.resetMotor = ()=>{S.angle=0;S.omega=0;};
window.reverseDir = ()=>{S.dir*=-1; document.getElementById('btn-rev').classList.toggle('on',S.dir<0);};
window.setParam = (p,v,id)=>{
  if(p==='I'){S.I=v;document.getElementById(id).innerHTML=v.toFixed(1)+' A';}
  if(p==='B'){S.B=v;document.getElementById(id).innerHTML=v.toFixed(1)+' T';}
  if(p==='S'){S.simSpeed=v;document.getElementById(id).innerHTML=v.toFixed(1)+'×';}
};

// HUD update
let hudTimer=0;
function updateHUD(dt){
  hudTimer+=dt;
  if(hudTimer<0.06)return; hudTimer=0;
  const rpm = Math.round(Math.abs(S.omega)*9.549);
  const ripple = 0.85 + 0.15 * Math.abs(Math.cos(S.angle * 3));
  const torque = (S.I * S.B * 0.48 * ripple - 0.01).toFixed(3);
  
  document.getElementById('r-rpm').textContent=rpm;
  document.getElementById('r-torq').textContent= (torque>0?torque:0.000) +' N·m';
  document.getElementById('r-cur').textContent=S.I.toFixed(1)+' A';
  document.getElementById('r-fld').textContent=S.B.toFixed(1)+' T';
}
function updateArrows(){
  const F = S.I * S.B * 1.2;
  const len = Math.min(F*0.4+0.5, 2.5);
  arrowTop.scale.set(1,len/1.9,1);
  arrowBot.scale.set(1,len/1.9,1);
}

// === physics ===
const clock=new THREE.Clock();
let tipShown=true;

function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),0.032);
  if(tipShown && clock.elapsedTime>2.2){
    document.getElementById('tip').style.opacity='0'; tipShown=false;
  }
  if(S.playing){
    const backEMF = Math.abs(S.omega) * 0.015;
    const effI = Math.max(0, S.I - backEMF);
    const ripple = 0.85 + 0.15 * Math.abs(Math.cos(S.angle * 3));
    const torque = effI * S.B * 0.55 * S.dir * ripple; 
    const load = S.loadTorque * Math.sign(S.omega) + 0.008 * S.omega;
    const accel = (torque - load) * S.simSpeed * 16;
    
    S.omega += accel * dt;
    S.omega = Math.max(-55, Math.min(55, S.omega));
    S.angle += S.omega * dt;
    rotorGroup.rotation.x = S.angle;
  }

  const sparkPow = Math.min(Math.abs(S.omega)*0.6, 3.5);
  sparkLightA.intensity = sparkPow*(0.7+Math.random()*0.6);
  sparkLightB.intensity = sparkPow*(0.7+Math.random()*0.6);
  nGlow.intensity = 2.5 + Math.sin(clock.elapsedTime*1.8)*0.5;
  sGlow.intensity = 2.5 + Math.sin(clock.elapsedTime*1.8+2)*0.5;

  emitSparks(dt);
  updateArrows();
  updateHUD(dt);
  renderer.render(scene, camera);
}
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
animate();