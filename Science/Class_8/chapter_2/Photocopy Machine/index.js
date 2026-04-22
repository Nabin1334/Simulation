
        // Internal image data - Base64 encoded images for each step
        const stepImages = {
            1: "photocopy-machine.webp",
            
            2: "using-copier.webp",
            
            3: "secondstep.webp",
            
            4: "last.webp"
        };
        
        const stepTitles = {
            1: "Step 1: Photocopy Machine",
            2: "Step 2: User inserts blank paper",
            3: "Step 3: User presses the copy button",
            4: "Step 4: Copy is ready!"
        };
        
        const stepDescriptions = {
            1: "This is the photocopy machine. It's ready to use for making copies of documents.",
            2: "The user puts a blank white paper into the machine's paper tray.",
            3: "The user presses the copy button to start the copying process.",
            4: "The copy is ready! The machine has produced an exact copy of the document."
        };
        
        // Initialize current step
        let currentStep = 1;
        
        // Get DOM elements
        const machineDisplay = document.getElementById('machineDisplay');
        const imageSource = document.getElementById('imageSource');
        const currentStepText = document.getElementById('currentStepText');
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        const resetButton = document.getElementById('resetButton');
        
        // Function to update the display based on current step
        function updateDisplay() {
            // Update the image
            machineDisplay.innerHTML = `<img src="${stepImages[currentStep]}" alt="Step ${currentStep}">`;
            
            // Update the step description
            imageSource.textContent = stepDescriptions[currentStep];
            
            // Update the current step text
            currentStepText.textContent = stepTitles[currentStep];
            
            // Update button states
            prevButton.disabled = currentStep === 1;
            nextButton.disabled = currentStep === 4;
            
            // Highlight the current step in the steps container
            document.querySelectorAll('.step').forEach((step, index) => {
                if (index + 1 === currentStep) {
                    step.style.backgroundColor = '#e8f5e9';
                    step.style.borderLeft = '4px solid #4CAF50';
                } else {
                    step.style.backgroundColor = '#f9f9f9';
                    step.style.borderLeft = 'none';
                }
            });
        }
        
        // Function to go to the next step
        function nextStep() {
            if (currentStep < 4) {
                currentStep++;
                updateDisplay();
            }
        }
        
        // Function to go to the previous step
        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                updateDisplay();
            }
        }
        
        // Function to reset to step 1
        function resetToFirstStep() {
            currentStep = 1;
            updateDisplay();
        }
        
        // Event listeners for buttons
        nextButton.addEventListener('click', nextStep);
        prevButton.addEventListener('click', prevStep);
        resetButton.addEventListener('click', resetToFirstStep);
        
        // Add keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight' || event.key === ' ') {
                nextStep();
            } else if (event.key === 'ArrowLeft') {
                prevStep();
            } else if (event.key === 'Home' || event.key === 'r') {
                resetToFirstStep();
            }
        });
        
        // Initialize the display
        updateDisplay();
        
        // Add a note about keyboard controls
        setTimeout(() => {
            const note = document.createElement('div');
            note.style.marginTop = '10px';
            note.style.fontSize = '12px';
            note.style.color = '#666';
            note.style.textAlign = 'center';
            note.textContent = 'Tip: Use arrow keys (← →) to navigate between steps, or press R to reset.';
            document.querySelector('.controls').parentNode.insertBefore(note, document.querySelector('.controls').nextSibling);
        }, 1000);