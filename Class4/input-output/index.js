
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function () {
            console.log('DOM loaded - initializing computer simulation');
            
            // Initialize all variables
            let activeComponent = 'cpu';
            let isSystemOn = true;
            let isCpuPowered = false;
            let volumeLevel = 50;
            let currentTypedText = '';
            let isMonitorActive = false;
            let isMonitorShowingDesktop = false;
            
            // Get all DOM elements
            const componentButtons = document.querySelectorAll('.component-btn');
            const powerButton = document.getElementById('powerButton');
            const cpuPowerLight = document.getElementById('cpuPowerLight');
            const cpuPowerBtn = document.getElementById('cpuPowerBtn');
            const screenContent = document.getElementById('screenContent');
            const keyboardKeys = document.getElementById('keyboardKeys');
            const mouseBlinker = document.getElementById('mouseBlinker');
            const volumeUpBtn = document.getElementById('volumeUpBtn');
            const volumeDownBtn = document.getElementById('volumeDownBtn');
            const virtualKeyboard = document.getElementById('virtualKeyboard');
            const closeVirtualKeyboard = document.getElementById('closeVirtualKeyboard');
            const virtualKeyboardKeys = document.getElementById('virtualKeyboardKeys');
            const typedText = document.getElementById('typedText');
            const selectedComponentSpan = document.getElementById('selectedComponent');
            const systemStatusSpan = document.getElementById('systemStatus');
            const cpuPowerStatusSpan = document.getElementById('cpuPowerStatus');
            
            // Store component elements
            const desktopComponents = {
                'cpu': document.getElementById('cpuComponent'),
                'monitor': document.getElementById('monitorComponent'),
                'keyboard': document.getElementById('keyboardComponent'),
                'mouse': document.getElementById('mouseComponent'),
                'speakers': document.getElementById('speakerComponent')
            };
            
            // Initialize the simulation
            function initializeSimulation() {
                console.log('Initializing simulation...');
                
                // Create keyboard keys
                createKeyboardKeys();
                createVirtualKeyboardKeys();
                
                // Update mouse blinker
                updateMouseBlinker();
                
                // Initialize with CPU highlighted
                highlightComponent('cpu');
                updateStatusPanel('cpu');
                
                // Add event listeners
                setupEventListeners();
                
                console.log('Simulation initialized successfully');
            }
            
            // Setup all event listeners
            function setupEventListeners() {
                // Component button clicks
                componentButtons.forEach(button => {
                    button.addEventListener('click', function () {
                        const component = this.getAttribute('data-component');
                        selectComponentFromButton(component);
                    });
                });
                
                // Monitor click
                desktopComponents.monitor.addEventListener('click', function() {
                    handleMonitorClick();
                });
                
                // Keyboard click
                desktopComponents.keyboard.addEventListener('click', function() {
                    handleKeyboardClick();
                });
                
                // Close virtual keyboard
                closeVirtualKeyboard.addEventListener('click', function() {
                    virtualKeyboard.style.display = 'none';
                });
                
                // System power button
                powerButton.addEventListener('click', function () {
                    toggleSystemPower();
                });
                
                // CPU power button
                cpuPowerBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    toggleCpuPower();
                });
                
                // Volume controls
                volumeUpBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    adjustVolume(10);
                });
                
                volumeDownBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    adjustVolume(-10);
                });
                
                // Component clicks in visualization
                desktopComponents.cpu.addEventListener('click', () => selectComponent('cpu'));
                desktopComponents.speakers.addEventListener('click', () => selectComponent('speakers'));
                desktopComponents.mouse.addEventListener('click', () => selectComponent('mouse'));
                
                // Escape key to close virtual keyboard
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        virtualKeyboard.style.display = 'none';
                    }
                });
            }
            
            // Component selection from button
            function selectComponentFromButton(component) {
                // Update active button
                componentButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelector(`.btn-${component}`).classList.add('active');
                
                // Highlight the component
                highlightComponent(component);
                updateStatusPanel(component);
                
                // Store active component
                activeComponent = component;
                
                // Keep monitor screen visible if CPU is on
                if (isCpuPowered && component !== 'monitor') {
                    maintainMonitorDisplay();
                }
            }
            
            // Handle monitor click
            function handleMonitorClick() {
                if (!isSystemOn) {
                    showNotification('System is unplugged. Plug in system first.', 'error');
                    return;
                }
                
                if (!isCpuPowered) {
                    showNotification('CPU is powered off. Power on CPU first.', 'error');
                    return;
                }
                
                // Highlight the monitor
                highlightComponent('monitor');
                updateStatusPanel('monitor');
                activeComponent = 'monitor';
                
                // Update control panel button
                componentButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelector('.btn-monitor').classList.add('active');
                
                // Show desktop simulation
                showDesktopSimulation();
                isMonitorShowingDesktop = true;
                
                showNotification('Desktop Simulation Activated', 'info');
            }
            
            // Handle keyboard click
            function handleKeyboardClick() {
                if (!isSystemOn) {
                    showNotification('System is unplugged. Plug in system first.', 'error');
                    return;
                }
                
                // Highlight the keyboard
                highlightComponent('keyboard');
                updateStatusPanel('keyboard');
                activeComponent = 'keyboard';
                
                // Update control panel button
                componentButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelector('.btn-keyboard').classList.add('active');
                
                // Show the virtual keyboard
                virtualKeyboard.style.display = 'block';
                
                // Keep monitor screen visible
                maintainMonitorDisplay();
                
                showNotification('Virtual Keyboard Activated', 'info');
            }
            
            // Toggle system power
            function toggleSystemPower() {
                isSystemOn = !isSystemOn;
                
                if (isSystemOn) {
                    powerButton.classList.remove('off');
                    powerButton.innerHTML = '<i class="fas fa-power-off"></i><span>Plugged In</span>';
                    systemStatusSpan.textContent = 'ON';
                    systemStatusSpan.style.color = '#10b981';
                    
                    // Re-highlight the active component
                    highlightComponent(activeComponent);
                    
                    showNotification('System plugged in', 'success');
                } else {
                    powerButton.classList.add('off');
                    powerButton.innerHTML = '<i class="fas fa-power-off"></i><span>Plugged Out</span>';
                    systemStatusSpan.textContent = 'OFF';
                    systemStatusSpan.style.color = '#ef4444';
                    
                    // Turn off CPU if system is unplugged
                    isCpuPowered = false;
                    cpuPowerLight.classList.remove('on');
                    cpuPowerStatusSpan.textContent = 'OFF';
                    cpuPowerStatusSpan.style.color = '#ef4444';
                    
                    // Clear monitor display when system is unplugged
                    clearMonitorDisplay();
                    
                    // Reset monitor states
                    isMonitorActive = false;
                    isMonitorShowingDesktop = false;
                    
                    // Remove highlights from all components
                    removeAllHighlights();
                    
                    // Close virtual keyboard
                    virtualKeyboard.style.display = 'none';
                    
                    showNotification('System unplugged', 'error');
                }
                
                // Update mouse blinker based on system state
                updateMouseBlinker();
            }
            
            // Toggle CPU power
            function toggleCpuPower() {
                if (!isSystemOn) {
                    showNotification('System is unplugged. Plug in system first.', 'error');
                    return;
                }
                
                isCpuPowered = !isCpuPowered;
                
                if (isCpuPowered) {
                    cpuPowerLight.classList.add('on');
                    cpuPowerStatusSpan.textContent = 'ON';
                    cpuPowerStatusSpan.style.color = '#10b981';
                    
                    // Automatically activate and highlight the monitor
                    activateMonitorOnCpuPowerOn();
                    
                    showNotification('CPU powered ON - Monitor activated', 'success');
                } else {
                    cpuPowerLight.classList.remove('on');
                    cpuPowerStatusSpan.textContent = 'OFF';
                    cpuPowerStatusSpan.style.color = '#ef4444';
                    
                    // Clear monitor display when CPU is turned off
                    clearMonitorDisplay();
                    
                    // Reset monitor states
                    isMonitorActive = false;
                    isMonitorShowingDesktop = false;
                    
                    showNotification('CPU powered OFF', 'error');
                }
                
                // Update mouse blinker
                updateMouseBlinker();
            }
            
            // Adjust volume
            function adjustVolume(amount) {
                if (!isSystemOn) {
                    showNotification('System is unplugged. Plug in system first.', 'error');
                    return;
                }
                
                volumeLevel = Math.max(0, Math.min(100, volumeLevel + amount));
                showNotification(`Volume ${amount > 0 ? 'increased' : 'decreased'} to ${volumeLevel}%`, 'info');
                showVolumeVisualization();
            }
            
            // Function to automatically activate monitor when CPU is powered on
            function activateMonitorOnCpuPowerOn() {
                // Set monitor as active component
                activeComponent = 'monitor';
                isMonitorActive = true;
                
                // Update control panel button
                componentButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelector('.btn-monitor').classList.add('active');
                
                // Highlight the monitor
                highlightComponent('monitor');
                updateStatusPanel('monitor');
                
                // Show monitor power on sequence
                showMonitorPowerOn();
            }
            
            // Function to maintain monitor display when clicking other components
            function maintainMonitorDisplay() {
                if (isCpuPowered && isMonitorActive) {
                    if (isMonitorShowingDesktop) {
                        // If desktop was showing, keep it showing
                        showDesktopSimulation();
                    } else {
                        // Otherwise show default screen
                        showMonitorDefaultScreen();
                    }
                    
                    // Ensure screen content is visible
                    screenContent.style.opacity = '1';
                }
            }
            
            // Update mouse blinker
            function updateMouseBlinker() {
                if (isSystemOn && isCpuPowered) {
                    mouseBlinker.classList.add('active');
                } else {
                    mouseBlinker.classList.remove('active');
                }
            }
            
            // Highlight a component
            function highlightComponent(component) {
                if (!isSystemOn && component !== 'cpu') {
                    showNotification('System is unplugged. Plug in system first.', 'error');
                    return;
                }
                
                // Remove highlight from all components first
                removeAllHighlights();
                
                // Add specific glow class based on component
                const componentElement = desktopComponents[component];
                if (componentElement) {
                    componentElement.classList.add(`glow-${component}`);
                    
                    // Show component specific effects
                    if (component === 'speakers') {
                        showAudioVisualization();
                    } else if (component === 'cpu') {
                        // Only show CPU activity if powered on
                        if (isCpuPowered) {
                            showCpuActivity();
                        }
                    } else if (component === 'monitor') {
                        // Show monitor display based on CPU power status
                        if (isCpuPowered) {
                            if (isMonitorActive) {
                                if (isMonitorShowingDesktop) {
                                    showDesktopSimulation();
                                } else {
                                    showMonitorDefaultScreen();
                                }
                            } else {
                                showMonitorDefaultScreen();
                            }
                        } else {
                            showMonitorNoSignal();
                        }
                    } else if (component === 'keyboard') {
                        showKeyboardEffect();
                    } else if (component === 'mouse') {
                        showMouseEffect();
                    }
                }
            }
            
            // Remove all highlights
            function removeAllHighlights() {
                Object.keys(desktopComponents).forEach(key => {
                    const component = desktopComponents[key];
                    if (component && component.classList) {
                        component.classList.remove('glow-cpu', 'glow-monitor', 'glow-keyboard', 'glow-mouse', 'glow-speakers');
                    }
                });
                
                // Reset mouse blinker animation
                mouseBlinker.style.animation = '';
                updateMouseBlinker();
                
                // Clear any special effects EXCEPT monitor display
                clearAudioVisualization();
                clearCpuActivity();
                clearKeyboardEffect();
                clearMouseEffect();
            }
            
            // Update status panel
            function updateStatusPanel(component) {
                selectedComponentSpan.textContent = component.toUpperCase();
            }
            
            // Create keyboard keys
            function createKeyboardKeys() {
                const keyLayout = [
                    ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PrtSc', 'ScrLk', 'Pause'],
                    ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace wide'],
                    ['Tab wide', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
                    ['Caps shift', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter enter'],
                    ['Shift shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift shift'],
                    ['Ctrl', 'Win', 'Alt', 'Space space', 'Alt', 'Win', 'Menu', 'Ctrl']
                ];
                
                keyboardKeys.innerHTML = '';
                
                keyLayout.forEach(row => {
                    row.forEach(keyInfo => {
                        const key = document.createElement('div');
                        const keyParts = keyInfo.split(' ');
                        const keyLabel = keyParts[0];
                        const keyClass = keyParts[1] || '';
                        
                        key.className = `key ${keyClass}`;
                        key.textContent = keyLabel;
                        key.setAttribute('data-key', keyLabel);
                        
                        // Add click effect
                        key.addEventListener('mousedown', function () {
                            this.classList.add('active');
                            this.style.transform = 'scale(0.95)';
                            
                            if (keyLabel === 'Space') {
                                showNotification(`Space bar pressed`, 'info');
                            } else if (keyLabel === 'Enter') {
                                showNotification(`Enter key pressed`, 'info');
                            } else if (keyLabel === 'Esc') {
                                showNotification(`Escape key pressed`, 'info');
                            } else {
                                showNotification(`Key pressed: ${keyLabel}`, 'info');
                            }
                        });
                        
                        key.addEventListener('mouseup', function () {
                            setTimeout(() => {
                                this.classList.remove('active');
                            }, 200);
                            this.style.transform = 'scale(1)';
                        });
                        
                        key.addEventListener('mouseleave', function () {
                            this.classList.remove('active');
                            this.style.transform = 'scale(1)';
                            this.style.background = 'linear-gradient(to bottom, #444, #333)';
                        });
                        
                        keyboardKeys.appendChild(key);
                    });
                });
            }
            
            // Create virtual keyboard keys
            function createVirtualKeyboardKeys() {
                const keyLayout = [
                    ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PrtSc', 'ScrLk', 'Pause'],
                    ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace wide'],
                    ['Tab wide', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
                    ['Caps shift', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter enter'],
                    ['Shift shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift shift'],
                    ['Ctrl special', 'Win special', 'Alt special', 'Space space', 'Alt special', 'Win special', 'Menu special', 'Ctrl special']
                ];
                
                virtualKeyboardKeys.innerHTML = '';
                
                keyLayout.forEach(row => {
                    row.forEach(keyInfo => {
                        const key = document.createElement('div');
                        const keyParts = keyInfo.split(' ');
                        const keyLabel = keyParts[0];
                        const keyClass = keyParts[1] || '';
                        
                        key.className = `virtual-key ${keyClass}`;
                        key.textContent = keyLabel;
                        key.setAttribute('data-key', keyLabel);
                        
                        // Add click event for typing
                        key.addEventListener('click', function () {
                            if (keyLabel === 'Backspace') {
                                currentTypedText = currentTypedText.slice(0, -1);
                            } else if (keyLabel === 'Space') {
                                currentTypedText += ' ';
                            } else if (keyLabel === 'Enter') {
                                currentTypedText += '\n';
                            } else if (keyLabel === 'Tab') {
                                currentTypedText += '\t';
                            } else if (!keyLabel.includes('F') && !['Esc', 'PrtSc', 'ScrLk', 'Pause', 'Ctrl', 'Win', 'Alt', 'Menu', 'Shift', 'Caps'].includes(keyLabel)) {
                                currentTypedText += keyLabel;
                            }
                            
                            // Update the display
                            typedText.textContent = currentTypedText;
                            
                            // Highlight the key briefly
                            this.style.background = 'linear-gradient(to bottom, #7209b7, #5b0588)';
                            setTimeout(() => {
                                this.style.background = '';
                            }, 100);
                        });
                        
                        virtualKeyboardKeys.appendChild(key);
                    });
                });
            }
            
            // Show monitor power on sequence
            function showMonitorPowerOn() {
                const messages = [
                    "SYSTEM INITIALIZING...",
                    "CPU: ACTIVATED",
                    "MEMORY: CHECKING...",
                    "BOOTING DESKTOP SIMULATION...",
                    "DESKTOP SIMULATION READY"
                ];
                
                screenContent.innerHTML = '';
                screenContent.style.opacity = '1';
                screenContent.style.color = '#10b981';
                
                let messageIndex = 0;
                
                function showNextMessage() {
                    if (messageIndex < messages.length) {
                        screenContent.innerHTML = messages[messageIndex];
                        messageIndex++;
                        setTimeout(showNextMessage, 800);
                    } else {
                        setTimeout(() => {
                            showDesktopSimulation();
                            isMonitorShowingDesktop = true;
                        }, 1000);
                    }
                }
                
                showNextMessage();
            }
            
            // Show desktop simulation
            function showDesktopSimulation() {
                const monitorScreen = document.querySelector('.monitor-screen');
                monitorScreen.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
                
                screenContent.innerHTML = `
                    <div class="desktop-background">
                        <!-- Desktop Icons -->
                        <div class="desktop-icon" style="top: 15px; left: 15px;">
                            <i class="fas fa-desktop" style="color: #4cc9f0;"></i>
                            <span>Computer</span>
                        </div>
                        <div class="desktop-icon" style="top: 15px; left: 85px;">
                            <i class="fas fa-folder" style="color: #ff9e00;"></i>
                            <span>Documents</span>
                        </div>
                        <div class="desktop-icon" style="top: 90px; left: 15px;">
                            <i class="fas fa-music" style="color: #f72585;"></i>
                            <span>Music</span>
                        </div>
                        <div class="desktop-icon" style="top: 90px; left: 85px;">
                            <i class="fas fa-image" style="color: #3a86ff;"></i>
                            <span>Pictures</span>
                        </div>
                        <div class="desktop-icon" style="top: 165px; left: 15px;">
                            <i class="fas fa-cog" style="color: #7209b7;"></i>
                            <span>Settings</span>
                        </div>
                        <div class="desktop-icon" style="top: 165px; left: 85px;">
                            <i class="fas fa-globe" style="color: #10b981;"></i>
                            <span>Browser</span>
                        </div>
                        <div class="desktop-icon" style="top: 15px; left: 155px;">
                            <i class="fas fa-gamepad" style="color: #f72585;"></i>
                            <span>Games</span>
                        </div>
                        <div class="desktop-icon" style="top: 90px; left: 155px;">
                            <i class="fas fa-file" style="color: #3a86ff;"></i>
                            <span>Files</span>
                        </div>
                        
                        <!-- Taskbar -->
                        <div class="taskbar">
                            <button class="start-button">
                                <i class="fas fa-play"></i>
                                <span>Start</span>
                            </button>
                            <div class="taskbar-items">
                                <div class="taskbar-item">Desktop Sim</div>
                                <div class="taskbar-item">Components</div>
                                <div class="taskbar-item">Browser</div>
                            </div>
                            <div class="time-display" id="timeDisplay">12:00 PM</div>
                        </div>
                    </div>
                `;
                screenContent.style.opacity = '1';
                
                // Update time
                updateTime();
                setInterval(updateTime, 60000);
            }
            
            // Update time display
            function updateTime() {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                
                const timeDisplay = document.getElementById('timeDisplay');
                if (timeDisplay) {
                    timeDisplay.textContent = `${displayHours}:${minutes} ${ampm}`;
                }
            }
            
            // Show monitor default screen
            function showMonitorDefaultScreen() {
                const monitorScreen = document.querySelector('.monitor-screen');
                monitorScreen.style.background = 'linear-gradient(135deg, #0a0a0a, #1a1a2e)';
                
                screenContent.innerHTML = `
                    <div style="font-size: 1.5rem; margin-bottom: 10px; color: #4cc9f0; text-align: center;">
                        DESKTOP SIMULATION
                    </div>
                    <div style="font-size: 1rem; margin-bottom: 15px; color: #a5b4fc; text-align: center;">
                        CPU: <span style="color: #10b981;">POWERED ON</span>
                    </div>
                    <div style="font-size: 0.9rem; color: #94a3b8; text-align: left; padding: 0 20px;">
                        <div>✓ CPU: <span style="color: #10b981;">ACTIVE</span></div>
                        <div>✓ Monitor: <span style="color: #10b981;">READY</span></div>
                        <div>✓ Keyboard: <span style="color: #10b981;">READY</span></div>
                        <div>✓ Mouse: <span style="color: #10b981;">CONNECTED</span></div>
                        <div>✓ Speaker: <span style="color: #10b981;">AUDIO READY</span></div>
                    </div>
                `;
                screenContent.style.opacity = '1';
            }
            
            // Show no signal on monitor
            function showMonitorNoSignal() {
                const monitorScreen = document.querySelector('.monitor-screen');
                monitorScreen.style.background = '#000';
                screenContent.innerHTML = `
                    <div style="color: #ef4444; font-size: 1.2rem; text-align: center; margin-top: 50px;">
                        NO SIGNAL
                    </div>
                    <div style="color: #94a3b8; font-size: 0.9rem; margin-top: 10px; text-align: center;">
                        CPU is powered off
                    </div>
                `;
                screenContent.style.opacity = '1';
            }
            
            // Clear monitor display
            function clearMonitorDisplay() {
                const monitorScreen = document.querySelector('.monitor-screen');
                monitorScreen.style.background = '#000';
                screenContent.innerHTML = '';
                screenContent.style.opacity = '0';
            }
            
            // Show audio visualization
            function showAudioVisualization() {
                const speakerGrills = document.querySelectorAll('.speaker-grill');
                speakerGrills.forEach(grill => {
                    grill.style.animation = 'speakerPulse 0.8s infinite alternate';
                });
                
                // Add CSS animation if not exists
                if (!document.querySelector('#speakerPulse')) {
                    const style = document.createElement('style');
                    style.id = 'speakerPulse';
                    style.textContent = `
                        @keyframes speakerPulse {
                            from { background: linear-gradient(to right, #3a3a3a, #2a2a2a, #3a3a3a); }
                            to { background: linear-gradient(to right, #4a4a4a, #ff9e00, #4a4a4a); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
            
            // Clear audio visualization
            function clearAudioVisualization() {
                const speakerGrills = document.querySelectorAll('.speaker-grill');
                speakerGrills.forEach(grill => {
                    grill.style.animation = 'none';
                    grill.style.background = 'linear-gradient(to right, #3a3a3a, #2a2a2a, #3a3a3a)';
                });
            }
            
            // Show volume visualization
            function showVolumeVisualization() {
                const speakerGrills = document.querySelectorAll('.speaker-grill');
                speakerGrills.forEach((grill, index) => {
                    const intensity = volumeLevel / 100;
                    
                    // Change color based on volume
                    if (volumeLevel > 70) {
                        grill.style.background = 'linear-gradient(to right, #4a4a4a, #ff9e00, #4a4a4a)';
                    } else if (volumeLevel > 30) {
                        grill.style.background = 'linear-gradient(to right, #4a4a4a, #f59e0b, #4a4a4a)';
                    } else {
                        grill.style.background = 'linear-gradient(to right, #3a3a3a, #2a2a2a, #3a3a3a)';
                    }
                });
            }
            
            // Show CPU activity
            function showCpuActivity() {
                const cpuVents = document.querySelectorAll('.cpu-vent');
                cpuVents.forEach((vent, index) => {
                    setTimeout(() => {
                        vent.style.background = 'rgba(76, 201, 240, 0.8)';
                        setTimeout(() => {
                            vent.style.background = 'rgba(60, 60, 60, 0.8)';
                        }, 300);
                    }, index * 200);
                });
            }
            
            // Clear CPU activity
            function clearCpuActivity() {
                const cpuVents = document.querySelectorAll('.cpu-vent');
                cpuVents.forEach(vent => {
                    vent.style.background = 'rgba(60, 60, 60, 0.8)';
                });
            }
            
            // Show keyboard effect
            function showKeyboardEffect() {
                const keys = document.querySelectorAll('.key');
                keys.forEach((key, index) => {
                    setTimeout(() => {
                        key.style.background = 'linear-gradient(to bottom, #555, #444)';
                        setTimeout(() => {
                            key.style.background = 'linear-gradient(to bottom, #444, #333)';
                        }, 100);
                    }, index * 20);
                });
            }
            
            // Clear keyboard effect
            function clearKeyboardEffect() {
                const keys = document.querySelectorAll('.key');
                keys.forEach(key => {
                    key.classList.remove('active');
                    key.style.background = 'linear-gradient(to bottom, #444, #333)';
                });
            }
            
            // Show mouse effect
            function showMouseEffect() {
                const mouseButton = document.querySelector('.mouse-button');
                mouseButton.style.animation = 'mouseClick 1s infinite';
                
                // Add CSS animation if not exists
                if (!document.querySelector('#mouseClick')) {
                    const style = document.createElement('style');
                    style.id = 'mouseClick';
                    style.textContent = `
                        @keyframes mouseClick {
                            0%, 100% { background: linear-gradient(to bottom, #9ca3af, #6b7280); }
                            50% { background: linear-gradient(to bottom, #d1d5db, #9ca3af); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
            
            // Clear mouse effect
            function clearMouseEffect() {
                const mouseButton = document.querySelector('.mouse-button');
                mouseButton.style.animation = 'none';
                mouseButton.style.background = 'linear-gradient(to bottom, #9ca3af, #6b7280)';
            }
            
            // Select component
            function selectComponent(component) {
                if (component === 'monitor' || component === 'keyboard') {
                    return;
                }
                
                // Update button state
                componentButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelector(`.btn-${component}`).classList.add('active');
                
                // Highlight the component
                highlightComponent(component);
                updateStatusPanel(component);
                
                // Store active component
                activeComponent = component;
                
                // Keep monitor screen visible if CPU is on
                if (isCpuPowered) {
                    maintainMonitorDisplay();
                }
            }
            
            // Show notification
            function showNotification(message, type) {
                // Create notification element
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.textContent = message;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 1000;
                    opacity: 0;
                    transform: translateX(100px);
                    transition: all 0.3s ease;
                    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                `;
                
                document.body.appendChild(notification);
                
                // Animate in
                setTimeout(() => {
                    notification.style.opacity = '1';
                    notification.style.transform = 'translateX(0)';
                }, 10);
                
                // Remove after 3 seconds
                setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transform = 'translateX(100px)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
            }
            
            // Initialize the simulation
            initializeSimulation();
        });