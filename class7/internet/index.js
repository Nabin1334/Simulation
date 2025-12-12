// import * as THREE from 'three';
//         import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//         import { Line2 } from 'three/addons/lines/Line2.js';
//         import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
//         import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
    

//         // Configuration
//         const CONFIG = {
//             EARTH_RADIUS: 12,
//             NUM_BACKBONE: 8,
//             NUM_ISPS: 15,
//             NUM_CLIENTS: 30,
//             COLORS: {
//                 backbone: 0xff3333,
//                 isp: 0x00ff66,
//                 client: 0x00ccff,
//                 request: 0xffff00,
//                 response: 0x00ffff,
//                 lineBackbone: 0xff3333,
//                 lineISP: 0x00ff66,
//                 lineClient: 0x00ccff
//             },
//             SPEEDS: {
//                 packet: 0.008,
//                 autoRotate: 0.3
//             }
//         };

//         // Global variables
//         let scene, camera, renderer, controls;
//         let nodes = [];
//         let packets = [];
//         let connections = [];
//         let isRunning = true;
//         let packetSpeed = CONFIG.SPEEDS.packet;
//         let autoRotate = true;
//         let stats = {
//             totalNodes: 0,
//             packetsPerSecond: 0,
//             activeConnections: 0,
//             avgLatency: 0
//         };

//         // Initialize the simulation
//         function init() {
//             // Create scene
//             scene = new THREE.Scene();
//             scene.background = new THREE.Color(0x000000);
//             scene.fog = new THREE.FogExp2(0x020205, 0.02);

//             // Create camera
//             camera = new THREE.PerspectiveCamera(
//                 45,
//                 document.getElementById('simulation-container').clientWidth / 
//                 document.getElementById('simulation-container').clientHeight,
//                 0.1,
//                 1000
//             );
//             camera.position.set(30, 20, 30);

//             // Create renderer
//             renderer = new THREE.WebGLRenderer({ antialias: true });
//             renderer.setSize(
//                 document.getElementById('simulation-container').clientWidth,
//                 document.getElementById('simulation-container').clientHeight
//             );
//             renderer.toneMapping = THREE.ReinhardToneMapping;
//             renderer.toneMappingExposure = 1.2;
//             document.getElementById('simulation-container').appendChild(renderer.domElement);

//             // Add lights
//             const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//             scene.add(ambientLight);

//             const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
//             directionalLight.position.set(50, 50, 50);
//             scene.add(directionalLight);

//             // Create space background (stars)
//             createStars();

//             // Create Earth
//             createEarth();

//             // Create network
//             createNetwork();

//             // Setup controls
//             setupControls();

//             // Setup event listeners
//             setupEventListeners();

//             // Setup UI interactions
//             setupUI();

//             // Start animation loop
//             animate();

//             // Update stats initially
//             updateStats();
//         }

//         // Create starfield background
//         function createStars() {
//             const starGeometry = new THREE.BufferGeometry();
//             const starCount = 5000;
//             const positions = new Float32Array(starCount * 3);

//             for (let i = 0; i < starCount * 3; i += 3) {
//                 positions[i] = (Math.random() - 0.5) * 2000;
//                 positions[i + 1] = (Math.random() - 0.5) * 2000;
//                 positions[i + 2] = (Math.random() - 0.5) * 2000;
//             }

//             starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

//             const starMaterial = new THREE.PointsMaterial({
//                 color: 0xffffff,
//                 size: 1.5,
//                 sizeAttenuation: true,
//                 transparent: true,
//                 opacity: 0.8
//             });

//             const stars = new THREE.Points(starGeometry, starMaterial);
//             scene.add(stars);
//         }

//         // Create Earth sphere
//         function createEarth() {
//             // Earth sphere
//             const geometry = new THREE.SphereGeometry(CONFIG.EARTH_RADIUS, 64, 64);
//             const material = new THREE.MeshPhongMaterial({
//                 color: 0x1a3a5f,
//                 emissive: 0x0a192f,
//                 shininess: 5,
//                 specular: 0x111111
//             });
//             const earth = new THREE.Mesh(geometry, material);
//             scene.add(earth);

//             // Atmosphere
//             const atmosphereGeometry = new THREE.SphereGeometry(CONFIG.EARTH_RADIUS + 1.5, 64, 64);
//             const atmosphereMaterial = new THREE.MeshBasicMaterial({
//                 color: 0x0066ff,
//                 transparent: true,
//                 opacity: 0.08,
//                 side: THREE.BackSide,
//                 blending: THREE.AdditiveBlending
//             });
//             const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
//             scene.add(atmosphere);

