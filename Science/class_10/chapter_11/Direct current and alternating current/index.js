const C  = document.getElementById('c');
const cx = C.getContext('2d');
const SC = document.getElementById('sc');
const sx = SC.getContext('2d');

function resize(){
  const m = document.getElementById('main');
  C.width=m.clientWidth; C.height=m.clientHeight;
  SC.width=SC.offsetWidth; SC.height=SC.offsetHeight;
  buildLayout();
}

// ─── Layout ──────────────────────────────────────────────────────────────────
let P = {};
function buildLayout(){
  const W=C.width, H=C.height;
  const srcX = 110, srcY = H/2;
  const swX  = W/2,  swY  = H/2 - 120;
  const blX  = W-110, blY = H/2;
  P={
    src:{x:srcX,y:srcY},
    sw:{x:swX, y:swY},
    bulb:{x:blX,y:blY},
    nA:{x:srcX,y:swY},
    nB:{x:blX, y:swY},
    nC:{x:blX, y:blY+120},
    nD:{x:srcX,y:blY+120},
    // Sun position - moved higher up (was y-120, now y-180)
    sun:{x:srcX+50, y:srcY-180}
  };
}
resize();
window.addEventListener('resize',resize);

// ─── Physics state ────────────────────────────────────────────────────────────
let mode='dc', simT=0;
const DT=1/60;
let G=800, Tc=25, Rdc=10;
let rpm=1800, If=2.5, Rac=20, Lmh=40;
let swClosed=true, bulbOK=true;
let Vrms=0,Irms=0,Pw=0,freq=0,phi=0,pf=1;
let Vinst=0,Iinst=0;
let Tf=25, Rb=6.0;
const Rb0=6.0;
let arcPts=[];

// Scope buffers
const SBUF=600;
let bufV=new Float32Array(SBUF), bufI=new Float32Array(SBUF), sptr=0;

// Electron drift
const NE=24;
let ep=Array.from({length:NE},()=>Math.random());

// ─── Solar cell (Shockley single-diode, Newton-Raphson) ───────────────────────
function solveSolar(){
  if(!swClosed||!bulbOK||G<1) return{V:0,I:0};
  const Tk=Tc+273.15, Vt=8.617e-5*Tk;
  const n=1.35, Iph=G/1000*(8.0+0.003*(Tc-25));
  const I0=1e-10*Math.exp(3.2*(Tc-25)/100);
  const Rs=0.3, Rsh=300, Rl=Rdc+Rb;
  let V=Rl*Iph*0.8;
  for(let k=0;k<80;k++){
    const eV=Math.exp(Math.min(V/(n*Vt),40));
    const f=Iph-I0*(eV-1)-V/Rsh-V/Rl;
    const df=-I0*eV/(n*Vt)-1/Rsh-1/Rl;
    const dV=-f/df*0.6;
    V+=dV;
    if(Math.abs(dV)<1e-7) break;
  }
  return{V:Math.max(0,V), I:Math.max(0,V/Rl)};
}

// ─── AC Generator (synchronous) ───────────────────────────────────────────────
function solveAC(){
  if(!swClosed||!bulbOK||rpm<5) return{Vp:0,Ip:0,f:0,ph:0};
  const f=rpm/60, om=2*Math.PI*f;
  const Kf=0.048, Ea=Kf*If*om;
  const Ra=1.2, La=0.008, L=Lmh/1e3;
  const XL=om*(L+La), Rt=Rac+Ra+Rb;
  const Z=Math.sqrt(Rt*Rt+XL*XL), ph=Math.atan2(XL,Rt);
  const Ip=Ea/Z;
  const Vp=Ip*Math.sqrt(Rac*Rac+(om*L)*(om*L));
  return{Vp,Ip,f,ph};
}

// ─── Tungsten filament thermal model ─────────────────────────────────────────
function Rwire(T){ const d=T-25; return Rb0*(1+4.5e-3*d+1.1e-6*d*d); }
function updateThermal(Pd){
  const dT=(Pd-0.0018*(Tf-25))/0.0002*DT;
  Tf=Math.max(25,Math.min(Tf+dT,3420));
  Rb=Rwire(Tf);
}

