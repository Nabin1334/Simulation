(function() {
  // canvases
  const analogCanvas = document.getElementById('analogCanvas');
  const digitalCanvas = document.getElementById('digitalCanvas');
  function setCanvasSize(canvas, w, h) {
    canvas.width = w; canvas.height = h; canvas.style.width = w+'px'; canvas.style.height = h+'px';
  }
  setCanvasSize(analogCanvas, 700, 180);
  setCanvasSize(digitalCanvas, 700, 180);

  // UI
  const analogBtn = document.getElementById('btnAnalog');
  const digitalBtn = document.getElementById('btnDigital');
  const analogCard = document.getElementById('analogSignalCard');
  const digitalCard = document.getElementById('digitalSignalCard');
  const examplesCard = document.getElementById('examplesCard');
  const examplesHeading = document.getElementById('examplesHeading');
  const exampleList = document.getElementById('exampleList');

  // minimal examples (3 each)
  const analogEx = [
    { icon: '🎤', text: 'microphone / voice', tag: 'sound' },
    { icon: '🌡️', text: 'mercury thermometer', tag: 'continuous' },
    { icon: '📻', text: 'AM radio wave', tag: 'smooth' }
  ];
  const digitalEx = [
    { icon: '💽', text: 'USB flash drive', tag: 'binary' },
    { icon: '⌨️', text: 'keyboard (on/off)', tag: '0/1' },
    { icon: '💡', text: 'LED on/off', tag: 'discrete' }
  ];

  function renderExamples(type) {
    const list = type === 'analog' ? analogEx : digitalEx;
    examplesHeading.innerText = type === 'analog' ? '📌 analog examples' : '📌 digital examples';
    if (type === 'digital') {
      examplesCard.classList.add('digital-examples');
    } else {
      examplesCard.classList.remove('digital-examples');
    }

    let html = '';
    list.forEach(item => {
      const exClass = type === 'analog' ? 'analog-ex-item' : 'digital-ex-item';
      html += `
        <div class="example-item ${exClass}">
          <span>${item.icon}</span>
          <span>${item.text}</span>
          <span class="ex-tag">${item.tag}</span>
        </div>
      `;
    });
    exampleList.innerHTML = html;
  }

  // toggle
  function showAnalog() {
    analogBtn.classList.add('active');
    digitalBtn.classList.remove('active');
    analogCard.style.display = 'flex';
    digitalCard.style.display = 'none';
    renderExamples('analog');
  }
  function showDigital() {
    digitalBtn.classList.add('active');
    analogBtn.classList.remove('active');
    analogCard.style.display = 'none';
    digitalCard.style.display = 'flex';
    renderExamples('digital');
  }

  analogBtn.addEventListener('click', showAnalog);
  digitalBtn.addEventListener('click', showDigital);
  renderExamples('analog'); // initial

  // animation 
  let phase = 0, animId, isPlaying = true, speed = 1.0;
  const playPause = document.getElementById('playPauseBtn');
  const speedSlider = document.getElementById('speedSlider');
  const resetBtn = document.getElementById('resetPhaseBtn');

  function drawAnalog(phaseRad) {
    const ctx = analogCanvas.getContext('2d');
    const w = analogCanvas.width, h = analogCanvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = '#d0deeb'; ctx.lineWidth = 1;
    for (let i=0;i<=w;i+=70) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for (let j=0;j<=h;j+=45) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(w,j); ctx.stroke(); }
    ctx.beginPath(); ctx.strokeStyle = '#f39c12'; ctx.lineWidth = 6; ctx.shadowColor = '#f1c40f'; ctx.shadowBlur = 14;
    const amp = 55, center = h/2;
    for (let x=0; x<w; x++) {
      let y = center + amp * Math.sin((x/w)*5*Math.PI + phaseRad);
      if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#d35400';
    for (let x=35; x<w; x+=80) {
      let y = center + amp * Math.sin((x/w)*5*Math.PI + phaseRad);
      ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 2*Math.PI); ctx.fill();
    }
  }

  function drawDigital(phaseRad) {
    const ctx = digitalCanvas.getContext('2d');
    const w = digitalCanvas.width, h = digitalCanvas.height;
    ctx.clearRect(0,0,w,h); ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = '#d0deeb'; ctx.lineWidth=1;
    for (let i=0;i<=w;i+=70) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for (let j=0;j<=h;j+=45) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(w,j); ctx.stroke(); }
    const lowY = h-45, highY = 45, cycles = 3, cycleW = w/cycles;
    ctx.beginPath(); ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 6.5; ctx.shadowColor = '#2d6a7f'; ctx.shadowBlur = 12;
    for (let i=-2; i<=4; i++) {
      let start = i*cycleW - (phaseRad*26)%cycleW;
      let mid = start + cycleW/2, end = start + cycleW;
      if (end < -45 || start > w+45) continue;
      ctx.moveTo(start, lowY); ctx.lineTo(start, highY); ctx.lineTo(mid, highY); ctx.lineTo(mid, lowY); ctx.lineTo(end, lowY);
    }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e3b4f';
    for (let i=-2; i<=4; i++) {
      let base = i*cycleW - (phaseRad*26)%cycleW;
      if (base>=-30 && base<=w+30) { ctx.beginPath(); ctx.arc(base, lowY, 5.5, 0, 2*Math.PI); ctx.fill(); }
      let high = base + cycleW/2;
      if (high>=-30 && high<=w+30) { ctx.beginPath(); ctx.arc(high, highY, 5.5, 0, 2*Math.PI); ctx.fill(); }
    }
    ctx.font = 'bold 20px Inter'; ctx.fillStyle = '#1e4a5f'; ctx.fillText('0', 30, h-30); ctx.fillText('1', 30, 65);
  }

  function animate() {
    if (isPlaying) phase += 0.018 * speed;
    drawAnalog(phase);
    drawDigital(phase);
    animId = requestAnimationFrame(animate);
  }
  animate();

  playPause.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPause.innerHTML = isPlaying ? '⏸️ pause' : '▶️ play';
  });
  speedSlider.addEventListener('input', e => speed = parseFloat(e.target.value));
  resetBtn.addEventListener('click', () => { phase = 0; drawAnalog(phase); drawDigital(phase); });

  drawAnalog(phase); drawDigital(phase);
  window.addEventListener('beforeunload', () => animId && cancelAnimationFrame(animId));
})();