// Two.js Setup
        let two;
        let currentAnimation = null;
        let animationElements = [];
        let demoModeActive = false;
        let demoInterval = null;
        let virusInterval = null;

        function initTwoJS() {
            const canvas = document.getElementById('simulationCanvas');
            two = new Two({
                width: canvas.parentElement.clientWidth,
                height: canvas.parentElement.clientHeight,
                type: Two.Types.canvas,
                autostart: true
            }).appendTo(canvas);
            
            // Create keyboard keys dynamically
            createRealisticKeyboardKeys();
            
            // Add event listeners to keys
            addKeyboardInteractivity();
        }

        function createRealisticKeyboardKeys() {
            const keyboardTop = document.getElementById('keyboardTop');
            
            // Define keyboard layout - More realistic mechanical keyboard layout
            const keyboardLayout = [
                // Row 1: Function keys and Escape
                [{text: 'Esc', span: 1, class: 'key-function'}, 
                 {text: 'F1', span: 1, class: 'key-function'}, 
                 {text: 'F2', span: 1, class: 'key-function'}, 
                 {text: 'F3', span: 1, class: 'key-function'}, 
                 {text: 'F4', span: 1, class: 'key-function'}, 
                 {text: 'F5', span: 1, class: 'key-function'}, 
                 {text: 'F6', span: 1, class: 'key-function'}, 
                 {text: 'F7', span: 1, class: 'key-function'}, 
                 {text: 'F8', span: 1, class: 'key-function'}, 
                 {text: 'F9', span: 1, class: 'key-function'}, 
                 {text: 'F10', span: 1, class: 'key-function'}, 
                 {text: 'F11', span: 1, class: 'key-function'}, 
                 {text: 'F12', span: 1, class: 'key-function'}, 
                 {text: 'PrtSc', span: 1, class: 'key-function'}, 
                 {text: 'ScrLk', span: 1, class: 'key-function'}, 
                 {text: 'Pause', span: 1, class: 'key-function'}],
                // Row 2: Numbers with accent keys
                [{text: '`', span: 1}, {text: '1', span: 1}, {text: '2', span: 1}, {text: '3', span: 1}, {text: '4', span: 1}, {text: '5', span: 1}, {text: '6', span: 1}, {text: '7', span: 1}, {text: '8', span: 1}, {text: '9', span: 1}, {text: '0', span: 1}, {text: '-', span: 1}, {text: '=', span: 1}, {text: 'Back', span: 2, class: 'key-backspace'}, {text: 'Ins', span: 1, class: 'key-function'}, {text: 'Home', span: 1, class: 'key-function'}, {text: 'PgUp', span: 1, class: 'key-function'}],
                // Row 3: Tab and QWERTY row
                [{text: 'Tab', span: 2, class: 'key-tab'}, {text: 'Q', span: 1}, {text: 'W', span: 1}, {text: 'E', span: 1}, {text: 'R', span: 1}, {text: 'T', span: 1}, {text: 'Y', span: 1}, {text: 'U', span: 1}, {text: 'I', span: 1}, {text: 'O', span: 1}, {text: 'P', span: 1}, {text: '[', span: 1}, {text: ']', span: 1}, {text: '\\', span: 1}, {text: 'Del', span: 1, class: 'key-function'}, {text: 'End', span: 1, class: 'key-function'}, {text: 'PgDn', span: 1, class: 'key-function'}],
                // Row 4: Caps Lock and ASDF row
                [{text: 'Caps', span: 2, class: 'key-caps'}, {text: 'A', span: 1}, {text: 'S', span: 1}, {text: 'D', span: 1}, {text: 'F', span: 1}, {text: 'G', span: 1}, {text: 'H', span: 1}, {text: 'J', span: 1}, {text: 'K', span: 1}, {text: 'L', span: 1}, {text: ';', span: 1}, {text: "'", span: 1}, {text: 'Enter', span: 3, class: 'key-enter'}],
                // Row 5: Shift and ZXCV row
                [{text: 'Shift', span: 3, class: 'key-shift'}, {text: 'Z', span: 1}, {text: 'X', span: 1}, {text: 'C', span: 1}, {text: 'V', span: 1}, {text: 'B', span: 1}, {text: 'N', span: 1}, {text: 'M', span: 1}, {text: ',', span: 1}, {text: '.', span: 1}, {text: '/', span: 1}, {text: 'Shift', span: 3, class: 'key-shift'}, {text: '↑', span: 1, class: 'key-function'}],
                // Row 6: Control keys with arrow keys
                [{text: 'Ctrl', span: 2, class: 'key-ctrl'}, {text: 'Fn', span: 2, class: 'key-fn'}, {text: 'Win', span: 2, class: 'key-windows'}, {text: 'Alt', span: 2, class: 'key-alt'}, {text: '', span: 7, class: 'key-space'}, {text: 'Alt', span: 2, class: 'key-alt'}, {text: 'Win', span: 2, class: 'key-windows'}, {text: 'Menu', span: 2, class: 'key-ctrl'}, {text: 'Ctrl', span: 2, class: 'key-ctrl'}, {text: '←', span: 1, class: 'key-function'}, {text: '↓', span: 1, class: 'key-function'}, {text: '→', span: 1, class: 'key-function'}]
            ];
            
            keyboardTop.innerHTML = '';
            
            keyboardLayout.forEach((row, rowIndex) => {
                row.forEach(key => {
                    const keyElement = document.createElement('div');
                    let keyText = '';
                    let keySpan = 1;
                    let keyClass = '';
                    
                    if (typeof key === 'string') {
                        keyText = key;
                    } else {
                        keyText = key.text || '';
                        keySpan = key.span || 1;
                        keyClass = key.class || '';
                    }
                    
                    keyElement.className = `key ${keyClass}`;
                    keyElement.textContent = keyText;
                    keyElement.style.gridColumn = `span ${keySpan}`;
                    
                    // Add data attribute for special styling
                    if (keyText.length === 1 && /[A-Z]/.test(keyText)) {
                        keyElement.setAttribute('data-key', keyText);
                    }
                    
                    if (keyText === '') {
                        keyElement.style.background = 'linear-gradient(145deg, #2c3e50, #1a252f)';
                    }
                    
                    keyboardTop.appendChild(keyElement);
                });
            });
        }

        function addKeyboardInteractivity() {
            const keys = document.querySelectorAll('.key');
            keys.forEach(key => {
                key.addEventListener('click', function(e) {
                    e.stopPropagation();
                    this.style.animation = 'keyPress 0.2s';
                    this.style.background = 'linear-gradient(145deg, #3498db, #2980b9)';
                    
                    setTimeout(() => {
                        if (!this.classList.contains('key-space') && 
                            !this.classList.contains('key-enter') && 
                            !this.classList.contains('key-backspace') &&
                            !this.classList.contains('key-windows') &&
                            !this.classList.contains('key-function')) {
                            const keyText = this.textContent;
                            if (keyText.length === 1 && /[A-Z]/.test(keyText)) {
                                this.style.background = 'linear-gradient(145deg, #2c3e50, #1a252f)';
                            } else {
                                this.style.background = 'linear-gradient(145deg, #333, #222)';
                            }
                        }
                        this.style.animation = '';
                    }, 200);
                    
                    const keyText = this.textContent;
                    if (keyText && keyText.trim() !== '') {
                        document.getElementById('screenMessage').textContent = `Key pressed: ${keyText}`;
                        setTimeout(() => {
                            document.getElementById('screenMessage').textContent = 'All systems operational';
                        }, 1000);
                    }
                });
            });
        }

        function showAnimation(problemType) {
            // Reset active state
            document.querySelectorAll('.problem-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Set active state for clicked item
            event.currentTarget.classList.add('active');
            
            // Clear previous animations
            clearAnimation();
            
            // Stop current animation
            if (currentAnimation) {
                clearInterval(currentAnimation);
                currentAnimation = null;
            }
            
            // Show problem-specific animation
            switch(problemType) {
                case 'hitting':
                    animateHitting();
                    break;
                case 'eating':
                    animateEating();
                    break;
                case 'mouse':
                    animateMouse();
                    break;
                case 'keyboard':
                    animateKeyboard();
                    break;
                case 'shutdown':
                    animateShutdown();
                    break;
                case 'dust':
                    animateDust();
                    break;
                case 'malware':
                    animateMalware();
                    break;
            }
        }

        function clearAnimation() {
            // Clear Two.js elements
            if (two) {
                animationElements.forEach(element => {
                    if (element.clear) {
                        element.clear();
                    } else {
                        two.remove(element);
                    }
                });
                animationElements = [];
            }
            
            // Clear DOM animations
            const container = document.getElementById('animationContainer');
            container.innerHTML = '';
            
            // Clear screen viruses
            const screenContent = document.querySelector('.screen-content');
            const viruses = screenContent.querySelectorAll('.screen-virus');
            viruses.forEach(virus => virus.remove());
            
            // Reset screen
            document.getElementById('systemStatus').textContent = 'Normal';
            document.getElementById('systemStatus').style.color = '';
            document.getElementById('screenMessage').textContent = 'All systems operational';
            document.getElementById('statusIndicator').textContent = '✓ Protected';
            document.getElementById('statusIndicator').style.background = 'rgba(46, 204, 113, 0.2)';
            
            // Reset components
            const cpu = document.getElementById('cpuReal');
            const keyboard = document.getElementById('keyboardReal');
            const mouse = document.getElementById('mouseReal');
            const monitor = document.getElementById('monitor');
            
            cpu.style.animation = '';
            cpu.style.transform = '';
            cpu.style.background = 'linear-gradient(135deg, #2c3e50, #34495e)';
            
            keyboard.style.animation = '';
            keyboard.style.transform = '';
            keyboard.style.background = 'linear-gradient(135deg, #2c3e50, #34495e)';
            
            mouse.style.animation = '';
            mouse.style.transform = '';
            mouse.style.background = '#2c3e50';
            
            monitor.style.animation = '';
            monitor.style.transform = '';
            
            // Reset CPU vents
            const cpuVents = document.querySelectorAll('.cpu-vent-slot');
            cpuVents.forEach(vent => {
                vent.style.background = '#3498db';
            });
            
            // Reset CPU power button
            const cpuPower = document.getElementById('cpuPower');
            cpuPower.style.background = '#27ae60';
            
            // Reset status values
            document.getElementById('cpuTemp').textContent = '40°C';
            document.getElementById('cpuTemp').style.color = '';
            document.getElementById('securityStatus').textContent = 'Protected';
            document.getElementById('securityStatus').style.color = '';
            document.getElementById('systemLoad').textContent = '10%';
            document.getElementById('systemLoad').style.color = '';
            document.getElementById('maintenanceStatus').textContent = 'Good';
            document.getElementById('maintenanceStatus').style.color = '';
            
            // Reset all keys
            const keys = document.querySelectorAll('.key');
            keys.forEach(key => {
                key.style.animation = '';
                key.style.transform = '';
                const keyText = key.textContent;
                if (!key.classList.contains('key-space') && 
                    !key.classList.contains('key-enter') && 
                    !key.classList.contains('key-backspace') &&
                    !key.classList.contains('key-windows') &&
                    !key.classList.contains('key-function')) {
                    if (keyText.length === 1 && /[A-Z]/.test(keyText)) {
                        key.style.background = 'linear-gradient(145deg, #2c3e50, #1a252f)';
                    } else {
                        key.style.background = 'linear-gradient(145deg, #333, #222)';
                    }
                }
            });
            
            // Reset mouse buttons
            const mouseButtons = document.querySelectorAll('.mouse-button');
            mouseButtons.forEach(button => {
                button.style.animation = '';
                button.style.background = 'linear-gradient(135deg, #1a252f, #2c3e50)';
            });
            
            // Clear any active intervals
            if (currentAnimation) {
                clearInterval(currentAnimation);
                currentAnimation = null;
            }
            
            if (virusInterval) {
                clearInterval(virusInterval);
                virusInterval = null;
            }
        }

        function simulatePowerButton() {
            const cpuPower = document.getElementById('cpuPower');
            cpuPower.style.animation = 'keyPress 0.2s';
            cpuPower.style.background = '#f39c12';
            
            setTimeout(() => {
                cpuPower.style.background = '#27ae60';
                cpuPower.style.animation = '';
            }, 200);
            
            document.getElementById('screenMessage').textContent = 'Power button pressed';
            setTimeout(() => {
                document.getElementById('screenMessage').textContent = 'All systems operational';
            }, 1000);
        }

        function simulateMouseClick(button) {
            const mouseButton = button === 'left' ? 
                document.querySelector('.mouse-left') : 
                document.querySelector('.mouse-right');
            
            mouseButton.style.animation = 'pressEffect 0.2s';
            mouseButton.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
            
            setTimeout(() => {
                mouseButton.style.background = 'linear-gradient(135deg, #1a252f, #2c3e50)';
                mouseButton.style.animation = '';
            }, 200);
            
            const clickMessages = ['Mouse clicked', 'Button pressed', 'Input registered'];
            const randomMessage = clickMessages[Math.floor(Math.random() * clickMessages.length)];
            document.getElementById('screenMessage').textContent = randomMessage;
            
            setTimeout(() => {
                document.getElementById('screenMessage').textContent = 'All systems operational';
            }, 1000);
        }

        function animateHitting() {
            const monitor = document.getElementById('monitor');
            const cpu = document.getElementById('cpuReal');
            
            monitor.style.animation = 'shake 0.5s ease-in-out infinite';
            cpu.style.animation = 'shakeComponent 0.5s ease-in-out infinite';
            
            document.getElementById('systemStatus').textContent = 'Danger';
            document.getElementById('systemStatus').style.color = '#e74c3c';
            document.getElementById('screenMessage').textContent = 'Physical impact detected! Hardware damage imminent';
            document.getElementById('statusIndicator').textContent = '⚠ Hardware at Risk';
            document.getElementById('statusIndicator').style.background = 'rgba(231, 76, 60, 0.2)';
            
            currentAnimation = setInterval(() => {
                createImpactParticles();
            }, 300);
            
            document.getElementById('cpuTemp').textContent = '75°C';
            document.getElementById('cpuTemp').style.color = '#e74c3c';
            document.getElementById('systemLoad').textContent = '95%';
            document.getElementById('maintenanceStatus').textContent = 'Critical';
            document.getElementById('maintenanceStatus').style.color = '#e74c3c';
            
            cpu.style.animation += ', heatGlow 1s infinite';
        }

        function createImpactParticles() {
            const monitorRect = document.getElementById('monitor').getBoundingClientRect();
            const cpuRect = document.getElementById('cpuReal').getBoundingClientRect();
            const containerRect = document.querySelector('.desk').getBoundingClientRect();
            
            for (let i = 0; i < 3; i++) {
                const x = monitorRect.left + monitorRect.width/2 - containerRect.left;
                const y = monitorRect.top + monitorRect.height/2 - containerRect.top;
                
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;
                const size = Math.random() * 4 + 2;
                
                const particle = two.makeCircle(x, y, size);
                particle.fill = '#e74c3c';
                particle.noStroke();
                
                animationElements.push(particle);
                
                let life = 30;
                const update = () => {
                    particle.translation.x += Math.cos(angle) * speed;
                    particle.translation.y += Math.sin(angle) * speed;
                    particle.opacity -= 0.03;
                    life--;
                    
                    if (life > 0) {
                        requestAnimationFrame(update);
                    } else {
                        two.remove(particle);
                        const index = animationElements.indexOf(particle);
                        if (index > -1) animationElements.splice(index, 1);
                    }
                };
                
                update();
            }
        }

        function animateEating() {
            const keyboard = document.getElementById('keyboardReal');
            const keyboardRect = keyboard.getBoundingClientRect();
            const containerRect = document.querySelector('.desk').getBoundingClientRect();
            
            // Stop any existing animation
            if (currentAnimation) {
                clearInterval(currentAnimation);
            }
            
            currentAnimation = setInterval(() => {
                // Create food crumb element - falling near keyboard
                const crumb = document.createElement('div');
                crumb.className = 'crumb';
                
                // Random starting position above keyboard area
                const keyboardLeft = keyboardRect.left - containerRect.left;
                const startX = keyboardLeft + Math.random() * keyboardRect.width;
                const startY = -20;
                
                crumb.style.left = `${startX}px`;
                crumb.style.top = `${startY}px`;
                crumb.style.width = `${Math.random() * 10 + 6}px`;
                crumb.style.height = crumb.style.width;
                
                // Random food color (realistic colors)
                const colors = ['#d35400', '#e67e22', '#f39c12', '#c0392b', '#27ae60', '#f1c40f'];
                crumb.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Random animation duration and end position (near keyboard)
                const duration = Math.random() * 2 + 1.5;
                const endY = keyboardRect.top - containerRect.top + Math.random() * keyboardRect.height;
                crumb.style.animation = `crumbFall ${duration}s linear forwards`;
                
                document.getElementById('animationContainer').appendChild(crumb);
                
                // Remove after animation completes
                setTimeout(() => {
                    if (crumb.parentNode) {
                        crumb.parentNode.removeChild(crumb);
                    }
                }, duration * 1000);
                
            }, 400); // Faster crumb generation
            
            document.getElementById('screenMessage').textContent = 'Food particles detected on components';
            document.getElementById('statusIndicator').textContent = '⚠ Contamination Risk';
            document.getElementById('statusIndicator').style.background = 'rgba(243, 156, 18, 0.2)';
            
            document.getElementById('maintenanceStatus').textContent = 'Required';
            document.getElementById('maintenanceStatus').style.color = '#f39c12';
        }

        function animateMouse() {
            const mouse = document.getElementById('mouseReal');
            const mouseBody = document.querySelector('.mouse-body');
            let clickCount = 0;
            
            currentAnimation = setInterval(() => {
                mouse.style.animation = 'shakeComponent 0.2s';
                
                if (clickCount % 3 === 0) {
                    createMouseClickEffect();
                }
                
                const mouseButtons = document.querySelectorAll('.mouse-button');
                mouseButtons.forEach(button => {
                    button.style.animation = 'pressEffect 0.1s';
                    button.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
                    
                    setTimeout(() => {
                        button.style.background = 'linear-gradient(135deg, #1a252f, #2c3e50)';
                        button.style.animation = '';
                    }, 100);
                });
                
                mouseBody.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
                
                setTimeout(() => {
                    mouseBody.style.background = 'linear-gradient(135deg, #34495e, #2c3e50)';
                }, 100);
                
                clickCount++;
                
                if (clickCount > 30) {
                    clearInterval(currentAnimation);
                    mouse.style.animation = '';
                    currentAnimation = null;
                }
            }, 200);
            
            document.getElementById('screenMessage').textContent = 'Excessive force detected on mouse';
            document.getElementById('statusIndicator').textContent = '⚠ Hardware Stress';
            document.getElementById('statusIndicator').style.background = 'rgba(231, 76, 60, 0.2)';
            
            document.getElementById('maintenanceStatus').textContent = 'Urgent';
            document.getElementById('maintenanceStatus').style.color = '#e74c3c';
        }

        function createMouseClickEffect() {
            const mouse = document.getElementById('mouseReal');
            const mouseRect = mouse.getBoundingClientRect();
            const containerRect = document.querySelector('.desk').getBoundingClientRect();
            
            const x = mouseRect.left + mouseRect.width/2 - containerRect.left;
            const y = mouseRect.top + mouseRect.height/2 - containerRect.top;
            
            const ring = two.makeCircle(x, y, 12);
            ring.noFill();
            ring.stroke = '#e74c3c';
            ring.linewidth = 2;
            
            animationElements.push(ring);
            
            let scale = 1;
            const animateRing = () => {
                scale += 0.2;
                ring.scale = scale;
                ring.opacity -= 0.05;
                
                if (ring.opacity > 0) {
                    requestAnimationFrame(animateRing);
                } else {
                    two.remove(ring);
                    const index = animationElements.indexOf(ring);
                    if (index > -1) animationElements.splice(index, 1);
                }
            };
            
            animateRing();
        }

        function animateKeyboard() {
            const keyboard = document.getElementById('keyboardReal');
            const keys = document.querySelectorAll('.key');
            let pressCount = 0;
            
            currentAnimation = setInterval(() => {
                keyboard.style.animation = 'keyPress 0.1s, pressEffect 0.1s';
                
                for (let i = 0; i < 3; i++) {
                    const randomKey = keys[Math.floor(Math.random() * keys.length)];
                    randomKey.style.animation = 'keyPress 0.1s';
                    randomKey.style.background = 'linear-gradient(145deg, #e74c3c, #c0392b)';
                    
                    setTimeout(() => {
                        const keyText = randomKey.textContent;
                        if (!randomKey.classList.contains('key-space') && 
                            !randomKey.classList.contains('key-enter') && 
                            !randomKey.classList.contains('key-backspace') &&
                            !randomKey.classList.contains('key-windows') &&
                            !randomKey.classList.contains('key-function')) {
                            if (keyText.length === 1 && /[A-Z]/.test(keyText)) {
                                randomKey.style.background = 'linear-gradient(145deg, #2c3e50, #1a252f)';
                            } else {
                                randomKey.style.background = 'linear-gradient(145deg, #333, #222)';
                            }
                        }
                        randomKey.style.animation = '';
                    }, 100);
                }
                
                if (Math.random() > 0.8) {
                    const randomKey = keys[Math.floor(Math.random() * keys.length)];
                    createFlyingKeycap(randomKey.textContent);
                }
                
                pressCount++;
                
                if (pressCount > 20) {
                    clearInterval(currentAnimation);
                    keyboard.style.animation = '';
                    currentAnimation = null;
                }
            }, 300);
            
            document.getElementById('screenMessage').textContent = 'Excessive force on keyboard detected';
            document.getElementById('statusIndicator').textContent = '⚠ Key Damage';
            document.getElementById('statusIndicator').style.background = 'rgba(231, 76, 60, 0.2)';
            
            document.getElementById('maintenanceStatus').textContent = 'Critical';
            document.getElementById('maintenanceStatus').style.color = '#e74c3c';
        }

        function createFlyingKeycap(keyLabel) {
            const keyboard = document.getElementById('keyboardReal');
            const keyboardRect = keyboard.getBoundingClientRect();
            const containerRect = document.querySelector('.desk').getBoundingClientRect();
            
            const x = keyboardRect.left + keyboardRect.width/2 - containerRect.left;
            const y = keyboardRect.top + keyboardRect.height/2 - containerRect.top;
            
            const keycap = two.makeRoundedRectangle(x, y, 20, 16, 3);
            keycap.fill = '#222';
            keycap.stroke = '#444';
            keycap.linewidth = 1;
            
            const labelText = keyLabel || 'K';
            const label = two.makeText(labelText, x, y);
            label.fill = 'white';
            label.size = 8;
            label.weight = 'bold';
            
            animationElements.push(keycap, label);
            
            let angle = Math.random() * Math.PI * 2;
            let speedX = Math.cos(angle) * 2;
            let speedY = -Math.abs(Math.sin(angle)) * 3;
            let rotationSpeed = Math.random() * 0.2 - 0.1;
            
            const animateKeycap = () => {
                keycap.translation.x += speedX;
                keycap.translation.y += speedY;
                label.translation.x += speedX;
                label.translation.y += speedY;
                
                keycap.rotation += rotationSpeed;
                label.rotation += rotationSpeed;
                
                speedY += 0.1;
                speedX *= 0.98;
                
                if (keycap.translation.y < containerRect.height + 100) {
                    requestAnimationFrame(animateKeycap);
                } else {
                    two.remove(keycap);
                    two.remove(label);
                    const keycapIndex = animationElements.indexOf(keycap);
                    const labelIndex = animationElements.indexOf(label);
                    if (keycapIndex > -1) animationElements.splice(keycapIndex, 1);
                    if (labelIndex > -1) animationElements.splice(labelIndex, 1);
                }
            };
            
            animateKeycap();
        }

        function animateShutdown() {
            const screen = document.querySelector('.screen-content');
            const cpuPower = document.getElementById('cpuPower');
            let flickerCount = 0;
            
            currentAnimation = setInterval(() => {
                flickerCount++;
                
                if (flickerCount <= 10) {
                    screen.style.opacity = flickerCount % 2 === 0 ? '0.3' : '1';
                    cpuPower.style.background = flickerCount % 2 === 0 ? '#e74c3c' : '#27ae60';
                    
                    document.getElementById('screenMessage').textContent = 
                        flickerCount % 2 === 0 ? 'System shutting down...' : 'Abnormal termination detected';
                } else if (flickerCount === 11) {
                    screen.style.opacity = '0.1';
                    cpuPower.style.background = '#e74c3c';
                    document.getElementById('screenMessage').textContent = 'System powered off abruptly';
                    document.getElementById('systemStatus').textContent = 'Offline';
                    
                    createPowerSurge();
                } else if (flickerCount > 20) {
                    clearInterval(currentAnimation);
                    currentAnimation = null;
                    setTimeout(() => {
                        screen.style.opacity = '1';
                        cpuPower.style.background = '#27ae60';
                        document.getElementById('systemStatus').textContent = 'Recovering';
                        document.getElementById('screenMessage').textContent = 'System recovering from improper shutdown';
                    }, 1000);
                }
            }, 300);
            
            document.getElementById('systemStatus').textContent = 'Warning';
            document.getElementById('systemStatus').style.color = '#f39c12';
            document.getElementById('statusIndicator').textContent = '⚠ Power Issue';
            document.getElementById('statusIndicator').style.background = 'rgba(243, 156, 18, 0.2)';
            
            document.getElementById('cpuTemp').textContent = '75°C';
            document.getElementById('cpuTemp').style.color = '#e74c3c';
            document.getElementById('systemLoad').textContent = '95%';
            document.getElementById('systemLoad').style.color = '#e74c3c';
        }

        function createPowerSurge() {
            const cpu = document.getElementById('cpuReal');
            const cpuRect = cpu.getBoundingClientRect();
            const containerRect = document.querySelector('.desk').getBoundingClientRect();
            
            const x = cpuRect.left + cpuRect.width/2 - containerRect.left;
            const y = cpuRect.top + cpuRect.height/2 - containerRect.top;
            
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 80 + 30;
                const duration = Math.random() * 20 + 10;
                
                const surge = two.makeLine(x, y, 
                    x + Math.cos(angle) * distance, 
                    y + Math.sin(angle) * distance);
                surge.stroke = '#f1c40f';
                surge.linewidth = 2;
                surge.opacity = 0.7;
                
                animationElements.push(surge);
                
                let progress = 0;
                const animateSurge = () => {
                    progress++;
                    surge.opacity -= 0.05;
                    
                    if (progress < duration) {
                        requestAnimationFrame(animateSurge);
                    } else {
                        two.remove(surge);
                        const index = animationElements.indexOf(surge);
                        if (index > -1) animationElements.splice(index, 1);
                    }
                };
                
                animateSurge();
            }
        }

        function animateDust() {
            const deskRect = document.querySelector('.desk').getBoundingClientRect();
            const cpu = document.getElementById('cpuReal');
            
            // Stop any existing animation
            if (currentAnimation) {
                clearInterval(currentAnimation);
            }
            
            currentAnimation = setInterval(() => {
                // Create dust particles
                for (let i = 0; i < 3; i++) {
                    const dust = document.createElement('div');
                    dust.className = 'dust-particle';
                    
                    // Random starting position at top of desk
                    const startX = Math.random() * deskRect.width;
                    
                    dust.style.left = `${startX}px`;
                    dust.style.top = `-10px`;
                    dust.style.width = `${Math.random() * 6 + 2}px`;
                    dust.style.height = dust.style.width;
                    dust.style.opacity = Math.random() * 0.5 + 0.3;
                    dust.style.backgroundColor = `rgba(189, 195, 199, ${Math.random() * 0.5 + 0.3})`;
                    
                    // Random animation duration
                    const duration = Math.random() * 5 + 3;
                    dust.style.animation = `dustFall ${duration}s linear forwards`;
                    
                    document.getElementById('animationContainer').appendChild(dust);
                    
                    // Remove after animation completes
                    setTimeout(() => {
                        if (dust.parentNode) {
                            dust.parentNode.removeChild(dust);
                        }
                    }, duration * 1000);
                }
                
            }, 500);
            
            // Add dust layer to components
            setTimeout(() => {
                createDustLayer('cpuReal');
                createDustLayer('keyboardReal');
                createDustLayer('mouseReal');
            }, 1000);
            
            document.getElementById('screenMessage').textContent = 'Dust accumulation detected. Overheating risk!';
            document.getElementById('statusIndicator').textContent = '⚠ Cooling Impaired';
            document.getElementById('statusIndicator').style.background = 'rgba(230, 126, 34, 0.2)';
            
            document.getElementById('cpuTemp').textContent = '85°C';
            document.getElementById('cpuTemp').style.color = '#e74c3c';
            document.getElementById('systemLoad').textContent = '70%';
            document.getElementById('maintenanceStatus').textContent = 'Required';
            document.getElementById('maintenanceStatus').style.color = '#f39c12';
            
            cpu.style.animation = 'pulseGlow 1s infinite';
            
            const cpuVents = document.querySelectorAll('.cpu-vent-slot');
            cpuVents.forEach(vent => {
                vent.style.background = '#95a5a6';
            });
        }

        function createDustLayer(elementId) {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            const dustLayer = document.createElement('div');
            dustLayer.style.position = 'absolute';
            dustLayer.style.top = '0';
            dustLayer.style.left = '0';
            dustLayer.style.width = '100%';
            dustLayer.style.height = '100%';
            dustLayer.style.background = 'rgba(148, 163, 184, 0.2)';
            dustLayer.style.borderRadius = 'inherit';
            dustLayer.style.pointerEvents = 'none';
            dustLayer.style.zIndex = '1';
            
            element.appendChild(dustLayer);
            
            setTimeout(() => {
                if (dustLayer.parentNode) {
                    dustLayer.parentNode.removeChild(dustLayer);
                }
            }, 5000);
        }

        function animateMalware() {
            const screenContent = document.querySelector('.screen-content');
            const screenRect = screenContent.getBoundingClientRect();
            
            // Update screen message
            let messageIndex = 0;
            const messages = [
                "VIRUS DETECTED!",
                "System compromised",
                "Data breach in progress",
                "Security compromised",
                "Malware active"
            ];
            
            // Create viruses directly on the monitor screen
            for (let i = 0; i < 6; i++) {
                createScreenVirus(screenContent, screenRect);
            }
            
            // Stop any existing animation
            if (currentAnimation) {
                clearInterval(currentAnimation);
            }
            
            currentAnimation = setInterval(() => {
                document.getElementById('screenMessage').textContent = messages[messageIndex];
                document.getElementById('systemStatus').textContent = 'DANGER';
                document.getElementById('systemStatus').style.color = '#e74c3c';
                document.getElementById('statusIndicator').textContent = '✗ HACKED';
                document.getElementById('statusIndicator').style.background = 'rgba(231, 76, 60, 0.3)';
                
                document.getElementById('statusIndicator').style.opacity = 
                    Math.random() > 0.5 ? '1' : '0.5';
                
                messageIndex = (messageIndex + 1) % messages.length;
                
                // Create more viruses occasionally on screen
                if (Math.random() > 0.6) {
                    createScreenVirus(screenContent, screenRect);
                }
            }, 1000);
            
            // Update status values
            document.getElementById('securityStatus').textContent = 'Compromised';
            document.getElementById('securityStatus').style.color = '#e74c3c';
            document.getElementById('systemLoad').textContent = '100%';
            document.getElementById('systemLoad').style.color = '#e74c3c';
            document.getElementById('cpuTemp').textContent = '90°C';
            document.getElementById('cpuTemp').style.color = '#e74c3c';
            document.getElementById('maintenanceStatus').textContent = 'EMERGENCY';
            document.getElementById('maintenanceStatus').style.color = '#e74c3c';
            
            // Create more screen viruses periodically
            virusInterval = setInterval(() => {
                createScreenVirus(screenContent, screenRect);
            }, 1500);
        }

        function createScreenVirus(screenContent, screenRect) {
            const virus = document.createElement('div');
            virus.className = 'screen-virus';
            
            const size = Math.random() * 30 + 20;
            const startX = Math.random() * (screenRect.width - size);
            const startY = Math.random() * (screenRect.height - size);
            
            virus.style.position = 'absolute';
            virus.style.left = `${startX}px`;
            virus.style.top = `${startY}px`;
            virus.style.width = `${size}px`;
            virus.style.height = `${size}px`;
            
            // Random animation duration
            const duration = Math.random() * 3 + 2;
            virus.style.animation = `virusFloat ${duration}s infinite ease-in-out`;
            
            // Create virus-like appearance with danger symbols
            const virusIcons = ['☠', '⚠', '✗', '☣', '⚠', '✗'];
            const randomIcon = virusIcons[Math.floor(Math.random() * virusIcons.length)];
            
            virus.innerHTML = `
                <div style="width:100%;height:100%;position:relative;">
                    <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(231, 76, 60, 0.7);border-radius:50%;border:3px solid #fff;"></div>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);color:white;font-weight:bold;font-size:${size/1.5}px;">${randomIcon}</div>
                </div>
            `;
            
            screenContent.appendChild(virus);
            
            // Remove after random time
            setTimeout(() => {
                if (virus.parentNode) {
                    virus.parentNode.removeChild(virus);
                }
            }, Math.random() * 8000 + 4000);
        }

        // Add responsive resize handler
        function handleResize() {
            // Update Two.js canvas size
            if (two) {
                const canvas = document.getElementById('simulationCanvas');
                two.width = canvas.parentElement.clientWidth;
                two.height = canvas.parentElement.clientHeight;
                two.render();
            }
            
            // Clear any active animations on significant resize
            clearAnimation();
        }

        // Initialize when page loads
        window.addEventListener('DOMContentLoaded', () => {
            initTwoJS();
            
            // Add resize handler
            window.addEventListener('resize', handleResize);
            
            // Initial call to set correct sizes
            handleResize();
        });

        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            if (demoInterval) {
                clearInterval(demoInterval);
            }
            if (virusInterval) {
                clearInterval(virusInterval);
            }
            if (currentAnimation) {
                clearInterval(currentAnimation);
            }
            window.removeEventListener('resize', handleResize);
        });