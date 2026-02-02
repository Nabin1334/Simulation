
      // --- HELPER FUNCTIONS FOR ENVIRONMENT ---
        function getWoodTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Base Wood Color
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(0,0,512,512);
            
            // Planks
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 3;
            for(let i=0; i<=512; i+=64) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
                // Random grain
                for(let j=0; j<20; j++) {
                    ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.15})`;
                    const len = Math.random()*150;
                    const x = Math.random()*512;
                    const y = i + Math.random()*60;
                    ctx.fillRect(x,y,len, 2);
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(8, 8);
            tex.anisotropy = 4;
            return tex;
        }

        function getSkyTexture(isDay) {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createLinearGradient(0, 0, 0, 512);
            
            if (isDay) {
                grad.addColorStop(0, "#0ea5e9"); // Sky Blue
                grad.addColorStop(1, "#bae6fd"); // Light Blue
            } else {
                grad.addColorStop(0, "#020617"); // Dark Slate/Black
                grad.addColorStop(1, "#1e1b4b"); // Indigo
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 512);
            
            if (!isDay) {
                // Stars
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 150; i++) {
                    const x = Math.random() * 512;
                    const y = Math.random() * 512;
                    const r = Math.random() * 1.5;
                    ctx.globalAlpha = Math.random();
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        }

        const materialProperties = {
            iron: { alpha: 11.8, color: 0x9aa3ad, name: 'Iron' },
            copper: { alpha: 16.5, color: 0xb87333, name: 'Copper' },
            glass: { alpha: 8.5, color: 0x7fbfe8, name: 'Glass' },
            aluminum: { alpha: 23.1, color: 0xd7dde3, name: 'Aluminum' }
        };

        // --- ENHANCED TORCH SHADER ---
        const flameVertexShader = `
            varying vec2 vUv;
            varying float vHitOpacity;
            uniform float time;
            uniform float uPower;
            uniform vec3 uBallLocalPos;
            uniform float uBallRadius;
            
            // Simplex-like noise
            float hash(float n) { return fract(sin(n) * 1e4); }
            float noise(vec3 x) {
                const vec3 step = vec3(110, 241, 171);
                vec3 i = floor(x);
                vec3 f = fract(x);
                float n = dot(i, step);
                vec3 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                           mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
                       mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                           mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
            }

            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // --- FLAME SHAPE DYNAMICS ---
                float verticalNoise = noise(vec3(pos.x * 4.0, pos.y * 3.0 - time * 18.0, time * 2.0));
                float radialNoise = noise(vec3(pos.x * 2.0, pos.z * 2.0, time * 8.0));
                
                float stability = mix(1.0, 0.3, uPower); 
                
                pos.x += pos.x * (radialNoise - 0.5) * 0.4 * stability;
                pos.z += pos.z * (radialNoise - 0.5) * 0.4 * stability;
                
                float tipWiggle = smoothstep(0.0, 3.5, pos.y); 
                pos.x += sin(time * 15.0 + pos.y * 2.0) * 0.05 * tipWiggle * uPower;
                pos.z += cos(time * 12.0 + pos.y * 2.0) * 0.05 * tipWiggle * uPower;

                // --- COLLISION LOGIC ---
                float distToAxis = length(vec2(uBallLocalPos.x, uBallLocalPos.z));
                float distToSurface = uBallLocalPos.y - (uBallRadius * 0.85);

                vHitOpacity = 0.0;

                if (distToAxis < uBallRadius + 0.5 && uBallLocalPos.y > 0.0) {
                    if (pos.y > distToSurface) {
                        float overshoot = pos.y - distToSurface;
                        pos.y = distToSurface + noise(pos * 5.0 + time) * 0.1;
                        
                        float spreadFactor = overshoot * 0.6; 
                        vec2 dir = normalize(vec2(pos.x, pos.z));
                        if (length(dir) == 0.0) dir = vec2(1.0, 0.0);
                        
                        pos.x += dir.x * spreadFactor;
                        pos.z += dir.y * spreadFactor;
                        
                        vHitOpacity = 1.0; 
                    }
                }

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        const flameFragmentShader = `
            uniform float time;
            varying vec2 vUv;
            varying float vHitOpacity;

            void main() {
                float xDist = abs(vUv.x - 0.5);
                float coreWidth = 0.12; 
                float outerWidth = 0.48;
                
                vec3 cDeepBlue = vec3(0.05, 0.1, 0.8);
                vec3 cBright = vec3(0.6, 0.9, 1.0);
                vec3 cEdge = vec3(0.0, 0.0, 0.2);

                float core = 1.0 - smoothstep(0.0, coreWidth, xDist);
                core *= smoothstep(0.0, 0.15, vUv.y) * (1.0 - vUv.y * 0.8); 
                
                float diamonds = pow(abs(sin(vUv.y * 12.0 - time * 5.0)), 4.0);
                core += core * diamonds * 0.5;

                float outer = 1.0 - smoothstep(coreWidth, outerWidth, xDist);
                outer *= smoothstep(0.0, 0.05, vUv.y) * pow(1.0 - vUv.y, 2.0);

                vec3 finalColor = mix(cDeepBlue, cBright, core); 
                finalColor = mix(cEdge, finalColor, outer);      

                if (vHitOpacity > 0.5) {
                    finalColor = mix(finalColor, vec3(1.0, 0.6, 0.1), 0.7);
                }

                float alpha = core + (outer * 0.4);
                alpha *= 0.9 + 0.1 * sin(time * 30.0);

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        const App = {
            isLight: false,
            material: "iron",
            baseTemp: 20,
            currentTemp: 20,
            power: 0.60,
            heating: false,
            cooling: false,
            activeTorch: 'top', // 'top' or 'bottom'
            baseSphereRadius: 1.00,
            ringMajorRadius: 1.25,
            ringTubeRadius: 0.14, 
            ballX: 3.0,
            ballZ: 0.0,
            topArmY: 8.6, 
            stringTop: new THREE.Vector3(3.0, 8.5, 0.0), 
            ringPlaneY: 3.6,
            torchX: 1.4,
            torchY: 3.9, 
            stringLenMin: 1.2, 
            stringLenMax: 6.5, 
            stringLength: 3.5,
            ballTargetY: 4.35,
            ballY: 4.35,
            passedThrough: false,
            scene: null,
            camera: null,
            renderer: null,
            clock: null,
            sphere: null,
            ring: null,
            stringLine: null,
            flameMat: null,
            flameMesh: null,
            bottomFlameMesh: null, // New bottom flame
            nozzleGroup: null,
            bottomNozzleGroup: null, // New bottom nozzle
            camTheta: 0.85,
            camPhi: 1.35,
            camRadius: 14.0, 
            dragging: false,
            dragStartX: 0,
            dragStartY: 0,
            dragStartTheta: 0,
            dragStartPhi: 0,
            flameLight: null,
            bottomFlameLight: null // New bottom light
        };

        const UI = {};

        function clamp(v, a, b) {
            return Math.max(a, Math.min(b, v));
        }

        function cacheUI() {
            UI.themeToggle = document.getElementById("theme-toggle");
            UI.themeEmoji = document.getElementById("theme-emoji");
            UI.themeLabel = document.getElementById("theme-label");
            UI.statusChip = document.getElementById("status-chip");
            UI.materialBadge = document.getElementById("material-badge");
            UI.materialBtns = [...document.querySelectorAll(".material-btn")];
            UI.powerSlider = document.getElementById("power-slider");
            UI.powerDisplay = document.getElementById("power-display");
            UI.stringSlider = document.getElementById("string-slider");
            UI.stringDisplay = document.getElementById("string-display");
            UI.torchPosToggle = document.getElementById("torch-pos-toggle"); // New toggle
            UI.startBtn = document.getElementById("start-btn");
            UI.coolBtn = document.getElementById("cool-btn");
            UI.resetBtn = document.getElementById("reset-btn");
            UI.tempValue = document.getElementById("temp-value");
            UI.volumeValue = document.getElementById("volume-value");
            UI.heatDot = document.getElementById("heat-dot");
            UI.fitState = document.getElementById("fit-state");
            UI.fitDetails = document.getElementById("fit-details");
            UI.threeContainer = document.getElementById("three-container");
            UI.tabs = document.querySelectorAll(".tab");
            UI.pages = document.querySelectorAll(".content-page");
        }

        function setStatus(text) {
            UI.statusChip.textContent = text;
        }

        function updateThemeUI() {
            App.isLight = document.body.classList.contains("light-mode");
            UI.themeEmoji.textContent = App.isLight ? "☀️" : "🌙";
            UI.themeLabel.textContent = App.isLight ? "Light Mode" : "Dark Mode";
            
            if (App.scene) {
                App.scene.background = getSkyTexture(App.isLight);
            }
        }

        function ringHoleRadius() {
            return App.ringMajorRadius - App.ringTubeRadius;
        }

        function currentSphereRadius() {
            const alpha = materialProperties[App.material].alpha * 1e-6;
            const dT = App.currentTemp - App.baseTemp;
            const simulationExaggeration = 6.5; 
            let frac = 3 * alpha * dT * simulationExaggeration;
            if (frac > 0.27) frac = 0.27; // Cap at 27%
            const scale = 1 + frac;
            return App.baseSphereRadius * scale;
        }

        function tempToHotColor(tempC) {
            const t = clamp((tempC - 20) / 480, 0, 1);
            const cool = new THREE.Color(0x9aa3ad);
            const mid = new THREE.Color(0xd94b3d);
            const hot = new THREE.Color(0xffa12a);
            const c = new THREE.Color();
            if (t < 0.6) c.copy(cool).lerp(mid, t / 0.6);
            else c.copy(mid).lerp(hot, (t - 0.6) / 0.4);
            return c;
        }

        function updateCameraFromSpherical() {
            const theta = App.camTheta;
            const phi = clamp(App.camPhi, 0.25, 1.50);
            const r = clamp(App.camRadius, 6.0, 30.0);
            const x = r * Math.sin(phi) * Math.cos(theta);
            const z = r * Math.sin(phi) * Math.sin(theta);
            const y = r * Math.cos(phi) + 2.5; 
            App.camera.position.set(x, y, z);
            App.camera.lookAt(2.1, 4.5, 0); 
        }

        function attachPointerControls() {
            const el = App.renderer.domElement;
            el.addEventListener("pointerdown", (e) => {
                App.dragging = true;
                App.dragStartX = e.clientX;
                App.dragStartY = e.clientY;
                App.dragStartTheta = App.camTheta;
                App.dragStartPhi = App.camPhi;
                el.setPointerCapture(e.pointerId);
            });
            el.addEventListener("pointermove", (e) => {
                if (!App.dragging) return;
                const dx = (e.clientX - App.dragStartX) * 0.005;
                const dy = (e.clientY - App.dragStartY) * 0.005;
                App.camTheta = App.dragStartTheta - dx;
                App.camPhi = App.dragStartPhi + dy;
                updateCameraFromSpherical();
            });
            el.addEventListener("pointerup", () => {
                App.dragging = false;
            });
            el.addEventListener("wheel", (e) => {
                e.preventDefault();
                App.camRadius = clamp(App.camRadius + e.deltaY * 0.005, 6.0, 30.0);
                updateCameraFromSpherical();
            }, { passive: false });
        }

        function resizeRendererToContainer() {
            const rect = UI.threeContainer.getBoundingClientRect();
            const w = Math.max(1, Math.floor(rect.width));
            const h = Math.max(1, Math.floor(rect.height));
            App.renderer.setSize(w, h, false);
            App.camera.aspect = w / h;
            App.camera.updateProjectionMatrix();
        }

        function computeBallTargetFromString() {
            App.ballTargetY = App.stringTop.y - App.stringLength;
        }

        function updateBallMotion(dt) {
            const speed = 7.5;
            const r = currentSphereRadius();
            const hole = ringHoleRadius();

            let allowedMinY = -1000;
            let allowedMaxY = 1000;

            if (r > hole) {
                const dy = Math.sqrt(r * r - hole * hole);
                if (App.ballY >= App.ringPlaneY) {
                    allowedMinY = App.ringPlaneY + dy;
                } else {
                    allowedMaxY = App.ringPlaneY - dy;
                }
            }

            let constrainedTargetY = App.ballTargetY;
            constrainedTargetY = Math.max(constrainedTargetY, allowedMinY);
            constrainedTargetY = Math.min(constrainedTargetY, allowedMaxY);

            App.ballY += (constrainedTargetY - App.ballY) * (1 - Math.exp(-speed * dt));
            App.passedThrough = (App.ballY < App.ringPlaneY - 0.2);

            if (App.sphere) App.sphere.position.set(App.ballX, App.ballY, App.ballZ);

            if (App.stringLine) {
                const pos = App.stringLine.geometry.attributes.position.array;
                pos[0] = App.stringTop.x;
                pos[1] = App.stringTop.y;
                pos[2] = App.stringTop.z;
                pos[3] = App.ballX;
                pos[4] = App.ballY + r - 0.05;
                pos[5] = App.ballZ;
                App.stringLine.geometry.attributes.position.needsUpdate = true;
            }
        }

        function createLabObjects() {
            App.scene = new THREE.Scene();
            const ambient = new THREE.AmbientLight(0xffffff, 0.65);
            App.scene.add(ambient);

            const key = new THREE.DirectionalLight(0xffffff, 1.1);
            key.position.set(8, 12, 8);
            key.castShadow = true;
            key.shadow.mapSize.set(1024, 1024);
            App.scene.add(key);

            const fill = new THREE.DirectionalLight(0x3b82f6, 0.3);
            fill.position.set(-8, 5, -5);
            App.scene.add(fill);

            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(80, 80),
                new THREE.MeshStandardMaterial({
                    map: getWoodTexture(),
                    roughness: 0.8,
                    metalness: 0.1
                })
            );
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            App.scene.add(floor);

            const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.7 });
            const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.5 });

            const mainBase = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 2.5), standMat);
            mainBase.position.set(0, 0.1, 0);
            mainBase.receiveShadow = true;
            App.scene.add(mainBase);

            const mainPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 9.0, 16), metalMat);
            mainPole.position.set(0, 4.5, 0); 
            mainPole.castShadow = true;
            App.scene.add(mainPole);

            const topArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 16), metalMat);
            topArm.rotation.z = Math.PI / 2;
            topArm.position.set(1.5, App.topArmY, 0);
            topArm.castShadow = true;
            App.scene.add(topArm);

            const topHook = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12), metalMat);
            topHook.position.set(3.0, App.topArmY - 0.2, 0);
            App.scene.add(topHook);

            // Ring with slightly thicker tube to reduce hole size
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(App.ringMajorRadius, App.ringTubeRadius, 32, 100),
                new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 })
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.set(App.ballX, App.ringPlaneY, 0);
            ring.castShadow = true;
            ring.receiveShadow = true;
            App.scene.add(ring);
            App.ring = ring;

            const ringBase = new THREE.Mesh(new THREE.BoxGeometry(2, 0.15, 2), standMat);
            ringBase.position.set(5.5, 0.075, 0);
            ringBase.receiveShadow = true;
            App.scene.add(ringBase);

            const ringPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.0, 16), metalMat);
            ringPole.position.set(5.5, 2.0, 0);
            ringPole.castShadow = true;
            App.scene.add(ringPole);

            const ringArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.25, 16), metalMat);
            ringArm.rotation.z = Math.PI / 2;
            ringArm.position.set(4.875, App.ringPlaneY, 0);
            ringArm.castShadow = true;
            App.scene.add(ringArm);

            // --- FLAME SHADER MATERIAL ---
            App.flameMat = new THREE.ShaderMaterial({
                uniforms: { 
                    time: { value: 0 },
                    uPower: { value: 0.6 },
                    uBallLocalPos: { value: new THREE.Vector3(0, -100, 0) }, 
                    uBallRadius: { value: 1.0 }
                },
                vertexShader: flameVertexShader,
                fragmentShader: flameFragmentShader,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            // === TOP TORCH SETUP ===
            const torchBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 1.5), standMat);
            torchBase.position.set(App.torchX - 1.5, 0.075, 0);
            torchBase.receiveShadow = true;
            App.scene.add(torchBase);

            const torchPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.0, 16), metalMat);
            torchPole.position.set(App.torchX - 1.5, 2.0, 0);
            torchPole.castShadow = true;
            App.scene.add(torchPole);

            const nozzleGroup = new THREE.Group();
            nozzleGroup.position.set(App.torchX - 1.5, App.torchY - 0.5, 0);
            App.scene.add(nozzleGroup);
            App.nozzleGroup = nozzleGroup;

            const torchArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16), metalMat);
            torchArm.rotation.z = Math.PI / 2;
            torchArm.position.set(0.6, 0, 0);
            nozzleGroup.add(torchArm);

            const burnerHead = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.15, 0.6, 16),
                new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.5 })
            );
            burnerHead.rotation.z = -Math.PI / 4;
            burnerHead.position.set(1.4, 0.2, 0);
            nozzleGroup.add(burnerHead);

            const flameGeo = new THREE.CylinderGeometry(0.02, 0.15, 3.8, 32, 16, true);
            flameGeo.translate(0, 1.9, 0); 
            
            const flameMesh = new THREE.Mesh(flameGeo, App.flameMat);
            flameMesh.position.set(1.6, 0.4, 0); 
            flameMesh.rotation.z = -Math.PI / 4; 
            nozzleGroup.add(flameMesh);
            App.flameMesh = flameMesh;
            App.flameMesh.visible = false;

            const flameLight = new THREE.PointLight(0x3b82f6, 0, 8);
            flameLight.position.set(2.5, 1.5, 0);
            nozzleGroup.add(flameLight);
            App.flameLight = flameLight;


            // === BOTTOM TORCH SETUP (Corrected) ===
            const bottomNozzleGroup = new THREE.Group();
            bottomNozzleGroup.position.set(3.0, 0.1, 0); // Ground position
            App.scene.add(bottomNozzleGroup);
            App.bottomNozzleGroup = bottomNozzleGroup;

            // Head (Straight Up)
            const bottomBurnerHead = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.15, 0.6, 16),
                new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.5 })
            );
            bottomBurnerHead.position.set(0, 0, 0);
            bottomNozzleGroup.add(bottomBurnerHead);

            // Flame (Straight Up)
            const bottomFlameMesh = new THREE.Mesh(flameGeo, App.flameMat);
            bottomFlameMesh.rotation.z = 0; // Vertical
            bottomFlameMesh.position.set(0, 0.2, 0);
            bottomNozzleGroup.add(bottomFlameMesh);
            App.bottomFlameMesh = bottomFlameMesh;
            App.bottomFlameMesh.visible = false;

            const bottomFlameLight = new THREE.PointLight(0x3b82f6, 0, 8);
            bottomFlameLight.position.set(0, 1.0, 0);
            bottomNozzleGroup.add(bottomFlameLight);
            App.bottomFlameLight = bottomFlameLight;

            // === BALL ===
            const sphMat = new THREE.MeshStandardMaterial({
                color: materialProperties[App.material].color,
                roughness: 0.32,
                metalness: 0.82,
                emissive: new THREE.Color(0x000000),
                emissiveIntensity: 1.0
            });
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(App.baseSphereRadius, 64, 64), sphMat);
            sphere.position.set(App.ballX, 4.35, 0);
            sphere.castShadow = true;
            App.scene.add(sphere);
            App.sphere = sphere;

            const lineGeo = new THREE.BufferGeometry();
            const pts = new Float32Array(6);
            lineGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
            const lineMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.68 });
            App.stringLine = new THREE.Line(lineGeo, lineMat);
            App.scene.add(App.stringLine);
        }

        function initThree() {
            App.clock = new THREE.Clock();
            App.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 220);
            updateCameraFromSpherical();

            App.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            App.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            App.renderer.shadowMap.enabled = true;
            App.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            UI.threeContainer.appendChild(App.renderer.domElement);

            createLabObjects();
            attachPointerControls();

            window.addEventListener("resize", resizeRendererToContainer);
            resizeRendererToContainer();
        }

        function updateHeatIndicators() {
            const isTop = App.activeTorch === 'top';
            
            // Manage Visibility based on Active Torch AND Heating State
            if (App.flameMesh) {
                App.flameMesh.visible = App.heating && isTop;
                if (App.flameMesh.visible) {
                    App.flameMat.uniforms.uPower.value = App.power;
                    const lenScale = 0.5 + 0.8 * App.power; 
                    App.flameMesh.scale.set(1, lenScale, 1);
                }
            }

            if (App.bottomFlameMesh) {
                App.bottomFlameMesh.visible = App.heating && !isTop;
                if (App.bottomFlameMesh.visible) {
                    App.flameMat.uniforms.uPower.value = App.power;
                    // Boost scale for bottom flame so it reaches higher
                    const lenScale = (0.5 + 0.8 * App.power) * 1.5; 
                    App.bottomFlameMesh.scale.set(1, lenScale, 1);
                }
            }

            UI.heatDot.style.opacity = App.heating ? "1" : "0.25";
            UI.heatDot.style.color = App.heating ? "var(--accent-orange)" : "inherit";
            setStatus(App.heating ? "HEATING" : (App.cooling ? "COOLING" : "READY"));
        }

        function updateVisuals() {
            const alpha = materialProperties[App.material].alpha * 1e-6;
            const dT = App.currentTemp - App.baseTemp;
            const simulationExaggeration = 6.5; 
            let frac = 3 * alpha * dT * simulationExaggeration;
            if (frac > 0.27) frac = 0.27; // Cap for display too
            const scale = 1 + frac;

            if (App.sphere) App.sphere.scale.set(scale, scale, scale);

            if (App.sphere) {
                const hotColor = tempToHotColor(App.currentTemp);
                const base = new THREE.Color(materialProperties[App.material].color);
                const t = clamp((App.currentTemp - 20) / 480, 0, 1);
                App.sphere.material.color.copy(base).lerp(hotColor, t * 0.85);
                App.sphere.material.emissive.copy(new THREE.Color(0xff2a00)).multiplyScalar(t * 0.75);
            }

            UI.tempValue.textContent = `${Math.round(App.currentTemp)}°C`;
            UI.volumeValue.textContent = `${frac >= 0 ? "+" : ""}${(frac * 100).toFixed(3)}%`;

            const fits = currentSphereRadius() <= ringHoleRadius();
            if (fits) {
                UI.fitState.textContent = "Fits";
                UI.fitState.style.color = "var(--accent-green)";
                UI.fitDetails.textContent = App.passedThrough ? "Ball has passed through" : "Ball can pass when lowered";
            } else {
                UI.fitState.textContent = "Stuck";
                UI.fitState.style.color = "var(--accent-red)";
                UI.fitDetails.textContent = "Expanded ball cannot pass through ring";
            }
        }

        function setMaterial(mat) {
            App.material = mat;
            UI.materialBtns.forEach(b => b.classList.toggle("active", b.dataset.material === mat));
            UI.materialBadge.textContent = materialProperties[mat].name;
            updateVisuals();
        }

        function setPower(v) {
            App.power = v;
            UI.powerDisplay.textContent = `${Math.round(v * 100)}%`;
            updateHeatIndicators(); 
        }

        function setStringSlider(val) {
            const t = (val - 30) / (160 - 30);
            let newLength = App.stringLenMin + t * (App.stringLenMax - App.stringLenMin);
            
            const r = currentSphereRadius();
            const hole = ringHoleRadius();
            
            // Fix: Only constrain string length (force stop) if ball is above ring
            if (r > hole && App.ballY > App.ringPlaneY) {
                const dy = Math.sqrt(r*r - hole*hole);
                const collisionY = App.ringPlaneY + dy;
                const maxLength = App.stringTop.y - collisionY;
                
                if (newLength > maxLength) {
                    newLength = maxLength;
                    const clampedT = (newLength - App.stringLenMin) / (App.stringLenMax - App.stringLenMin);
                    const clampedVal = 30 + clampedT * (160 - 30);
                    UI.stringSlider.value = clampedVal; 
                }
            }

            App.stringLength = newLength;
            UI.stringDisplay.textContent = `${App.stringLength.toFixed(2)} m`;
            computeBallTargetFromString();
            
            if(r <= hole) App.passedThrough = false;
        }

        function resetExperiment() {
            App.heating = false;
            App.cooling = false;
            App.currentTemp = 20;

            UI.powerSlider.value = 60;
            setPower(0.60);

            UI.stringSlider.value = 95;
            setStringSlider(95);

            App.ballY = App.ballTargetY;
            if (App.sphere) App.sphere.position.set(App.ballX, App.ballY, App.ballZ);

            updateHeatIndicators();
            updateVisuals();
            UI.startBtn.textContent = "🔥 Heat";
            UI.coolBtn.textContent = "❄️ Cool";
        }

        // --- TAB SWITCHING LOGIC ---
        function switchTab(tabId) {
            UI.tabs.forEach(tab => {
                if(tab.dataset.tab === tabId) {
                    tab.classList.add("active");
                } else {
                    tab.classList.remove("active");
                }
            });

            UI.pages.forEach(page => {
                const pageId = tabId + "-page";
                if(page.id === pageId) {
                    page.classList.add("active");
                } else {
                    page.classList.remove("active");
                }
            });

            if(tabId === 'simulation') {
                document.body.classList.add('sim-focus');
                setTimeout(resizeRendererToContainer, 50);
            } else {
                document.body.classList.remove('sim-focus');
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            const dt = App.clock.getDelta();
            const time = App.clock.getElapsedTime();

            let isTouchingFlame = false;

            // Updated Logic: Check collision only with the ACTIVE flame
            const activeFlameMesh = (App.activeTorch === 'top') ? App.flameMesh : App.bottomFlameMesh;

            if (activeFlameMesh && App.sphere && App.heating) {
                App.flameMat.uniforms.time.value = time;
                
                const ballWorldPos = new THREE.Vector3();
                App.sphere.getWorldPosition(ballWorldPos);
                
                const nozzleWorldPos = new THREE.Vector3();
                activeFlameMesh.getWorldPosition(nozzleWorldPos);
                const dist = nozzleWorldPos.distanceTo(ballWorldPos);
                
                // --- HEIGHT CHECK LOGIC ---
                let heightConditionMet = false;
                if (App.activeTorch === 'top') {
                    // Top torch only heats if ball is ABOVE ring level (~3.0)
                    if (ballWorldPos.y > 3.0) heightConditionMet = true;
                } else {
                    // Bottom torch only heats if ball is BELOW ring level (~3.0) (or roughly 4.0 to catch it stuck)
                    if (ballWorldPos.y < 4.0) heightConditionMet = true;
                }

                // If close enough AND in the correct vertical zone
                // Increased distance check for bottom torch since base is far down
                const distThreshold = (App.activeTorch === 'bottom') ? 4.5 : 2.5;

                if (dist < distThreshold && heightConditionMet) {
                    isTouchingFlame = true;
                }

                // Update shader uniforms based on active flame's transform
                const flameInvMatrix = new THREE.Matrix4().copy(activeFlameMesh.matrixWorld).invert();
                const ballLocalPos = ballWorldPos.applyMatrix4(flameInvMatrix);
                
                App.flameMat.uniforms.uBallLocalPos.value.copy(ballLocalPos);
                App.flameMat.uniforms.uBallRadius.value = currentSphereRadius();
            }

            // Update Lights
            if (App.flameLight) {
                if (App.heating && App.activeTorch === 'top') {
                    App.flameLight.intensity = 1.0 + Math.sin(time * 20) * 0.3;
                } else {
                    App.flameLight.intensity = 0;
                }
            }
            if (App.bottomFlameLight) {
                if (App.heating && App.activeTorch === 'bottom') {
                    App.bottomFlameLight.intensity = 1.0 + Math.sin(time * 20) * 0.3;
                } else {
                    App.bottomFlameLight.intensity = 0;
                }
            }

            const AMBIENT = 20;
            const PASSIVE_COOL_RATE = 0.05; 
            const ACTIVE_COOL_RATE = 0.3; 
            const MAX_HEAT_RATE = 125; 

            // Only heat if heating is ON AND ball is touching the ACTIVE flame
            if (App.heating && isTouchingFlame) {
                const heatInput = App.power * MAX_HEAT_RATE;
                const heatLoss = (App.currentTemp - AMBIENT) * PASSIVE_COOL_RATE;
                App.currentTemp += (heatInput - heatLoss) * dt;
            } else {
                // Otherwise cool down
                const rate = App.cooling ? ACTIVE_COOL_RATE : (PASSIVE_COOL_RATE * 0.5);
                App.currentTemp -= (App.currentTemp - AMBIENT) * rate * dt;
                
                if (App.currentTemp < AMBIENT) App.currentTemp = AMBIENT;
                
                if (App.cooling && Math.abs(App.currentTemp - AMBIENT) < 0.5) {
                    App.cooling = false;
                    UI.coolBtn.textContent = "❄️ Cool";
                    if(App.heating) updateHeatIndicators(); 
                }
            }

            if (App.heating) {
                 setStringSlider(parseInt(UI.stringSlider.value));
            }

            updateBallMotion(dt);

            updateVisuals();
            App.renderer.render(App.scene, App.camera);
        }

        document.addEventListener("DOMContentLoaded", () => {
            cacheUI();
            document.body.classList.add("sim-focus");

            UI.themeToggle.addEventListener("click", () => {
                document.body.classList.toggle("light-mode");
                updateThemeUI();
            });

            UI.tabs.forEach(tab => {
                tab.addEventListener("click", () => {
                    switchTab(tab.dataset.tab);
                });
            });

            UI.materialBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    setMaterial(btn.dataset.material);
                    resetExperiment();
                });
            });

            UI.powerSlider.addEventListener("input", () => setPower(parseInt(UI.powerSlider.value, 10) / 100));

            UI.stringSlider.addEventListener("input", () => setStringSlider(parseInt(UI.stringSlider.value, 10)));

            // New Listener for Torch Toggle
            UI.torchPosToggle.addEventListener("change", () => {
                App.activeTorch = UI.torchPosToggle.checked ? 'bottom' : 'top';
                updateHeatIndicators();
            });

            UI.startBtn.addEventListener("click", () => {
                App.heating = !App.heating;
                if (App.heating) {
                    App.cooling = false;
                    UI.startBtn.textContent = "⏸ Pause";
                    UI.coolBtn.textContent = "❄️ Cool";
                } else {
                    UI.startBtn.textContent = "🔥 Heat";
                }
                updateHeatIndicators();
            });

            UI.coolBtn.addEventListener("click", () => {
                App.cooling = !App.cooling;
                if (App.cooling) {
                    App.heating = false;
                    UI.startBtn.textContent = "🔥 Heat";
                    UI.coolBtn.textContent = "⏸ Pause";
                } else {
                    UI.coolBtn.textContent = "❄️ Cool";
                }
                updateHeatIndicators();
            });

            UI.resetBtn.addEventListener("click", resetExperiment);

            setPower(0.60);
            setMaterial("iron");
            initThree();
            updateThemeUI();

            setStringSlider(95);
            App.ballY = App.ballTargetY;

            updateHeatIndicators();
            animate();
        });