//             // Grid overlay
//             const wireGeometry = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(CONFIG.EARTH_RADIUS + 0.1, 2));
//             const wireMaterial = new THREE.LineBasicMaterial({ 
//                 color: 0x112244, 
//                 transparent: true, 
//                 opacity: 0.1 
//             });
//             const grid = new THREE.LineSegments(wireGeometry, wireMaterial);
//             scene.add(grid);
//         }

//         // Create complete network
//         function createNetwork() {
//             // Create backbone nodes (Tier 1)
//             for (let i = 0; i < CONFIG.NUM_BACKBONE; i++) {
//                 const position = getRandomPosition(CONFIG.EARTH_RADIUS);
//                 const node = createNode('backbone', position);
//                 nodes.push(node);
//             }

//             // Connect backbone nodes
//             connectBackboneNodes();

//             // Create ISP nodes (Tier 2)
//             for (let i = 0; i < CONFIG.NUM_ISPS; i++) {
//                 const backboneIndex = Math.floor(Math.random() * CONFIG.NUM_BACKBONE);
//                 const backboneNode = nodes[backboneIndex];
//                 const position = getRandomPositionNear(backboneNode.position, 3);
//                 const node = createNode('isp', position, backboneNode);
//                 nodes.push(node);
                
//                 // Create connection
//                 createConnection(backboneNode, node, 'isp');
//             }

//             // Create client nodes (Tier 3)
//             for (let i = 0; i < CONFIG.NUM_CLIENTS; i++) {
//                 const ispIndex = CONFIG.NUM_BACKBONE + Math.floor(Math.random() * CONFIG.NUM_ISPS);
//                 const ispNode = nodes[ispIndex];
//                 const position = getRandomPositionNear(ispNode.position, 2);
//                 const node = createNode('client', position, ispNode);
//                 nodes.push(node);
                
//                 // Create connection
//                 createConnection(ispNode, node, 'client');
//             }

//             // Update node count
//             stats.totalNodes = nodes.length;
//         }

//         // Create a network node
//         function createNode(type, position, parent = null) {
//             const group = new THREE.Group();
//             group.position.copy(position);
//             group.lookAt(0, 0, 0);

//             let geometry, material, mesh;

//             if (type === 'backbone') {
//                 // Large server box
//                 geometry = new THREE.BoxGeometry(1.2, 2.4, 1.2);
//                 material = new THREE.MeshStandardMaterial({ 
//                     color: CONFIG.COLORS.backbone,
//                     emissive: CONFIG.COLORS.backbone,
//                     emissiveIntensity: 0.2
//                 });
//                 mesh = new THREE.Mesh(geometry, material);
                
//                 // Store information for tooltip
//                 group.userData = {
//                     type: 'backbone',
//                     name: 'Tier 1 Backbone Server',
//                     description: 'Major data center that routes global internet traffic',
//                     connections: []
//                 };
//             } else if (type === 'isp') {
//                 // Medium ISP box
//                 geometry = new THREE.BoxGeometry(0.8, 1.6, 0.8);
//                 material = new THREE.MeshStandardMaterial({ 
//                     color: CONFIG.COLORS.isp,
//                     emissive: CONFIG.COLORS.isp,
//                     emissiveIntensity: 0.2
//                 });
//                 mesh = new THREE.Mesh(geometry, material);
                
//                 group.userData = {
//                     type: 'isp',
//                     name: 'Internet Service Provider',
//                     description: 'Connects local users to the global internet backbone',
//                     connections: []
//                 };
//             } else { // client
//                 // Small client cylinder
//                 geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8);
//                 material = new THREE.MeshStandardMaterial({ 
//                     color: CONFIG.COLORS.client,
//                     emissive: CONFIG.COLORS.client,
//                     emissiveIntensity: 0.2
//                 });
//                 mesh = new THREE.Mesh(geometry, material);
//                 mesh.rotation.x = Math.PI / 2;
                
//                 group.userData = {
//                     type: 'client',
//                     name: 'Client Device',
//                     description: 'Your computer, phone, or tablet that accesses the internet',
//                     connections: []
//                 };
//             }

//             group.add(mesh);

//             // Add connection pin
//             const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2);
//             const pinMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
//             const pin = new THREE.Mesh(pinGeometry, pinMaterial);
//             pin.rotation.x = Math.PI / 2;
//             pin.position.z = -0.6;
//             group.add(pin);