// ─── Physics step ─────────────────────────────────────────────────────────────
function physStep(){
  simT+=DT;
  if(mode==='dc'){
    const s=solveSolar();
    Vinst=s.V; Iinst=s.I; Vrms=s.V; Irms=s.I;
    Pw=Irms*Irms*Rdc;
    freq=0; phi=0; pf=1;
    updateThermal(swClosed&&bulbOK?Irms*Irms*Rb:0);
  } else {
    const ac=solveAC();
    freq=ac.f; phi=ac.ph; pf=Math.cos(phi);
    Vinst=ac.Vp*Math.sin(2*Math.PI*freq*simT);
    Iinst=ac.Ip*Math.sin(2*Math.PI*freq*simT-phi);
    Vrms=ac.Vp/Math.SQRT2; Irms=ac.Ip/Math.SQRT2;
    Pw=Vrms*Irms*pf;
    updateThermal(swClosed&&bulbOK?Irms*Irms*Rb:0);
  }
  if(!swClosed||!bulbOK){ Vrms=Irms=Pw=Vinst=Iinst=0; updateThermal(0); }
  bufV[sptr%SBUF]=Vinst;
  bufI[sptr%SBUF]=Iinst;
  sptr++;
}

// ─── Electron drift ───────────────────────────────────────────────────────────
function stepElectrons(){
  if(!swClosed||!bulbOK) return;
  const spd=Math.min(Math.abs(Irms)*0.003+0.001,0.007);
  const dir=mode==='ac'?Math.sign(Iinst||1):1;
  for(let i=0;i<NE;i++){
    ep[i]=(ep[i]+spd*dir+1)%1;
  }
}

// Wire path parameterisation (loop of 9 segments)
function wirePoint(p){
  const sw_in={x:P.sw.x-30,y:P.sw.y}, sw_out={x:P.sw.x+30,y:P.sw.y};
  const bl_in={x:P.bulb.x-42,y:P.bulb.y}, bl_out={x:P.bulb.x+42,y:P.bulb.y};
  const segs=[
    [P.nD,P.src],[P.src,P.nA],[P.nA,sw_in],[sw_in,sw_out],
    [sw_out,P.nB],[P.nB,bl_in],[bl_in,bl_out],[bl_out,P.nC],[P.nC,P.nD]
  ];
  let tot=0,lens=[];
  for(const s of segs){const d=Math.hypot(s[1].x-s[0].x,s[1].y-s[0].y);lens.push(d);tot+=d;}
  let d=((p%1+1)%1)*tot;
  for(let i=0;i<segs.length;i++){
    if(d<=lens[i]){const tt=d/lens[i];return{x:segs[i][0].x+(segs[i][1].x-segs[i][0].x)*tt,y:segs[i][0].y+(segs[i][1].y-segs[i][0].y)*tt};}
    d-=lens[i];
  }
  return P.nD;
}

