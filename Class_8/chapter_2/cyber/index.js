
        // Three.js Simulation
        let scene, camera, renderer, controls;
        let currentScene = 'cybercrime';
        let sceneObjects = [];
        
        // Initialize Three.js scene
        function init() {
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x050519);
            
            // Create camera
            camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            camera.position.set(0, 5, 15);
            
            // Create renderer
            const canvasContainer = document.getElementById('threejs-canvas');
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            canvasContainer.appendChild(renderer.domElement);
            
            // Add orbit controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            
            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 20, 5);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);
            
            // Add a central platform
            const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 32);
            const platformMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x1a1a3e,
                shininess: 100
            });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.y = -0.25;
            platform.receiveShadow = true;
            scene.add(platform);
            
            // Create initial scene
            createScene(currentScene);
            
            // Handle window resize
            window.addEventListener('resize', onWindowResize);
            
            // Start animation loop
            animate();
        }
        
        // Create different scenes based on selected topic
        function createScene(sceneType) {
            // Clear previous scene objects
            sceneObjects.forEach(obj => {
                scene.remove(obj);
            });
            sceneObjects = [];
            
            // Create scene based on type
            switch(sceneType) {
                case 'cybercrime':
                    createCybercrimeScene();
                    break;
                case 'ethics':
                    createEthicsScene();
                    break;
                case 'cyberlaw':
                    createCyberlawScene();
                    break;
                case 'security':
                    createSecurityScene();
                    break;
            }
        }
        
        // Cybercrime scene with hacking and threats visualization
        function createCybercrimeScene() {
            // Create central server
            const serverGeometry = new THREE.BoxGeometry(2, 3, 2);
            const serverMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xff4757,
                emissive: 0xff4757,
                emissiveIntensity: 0.2
            });
            const server = new THREE.Mesh(serverGeometry, serverMaterial);
            server.castShadow = true;
            server.position.y = 1.5;
            scene.add(server);
            sceneObjects.push(server);
            
            // Add threat indicators (red spheres)
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 5;
                const threatGeometry = new THREE.SphereGeometry(0.4, 16, 16);
                const threatMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0xff4757,
                    emissive: 0xff4757,
                    emissiveIntensity: 0.5
                });
                const threat = new THREE.Mesh(threatGeometry, threatMaterial);
                threat.position.x = Math.cos(angle) * radius;
                threat.position.z = Math.sin(angle) * radius;
                threat.position.y = 1;
                threat.castShadow = true;
                scene.add(threat);
                sceneObjects.push(threat);
                
                // Add connecting lines to server
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(threat.position.x, threat.position.y, threat.position.z),
                    new THREE.Vector3(0, 1.5, 0)
                ]);
                const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff4757, transparent: true, opacity: 0.5 });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);
                sceneObjects.push(line);
            }
            
            // Add floating text
            addFloatingText("HACKING", 0xff4757, 0, 5, 0);
            addFloatingText("IDENTITY THEFT", 0xff4757, -5, 3, -4);
            addFloatingText("CYBERBULLYING", 0xff4757, 5, 3, -4);
        }
        
        // Ethics scene with protective shields and guidelines
        function createEthicsScene() {
            // Create central ethical core
            const coreGeometry = new THREE.IcosahedronGeometry(2, 1);
            const coreMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x00a8ff,
                emissive: 0x00a8ff,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.8
            });
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            core.castShadow = true;
            scene.add(core);
            sceneObjects.push(core);
            
            // Create protective shields around core
            const shieldGeometry = new THREE.IcosahedronGeometry(3.5, 1);
            const shieldMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x00a8ff,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            scene.add(shield);
            sceneObjects.push(shield);
            
            // Add floating ethical principles
            const principles = ["RESPECT", "SECURITY", "ACCURACY", "COMPLIANCE", "PROFESSIONALISM"];
            const colors = [0x00a8ff, 0x9c88ff, 0x4cd137, 0xff9f43, 0x00a8ff];
            
            for (let i = 0; i < principles.length; i++) {
                const angle = (i / principles.length) * Math.PI * 2;
                const radius = 6;
                addFloatingText(principles[i], colors[i], 
                    Math.cos(angle) * radius, 2, Math.sin(angle) * radius);
            }
            
            // Add rotating rings
            const ringGeometry = new THREE.TorusGeometry(4.5, 0.2, 16, 100);
            const ringMaterial = new THREE.MeshPhongMaterial({ color: 0x9c88ff });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            scene.add(ring);
            sceneObjects.push(ring);
        }
        
        // Cyberlaw scene with legal framework visualization
        function createCyberlawScene() {
            // Create law pillars
            const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 16);
            const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x9c88ff });
            
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const radius = 4;
                const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
                pillar.position.x = Math.cos(angle) * radius;
                pillar.position.z = Math.sin(angle) * radius;
                pillar.position.y = 3;
                pillar.castShadow = true;
                scene.add(pillar);
                sceneObjects.push(pillar);
                
                // Add pillar top
                const topGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.8);
                const top = new THREE.Mesh(topGeometry, pillarMaterial);
                top.position.x = pillar.position.x;
                top.position.z = pillar.position.z;
                top.position.y = 6.5;
                scene.add(top);
                sceneObjects.push(top);
            }
            
            // Create connecting structure
            const connectGeometry = new THREE.TorusGeometry(4, 0.1, 16, 100);
            const connectMaterial = new THREE.MeshPhongMaterial({ color: 0x00a8ff });
            const connection = new THREE.Mesh(connectGeometry, connectMaterial);
            connection.rotation.x = Math.PI / 2;
            connection.position.y = 5;
            scene.add(connection);
            sceneObjects.push(connection);
            
            // Add law text
            addFloatingText("ELECTRONIC", 0x9c88ff, 0, 7, 0);
            addFloatingText("TRANSACTIONS", 0x9c88ff, 0, 6.2, 0);
            addFloatingText("ACT 2063", 0x9c88ff, 0, 5.4, 0);
        }
        
        // Security scene with protection measures
        function createSecurityScene() {
            // Create central secure server
            const secureGeometry = new THREE.OctahedronGeometry(2, 1);
            const secureMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x4cd137,
                emissive: 0x4cd137,
                emissiveIntensity: 0.3
            });
            const secureCore = new THREE.Mesh(secureGeometry, secureMaterial);
            secureCore.castShadow = true;
            scene.add(secureCore);
            sceneObjects.push(secureCore);
            
            // Create protective layers
            for (let i = 1; i <= 3; i++) {
                const layerGeometry = new THREE.SphereGeometry(2 + i, 32, 32);
                const layerMaterial = new THREE.MeshPhongMaterial({
                    color: i === 1 ? 0x00a8ff : (i === 2 ? 0x9c88ff : 0x4cd137),
                    wireframe: true,
                    transparent: true,
                    opacity: 0.2
                });
                const layer = new THREE.Mesh(layerGeometry, layerMaterial);
                scene.add(layer);
                sceneObjects.push(layer);
            }
            
            // Add security elements rotating around
            const securityElements = ["FIREWALL", "ENCRYPTION", "2FA", "ANTIVIRUS", "BACKUP"];
            
            for (let i = 0; i < securityElements.length; i++) {
                const angle = (i / securityElements.length) * Math.PI * 2;
                const radius = 6;
                const elementGeometry = new THREE.BoxGeometry(1, 1, 1);
                const elementMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x00a8ff,
                    emissive: 0x00a8ff,
                    emissiveIntensity: 0.2
                });
                const element = new THREE.Mesh(elementGeometry, elementMaterial);
                element.position.x = Math.cos(angle) * radius;
                element.position.z = Math.sin(angle) * radius;
                element.position.y = 1;
                element.castShadow = true;
                scene.add(element);
                sceneObjects.push(element);
                
                addFloatingText(securityElements[i], 0x00a8ff, 
                    Math.cos(angle) * radius, 2.5, Math.sin(angle) * radius);
            }
        }
        
        // Helper function to add floating text
        function addFloatingText(text, color, x, y, z) {
            // Create canvas for text texture
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 128;
            
            // Draw text on canvas
            context.fillStyle = 'rgba(0, 0, 0, 0)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.font = 'bold 48px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            
            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            
            // Create sprite material with texture
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true
            });
            
            // Create sprite
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(x, y, z);
            sprite.scale.set(8, 2, 1);
            scene.add(sprite);
            sceneObjects.push(sprite);
        }
        
        // Handle window resize
        function onWindowResize() {
            const canvasContainer = document.getElementById('threejs-canvas');
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        }
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate scene objects
            sceneObjects.forEach(obj => {
                if (obj.geometry && obj.geometry.type === 'IcosahedronGeometry') {
                    obj.rotation.y += 0.01;
                }
                if (obj.geometry && obj.geometry.type === 'TorusGeometry') {
                    obj.rotation.y += 0.005;
                }
            });
            
            controls.update();
            renderer.render(scene, camera);
        }
        
        // UI Interaction
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Three.js scene
            init();
            
            // Topic selection
            const topics = document.querySelectorAll('.topic');
            topics.forEach(topic => {
                topic.addEventListener('click', function() {
                    // Remove active class from all topics
                    topics.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked topic
                    this.classList.add('active');
                    
                    // Change scene
                    currentScene = this.getAttribute('data-scene');
                    createScene(currentScene);
                });
            });
            
            // Navigation buttons
            document.getElementById('prev-btn').addEventListener('click', function() {
                const topics = document.querySelectorAll('.topic');
                let currentIndex = 0;
                
                topics.forEach((topic, index) => {
                    if (topic.classList.contains('active')) {
                        currentIndex = index;
                    }
                });
                
                const prevIndex = (currentIndex - 1 + topics.length) % topics.length;
                
                topics.forEach(topic => topic.classList.remove('active'));
                topics[prevIndex].classList.add('active');
                
                currentScene = topics[prevIndex].getAttribute('data-scene');
                createScene(currentScene);
            });
            
            document.getElementById('next-btn').addEventListener('click', function() {
                const topics = document.querySelectorAll('.topic');
                let currentIndex = 0;
                
                topics.forEach((topic, index) => {
                    if (topic.classList.contains('active')) {
                        currentIndex = index;
                    }
                });
                
                const nextIndex = (currentIndex + 1) % topics.length;
                
                topics.forEach(topic => topic.classList.remove('active'));
                topics[nextIndex].classList.add('active');
                
                currentScene = topics[nextIndex].getAttribute('data-scene');
                createScene(currentScene);
            });
            
            document.getElementById('reset-btn').addEventListener('click', function() {
                createScene(currentScene);
                controls.reset();
            });
            
            // Handle initial window resize
            setTimeout(() => onWindowResize(), 100);
        });