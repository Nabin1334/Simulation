function toggleInfo() {
  document.getElementById("infoPanel").classList.toggle("visible");
}

document.addEventListener("DOMContentLoaded", function () {
  const simulation = document.getElementById("simulation");
  const simWidth = simulation.clientWidth;
  const simHeight = simulation.clientHeight;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", `0 0 ${simWidth} ${simHeight}`);
  simulation.appendChild(svg);

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  // Metallic gradient
  const metallicGrad = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  metallicGrad.setAttribute("id", "metallic");
  metallicGrad.innerHTML = `
                <stop offset="0%" stop-color="#E8E8E8"/>
                <stop offset="50%" stop-color="#A0A0A0"/>
                <stop offset="100%" stop-color="#707070"/>
            `;
  defs.appendChild(metallicGrad);

  // Copper gradient
  const copperGrad = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  copperGrad.setAttribute("id", "copper");
  copperGrad.innerHTML = `
                <stop offset="0%" stop-color="#E87722"/>
                <stop offset="50%" stop-color="#B87333"/>
                <stop offset="100%" stop-color="#9C5A2E"/>
            `;
  defs.appendChild(copperGrad);

  // Plastic gradient
  const plasticGrad = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  plasticGrad.setAttribute("id", "plastic");
  plasticGrad.innerHTML = `
                <stop offset="0%" stop-color="#FF6B6B"/>
                <stop offset="100%" stop-color="#C92A2A"/>
            `;
  defs.appendChild(plasticGrad);

  // Wood gradient
  const woodGrad = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  woodGrad.setAttribute("id", "wood");
  woodGrad.innerHTML = `
                <stop offset="0%" stop-color="#8B4513"/>
                <stop offset="100%" stop-color="#654321"/>
            `;
  defs.appendChild(woodGrad);

  // Aluminum gradient
  const aluminumGrad = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  aluminumGrad.setAttribute("id", "aluminum");
  aluminumGrad.innerHTML = `
                <stop offset="0%" stop-color="#D3D3D3"/>
                <stop offset="50%" stop-color="#A9A9A9"/>
                <stop offset="100%" stop-color="#808080"/>
            `;
  defs.appendChild(aluminumGrad);

  svg.appendChild(defs);

  // ============================================
  // CREATE MAGNET
  // ============================================

  const magnetGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  magnetGroup.setAttribute("cursor", "move");

  const magnetShadow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  magnetShadow.setAttribute("x", simWidth / 2 - 42);
  magnetShadow.setAttribute("y", simHeight / 2 - 17);
  magnetShadow.setAttribute("width", 84);
  magnetShadow.setAttribute("height", 44);
  magnetShadow.setAttribute("rx", 12);
  magnetShadow.setAttribute("fill", "rgba(0, 0, 0, 0.3)");
  magnetShadow.setAttribute("filter", "blur(4px)");
  magnetGroup.appendChild(magnetShadow);

  // Magnet body - single piece
  const magnetBody = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  magnetBody.setAttribute("x", simWidth / 2 - 70); // Center for new width
  magnetBody.setAttribute("y", simHeight / 2 - 20);
  magnetBody.setAttribute("width", 140); // Increased length
  magnetBody.setAttribute("height", 40);
  magnetBody.setAttribute("rx", 10);
  magnetBody.setAttribute("fill", "#D3D3D3");
  magnetBody.setAttribute("stroke", "#808080");
  magnetBody.setAttribute("stroke-width", "2");
  magnetGroup.appendChild(magnetBody);

  // Top highlight on magnet
  const topHighlight = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  topHighlight.setAttribute("x", simWidth / 2 - 40);
  topHighlight.setAttribute("y", simHeight / 2 - 15);
  topHighlight.setAttribute("width", 80);
  topHighlight.setAttribute("height", 8);
  topHighlight.setAttribute("rx", 4);
  topHighlight.setAttribute("fill", "rgba(255, 255, 255, 0.4)");
  magnetGroup.appendChild(topHighlight);

  // North Pole (Red side - left half)
  const northPole = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  northPole.setAttribute("x", simWidth / 2 - 70);
  northPole.setAttribute("y", simHeight / 2 - 20);
  northPole.setAttribute("width", 70);
  northPole.setAttribute("height", 40);
  northPole.setAttribute("rx", 10);
  northPole.setAttribute("fill", "#E63946");
  northPole.setAttribute("opacity", "0.85");
  magnetGroup.appendChild(northPole);

  // South Pole (Blue side - right half)
  const southPole = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  southPole.setAttribute("x", simWidth / 2);
  southPole.setAttribute("y", simHeight / 2 - 20);
  southPole.setAttribute("width", 70);
  southPole.setAttribute("height", 40);
  southPole.setAttribute("rx", 10);
  southPole.setAttribute("fill", "#457B9D");
  southPole.setAttribute("opacity", "0.85");
  magnetGroup.appendChild(southPole);

  // Add magnet image overlay
  const magnetImage = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  magnetImage.setAttribute("x", simWidth / 2 - 70);
  magnetImage.setAttribute("y", simHeight / 2 - 20);
  magnetImage.setAttribute("width", 140);
  magnetImage.setAttribute("height", 40);
  magnetImage.setAttribute("href", "magnet.png");
  magnetImage.setAttribute("preserveAspectRatio", "none"); // Stretch to fit exactly
  magnetImage.setAttribute("opacity", "0.9");
  magnetGroup.appendChild(magnetImage);

  const northLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  northLabel.setAttribute("x", simWidth / 2 - 22.5);
  northLabel.setAttribute("y", simHeight / 2 + 7);
  northLabel.setAttribute("text-anchor", "middle");
  northLabel.setAttribute("fill", "white");
  northLabel.setAttribute("font-weight", "bold");
  northLabel.setAttribute("font-size", "20");
  northLabel.textContent = "";
  magnetGroup.appendChild(northLabel);

  const southLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  southLabel.setAttribute("x", simWidth / 2 + 22.5);
  southLabel.setAttribute("y", simHeight / 2 + 7);
  southLabel.setAttribute("text-anchor", "middle");
  southLabel.setAttribute("fill", "white");
  southLabel.setAttribute("font-weight", "bold");
  southLabel.setAttribute("font-size", "20");
  southLabel.textContent = "";
  magnetGroup.appendChild(southLabel);

  svg.appendChild(magnetGroup);

  let magnetData = { x: simWidth / 2, y: simHeight / 2 };

  // Field lines
  const fieldLines = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const fieldLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    fieldLine.setAttribute("fill", "none");
    fieldLine.setAttribute("stroke", "rgba(255, 107, 107, 0.15)");
    fieldLine.setAttribute("stroke-width", "2");
    fieldLine.setAttribute("stroke-dasharray", "5,5");

    svg.insertBefore(fieldLine, magnetGroup);
    fieldLines.push(fieldLine);
  }

  function updateFieldLines() {
    fieldLines.forEach((line, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const startX = magnetData.x + Math.cos(angle) * 50;
      const startY = magnetData.y + Math.sin(angle) * 50;
      const endX = magnetData.x + Math.cos(angle) * 130;
      const endY = magnetData.y + Math.sin(angle) * 130;

      const pathData = `M ${startX} ${startY} Q ${
        (startX + endX) / 2 + Math.cos(angle + Math.PI / 2) * 20
      } ${
        (startY + endY) / 2 + Math.sin(angle + Math.PI / 2) * 20
      } ${endX} ${endY}`;
      line.setAttribute("d", pathData);
    });
  }

  updateFieldLines();

  // ============================================
  // MATERIAL CREATION FUNCTIONS
  // ============================================

  const materials = [];

  function createMaterial(x, y, isMagnetic, renderFunc, label) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("cursor", "grab");

    const glow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    glow.setAttribute("cx", x);
    glow.setAttribute("cy", y);
    glow.setAttribute("r", 35);
    glow.setAttribute("fill", "none");
    glow.setAttribute("stroke", isMagnetic ? "#ff6b6b" : "#4ecdc4");
    glow.setAttribute("stroke-width", "0");
    glow.setAttribute("opacity", "0");
    glow.classList.add("glow");
    group.appendChild(glow);

    renderFunc(group, x, y);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + 45);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "10");
    text.setAttribute("font-weight", "bold");
    text.textContent = label;
    group.appendChild(text);

    group.materialData = {
      x,
      y,
      originalX: x,
      originalY: y,
      isMagnetic,
      attachedToMagnet: false,
      isDragging: false,
    };

    svg.appendChild(group);
    materials.push(group);

    makeDraggable(group);
    return group;
  }

  function makeDraggable(material) {
    // Mouse events
    material.addEventListener("mousedown", function (e) {
      startDrag(e.clientX, e.clientY);
      e.stopPropagation();
      e.preventDefault();
    });

    // Touch events
    material.addEventListener("touchstart", function (e) {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
      e.stopPropagation();
      e.preventDefault();
    });

    function startDrag(clientX, clientY) {
      material.materialData.isDragging = true;
      material.style.cursor = "grabbing";

      const rect = svg.getBoundingClientRect();
      const offsetX = clientX - rect.left - material.materialData.x;
      const offsetY = clientY - rect.top - material.materialData.y;

      function dragMaterial(e) {
        let x, y;
        if (e.touches) {
          x = e.touches[0].clientX - rect.left - offsetX;
          y = e.touches[0].clientY - rect.top - offsetY;
        } else {
          x = e.clientX - rect.left - offsetX;
          y = e.clientY - rect.top - offsetY;
        }
        // Clamp position inside SVG
        x = Math.max(30, Math.min(x, simWidth - 30));
        y = Math.max(30, Math.min(y, simHeight - 30));

        material.materialData.x = x;
        material.materialData.y = y;

        if (material.materialData.attachedToMagnet) {
          const dx = material.materialData.x - magnetData.x;
          const dy = material.materialData.y - magnetData.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 90) {
            material.materialData.attachedToMagnet = false;
          }
        }

        updateTransform(material);
      }

      function stopDrag() {
        material.materialData.isDragging = false;
        material.style.cursor = "grab";
        document.removeEventListener("mousemove", dragMaterial);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchmove", dragMaterial);
        document.removeEventListener("touchend", stopDrag);
      }

      document.addEventListener("mousemove", dragMaterial);
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchmove", dragMaterial, { passive: false });
      document.addEventListener("touchend", stopDrag);
    }
  }

  function updateTransform(material) {
    const dx = material.materialData.x - material.materialData.originalX;
    const dy = material.materialData.y - material.materialData.originalY;
    material.setAttribute("transform", `translate(${dx}, ${dy})`);
  }

  // Render functions for each material type
  function renderIronNail(group, x, y) {
    const shadow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    );
    shadow.setAttribute("cx", x + 2);
    shadow.setAttribute("cy", y + 30);
    shadow.setAttribute("rx", 6);
    shadow.setAttribute("ry", 2);
    shadow.setAttribute("fill", "rgba(0, 0, 0, 0.3)");
    shadow.setAttribute("filter", "blur(2px)");
    group.appendChild(shadow);

    const body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    body.setAttribute("x", x - 2);
    body.setAttribute("y", y - 20);
    body.setAttribute("width", 8); // Increased size
    body.setAttribute("height", 60); // Increased size
    body.setAttribute("fill", "url(#metallic)");
    body.setAttribute("stroke", "#505050");
    group.appendChild(body);

    const point = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    point.setAttribute(
      "d",
      `M ${x - 2} ${y + 20} L ${x} ${y + 25} L ${x + 2} ${y + 20} Z`
    );
    point.setAttribute("fill", "#808080");
    group.appendChild(point);

    const head = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    head.setAttribute("cx", x);
    head.setAttribute("cy", y - 20);
    head.setAttribute("r", 10); // Increased size
    head.setAttribute("fill", "#A0A0A0");
    head.setAttribute("stroke", "#707070");
    group.appendChild(head);
  }

  function renderSteelScrew(group, x, y) {
    const body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    body.setAttribute("x", x - 2);
    body.setAttribute("y", y - 10);
    body.setAttribute("width", 8); // Increased size
    body.setAttribute("height", 25);
    body.setAttribute("fill", "url(#metallic)");
    group.appendChild(body);

    const head = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    head.setAttribute("cx", x);
    head.setAttribute("cy", y - 10);
    head.setAttribute("r", 10); // Increased size
    head.setAttribute("fill", "#B0B0B0");
    head.setAttribute("stroke", "#606060");
    group.appendChild(head);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x - 3);
    line.setAttribute("y1", y - 10);
    line.setAttribute("x2", x + 3);
    line.setAttribute("y2", y - 10);
    line.setAttribute("stroke", "#404040");
    line.setAttribute("stroke-width", "1");
    group.appendChild(line);
  }

  function renderSteelClip(group, x, y) {
    const clip = document.createElementNS("http://www.w3.org/2000/svg", "path");
    clip.setAttribute(
      "d",
      `M ${x - 10} ${y - 15} Q ${x - 10} ${y - 20} ${x - 5} ${y - 20} L ${
        x + 5
      } ${y - 20} Q ${x + 10} ${y - 20} ${x + 10} ${y - 15} L ${x + 10} ${
        y + 10
      } Q ${x + 10} ${y + 15} ${x + 5} ${y + 15} L ${x - 5} ${y + 15} Q ${
        x - 10
      } ${y + 15} ${x - 10} ${y + 10} Z`
    );
    clip.setAttribute("fill", "none");
    clip.setAttribute("stroke", "url(#metallic)");
    clip.setAttribute("stroke-width", "3");
    group.appendChild(clip);
  }

  function renderIronKey(group, x, y) {
    const head = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    head.setAttribute("cx", x - 15);
    head.setAttribute("cy", y);
    head.setAttribute("r", 8);
    head.setAttribute("fill", "url(#metallic)");
    head.setAttribute("stroke", "#505050");
    group.appendChild(head);

    const hole = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    hole.setAttribute("cx", x - 15);
    hole.setAttribute("cy", y);
    hole.setAttribute("r", 3);
    hole.setAttribute("fill", "#2c3e50");
    group.appendChild(hole);

    const shaft = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    shaft.setAttribute("x", x - 7);
    shaft.setAttribute("y", y - 2);
    shaft.setAttribute("width", 25);
    shaft.setAttribute("height", 4);
    shaft.setAttribute("fill", "url(#metallic)");
    group.appendChild(shaft);

    const teeth = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    teeth.setAttribute(
      "d",
      `M ${x + 18} ${y + 2} L ${x + 18} ${y + 6} L ${x + 15} ${y + 6} L ${
        x + 15
      } ${y + 4} L ${x + 12} ${y + 4} L ${x + 12} ${y + 6} L ${x + 10} ${
        y + 6
      } L ${x + 10} ${y + 2} Z`
    );
    teeth.setAttribute("fill", "#909090");
    group.appendChild(teeth);
  }

  function renderNickelCoin(group, x, y) {
    const coin = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    coin.setAttribute("cx", x);
    coin.setAttribute("cy", y);
    coin.setAttribute("r", 12);
    coin.setAttribute("fill", "#C0C0C0");
    coin.setAttribute("stroke", "#FFD700");
    coin.setAttribute("stroke-width", "2");
    group.appendChild(coin);

    const inner = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    inner.setAttribute("cx", x);
    inner.setAttribute("cy", y);
    inner.setAttribute("r", 8);
    inner.setAttribute("fill", "none");
    inner.setAttribute("stroke", "#A0A0A0");
    inner.setAttribute("stroke-width", "1");
    group.appendChild(inner);
  }

  function renderCobaltSphere(group, x, y) {
    const sphere = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    sphere.setAttribute("cx", x);
    sphere.setAttribute("cy", y);
    sphere.setAttribute("r", 10);
    sphere.setAttribute("fill", "#7B7B7B");
    sphere.setAttribute("stroke", "#505050");
    sphere.setAttribute("stroke-width", "1.5");
    group.appendChild(sphere);

    const highlight = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    highlight.setAttribute("cx", x - 3);
    highlight.setAttribute("cy", y - 3);
    highlight.setAttribute("r", 3);
    highlight.setAttribute("fill", "rgba(255, 255, 255, 0.5)");
    group.appendChild(highlight);
  }

  function renderPlasticBottle(group, x, y) {
    const body = document.createElementNS("http://www.w3.org/2000/svg", "path");
    body.setAttribute(
      "d",
      `M ${x - 8} ${y - 10} L ${x - 10} ${y + 15} Q ${x - 10} ${y + 20} ${
        x - 5
      } ${y + 20} L ${x + 5} ${y + 20} Q ${x + 10} ${y + 20} ${x + 10} ${
        y + 15
      } L ${x + 8} ${y - 10} Z`
    );
    body.setAttribute("fill", "url(#plastic)");
    body.setAttribute("stroke", "#A02020");
    body.setAttribute("opacity", "0.9");
    group.appendChild(body);

    const neck = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    neck.setAttribute("x", x - 4);
    neck.setAttribute("y", y - 18);
    neck.setAttribute("width", 8);
    neck.setAttribute("height", 8);
    neck.setAttribute("fill", "#FF8787");
    group.appendChild(neck);

    const cap = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    cap.setAttribute("x", x - 5);
    cap.setAttribute("y", y - 22);
    cap.setAttribute("width", 10);
    cap.setAttribute("height", 4);
    cap.setAttribute("rx", 1);
    cap.setAttribute("fill", "#333");
    group.appendChild(cap);
  }

  function renderCopperWire(group, x, y) {
    const wire = document.createElementNS("http://www.w3.org/2000/svg", "path");
    wire.setAttribute(
      "d",
      `M ${x - 20} ${y} Q ${x - 15} ${y - 12} ${x - 8} ${y - 4} T ${x} ${y} T ${
        x + 8
      } ${y - 4} T ${x + 20} ${y}`
    );
    wire.setAttribute("fill", "none");
    wire.setAttribute("stroke", "url(#copper)");
    wire.setAttribute("stroke-width", "5");
    wire.setAttribute("stroke-linecap", "round");
    group.appendChild(wire);
  }

  function renderAluminumCan(group, x, y) {
    const can = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    can.setAttribute("x", x - 7);
    can.setAttribute("y", y - 15);
    can.setAttribute("width", 14);
    can.setAttribute("height", 30);
    can.setAttribute("rx", 3);
    can.setAttribute("fill", "url(#aluminum)");
    can.setAttribute("stroke", "#808080");
    group.appendChild(can);

    const top = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    );
    top.setAttribute("cx", x);
    top.setAttribute("cy", y - 15);
    top.setAttribute("rx", 7);
    top.setAttribute("ry", 2);
    top.setAttribute("fill", "#B0B0B0");
    group.appendChild(top);

    const tab = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    tab.setAttribute("x", x - 2);
    tab.setAttribute("y", y - 18);
    tab.setAttribute("width", 4);
    tab.setAttribute("height", 3);
    tab.setAttribute("fill", "#909090");
    group.appendChild(tab);
  }

  function renderWoodBlock(group, x, y) {
    const block = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    block.setAttribute("x", x - 12);
    block.setAttribute("y", y - 8);
    block.setAttribute("width", 24);
    block.setAttribute("height", 16);
    block.setAttribute("rx", 2);
    block.setAttribute("fill", "url(#wood)");
    block.setAttribute("stroke", "#5C3317");
    group.appendChild(block);

    const grain1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    grain1.setAttribute("x1", x - 8);
    grain1.setAttribute("y1", y - 4);
    grain1.setAttribute("x2", x - 8);
    grain1.setAttribute("y2", y + 4);
    grain1.setAttribute("stroke", "#654321");
    grain1.setAttribute("stroke-width", "1");
    grain1.setAttribute("opacity", "0.5");
    group.appendChild(grain1);

    const grain2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    grain2.setAttribute("x1", x + 4);
    grain2.setAttribute("y1", y - 5);
    grain2.setAttribute("x2", x + 4);
    grain2.setAttribute("y2", y + 5);
    grain2.setAttribute("stroke", "#654321");
    grain2.setAttribute("stroke-width", "1");
    grain2.setAttribute("opacity", "0.5");
    group.appendChild(grain2);
  }

  function renderGlassPane(group, x, y) {
    const glass = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    glass.setAttribute("x", x - 10);
    glass.setAttribute("y", y - 10);
    glass.setAttribute("width", 20);
    glass.setAttribute("height", 20);
    glass.setAttribute("rx", 2);
    glass.setAttribute("fill", "#87CEEB");
    glass.setAttribute("stroke", "#4682B4");
    glass.setAttribute("stroke-width", "2");
    glass.setAttribute("opacity", "0.6");
    group.appendChild(glass);

    const shine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    shine.setAttribute("x", x - 7);
    shine.setAttribute("y", y - 7);
    shine.setAttribute("width", 6);
    shine.setAttribute("height", 6);
    shine.setAttribute("fill", "rgba(255, 255, 255, 0.6)");
    group.appendChild(shine);
  }

  function renderRubberBand(group, x, y) {
    const rubber = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    );
    rubber.setAttribute("cx", x);
    rubber.setAttribute("cy", y);
    rubber.setAttribute("rx", 15);
    rubber.setAttribute("ry", 10);
    rubber.setAttribute("fill", "none");
    rubber.setAttribute("stroke", "#2F4F4F");
    rubber.setAttribute("stroke-width", "4");
    group.appendChild(rubber);

    const innerRubber = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse"
    );
    innerRubber.setAttribute("cx", x);
    innerRubber.setAttribute("cy", y);
    innerRubber.setAttribute("rx", 10);
    innerRubber.setAttribute("ry", 6);
    innerRubber.setAttribute("fill", "none");
    innerRubber.setAttribute("stroke", "#1C2C2C");
    innerRubber.setAttribute("stroke-width", "1");
    group.appendChild(innerRubber);
  }

  // ============================================
  // CREATE ALL MATERIALS
  // ============================================

  // Place all objects near the center, with a moderate spread
  const centerX = simWidth / 2;
  const centerY = simHeight / 2;

  // Spread radius: 90–120 pixels from center (not too close, not too far)
  const positions = [
    { mag: true, render: renderIronNail, label: "Iron Nail" },
    { mag: true, render: renderSteelScrew, label: "Steel Screw" },
    { mag: true, render: renderSteelClip, label: "Steel Clip" },
    { mag: true, render: renderIronKey, label: "Iron Key" },
    { mag: true, render: renderNickelCoin, label: "Nickel Coin" },
    { mag: true, render: renderCobaltSphere, label: "Cobalt" },
    { mag: false, render: renderPlasticBottle, label: "Plastic" },
    { mag: false, render: renderCopperWire, label: "Copper Wire" },
    { mag: false, render: renderAluminumCan, label: "Aluminum" },
    { mag: false, render: renderWoodBlock, label: "Wood" },
    { mag: false, render: renderGlassPane, label: "Glass" },
    { mag: false, render: renderRubberBand, label: "Rubber" },
  ];

  // Create all materials at random positions across the screen
  positions.forEach((pos) => {
    // Keep items at least 180px away from the magnet at start
    let x, y, dx, dy, distance;
    do {
      x = 40 + Math.random() * (simWidth - 80);
      y = 40 + Math.random() * (simHeight - 80);
      dx = x - centerX;
      dy = y - centerY;
      distance = Math.sqrt(dx * dx + dy * dy);
    } while (distance < 180);
    createMaterial(x, y, pos.mag, pos.render, pos.label);
  });

  // ============================================
  // MAGNET DRAGGING
  // ============================================

  let isDraggingMagnet = false;
  let dragOffsetX, dragOffsetY;

  magnetGroup.addEventListener("mousedown", function (e) {
    isDraggingMagnet = true;
    magnetGroup.style.cursor = "grabbing";

    const rect = svg.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left - magnetData.x;
    dragOffsetY = e.clientY - rect.top - magnetData.y;

    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDraggingMagnet) return;

    const rect = svg.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffsetX;
    let newY = e.clientY - rect.top - dragOffsetY;

    newX = Math.max(50, Math.min(newX, simWidth - 50));
    newY = Math.max(30, Math.min(newY, simHeight - 30));

    magnetData.x = newX;
    magnetData.y = newY;

    updateMagnetPosition();
    updateFieldLines();
  });

  document.addEventListener("mouseup", function () {
    if (isDraggingMagnet) {
      isDraggingMagnet = false;
      magnetGroup.style.cursor = "move";
    }
  });

  function updateMagnetPosition() {
    magnetGroup.setAttribute(
      "transform",
      `translate(${magnetData.x - simWidth / 2}, ${
        magnetData.y - simHeight / 2
      })`
    );
  }

  // ============================================
  // PHYSICS UPDATE
  // ============================================

  function updateMaterials() {
    materials.forEach((material) => {
      const data = material.materialData;

      if (data.isDragging) {
        // Clamp position inside SVG while dragging
        data.x = Math.max(30, Math.min(data.x, simWidth - 30));
        data.y = Math.max(30, Math.min(data.y, simHeight - 30));
        updateTransform(material);
        return;
      }

      const dx = data.x - magnetData.x;
      const dy = data.y - magnetData.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const glow = material.querySelector(".glow");

      if (data.isMagnetic) {
        const attractionDistance = 180;
        const attachDistance = 70;

        // Attach
        if (distance < attachDistance && !data.attachedToMagnet) {
          data.attachedToMagnet = true;
          data.attachOffsetX = data.x - magnetData.x;
          data.attachOffsetY = data.y - magnetData.y;

          if (glow) {
            glow.setAttribute("stroke-width", "4");
            glow.setAttribute("opacity", "0.8");
          }
        }

        // Stay attached
        if (data.attachedToMagnet) {
          data.x = magnetData.x + data.attachOffsetX;
          data.y = magnetData.y + data.attachOffsetY;

          updateTransform(material);

          const currentDist = Math.sqrt(
            Math.pow(data.attachOffsetX, 2) + Math.pow(data.attachOffsetY, 2)
          );

          if (currentDist > attachDistance * 2) {
            data.attachedToMagnet = false;
            if (glow) {
              glow.setAttribute("stroke-width", "0");
              glow.setAttribute("opacity", "0");
            }
          }
        }
        // Attraction
        else if (distance < attractionDistance) {
          const glowIntensity = 1 - distance / attractionDistance;
          if (glow) {
            glow.setAttribute("stroke-width", glowIntensity * 3);
            glow.setAttribute("opacity", glowIntensity * 0.6);
          }

          const force = Math.min(3500 / (distance * distance), 7);
          const angle = Math.atan2(dy, dx);

          data.x -= Math.cos(angle) * force;
          data.y -= Math.sin(angle) * force;

          updateTransform(material);
        }
        // Return
        else {
          if (glow) {
            glow.setAttribute("stroke-width", "0");
            glow.setAttribute("opacity", "0");
          }

          const returnSpeed = 0.05;
          data.x += (data.originalX - data.x) * returnSpeed;
          data.y += (data.originalY - data.y) * returnSpeed;

          updateTransform(material);
        }
      } else {
        // Non-magnetic
        if (distance < 80) {
          const pushForce = 3;
          const angle = Math.atan2(dy, dx);

          data.x += Math.cos(angle) * pushForce;
          data.y += Math.sin(angle) * pushForce;
        } else {
          const returnSpeed = 0.05;
          data.x += (data.originalX - data.x) * returnSpeed;
          data.y += (data.originalY - data.y) * returnSpeed;
        }

        updateTransform(material);
      }

      // After updating position, clamp again:
      data.x = Math.max(30, Math.min(data.x, simWidth - 30));
      data.y = Math.max(30, Math.min(data.y, simHeight - 30));
      updateTransform(material);
    });
  }

  // ============================================
  // TOUCH SUPPORT
  // ============================================

  magnetGroup.addEventListener("touchstart", function (e) {
    e.preventDefault();
    const touch = e.touches[0];
    const event = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    magnetGroup.dispatchEvent(event);
  });

  document.addEventListener("touchmove", function (e) {
    if (!isDraggingMagnet) return;
    e.preventDefault();
    const touch = e.touches[0];
    const event = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    document.dispatchEvent(event);
  });

  document.addEventListener("touchend", function () {
    if (!isDraggingMagnet) return;
    const event = new MouseEvent("mouseup");
    document.dispatchEvent(event);
  });

  // ============================================
  // ANIMATION LOOP
  // ============================================

  function animate() {
    updateMaterials();
    requestAnimationFrame(animate);
  }

  animate();
});
