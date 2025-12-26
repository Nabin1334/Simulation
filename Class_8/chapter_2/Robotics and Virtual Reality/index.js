
        document.addEventListener('DOMContentLoaded', function() {
            // Section navigation functionality
            const sectionBtns = document.querySelectorAll('.section-btn');
            const sectionContents = document.querySelectorAll('.section-content');
            
            sectionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const sectionId = btn.getAttribute('data-section');
                    
                    // Remove active class from all buttons and sections
                    sectionBtns.forEach(b => b.classList.remove('active'));
                    sectionContents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to clicked button and corresponding section
                    btn.classList.add('active');
                    document.getElementById(sectionId).classList.add('active');
                });
            });
            
            // Robotics images data with your local image files
            const roboticsImages = [
                {
                    id: 1,
                    title: "Industrial Robot",
                    description: "Robots in manufacturing performing precise assembly tasks",
                    imageUrl: "industry.webp"
                },
                {
                    id: 2,
                    title: "Medical Robotics",
                    description: "Surgical robots assisting doctors in complex procedures",
                    imageUrl: "medicalrobotic.webp"
                },
                {
                    id: 3,
                    title: "Humanoid Robot",
                    description: "Robots designed to resemble and interact like humans",
                    imageUrl: "so.webp"
                },
                {
                    id: 4,
                    title: "Autonomous Drone",
                    description: "Self-flying drones used for delivery and surveillance",
                    imageUrl: "drone.webp"
                },
                {
                    id: 5,
                    title: "Educational Robot",
                    description: "Robots used in classrooms to teach programming and STEM",
                    imageUrl: "edurobot.webp"
                },
                {
                    id: 6,
                    title: "Space Exploration Robot",
                    description: "Robots used in space exploration missions",
                    imageUrl: "render.webp"
                }
            ];
            
            // VR images data with your local image files
            const vrImages = [
                {
                    id: 1,
                    title: "VR Headset",
                    description: "Modern VR headset with motion tracking and 3D audio",
                    imageUrl: "vrheadset.webp"
                },
                {
                    id: 2,
                    title: "Virtual Training",
                    description: "Using VR for simulation and training in various fields",
                    imageUrl: "vr-traning.webp"
                },
                {
                    id: 3,
                    title: "VR Gaming",
                    description: "Immersive gaming experiences in virtual environments",
                    imageUrl: "gamingvr.webp"
                },
                {
                    id: 4,
                    title: "Architectural Visualization",
                    description: "Walking through building designs before construction",
                    imageUrl: "architecturevr.webp"
                },
                {
                    id: 5,
                    title: "Medical VR Training",
                    description: "Medical students practicing surgery in virtual reality",
                    imageUrl: "medicalVR.webp"
                },
                {
                    id: 6,
                    title: "Virtual Tourism",
                    description: "Exploring world destinations through VR experiences",
                    imageUrl: "tourismVR.webp"
                }
            ];
            
            // Create slider function
            function createSlider(images, sliderId, dotsId) {
                const slider = document.getElementById(sliderId);
                const dotsContainer = document.getElementById(dotsId);
                
                // Clear existing content
                slider.innerHTML = '';
                dotsContainer.innerHTML = '';
                
                // Create slides and dots
                images.forEach((image, index) => {
                    // Create slide
                    const slide = document.createElement('div');
                    slide.className = 'slide';
                    slide.innerHTML = `
                        <img src="${image.imageUrl}" alt="${image.title}" 
                             onerror="this.onerror=null; this.style.display='none';">
                        <div class="slide-info">
                            <h3>${image.title}</h3>
                            <p>${image.description}</p>
                        </div>
                    `;
                    slider.appendChild(slide);
                    
                    // Create dot
                    const dot = document.createElement('div');
                    dot.className = 'dot';
                    if (index === 0) dot.classList.add('active');
                    dot.dataset.index = index;
                    dotsContainer.appendChild(dot);
                });
                
                // Set initial slide position
                let currentSlide = 0;
                const totalSlides = images.length;
                
                // Function to update slider position
                function updateSlider() {
                    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
                    
                    // Update active dot
                    document.querySelectorAll(`#${dotsId} .dot`).forEach((dot, index) => {
                        if (index === currentSlide) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                }
                
                // Return slider control functions
                return {
                    nextSlide: function() {
                        currentSlide = (currentSlide + 1) % totalSlides;
                        updateSlider();
                    },
                    prevSlide: function() {
                        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                        updateSlider();
                    },
                    goToSlide: function(index) {
                        currentSlide = index;
                        updateSlider();
                    },
                    currentSlide: currentSlide
                };
            }
            
            // Initialize sliders
            const roboticsSlider = createSlider(roboticsImages, 'robotics-slider', 'robotics-dots');
            const vrSlider = createSlider(vrImages, 'vr-slider', 'vr-dots');
            
            // Add event listeners for slider buttons
            document.querySelectorAll('.slider-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const sliderType = this.dataset.slider;
                    const isNext = this.classList.contains('next-btn');
                    
                    if (sliderType === 'robotics') {
                        if (isNext) {
                            roboticsSlider.nextSlide();
                        } else {
                            roboticsSlider.prevSlide();
                        }
                    } else if (sliderType === 'vr') {
                        if (isNext) {
                            vrSlider.nextSlide();
                        } else {
                            vrSlider.prevSlide();
                        }
                    }
                });
            });
            
            // Add event listeners for dots
            document.querySelectorAll('.dot').forEach(dot => {
                dot.addEventListener('click', function() {
                    const sliderType = this.parentElement.id.replace('-dots', '');
                    const slideIndex = parseInt(this.dataset.index);
                    
                    if (sliderType === 'robotics') {
                        roboticsSlider.goToSlide(slideIndex);
                    } else if (sliderType === 'vr') {
                        vrSlider.goToSlide(slideIndex);
                    }
                });
            });
            
            // Auto slide functionality removed - sliders now only change manually
            
            // Add keyboard navigation for section buttons
            document.addEventListener('keydown', function(e) {
                const activeBtn = document.querySelector('.section-btn.active');
                const buttons = Array.from(document.querySelectorAll('.section-btn'));
                const currentIndex = buttons.indexOf(activeBtn);
                
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % buttons.length;
                    buttons[nextIndex].click();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                    buttons[prevIndex].click();
                }
            });
        });