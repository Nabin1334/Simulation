// Image data with actual wiring images
      const images = [
        {
          title: "3-Pin Plug Wiring",
          info: "This shows a correctly wired plug. Brown wire (live) connected to right terminal, blue wire (neutral) to left terminal, and green/yellow wire (earth) to top terminal. All connections are secure and properly insulated.",
          url: "./three.webp",
          fallbackColor: "#1e3c72",
        },
        {
          title: "Wall Socket Internal Wiring",
          info: "Inside view of a wall socket showing proper wiring connections. The wires from main supply are connected to socket terminals. Earth wire provides safety path to ground in case of faults.",
          url: "./wall-socket.webp",
          fallbackColor: "#2a5298",
        },
        {
          title: "Essential Electrical Tools",
          info: "Basic tools needed for safe wiring: Insulated screwdriver, wire stripper, pliers with insulated handles, and electrical tape. Always use tools with proper insulation for safety.",
          url: "./tools.webp",
          fallbackColor: "#4a90e2",
        },
      ];

      let currentImage = 0;

      // Initialize the page
      function initPage() {
        // Show first image
        showImage(0);
      }

      // Show specific image
      function showImage(index) {
        currentImage = index;
        const image = images[currentImage];

        // Update counter
        document.getElementById("imageCounter").textContent = `Image ${
          currentImage + 1
        } of ${images.length}`;

        // Get main image element
        const mainImage = document.getElementById("mainImage");

        // Set the actual image URL
        mainImage.src = image.url;
        mainImage.alt = image.title;

        // Add error handling for image loading
        mainImage.onerror = function () {
          // If image fails to load, create a colored SVG placeholder
          this.onerror = null;
          this.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="grad${currentImage}" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:${
                                  image.fallbackColor
                                };stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#000000;stop-opacity:0.7" />
                            </linearGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grad${currentImage})"/>
                        <rect x="10%" y="10%" width="80%" height="80%" rx="10" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="2"/>
                        <text x="50%" y="35%" font-family="Arial" font-size="32" fill="white" text-anchor="middle" font-weight="bold">${
                          image.title
                        }</text>
                        <text x="50%" y="45%" font-family="Arial" font-size="18" fill="white" text-anchor="middle">Educational Image ${
                          currentImage + 1
                        }</text>
                        <text x="50%" y="60%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" style="font-style:italic;">Image loading failed - showing placeholder</text>
                        <circle cx="50%" cy="75%" r="30" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="2"/>
                        <text x="50%" y="76%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${
                          currentImage + 1
                        }</text>
                    </svg>`
          )}`;
        };

        // Update title
        document.getElementById("imageTitle").textContent = image.title;

        // Update info
        document.getElementById("imageInfo").innerHTML = `
                <strong style="color: #1e3c72;">${image.title}:</strong><br>
                ${image.info}
            `;
      }

      // Show next image
      function nextImage() {
        let next = currentImage + 1;
        if (next >= images.length) {
          next = 0;
        }
        showImage(next);
      }

      // Show previous image
      function prevImage() {
        let prev = currentImage - 1;
        if (prev < 0) {
          prev = images.length - 1;
        }
        showImage(prev);
      }

      // When page loads
      document.addEventListener("DOMContentLoaded", function () {
        initPage();

        // Add button events
        document.getElementById("prevBtn").addEventListener("click", prevImage);
        document.getElementById("nextBtn").addEventListener("click", nextImage);

        // Add keyboard navigation
        document.addEventListener("keydown", function (e) {
          if (e.key === "ArrowLeft") {
            prevImage();
          }
          if (e.key === "ArrowRight") {
            nextImage();
          }
        });

        // Add button animations
        const buttons = document.querySelectorAll(".nav-btn");
        buttons.forEach((button) => {
          button.addEventListener("mousedown", function () {
            this.style.transform = "translateY(1px)";
          });

          button.addEventListener("mouseup", function () {
            this.style.transform = "translateY(-3px)";
          });

          button.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0)";
          });
        });
      });