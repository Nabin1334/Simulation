const imageData = {
            media: [
                {
                    url: "newspaper.webp",
                    alt: "Magazine",
                    title: "Magazine",
                    icon: "fa-newspaper",
                    description: "Periodic publications containing articles, photos, and advertisements on specific topics like science, fashion, or news. In Nepal, magazines play important role in education and cultural preservation."
                },
                {
                    url: "radio.webp",
                    alt: "Radio",
                    title: "Radio",
                    icon: "fa-podcast",
                    description: "Wireless audio broadcasting through electromagnetic waves, reaching remote areas without internet connectivity. Essential for mountain regions of Nepal where other communication is difficult."
                },
                {
                    url: "tv.webp",
                    alt: "Television",
                    title: "Television",
                    icon: "fa-tv",
                    description: "Audio-visual broadcasting medium combining sound and images for entertainment, news, and educational purposes. Nepal Television (NTV) provides educational programs for students."
                },
                {
                    url: "mediapodcast.webp",
                    alt: "Media Production",
                    title: "Media Production",
                    icon: "fa-broadcast-tower",
                    description: "Behind-the-scenes of creating content for mass media including studios, equipment, and production teams. Modern media production uses digital technology for better quality."
                }
            ],
            phone: [
                {
                    url: "telephone.webp",
                    alt: "Telephone",
                    title: "Telephone",
                    icon: "fa-phone",
                    description: "Device converting sound to electrical signals for voice communication over distances using wired or wireless networks. Still important in offices and areas with poor mobile reception in Nepal."
                },
                {
                    url: "fax-machine.webp",
                    alt: "Fax Machine",
                    title: "Fax Machine",
                    icon: "fa-fax",
                    description: "Machine scanning and transmitting printed documents over telephone lines as electronic signals. Used less now but still important for official documents in some offices."
                },
                {
                    url: "mobile.webp",
                    alt: "Mobile Phone",
                    title: "Mobile Phone",
                    icon: "fa-mobile-alt",
                    description: "Portable wireless device for voice calls, messaging, internet access, and multiple applications. Revolutionized communication in Nepal, especially in rural areas."
                },
                {
                    url: "evolution.webp",
                    alt: "Phone Evolution",
                    title: "Evolution",
                    icon: "fa-history",
                    description: "From rotary dial phones to smartphones - showing technological advancement in communication devices. Nepal has rapidly adopted mobile technology."
                }
            ],
            internet: [
                {
                    url: "internetinfra.webp",
                    alt: "Internet Infrastructure",
                    title: "Internet Infrastructure",
                    icon: "fa-server",
                    description: "Global network of servers, routers, and cables connecting billions of devices worldwide for data exchange. Nepal is expanding its internet infrastructure rapidly."
                },
                {
                    url: "wifi.webp",
                    alt: "WiFi Router",
                    title: "WiFi Technology",
                    icon: "fa-wifi",
                    description: "Wireless networking using radio waves to connect devices to the internet without physical cables. Common in urban homes, schools, and cafes in Nepal."
                },
                {
                    url: "Email.webp",
                    alt: "Email Interface",
                    title: "Email Communication",
                    icon: "fa-envelope",
                    description: "Digital messaging system allowing instant exchange of text, files, and media across the internet. Essential for education and business in modern Nepal."
                },
                {
                    url: "networktechnology.webp",
                    alt: "Fiber Optics",
                    title: "Network Technology",
                    icon: "fa-broadcast-tower",
                    description: "Advanced infrastructure including fiber optic cables enabling high-speed data transmission. Fiber optics are expanding in major cities of Nepal."
                }
            ]
        };

        // DOM Elements
        const buttons = document.querySelectorAll('.ict-button');
        const contentSections = document.querySelectorAll('.content-section');

        // Image Cache
        const imageCache = new Map();

        // Function to create image element with error handling
        function createImageElement(imgData, index) {
            // Create container div
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.dataset.index = index;

            // Create image HTML structure
            imageItem.innerHTML = `
                <div class="image-container">
                    <div class="image-wrapper">
                        <img src="${imgData.url}" 
                             alt="${imgData.alt}" 
                             class="topic-image"
                             loading="lazy">
                    </div>
                    <div class="image-name">${imgData.title}</div>
                </div>
                <div class="image-info">
                    <h3 class="image-title">
                        <i class="fas ${imgData.icon}"></i>
                        ${imgData.title}
                    </h3>
                    <p class="image-desc">${imgData.description}</p>
                </div>
            `;

            // Get the image element and add error handling
            const imgElement = imageItem.querySelector('.topic-image');
            
            // Check cache first
            if (imageCache.has(imgData.url)) {
                imgElement.src = imageCache.get(imgData.url);
            } else {
                // Preload image
                const preloadImg = new Image();
                preloadImg.src = imgData.url;
                
                preloadImg.onload = function() {
                    // Cache the successful image
                    imageCache.set(imgData.url, imgData.url);
                };
                
                preloadImg.onerror = function() {
                    console.log(`Failed to load image: ${imgData.url}`);
                    // Create fallback
                    createImageFallback(imgElement, imgData);
                };
            }

            // Add error handling to the actual image
            imgElement.onerror = function() {
                console.log(`Image error: ${this.src}`);
                createImageFallback(this, imgData);
            };

            return imageItem;
        }

        // Function to create fallback when image fails
        function createImageFallback(imgElement, imgData) {
            const container = imgElement.closest('.image-container');
            if (container) {
                // Hide the broken image
                imgElement.style.display = 'none';
                
                // Create and show fallback
                const fallback = document.createElement('div');
                fallback.className = 'image-fallback';
                fallback.innerHTML = `
                    <i class="fas ${imgData.icon}"></i>
                    <p>${imgData.title}</p>
                    <small>Image temporarily unavailable</small>
                    <div class="image-name">${imgData.title}</div>
                `;
                container.appendChild(fallback);
            }
        }

        // Function to load images for a section
        function loadSectionImages(sectionId) {
            const sectionData = imageData[sectionId];
            if (!sectionData) return;

            // Clear existing content from rows
            document.getElementById(`${sectionId}-row1`).innerHTML = '';
            document.getElementById(`${sectionId}-row2`).innerHTML = '';

            // Load images in pairs (2 per row)
            sectionData.forEach((imgData, index) => {
                const imageElement = createImageElement(imgData, index);
                
                // Distribute to rows based on screen size
                const isSmallScreen = window.innerWidth < 768;
                if ((isSmallScreen && index < 2) || (!isSmallScreen && index < 2)) {
                    document.getElementById(`${sectionId}-row1`).appendChild(imageElement);
                } else {
                    document.getElementById(`${sectionId}-row2`).appendChild(imageElement);
                }
            });
        }

        // Function to show section
        function showSection(sectionId) {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            const activeButton = document.querySelector(`[data-section="${sectionId}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }

            // Hide all sections first
            contentSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show selected section
            const targetSection = document.getElementById(`${sectionId}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
                // Load images for this section
                loadSectionImages(sectionId);
                
                // Scroll right side content to top
                const sideInfoContent = targetSection.querySelector('.side-info-content');
                if (sideInfoContent) {
                    sideInfoContent.scrollTop = 0;
                }
            }
        }

        // Add click event listeners to buttons
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = button.dataset.section;
                showSection(sectionId);
            });
        });

        // Handle window resize for better responsiveness
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // Re-load current section images on resize
                const activeSection = document.querySelector('.content-section.active');
                if (activeSection) {
                    const sectionId = activeSection.id.replace('-section', '');
                    loadSectionImages(sectionId);
                }
            }, 250);
        });

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            // Load initial section (media)
            showSection('media');
            
            // Preload all images for better performance
            Object.values(imageData).forEach(section => {
                section.forEach(imgData => {
                    const img = new Image();
                    img.src = imgData.url;
                    img.onload = function() {
                        imageCache.set(imgData.url, imgData.url);
                    };
                });
            });
        });