// ─── Color utilities ──────────────────────────────────────────────────────────
function bbColor(T){
  const K=T+273;
  let r,g,b;
  if(K<1000){r=1;g=0.02;b=0;}
  else if(K<2000){r=1;g=0.02+(K-1000)/1000*0.38;b=0;}
  else if(K<2800){r=1;g=0.4+(K-2000)/800*0.35;b=(K-2000)/800*0.12;}
  else{r=1;g=0.75+(K-2800)/600*0.22;b=0.12+(K-2800)/600*0.75;}
  return[Math.min(r,1)*255|0,Math.min(g,1)*255|0,Math.min(b,1)*255|0];
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────
function grid(){
  const W=C.width,H=C.height;
  cx.strokeStyle='#090e17';cx.lineWidth=1;
  for(let x=0;x<W;x+=40){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke();}
  for(let y=0;y<H;y+=40){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();}
}

function wire(x1,y1,x2,y2,col,heat=0,lw=3.5){
  if(heat>0.04){
    const [r,g,b]=bbColor(heat*700);
    cx.strokeStyle=`rgba(${r},${g},${b},${heat*0.4})`;
    cx.lineWidth=lw+8;cx.lineCap='round';
    cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();
  }
  cx.strokeStyle=col;cx.lineWidth=lw;cx.lineCap='round';
  cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();
}

function arrow(x1,y1,x2,y2,col,a){
  if(a<0.05)return;
  const mx=(x1+x2)/2,my=(y1+y2)/2,ang=Math.atan2(y2-y1,x2-x1),sz=9+a*5;
  cx.fillStyle=col;cx.globalAlpha=a;
  cx.beginPath();
  cx.moveTo(mx+Math.cos(ang)*sz,my+Math.sin(ang)*sz);
  cx.lineTo(mx+Math.cos(ang+2.5)*sz*0.5,my+Math.sin(ang+2.5)*sz*0.5);
  cx.lineTo(mx+Math.cos(ang-2.5)*sz*0.5,my+Math.sin(ang-2.5)*sz*0.5);
  cx.closePath();cx.fill();cx.globalAlpha=1;
}

// ─── Solar Panel with REAL SUN (moved higher) ─────────────────────────────────
function drawSun(){
  const x=P.sun.x, y=P.sun.y;
  const radius = 40 + G/50; // Sun grows with irradiance
  const alpha = Math.min(G/800, 1);
  
  // Sun glow
  const grad = cx.createRadialGradient(x, y, 5, x, y, radius+30);
  grad.addColorStop(0, `rgba(255, 220, 100, ${alpha})`);
  grad.addColorStop(0.5, `rgba(255, 180, 50, ${alpha*0.5})`);
  grad.addColorStop(1, 'rgba(255, 140, 0, 0)');
  cx.fillStyle = grad;
  cx.beginPath();
  cx.arc(x, y, radius+30, 0, Math.PI*2);
  cx.fill();
  
  // Sun core
  cx.fillStyle = '#ffdd77';
  cx.shadowColor = '#ffaa33';
  cx.shadowBlur = 30 + G/20;
  cx.beginPath();
  cx.arc(x, y, radius, 0, Math.PI*2);
  cx.fill();
  
  // Sun rays (animated)
  cx.shadowBlur = 20;
  cx.strokeStyle = `rgba(255, 200, 100, ${alpha*0.6})`;
  cx.lineWidth = 2;
  for(let i=0; i<12; i++){
    const angle = (i/12)*Math.PI*2 + simT*2;
    const startX = x + Math.cos(angle)*(radius+5);
    const startY = y + Math.sin(angle)*(radius+5);
    const endX = x + Math.cos(angle)*(radius+25 + G/20);
    const endY = y + Math.sin(angle)*(radius+25 + G/20);
    cx.beginPath();
    cx.moveTo(startX, startY);
    cx.lineTo(endX, endY);
    cx.stroke();
  }
  
  // Sunspots (random)
  cx.shadowBlur = 10;
  for(let s=0; s<8; s++){
    const spotX = x + (Math.sin(s*7 + simT*1.5)*(radius*0.3));
    const spotY = y + (Math.cos(s*3 + simT*2.2)*(radius*0.3));
    cx.fillStyle = `rgba(200, 120, 30, 0.2)`;
    cx.beginPath();
    cx.arc(spotX, spotY, 5+Math.sin(simT+s)*2, 0, Math.PI*2);
    cx.fill();
  }
  
  cx.shadowBlur = 0;
}

function drawSolar(){
  const x=P.src.x,y=P.src.y;
  
  // Draw the SUN above the panel (using stored sun position)
  drawSun();
  
  const W=96,H=74,x0=x-W/2,y0=y-H/2;
  cx.fillStyle='#121e2a';cx.fillRect(x0-5,y0-5,W+10,H+10);
  cx.strokeStyle='#2a4050';cx.lineWidth=2;cx.strokeRect(x0-5,y0-5,W+10,H+10);
  const bri=Math.min(G/1000,1);
  for(let ci=0;ci<3;ci++)for(let cj=0;cj<2;cj++){
    const cw=(W-6)/3,ch=(H-4)/2;
    const cx0=x0+ci*(cw+2),cy0=y0+cj*(ch+2);
    const r=15+bri*12|0,g2=30+bri*25|0,b=70+bri*60|0;
    cx.fillStyle=`rgb(${r},${g2},${b})`;cx.fillRect(cx0,cy0,cw,ch);
    cx.strokeStyle='rgba(150,190,240,0.2)';cx.lineWidth=.5;cx.strokeRect(cx0,cy0,cw,ch);
    for(let f=1;f<5;f++){cx.strokeStyle='rgba(200,220,255,0.12)';cx.lineWidth=.4;
      cx.beginPath();cx.moveTo(cx0+cw*f/5,cy0);cx.lineTo(cx0+cw*f/5,cy0+ch);cx.stroke();}
    if(bri>0.05){const sh=cx.createLinearGradient(cx0,cy0,cx0+cw,cy0+ch);
      sh.addColorStop(0,`rgba(255,255,255,${bri*0.1})`);sh.addColorStop(1,'rgba(0,0,0,0)');
      cx.fillStyle=sh;cx.fillRect(cx0,cy0,cw,ch);}
  }
  cx.fillStyle='#cc3333';cx.beginPath();cx.arc(x+W/2+8,y-22,7,0,Math.PI*2);cx.fill();
  cx.fillStyle='#3333bb';cx.beginPath();cx.arc(x-W/2-8,y+22,7,0,Math.PI*2);cx.fill();
  cx.fillStyle='#fff';cx.font='bold 11px Share Tech Mono';cx.textAlign='center';
  cx.fillText('+',x+W/2+8,y-18);cx.fillText('\u2212',x-W/2-8,y+26);
  cx.fillStyle='#3a6070';cx.font='8px Share Tech Mono';
  cx.fillText('PV PANEL',x,y0-10);
  cx.fillStyle='#224050';cx.fillText(G+' W/m²  '+Tc+'°C',x,y0+H+16);
  
  // Sun rays from panel (reflection)
  if(bri>0.3){
    cx.strokeStyle = `rgba(255, 220, 100, ${bri*0.2})`;
    cx.lineWidth = 1;
    for(let r=0; r<5; r++){
      cx.beginPath();
      cx.moveTo(x+40, y-25);
      cx.lineTo(x+100+Math.sin(simT+r)*20, y-80-Math.cos(simT+r)*10);
      cx.stroke();
    }
  }
}

// ─── Synchronous Generator ────────────────────────────────────────────────────
function drawGenerator(){
  const x=P.src.x,y=P.src.y;
  // Stator
  cx.fillStyle='#10181f';cx.beginPath();cx.arc(x,y,58,0,Math.PI*2);cx.fill();
  cx.strokeStyle='#1e3040';cx.lineWidth=5;cx.beginPath();cx.arc(x,y,58,0,Math.PI*2);cx.stroke();
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2;
    cx.fillStyle=i%3===0?'#1a3545':i%3===1?'#153530':'#251530';
    cx.beginPath();cx.moveTo(x+Math.cos(a)*40,y+Math.sin(a)*40);
    cx.lineTo(x+Math.cos(a+.22)*40,y+Math.sin(a+.22)*40);
    cx.lineTo(x+Math.cos(a+.22)*55,y+Math.sin(a+.22)*55);
    cx.lineTo(x+Math.cos(a)*55,y+Math.sin(a)*55);
    cx.closePath();cx.fill();
  }
  // Air gap
  cx.fillStyle='#08101a';cx.beginPath();cx.arc(x,y,39,0,Math.PI*2);cx.fill();
  // Rotor
  cx.save();cx.translate(x,y);
  const spin=mode==='ac'&&swClosed&&bulbOK?simT*rpm/60*2*Math.PI*0.16:0;
  cx.rotate(spin);
  cx.fillStyle='#1e2e3e';cx.beginPath();cx.ellipse(0,0,32,20,0,0,Math.PI*2);cx.fill();
  const pg=cx.createRadialGradient(22,0,2,22,0,16);
  pg.addColorStop(0,'#aa2020');pg.addColorStop(1,'#38080a');
  cx.fillStyle=pg;cx.beginPath();cx.arc(22,0,16,0,Math.PI*2);cx.fill();
  const sg=cx.createRadialGradient(-22,0,2,-22,0,16);
  sg.addColorStop(0,'#2020aa');sg.addColorStop(1,'#08083a');
  cx.fillStyle=sg;cx.beginPath();cx.arc(-22,0,16,0,Math.PI*2);cx.fill();
  cx.fillStyle='rgba(255,120,120,.8)';cx.font='bold 9px Share Tech Mono';cx.textAlign='center';
  cx.fillText('N',22,3);
  cx.fillStyle='rgba(120,120,255,.8)';cx.fillText('S',-22,3);
  cx.fillStyle='#3a4a5a';cx.beginPath();cx.arc(0,0,5,0,Math.PI*2);cx.fill();
  cx.restore();
  cx.fillStyle='#cc3333';cx.beginPath();cx.arc(x+58,y-20,7,0,Math.PI*2);cx.fill();
  cx.fillStyle='#3333bb';cx.beginPath();cx.arc(x-58,y+20,7,0,Math.PI*2);cx.fill();
  cx.fillStyle='#fff';cx.font='bold 11px Share Tech Mono';cx.textAlign='center';
  cx.fillText('+',x+58,y-16);cx.fillText('\u2212',x-58,y+24);
  cx.fillStyle='#3a6070';cx.font='8px Share Tech Mono';
  cx.fillText('AC GENERATOR',x,y-65);
  cx.fillStyle='#224050';cx.fillText(rpm+' RPM',x,y+70);
}