//             scene.add(group);
//             return group;
//         }

//         // Connect backbone nodes in a mesh network
//         function connectBackboneNodes() {
//             for (let i = 0; i < CONFIG.NUM_BACKBONE; i++) {
//                 for (let j = i + 1; j < CONFIG.NUM_BACKBONE; j++) {
//                     // Connect backbone nodes that are relatively close
//                     const distance = nodes[i].position.distanceTo(nodes[j].position);
//                     if (distance < CONFIG.EARTH_RADIUS * 3) {
//                         createConnection(nodes[i], nodes[j], 'backbone');
                        
//                         // Store connection info
//                         nodes[i].userData.connections.push(j);
//                         nodes[j].userData.connections.push(i);
//                     }
//                 }
//             }
//         }

//         // Create a connection between two nodes
//         function createConnection(fromNode, toNode, connectionType) {
//             const fromPos = fromNode.position;
//             const toPos = toNode.position;
//             const distance = fromPos.distanceTo(toPos);
            
//             // Create curved path
//             const arcHeight = CONFIG.EARTH_RADIUS + distance * 0.3;
//             const midPoint = fromPos.clone().add(toPos).multiplyScalar(0.5).normalize().multiplyScalar(arcHeight);
            
//             const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
//             const points = curve.getPoints(30);
//             const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
//             let color, opacity;
//             if (connectionType === 'backbone') {
//                 color = CONFIG.COLORS.lineBackbone;
//                 opacity = 0.4;
//             } else if (connectionType === 'isp') {
//                 color = CONFIG.COLORS.lineISP;
//                 opacity = 0.3;
//             } else {
//                 color = CONFIG.COLORS.lineClient;
//                 opacity = 0.2;
//             }
            
//             const material = new THREE.LineBasicMaterial({ 
//                 color: color,
//                 transparent: true,
//                 opacity: opacity,
//                 linewidth: 1
//             });
            
//             const line = new THREE.Line(geometry, material);
//             line.userData = { type: connectionType, from: fromNode, to: toNode };
//             scene.add(line);
//             connections.push(line);
            
//             stats.activeConnections++;
//         }

//         // Create data packets
//         function createPacket(startNode, endNode, packetType) {
//             const geometry = new THREE.SphereGeometry(0.3, 8, 8);
//             const color = packetType === 'request' ? CONFIG.COLORS.request : CONFIG.COLORS.response;
//             const material = new THREE.MeshBasicMaterial({ 
//                 color: color,
//                 emissive: color,
//                 emissiveIntensity: 0.5
//             });
            
//             const packet = new THREE.Mesh(geometry, material);
//             packet.position.copy(startNode.position);
            
//             // Store packet data
//             packet.userData = {
//                 type: packetType,
//                 startNode: startNode,
//                 endNode: endNode,
//                 progress: 0,
//                 speed: packetSpeed * (0.8 + Math.random() * 0.4)
//             };
            
//             scene.add(packet);
//             packets.push(packet);
            
//             // Show packet info
//             document.getElementById('packet-info').style.display = 'block';
//             return packet;
//         }

//         // Start a complete request-response cycle
//         function startRequest() {
//             // Find random client
//             const clientNodes = nodes.filter(n => n.userData.type === 'client');
//             if (clientNodes.length === 0) return;
            
//             const client = clientNodes[Math.floor(Math.random() * clientNodes.length)];
            
//             // Find random backbone server
//             const backboneNodes = nodes.filter(n => n.userData.type === 'backbone');
//             const server = backboneNodes[Math.floor(Math.random() * backboneNodes.length)];
            
//             // Create request packet
//             const requestPacket = createPacket(client, server, 'request');
            
//             // After delay, create response packet
//             setTimeout(() => {
//                 if (isRunning) {
//                     createPacket(server, client, 'response');
//                 }
//             }, 1500);
            
//             // Update packet count
//             document.getElementById('packet-count').textContent = packets.length;
//         }

//         // Update packet positions
//         function updatePackets() {
//             const packetsToRemove = [];
            
//             packets.forEach((packet, index) => {
//                 const data = packet.userData;
                
//                 if (isRunning) {
//                     data.progress += data.speed;
                    
//                     if (data.progress >= 1) {
//                         // Packet reached destination
//                         packetsToRemove.push(index);
//                     } else {
//                         // Move packet along curved path
//                         const fromPos = data.startNode.position;
//                         const toPos = data.endNode.position;
//                         const distance = fromPos.distanceTo(toPos);
//                         const arcHeight = CONFIG.EARTH_RADIUS + distance * 0.3;
//                         const midPoint = fromPos.clone().add(toPos).multiplyScalar(0.5).normalize().multiplyScalar(arcHeight);
                        
