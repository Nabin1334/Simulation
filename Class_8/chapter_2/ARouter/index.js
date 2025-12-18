
        // Router images data with one image per type
        const routerImages = {
            wired: {
                url: 'wired.webp',
                caption: 'Wired Router - Connects devices using Ethernet cables for stable, high-speed connections'
            },
            wireless: {
                url: 'wireless.webp',
                caption: 'Wireless Router with Multiple Antennas - Provides Wi-Fi connectivity to devices'
            },
            dsl: {
                url: 'DSL.webp',
                caption: 'DSL Router - Connects to telephone lines for internet access'
            },
            fiber: {
                url: 'fiver.webp',
                caption: 'Fiber Optic Router - Uses optical fiber for ultra-high-speed internet'
            }
        };

        // Current state
        let currentRouterType = 'wireless';

        // DOM elements
        const routerImage = document.getElementById('router-image');
        const imageCaption = document.getElementById('image-caption');
        const routerButtons = document.querySelectorAll('.router-btn');

        // Initialize
        function init() {
            loadRouterImage(currentRouterType);
            setupEventListeners();
            
            // Set up fallback for image loading errors
            routerImage.onerror = function() {
                console.log('Image failed to load, using fallback');
                routerImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="200" y="150" font-family="Arial" font-size="24" text-anchor="middle" fill="%231a2980" font-weight="bold">' + currentRouterType.toUpperCase() + ' ROUTER</text><text x="200" y="190" font-family="Arial" font-size="16" text-anchor="middle" fill="%232c3e50" width="350">' + getCurrentCaption() + '</text></svg>';
            };
        }

        // Load router image
        function loadRouterImage(type) {
            currentRouterType = type;
            
            // Update active button
            routerButtons.forEach(btn => {
                if (btn.dataset.type === type) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Update definition
            updateDefinition(type);
            
            // Load image
            const imageData = routerImages[type];
            
            if (imageData && imageData.url) {
                routerImage.src = imageData.url;
                imageCaption.textContent = imageData.caption;
            } else {
                // Use fallback
                routerImage.src = `https://via.placeholder.com/800x600/1a2980/ffffff?text=${encodeURIComponent(type.toUpperCase() + ' Router')}`;
                imageCaption.textContent = getFallbackCaption(type);
            }
        }

        // Get current caption
        function getCurrentCaption() {
            const imageData = routerImages[currentRouterType];
            return imageData ? imageData.caption : `${currentRouterType.toUpperCase()} Router`;
        }

        // Get fallback caption
        function getFallbackCaption(type) {
            const captions = {
                wired: 'Wired Router - Connects devices using Ethernet cables for stable, high-speed connections',
                wireless: 'Wireless Router with Multiple Antennas - Provides Wi-Fi connectivity to devices',
                dsl: 'DSL Router - Connects to telephone lines for internet access',
                fiber: 'Fiber Optic Router - Uses optical fiber for ultra-high-speed internet'
            };
            return captions[type] || `${type.toUpperCase()} Router`;
        }

        // Update definition
        function updateDefinition(type) {
            const definition = document.querySelector('.definition-box p');
            const typeName = type.charAt(0).toUpperCase() + type.slice(1);
            
            definition.innerHTML = `
                <i class="fas fa-quote-left" style="color: #1a2980; margin-right: 10px;"></i>
                A <span class="highlight">router</span> is a network connecting device that helps to connect different wired or wireless networks. 
                This is a <span class="highlight">${typeName} Router</span>. 
                A router helps to send data from one network to another. It works on the principle of <span class="highlight">IP (Internet Protocol) address</span>. 
                Nowadays <span class="highlight">DSL</span> and <span class="highlight">Optical fibre</span> routers are more popular in the market. 
                Routers are mainly of two types: <span class="highlight">wired</span> and <span class="highlight">wireless</span>.
                <i class="fas fa-quote-right" style="color: #1a2980; margin-left: 10px;"></i>
            `;
        }

        // Set up event listeners
        function setupEventListeners() {
            // Router type buttons
            routerButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const type = this.dataset.type;
                    loadRouterImage(type);
                });
            });

            // Image click to show full description
            routerImage.addEventListener('click', () => {
                const caption = getCurrentCaption();
                alert(`Router Information:\n\n${caption}`);
            });

            // Keyboard navigation for router types
            document.addEventListener('keydown', (e) => {
                if (e.key >= '1' && e.key <= '4') {
                    // Number keys 1-4 for router types
                    const index = parseInt(e.key) - 1;
                    if (index < routerButtons.length) {
                        routerButtons[index].click();
                    }
                }
            });

            // Touch gestures for mobile swipe
            let touchStartX = 0;
            let touchEndX = 0;
            
            document.getElementById('router-image-container').addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            document.getElementById('router-image-container').addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
            
            function handleSwipe() {
                const swipeThreshold = 50;
                const diff = touchEndX - touchStartX;
                
                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        // Swipe right - show previous router type
                        const types = ['wireless', 'wired', 'dsl', 'fiber'];
                        const currentIndex = types.indexOf(currentRouterType);
                        const prevIndex = (currentIndex - 1 + types.length) % types.length;
                        routerButtons[prevIndex].click();
                    } else {
                        // Swipe left - show next router type
                        const types = ['wireless', 'wired', 'dsl', 'fiber'];
                        const currentIndex = types.indexOf(currentRouterType);
                        const nextIndex = (currentIndex + 1) % types.length;
                        routerButtons[nextIndex].click();
                    }
                }
            }
        }

        // Initialize when page loads
        window.addEventListener('DOMContentLoaded', init);