// ─── Knife Switch ─────────────────────────────────────────────────────────────
function drawSwitch(){
  const x=P.sw.x,y=P.sw.y;
  cx.fillStyle='#0b1520';cx.fillRect(x-52,y-16,104,32);
  cx.strokeStyle='#182a38';cx.lineWidth=1.5;cx.strokeRect(x-52,y-16,104,32);
  // Posts
  for(const px of[x-40,x+40]){
    cx.fillStyle='#3a4a58';cx.fillRect(px-6,y-20,12,40);
    cx.fillStyle='#c8a830';cx.beginPath();cx.arc(px,y,8,0,Math.PI*2);cx.fill();
    cx.strokeStyle='#8a7018';cx.lineWidth=1;cx.stroke();
    cx.fillStyle='#402000';cx.beginPath();cx.arc(px,y,4,0,Math.PI*2);cx.fill();
  }
  // Blade
  const bc=swClosed?'#00c8ff':'#888';
  cx.shadowColor=swClosed?'rgba(0,200,255,.7)':'transparent';cx.shadowBlur=swClosed?16:0;
  cx.strokeStyle=bc;cx.lineWidth=7;cx.lineCap='round';
  cx.beginPath();cx.moveTo(x-40,y);
  swClosed?cx.lineTo(x+40,y):cx.lineTo(x+30,y-32);
  cx.stroke();cx.shadowBlur=0;
  // Pivot
  cx.fillStyle='#6a8a9a';cx.beginPath();cx.arc(x-40,y,5,0,Math.PI*2);cx.fill();
  // Arcs
  for(let i=arcPts.length-1;i>=0;i--){
    const p=arcPts[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life-=0.025;
    if(p.life<=0){arcPts.splice(i,1);continue;}
    cx.fillStyle=`rgba(${p.r},${p.g},${p.b},${p.life})`;
    cx.beginPath();cx.arc(p.x,p.y,p.sz*p.life,0,Math.PI*2);cx.fill();
  }
  cx.fillStyle=swClosed?'#00c8ff':'#aa3333';cx.font='bold 8px Share Tech Mono';cx.textAlign='center';
  cx.fillText(swClosed?'CLOSED':'OPEN',x,y-24);
  cx.fillStyle='#1a3040';cx.font='7px Share Tech Mono';cx.fillText('SWITCH',x,y+26);
}

// ─── Incandescent Bulb ────────────────────────────────────────────────────────
function drawBulb(){
  const x=P.bulb.x,y=P.bulb.y;
  const glow=Math.max((Tf-350)/3000,0);
  const [fr,fg,fb]=bbColor(Tf);

  if(!bulbOK){
    cx.strokeStyle='#334455';cx.lineWidth=1.5;cx.setLineDash([4,4]);
    cx.beginPath();cx.arc(x,y-16,34,0,Math.PI*2);cx.stroke();cx.setLineDash([]);
    cx.strokeStyle='#445566';cx.lineWidth=1;
    [[-30,-28,10,18],[14,-24,-16,20],[2,-34,0,24],[22,-10,-24,8]].forEach(s=>{
      cx.beginPath();cx.moveTo(x+s[0],y+s[1]);cx.lineTo(x+s[2],y+s[3]);cx.stroke();});
    cx.fillStyle='#772222';cx.font='bold 9px Share Tech Mono';cx.textAlign='center';
    cx.fillText('OPEN FILAMENT',x,y+54);
    return;
  }

  // Glow halo
  if(glow>0.02){
    const R=50+glow*100;
    const gr=cx.createRadialGradient(x,y-20,10,x,y-20,R);
    gr.addColorStop(0,`rgba(${fr},${fg},${fb},${glow*0.6})`);
    gr.addColorStop(1,'rgba(0,0,0,0)');
    cx.fillStyle=gr;cx.beginPath();cx.arc(x,y-20,R,0,Math.PI*2);cx.fill();
  }

  // Glass bulb (teardrop shape)
  cx.beginPath();
  cx.moveTo(x-15,y+12);
  cx.bezierCurveTo(x-35,y-2,x-35,-30,x,y-52);
  cx.bezierCurveTo(x+35,-30,x+35,y-2,x+15,y+12);
  cx.closePath();
  const ga=0.08+glow*0.65;
  cx.fillStyle=glow>0.05?`rgba(${fr},${Math.min(fg+20,255)},${fb},${ga})`:'rgba(160,190,220,0.07)';
  cx.fill();
  cx.strokeStyle=glow>0.08?`rgba(${fr},${fg},${fb},0.7)`:'#1a2a3a';
  cx.lineWidth=1.5;cx.stroke();

  // Neck + base
  cx.fillStyle='#202e3e';cx.fillRect(x-11,y+12,22,9);
  cx.fillStyle='#2c3c4c';cx.fillRect(x-14,y+21,28,26);
  for(let i=0;i<5;i++){cx.fillStyle=i%2?'#263444':'#1e2c3c';cx.fillRect(x-14,y+21+i*5,28,5);}

  // Filament
  cx.shadowColor=glow>0.05?`rgb(${fr},${fg},${fb})`:'transparent';
  cx.shadowBlur=glow>0.05?glow*28:0;
  cx.strokeStyle=glow>0.05?`rgba(${fr},${fg},${fb},${0.65+glow*0.35})`:'#2a3a4a';
  cx.lineWidth=1.6+glow*2;cx.lineCap='round';
  // Legs
  cx.beginPath();cx.moveTo(x-9,y+10);cx.lineTo(x-9,y-8);cx.stroke();
  cx.beginPath();cx.moveTo(x+9,y+10);cx.lineTo(x+9,y-8);cx.stroke();
  // Coil
  cx.beginPath();cx.moveTo(x-9,y-8);
  for(let i=0;i<8;i++){cx.lineTo(x+(i%2===0?9:-9),y-8-i*4.8);}
  cx.lineTo(x+9,y-8);cx.stroke();
  // Support
  cx.strokeStyle='rgba(80,110,130,0.35)';cx.lineWidth=0.7;cx.shadowBlur=0;
  cx.beginPath();cx.moveTo(x,y-8);cx.lineTo(x,y-32);cx.stroke();

  cx.shadowBlur=0;
  // Terminals
  cx.fillStyle='#cc3333';cx.beginPath();cx.arc(x-14,y+32,5,0,Math.PI*2);cx.fill();
  cx.fillStyle='#3333bb';cx.beginPath();cx.arc(x+14,y+32,5,0,Math.PI*2);cx.fill();
  cx.fillStyle='#2a4050';cx.font='8px Share Tech Mono';cx.textAlign='center';
  cx.fillText(Rb.toFixed(1)+'Ω',x,y+56);
  cx.fillStyle=Tf>2500?'#ffaa44':Tf>800?'#aa7733':'#2a4050';
  cx.fillText(Math.round(Tf)+'°C',x,y+66);
}

// ─── Main render ──────────────────────────────────────────────────────────────
function render(){
  cx.clearRect(0,0,C.width,C.height);
  grid();

  const act=swClosed&&bulbOK;
  const heat=act?Math.min(Irms*Irms*0.01,1):0;
  const wc  =act?(mode==='dc'?'#007a9a':'#886600'):'#101e2a';
  const rc  =act?'#8a2020':'#1a0c0c';
  const bc  =act?'#20208a':'#0c0c1a';
  const aa  =act?Math.min(Irms*0.3,1):0;
  const sw_in={x:P.sw.x-30,y:P.sw.y},sw_out={x:P.sw.x+30,y:P.sw.y};
  const bl_in={x:P.bulb.x-42,y:P.bulb.y},bl_out={x:P.bulb.x+42,y:P.bulb.y};

  // Wires — red rail (positive), blue rail (return)
  wire(P.src.x,P.src.y,P.nA.x,P.nA.y,rc,heat);
  arrow(P.src.x,P.src.y,P.nA.x,P.nA.y,rc,aa);
  wire(P.nA.x,P.nA.y,sw_in.x,sw_in.y,rc,heat);
  arrow(P.nA.x,P.nA.y,sw_in.x,sw_in.y,rc,aa);
  if(swClosed){
    wire(sw_out.x,sw_out.y,P.nB.x,P.nB.y,wc,heat);
    arrow(sw_out.x,sw_out.y,P.nB.x,P.nB.y,wc,aa);
  }
  wire(P.nB.x,P.nB.y,bl_in.x,bl_in.y,wc,heat);
  arrow(P.nB.x,P.nB.y,bl_in.x,bl_in.y,wc,aa);
  wire(bl_out.x,bl_out.y,P.nC.x,P.nC.y,bc,heat);
  arrow(bl_out.x,bl_out.y,P.nC.x,P.nC.y,bc,aa);
  wire(P.nC.x,P.nC.y,P.nD.x,P.nD.y,bc,heat);
  arrow(P.nC.x,P.nC.y,P.nD.x,P.nD.y,bc,aa);
  wire(P.nD.x,P.nD.y,P.src.x,P.src.y,bc,heat);
  arrow(P.nD.x,P.nD.y,P.src.x,P.src.y,bc,aa);

  // Corner nodes
  [[P.nA,'#0a2030'],[P.nB,'#0a2030'],[P.nC,'#0a1030'],[P.nD,'#0a1030']].forEach(([n,c])=>{
    cx.fillStyle=c;cx.beginPath();cx.arc(n.x,n.y,4,0,Math.PI*2);cx.fill();
  });

  // Components
  if(mode==='dc') drawSolar(); else drawGenerator();
  drawSwitch();
  drawBulb();

  // Electrons
  if(act){
    const ec=mode==='dc'?[0,200,255]:[255,170,0];
    const ea=Math.min(0.25+Math.abs(Irms)*0.25,1);
    for(let i=0;i<NE;i++){
      const pos=wirePoint(ep[i]);
      cx.beginPath();cx.arc(pos.x,pos.y,4,0,Math.PI*2);
      cx.fillStyle=`rgba(${ec[0]},${ec[1]},${ec[2]},${ea})`;cx.fill();
      cx.beginPath();cx.arc(pos.x,pos.y,8,0,Math.PI*2);
      cx.fillStyle=`rgba(${ec[0]},${ec[1]},${ec[2]},${ea*0.15})`;cx.fill();
    }
  }

  // AC direction indicator
  if(mode==='ac'&&act&&freq>0){
    const sig=Iinst>=0?1:-1;
    const aa2=Math.min(Math.abs(Iinst)*0.18,0.9);
    const fx=P.nA.x+(P.sw.x-P.nA.x)*((Math.sin(simT*3)+1)*0.5);
    cx.fillStyle=`rgba(255,200,0,${aa2})`;cx.font='18px sans-serif';cx.textAlign='center';
    cx.fillText(sig>=0?'→':'←',fx,P.sw.y-28);
  }

  // Physics info
  const pe=document.getElementById('phys');
  if(mode==='dc'){
    const Voc=G>0?(G/1000*(8.617e-5*(Tc+273.15)*1.35)*Math.log(G/1000*8/1e-10+1)).toFixed(2):'0.00';
    pe.innerHTML=`<b>SOLAR · Shockley model + REAL SUN</b><br>
Isc=${(G/1000*8).toFixed(2)} A &nbsp; Voc≈${(G/1000*21.5).toFixed(2)} V<br>
Rf=${Rb.toFixed(2)} Ω &nbsp; Tf=${Math.round(Tf)}°C`;
  } else {
    const Za=Math.sqrt(Rac*Rac+(2*Math.PI*freq*Lmh/1e3)**2);
    pe.innerHTML=`<b>GENERATOR · Synchronous</b><br>
f=${freq.toFixed(2)} Hz &nbsp; φ=${(phi*180/Math.PI).toFixed(1)}°<br>
PF=${pf.toFixed(3)} &nbsp; |Z|=${Za.toFixed(2)} Ω`;
  }
}

// ─── Oscilloscope ─────────────────────────────────────────────────────────────
function renderScope(){
  const W=SC.width,H=SC.height;
  sx.fillStyle='rgba(2,5,8,0.22)';sx.fillRect(0,0,W,H);
  // Grid
  sx.strokeStyle='rgba(20,50,70,0.6)';sx.lineWidth=1;
  for(let i=1;i<5;i++){
    const x=W*i/5;sx.beginPath();sx.moveTo(x,0);sx.lineTo(x,H);sx.stroke();
    const y=H*i/5;sx.beginPath();sx.moveTo(0,y);sx.lineTo(W,y);sx.stroke();
  }
  sx.strokeStyle='rgba(30,80,100,.8)';sx.lineWidth=1;
  sx.beginPath();sx.moveTo(0,H/2);sx.lineTo(W,H/2);sx.stroke();

  const n=Math.min(sptr,SBUF);if(n<2)return;
  const vS=mode==='dc'?2.2:0.65, iS=mode==='dc'?9:5;

  sx.shadowColor='rgba(255,215,0,.5)';sx.shadowBlur=4;
  sx.strokeStyle='#ffd700';sx.lineWidth=1.6;sx.beginPath();
  for(let j=0;j<n;j++){
    const idx=(sptr-n+j)%SBUF;
    const px=j/n*W, py=H/2-bufV[idx]*vS;
    j===0?sx.moveTo(px,py):sx.lineTo(px,py);
  }
  sx.stroke();

  sx.shadowColor='rgba(74,184,255,.5)';sx.shadowBlur=4;
  sx.strokeStyle='#4ab8ff';sx.lineWidth=1.6;sx.beginPath();
  for(let j=0;j<n;j++){
    const idx=(sptr-n+j)%SBUF;
    const px=j/n*W, py=H/2-bufI[idx]*iS;
    j===0?sx.moveTo(px,py):sx.lineTo(px,py);
  }
  sx.stroke();sx.shadowBlur=0;
  document.getElementById('sc-info').textContent=
    mode==='ac'&&freq>0?`${freq.toFixed(1)} Hz`:'DC';
}

// ─── Meters ───────────────────────────────────────────────────────────────────
function updateUI(){
  document.getElementById('m-V').innerHTML=Vrms.toFixed(2)+'<span class="mu">V</span>';
  document.getElementById('m-I').innerHTML=Irms.toFixed(3)+'<span class="mu">A</span>';
  document.getElementById('m-P').innerHTML=Pw.toFixed(2)+'<span class="mu">W</span>';
  if(mode==='ac'){
    document.getElementById('m-fbox').style.display='';
    document.getElementById('m-pfbox').style.display='';
    document.getElementById('m-F').innerHTML=freq.toFixed(2)+'<span class="mu">Hz</span>';
    document.getElementById('m-PF').innerHTML=
      `φ=${(phi*180/Math.PI).toFixed(1)}°  PF=${pf.toFixed(3)}`;
  } else {
    document.getElementById('m-fbox').style.display='none';
    document.getElementById('m-pfbox').style.display='none';
  }
  const tEl=document.getElementById('m-Tf');
  tEl.innerHTML=Math.round(Tf)+'<span class="mu">°C</span>';
  tEl.style.color=Tf>2500?'#ffaa44':Tf>800?'#cc7722':Tf>200?'#886644':'#2a4050';
  const d=document.getElementById('dot'),s=document.getElementById('sts');
  if(swClosed&&bulbOK&&Vrms>0.05){
    d.className='dot dg';
    s.textContent='ACTIVE — '+(mode==='dc'?'DC':'AC '+freq.toFixed(1)+' Hz');
  } else if(!swClosed){
    d.className='dot dr';s.textContent='SWITCH OPEN';
  } else if(!bulbOK){
    d.className='dot dr';s.textContent='BULB BROKEN';
  } else {
    d.className='dot doff';s.textContent='NO POWER';
  }
}

// ─── Main loop ────────────────────────────────────────────────────────────────
function loop(){
  physStep();stepElectrons();
  render();renderScope();updateUI();
  requestAnimationFrame(loop);
}

// ─── Input bindings ───────────────────────────────────────────────────────────
[['s-G','v-G',v=>G=v],['s-T','v-T',v=>Tc=v],['s-Rdc','v-Rdc',v=>Rdc=v],
 ['s-rpm','v-rpm',v=>rpm=v],['s-If','v-If',v=>If=v],['s-Rac','v-Rac',v=>Rac=v],
 ['s-L','v-L',v=>Lmh=v]].forEach(([id,vid,fn])=>{
  document.getElementById(id).addEventListener('input',function(){
    fn(parseFloat(this.value));
    document.getElementById(vid).textContent=this.value + 
      (id==='s-G'?' W/m²':id==='s-T'?'°C':id==='s-Rdc'||id==='s-Rac'?' Ω':id==='s-rpm'?' RPM':id==='s-If'?' A':id==='s-L'?' mH':'');
  });
});

// ─── Canvas interactions ──────────────────────────────────────────────────────
C.addEventListener('click',e=>{
  const r=C.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  if(Math.hypot(mx-P.sw.x,my-P.sw.y)<55){
    if(swClosed&&(Irms>0.2||Math.abs(Iinst)>0.5)){
      for(let i=0;i<35;i++){
        const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*5;
        arcPts.push({x:P.sw.x,y:P.sw.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2.5,
                     life:1,sz:Math.random()*3+.5,r:160+Math.random()*95|0,
                     g:200+Math.random()*55|0,b:255});
      }
    }
    swClosed=!swClosed;
  }
  if(Math.hypot(mx-P.bulb.x,my-P.bulb.y)<60){
    bulbOK=!bulbOK;if(!bulbOK)Tf=25;
  }
});

C.addEventListener('mousemove',e=>{
  const r=C.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  const tip=document.getElementById('tip');
  if(Math.hypot(mx-P.sw.x,my-P.sw.y)<55){
    C.style.cursor='pointer';tip.style.display='block';
    tip.style.left=(mx+16)+'px';tip.style.top=(my-10)+'px';
    tip.textContent='Click — '+(swClosed?'OPEN switch':'CLOSE switch');
  } else if(Math.hypot(mx-P.bulb.x,my-P.bulb.y)<60){
    C.style.cursor='pointer';tip.style.display='block';
    tip.style.left=(mx+16)+'px';tip.style.top=(my-10)+'px';
    tip.textContent='Click — '+(bulbOK?'BREAK filament':'RESTORE bulb');
  } else {
    C.style.cursor='default';tip.style.display='none';
  }
});

function setMode(m){
  mode=m;
  bufV.fill(0);bufI.fill(0);sptr=0;Tf=25;Rb=Rb0;
  ep=Array.from({length:NE},()=>Math.random());
  document.getElementById('dc-box').style.display=m==='dc'?'':'none';
  document.getElementById('ac-box').style.display=m==='ac'?'':'none';
  document.getElementById('tab-dc').className='tab'+(m==='dc'?' on':'');
  document.getElementById('tab-ac').className='tab'+(m==='ac'?' on':'');
}

loop();