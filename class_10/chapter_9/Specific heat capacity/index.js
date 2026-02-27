
(function() {
// ==================== CONSTANTS ====================
const MASS = 100;                // g
const POWER = 2090;               // J/min
const C_W = 4.18;                 // J/g°C
const C_O = 2.09;
const T_AMB = 20;
const BOIL = 100;

const R_W = POWER / (MASS * C_W); // 5.0 °C/min
const R_O = POWER / (MASS * C_O); // 10.0 °C/min

const TIME_BOIL_W = (BOIL - T_AMB) / R_W; // 16.0 min
const TIME_BOIL_O = (BOIL - T_AMB) / R_O; // 8.0 min

const TAU_W = 12;   // water cooling constant
const TAU_O = 6;    // oil

// ==================== STATE ====================
let vt = 0;                // virtual time (minutes)
let running = false;       // time advancing?
let flameOn = false;       // burners lit?
let simSpeed = 2;
let flameOffTime = Infinity;  // time when flame was turned off (if off)

// For proper reheat, we need to know when flame was turned back on
let flameOnTime = 0;       // last time flame was turned on (virtual time)
// But we can handle naturally with temperature functions that track heating from current temp.

// We'll use a more direct approach: store the temperature at the moment flame is turned off,
// and when flame is turned back on, we resume heating from that temperature, but we must
// account for the fact that time continues. So we need to know the "effective start time"
// for heating. Simpler: use piecewise functions that depend on flameOn and flameOffTime.

// However, to make reheat work from any temperature after cooling, we need to know
// the temperature at the moment flame is turned on. That temperature is already
// correctly given by currentWaterTemp()/currentOilTemp() at that moment.
// Then heating should continue from that temperature as if we started heating at a
// virtual time that would produce that temperature. That virtual time = (temp - T_AMB)/R.
// So we can compute an "effective heating start time" for the current heating phase.

// Let's implement that robustly:

let waterTempAtLastFlameOn = T_AMB;
let oilTempAtLastFlameOn = T_AMB;
let waterHeatingStartTime = 0; // virtual time when current heating phase began
let oilHeatingStartTime = 0;

// We'll update these when flame is turned on.

function currentWaterTemp() {
  if (flameOn) {
    // Heating: temperature increases linearly from the temp at flame-on,
    // but we need to know how much time has passed since flame was turned on.
    let heatingDuration = vt - waterHeatingStartTime;
    // Temperature cannot exceed BOIL
    return Math.min(waterTempAtLastFlameOn + heatingDuration * R_W, BOIL);
  } else {
    // Cooling
    if (vt <= flameOffTime) {
      // Before flame off (should not happen if flameOn=false, but safety)
      return Math.min(T_AMB + vt * R_W, BOIL);
    } else {
      // After flame off: exponential decay from the temperature at flameOffTime
      let tempAtOff = Math.min(T_AMB + Math.min(flameOffTime, TIME_BOIL_W) * R_W, BOIL);
      let coolingDuration = vt - flameOffTime;
      let cooled = T_AMB + (tempAtOff - T_AMB) * Math.exp(-coolingDuration / TAU_W);
      return Math.max(T_AMB, cooled);
    }
  }
}

function currentOilTemp() {
  if (flameOn) {
    let heatingDuration = vt - oilHeatingStartTime;
    return Math.min(oilTempAtLastFlameOn + heatingDuration * R_O, BOIL);
  } else {
    if (vt <= flameOffTime) {
      return Math.min(T_AMB + vt * R_O, BOIL);
    } else {
      let tempAtOff = Math.min(T_AMB + Math.min(flameOffTime, TIME_BOIL_O) * R_O, BOIL);
      let coolingDuration = vt - flameOffTime;
      let cooled = T_AMB + (tempAtOff - T_AMB) * Math.exp(-coolingDuration / TAU_O);
      return Math.max(T_AMB, cooled);
    }
  }
}

// ==================== CANVAS DRAWING ====================
const labC = document.getElementById('labCanvas');
const lctx = labC.getContext('2d');
const LW = 960, LH = 520;
const BENCH_Y = 468;
const CXW = 200;      // water center
const CXO = 700;      // oil center

const BNR_TIP_Y = 410;
const GAUZE_Y = 408;
const BKR_IN_BOTTOM = 399;
const BKR_IN_TOP = 249;
const BKR_HW_BOT = 50;
const BKR_HW_TOP = 58;
const ROD_X_OFF = 88;
const ROD_TOP_Y = 140;
const THERM_X_OFF = 42;  // <-- INCREASED from 32 to 42 (more right)
const THERM_BULB_Y = 388;
const THERM_TOP_Y = 192;

let flamePhase = 0;

function drawBackground(ctx) {
  ctx.fillStyle = '#d0d7e0'; ctx.fillRect(0,0,LW, BENCH_Y-18);
  ctx.fillStyle = '#b8a488'; ctx.fillRect(0, BENCH_Y-18, LW, 24);
  ctx.fillStyle = '#4e3b28'; ctx.fillRect(0, BENCH_Y, LW, LH-BENCH_Y);
}
function drawStand(ctx,cx) { ctx.fillStyle = '#555'; ctx.fillRect(cx+ROD_X_OFF-5, ROD_TOP_Y, 10, BENCH_Y-18-ROD_TOP_Y); }
function drawRing(ctx,cx) { ctx.strokeStyle = '#888'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, GAUZE_Y, 68, 0, Math.PI*2); ctx.stroke(); }
function drawWireGauze(ctx,cx) { ctx.fillStyle = '#aaa'; ctx.fillRect(cx-60, GAUZE_Y-4, 120, 8); }
function drawBunsenBurner(ctx,cx,side) { ctx.fillStyle = '#777'; ctx.fillRect(cx-20, BNR_TIP_Y-10, 40, 60); }

function drawFlame(ctx, cx) {
  if (!flameOn) return;
  const baseY = BNR_TIP_Y+1; const fp2 = flamePhase;
  const outerH = 46+Math.sin(fp2*2.1)*4; const outerW = 17+Math.sin(fp2*1.7)*2; const tipX = cx+Math.sin(fp2)*2.2; const tipY = baseY-outerH;
  ctx.save(); ctx.beginPath(); ctx.moveTo(cx-outerW,baseY); ctx.bezierCurveTo(cx-outerW*1.2,baseY-outerH*.38,tipX-6,tipY+10,tipX,tipY); ctx.bezierCurveTo(tipX+6,tipY+10,cx+outerW*1.2,baseY-outerH*.38,cx+outerW,baseY); ctx.closePath();
  const og = ctx.createLinearGradient(cx,baseY,cx,tipY); og.addColorStop(0,'rgba(255,170,0,0.92)'); og.addColorStop(0.35,'rgba(255,110,0,0.82)'); og.addColorStop(0.75,'rgba(255,65,0,0.5)'); og.addColorStop(1,'rgba(255,50,0,0)'); ctx.fillStyle=og; ctx.fill(); ctx.restore();
}

function drawThermometer(ctx, cx, temp) {
  const tx = cx + THERM_X_OFF;  // now 42
  const bulbY = THERM_BULB_Y;
  const topY = THERM_TOP_Y;
  const tubeH = bulbY - 8 - topY;
  const frac = Math.min(1, Math.max(0, temp / 100));
  const mercH = tubeH * frac;
  ctx.save();
  ctx.strokeStyle = '#aaccff'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(tx, topY); ctx.lineTo(tx, bulbY-8); ctx.stroke();
  if (mercH > 0) {
    ctx.beginPath(); ctx.moveTo(tx, bulbY-8); ctx.lineTo(tx, bulbY-8 - mercH);
    ctx.strokeStyle = '#e03030'; ctx.lineWidth = 10; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(tx, bulbY+4, 12, 0, 2*Math.PI);
  ctx.fillStyle = '#c04040'; ctx.shadowColor = '#ff6060'; ctx.shadowBlur = 8; ctx.fill();
  ctx.shadowBlur = 0; ctx.restore();
  ctx.fillStyle = 'white'; ctx.font = 'bold 10px JetBrains Mono'; ctx.textAlign = 'center';
  ctx.fillText(temp.toFixed(1)+'°C', tx, bulbY-35);
}

function drawBeaker(ctx, cx, temp, color) {
  ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},0.5)`; 
  ctx.beginPath(); ctx.moveTo(cx-BKR_HW_BOT, BKR_IN_BOTTOM); ctx.lineTo(cx-BKR_HW_TOP, BKR_IN_TOP); ctx.lineTo(cx+BKR_HW_TOP, BKR_IN_TOP); ctx.lineTo(cx+BKR_HW_BOT, BKR_IN_BOTTOM); ctx.closePath(); ctx.fill();
}

function drawApparatusLabel(ctx, cx, name, cval, color, temp) {
  ctx.fillStyle = color; ctx.font = 'bold 14px Outfit'; ctx.textAlign = 'center'; ctx.fillText(name, cx, BENCH_Y+25);
  ctx.fillStyle = '#aaa'; ctx.font = '10px monospace'; ctx.fillText(cval+' J/g°C', cx, BENCH_Y+40);
}

// ==================== GRAPH ====================
const graphC = document.getElementById('graphCanvas');
const gctx = graphC.getContext('2d');
const GCW = 820, GCH = 155;

function drawGraph() {
  gctx.clearRect(0,0,GCW,GCH);
  gctx.fillStyle = '#14171d';
  gctx.fillRect(0,0,GCW,GCH);
  
  for (let t = 0; t <= 100; t += 20) {
    let y = 130 - (t / 100) * 120;
    gctx.beginPath();
    gctx.strokeStyle = '#444';
    gctx.lineWidth = 0.3;
    gctx.moveTo(50, y);
    gctx.lineTo(770, y);
    gctx.stroke();
    gctx.fillStyle = '#888';
    gctx.font = '8px JetBrains Mono';
    gctx.fillText(t + '°C', 20, y+3);
  }
  
  for (let tm = 0; tm <= 24; tm += 4) {
    let x = 50 + (tm / 24) * 720;
    gctx.beginPath();
    gctx.strokeStyle = '#444';
    gctx.moveTo(x, 10);
    gctx.lineTo(x, 130);
    gctx.stroke();
    gctx.fillStyle = '#888';
    gctx.fillText(tm + 'm', x-8, 143);
  }
  
  gctx.strokeStyle = '#aaa';
  gctx.lineWidth = 1;
  gctx.beginPath(); gctx.moveTo(50,10); gctx.lineTo(50,130); gctx.stroke();
  gctx.beginPath(); gctx.moveTo(50,130); gctx.lineTo(770,130); gctx.stroke();

  if (wHist.length < 2) return;
  gctx.strokeStyle = '#58a6ff';
  gctx.lineWidth = 2;
  gctx.beginPath();
  for (let i=0; i<wHist.length; i++) {
    let x = 50 + (wHist[i].t / 24) * 720;
    let y = 130 - (wHist[i].T / 100) * 120;
    if (x > 770) break;
    if (i===0) gctx.moveTo(x, y);
    else gctx.lineTo(x, y);
  }
  gctx.stroke();

  gctx.strokeStyle = '#f0b429';
  gctx.beginPath();
  for (let i=0; i<oHist.length; i++) {
    let x = 50 + (oHist[i].t / 24) * 720;
    let y = 130 - (oHist[i].T / 100) * 120;
    if (x > 770) break;
    if (i===0) gctx.moveTo(x, y);
    else gctx.lineTo(x, y);
  }
  gctx.stroke();
}

// ==================== RENDER LOOP ====================
let lastTs = null;
let wHist = [{t:0, T:T_AMB}];
let oHist = [{t:0, T:T_AMB}];
let lastLogT = 0;

function render(ts) {
  requestAnimationFrame(render);
  if (running) {
    if (lastTs) {
      const dtR = (ts - lastTs) / 1000;
      const dtV = dtR * simSpeed;
      vt += dtV;
      if (vt - lastLogT >= 0.1) {
        wHist.push({t:vt, T:currentWaterTemp()});
        oHist.push({t:vt, T:currentOilTemp()});
        lastLogT = vt;
        if (wHist.length > 500) wHist.shift();
        if (oHist.length > 500) oHist.shift();
      }
    }
    lastTs = ts;
  } else { lastTs = null; }

  flamePhase += 0.1;
  const wT = currentWaterTemp();
  const oT = currentOilTemp();

  lctx.clearRect(0,0,LW,LH);
  drawBackground(lctx);
  
  drawStand(lctx, CXW); drawRing(lctx, CXW); drawWireGauze(lctx, CXW); drawBunsenBurner(lctx, CXW, 'left');
  if (flameOn) drawFlame(lctx, CXW);
  drawBeaker(lctx, CXW, wT, [80,155,230]);
  drawThermometer(lctx, CXW, wT);
  drawApparatusLabel(lctx, CXW, 'WATER', '4.18', '#58a6ff', wT);
  
  drawStand(lctx, CXO); drawRing(lctx, CXO); drawWireGauze(lctx, CXO); drawBunsenBurner(lctx, CXO, 'right');
  if (flameOn) drawFlame(lctx, CXO);
  drawBeaker(lctx, CXO, oT, [200,155,30]);
  drawThermometer(lctx, CXO, oT);
  drawApparatusLabel(lctx, CXO, 'OIL', '2.09', '#f0b429', oT);

  document.getElementById('wTempEl').textContent = wT.toFixed(1)+'°C';
  document.getElementById('oTempEl').textContent = oT.toFixed(1)+'°C';
  document.getElementById('wThermFill').style.width = (wT/100*100)+'%';
  document.getElementById('oThermFill').style.width = (oT/100*100)+'%';

  const wΔ = wT - T_AMB; const oΔ = oT - T_AMB;
  const maxΔ = 80;
  document.getElementById('wDeltaEl').textContent = `+${wΔ.toFixed(1)}°C`;
  document.getElementById('oDeltaEl').textContent = `+${oΔ.toFixed(1)}°C`;
  document.getElementById('wBar').style.width = `${Math.min(100, (wΔ/maxΔ)*100)}%`;
  document.getElementById('oBar').style.width = `${Math.min(100, (oΔ/maxΔ)*100)}%`;

  const m = Math.floor(vt); const s = Math.floor((vt-m)*60);
  document.getElementById('timerEl').textContent = `${m}:${s.toString().padStart(2,'0')}`;

  const qW = (MASS * C_W * Math.max(0, wΔ)).toFixed(0);
  const qO = (MASS * C_O * Math.max(0, oΔ)).toFixed(0);
  document.getElementById('qwEl').textContent = qW + ' J';
  document.getElementById('qoEl').textContent = qO + ' J';

  if (flameOn) {
    let remainW = Math.max(0, (BOIL - wT) / R_W);
    let remainO = Math.max(0, (BOIL - oT) / R_O);
    document.getElementById('timeToBoilWater').textContent = remainW.toFixed(1)+' min';
    document.getElementById('timeToBoilOil').textContent = remainO.toFixed(1)+' min';
    document.getElementById('timeCoolWater').textContent = '—';
    document.getElementById('timeCoolOil').textContent = '—';
  } else {
    document.getElementById('timeToBoilWater').textContent = '—';
    document.getElementById('timeToBoilOil').textContent = '—';
    if (wT > 30) {
      let coolW = -TAU_W * Math.log((30-T_AMB)/(wT-T_AMB));
      document.getElementById('timeCoolWater').textContent = coolW.toFixed(1)+' min';
    } else { document.getElementById('timeCoolWater').textContent = '0.0 min'; }
    if (oT > 30) {
      let coolO = -TAU_O * Math.log((30-T_AMB)/(oT-T_AMB));
      document.getElementById('timeCoolOil').textContent = coolO.toFixed(1)+' min';
    } else { document.getElementById('timeCoolOil').textContent = '0.0 min'; }
  }

  drawGraph();
}

// ==================== CONTROLS ====================
function resetAll() {
  vt = 0;
  running = false;
  flameOn = false;
  flameOffTime = Infinity;
  waterHeatingStartTime = 0;
  oilHeatingStartTime = 0;
  waterTempAtLastFlameOn = T_AMB;
  oilTempAtLastFlameOn = T_AMB;
  wHist = [{t:0, T:T_AMB}];
  oHist = [{t:0, T:T_AMB}];
  lastLogT = 0;
}

document.getElementById('fireOnBtn').addEventListener('click', ()=>{
  if (!flameOn) {
    // Turn flame on: record current temps as starting point for heating
    waterTempAtLastFlameOn = currentWaterTemp();
    oilTempAtLastFlameOn = currentOilTemp();
    waterHeatingStartTime = vt;
    oilHeatingStartTime = vt;
    flameOn = true;
    flameOffTime = Infinity; // clear off time
    if (!running) running = true;
  }
});

document.getElementById('fireOffBtn').addEventListener('click', ()=>{
  if (flameOn) {
    flameOn = false;
    flameOffTime = vt;
  }
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  resetAll();
});

document.getElementById('speedSel').addEventListener('change', (e)=>{
  simSpeed = parseInt(e.target.value);
});

requestAnimationFrame(render);
})();