//                         const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
//                         const position = curve.getPoint(data.progress);
//                         packet.position.copy(position);
                        
//                         // Rotate packet
//                         packet.rotation.x += 0.02;
//                         packet.rotation.y += 0.03;
//                     }
//                 }
//             });
            
//             // Remove completed packets
//             for (let i = packetsToRemove.length - 1; i >= 0; i--) {
//                 const index = packetsToRemove[i];
//                 scene.remove(packets[index]);
//                 packets.splice(index, 1);
//             }
            
//             // Update packet count display
//             document.getElementById('packet-count').textContent = packets.length;
//         }

//         // Utility functions
//         function getRandomPosition(radius) {
//             const u = Math.random();
//             const v = Math.random();
//             const theta = 2 * Math.PI * u;
//             const phi = Math.acos(2 * v - 1);
//             const x = radius * Math.sin(phi) * Math.cos(theta);
//             const y = radius * Math.sin(phi) * Math.sin(theta);
//             const z = radius * Math.cos(phi);
//             return new THREE.Vector3(x, y, z);
//         }

//         function getRandomPositionNear(position, offset) {
//             const randomOffset = new THREE.Vector3(
//                 (Math.random() - 0.5) * offset,
//                 (Math.random() - 0.5) * offset,
//                 (Math.random() - 0.5) * offset
//             );
//             return position.clone().add(randomOffset).normalize().multiplyScalar(CONFIG.EARTH_RADIUS);
//         }

//         // Setup OrbitControls
//         function setupControls() {
//             // Simple auto-rotation
//             let rotationAngle = 0;
            
//             function updateCamera() {
//                 if (autoRotate) {
//                     rotationAngle += 0.002;
//                     camera.position.x = Math.cos(rotationAngle) * 40;
//                     camera.position.z = Math.sin(rotationAngle) * 40;
//                     camera.lookAt(0, 0, 0);
//                 }
//             }
            
//             // Add update to animation loop
//             const originalAnimate = animate;
//             animate = function() {
//                 updateCamera();
//                 originalAnimate();
//             };
//         }

//         // Setup event listeners
//         function setupEventListeners() {
//             // Mouse move for tooltip
//             renderer.domElement.addEventListener('mousemove', (event) => {
//                 const rect = renderer.domElement.getBoundingClientRect();
//                 const mouse = {
//                     x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
//                     y: -((event.clientY - rect.top) / rect.height) * 2 + 1
//                 };
                
//                 // Raycaster for node detection
//                 const raycaster = new THREE.Raycaster();
//                 raycaster.setFromCamera(mouse, camera);
//                 const intersects = raycaster.intersectObjects(nodes);
                
//                 if (intersects.length > 0) {
//                     const node = intersects[0].object;
//                     const nodeData = node.userData;
                    
//                     // Show tooltip
//                     const tooltip = document.getElementById('tooltip');
//                     tooltip.innerHTML = `
//                         <div class="tooltip-title">${nodeData.name}</div>
//                         <div>${nodeData.description}</div>
//                         <div style="margin-top: 10px; color: #a8d8ff;">
//                             Type: ${nodeData.type.toUpperCase()}<br>
//                             Connections: ${nodeData.connections.length}
//                         </div>
//                     `;
//                     tooltip.style.display = 'block';
//                     tooltip.style.left = (event.clientX + 15) + 'px';
//                     tooltip.style.top = (event.clientY + 15) + 'px';
                    
//                     // Highlight node
//                     node.scale.setScalar(1.2);
//                 } else {
//                     // Hide tooltip
//                     document.getElementById('tooltip').style.display = 'none';
                    
//                     // Reset node scales
//                     nodes.forEach(node => node.scale.setScalar(1));
//                 }
//             });
            
//             // Window resize
//             window.addEventListener('resize', () => {
//                 camera.aspect = document.getElementById('simulation-container').clientWidth / 
//                                document.getElementById('simulation-container').clientHeight;
//                 camera.updateProjectionMatrix();
//                 renderer.setSize(
//                     document.getElementById('simulation-container').clientWidth,
//                     document.getElementById('simulation-container').clientHeight
//                 );
//             });
//         }

//         // Setup UI controls
//         function setupUI() {
//             // Start traffic button
//             document.getElementById('start-traffic').addEventListener('click', () => {
//                 isRunning = true;
//                 autoRotate = true;
                
