
        // Global Variables
        let currentSearchEngine = 'google';
        let currentWebsite = 'google';
        let currentISP = 'fiber';
        let currentCategory = 'all';
        let simulationActive = false;

        // DOM Elements
        const scrollContainer = document.getElementById('scrollContainer');
        const navDots = document.querySelectorAll('.dot');
        const searchEngineCards = document.querySelectorAll('.search-engine-card');
        const websiteCards = document.querySelectorAll('.website-card');
        const categoryButtons = document.querySelectorAll('.category-btn');
        const ispCards = document.querySelectorAll('.isp-card');
        const networkDiagram = document.getElementById('networkDiagram');
        const startSimulationBtn = document.getElementById('startSimulation');
        const performSearchBtn = document.getElementById('performSearch');
        const resetSimulationBtn = document.getElementById('resetSimulation');
        const urlBar = document.getElementById('urlBar');
        const loadingScreen = document.getElementById('loadingScreen');
        const defaultContent = document.getElementById('defaultContent');
        const searchResults = document.getElementById('searchResults');
        const selectedSearchEngine = document.getElementById('selectedSearchEngine');
        const selectedWebsite = document.getElementById('selectedWebsite');
        const selectedISP = document.getElementById('selectedISP');

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            initScrollSnap();
            setupEventListeners();
            createNetworkNodes();
            updateVisualization();
        });

        // Scroll Snap Navigation
        function initScrollSnap() {
            let currentSection = 0;
            
            // Update active dot based on scroll
            scrollContainer.addEventListener('scroll', function() {
                const sections = document.querySelectorAll('.section');
                const scrollPosition = scrollContainer.scrollTop + 100;
                
                sections.forEach((section, index) => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        currentSection = index;
                    }
                });
                
                updateNavDots(currentSection);
            });
            
            // Click on dots to scroll
            navDots.forEach(dot => {
                dot.addEventListener('click', function() {
                    const sectionIndex = parseInt(this.dataset.section);
                    const section = document.getElementById(`section${sectionIndex}`);
                    
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth' });
                        updateNavDots(sectionIndex);
                    }
                });
            });
            
            // Auto-update dots on scroll
            function updateNavDots(activeIndex) {
                navDots.forEach((dot, index) => {
                    if (index === activeIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        }

        // Setup Event Listeners
        function setupEventListeners() {
            // Search Engine Selection
            searchEngineCards.forEach(card => {
                card.addEventListener('click', function() {
                    searchEngineCards.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    currentSearchEngine = this.dataset.engine;
                    updateVisualization();
                });
            });

            // Website Category Filtering
            categoryButtons.forEach(button => {
                button.addEventListener('click', function() {
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    currentCategory = this.dataset.category;
                    
                    // Show/hide websites based on category
                    websiteCards.forEach(card => {
                        if (currentCategory === 'all' || card.dataset.category === currentCategory) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });

            // Website Selection
            websiteCards.forEach(card => {
                card.addEventListener('click', function() {
                    if (this.style.display !== 'none') {
                        websiteCards.forEach(c => c.classList.remove('active'));
                        this.classList.add('active');
                        currentWebsite = this.dataset.website;
                        updateVisualization();
                    }
                });
            });

            // ISP Selection
            ispCards.forEach(card => {
                card.addEventListener('click', function() {
                    ispCards.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    currentISP = this.dataset.isp;
                    updateVisualization();
                });
            });

            // Control Buttons
            startSimulationBtn.addEventListener('click', startNetworkSimulation);
            performSearchBtn.addEventListener('click', performSearchSimulation);
            resetSimulationBtn.addEventListener('click', resetSimulation);
            
            // Browser Close Button
            document.querySelector('.control-close').addEventListener('click', function() {
                resetSimulation();
            });
        }

        // Create Network Nodes
        function createNetworkNodes() {
            networkDiagram.innerHTML = '';
            
            const nodes = [
                { id: 'device', name: 'Device', icon: 'fa-laptop', color: '#667eea', x: 10, y: 50 },
                { id: 'router', name: 'Router', icon: 'fa-wifi', color: '#764ba2', x: 30, y: 50 },
                { id: 'isp', name: 'ISP', icon: 'fa-server', color: '#fa709a', x: 50, y: 50 },
                { id: 'internet', name: 'Internet', icon: 'fa-globe', color: '#fee140', x: 70, y: 50 },
                { id: 'website', name: 'Website', icon: 'fa-globe', color: '#4facfe', x: 90, y: 50 }
            ];
            
            // Create connections
            const connections = [
                { from: 'device', to: 'router', color: 'rgba(255, 255, 255, 0.5)' },
                { from: 'router', to: 'isp', color: 'rgba(255, 255, 255, 0.5)' },
                { from: 'isp', to: 'internet', color: 'rgba(255, 255, 255, 0.5)' },
                { from: 'internet', to: 'website', color: 'rgba(255, 255, 255, 0.5)' }
            ];
            
            // Draw connections
            connections.forEach(conn => {
                const connection = document.createElement('div');
                connection.className = 'connection';
                connection.id = `conn-${conn.from}-${conn.to}`;
                connection.style.backgroundColor = conn.color;
                networkDiagram.appendChild(connection);
            });
            
            // Draw nodes
            nodes.forEach(node => {
                const nodeElement = document.createElement('div');
                nodeElement.className = 'network-node';
                nodeElement.id = `node-${node.id}`;
                nodeElement.innerHTML = `
                    <div class="node-icon"><i class="fas ${node.icon}"></i></div>
                    <div>${node.name}</div>
                `;
                nodeElement.style.background = node.color;
                networkDiagram.appendChild(nodeElement);
            });
            
            // Position nodes and connections
            updateNetworkPositions();
        }

        // Update Network Positions
        function updateNetworkPositions() {
            const nodes = [
                { id: 'device', x: 10, y: 50 },
                { id: 'router', x: 30, y: 50 },
                { id: 'isp', x: 50, y: 50 },
                { id: 'internet', x: 70, y: 50 },
                { id: 'website', x: 90, y: 50 }
            ];
            
            const connections = [
                { from: 'device', to: 'router' },
                { from: 'router', to: 'isp' },
                { from: 'isp', to: 'internet' },
                { from: 'internet', to: 'website' }
            ];
            
            const containerWidth = networkDiagram.clientWidth;
            const containerHeight = networkDiagram.clientHeight;
            
            // Position nodes
            nodes.forEach(node => {
                const element = document.getElementById(`node-${node.id}`);
                if (element) {
                    element.style.left = `${(node.x / 100) * containerWidth - 40}px`;
                    element.style.top = `${(node.y / 100) * containerHeight - 40}px`;
                }
            });
            
            // Position connections
            connections.forEach(conn => {
                const fromElement = document.getElementById(`node-${conn.from}`);
                const toElement = document.getElementById(`node-${conn.to}`);
                const connection = document.getElementById(`conn-${conn.from}-${conn.to}`);
                
                if (fromElement && toElement && connection) {
                    const fromRect = fromElement.getBoundingClientRect();
                    const toRect = toElement.getBoundingClientRect();
                    const containerRect = networkDiagram.getBoundingClientRect();
                    
                    const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
                    const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
                    const x2 = toRect.left + toRect.width / 2 - containerRect.left;
                    const y2 = toRect.top + toRect.height / 2 - containerRect.top;
                    
                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                    
                    connection.style.width = `${length}px`;
                    connection.style.left = `${x1}px`;
                    connection.style.top = `${y1}px`;
                    connection.style.transform = `rotate(${angle}deg)`;
                }
            });
        }

        // Update Visualization
        function updateVisualization() {
            // Update selection displays
            selectedSearchEngine.textContent = getSearchEngineName(currentSearchEngine);
            selectedWebsite.textContent = getWebsiteName(currentWebsite);
            selectedISP.textContent = getISPName(currentISP);
            
            // Update URL bar
            const websiteUrl = getWebsiteURL(currentWebsite);
            urlBar.textContent = websiteUrl;
        }

        // Get Display Names
        function getSearchEngineName(engine) {
            const names = {
                google: 'Google',
                bing: 'Bing',
                duckduckgo: 'DuckDuckGo'
            };
            return names[engine] || 'Search Engine';
        }

        function getWebsiteName(website) {
            const names = {
                google: 'Google',
                youtube: 'YouTube',
                wikipedia: 'Wikipedia',
                amazon: 'Amazon',
                twitter: 'Twitter',
                github: 'GitHub'
            };
            return names[website] || 'Website';
        }

        function getISPName(isp) {
            const names = {
                fiber: 'Fiber Optic',
                cable: 'Cable Internet'
            };
            return names[isp] || 'Internet Provider';
        }

        function getWebsiteURL(website) {
            const urls = {
                google: 'https://www.google.com',
                youtube: 'https://www.youtube.com',
                wikipedia: 'https://www.wikipedia.org',
                amazon: 'https://www.amazon.com',
                twitter: 'https://www.twitter.com',
                github: 'https://www.github.com'
            };
            return urls[website] || 'https://www.example.com';
        }

        // Network Simulation
        function startNetworkSimulation() {
            if (simulationActive) return;
            simulationActive = true;
            
            resetNetworkAnimation();
            animateDataFlow();
        }

        // Search Simulation
        function performSearchSimulation() {
            // Show loading screen
            loadingScreen.style.display = 'block';
            defaultContent.style.display = 'none';
            searchResults.style.display = 'none';
            
            // Reset network
            resetNetworkAnimation();
            
            // Update URL for search
            urlBar.textContent = `https://www.${currentSearchEngine}.com/search?q=how+web+technology+works`;
            
            // Simulate loading delay
            setTimeout(() => {
                // Hide loading screen
                loadingScreen.style.display = 'none';
                
                // Show search results
                searchResults.style.display = 'block';
                
                // Animate search flow
                animateSearchFlow();
            }, 2000);
        }

        // Reset Simulation
        function resetSimulation() {
            resetNetworkAnimation();
            loadingScreen.style.display = 'none';
            searchResults.style.display = 'none';
            defaultContent.style.display = 'block';
            updateVisualization();
            simulationActive = false;
        }

        // Reset Network Animation
        function resetNetworkAnimation() {
            // Clear data packets
            const packets = document.querySelectorAll('.data-packet');
            packets.forEach(packet => packet.remove());
            
            // Reset connections
            const connections = document.querySelectorAll('.connection');
            connections.forEach(conn => {
                conn.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            });
        }

        // Animate Data Flow
        function animateDataFlow() {
            const paths = [
                ['device', 'router', 'isp', 'internet', 'website'],
                ['website', 'internet', 'isp', 'router', 'device']
            ];
            
            paths.forEach((path, index) => {
                setTimeout(() => {
                    createDataPacket(path, index === 0 ? '#ffffff' : '#fee140');
                }, index * 1000);
            });
        }

        // Animate Search Flow
        function animateSearchFlow() {
            const paths = [
                ['device', 'router', 'isp', 'internet'],
                ['internet', 'website'],
                ['website', 'internet', 'isp', 'router', 'device']
            ];
            
            paths.forEach((path, index) => {
                setTimeout(() => {
                    createDataPacket(path, ['#ffffff', '#fa709a', '#4facfe'][index]);
                }, index * 1500);
            });
        }

        // Create Data Packet Animation
        function createDataPacket(path, color) {
            const packet = document.createElement('div');
            packet.className = 'data-packet';
            packet.innerHTML = '<i class="fas fa-circle"></i>';
            packet.style.backgroundColor = color;
            packet.style.color = color === '#ffffff' ? '#333' : '#fff';
            networkDiagram.appendChild(packet);
            
            let currentStep = 0;
            
            function movePacket() {
                if (currentStep >= path.length - 1) {
                    setTimeout(() => {
                        if (packet.parentNode) {
                            packet.parentNode.removeChild(packet);
                        }
                    }, 500);
                    return;
                }
                
                const fromNode = document.getElementById(`node-${path[currentStep]}`);
                const toNode = document.getElementById(`node-${path[currentStep + 1]}`);
                
                if (fromNode && toNode) {
                    const fromRect = fromNode.getBoundingClientRect();
                    const toRect = toNode.getBoundingClientRect();
                    const containerRect = networkDiagram.getBoundingClientRect();
                    
                    const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
                    const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
                    const toX = toRect.left + toRect.width / 2 - containerRect.left;
                    const toY = toRect.top + toRect.height / 2 - containerRect.top;
                    
                    // Position packet
                    packet.style.left = `${fromX - 10}px`;
                    packet.style.top = `${fromY - 10}px`;
                    
                    // Highlight connection
                    const connId = `conn-${path[currentStep]}-${path[currentStep + 1]}`;
                    const connection = document.getElementById(connId);
                    
                    if (connection) {
                        connection.style.backgroundColor = color;
                        connection.style.height = '5px';
                        
                        setTimeout(() => {
                            connection.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                            connection.style.height = '3px';
                        }, 800);
                    }
                    
                    // Animate packet movement
                    packet.style.transition = 'left 0.8s ease, top 0.8s ease';
                    setTimeout(() => {
                        packet.style.left = `${toX - 10}px`;
                        packet.style.top = `${toY - 10}px`;
                    }, 10);
                    
                    // Pulse nodes
                    fromNode.style.animation = 'pulse 0.8s ease';
                    toNode.style.animation = 'pulse 0.8s ease';
                    
                    setTimeout(() => {
                        fromNode.style.animation = '';
                        toNode.style.animation = '';
                    }, 800);
                }
                
                currentStep++;
                setTimeout(movePacket, 1000);
            }
            
            movePacket();
        }

        // Handle Window Resize
        window.addEventListener('resize', function() {
            updateNetworkPositions();
        });