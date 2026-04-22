
        // Step data with images
        const steps = [
            {
                step: 1,
                title: "What is a Printer?",
                description: "A printer is a machine that takes digital information from your computer and makes a physical copy on paper. It's like a robot artist that can draw exactly what you see on your screen! Printers have different parts: paper tray, ink cartridges, and control buttons.",
                icon: "1️⃣",
                iconColor: "linear-gradient(135deg, #4a6fa5, #2c5282)",
                image: "printer.webp",
                funFact: "The first computer printer was invented in 1953 and was as big as a desk!"
            },
            {
                step: 2,
                title: "How to Use a Printer",
                description: "1. Turn on the printer. 2. Load paper in the tray. 3. Check ink or toner levels. 4. Connect to computer (USB or Wi-Fi). 5. Click 'Print' on your computer. 6. Wait for your document to print!",
                icon: "2️⃣",
                iconColor: "linear-gradient(135deg, #38a169, #2f855a)",
                image: "user.webp",
                funFact: "Some printers can print without wires using Wi-Fi or Bluetooth!"
            },
            {
                step: 3,
                title: "The Printing Process",
                description: "When you click 'Print', magic happens! 1. Computer sends data to printer. 2. Printer heats up (for laser printers). 3. Ink or toner is applied to paper. 4. Paper moves through rollers. 5. Your document comes out warm and fresh!",
                icon: "3️⃣",
                iconColor: "linear-gradient(135deg, #f6ad55, #ed8936)",
                image: "process.webp",
                funFact: "Inkjet printers spray tiny ink droplets smaller than a human hair!"
            },
            {
                step: 4,
                title: "Your Finished Print",
                description: "Congratulations! Your printed document is ready. Remember: 1. Wait a few seconds for ink to dry. 2. Handle prints carefully. 3. Share your work with friends or teachers. 4. Always turn off the printer when done.",
                icon: "4️⃣",
                iconColor: "linear-gradient(135deg, #9f7aea, #805ad5)",
                image: "finish.webp",
                funFact: "3D printers can create objects layer by layer using plastic!"
            }
        ];

        let currentStep = 0;
        
        // Get DOM elements
        const stepTitle = document.getElementById('stepTitle');
        const stepDescription = document.getElementById('stepDescription');
        const stepIcon = document.getElementById('stepIcon');
        const stepImage = document.getElementById('stepImage');
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        const restartButton = document.getElementById('restartButton');
        const stepIndicators = document.getElementById('stepIndicators');
        const progressBar = document.getElementById('progressBar');
        const keyboardHint = document.getElementById('keyboardHint');
        const funFact = document.getElementById('funFact');

        // Function to create step indicators
        function createStepIndicators() {
            stepIndicators.innerHTML = '';
            
            for (let i = 0; i < steps.length; i++) {
                const indicator = document.createElement('div');
                indicator.classList.add('step-indicator');
                indicator.textContent = i + 1;
                
                if (i === currentStep) {
                    indicator.classList.add('active');
                    indicator.style.background = steps[i].iconColor;
                }
                
                indicator.addEventListener('click', () => {
                    currentStep = i;
                    updateStep();
                });
                
                stepIndicators.appendChild(indicator);
            }
        }

        // Function to update the step display
        function updateStep() {
            const step = steps[currentStep];
            
            // Update text content
            stepTitle.textContent = step.title;
            stepDescription.textContent = step.description;
            funFact.innerHTML = `<strong>Fun Fact:</strong> ${step.funFact}`;
            
            // Update progress bar
            progressBar.style.width = `${(currentStep + 1) * 25}%`;
            progressBar.style.background = step.iconColor;
            
            // Update icon
            stepIcon.textContent = step.icon;
            stepIcon.style.background = step.iconColor;
            
            // Load image with error handling
            stepImage.src = step.image;
            stepImage.alt = step.title;
            
            // If image fails to load, use backup
            stepImage.onerror = function() {
                this.src = backupImages[currentStep];
            };
            
            // Update button states
            prevButton.disabled = currentStep === 0;
            nextButton.disabled = currentStep === steps.length - 1;
            
            // Update step indicators
            document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
                if (index === currentStep) {
                    indicator.classList.add('active');
                    indicator.style.background = step.iconColor;
                } else {
                    indicator.classList.remove('active');
                    indicator.style.background = '';
                }
            });
            
            // Update keyboard hint
            updateKeyboardHint();
        }

        // Function to update keyboard navigation hints
        function updateKeyboardHint() {
            const hints = [
                "Tip: Press → to go to the next step",
                "Tip: Use ← → arrow keys to navigate between steps",
                "Tip: Press Spacebar to go to next step",
                "Tip: Press 'R' to restart from the beginning"
            ];
            
            const hintIndex = Math.min(currentStep, hints.length - 1);
            keyboardHint.textContent = hints[hintIndex];
        }

        // Function to go to next step
        function nextStep() {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateStep();
            }
        }

        // Function to go to previous step
        function prevStep() {
            if (currentStep > 0) {
                currentStep--;
                updateStep();
            }
        }

        // Function to restart from first step
        function restart() {
            currentStep = 0;
            updateStep();
            showMessage("Starting over from Step 1! 🚀");
        }

        // Function to show a temporary message
        function showMessage(text) {
            // Remove any existing messages
            const existingMessages = document.querySelectorAll('.temp-message');
            existingMessages.forEach(msg => msg.remove());
            
            // Create message element
            const message = document.createElement('div');
            message.className = 'temp-message';
            message.style.position = 'fixed';
            message.style.top = '20px';
            message.style.right = '20px';
            message.style.background = 'linear-gradient(135deg, #4a6fa5, #2c5282)';
            message.style.color = 'white';
            message.style.padding = '15px 25px';
            message.style.borderRadius = '10px';
            message.style.boxShadow = '0 6px 15px rgba(0,0,0,0.25)';
            message.style.zIndex = '1000';
            message.style.maxWidth = '300px';
            message.style.animation = 'slideIn 0.5s ease-out';
            message.innerHTML = `<strong>${text}</strong>`;
            
            document.body.appendChild(message);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                message.style.opacity = '0';
                message.style.transition = 'opacity 1s';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 1000);
            }, 3000);
        }

        // Event listeners for buttons
        nextButton.addEventListener('click', nextStep);
        prevButton.addEventListener('click', prevStep);
        restartButton.addEventListener('click', restart);

        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight' || event.key === ' ') {
                nextStep();
                event.preventDefault();
            } else if (event.key === 'ArrowLeft') {
                prevStep();
                event.preventDefault();
            } else if (event.key === 'r' || event.key === 'R') {
                restart();
                event.preventDefault();
            }
        });

        // Click on step image to see it larger
        stepImage.addEventListener('click', function() {
            if (this.style.transform === 'scale(1.5)') {
                this.style.transform = 'scale(1)';
                this.style.cursor = 'zoom-in';
            } else {
                this.style.transform = 'scale(1.5)';
                this.style.cursor = 'zoom-out';
                
                // Reset after 3 seconds
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                    this.style.cursor = 'zoom-in';
                }, 3000);
            }
        });

        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .step-image {
                cursor: zoom-in;
            }
            
            .step-image:hover {
                transform: scale(1.05);
                transition: transform 0.3s ease;
            }
        `;
        document.head.appendChild(style);

        // Initialize
        createStepIndicators();
        updateStep();
        
        // Show welcome message
        setTimeout(() => {
            showMessage("Welcome! Let's learn about printers together! 📚");
        }, 1000);