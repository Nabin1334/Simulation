
      // STB Data
      const channels = [
        {
          number: 101,
          name: "MovieMax HD",
          logo: "fas fa-film",
          type: "Entertainment",
          program: "Sci-Fi Adventure",
        },
        {
          number: 102,
          name: "SportsNet",
          logo: "fas fa-football-ball",
          type: "Sports",
          program: "Live: Football Match",
        },
        {
          number: 103,
          name: "News24",
          logo: "fas fa-newspaper",
          type: "News",
          program: "Breaking News Update",
        },
        {
          number: 104,
          name: "Kids World",
          logo: "fas fa-child",
          type: "Kids",
          program: "Animated Series",
        },
        {
          number: 105,
          name: "Discovery+",
          logo: "fas fa-globe-americas",
          type: "Documentary",
          program: "Nature Documentary",
        },
        {
          number: 106,
          name: "Music Hits",
          logo: "fas fa-music",
          type: "Music",
          program: "Top 40 Countdown",
        },
        {
          number: 107,
          name: "Cooking Channel",
          logo: "fas fa-utensils",
          type: "Lifestyle",
          program: "Gourmet Cooking",
        },
        {
          number: 108,
          name: "Tech TV",
          logo: "fas fa-laptop-code",
          type: "Technology",
          program: "Gadget Reviews",
        },
        {
          number: 109,
          name: "History HD",
          logo: "fas fa-landmark",
          type: "Education",
          program: "Ancient Civilizations",
        },
        {
          number: 110,
          name: "Comedy Central",
          logo: "fas fa-laugh",
          type: "Entertainment",
          program: "Stand-up Comedy",
        },
      ];

      // STB State
      let currentChannel = 0; // Start with first channel
      let isPoweredOn = true;
      let isRecording = false;
      let currentSignal = "cable";
      let recordingInterval = null;

      // Real STB Images Data
      const realSTBImages = [
        {
          title: "STB",
          description: "set-top box ",
          imageUrl: "S.webp",
          source: "Unsplash",
          features: [
            "HDMI Output",
            "USB Recording",
            "Wi-Fi Connectivity",
            "4K Support",
          ],
        },
      ];

      // Common STB Features
      const stbFeatures = [
        "Signal Reception from various sources (Cable, Satellite, Internet)",
        "Digital Signal Decoding and Processing",
        "HDMI and other output connections",
        "Remote Control operation",
        "Electronic Program Guide (EPG)",
        "Recording capabilities (DVR)",
        "Internet connectivity for streaming services",
        "Parental controls and channel locking",
        "Multiple language support",
        "Video-on-Demand services",
        "App integration for additional services",
        "Software updates over the air",
      ];

      // DOM Elements
      const channelDisplay = document.querySelector(".channel-display");
      const channelList = document.getElementById("channel-list");
      const powerBtn = document.getElementById("power-btn");
      const recordBtn = document.getElementById("record-btn");
      const chUpBtn = document.getElementById("ch-up");
      const chDownBtn = document.getElementById("ch-down");
      const signalBtns = document.querySelectorAll(".signal-btn");
      const powerStatus = document.getElementById("power-status");
      const powerText = document.getElementById("power-text");
      const recordingStatus = document.getElementById("recording-status");
      const recordingText = document.getElementById("recording-text");
      const signalType = document.getElementById("signal-type");
      const currentProgram = document.getElementById("current-program");
      const signalBars = document.querySelectorAll(".signal-bar");

      // Function to create and display real STB images
      function displayRealSTBImages() {
        const imagesGrid = document.getElementById("stbImagesGrid");
        const featuresList = document.getElementById("stbFeaturesList");

        // Clear existing content
        imagesGrid.innerHTML = "";
        featuresList.innerHTML = "";

        // Create image cards
        realSTBImages.forEach((stb, index) => {
          const card = document.createElement("div");
          card.className = "stb-image-card";

          // Create image with fallback in case of loading error
          const img = document.createElement("img");
          img.className = "stb-real-image loading";
          img.src = stb.imageUrl;
          img.alt = stb.title;
          img.loading = "lazy";

          // Add loading and error handling
          img.onload = function () {
            this.classList.remove("loading");
            this.classList.add("loaded");
          };

          img.onerror = function () {
            this.classList.remove("loading");
            this.classList.add("error");
            this.alt = "Image not available";
            this.style.objectFit = "contain";
            this.style.display = "flex";
            this.style.alignItems = "center";
            this.style.justifyContent = "center";
            this.style.backgroundColor = "#333";
            this.style.color = "#666";
            this.style.fontSize = "0.9rem";
            this.style.borderRadius = "8px 8px 0 0";
            this.innerHTML = "📺 Image not available";
          };

          const imageWrapper = document.createElement("div");
          imageWrapper.className = "stb-image-wrapper";
          imageWrapper.appendChild(img);

          const infoDiv = document.createElement("div");
          infoDiv.className = "stb-image-info";
          infoDiv.innerHTML = `
                    <div class="stb-image-title">${stb.title}</div>
                    <div class="stb-image-desc">${stb.description}</div>
                    <div class="image-source">Source: ${stb.source}</div>
                `;

          card.appendChild(imageWrapper);
          card.appendChild(infoDiv);
          imagesGrid.appendChild(card);

          // Add click event to show features
          card.addEventListener("click", () => {
            showSTBFeatures(stb);
          });
        });

        // Create features list
        stbFeatures.forEach((feature) => {
          const li = document.createElement("li");
          li.textContent = feature;
          featuresList.appendChild(li);
        });
      }

      // Function to show STB features in a modal-like alert
      function showSTBFeatures(stb) {
        const featuresHtml = `
                <div style="text-align: left; padding: 10px;">
                    <h3 style="color: #00b4db; margin-bottom: 10px;">${
                      stb.title
                    }</h3>
                    <p style="margin-bottom: 15px;">${stb.description}</p>
                    <h4 style="color: #00b4db; margin-bottom: 8px;">Key Features:</h4>
                    <ul style="padding-left: 20px; margin-bottom: 15px;">
                        ${stb.features
                          .map(
                            (feature) =>
                              `<li style="margin-bottom: 5px;">${feature}</li>`
                          )
                          .join("")}
                    </ul>
                    <p style="font-size: 0.9em; color: #666; font-style: italic;">Source: ${
                      stb.source
                    }</p>
                </div>
            `;

        // Create modal overlay
        const modalOverlay = document.createElement("div");
        modalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                padding: 20px;
            `;

        const modalContent = document.createElement("div");
        modalContent.style.cssText = `
                background: #111;
                padding: 25px;
                border-radius: 15px;
                max-width: 500px;
                width: 100%;
                border: 2px solid #00b4db;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                position: relative;
            `;

        modalContent.innerHTML = featuresHtml;

        // Add close button
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "✕";
        closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: #d32f2f;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

        closeBtn.onclick = function () {
          document.body.removeChild(modalOverlay);
        };

        modalContent.appendChild(closeBtn);
        modalOverlay.appendChild(modalContent);

        // Close on overlay click
        modalOverlay.onclick = function (e) {
          if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
          }
        };

        document.body.appendChild(modalOverlay);
      }

      // Initialize the STB
      function initSTB() {
        renderChannelList();
        updateChannelDisplay();

        // Set initial signal bars
        updateSignalBars();

        // Set up event listeners
        powerBtn.addEventListener("click", togglePower);
        recordBtn.addEventListener("click", toggleRecording);
        chUpBtn.addEventListener("click", () => changeChannel(1));
        chDownBtn.addEventListener("click", () => changeChannel(-1));

        // Signal type buttons
        signalBtns.forEach((btn) => {
          btn.addEventListener("click", function () {
            signalBtns.forEach((b) => b.classList.remove("active"));
            this.classList.add("active");
            currentSignal = this.getAttribute("data-signal");
            signalType.textContent = this.textContent;
            updateSignalBars();
          });
        });

        // Menu buttons (simulated functionality)
        document.getElementById("menu-btn").addEventListener("click", showMenu);
        document
          .getElementById("guide-btn")
          .addEventListener("click", showGuide);
        document.getElementById("back-btn").addEventListener("click", goBack);
        document.getElementById("ok-btn").addEventListener("click", selectOk);

        // Display real STB images
        displayRealSTBImages();

        // Preload images for better performance
        preloadImages();
      }

      // Preload images for better user experience
      function preloadImages() {
        realSTBImages.forEach((stb) => {
          const img = new Image();
          img.src = stb.imageUrl;
        });
      }

      // Render the channel list
      function renderChannelList() {
        channelList.innerHTML = "";
        channels.forEach((channel, index) => {
          const channelElement = document.createElement("div");
          channelElement.className = `channel-item ${
            index === currentChannel ? "active" : ""
          }`;
          channelElement.innerHTML = `
                    <div class="channel-number">${channel.number}</div>
                    <div class="channel-logo-small"><i class="${channel.logo}"></i></div>
                    <div class="channel-title">${channel.name}</div>
                `;
          channelElement.addEventListener("click", () => selectChannel(index));
          channelList.appendChild(channelElement);
        });
      }

      // Update the main channel display
      function updateChannelDisplay() {
        const channel = channels[currentChannel];
        channelDisplay.innerHTML = `
                <div class="channel-logo">
                    <i class="${channel.logo}"></i>
                </div>
                <div class="channel-name">${channel.name}</div>
                <div class="channel-info">Channel ${channel.number} • HD • 16:9</div>
                <div class="channel-info" id="current-program">Now Playing: ${channel.program}</div>
            `;

        // Update channel list active state
        document.querySelectorAll(".channel-item").forEach((item, index) => {
          if (index === currentChannel) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }

      // Change channel by increment
      function changeChannel(increment) {
        if (!isPoweredOn) return;

        const newChannel = currentChannel + increment;

        if (newChannel >= 0 && newChannel < channels.length) {
          currentChannel = newChannel;
          updateChannelDisplay();
        } else if (newChannel < 0) {
          // Wrap to last channel
          currentChannel = channels.length - 1;
          updateChannelDisplay();
        } else if (newChannel >= channels.length) {
          // Wrap to first channel
          currentChannel = 0;
          updateChannelDisplay();
        }
      }

      // Select a specific channel
      function selectChannel(index) {
        if (!isPoweredOn) return;

        currentChannel = index;
        updateChannelDisplay();
      }

      // Toggle power on/off
      function togglePower() {
        isPoweredOn = !isPoweredOn;

        if (isPoweredOn) {
          powerStatus.className = "status-icon power";
          powerText.textContent = "ON";
          channelDisplay.style.opacity = "1";
          updateSignalBars();

          // If recording was on before power off, restore it
          if (recordingInterval) {
            recordingStatus.className = "status-icon recording";
            recordingText.textContent = "ON";
          }
        } else {
          powerStatus.className = "status-icon";
          powerText.textContent = "OFF";
          channelDisplay.style.opacity = "0.3";

          // Turn off all signal bars
          signalBars.forEach((bar) => bar.classList.remove("active"));

          // Stop recording if powering off
          if (isRecording) {
            toggleRecording();
          }
        }
      }

      // Toggle recording
      function toggleRecording() {
        if (!isPoweredOn) return;

        isRecording = !isRecording;

        if (isRecording) {
          recordingStatus.className = "status-icon recording";
          recordingText.textContent = "ON";
          recordBtn.innerHTML = '<i class="fas fa-stop"></i><span>Stop</span>';

          // Simulate recording progress
          recordingInterval = setInterval(() => {
            // In a real app, this would update recording time
          }, 1000);
        } else {
          recordingStatus.className = "status-icon";
          recordingText.textContent = "OFF";
          recordBtn.innerHTML =
            '<i class="fas fa-circle"></i><span>Record</span>';

          if (recordingInterval) {
            clearInterval(recordingInterval);
            recordingInterval = null;
          }
        }
      }

      // Update signal bars based on signal type
      function updateSignalBars() {
        if (!isPoweredOn) {
          signalBars.forEach((bar) => bar.classList.remove("active"));
          return;
        }

        // Different signal types have different "strength"
        let activeBars = 3; // Default for cable

        if (currentSignal === "satellite") {
          activeBars = 4;
        } else if (currentSignal === "internet") {
          activeBars = 5;
        }

        signalBars.forEach((bar, index) => {
          if (index < activeBars) {
            bar.classList.add("active");
          } else {
            bar.classList.remove("active");
          }
        });
      }

      // Simulated menu functions
      function showMenu() {
        if (!isPoweredOn) return;
        alert("STB Menu: Settings, Recordings, Apps, Parental Controls");
      }

      function showGuide() {
        if (!isPoweredOn) return;
        alert("Electronic Program Guide: Shows schedule for all channels");
      }

      function goBack() {
        if (!isPoweredOn) return;
        alert("Back: Returns to previous screen");
      }

      function selectOk() {
        if (!isPoweredOn) return;
        alert("OK/Select: Confirms selection or opens current item");
      }

      // Initialize the STB when page loads
      window.addEventListener("DOMContentLoaded", initSTB);