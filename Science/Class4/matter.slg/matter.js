document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const iceBeaker = document.getElementById("ice-beaker");
  const heatedBeaker = document.getElementById("heated-beaker");
  const water = document.getElementById("water");
  const bubbles = document.getElementById("bubbles");
  const steam = document.getElementById("steam");
  const temperatureDisplay = document.getElementById("temperature");
  const currentStateDisplay = document.getElementById("current-state");
  const resetBtn = document.getElementById("reset-btn");
  const thermometerFill = document.getElementById("thermometer-fill");
  const thermometerScale = document.getElementById("thermometer-scale");
  const iceCountDisplay = document.getElementById("ice-count");
  const waterLevelDisplay = document.getElementById("water-level");
  const vaporAmountDisplay = document.getElementById("vapor-amount");
  const flames = document.querySelectorAll(".flame");
  const heatCirculation = document.getElementById("heat-circulation");
  const addIceBtn = document.getElementById("add-ice");
  const removeIceBtn = document.getElementById("remove-ice");

  let gasContainer = document.getElementById("gas-container");
  if (!gasContainer) {
    gasContainer = document.createElement("div");
    gasContainer.id = "gas-container";
    gasContainer.style.position = "absolute";
    gasContainer.style.left = "50%";
    gasContainer.style.transform = "translateX(-50%)";
    gasContainer.style.width = "160px";
    gasContainer.style.height = "80px";
    gasContainer.style.top = "0"; // position at top of heated beaker
    gasContainer.style.background =
      "radial-gradient(ellipse at center, rgba(200,230,255,0.3) 0%, rgba(255,255,255,0.1) 80%)";
    gasContainer.style.borderRadius =
      "80px 80px 60px 60px / 60px 60px 80px 80px";
    gasContainer.style.pointerEvents = "none";
    gasContainer.style.display = "none";
    gasContainer.style.zIndex = "10";
    heatedBeaker.appendChild(gasContainer);
  }

  // Simulation variables
  let temperature = 0;
  let iceCount = 5;
  let waterLevel = 0;
  let vaporAmount = 0;
  let maxWaterLevel = 0;
  let isHeating = false;
  let heatingInterval;
  let state = "solid"; // solid, liquid, gas
  let iceInHeatedBeaker = [];
  let meltingInterval;
  let vaporizingInterval;
  let waterIncreaseInterval;
  let iceCubeId = 0;
  let bubbleInterval;
  let steamInterval;

  // Enhanced 3D beaker effect
  function create3DBeakers() {
    const beakers = document.querySelectorAll(".beaker");
    beakers.forEach((beaker) => {
      // Enhanced 3D glass effect with more realistic lighting
      beaker.style.background = `
        linear-gradient(90deg, 
          rgba(255,255,255,0.05) 0%, 
          rgba(255,255,255,0.15) 20%,
          rgba(255,255,255,0.3) 50%, 
          rgba(255,255,255,0.15) 80%,
          rgba(255,255,255,0.05) 100%)
      `;
      beaker.style.border = "3px solid rgba(255,255,255,0.6)";
      beaker.style.borderTop = "3px solid rgba(255,255,255,0.8)";
      beaker.style.borderRadius = "8px 8px 35px 35px";
      beaker.style.boxShadow = `
        inset 0 0 25px rgba(255,255,255,0.4),
        inset 8px 0 25px rgba(255,255,255,0.2),
        inset -8px 0 25px rgba(255,255,255,0.2),
        inset 0 -10px 20px rgba(200,230,255,0.3),
        0 8px 20px rgba(0,0,0,0.4),
        0 0 0 1px rgba(255,255,255,0.1)
      `;
      beaker.style.transform = "perspective(600px) rotateX(8deg) rotateY(2deg)";
      beaker.style.transformStyle = "preserve-3d";
      
      // Add glass thickness effect
      beaker.style.position = "relative";
      beaker.style.overflow = "hidden";
      
      // Create glass reflection
      const reflection = document.createElement("div");
      reflection.style.position = "absolute";
      reflection.style.top = "10%";
      reflection.style.left = "10%";
      reflection.style.width = "30%";
      reflection.style.height = "40%";
      reflection.style.background = "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)";
      reflection.style.borderRadius = "5px";
      reflection.style.pointerEvents = "none";
      reflection.style.zIndex = "2";
      beaker.appendChild(reflection);
    });

    // Enhanced water for 3D effect
    water.style.background = `
      linear-gradient(90deg, 
        rgba(64,164,255,0.7) 0%, 
        rgba(100,180,255,0.85) 30%,
        rgba(120,190,255,0.9) 50%, 
        rgba(100,180,255,0.85) 70%,
        rgba(64,164,255,0.7) 100%)
    `;
    water.style.borderRadius = "0 0 32px 32px";
    water.style.boxShadow = `
      inset 0 0 20px rgba(255,255,255,0.5),
      inset 5px 0 15px rgba(255,255,255,0.3),
      inset -5px 0 15px rgba(255,255,255,0.3),
      inset 0 10px 15px rgba(255,255,255,0.4)
    `;
    water.style.borderTop = "1px solid rgba(255,255,255,0.3)";
  }

  // Create initial ice cubes at the bottom of the beaker
  function createIceCubes() {
    iceBeaker.innerHTML = "";
    for (let i = 0; i < iceCount; i++) {
      createIceCube();
    }
    updateIceCount();
  }

  // Create a single ice cube
  function createIceCube() {
    const iceCube = document.createElement("div");
    iceCube.className = "ice-cube";
    iceCube.id = "ice-" + iceCubeId++;

    // Enhanced 3D effect to ice cubes
    iceCube.style.background = `
      linear-gradient(135deg, 
        rgba(255,255,255,0.95) 0%, 
        rgba(220,240,255,0.9) 30%,
        rgba(200,230,255,0.85) 70%,
        rgba(180,220,255,0.8) 100%)
    `;
    iceCube.style.border = "1px solid rgba(255,255,255,0.7)";
    iceCube.style.boxShadow = `
      0 3px 12px rgba(255,255,255,0.4),
      inset 0 -3px 8px rgba(200,230,255,0.6),
      inset 3px 0 8px rgba(255,255,255,0.5),
      inset -3px 0 8px rgba(200,230,255,0.4)
    `;
    iceCube.style.transform = "rotateX(15deg) rotateY(8deg) rotateZ(5deg)";
    iceCube.style.borderRadius = "3px";

    // Position ice cubes at the bottom with random horizontal positions
    iceCube.style.left = 10 + Math.random() * 100 + "px";
    iceCube.style.bottom = "10px";

    // Make ice cube draggable
    iceCube.setAttribute("draggable", "true");

    iceCube.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", e.target.id);
      iceCube.classList.add("dragging");
    });

    iceCube.addEventListener("dragend", function () {
      iceCube.classList.remove("dragging");
    });

    iceBeaker.appendChild(iceCube);
  }

  // Create measurement marks for beakers
  function createBeakerMarks() {
    // Clear existing marks
    const existingMarks = document.querySelectorAll(
      ".beaker-mark, .beaker-mark-label"
    );
    existingMarks.forEach((mark) => mark.remove());

    // Add marks to both beakers
    const beakers = document.querySelectorAll(".beaker");
    beakers.forEach((beaker) => {
      for (let i = 0; i <= 100; i += 20) {
        const mark = document.createElement("div");
        mark.className = "beaker-mark";
        mark.style.bottom = i * 2 + "px";
        mark.style.background = "rgba(255,255,255,0.6)";
        mark.style.boxShadow = "0 0 5px rgba(255,255,255,0.5)";

        const label = document.createElement("div");
        label.className = "beaker-mark-label";
        label.style.bottom = i * 2 - 5 + "px";
        label.textContent = 100 - i + "ml";
        label.style.color = "rgba(255,255,255,0.9)";
        label.style.textShadow = "0 0 3px rgba(0,0,0,0.5)";

        beaker.appendChild(mark);
        beaker.appendChild(label);
      }
    });
  }

  // Create thermometer scale
  function createThermometerScale() {
    thermometerScale.innerHTML = "";
    for (let i = 0; i <= 100; i += 10) {
      const mark = document.createElement("div");
      mark.className = "thermometer-mark";
      mark.style.bottom = i * 2 + "px";

      const label = document.createElement("div");
      label.style.position = "absolute";
      label.style.left = "-35px";
      label.style.bottom = i * 2 - 10 + "px";
      label.textContent = i + "°C";
      label.style.fontSize = "12px";
      label.style.color = "#333";

      thermometerScale.appendChild(mark);
      thermometerScale.appendChild(label);
    }
  }

  // Update ice count display
  function updateIceCount() {
    iceCountDisplay.textContent = iceCount;
  }

  // Update water level display
  function updateWaterLevelDisplay() {
    waterLevelDisplay.textContent = Math.round(waterLevel) + "%";
  }

  // Update vapor amount display
  function updateVaporAmountDisplay() {
    if (maxWaterLevel > 0) {
      vaporAmount = ((maxWaterLevel - waterLevel) / maxWaterLevel) * 100;
      vaporAmountDisplay.textContent = Math.round(vaporAmount) + "%";
    } else {
      vaporAmountDisplay.textContent = "0%";
    }
  }

  // Allow drop in heated beaker
  heatedBeaker.addEventListener("dragover", function (e) {
    e.preventDefault();
  });

  heatedBeaker.addEventListener("drop", function (e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(id);

    if (draggedElement && draggedElement.parentNode === iceBeaker) {
      // Remove from ice beaker
      draggedElement.remove();
      iceCount--;
      updateIceCount();

      // Create a new ice cube in heated beaker at the bottom
      const newIceCube = document.createElement("div");
      newIceCube.className = "ice-cube";

      // Enhanced 3D effect to ice cube in heated beaker
      newIceCube.style.background = `
        linear-gradient(135deg, 
          rgba(255,255,255,0.95) 0%, 
          rgba(220,240,255,0.9) 30%,
          rgba(200,230,255,0.85) 70%,
          rgba(180,220,255,0.8) 100%)
      `;
      newIceCube.style.border = "1px solid rgba(255,255,255,0.7)";
      newIceCube.style.boxShadow = `
        0 3px 12px rgba(255,255,255,0.4),
        inset 0 -3px 8px rgba(200,230,255,0.6),
        inset 3px 0 8px rgba(255,255,255,0.5),
        inset -3px 0 8px rgba(200,230,255,0.4)
      `;
      newIceCube.style.transform = "rotateX(15deg) rotateY(8deg) rotateZ(5deg)";
      newIceCube.style.borderRadius = "3px";

      newIceCube.style.left = 10 + Math.random() * 100 + "px";
      newIceCube.style.bottom = "10px";
      newIceCube.id = "heated-ice-" + Date.now(); // Unique ID
      heatedBeaker.appendChild(newIceCube);

      // Add to the list of ice cubes in heated beaker
      iceInHeatedBeaker.push({
        element: newIceCube,
        isMelting: false,
      });

      // Start heating process if not already heating
      if (!isHeating) {
        isHeating = true;
        startHeatingProcess();
      }

      // After 2-3 seconds, start melting process
      setTimeout(() => {
        startMeltingProcess(newIceCube);
      }, 2000 + Math.random() * 1000); // 2-3 second delay
    }
  });

  // Start melting process for an ice cube
  function startMeltingProcess(iceCube) {
    // Find the ice cube in our array
    const iceData = iceInHeatedBeaker.find((ice) => ice.element === iceCube);
    if (!iceData || iceData.isMelting) return;

    iceData.isMelting = true;

    // Start melting animation
    iceCube.classList.add("melting");

    // Simultaneously increase water level during melting
    const targetWaterIncrease = 25; // Each ice cube adds 25% water
    const startWaterLevel = waterLevel;
    const duration = 3000; // 3 seconds
    const steps = 30;
    const increment = targetWaterIncrease / steps;
    let step = 0;

    waterIncreaseInterval = setInterval(() => {
      if (step < steps) {
        waterLevel = startWaterLevel + increment * step;
        updateWaterLevel();
        step++;
      } else {
        clearInterval(waterIncreaseInterval);
      }
    }, duration / steps);

    // After melting is complete, remove the ice
    setTimeout(() => {
      iceCube.remove();
      // Remove from array
      iceInHeatedBeaker = iceInHeatedBeaker.filter(
        (ice) => ice.element !== iceCube
      );

      // Update max water level if needed
      if (waterLevel > maxWaterLevel) {
        maxWaterLevel = waterLevel;
      }

      // If no more ice and water is gone, stop heating and gas production
      if (iceInHeatedBeaker.length === 0 && waterLevel <= 0) {
        turnOffHeat();
        stopGasProduction();
        stopBubbleAnimation();
      }
    }, duration);
  }

  // Start heating process
  function startHeatingProcess() {
    clearInterval(heatingInterval);

    // Reset temperature to 0°C if we have ice
    if (iceInHeatedBeaker.length > 0) {
      temperature = 0;
      temperatureDisplay.textContent = temperature;
      updateThermometer();
    }

    heatingInterval = setInterval(function () {
      // Gradually increase temperature up to 100°C
      if (temperature < 100) {
        // Faster temperature rise
        temperature += 2;
        temperatureDisplay.textContent = temperature;

        // Update thermometer
        updateThermometer();

        // Change state based on temperature
        if (temperature >= 0 && state === "solid" && waterLevel > 0) {
          state = "liquid";
          currentStateDisplay.textContent = "Liquid (Water)";
          showGasContainer(false);
        }

        if (temperature >= 100 && state === "liquid" && waterLevel > 0) {
          state = "gas";
          currentStateDisplay.textContent = "Gas (Water Vapor)";
          showGasContainer(true);

          // Start vaporization immediately when reaching 100°C
          if (waterLevel > 0) {
            steam.style.display = "block";
            createSteam();
            decreaseWaterLevel();
            startBubbleAnimation();
          }
        }

        // Create bubbles when approaching boiling point
        if (temperature >= 90 && state === "liquid" && waterLevel > 0) {
          createBubbles();
        }
      } else {
        // Temperature has reached 100°C
        clearInterval(heatingInterval);
      }
    }, 500); // Faster temperature increase (500ms instead of 800ms)
  }

  // Update thermometer visualization
  function updateThermometer() {
    // Calculate height based on temperature (0-100°C)
    const height = Math.min((temperature / 100) * 100, 100);
    thermometerFill.style.height = height + "%";

    // Change color based on temperature
    if (temperature < 50) {
      thermometerFill.style.background =
        "linear-gradient(to top, #4fa3f7, #6bb5ff)";
    } else if (temperature < 80) {
      thermometerFill.style.background =
        "linear-gradient(to top, #ffa54f, #ffb56b)";
    } else {
      thermometerFill.style.background =
        "linear-gradient(to top, #ff4f4f, #ff6b6b)";
    }
  }

  // Update water level display
  function updateWaterLevel() {
    water.style.height = waterLevel + "%";
    updateWaterLevelDisplay();
    updateVaporAmountDisplay();

    // Auto turn off heat and stop gas when water is finished
    if (waterLevel <= 0) {
      stopGasProduction();
      stopBubbleAnimation();
      showGasContainer(false); // Hide gas container

      if (iceInHeatedBeaker.length === 0) {
        turnOffHeat();
      }
    }
  }

  // Turn off heat
  function turnOffHeat() {
    isHeating = false;
    clearInterval(heatingInterval);
    clearInterval(vaporizingInterval);
    clearInterval(steamInterval);

    // Hide flames and heat circulation
    flames.forEach((flame) => {
      flame.style.animation = "none";
      flame.style.opacity = "0.3";
    });
    heatCirculation.style.animation = "none";
    heatCirculation.style.opacity = "0.3";
  }

  // Stop gas production
  function stopGasProduction() {
    steam.style.display = "none";
    clearInterval(vaporizingInterval);
    clearInterval(steamInterval);
    steam.innerHTML = "";
    showGasContainer(false); // Hide gas container

    // If water is gone, change state back to solid if there's ice, otherwise to empty
    if (waterLevel <= 0) {
      if (iceInHeatedBeaker.length > 0) {
        state = "solid";
        currentStateDisplay.textContent = "Solid (Ice)";
      } else {
        state = "empty";
        currentStateDisplay.textContent = "Empty";
      }
    }
  }

  // Decrease water level when boiling
  function decreaseWaterLevel() {
    clearInterval(vaporizingInterval);

    vaporizingInterval = setInterval(function () {
      if (waterLevel > 0 && state === "gas") {
        waterLevel -= 2;
        updateWaterLevel();

        // Stop when water is gone
        if (waterLevel <= 0) {
          clearInterval(vaporizingInterval);
          stopGasProduction();
          stopBubbleAnimation();
        }
      }
    }, 1000);
  }

  // Create bubbles animation (for pre-boiling)
  function createBubbles() {
    if (state !== "liquid") return;
    // Clear existing bubbles
    bubbles.innerHTML = "";

    // Create multiple bubbles
    for (let i = 0; i < 5; i++) {
      setTimeout(function () {
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.style.width = 5 + Math.random() * 10 + "px";
        bubble.style.height = bubble.style.width;
        bubble.style.left = 20 + Math.random() * 60 + "%";
        bubble.style.animationDelay = Math.random() * 2 + "s";

        // Enhanced 3D effect to bubbles
        bubble.style.background =
          "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 70%)";
        bubble.style.boxShadow = 
          "inset 0 0 12px rgba(255,255,255,0.7), 0 0 8px rgba(255,255,255,0.4)";
        bubble.style.border = "1px solid rgba(255,255,255,0.5)";

        bubbles.appendChild(bubble);
      }, i * 300);
    }
  }

  // Start continuous bubble animation for vaporization
  function startBubbleAnimation() {
    clearInterval(bubbleInterval);

    bubbleInterval = setInterval(function () {
      if (waterLevel > 0 && state === "gas") {
        createVaporizationBubbles();
      } else {
        clearInterval(bubbleInterval);
      }
    }, 800); // Create bubbles every 800ms
  }

  // Stop bubble animation
  function stopBubbleAnimation() {
    clearInterval(bubbleInterval);
    bubbles.innerHTML = ""; // Clear all existing bubbles
  }

  // Create bubbles specifically for vaporization
  function createVaporizationBubbles() {
    // Create 3-5 bubbles at once
    const bubbleCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.style.width = 8 + Math.random() * 12 + "px"; // Larger bubbles for vaporization
      bubble.style.height = bubble.style.width;
      bubble.style.left = 10 + Math.random() * 80 + "%";
      bubble.style.animationDelay = Math.random() * 1 + "s";
      bubble.style.animationDuration = 2 + Math.random() * 2 + "s"; // Variable speed

      // Enhanced 3D effect to vaporization bubbles
      bubble.style.background =
        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 70%)";
      bubble.style.boxShadow = 
        "inset 0 0 15px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.5)";
      bubble.style.border = "1px solid rgba(255,255,255,0.6)";

      bubbles.appendChild(bubble);

      // Remove bubble after animation completes
      setTimeout(() => {
        if (bubble.parentNode === bubbles) {
          bubble.remove();
        }
      }, 4000);
    }
  }

  // Create steam animation that goes outside the container
  function createSteam() {
    // Clear existing steam
    steam.innerHTML = "";

    // Position steam container to allow particles to go outside
    steam.style.position = "absolute";
    steam.style.left = "0";
    steam.style.top = "-100px"; // Allow steam to go above the container
    steam.style.width = "100%";
    steam.style.height = "300px"; // Extended height for outside movement
    steam.style.overflow = "visible";
    steam.style.zIndex = "5";

    // Create steam particles that rise from the upper side of heated beaker and go outside
    steamInterval = setInterval(() => {
      if (waterLevel > 0 && state === "gas") {
        createSteamParticle();
      } else {
        clearInterval(steamInterval);
      }
    }, 200); // Create steam particle every 200ms for more density
  }

  // Create individual steam particle that goes outside the container
  function createSteamParticle() {
    const steamParticle = document.createElement("div");
    steamParticle.className = "steam-particle";

    // Position specifically at the upper side of the heated beaker
    const leftPosition = 30 + Math.random() * 40; // 30-70% of beaker width
    steamParticle.style.left = leftPosition + "%";
    steamParticle.style.bottom = "0"; // Start from top of heated beaker

    // Random size and opacity for realism
    const size = 20 + Math.random() * 35;
    steamParticle.style.width = size + "px";
    steamParticle.style.height = size + "px";
    steamParticle.style.opacity = 0.2 + Math.random() * 0.5;

    // Realistic steam appearance
    steamParticle.style.background =
      "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)";
    steamParticle.style.borderRadius = "50%";
    steamParticle.style.filter = "blur(3px)";
    steamParticle.style.zIndex = "15";

    // Random animation - rising from upper side of heated beaker and going outside
    const animationDuration = 4 + Math.random() * 3;
    const horizontalMovement = -20 + Math.random() * 40;
    const riseHeight = 250 + Math.random() * 150; // Much higher to go outside

    steamParticle.style.animation = `
            steam-rise-outside ${animationDuration}s ease-out forwards,
            steam-dissipate-outside ${animationDuration}s ease-in forwards,
            steam-sway-outside ${animationDuration}s ease-in-out infinite`;

    steamParticle.style.setProperty('--rise-height', riseHeight + 'px');
    steamParticle.style.setProperty('--horizontal-move', horizontalMovement + 'px');

    steam.appendChild(steamParticle);

    // Remove particle after animation
    setTimeout(() => {
      if (steamParticle.parentNode === steam) {
        steamParticle.remove();
      }
    }, animationDuration * 1000);
  }

  // Add ice cubes
  addIceBtn.addEventListener("click", function () {
    if (iceCount < 15) {
      // Limit to 15 ice cubes
      iceCount += 5;
      createIceCubes();
    }
  });

  // Remove ice cubes
  removeIceBtn.addEventListener("click", function () {
    if (iceCount > 0) {
      iceCount = Math.max(0, iceCount - 5);
      createIceCubes();
    }
  });

  // Reset simulation
  resetBtn.addEventListener("click", function () {
    clearInterval(heatingInterval);
    clearInterval(meltingInterval);
    clearInterval(vaporizingInterval);
    clearInterval(waterIncreaseInterval);
    clearInterval(bubbleInterval);
    clearInterval(steamInterval);

    temperature = 0;
    iceCount = 5;
    waterLevel = 0;
    vaporAmount = 0;
    maxWaterLevel = 0;
    isHeating = false;
    state = "solid";
    iceInHeatedBeaker = [];

    temperatureDisplay.textContent = temperature;
    currentStateDisplay.textContent = "Solid (Ice)";
    water.style.height = "0%";
    steam.style.display = "none";
    bubbles.innerHTML = "";
    steam.innerHTML = "";

    // Reset steam container position
    steam.style.position = "";
    steam.style.top = "";
    steam.style.height = "";

    // Show flames and heat circulation
    flames.forEach((flame) => {
      flame.style.animation = "flicker 0.5s infinite alternate";
      flame.style.opacity = "1";
    });
    heatCirculation.style.animation = "heat-pulse 2s infinite";
    heatCirculation.style.opacity = "1";

    // Remove any ice cubes in heated beaker
    const iceCubes = heatedBeaker.querySelectorAll(".ice-cube");
    iceCubes.forEach((cube) => cube.remove());

    updateThermometer();
    updateIceCount();
    updateWaterLevelDisplay();
    updateVaporAmountDisplay();
    createIceCubes();
  });

  // Utility function to show/hide gas container
  function showGasContainer(show) {
    gasContainer.style.display = show ? "block" : "none";
  }

  // Initialize simulation
  createThermometerScale();
  createBeakerMarks();
  create3DBeakers(); // Initialize 3D beakers
  updateThermometer();
  createIceCubes();
  updateWaterLevelDisplay();
  updateVaporAmountDisplay();
});