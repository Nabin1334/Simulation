
        // Image data - Exactly 2 pictures per wire type
        const wireImages = {
            neutral: [
                {
                    url: "neuramire.webp",
                    caption: "Neutral wires in an electrical panel (typically white)"
                },
                {
                    url: "neuraa.webp",
                    caption: "Neutral wire within an electrical cable"
                }
            ],
            earth: [
                {
                    url: "ground.webp",
                    caption: "Earth wire connection to grounding rod"
                },
                {
                    url: "gw.webp",
                    caption: "Earth wire in a three-pin electrical plug"
                }
            ]
        };

        // Get references to DOM elements
        const neutralBtn = document.getElementById('neutralBtn');
        const earthBtn = document.getElementById('earthBtn');
        const neutralInfo = document.getElementById('neutralInfo');
        const earthInfo = document.getElementById('earthInfo');
        
        // Picture containers
        const neutralPictures = document.getElementById('neutralPictures');
        const earthPictures = document.getElementById('earthPictures');
        
        // Navigation buttons
        const neutralPrevBtn = document.getElementById('neutralPrevBtn');
        const neutralNextBtn = document.getElementById('neutralNextBtn');
        const earthPrevBtn = document.getElementById('earthPrevBtn');
        const earthNextBtn = document.getElementById('earthNextBtn');
        
        // Indicators
        const neutralIndicator = document.getElementById('neutralIndicator');
        const earthIndicator = document.getElementById('earthIndicator');
        
        // Current picture state
        let currentPicture = {
            neutral: 0,
            earth: 0
        };
        
        // Function to create picture display (showing exactly 2 pictures)
        function createPictureDisplay(container, images, type) {
            // Clear existing content
            container.innerHTML = '';
            
            // Create picture frames for exactly 2 pictures
            images.forEach((image, index) => {
                const pictureFrame = document.createElement('div');
                pictureFrame.className = `picture-frame ${type}-picture`;
                pictureFrame.dataset.index = index;
                
                // Picture number
                const pictureNumber = document.createElement('div');
                pictureNumber.className = 'picture-number';
                pictureNumber.textContent = index + 1;
                
                // Image
                const img = document.createElement('img');
                img.src = image.url;
                img.alt = image.caption;
                img.loading = "lazy";
                
                // Caption
                const caption = document.createElement('div');
                caption.className = 'picture-caption';
                caption.innerHTML = `<span class="picture-number">${index + 1}</span> ${image.caption}`;
                
                // Assemble picture frame
                pictureFrame.appendChild(img);
                pictureFrame.appendChild(caption);
                container.appendChild(pictureFrame);
            });
            
            // Initialize display
            updatePictureDisplay(type);
        }
        
        // Function to update which picture is currently visible
        function updatePictureDisplay(type) {
            const container = document.getElementById(`${type}Pictures`);
            const pictures = container.querySelectorAll('.picture-frame');
            const indicator = document.getElementById(`${type}Indicator`);
            
            // Hide all pictures
            pictures.forEach(picture => {
                picture.style.display = 'none';
                picture.style.opacity = '0';
                picture.style.transform = 'translateY(20px)';
            });
            
            // Show only the current picture
            const currentIndex = currentPicture[type];
            if (pictures[currentIndex]) {
                pictures[currentIndex].style.display = 'block';
                // Add fade-in animation
                setTimeout(() => {
                    pictures[currentIndex].style.opacity = '1';
                    pictures[currentIndex].style.transform = 'translateY(0)';
                    pictures[currentIndex].style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                }, 50);
            }
            
            // Update indicator text
            if (indicator) {
                indicator.textContent = `Showing picture ${currentIndex + 1} of ${pictures.length}`;
            }
            
            // Update button states
            updateButtonStates(type);
        }
        
        // Function to update button states (enable/disable)
        function updateButtonStates(type) {
            const images = wireImages[type];
            const prevBtn = document.getElementById(`${type}PrevBtn`);
            const nextBtn = document.getElementById(`${type}NextBtn`);
            
            if (prevBtn) {
                prevBtn.disabled = currentPicture[type] === 0;
                prevBtn.style.opacity = currentPicture[type] === 0 ? '0.5' : '1';
                prevBtn.style.cursor = currentPicture[type] === 0 ? 'not-allowed' : 'pointer';
            }
            
            if (nextBtn) {
                nextBtn.disabled = currentPicture[type] === images.length - 1;
                nextBtn.style.opacity = currentPicture[type] === images.length - 1 ? '0.5' : '1';
                nextBtn.style.cursor = currentPicture[type] === images.length - 1 ? 'not-allowed' : 'pointer';
            }
        }
        
        // Function to show next picture
        function showNextPicture(type) {
            const images = wireImages[type];
            if (currentPicture[type] < images.length - 1) {
                currentPicture[type]++;
                updatePictureDisplay(type);
            }
        }
        
        // Function to show previous picture
        function showPreviousPicture(type) {
            if (currentPicture[type] > 0) {
                currentPicture[type]--;
                updatePictureDisplay(type);
            }
        }
        
        // Function to go to specific picture
        function goToPicture(type, index) {
            const images = wireImages[type];
            if (index >= 0 && index < images.length) {
                currentPicture[type] = index;
                updatePictureDisplay(type);
            }
        }
        
        // Initialize picture displays
        createPictureDisplay(neutralPictures, wireImages.neutral, 'neutral');
        createPictureDisplay(earthPictures, wireImages.earth, 'earth');
        
        // Initially show neutral wire information
        neutralInfo.classList.add('active');
        
        // Function to hide all info displays
        function hideAllDisplays() {
            neutralInfo.classList.remove('active');
            earthInfo.classList.remove('active');
        }
        
        // Add event listeners to buttons
        neutralBtn.addEventListener('click', function() {
            hideAllDisplays();
            neutralInfo.classList.add('active');
            updatePictureDisplay('neutral');
            
            // Add visual feedback for the button click
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        earthBtn.addEventListener('click', function() {
            hideAllDisplays();
            earthInfo.classList.add('active');
            updatePictureDisplay('earth');
            
            // Add visual feedback for the button click
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Add navigation event listeners
        neutralPrevBtn.addEventListener('click', () => showPreviousPicture('neutral'));
        neutralNextBtn.addEventListener('click', () => showNextPicture('neutral'));
        earthPrevBtn.addEventListener('click', () => showPreviousPicture('earth'));
        earthNextBtn.addEventListener('click', () => showNextPicture('earth'));
        
        // Add keyboard navigation
        document.addEventListener('keydown', function(event) {
            // Switch between wire types
            if (event.key === '1' || event.key === 'n') {
                hideAllDisplays();
                neutralInfo.classList.add('active');
                updatePictureDisplay('neutral');
                neutralBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    neutralBtn.style.transform = '';
                }, 150);
            } else if (event.key === '2' || event.key === 'e') {
                hideAllDisplays();
                earthInfo.classList.add('active');
                updatePictureDisplay('earth');
                earthBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    earthBtn.style.transform = '';
                }, 150);
            }
            
            // Navigate pictures with arrow keys
            const activeDisplay = document.querySelector('.info-display.active');
            if (activeDisplay) {
                const type = activeDisplay.id.includes('neutral') ? 'neutral' : 'earth';
                
                if (event.key === 'ArrowLeft') {
                    showPreviousPicture(type);
                    event.preventDefault();
                } else if (event.key === 'ArrowRight') {
                    showNextPicture(type);
                    event.preventDefault();
                } else if (event.key >= '1' && event.key <= '2') {
                    // Number keys 1-2 to go directly to specific picture
                    const pictureIndex = parseInt(event.key) - 1;
                    goToPicture(type, pictureIndex);
                }
            }
        });
        
        // Add click event to picture frames to navigate
        function addPictureFrameClickEvents() {
            document.querySelectorAll('.picture-frame').forEach(frame => {
                frame.addEventListener('click', function() {
                    const container = this.closest('.two-picture-container');
                    const type = container.id.includes('neutral') ? 'neutral' : 'earth';
                    const index = parseInt(this.dataset.index);
                    goToPicture(type, index);
                });
            });
        }
        
        // Initialize click events on picture frames
        setTimeout(addPictureFrameClickEvents, 100);
        
        // Add a simple interactive feature: change wire color on hover
        const colorSamples = document.querySelectorAll('.color-sample');
        colorSamples.forEach(sample => {
            sample.addEventListener('mouseover', function() {
                this.style.transform = 'scale(1.3)';
            });
            
            sample.addEventListener('mouseout', function() {
                this.style.transform = 'scale(1)';
            });
            
            // Click to switch to that wire type
            sample.addEventListener('click', function() {
                const isNeutral = this.classList.contains('neutral-color');
                hideAllDisplays();
                
                if (isNeutral) {
                    neutralInfo.classList.add('active');
                    updatePictureDisplay('neutral');
                    neutralBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        neutralBtn.style.transform = '';
                    }, 150);
                } else {
                    earthInfo.classList.add('active');
                    updatePictureDisplay('earth');
                    earthBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        earthBtn.style.transform = '';
                    }, 150);
                }
            });
        });
        
        // Add hover effect to picture buttons
        document.querySelectorAll('.picture-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                if (!this.disabled) {
                    this.style.transform = 'translateY(-2px)';
                }
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });