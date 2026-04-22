 // DOM Elements
        const simulationArea = document.getElementById('simulationArea');
        const car = document.getElementById('car');
        const finishLabel = document.getElementById('finishLabel');
        const realTimeClock = document.getElementById('realTimeClock');
        const clockValue = document.getElementById('clockValue');
        const timeProgress = document.getElementById('timeProgress');
        
        // Sliders and displays
        const distanceSlider = document.getElementById('distanceSlider');
        const timeSlider = document.getElementById('timeSlider');
        const distanceDisplay = document.getElementById('distanceDisplay');
        const timeDisplay = document.getElementById('timeDisplay');
        
        // Result displays
        const distanceValue = document.getElementById('distanceValue');
        const timeValue = document.getElementById('timeValue');
        const velocityValue = document.getElementById('velocityValue');
        
        // Buttons
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const randomBtn = document.getElementById('randomBtn');
        const exampleButtons = document.querySelectorAll('[data-distance]');
        
        // Simulation variables
        let isAnimating = false;
        let timerInterval = null;
        let elapsedTime = 0;
        let targetTime = 10;
        let animationStartTime = 0;
        let animationDuration = 0;
        const startPosition = 8; // Percentage from left
        const maxDistance = 400; // Max meters
        
        // Initialize the simulation
        function initSimulation() {
            updateDisplays();
            updateFinishMarker();
            setupEventListeners();
            resetClock();
        }
        
        // Update all displays and calculations
        function updateDisplays() {
            const distance = parseInt(distanceSlider.value);
            targetTime = parseFloat(timeSlider.value);
            
            // Update slider displays
            distanceDisplay.textContent = `${distance} m`;
            timeDisplay.textContent = `${targetTime.toFixed(1)} s`;
            
            // Update result displays
            distanceValue.textContent = distance;
            timeValue.textContent = targetTime.toFixed(1);
            
            // Calculate and display target velocity
            const velocity = targetTime > 0 ? (distance / targetTime).toFixed(1) : "0.0";
            velocityValue.textContent = velocity;
            
            return { distance, targetTime, velocity };
        }
        
        // Update finish marker position based on distance
        function updateFinishMarker() {
            const distance = parseInt(distanceSlider.value);
            
            // Calculate position as percentage (max 82% of track width)
            const finishPosition = startPosition + (distance / maxDistance) * 74;
            const finishMarker = document.querySelector('.finish-marker');
            
            if (finishMarker) {
                finishMarker.style.left = `${finishPosition}%`;
            }
            
            finishLabel.style.left = `${finishPosition}%`;
            finishLabel.textContent = `${distance}m`;
        }
        
        // Reset the real-time clock
        function resetClock() {
            elapsedTime = 0;
            clockValue.textContent = "0.0 s";
            timeProgress.style.width = "0%";
            realTimeClock.style.backgroundColor = "var(--dark)";
            
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }
        
        // Start the real-time clock
        function startClock() {
            resetClock();
            animationStartTime = Date.now();
            animationDuration = targetTime * 1000; // Convert to milliseconds
            
            // Update clock every 10ms for smooth real-time display
            timerInterval = setInterval(updateClock, 10);
        }
        
        // Update the real-time clock display
        function updateClock() {
            const currentTime = Date.now();
            elapsedTime = (currentTime - animationStartTime) / 1000; // Convert to seconds
            
            // Calculate progress percentage
            const progress = Math.min(elapsedTime / targetTime, 1);
            
            // Update clock display
            clockValue.textContent = `${elapsedTime.toFixed(1)} s`;
            
            // Update progress bar
            timeProgress.style.width = `${progress * 100}%`;
            
            // Calculate current position based on elapsed time
            const distance = parseInt(distanceSlider.value);
            const currentDistance = Math.min(distance * progress, distance);
            
            // Calculate current velocity (distance traveled so far / time elapsed)
            const currentVelocity = elapsedTime > 0 ? (currentDistance / elapsedTime).toFixed(1) : "0.0";
            
            // Update velocity display in real-time
            velocityValue.textContent = currentVelocity;
            
            // Update time display in real-time
            timeValue.textContent = elapsedTime.toFixed(1);
            
            // Change clock color based on progress
            if (progress >= 1) {
                realTimeClock.style.backgroundColor = "var(--success)";
                clearInterval(timerInterval);
            } else if (progress > 0.75) {
                realTimeClock.style.backgroundColor = "var(--secondary)";
            } else if (progress > 0.5) {
                realTimeClock.style.backgroundColor = "var(--warning)";
                realTimeClock.style.color = "var(--dark)";
            }
            
            return progress;
        }
        
        // Start the animation with real-time clock
        function startRace() {
            if (isAnimating) return;
            
            isAnimating = true;
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Racing...';
            
            const { distance, targetTime } = updateDisplays();
            
            // Validate time
            if (targetTime <= 0) {
                showMessage("Time must be greater than 0 seconds!", "error");
                resetRace();
                return;
            }
            
            // Calculate finish position
            const finishPosition = startPosition + (distance / maxDistance) * 74;
            
            // Start the real-time clock
            startClock();
            
            // Set animation duration to match target time
            const animationDuration = Math.min(targetTime * 1000, 20000); // Cap at 20 seconds
            
            // Move car with smooth animation
            car.style.transition = `left ${animationDuration}ms linear`;
            setTimeout(() => {
                car.style.left = `${finishPosition}%`;
            }, 10);
            
            // When animation completes
            setTimeout(() => {
                isAnimating = false;
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start Race';
                
                // Show final velocity
                const finalVelocity = (distance / targetTime).toFixed(1);
                showMessage(`Race complete! Final velocity: ${finalVelocity} m/s`, "success");
                
                // Make sure clock shows final time
                clockValue.textContent = `${targetTime.toFixed(1)} s`;
                timeProgress.style.width = "100%";
            }, animationDuration + 100);
        }
        
        // Reset the race
        function resetRace() {
            // Stop any animation
            car.style.transition = 'left 0.5s ease-out';
            car.style.left = `${startPosition}%`;
            
            // Reset button state
            isAnimating = false;
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Race';
            
            // Reset clock
            resetClock();
            
            // Update displays with target values
            updateDisplays();
        }
        
        // Set random values
        function setRandomValues() {
            // Ensure time > 0 and distance is reasonable
            const randomDistance = Math.floor(Math.random() * 350) + 50;
            const randomTime = (Math.floor(Math.random() * 36) + 4) / 2; // Values from 2.0 to 20.0 in 0.5 increments
            
            distanceSlider.value = randomDistance;
            timeSlider.value = randomTime;
            
            updateDisplays();
            updateFinishMarker();
            resetRace();
            
            showMessage(`Set to: ${randomDistance}m in ${randomTime.toFixed(1)}s`, "info");
        }
        
        // Set example values
        function setExampleValues(distance, time, label) {
            distanceSlider.value = distance;
            timeSlider.value = time;
            
            updateDisplays();
            updateFinishMarker();
            resetRace();
            
            showMessage(`Example: ${label} (${distance}m in ${time}s)`, "info");
        }
        
        // Show message to user
        function showMessage(text, type = "info") {
            // Remove any existing message
            const existingMessage = document.querySelector('.message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Create message element
            const message = document.createElement('div');
            message.className = `message ${type}`;
            message.textContent = text;
            
            // Style based on type
            const styles = {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '15px 20px',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: '1000',
                maxWidth: '300px',
                fontSize: '1rem'
            };
            
            // Apply styles
            Object.assign(message.style, styles);
            
            // Color based on type
            if (type === "success") {
                message.style.backgroundColor = 'var(--success)';
            } else if (type === "error") {
                message.style.backgroundColor = 'var(--secondary)';
            } else {
                message.style.backgroundColor = 'var(--primary)';
            }
            
            // Add to page
            document.body.appendChild(message);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 3000);
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Slider event listeners
            distanceSlider.addEventListener('input', () => {
                updateDisplays();
                updateFinishMarker();
                if (!isAnimating) resetRace();
            });
            
            timeSlider.addEventListener('input', () => {
                updateDisplays();
                if (!isAnimating) resetRace();
            });
            
            // Button event listeners
            startBtn.addEventListener('click', startRace);
            resetBtn.addEventListener('click', resetRace);
            randomBtn.addEventListener('click', setRandomValues);
            
            // Example buttons
            exampleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const distance = parseInt(button.getAttribute('data-distance'));
                    const time = parseInt(button.getAttribute('data-time'));
                    const label = button.textContent.trim();
                    setExampleValues(distance, time, label);
                });
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (!isAnimating) startRace();
                }
                if (e.key === 'r' || e.key === 'R') {
                    resetRace();
                }
                if (e.key === 't' || e.key === 'T') {
                    setRandomValues();
                }
            });
        }
        
        // Initialize when page loads
        window.addEventListener('DOMContentLoaded', initSimulation);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            updateFinishMarker();
        });