//                 // Start generating traffic
//                 const trafficInterval = setInterval(() => {
//                     if (isRunning && packets.length < 50) {
//                         startRequest();
//                     }
//                 }, 500);
                
//                 // Stop traffic generation when paused
//                 document.getElementById('pause-traffic').addEventListener('click', () => {
//                     clearInterval(trafficInterval);
//                 }, { once: true });
//             });
            
//             // Pause traffic button
//             document.getElementById('pause-traffic').addEventListener('click', () => {
//                 isRunning = false;
//                 autoRotate = false;
//             });
            
//             // Show data path button
//             document.getElementById('show-path').addEventListener('click', () => {
//                 // Highlight a random path
//                 const clientNodes = nodes.filter(n => n.userData.type === 'client');
//                 const backboneNodes = nodes.filter(n => n.userData.type === 'backbone');
                
//                 if (clientNodes.length > 0 && backboneNodes.length > 0) {
//                     const client = clientNodes[Math.floor(Math.random() * clientNodes.length)];
//                     const server = backboneNodes[Math.floor(Math.random() * backboneNodes.length)];
                    
//                     // Create highlighted path
//                     createConnection(client, server, 'backbone');
                    
//                     // Show explanation
//                     document.getElementById('network-status').innerHTML = `
//                         <p style="color: #2ed573; font-weight: bold;">
//                             Showing data path from Client to Backbone Server
//                         </p>
//                         <p style="color: #a8d8ff; line-height: 1.6;">
//                             This demonstrates how your request travels from your device through the network to reach a major server.
//                         </p>
//                     `;
//                 }
//             });
            
//             // Reset simulation button
//             document.getElementById('reset-sim').addEventListener('click', () => {
//                 // Clear all packets
//                 packets.forEach(packet => scene.remove(packet));
//                 packets = [];
                
//                 // Reset stats
//                 stats.activeConnections = 0;
//                 stats.packetsPerSecond = 0;
                
//                 // Update UI
//                 updateStats();
//                 document.getElementById('packet-info').style.display = 'none';
                
//                 // Show reset message
//                 document.getElementById('network-status').innerHTML = `
//                     <p style="color: #2ed573; font-weight: bold;">
//                         Simulation Reset Successfully
//                     </p>
//                     <p style="color: #a8d8ff; line-height: 1.6;">
//                         The network has been reset. Click "Start Traffic" to begin data transmission.
//                     </p>
//                 `;
//             });
            
//             // Add more packets button
//             document.getElementById('add-packets').addEventListener('click', () => {
//                 for (let i = 0; i < 5; i++) {
//                     setTimeout(() => startRequest(), i * 200);
//                 }
//             });
            
//             // Slow motion button
//             document.getElementById('slow-motion').addEventListener('click', () => {
//                 packetSpeed = CONFIG.SPEEDS.packet * 0.3;
//                 setTimeout(() => {
//                     packetSpeed = CONFIG.SPEEDS.packet;
//                 }, 5000);
                
//                 document.getElementById('network-status').innerHTML = `
//                     <p style="color: #2ed573; font-weight: bold;">
//                         Slow Motion Active (5 seconds)
//                     </p>
//                     <p style="color: #a8d8ff; line-height: 1.6;">
//                         Watching data packets move in slow motion helps understand their path through the network.
//                     </p>
//                 `;
//             });
//         }

//         // Update statistics display
//         function updateStats() {
//             document.getElementById('node-count').textContent = stats.totalNodes;
//             document.getElementById('packet-speed').textContent = Math.round(packets.length / 2);
//             document.getElementById('connections').textContent = stats.activeConnections;
//             document.getElementById('latency').textContent = Math.floor(Math.random() * 100) + 50;
            
//             // Update periodically
//             setTimeout(updateStats, 2000);
//         }

//         // Animation loop
//         function animate() {
//             requestAnimationFrame(animate);
            
//             if (isRunning) {
//                 updatePackets();
                
//                 // Animate nodes slightly
//                 nodes.forEach((node, index) => {
//                     const time = Date.now() * 0.001;
//                     const floatAmount = Math.sin(time + index) * 0.05;
//                     node.position.y += floatAmount * 0.01;
//                     node.position.normalize().multiplyScalar(CONFIG.EARTH_RADIUS);
//                 });
//             }
            
//             renderer.render(scene, camera);
//         }

//         // Initialize the simulation
//         window.addEventListener('DOMContentLoaded', init);