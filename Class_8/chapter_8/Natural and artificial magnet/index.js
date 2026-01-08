
      // Data for natural magnets
      const naturalMagnets = [
        {
          name: "Lodestone",
          description:
            "Lodestone is a naturally occurring magnetite (Fe₃O₄) that is magnetized by the Earth's magnetic field. It was the first magnet discovered by ancient civilizations and was used in early compasses.",
          image: "loadstone.webp",
        },
        {
          name: "Magnetite",
          description:
            "Magnetite is a mineral and one of the main iron ores. It is the most magnetic of all naturally occurring minerals on Earth and can be magnetized to become a permanent magnet.",
          image: "Magnetite.webp",
        },
        {
          name: "Basalt Rocks",
          description:
            "Some volcanic rocks like basalt contain magnetite grains that align with Earth's magnetic field when the rock solidifies, preserving a record of the magnetic field's orientation at that time.",
          image: "basalt.webp",
        },
      ];

      // Data for artificial magnets
      const artificialMagnets = [
        {
          name: "Neodymium Magnets",
          description:
            "Neodymium magnets are the strongest type of permanent magnets made from an alloy of neodymium, iron, and boron. They are used in hard disk drives, headphones, and many electronic devices.",
          image: "neodymium.webp",
        },
        {
          name: "Electromagnets",
          description:
            "Electromagnets are made by winding a coil of wire around a ferromagnetic core. They become magnetic only when electric current flows through the wire, allowing precise control of magnetic strength.",
          image: "electro.webp",
        },
        {
          name: "Ceramic Magnets",
          description:
            "Ceramic magnets, also known as ferrite magnets, are made from strontium or barium ferrite. They are inexpensive, corrosion-resistant, and commonly used in speakers, refrigerator magnets, and motors.",
          image: "Ceramic.webp",
        },
      ];

      // Initialize carousels
      let naturalCurrentIndex = 0;
      let artificialCurrentIndex = 0;

      // DOM elements
      const naturalBtn = document.getElementById("naturalBtn");
      const artificialBtn = document.getElementById("artificialBtn");
      const naturalSection = document.getElementById("naturalSection");
      const artificialSection = document.getElementById("artificialSection");
      const naturalTrack = document.getElementById("naturalTrack");
      const artificialTrack = document.getElementById("artificialTrack");
      const naturalDotsContainer = document.getElementById("naturalDots");
      const artificialDotsContainer = document.getElementById("artificialDots");

      // Initialize the page
      function init() {
        // Populate natural magnets carousel
        populateCarousel(naturalTrack, naturalMagnets, naturalDotsContainer);

        // Populate artificial magnets carousel
        populateCarousel(
          artificialTrack,
          artificialMagnets,
          artificialDotsContainer
        );

        // Update carousel positions
        updateCarouselPosition("natural");
        updateCarouselPosition("artificial");

        // Set up event listeners
        setupEventListeners();
      }

      // Populate carousel with cards and dots
      function populateCarousel(track, magnets, dotsContainer) {
        // Clear any existing content
        track.innerHTML = "";
        dotsContainer.innerHTML = "";

        // Create cards
        magnets.forEach((magnet, index) => {
          // Create card element
          const card = document.createElement("div");
          card.className = "magnet-card";

          card.innerHTML = `
                    <div class="magnet-image">
                        <img src="${magnet.image}" alt="${magnet.name}">
                    </div>
                    <h3 class="magnet-name">${magnet.name}</h3>
                    <p class="magnet-description">${magnet.description}</p>
                `;

          track.appendChild(card);

          // Create dot for this card
          const dot = document.createElement("div");
          dot.className = "dot";
          if (index === 0) dot.classList.add("active");
          dot.addEventListener("click", () => {
            if (track.id === "naturalTrack") {
              naturalCurrentIndex = index;
              updateCarouselPosition("natural");
            } else {
              artificialCurrentIndex = index;
              updateCarouselPosition("artificial");
            }
          });
          dotsContainer.appendChild(dot);
        });
      }

      // Update carousel position based on current index
      function updateCarouselPosition(type) {
        let track, dots, currentIndex;

        if (type === "natural") {
          track = naturalTrack;
          dots = naturalDotsContainer.querySelectorAll(".dot");
          currentIndex = naturalCurrentIndex;
        } else {
          track = artificialTrack;
          dots = artificialDotsContainer.querySelectorAll(".dot");
          currentIndex = artificialCurrentIndex;
        }

        // Update track position
        const cardWidth = track.querySelector(".magnet-card").offsetWidth;
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

        // Update dots
        dots.forEach((dot, index) => {
          if (index === currentIndex) {
            dot.classList.add("active");
          } else {
            dot.classList.remove("active");
          }
        });
      }

      // Set up all event listeners
      function setupEventListeners() {
        // Toggle buttons
        naturalBtn.addEventListener("click", () => {
          naturalBtn.classList.add("active");
          artificialBtn.classList.remove("active");
          naturalSection.classList.add("active");
          artificialSection.classList.remove("active");
        });

        artificialBtn.addEventListener("click", () => {
          artificialBtn.classList.add("active");
          naturalBtn.classList.remove("active");
          artificialSection.classList.add("active");
          naturalSection.classList.remove("active");
        });

        // Natural carousel navigation
        document.getElementById("naturalPrev").addEventListener("click", () => {
          naturalCurrentIndex =
            (naturalCurrentIndex - 1 + naturalMagnets.length) %
            naturalMagnets.length;
          updateCarouselPosition("natural");
        });

        document.getElementById("naturalNext").addEventListener("click", () => {
          naturalCurrentIndex =
            (naturalCurrentIndex + 1) % naturalMagnets.length;
          updateCarouselPosition("natural");
        });

        // Artificial carousel navigation
        document
          .getElementById("artificialPrev")
          .addEventListener("click", () => {
            artificialCurrentIndex =
              (artificialCurrentIndex - 1 + artificialMagnets.length) %
              artificialMagnets.length;
            updateCarouselPosition("artificial");
          });

        document
          .getElementById("artificialNext")
          .addEventListener("click", () => {
            artificialCurrentIndex =
              (artificialCurrentIndex + 1) % artificialMagnets.length;
            updateCarouselPosition("artificial");
          });

        // Keyboard navigation
        document.addEventListener("keydown", (e) => {
          // Only if user is not typing in an input field
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
            return;

          // Left arrow - previous
          if (e.key === "ArrowLeft") {
            if (naturalSection.classList.contains("active")) {
              naturalCurrentIndex =
                (naturalCurrentIndex - 1 + naturalMagnets.length) %
                naturalMagnets.length;
              updateCarouselPosition("natural");
            } else {
              artificialCurrentIndex =
                (artificialCurrentIndex - 1 + artificialMagnets.length) %
                artificialMagnets.length;
              updateCarouselPosition("artificial");
            }
          }

          // Right arrow - next
          if (e.key === "ArrowRight") {
            if (naturalSection.classList.contains("active")) {
              naturalCurrentIndex =
                (naturalCurrentIndex + 1) % naturalMagnets.length;
              updateCarouselPosition("natural");
            } else {
              artificialCurrentIndex =
                (artificialCurrentIndex + 1) % artificialMagnets.length;
              updateCarouselPosition("artificial");
            }
          }

          // N key - switch to natural magnets
          if (e.key === "n" || e.key === "N") {
            naturalBtn.click();
          }

          // A key - switch to artificial magnets
          if (e.key === "a" || e.key === "A") {
            artificialBtn.click();
          }
        });
      }

      // Initialize the page when DOM is loaded
      document.addEventListener("DOMContentLoaded", init);

      // Handle window resize
      window.addEventListener("resize", () => {
        updateCarouselPosition("natural");
        updateCarouselPosition("artificial");
      });