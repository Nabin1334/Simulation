document.addEventListener("DOMContentLoaded", function () {
  // First, load all images through JavaScript
  const images = {
    mobile: "./images/mobile.jpg",
    laptop: "./images/laptop.jpg",
    router: "./images/router.jpg"
  };

  // Function to load and insert images
  function loadDeviceImages() {
    // Load mobile image
    const mobileImg = new Image();
    mobileImg.src = images.mobile;
    mobileImg.alt = "Mobile Phone";
    mobileImg.className = "device-icon";
    mobileImg.style.cssText = 'width: 120px; height: 90px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);';
    
    // Find mobile device container and insert image
    const mobileDevice = document.querySelector('.device:first-child');
    if (mobileDevice) {
      const existingImg = mobileDevice.querySelector('img');
      if (existingImg) {
        existingImg.remove();
      }
      // Insert before device-label
      const deviceLabel = mobileDevice.querySelector('.device-label');
      if (deviceLabel) {
        mobileDevice.insertBefore(mobileImg, deviceLabel);
      } else {
        mobileDevice.insertBefore(mobileImg, mobileDevice.querySelector('.device-role').nextSibling);
      }
    }

    // Load laptop image
    const laptopImg = new Image();
    laptopImg.src = images.laptop;
    laptopImg.alt = "Laptop";
    laptopImg.className = "device-icon";
    laptopImg.style.cssText = 'width: 120px; height: 90px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);';
    
    // Find laptop device container and insert image
    const laptopDevice = document.querySelector('.device:last-child');
    if (laptopDevice) {
      const existingImg = laptopDevice.querySelector('img');
      if (existingImg) {
        existingImg.remove();
      }
      // Insert before device-label
      const deviceLabel = laptopDevice.querySelector('.device-label');
      if (deviceLabel) {
        laptopDevice.insertBefore(laptopImg, deviceLabel);
      } else {
        laptopDevice.insertBefore(laptopImg, laptopDevice.querySelector('.device-role').nextSibling);
      }
    }

    // Load router image
    const routerImg = new Image();
    routerImg.src = images.router;
    routerImg.alt = "Router";
    routerImg.style.cssText = 'width: 150px; height: 120px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);';
    
    // Find router container and insert image
    const routerReal = document.querySelector('.router-real');
    if (routerReal) {
      // Clear existing content except router-lights and router-antenna
      const lights = routerReal.querySelector('.router-lights');
      const antennas = routerReal.querySelectorAll('.router-antenna');
      
      // Remove everything else
      Array.from(routerReal.children).forEach(child => {
        if (child !== lights && !Array.from(antennas).includes(child)) {
          child.remove();
        }
      });
      
      // Insert router image
      routerReal.insertBefore(routerImg, routerReal.firstChild);
    }
  }

  // Call the function to load images
  loadDeviceImages();

  // Now continue with your existing simulation code...
  const startBtn = document.getElementById("start-btn");
  const resetBtn = document.getElementById("reset-btn");
  const packets = [
    document.getElementById("packet-1"),
    document.getElementById("packet-2"),
  ];

  // Device positions
  const senderX = 200;
  const senderYs = [150, 350]; // Mobile, Laptop
  const routerX = 600;
  const routerY = 250;
  const serverX = 1000;
  const serverY = 250;

  let animationActive = false;
  let wifiIntervals = [];

  // New: router <-> server 
  // state and wired interval handle
  let serverConnected = true;
  let wiredInterval = null;

  // Ensure visual connection paths (#path-3, #path-4) align exactly between router and server
  function updateConnectionPaths() {
    const network = document.querySelector(".network-diagram");
    const routerEl = document.querySelector(".router-real");
    const serverEl = document.querySelector(".server-real");
    const path3 = document.getElementById("path-3");
    const path4 = document.getElementById("path-4");
    if (!network || !routerEl || !serverEl || (!path3 && !path4)) return;

    const networkRect = network.getBoundingClientRect();
    const routerRect = routerEl.getBoundingClientRect();
    const serverRect = serverEl.getBoundingClientRect();

    // compute middle Y of the devices relative to network container
    const startX = routerRect.right - networkRect.left; // start at right edge of router
    const startY = routerRect.top + routerRect.height / 2 - networkRect.top;
    const endX = serverRect.left - networkRect.left; // end at left edge of server
    const endY = serverRect.top + serverRect.height / 2 - networkRect.top;

    const width = Math.max(2, endX - startX);
    const top = Math.round((startY + endY) / 2) - 3; // center thin path vertically between centers

    [path3, path4].forEach((p) => {
      if (!p) return;
      p.style.position = "absolute";
      p.style.left = `${startX}px`;
      p.style.top = `${top}px`;
      p.style.width = `${width}px`;
      p.style.height = "6px";
      p.style.borderRadius = "10px";
      p.style.transform = "none";
      // keep z-index so pulses and packets show above/below as designed
    });
  }

  // update paths on window resize so layout stays perfect
  window.addEventListener("resize", updateConnectionPaths);
  // also update when fonts/images load
  window.addEventListener("load", updateConnectionPaths);

  // Create WiFi signal
  function createWifiSignal(fromX, fromY, toX, toY, type, delay = 0) {
    setTimeout(() => {
      const signal = document.createElement("div");
      signal.className = `wifi-symbol ${type}`;

      // Calculate angle between points
      const angle = (Math.atan2(toY - fromY, toX - fromY) * 180) / Math.PI;

      // Position at the source
      signal.style.left = `${fromX - 70}px`;
      signal.style.top = `${fromY - 70}px`;
      signal.style.transform = `rotate(${angle + 45}deg)`;

      const classes = ["first", "second", "third", "fourth"];
      for (let i = 0; i < 4; i++) {
        const circle = document.createElement("div");
        circle.className = `wifi-circle ${classes[i]}`;
        signal.appendChild(circle);
      }

      document.getElementById("wifiContainer").appendChild(signal);

      setTimeout(() => {
        signal.remove();
      }, 3000);
    }, delay);
  }

  // New: wired pulse between router and server
  function createWiredPulse(fromX, fromY, toX, toY, delay = 0) {
    if (!serverConnected) return;
    setTimeout(() => {
      const pulse = document.createElement("div");
      pulse.className = "wired-pulse";
      pulse.style.left = `${fromX}px`;
      pulse.style.top = `${fromY - 4}px`;
      pulse.style.position = "absolute";
      pulse.style.width = "12px";
      pulse.style.height = "8px";
      pulse.style.background = "#2ecc71";
      pulse.style.borderRadius = "4px";
      pulse.style.transition = "transform 0.9s linear, opacity 0.9s linear";
      document.getElementById("wifiContainer").appendChild(pulse);

      // animate transform to the destination
      const dx = toX - fromX;
      pulse.style.transform = `translateX(${dx}px)`;
      pulse.style.opacity = "0.2";

      setTimeout(() => pulse.remove(), 1000);
    }, delay);
  }

  // Show message at server
  function showMessageReceived(message, packetId) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message-received";
    messageDiv.textContent = `${message} Received!`;
    messageDiv.style.left = `${serverX + 20}px`;
    messageDiv.style.top = `${serverY + packetId * 5000}px`;

    document.querySelector(".network-diagram").appendChild(messageDiv);

    const server = document.querySelector(".server-real");
    server.classList.add("server-receiving");

    setTimeout(() => {
      messageDiv.remove();
      server.classList.remove("server-receiving");
    }, 2000);
  }

  // Show response at sender
  function showResponseReceived(deviceName, packetId) {
    const responseDiv = document.createElement("div");
    responseDiv.className = "message-received";
    responseDiv.textContent = `Response Received!`;
    responseDiv.style.left = `${senderX - 150}px`;
    responseDiv.style.top = `${senderYs[packetId] - 20}px`;
    responseDiv.style.background = "#f39c12";

    document.querySelector(".network-diagram").appendChild(responseDiv);

    setTimeout(() => {
      responseDiv.remove();
    }, 2000);
  }

  // New: show router warning when server unreachable
  function showRouterNotice(message) {
    const notice = document.createElement("div");
    notice.className = "router-notice";
    notice.textContent = message;
    notice.style.left = `${routerX - 60}px`;
    notice.style.top = `${routerY + 40}px`;
    notice.style.background = "#e74c3c";
    notice.style.color = "#fff";
    notice.style.padding = "6px 10px";
    notice.style.borderRadius = "8px";
    document.querySelector(".network-diagram").appendChild(notice);
    setTimeout(() => notice.remove(), 2500);
  }

  // Start WiFi signals
  function startWifiSignals() {
    stopWifiSignals();

    // Mobile to Router signals
    const mobileInterval = setInterval(() => {
      if (animationActive) {
        createWifiSignal(senderX, senderYs[0], routerX, routerY, "sender-wifi");
      }
    }, 1000);
    wifiIntervals.push(mobileInterval);

    // Laptop to Router signals
    const laptopInterval = setInterval(() => {
      if (animationActive) {
        createWifiSignal(
          senderX,
          senderYs[1],
          routerX,
          routerY,
          "sender-wifi",
          500
        );
      }
    }, 1000);
    wifiIntervals.push(laptopInterval);

    // Router to Mobile signals
    const routerMobileInterval = setInterval(() => {
      if (animationActive) {
        createWifiSignal(
          routerX,
          routerY,
          senderX,
          senderYs[0],
          "router-wifi",
          600
        );
      }
    }, 1000);
    wifiIntervals.push(routerMobileInterval);

    // Router to Laptop signals
    const routerLaptopInterval = setInterval(() => {
      if (animationActive) {
        createWifiSignal(
          routerX,
          routerY,
          senderX,
          senderYs[1],
          "router-wifi",
          1100
        );
      }
    }, 1000);
    wifiIntervals.push(routerLaptopInterval);

    // Start wired pulses if server connected
    startWiredSignals();
  }

  // Stop WiFi signals
  function stopWifiSignals() {
    wifiIntervals.forEach(clearInterval);
    wifiIntervals = [];
    document.getElementById("wifiContainer").innerHTML = "";
    stopWiredSignals();
  }

  // Wired signal controls
  function startWiredSignals() {
    stopWiredSignals();
    if (!serverConnected) return;
    // periodic pulses along router -> server link
    wiredInterval = setInterval(() => {
      if (animationActive && serverConnected) {
        createWiredPulse(routerX, routerY, serverX, serverY);
        // small return pulse
        setTimeout(
          () => createWiredPulse(serverX, serverY, routerX, routerY),
          300
        );
      }
    }, 900);
  }

  function stopWiredSignals() {
    if (wiredInterval) clearInterval(wiredInterval);
    wiredInterval = null;
    // remove any existing wired pulses
    const container = document.getElementById("wifiContainer");
    if (container) {
      Array.from(container.querySelectorAll(".wired-pulse")).forEach((n) =>
        n.remove()
      );
    }
  }

  // Animate packet to server
  // Resolves with true if server got the packet, false if server unreachable
  function animatePacket(packetId, color) {
    return new Promise((resolve) => {
      const packet = packets[packetId];
      const deviceNames = ["Mobile", "Laptop"];
      const deviceName = deviceNames[packetId];

      packet.style.background = color;
      packet.style.left = `${senderX}px`;
      packet.style.top = `${senderYs[packetId] - 12}px`;
      packet.style.opacity = "1";

      let progress = 0;
      const duration = 1000;
      const toRouter = setInterval(() => {
        progress += 16 / duration;
        if (progress >= 1) {
          clearInterval(toRouter);

          // Arrived at router: check router->server connection
          if (!serverConnected) {
            // show notice at router and drop packet
            showRouterNotice("Server Unreachable");
            packet.style.opacity = "0";
            setTimeout(() => resolve(false), 800);
            return;
          }

          // continue to server
          setTimeout(() => {
            progress = 0;
            const toServer = setInterval(() => {
              progress += 16 / (duration * 0.8);
              if (progress >= 1) {
                clearInterval(toServer);
                showMessageReceived(`Message from ${deviceName}`, packetId);
                packet.style.opacity = "0";
                setTimeout(() => resolve(true), 1000);
              }
              packet.style.left = `${
                routerX + (serverX - routerX) * progress - 12
              }px`;
              packet.style.top = `${routerY - 12}px`;
            }, 16);
          }, 500);
        }
        packet.style.left = `${
          senderX + (routerX - senderX) * progress - 12
        }px`;
        packet.style.top = `${
          senderYs[packetId] + (routerY - senderYs[packetId]) * progress - 12
        }px`;
      }, 16);
    });
  }

  // Animate return packet
  function animateReturnPacket(packetId, deviceName) {
    return new Promise((resolve) => {
      const packet = packets[packetId];

      packet.style.background = "#9b59b6";
      packet.textContent = "R";
      packet.style.left = `${serverX - 12}px`;
      packet.style.top = `${serverY - 12}px`;
      packet.style.opacity = "1";

      let progress = 0;
      const duration = 1000;
      const toRouter = setInterval(() => {
        progress += 16 / duration;
        if (progress >= 1) {
          clearInterval(toRouter);
          setTimeout(() => {
            progress = 0;
            const toSender = setInterval(() => {
              progress += 16 / (duration * 0.8);
              if (progress >= 1) {
                clearInterval(toSender);
                showResponseReceived(deviceName, packetId);
                packet.style.opacity = "0";
                packet.textContent = packetId === 0 ? "M" : "L";
                resolve();
              }
              packet.style.left = `${
                routerX - (routerX - senderX) * progress - 12
              }px`;
              packet.style.top = `${
                routerY + (senderYs[packetId] - routerY) * progress - 12
              }px`;
            }, 16);
          }, 500);
        }
        packet.style.left = `${
          serverX - (serverX - routerX) * progress - 12
        }px`;
        packet.style.top = `${serverY - 12}px`;
      }, 16);
    });
  }

  // Start button
  startBtn.addEventListener("click", async function () {
    if (animationActive) return;
    animationActive = true;
    startBtn.disabled = true;

    startWifiSignals();

    // Mobile
    const mobileSuccess = await animatePacket(0, "#3498db");
    if (mobileSuccess) {
      await animateReturnPacket(0, "Mobile");
    } else {
      // Wait a bit before next device so UI isn't jumpy
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Laptop
    const laptopSuccess = await animatePacket(1, "#e67e22");
    if (laptopSuccess) {
      await animateReturnPacket(1, "Laptop");
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    animationActive = false;
    startBtn.disabled = false;
    stopWifiSignals();
  });

  // Reset button
  resetBtn.addEventListener("click", function () {
    animationActive = false;
    stopWifiSignals();
    packets.forEach((packet, index) => {
      packet.style.opacity = "0";
      packet.textContent = index === 0 ? "M" : "L";
      packet.style.background = "#e67e22";
    });
  });

  // New: UI control to toggle router-server connection (created dynamically if not present)
  (function createConnectionToggle() {
    const container = document.querySelector(".container") || document.body;
    const panel = document.createElement("div");
    panel.style.display = "flex";
    panel.style.gap = "8px";
    panel.style.alignItems = "center";
    panel.style.marginBottom = "12px";

    const status = document.createElement("div");
    status.id = "conn-status";
    status.textContent = serverConnected ? "Server: Online" : "Server: Offline";
    status.style.padding = "6px 10px";
    status.style.borderRadius = "8px";
    status.style.background = serverConnected ? "#2ecc71" : "#e74c3c";
    status.style.color = "#fff";
    status.style.fontWeight = "600";

    const toggle = document.createElement("button");
    toggle.id = "toggle-conn-btn";
    toggle.textContent = serverConnected
      ? "Disconnect Server"
      : "Connect Server";
    toggle.style.padding = "6px 10px";

    toggle.addEventListener("click", () => {
      serverConnected = !serverConnected;
      status.textContent = serverConnected
        ? "Server: Online"
        : "Server: Offline";
      status.style.background = serverConnected ? "#2ecc71" : "#e74c3c";
      toggle.textContent = serverConnected
        ? "Disconnect Server"
        : "Connect Server";

      // ensure path visuals reflect new state immediately
      updateConnectionPaths();

      // when toggling, start/stop wired pulses
      if (serverConnected) startWiredSignals();
      else stopWiredSignals();

      // update UI details (lights / animations)
      updateConnectionUI();
    });

    panel.appendChild(status);
    panel.appendChild(toggle);

    // insert before network diagram if possible
    const networkBox = document.querySelector(".network-diagram");
    if (networkBox && networkBox.parentNode)
      networkBox.parentNode.insertBefore(panel, networkBox);
    else container.insertBefore(panel, container.firstChild);

    // Helper: update path + lights UI
    function updateConnectionUI() {
      // connection paths
      const path3 = document.getElementById("path-3");
      const path4 = document.getElementById("path-4");
      if (path3) {
        path3.style.background = serverConnected ? "#2ecc71" : "#e74c3c";
        path3.style.opacity = serverConnected ? "1" : "0.5";
      }
      if (path4) {
        path4.style.background = serverConnected ? "#2ecc71" : "#e74c3c";
        path4.style.opacity = serverConnected ? "1" : "0.5";
      }

      // server light
      const serverLight = document.querySelector(".server-light");
      if (serverLight) {
        if (serverConnected) {
          serverLight.style.background = "#2ecc71";
          serverLight.style.boxShadow = "0 0 5px #2ecc71";
        } else {
          serverLight.style.background = "#7f8c8d";
          serverLight.style.boxShadow = "none";
        }
      }

      // realign the path elements after visual changes
      updateConnectionPaths();
    }

    // initialize visuals
    updateConnectionUI();
    // ensure paths are correct on first paint
    setTimeout(updateConnectionPaths, 50);
  })();

  // Call updateConnectionPaths after images are loaded
  setTimeout(updateConnectionPaths, 100);
});