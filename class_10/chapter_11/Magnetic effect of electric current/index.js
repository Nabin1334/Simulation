
'use strict';
(function(){

const CV = document.getElementById('c');
const X  = CV.getContext('2d');
const W=1200, H=648;

/* ── State ───────────────────────────────────────────────────────────────── */
let ON=true, V=6, R=3, I=0, B=0, t=0;

/* ── UI ──────────────────────────────────────────────────────────────────── */
const sv=document.getElementById('sv'), sr=document.getElementById('sr');
const dv=document.getElementById('dv'), dr=document.getElementById('dr');
const di=document.getElementById('di'), db=document.getElementById('db');
const dp=document.getElementById('dp'), pb=document.getElementById('pb');

function calc(){ I=ON?V/R:0; B=4*Math.PI*1e-7*5000*I*1000; }
function upUI(){
  calc();
  dv.textContent=V.toFixed(1)+' V';   dr.textContent=R.toFixed(1)+' \u03a9';
  di.textContent=I.toFixed(2)+' A';   db.textContent=B.toFixed(2)+' mT';
  dp.textContent=(V*I).toFixed(1)+' W';
}
function toggle(){
  ON=!ON; pb.textContent=ON?'\u25cf POWER ON':'\u25cb POWER OFF';
  pb.className='pbtn '+(ON?'on':'off'); upUI();
}
sv.addEventListener('input',e=>{V=+e.target.value;upUI();});
sr.addEventListener('input',e=>{R=+e.target.value;upUI();});
pb.addEventListener('click',toggle);

/* Canvas click → toggle switch */
CV.addEventListener('click',e=>{
  const rc=CV.getBoundingClientRect();
  const mx=(e.clientX-rc.left)*(W/rc.width), my=(e.clientY-rc.top)*(H/rc.height);
  if(mx<490 && Math.abs(mx-220)<60 && Math.abs(my-158)<55) toggle();
});

/* ── Layout ──────────────────────────────────────────────────────────────── */
const SPW=490;                      // schematic panel width
const TY=158, BY=500;               // top / bottom rail Y
const LX=88,  RX=448;              // left / right rail X
const BATY=(TY+BY)/2;              // battery centre Y = 329

/* schematic component centres */
const SW ={x:218,y:TY};
const AMM={x:352,y:TY};
const RHO={x:268,y:BY};
/* coil schematic on right rail */
const SCOL={yT:248,yB:410};

/* physical solenoid */
const SX=848, SY=324;
const SHH=150, CORW=40, CRX=74, CRY=15, NT=12;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function sg(c,b){X.shadowColor=c;X.shadowBlur=b;}
function ns(){X.shadowColor='transparent';X.shadowBlur=0;}
function seg(x1,y1,x2,y2){X.beginPath();X.moveTo(x1,y1);X.lineTo(x2,y2);X.stroke();}
function fdot(x,y,r){X.beginPath();X.arc(x,y,r,0,Math.PI*2);X.fill();}
function fstroke(){X.beginPath();X.arc(0,0,0,0,0);}/* dummy */

/* ══════════════════════════════════════════════════════════════════════════
   BACKGROUND
   ══════════════════════════════════════════════════════════════════════════ */
function drawBG(){
  X.fillStyle='#030810'; X.fillRect(0,0,W,H);

  /* dot grid – schematic panel */
  X.fillStyle='#0b1c2e';
  for(let gx=28;gx<SPW;gx+=34) for(let gy=28;gy<H;gy+=34){
    X.beginPath();X.arc(gx,gy,.85,0,Math.PI*2);X.fill();
  }

  /* radial glow – physical panel */
  const rg=X.createRadialGradient(SX,SY,20,SX,SY,350);
  rg.addColorStop(0,'#06101e'); rg.addColorStop(1,'#030810');
  X.fillStyle=rg; X.fillRect(SPW,0,W-SPW,H);

  /* divider */
  sg('#182840',12); X.strokeStyle='#182840'; X.lineWidth=1;
  X.beginPath();X.moveTo(SPW,14);X.lineTo(SPW,H-14);X.stroke(); ns();

  /* panel headings */
  X.font='bold 8.5px "Orbitron",monospace'; X.textAlign='center';
  X.fillStyle='#142030';
  X.fillText('CIRCUIT DIAGRAM',SPW/2,16);
  X.fillText('PHYSICAL  SOLENOID  +  FIELD  LINES',SPW+(W-SPW)/2,16);
}

/* ══════════════════════════════════════════════════════════════════════════
   SCHEMATIC WIRES
   ══════════════════════════════════════════════════════════════════════════ */
function drawWires(){
  const wc=ON?'#c89030':'#1a2c44';
  X.save(); X.lineWidth=3.5; X.strokeStyle=wc; X.lineCap='round'; X.lineJoin='round';
  sg(wc,ON?10:0);

  /* top rail */
  seg(LX,TY, SW.x-38,TY);                        /* BAT+ → switch-L */
  if(ON) seg(SW.x+38,TY, AMM.x-26,TY);           /* switch-R → AMM-L (only closed) */
  seg(AMM.x+26,TY, RX,TY);                       /* AMM-R → corner */
  /* right rail */
  seg(RX,TY,  RX,SCOL.yT);                       /* corner → coil top */
  seg(RX,SCOL.yB, RX,BY);                        /* coil bottom → corner */
  /* bottom rail */
  seg(RX,BY, RHO.x+56,BY);                       /* corner → RHO-R */
  seg(RHO.x-56,BY, LX,BY);                       /* RHO-L → BAT− */
  /* left rail (battery) */
  seg(LX,TY, LX,BATY-64);
  seg(LX,BATY+64, LX,BY);

  ns(); X.restore();
}

/* ── current-direction arrows on wires ─────────────────────────────────── */
function drawWireArrows(){
  if(!ON||I<0.01)return;
  X.save(); sg('#ffaa33',8); X.fillStyle='#ffcc55';
  function arr(x,y,ang){
    X.save();X.translate(x,y);X.rotate(ang);
    X.beginPath();X.moveTo(-7,-4);X.lineTo(7,0);X.lineTo(-7,4);X.closePath();X.fill();
    X.restore();
  }
  arr(155,TY,0); arr(295,TY,0);         /* top L → R */
  arr(RX,TY+48,Math.PI/2);              /* right rail down upper */
  arr(RX,BY-48,Math.PI/2);              /* right rail down lower */
  arr(360,BY,Math.PI); arr(175,BY,Math.PI); /* bottom R → L */
  ns(); X.restore();
}

/* ── junction dots ──────────────────────────────────────────────────────── */
function drawDots(){
  [[LX,TY],[RX,TY],[RX,BY],[LX,BY]].forEach(([jx,jy])=>{
    sg(ON?'#c89030':'transparent',8);
    X.fillStyle=ON?'#c89030':'#1a2c44';
    fdot(jx,jy,5.5); ns();
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   BATTERY SYMBOL  (vertical, left rail)
   ══════════════════════════════════════════════════════════════════════════ */
function drawBattery(){
  X.save(); X.translate(LX,BATY);
  /* alternating long(+) / short(−) horizontal plates */
  const plates=[{dy:-52,pos:true},{dy:-22,pos:false},{dy:10,pos:true},{dy:40,pos:false}];
  plates.forEach(p=>{
    const hw=p.pos?26:14;
    X.strokeStyle=p.pos?'#3a7898':'#1e4a68'; X.lineWidth=p.pos?3.5:2.2;
    sg(p.pos?'#3a7898':'#1e4a68',p.pos?10:5);
    seg(-hw,p.dy, hw,p.dy);
  });
  ns();
  /* polarity labels */
  X.textAlign='left'; X.font='bold 14px monospace';
  sg('#dd4433',8); X.fillStyle='#ee5544'; X.fillText('+',30,-50); ns();
  sg('#3355aa',6); X.fillStyle='#5577cc'; X.fillText('\u2212',30,44); ns();
  /* voltage */
  X.textAlign='center'; X.fillStyle='#c08025';
  X.font='600 12px "Share Tech Mono",monospace'; sg('#c08025',8);
  X.fillText(V.toFixed(1)+'V',0,-78); ns();
  /* label */
  X.fillStyle='#1e4060'; X.font='11px "Share Tech Mono",monospace';
  X.fillText('E',-46,-50);
  X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   SWITCH  (knife switch)
   ══════════════════════════════════════════════════════════════════════════ */
function drawSwitch(){
  X.save(); X.translate(SW.x,SW.y);
  /* terminals */
  [-38,38].forEach(dx=>{
    const g=X.createRadialGradient(dx,0,1,dx,0,8);
    g.addColorStop(0,'#b8cce0'); g.addColorStop(1,'#50687a');
    X.fillStyle=g; sg('#8ab0cc',8); fdot(dx,0,8); ns();
    X.strokeStyle='#304858'; X.lineWidth=1.5;
    X.beginPath();X.arc(dx,0,8,0,Math.PI*2);X.stroke();
  });
  /* knife blade */
  X.lineWidth=4.5; X.lineCap='round';
  if(ON){
    X.strokeStyle='#22cc66'; sg('#22cc66',22);
    X.beginPath();X.moveTo(-30,0);X.lineTo(30,-6);X.stroke();
  } else {
    X.strokeStyle='#cc3322'; sg('#cc3322',14);
    X.beginPath();X.moveTo(-30,0);X.lineTo(-6,-48);X.stroke();
  }
  ns();
  /* labels */
  X.fillStyle='#1e4060'; X.font='11px "Share Tech Mono",monospace'; X.textAlign='center';
  X.fillText('K',0,26);
  X.fillStyle=ON?'#22cc66':'#cc3322'; X.font='10px "Share Tech Mono",monospace';
  X.fillText(ON?'CLOSED':'OPEN',0,-38);
  X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   AMMETER
   ══════════════════════════════════════════════════════════════════════════ */
function drawAmmeter(){
  X.save(); X.translate(AMM.x,AMM.y);
  const R2=24;
  /* circle body */
  const g=X.createRadialGradient(0,-3,1,0,0,R2);
  g.addColorStop(0,'#0a1828'); g.addColorStop(1,'#050f1a');
  X.fillStyle=g; sg(ON?'#2870aa':'#0e2038',14);
  X.beginPath();X.arc(0,0,R2,0,Math.PI*2);X.fill();
  X.strokeStyle=ON?'#2060a0':'#102030'; X.lineWidth=1.8;
  X.beginPath();X.arc(0,0,R2,0,Math.PI*2);X.stroke(); ns();
  /* scale arc + ticks */
  X.strokeStyle='#1a3a5a'; X.lineWidth=1.5;
  X.beginPath();X.arc(0,3,R2-8,-Math.PI*.8,Math.PI*.8);X.stroke();
  X.strokeStyle='#1e4060'; X.lineWidth=1;
  for(let ti=0;ti<=4;ti++){
    const a=-Math.PI*.8+ti*(Math.PI*1.6/4);
    X.beginPath();
    X.moveTo(Math.cos(a)*(R2-10),3+Math.sin(a)*(R2-10));
    X.lineTo(Math.cos(a)*(R2-6), 3+Math.sin(a)*(R2-6)); X.stroke();
  }
  /* needle */
  if(ON&&I>0.01){
    const ang=-Math.PI*.8+(Math.min(I,12)/12)*Math.PI*1.6;
    X.save(); X.translate(0,3);
    sg('#ff3322',10); X.strokeStyle='#ff4433'; X.lineWidth=2; X.lineCap='round';
    X.beginPath();X.moveTo(0,4);X.lineTo(Math.cos(ang)*(R2-8),Math.sin(ang)*(R2-8));X.stroke();
    ns(); X.fillStyle='#cc2211'; fdot(0,0,2.8); X.restore();
  }
  /* 'A' symbol */
  X.textAlign='center'; X.font='bold 14px "Orbitron",monospace';
  X.fillStyle=ON?'#3a88cc':'#182e48'; X.fillText('A',0,5);
  if(ON){
    sg('#28a8ff',5); X.fillStyle='#28a8ff';
    X.font='10px "Share Tech Mono",monospace'; X.fillText(I.toFixed(2)+'A',0,R2+14); ns();
  }
  X.fillStyle='#1e4060'; X.font='11px "Share Tech Mono",monospace';
  X.fillText('A',0,-R2-8);
  X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   RHEOSTAT
   ══════════════════════════════════════════════════════════════════════════ */
function drawRheostat(){
  X.save(); X.translate(RHO.x,RHO.y);
  const bw=102,bh=22;
  X.fillStyle='#07111e';
  X.strokeStyle=ON?'#c89030':'#1e3248'; X.lineWidth=2;
  sg(ON?'#c89030':'transparent',6);
  X.beginPath();X.rect(-bw/2,-bh/2,bw,bh);X.fill();X.stroke(); ns();
  /* zigzag resistor symbol */
  const steps=8, sw2=bw-16;
  X.strokeStyle=ON?'#c89030':'#1e3248'; X.lineWidth=1.8;
  X.lineCap='round'; X.lineJoin='round';
  X.beginPath(); X.moveTo(-sw2/2,0);
  for(let i=0;i<steps;i++){
    X.lineTo(-sw2/2+(i+.5)*(sw2/steps),(i%2===0?-1:1)*(bh/2-3));
  }
  X.lineTo(sw2/2,0); X.stroke();
  /* sliding arrow */
  const ax=-sw2/2+((R-1)/9)*sw2;
  sg(ON?'#f0a020':'transparent',8);
  X.strokeStyle=ON?'#f0a020':'#182840'; X.lineWidth=2;
  seg(ax,-bh/2-16,ax,-bh/2+2);
  X.fillStyle=ON?'#f0a020':'#182840';
  X.beginPath();X.moveTo(ax-4,-bh/2-6);X.lineTo(ax,-bh/2+2);X.lineTo(ax+4,-bh/2-6);X.closePath();X.fill();
  ns();
  X.fillStyle='#1e4060'; X.font='11px "Share Tech Mono",monospace'; X.textAlign='center';
  X.fillText('Rh = '+R.toFixed(1)+'\u03a9',0,bh/2+14);
  X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   SOLENOID COIL SCHEMATIC SYMBOL  (on right rail, with iron-core lines)
   ══════════════════════════════════════════════════════════════════════════ */
function drawCoilSymbol(){
  X.save();
  const nL=9, lh=(SCOL.yB-SCOL.yT)/nL, bump=19;
  const lc=ON?'#c89030':'#1e3248';
  X.strokeStyle=lc; X.lineWidth=2.8; X.lineCap='round';
  sg(lc,ON?8:0);
  /* D-shaped loops bulging to the right */
  for(let i=0;i<nL;i++){
    const yT=SCOL.yT+i*lh, yB=yT+lh;
    X.beginPath(); X.moveTo(RX,yT);
    X.bezierCurveTo(RX+bump*2.8,yT, RX+bump*2.8,yB, RX,yB);
    X.stroke();
  }
  ns();
  /* iron-core indicator: two parallel vertical lines to the left */
  X.strokeStyle=ON?'#9ab8cc':'#1e3248'; X.lineWidth=2.2;
  [-10,-17].forEach(dx=>{ seg(RX+dx,SCOL.yT+4, RX+dx,SCOL.yB-4); });
  /* label */
  X.fillStyle='#1e4060'; X.font='11px "Share Tech Mono",monospace'; X.textAlign='left';
  X.fillText('L (solenoid)',RX+56,SCOL.yT-6);
  X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   CURRENT FLOW PARTICLES  (animate around schematic circuit path)
   ══════════════════════════════════════════════════════════════════════════ */
const coilMid=(SCOL.yT+SCOL.yB)/2;
const PATH=[
  [LX,TY],[SW.x-38,TY],[SW.x+38,TY],
  [AMM.x-26,TY],[AMM.x+26,TY],[RX,TY],
  [RX,SCOL.yT],[RX,coilMid],[RX,SCOL.yB],[RX,BY],
  [RHO.x+56,BY],[RHO.x-56,BY],[LX,BY],
  [LX,BATY+64],[LX,BATY-64],[LX,TY]
];
function pLen(pa){
  let d=0; for(let i=0;i<pa.length-1;i++) d+=Math.hypot(pa[i+1][0]-pa[i][0],pa[i+1][1]-pa[i][1]); return d;
}
function pAt(pa,d){
  const tot=pLen(pa); d=((d%tot)+tot)%tot; let acc=0;
  for(let i=0;i<pa.length-1;i++){
    const sl=Math.hypot(pa[i+1][0]-pa[i][0],pa[i+1][1]-pa[i][1]);
    if(acc+sl>=d){const f=(d-acc)/sl;return[pa[i][0]+f*(pa[i+1][0]-pa[i][0]),pa[i][1]+f*(pa[i+1][1]-pa[i][1])];}
    acc+=sl;
  } return pa[0];
}
function drawParticles(){
  if(!ON||I<0.01)return;
  const tot=pLen(PATH), nE=20, spd=I*0.020;
  X.save();
  for(let i=0;i<nE;i++){
    const d=((i/nE+t*spd)*tot)%tot;
    const[ex,ey]=pAt(PATH,d);
    if(ex>SPW+12) continue;
    sg('#ff7722',20); X.fillStyle='#ffaa44'; fdot(ex,ey,5.5); ns();
    X.fillStyle='#ffffffb0'; fdot(ex-1,ey-1,1.8);
  }
  ns(); X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   PHYSICAL SOLENOID  (3-D illusion with copper windings + iron core)
   ══════════════════════════════════════════════════════════════════════════ */
function drawSolenoid(){
  X.save(); X.translate(SX,SY);
  const sp=(SHH*2)/NT;

  /* ── iron core ── */
  const cg=X.createLinearGradient(-CORW,0,CORW,0);
  cg.addColorStop(0,'#3a5060'); cg.addColorStop(.3,'#7a9ab0');
  cg.addColorStop(.7,'#7a9ab0'); cg.addColorStop(1,'#3a5060');
  X.fillStyle=cg; sg('#000',24);
  X.beginPath(); X.roundRect(-CORW,-SHH,CORW*2,SHH*2,5); X.fill();
  X.strokeStyle='#5a7888'; X.lineWidth=1.5;
  X.beginPath(); X.roundRect(-CORW,-SHH,CORW*2,SHH*2,5); X.stroke();
  ns();
  /* grain texture */
  X.strokeStyle='#2e4252'; X.lineWidth=.9;
  for(let iy=-SHH+10;iy<SHH;iy+=10){ seg(-CORW+3,iy,CORW-3,iy); }

  /* ── back-half windings (lower semicircles = behind core) ── */
  for(let i=0;i<=NT;i++){
    const wy=-SHH+i*sp;
    const bg=X.createLinearGradient(-CRX,wy,CRX,wy);
    bg.addColorStop(0,'#6a3808'); bg.addColorStop(.5,'#b86820'); bg.addColorStop(1,'#6a3808');
    X.strokeStyle=bg; X.lineWidth=11;
    X.beginPath(); X.ellipse(0,wy,CRX,CRY,0,0,Math.PI); X.stroke();
  }

  /* ── core end caps (drawn over back-half loops) ── */
  const ecg=X.createLinearGradient(-CORW,0,CORW,0);
  ecg.addColorStop(0,'#4a6070'); ecg.addColorStop(.5,'#8aaabb'); ecg.addColorStop(1,'#4a6070');
  X.fillStyle=ecg; sg('#000',10);
  X.beginPath();X.ellipse(0,-SHH,CORW,9,0,0,Math.PI*2);X.fill();
  X.strokeStyle='#6a8898'; X.lineWidth=1.5; X.stroke();
  X.beginPath();X.ellipse(0,SHH,CORW,9,0,0,Math.PI*2);X.fill(); X.stroke();
  ns();

  /* ── front-half windings (upper semicircles = in front) ── */
  for(let i=0;i<=NT;i++){
    const wy=-SHH+i*sp;
    const wg=X.createLinearGradient(-CRX,wy-CRY,CRX,wy+CRY);
    wg.addColorStop(0,'#8a4808'); wg.addColorStop(.3,'#e8a828');
    wg.addColorStop(.7,'#e8a828'); wg.addColorStop(1,'#8a4808');
    X.strokeStyle=wg; X.lineWidth=11;
    sg(ON?'#c8881010':'transparent',5);
    X.beginPath(); X.ellipse(0,wy,CRX,CRY,0,Math.PI,Math.PI*2); X.stroke();
  }
  ns();

  /* ── current direction indicators ── */
  if(ON&&I>0.01){
    for(let i=0;i<NT;i++){
      const wy=-SHH+(i+.5)*sp;
      /* left side: DOT (current out of page) */
      sg('#ffaa33',14); X.fillStyle='#ffcc44'; fdot(-CRX-12,wy,4);
      X.fillStyle='#ffffffaa'; fdot(-CRX-12,wy,1.5);
      /* right side: CROSS (current into page) */
      ns(); sg('#ffaa33',10); X.strokeStyle='#ffcc44'; X.lineWidth=2;
      const rx=CRX+12;
      X.beginPath();X.moveTo(rx-3.5,wy-3.5);X.lineTo(rx+3.5,wy+3.5);X.stroke();
      X.beginPath();X.moveTo(rx+3.5,wy-3.5);X.lineTo(rx-3.5,wy+3.5);X.stroke();
    }
    ns();
  }

  /* ── N / S pole labels ── */
  if(ON&&I>0.01){
    const al=Math.min(1,I*.35);
    X.font='bold 24px "Orbitron",monospace'; X.textAlign='center';
    sg('#ff2233',28); X.fillStyle=`rgba(255,48,48,${al})`;   X.fillText('N',0,-SHH-22);
    sg('#2244ff',28); X.fillStyle=`rgba(55,100,255,${al})`; X.fillText('S',0,SHH+42);
    ns();
  }
  /* iron core label */
  X.fillStyle='#2a4a60'; X.font='11px "Share Tech Mono",monospace'; X.textAlign='left';
  X.fillText('iron core',CORW+8,2);
  X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   MAGNETIC FIELD LINES
   Internal: straight dashed lines S→N (bottom to top inside solenoid)
   External: closed Bézier loops N→S outside (classic dipole pattern)
   ══════════════════════════════════════════════════════════════════════════ */
function drawFieldLines(){
  if(!ON||I<0.01)return;
  const al=Math.min(.9,I/2.5*.8);
  X.save(); X.translate(SX,SY);

  /* ── internal ── */
  const inOff=(t*52)%16;
  X.setLineDash([6,8]); X.lineDashOffset=inOff; X.lineWidth=1.8;
  for(let xi=-20;xi<=20;xi+=10){
    const a=al*(0.88-Math.abs(xi)*.016);
    X.strokeStyle=`rgba(38,148,255,${a})`; sg('#2694ff',7);
    X.beginPath();X.moveTo(xi,SHH-6);X.lineTo(xi,-SHH+6);X.stroke();
  }
  X.setLineDash([]);
  /* upward arrows inside */
  ns(); X.fillStyle=`rgba(50,155,255,${al*.7})`;
  [-20,-10,0,10,20].forEach(xi=>{
    X.beginPath();
    X.moveTo(xi-3.5,-SHH+26);X.lineTo(xi,-SHH+11);X.lineTo(xi+3.5,-SHH+26);
    X.closePath();X.fill();
  });

  /* ── external ── */
  const exOff=-(t*34)%18;
  X.setLineDash([5,9]); X.lineDashOffset=exOff;
  const TOP=-SHH-12, BOT=SHH+12;
  [
    {sp:106,al:.56,lw:1.8},
    {sp:166,al:.39,lw:1.5},
    {sp:238,al:.24,lw:1.3},
    {sp:318,al:.13,lw:1.0},
  ].forEach(c=>{
    const fa=al*c.al;
    X.strokeStyle=`rgba(28,108,255,${fa})`; X.lineWidth=c.lw; sg('#1a6cff',6*c.al);
    const s=c.sp;
    /* right arc */
    X.beginPath(); X.moveTo(5,TOP);
    X.bezierCurveTo(s,TOP-28,s+22,0,s,BOT+18);
    X.bezierCurveTo(s-8,BOT+36,18,BOT+12,5,BOT);
    X.stroke();
    /* left arc (mirror) */
    X.beginPath(); X.moveTo(-5,TOP);
    X.bezierCurveTo(-s,TOP-28,-(s+22),0,-s,BOT+18);
    X.bezierCurveTo(-(s-8),BOT+36,-18,BOT+12,-5,BOT);
    X.stroke();
  });
  X.setLineDash([]); ns();
  X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPASS NEEDLES  –  positions + dipole-field angle calculation
   ══════════════════════════════════════════════════════════════════════════
   Dipole moment m along −y canvas (N pole at top).
   Field at offset (dx,dy) from centre:
     Bx ∝ −3·dx·dy / r⁵
     By ∝ (r²  − 3·dy²) / r⁵
   Needle angle (from canvas-up, clockwise) = atan2(Bx, −By)
   ══════════════════════════════════════════════════════════════════════════ */
function dipoleAngle(dx,dy){
  const r2=dx*dx+dy*dy; if(r2<1)return 0;
  const r5=Math.pow(r2,2.5);
  const bx=-3*dx*dy/r5, by=(r2-3*dy*dy)/r5;
  return Math.atan2(bx,-by);
}

const CMPS=[
  /* [dx, dy]  relative to solenoid centre */
  [0,-240],[0,245],           /* directly above N, below S */
  [168,0],[-168,0],           /* equatorial left & right */
  [140,-185],[-140,-185],     /* upper-right, upper-left */
  [140,185],[-140,185],       /* lower-right, lower-left */
  [252,-95],[-252,-95],       /* far upper */
  [252,95],[-252,95],         /* far lower */
];

function drawCompasses(){
  CMPS.forEach(([dx,dy],idx)=>{
    const cpx=SX+dx, cpy=SY+dy;
    if(cpx<SPW+14||cpx>W-14||cpy<22||cpy>H-22) return;

    let ang;
    if(ON&&I>0.01){
      ang=dipoleAngle(dx,dy);
      /* tiny realistic settling wobble */
      ang+=Math.sin(t*2.1+idx*1.5)*0.022/(1+I*.3);
    } else {
      /* random resting orientations, slow drift */
      ang=Math.sin(idx*2.4)*.9*Math.PI+Math.sin(t*.4+idx)*.10;
    }

    X.save(); X.translate(cpx,cpy);
    /* housing */
    const hg=X.createRadialGradient(0,-2,1,0,0,18);
    hg.addColorStop(0,'#0a1825'); hg.addColorStop(1,'#050c18');
    X.fillStyle=hg; sg('#000',10);
    X.beginPath();X.arc(0,0,18,0,Math.PI*2);X.fill();
    X.strokeStyle=ON?'#182e48':'#0c1828'; X.lineWidth=1.5;
    X.beginPath();X.arc(0,0,18,0,Math.PI*2);X.stroke(); ns();
    /* tick marks */
    X.strokeStyle='#0c1e30'; X.lineWidth=.9;
    for(let ti=0;ti<8;ti++){
      const ta=ti*Math.PI/4;
      X.beginPath();
      X.moveTo(Math.cos(ta)*14,Math.sin(ta)*14);
      X.lineTo(Math.cos(ta)*17,Math.sin(ta)*17); X.stroke();
    }
    X.rotate(ang);
    /* North half – red */
    sg('#ff2233',ON?14:0); X.fillStyle='#ff3344';
    X.beginPath();X.moveTo(0,0);X.lineTo(-4,-1.5);X.lineTo(0,-16);X.lineTo(4,-1.5);X.closePath();X.fill();
    /* South half – silver-blue */
    sg('#3355ee',ON?8:0); X.fillStyle='#9ab4cc';
    X.beginPath();X.moveTo(0,0);X.lineTo(-4,1.5);X.lineTo(0,16);X.lineTo(4,1.5);X.closePath();X.fill();
    /* pivot */
    ns(); X.fillStyle='#040c18'; fdot(0,0,2.8);
    X.strokeStyle='#2a3848'; X.lineWidth=.8;
    X.beginPath();X.arc(0,0,2.8,0,Math.PI*2);X.stroke();
    X.restore();
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   SOLENOID MAGNETIC AURA
   ══════════════════════════════════════════════════════════════════════════ */
function drawAura(){
  if(!ON||I<0.01)return;
  const pulse=1+Math.sin(t*2.7)*.035, str=Math.min(.14,I/12*.14);
  const ag=X.createRadialGradient(SX,SY,28,SX,SY,295*pulse);
  ag.addColorStop(0,`rgba(18,65,195,${str*2.2})`);
  ag.addColorStop(.6,`rgba(12,45,160,${str})`);
  ag.addColorStop(1,'rgba(6,22,80,0)');
  X.fillStyle=ag;
  X.beginPath();X.ellipse(SX,SY,315*pulse,345*pulse,0,0,Math.PI*2);X.fill();
}

/* ══════════════════════════════════════════════════════════════════════════
   INFO PANELS
   ══════════════════════════════════════════════════════════════════════════ */
function drawInfoLeft(){
  const px=12,py=H-193,pw=262,ph=174;
  X.save();
  X.fillStyle='#050d1c'; X.strokeStyle='#0c1c30'; X.lineWidth=1;
  sg('#0048a0',8);
  X.beginPath();X.roundRect(px,py,pw,ph,8);X.fill();X.stroke(); ns();
  X.font='bold 8.5px "Orbitron",monospace'; X.textAlign='left';
  X.fillStyle='#1a4070'; X.fillText('LIVE CIRCUIT ANALYSIS',px+12,py+17);
  X.strokeStyle='#0c1c30'; X.lineWidth=1;
  X.beginPath();X.moveTo(px+8,py+25);X.lineTo(px+pw-8,py+25);X.stroke();

  const rows=[
    ['Voltage  V',V.toFixed(1)+' V','#c89030'],
    ['Resistance R',R.toFixed(1)+' \u03a9','#c89030'],
    ['Current  I = V/R', ON?I.toFixed(3)+' A':'0.000 A', ON?'#28e880':'#1a3020'],
    ['Power    P = V\u00b7I', ON?(V*I).toFixed(2)+' W':'0.00 W', ON?'#ff8844':'#3a1808'],
    ['Field    B = \u03bc\u2080nI', ON?B.toFixed(3)+' mT':'0.000 mT', ON?'#28a8ff':'#0a1e38'],
    ['Turns    n=5000/m','N = 500','#1e4060'],
  ];
  rows.forEach(([lbl,val,vc],i)=>{
    const ry=py+42+i*22;
    X.font='11px "Share Tech Mono",monospace'; X.fillStyle='#1e4060';
    X.textAlign='left'; X.fillText(lbl,px+12,ry);
    X.fillStyle=vc; sg(vc,4);
    X.textAlign='right'; X.fillText(val,px+pw-10,ry); ns();
  });
  X.textAlign='left';
  X.restore();
}

function drawInfoRight(){
  const px=W-192,py=28,pw=178,ph=196;
  X.save();
  X.fillStyle='#050d1c'; X.strokeStyle='#0c1c30'; X.lineWidth=1;
  X.beginPath();X.roundRect(px,py,pw,ph,8);X.fill();X.stroke();
  X.font='bold 8.5px "Orbitron",monospace'; X.textAlign='left';
  X.fillStyle='#1a4070'; X.fillText('RIGHT-HAND RULE',px+12,py+17);
  X.strokeStyle='#0c1c30'; X.lineWidth=1;
  X.beginPath();X.moveTo(px+8,py+25);X.lineTo(px+pw-8,py+25);X.stroke();

  X.font='11px "Share Tech Mono",monospace'; X.fillStyle='#1e4060';
  const lines=[
    '1. Hold solenoid in',
    '   your right hand.',
    '2. Curl fingers in',
    '   direction of the',
    '   conventional',
    '   current.',
    '3. Extended thumb',
    '   points to N pole.',
    '   (N is at TOP here)',
  ];
  lines.forEach((l,i)=>{ X.fillText(l,px+12,py+40+i*17); });
  if(ON&&I>0.01){
    sg('#20c848',12); X.fillStyle='#20c848';
    X.font='bold 11px "Share Tech Mono",monospace';
    X.fillText('\u2192 N pole: TOP \u2191',px+12,py+ph-10); ns();
  }
  X.restore();
}

/* ── legend ─────────────────────────────────────────────────────────────── */
function drawLegend(){
  const px=SPW+14,py=H-80,pw=236,ph=62;
  X.save();
  X.fillStyle='#050d1c'; X.strokeStyle='#0c1c30'; X.lineWidth=1;
  X.beginPath();X.roundRect(px,py,pw,ph,8);X.fill();X.stroke();
  X.font='bold 8.5px "Orbitron",monospace'; X.textAlign='left';
  X.fillStyle='#1a4070'; X.fillText('LEGEND',px+12,py+16);
  X.font='10px "Share Tech Mono",monospace';
  [['#ffcc44','\u25cf  Conventional current direction'],
   ['#2888ff','---  Magnetic field lines (B)'],
   ['#ff3344','N \u25b2  North pole  /  compass N-end'],
  ].forEach(([c,t],i)=>{ X.fillStyle=c; X.fillText(t,px+12,py+32+i*14); });
  X.restore();
}

/* ── status bar ─────────────────────────────────────────────────────────── */
function drawStatus(){
  X.save(); X.font='10px "Share Tech Mono",monospace'; X.textAlign='center';
  X.fillStyle=ON?'#1e4868':'#0e1e2e';
  const msg=ON
    ?'CIRCUIT ACTIVE  \u00b7  V='+V.toFixed(1)+'V  R='+R.toFixed(1)+'\u03a9  I='+I.toFixed(3)+'A'
     +'  B='+B.toFixed(3)+'mT  P='+(V*I).toFixed(2)+'W  \u00b7  Solenoid acts as ELECTROMAGNET'
    :'CIRCUIT OPEN  \u00b7  No current flows  \u00b7  No magnetic field  \u00b7  Compass needles show ambient orientation';
  X.fillText(msg,W/2,H-6); X.restore();
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN RENDER LOOP
   ══════════════════════════════════════════════════════════════════════════ */
function frame(){
  X.clearRect(0,0,W,H);
  drawBG();
  drawAura();
  drawFieldLines();
  drawWires();
  drawWireArrows();
  drawDots();
  drawBattery();
  drawSwitch();
  drawAmmeter();
  drawRheostat();
  drawCoilSymbol();
  drawSolenoid();
  drawCompasses();
  drawParticles();
  drawInfoLeft();
  drawInfoRight();
  drawLegend();
  drawStatus();
  t+=1/60;
  requestAnimationFrame(frame);
}

upUI(); frame();
})();