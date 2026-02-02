// ============ CONFIGURATION ============
        const CONFIG = {
            gravity: 9.81,
            springStiffness: 0.8,
            damping: 0.92,
            colors: {
                weight1: '#3498db',
                weight5: '#e74c3c',
                weight10: '#9b59b6',
                weight2: '#2ecc71',
                weight20: '#e67e22'
            }
        };

        // ============ STATE MANAGEMENT ============
        let state = {
            currentExtension: 0,
            springVelocity: 0,
            attachedWeight: null,
            dragTarget: null,
            gravity: CONFIG.gravity,
            springK: CONFIG.springStiffness,
            weights: [],
            lastWeightValue: 0,
            lastMassValue: 0,
            canvasWidth: 600,
            canvasHeight: 600,
            scaleX: 0,
            scaleY: 0,
            floorY: 0
        };

        // ============ RESPONSIVE CANVAS SETUP ============
        const canvas = document.getElementById('simulation-canvas');
        const canvasContainer = canvas.parentElement;

        function updateCanvasSize() {
            const rect = canvasContainer.getBoundingClientRect();
            state.canvasWidth = rect.width;
            state.canvasHeight = rect.height;
            
            // Update scale positions based on canvas size
            state.scaleX = state.canvasWidth / 2;
            state.scaleY = state.canvasHeight * 0.08;
            state.floorY = state.canvasHeight * 0.85;
            
            two.width = state.canvasWidth;
            two.height = state.canvasHeight;
            
            // Update component positions
            updateComponentPositions();
        }

        // ============ TWO.JS SETUP ============
        const two = new Two({
            width: 600,
            height: 600,
            autostart: true
        }).appendTo(canvas);

        // ============ SCALE COMPONENTS ============
        
        // 1. Top Loop
        const topLoop = two.makeCircle(300, 50, 15);
        topLoop.noFill();
        topLoop.stroke = '#555';
        topLoop.linewidth = 4;

        // 2. Main Housing
        const housingGroup = two.makeGroup();

        const casing = two.makeRoundedRectangle(0, 0, 80, 160, 5);
        casing.fill = '#1a1a2e';
        casing.stroke = '#00ffff';
        casing.linewidth = 2;

        const windowCutout = two.makeRoundedRectangle(0, -30, 40, 80, 2);
        windowCutout.fill = 'rgba(0, 255, 255, 0.1)';
        windowCutout.stroke = 'rgba(0, 255, 255, 0.3)';
        
        const screenBezel = two.makeRectangle(0, 50, 60, 30);
        screenBezel.fill = '#0a0a15';
        screenBezel.stroke = '#00ffff';
        
        const lcdScreen = two.makeText("0.0 N", 0, 53);
        lcdScreen.fill = '#00ff00';
        lcdScreen.family = 'Orbitron, monospace';
        lcdScreen.size = 14;

        housingGroup.add(casing, windowCutout, screenBezel, lcdScreen);

        // 3. Spring Mechanism
        const mechanicsGroup = two.makeGroup();

        const springPath = two.makePath(
            0, -60, 
            -10, -50, 10, -40, -10, -30, 10, -20, -10, -10, 
            0, 0
        );
        springPath.noFill();
        springPath.stroke = '#00ffff';
        springPath.linewidth = 2;
        springPath.cap = 'round';
        springPath.join = 'round';

        const rod = two.makeLine(0, 0, 0, 100);
        rod.stroke = '#bdc3c7';
        rod.linewidth = 4;

        const hook = two.makePath(0, 100, 0, 120, -20, 135, -20, 115);
        hook.noFill();
        hook.stroke = '#00ffff';
        hook.linewidth = 3;
        hook.cap = 'round';

        mechanicsGroup.add(springPath, rod, hook);

        function updateComponentPositions() {
            topLoop.translation.set(state.scaleX, state.scaleY);
            housingGroup.translation.set(state.scaleX, state.scaleY + 90);
            mechanicsGroup.translation.set(state.scaleX, state.scaleY + 75);
            
            // Update weights positions
            const weightPositions = [
                state.canvasWidth * 0.15,
                state.canvasWidth * 0.3,
                state.canvasWidth * 0.5,
                state.canvasWidth * 0.7,
                state.canvasWidth * 0.85
            ];
            
            state.weights.forEach((weight, index) => {
                if (!weight.onHook && !weight.isDragging) {
                    weight.startPos.x = weightPositions[index];
                    weight.startPos.y = state.floorY;
                    weight.updatePosition(weight.startPos.x, weight.startPos.y);
                }
            });
        }

        // ============ WEIGHT MANAGEMENT ============
        
        class Weight {
            constructor(mass, index, color) {
                this.mass = mass;
                this.color = color;
                this.group = this.createVisualGroup(100);
                this.isDragging = false;
                this.onHook = false;
                this.startPos = { x: 100, y: 500 };
                state.weights.push(this);
            }

            createVisualGroup(x) {
                const group = two.makeGroup();
                group.translation.set(x, state.floorY);

                const size = 40 + (this.mass * 2);
                const box = two.makeRoundedRectangle(0, 0, size, size, 6);
                box.fill = this.color;
                box.stroke = '#333';
                box.linewidth = 2;

                const handle = two.makePath(-12, -size/2, -12, -size/2 - 18, 
                                            12, -size/2 - 18, 12, -size/2);
                handle.noFill();
                handle.stroke = '#333';
                handle.linewidth = 3;

                const label = two.makeText(`${this.mass} kg`, 0, 5);
                label.fill = 'white';
                label.weight = 'bold';
                label.family = 'Orbitron, monospace';
                label.size = 12;
                
                group.add(handle, box, label);
                return group;
            }

            updatePosition(x, y) {
                this.group.translation.set(x, y);
            }

            reset() {
                this.onHook = false;
                this.isDragging = false;
                this.updatePosition(this.startPos.x, this.startPos.y);
            }
        }

        // Create weights
        const weights = [
            new Weight(1, 0, CONFIG.colors.weight1),
            new Weight(2, 1, CONFIG.colors.weight2),
            new Weight(5, 2, CONFIG.colors.weight5),
            new Weight(10, 3, CONFIG.colors.weight10),
            new Weight(20, 4, CONFIG.colors.weight20)
        ];

        // ============ PHYSICS ENGINE ============
        two.bind('update', function(frameCount) {
            // Calculate target extension based on attached weight
            let targetExt = 0;
            if (state.attachedWeight) {
                const force = state.attachedWeight.mass * state.gravity;
                targetExt = force * state.springK;
            }

            // Spring physics simulation
            const acceleration = (targetExt - state.currentExtension) * 0.1;
            state.springVelocity += acceleration;
            state.springVelocity *= CONFIG.damping;
            state.currentExtension += state.springVelocity;

            // Update graphics
            mechanicsGroup.translation.y = (state.scaleY + 75) + state.currentExtension;
            const stretchFactor = 1 + (state.currentExtension / 100);
            springPath.scale = new Two.Vector(1, stretchFactor);

            // Move attached weight
            if (state.attachedWeight) {
                const weight = state.attachedWeight;
                weight.updatePosition(
                    state.scaleX,
                    mechanicsGroup.translation.y + 120 + 20
                );
            }

            // Update display
            if (frameCount % 3 === 0) {
                updateDisplay();
            }
        });

        function updateDisplay() {
            // Calculate measured force
            let measuredForce = (state.currentExtension / state.springK);
            if (measuredForce < 0.01) measuredForce = 0;

            // Calculate equivalent mass
            let equivalentMass = measuredForce / state.gravity;
            
            // Smooth the display values
            const smoothWeight = smoothValue(measuredForce, state.lastWeightValue);
            const smoothMass = smoothValue(equivalentMass, state.lastMassValue);
            
            state.lastWeightValue = smoothWeight;
            state.lastMassValue = smoothMass;
            
            // Format values
            const displayForce = smoothWeight.toFixed(2);
            const displayMass = smoothMass.toFixed(2);
            
            // Update scale LCD
            lcdScreen.value = `${displayForce} N`;
            
            // Update digital meter
            document.getElementById('weight-value').textContent = displayForce;
            document.getElementById('mass-value').textContent = displayMass;
            
            // Update attached mass
            const currentMass = state.attachedWeight ? state.attachedWeight.mass : 0;
            document.getElementById('attached-mass-value').textContent = 
                currentMass.toFixed(2);
            
            // Update formula
            document.getElementById('formula-display').textContent = 
                `F = ${currentMass.toFixed(2)} kg × ${state.gravity.toFixed(2)} m/s²`;
            
            // Add glow effect when weight > 0
            const weightElement = document.getElementById('weight-value');
            if (smoothWeight > 0.1) {
                weightElement.classList.add('glow');
            } else {
                weightElement.classList.remove('glow');
            }
        }

        // Smoothing function for display values
        function smoothValue(newValue, oldValue) {
            return oldValue + (newValue - oldValue) * 0.3;
        }

        // ============ INTERACTION HANDLERS ============
        
        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function handleStart(e) {
            e.preventDefault();
            const pos = getMousePos(e);
            
            for (const weight of weights) {
                const dx = pos.x - weight.group.translation.x;
                const dy = pos.y - weight.group.translation.y;
                const distanceSquared = dx * dx + dy * dy;
                
                if (distanceSquared < 2500) {
                    state.dragTarget = weight;
                    weight.isDragging = true;
                    
                    if (weight === state.attachedWeight) {
                        state.attachedWeight = null;
                        weight.onHook = false;
                        state.springVelocity -= 5;
                    }
                    break;
                }
            }
        }

        function handleMove(e) {
            if (!state.dragTarget) return;
            e.preventDefault();
            const pos = getMousePos(e);
            state.dragTarget.updatePosition(pos.x, pos.y);
        }

        function handleEnd(e) {
            if (!state.dragTarget) return;
            e.preventDefault();

            const weight = state.dragTarget;
            const hookY = mechanicsGroup.translation.y + 120;
            const dx = Math.abs(weight.group.translation.x - state.scaleX);
            const dy = Math.abs(weight.group.translation.y - hookY);

            if (dx < 60 && dy < 80) {
                // Snap to hook
                if (state.attachedWeight && state.attachedWeight !== weight) {
                    state.attachedWeight.onHook = false;
                    animateDrop(state.attachedWeight);
                }
                state.attachedWeight = weight;
                weight.onHook = true;
                state.springVelocity += 5;
            } else {
                // Drop to floor
                animateDrop(weight);
            }

            weight.isDragging = false;
            state.dragTarget = null;
        }

        // Mouse events
        canvas.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        // Touch events
        canvas.addEventListener('touchstart', handleStart, { passive: false });
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd, { passive: false });

        function animateDrop(weight) {
            if (weight.isDragging || weight.onHook) return;

            const animate = () => {
                if (weight.isDragging || weight.onHook) return;
                
                const dx = (weight.startPos.x - weight.group.translation.x) * 0.1;
                const dy = (state.floorY - weight.group.translation.y) * 0.1;

                weight.updatePosition(
                    weight.group.translation.x + dx,
                    weight.group.translation.y + dy
                );

                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    requestAnimationFrame(animate);
                } else {
                    weight.updatePosition(weight.startPos.x, state.floorY);
                }
            };
            
            requestAnimationFrame(animate);
        }

        // ============ RESPONSIVE HANDLING ============
        window.addEventListener('resize', updateCanvasSize);
        window.addEventListener('load', () => {
            updateCanvasSize();
            updateDisplay();
        });

        // Initial setup
        updateCanvasSize();
        updateDisplay();
