
        // Initialize floating shapes
        const floatingShapes = document.getElementById('floating-shapes');
        const colors = ['#FF9800', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8'];
        
        // Adjust number of shapes based on screen size
        const isMobile = window.innerWidth < 768;
        const shapeCount = isMobile ? 15 : 25;
        
        for (let i = 0; i < shapeCount; i++) {
            const shape = document.createElement('div');
            shape.classList.add('shape');
            
            const size = Math.random() * (isMobile ? 60 : 100) + 20;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
            shape.style.backgroundColor = color;
            shape.style.left = `${Math.random() * 100}%`;
            shape.style.top = `${Math.random() * 100}%`;
            shape.style.animationDuration = `${Math.random() * 30 + 20}s`;
            shape.style.animationDelay = `${Math.random() * 5}s`;
            
            floatingShapes.appendChild(shape);
        }
        
        // Get DOM elements
        const aiButton = document.getElementById('ai-button');
        const cloudButton = document.getElementById('cloud-button');
        const aiSimulation = document.getElementById('ai-simulation');
        const cloudSimulation = document.getElementById('cloud-simulation');
        const clickCounter = document.getElementById('click-count');
        
        // Modal elements
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        const close = document.querySelector('.close');

        close.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.add('hidden');
            }
        });
        
        // Track clicks
        let totalClicks = 0;
        const buttonStates = {
            ai: new Set(),
            cloud: new Set()
        };
        
        function trackClick(buttonType) {
            totalClicks++;
            clickCounter.textContent = totalClicks;
            buttonStates[buttonType].add(buttonType);
            
            // Update badges
            const aiBadge = document.querySelector('#ai-button .button-badge');
            const cloudBadge = document.querySelector('#cloud-button .button-badge');
            
            if (aiBadge) {
                const remainingAI = 5 - Math.min(buttonStates.ai.size, 5);
                aiBadge.textContent = remainingAI;
                aiBadge.style.display = remainingAI > 0 ? 'flex' : 'none';
            }
            
            if (cloudBadge) {
                const remainingCloud = 5 - Math.min(buttonStates.cloud.size, 5);
                cloudBadge.textContent = remainingCloud;
                cloudBadge.style.display = remainingCloud > 0 ? 'flex' : 'none';
            }
        }
        
        // Main buttons with touch/click support
        function activateButton(button, type) {
            if (type === 'ai') {
                aiButton.classList.add('active');
                cloudButton.classList.remove('active');
                aiSimulation.classList.remove('hidden');
                cloudSimulation.classList.add('hidden');
            } else {
                cloudButton.classList.add('active');
                aiButton.classList.remove('active');
                cloudSimulation.classList.remove('hidden');
                aiSimulation.classList.add('hidden');
            }
            
            modal.classList.add('hidden');
            trackClick(type);
            
            // Add visual feedback
            button.style.animation = 'none';
            setTimeout(() => {
                button.style.animation = 'pulse-active 1.5s infinite ease-in-out';
            }, 10);
        }
        
        aiButton.addEventListener('click', () => activateButton(aiButton, 'ai'));
        cloudButton.addEventListener('click', () => activateButton(cloudButton, 'cloud'));
        
        // Add touch event listeners for mobile
        aiButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('touching');
        }, {passive: false});
        
        cloudButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('touching');
        }, {passive: false});
        
        // AI Simulation Elements
        const detectObjectsBtn = document.getElementById('detect-objects');
        const askAiBtn = document.getElementById('ask-ai');
        const findPatternBtn = document.getElementById('find-pattern');
        const creativeAiBtn = document.getElementById('creative-ai');
        const aiLearningBtn = document.getElementById('ai-learning');
        const aiQuestionInput = document.getElementById('ai-question');
        
        // Cloud Simulation Elements
        const saveCloudBtn = document.getElementById('save-cloud');
        const connectCloudBtn = document.getElementById('connect-cloud');
        const cloudPowerBtn = document.getElementById('cloud-power');
        const cloudSyncBtn = document.getElementById('cloud-sync');
        const cloudSecurityBtn = document.getElementById('cloud-security');
        
        // Data for simulations
        const objects = ['a happy cat 🐱', 'a playful dog 🐶', 'a red car 🚗', 'a big tree 🌳', 'a cozy house 🏠', 
                        'a blue bicycle 🚲', 'a pretty flower 🌸', 'a interesting book 📚', 'a yellow sun ☀️', 
                        'a bright star ⭐', 'a tasty pizza 🍕', 'a sweet cupcake 🧁'];
        
        const aiQuestions = [
            { keywords: ["what", "ai"], answer: "AI stands for Artificial Intelligence! It's like giving computers a brain to think and learn, similar to how humans do! AI can help doctors, play games, and even drive cars!" },
            { keywords: ["see", "vision"], answer: "Yes! With computer vision, AI can 'see' and recognize objects in images and videos, just like we do with our eyes! It's used in face recognition and self-driving cars!" },
            { keywords: ["learn", "smart"], answer: "AI learns from lots and lots of data, like pictures, sounds, and text. The more data it has, the smarter it becomes! It's like studying for a test, but AI studies millions of examples!" },
            { keywords: ["creative", "art"], answer: "Yes! AI can create art, music, and stories by learning from existing creative works and making new combinations! Some AI can even help write songs and draw pictures!" },
            { keywords: ["help", "use"], answer: "AI helps us every day! It powers voice assistants, recommends videos you might like, helps doctors find diseases, and even helps predict the weather! It's like having a super-smart helper!" }
        ];
        
        const patterns = [
            { pattern: "🔴 🟡 🔴 🟡 🔴", next: "🟡", description: "red-yellow alternating" },
            { pattern: "⭐ 🌙 ⭐ 🌙 ⭐", next: "🌙", description: "star-moon alternating" },
            { pattern: "▲ ▼ ▲ ▼ ▲", next: "▼", description: "up-down triangle" },
            { pattern: "1️⃣ 2️⃣ 3️⃣ 1️⃣ 2️⃣", next: "3️⃣", description: "counting 1-2-3" },
            { pattern: "🐶 🐱 🐶 🐱 🐶", next: "🐱", description: "dog-cat alternating" },
            { pattern: "🍎 🍎 🍌 🍎 🍎", next: "🍌", description: "apple-apple-banana" }
        ];
        
        const creativeIdeas = [
            { type: "Story Idea", content: "A robot who learns to paint by watching sunsets! 🎨🤖🌅" },
            { type: "Invention", content: "Smart shoes that help you find your way home! 👟🏠🗺️" },
            { type: "Game Concept", content: "A puzzle game where you teach AI to recognize shapes! 🎮🔷🔶" },
            { type: "Art Style", content: "Rainbow-colored clouds floating in a digital sky! 🌈☁️✨" },
            { type: "Music Idea", content: "A song where each note is a different animal sound! 🎵🐾🎶" }
        ];
        
        // Button enhancement function
        function enhanceButton(button, callback) {
            const handler = function() {
                trackClick(aiSimulation.classList.contains('hidden') ? 'cloud' : 'ai');
                
                // Add loading state
                const originalHTML = button.innerHTML;
                button.classList.add('loading');
                button.disabled = true;
                
                // Add success animation after callback
                setTimeout(() => {
                    button.classList.remove('loading');
                    button.classList.add('success');
                    
                    setTimeout(() => {
                        button.classList.remove('success');
                        button.disabled = false;
                    }, 1000);
                    
                    callback();
                }, 800);
            };
            
            // Add both click and touch events
            button.addEventListener('click', handler);
            button.addEventListener('touchend', function(e) {
                e.preventDefault();
                handler();
            }, {passive: false});
        }
        
        // AI Buttons
        enhanceButton(detectObjectsBtn, () => {
            const randomObjects = [];
            for (let i = 0; i < 4; i++) {
                randomObjects.push(objects[Math.floor(Math.random() * objects.length)]);
            }
            
            modalBody.innerHTML = `
                <div class="output-icon">🤖</div>
                <div class="output-text">
                    <strong>🔍 AI Detective Report:</strong><br><br>
                    Objects found: ${randomObjects.join(', ')}<br><br>
                    <div class="fun-fact">
                        💡 <strong>Did you know?</strong> AI uses millions of example images to learn what objects look like. 
                        That's why it can recognize things so quickly!
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        });
        
        enhanceButton(askAiBtn, () => {
            const question = aiQuestionInput.value.trim().toLowerCase();
            
            if (question) {
                let answer = null;
                for (const q of aiQuestions) {
                    if (q.keywords.some(keyword => question.includes(keyword))) {
                        answer = q.answer;
                        break;
                    }
                }
                
                if (!answer) {
                    const responses = [
                        "That's a great question! AI learns by studying lots of examples, just like you learn in school! 📚",
                        "Hmm, let me think... AI uses something called algorithms to solve problems step by step! 🧮",
                        "Interesting question! AI can help doctors, scientists, and even artists with their work! 🔬🎨",
                        "AI is like a super helper that can do repetitive tasks very quickly without getting tired! ⚡"
                    ];
                    answer = responses[Math.floor(Math.random() * responses.length)];
                }
                
                modalBody.innerHTML = `
                    <div class="output-icon">🤖</div>
                    <div class="output-text">
                        <strong>You asked:</strong> "${aiQuestionInput.value}"<br><br>
                        🤖 <strong>AI says:</strong> ${answer}
                    </div>
                `;
            } else {
                const randomQ = aiQuestions[Math.floor(Math.random() * aiQuestions.length)];
                modalBody.innerHTML = `
                    <div class="output-icon">🤖</div>
                    <div class="output-text">
                        💭 <strong>Try asking:</strong><br>
                        "What is AI?" or "How does AI learn?"<br><br>
                        Type your question above and tap Ask!
                    </div>
                `;
            }
            
            aiQuestionInput.value = "";
            modal.classList.remove('hidden');
        });
        
        enhanceButton(findPatternBtn, () => {
            const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            modalBody.innerHTML = `
                <div class="output-icon">🤖</div>
                <div class="output-text">
                    <strong>🎯 Pattern Discovery:</strong><br><br>
                    <div style="font-size: 1.5rem; margin: 15px 0;">
                        ${randomPattern.pattern} <strong style="color: #FFD54F;">?</strong>
                    </div>
                    <strong>AI predicts:</strong> ${randomPattern.next}<br>
                    <em>(${randomPattern.description} pattern)</em><br><br>
                    <div class="fun-fact">
                        💡 <strong>Fun Fact:</strong> AI finds patterns in weather data to predict if it will rain, 
                        in your viewing habits to recommend shows, and even in game moves to beat champions!
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        });
        
        enhanceButton(creativeAiBtn, () => {
            const idea = creativeIdeas[Math.floor(Math.random() * creativeIdeas.length)];
            
            modalBody.innerHTML = `
                <div class="output-icon">🤖</div>
                <div class="output-text">
                    <strong>🎨 AI Creative Generator</strong><br><br>
                    <div style="background: rgba(255, 152, 0, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <strong style="color: #FFD54F;">${idea.type}:</strong><br>
                        <span style="font-size: 1.4rem;">${idea.content}</span>
                    </div>
                    <div class="fun-fact">
                        💡 <strong>Amazing!</strong> AI can combine ideas it has learned to create brand new things. 
                        It's like mixing different colors to make a new color!
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        });
        
        enhanceButton(aiLearningBtn, () => {
            modal.classList.remove('hidden');
            
            modalBody.innerHTML = `
                <div class="output-icon">🤖</div>
                <div class="output-text">
                    <strong>📈 AI Learning Simulation</strong><br><br>
                    Watch AI get smarter as it learns!<br><br>
                    <div class="progress-bar">
                        <div class="progress-fill" id="learning-progress" style="width: 0%;">0%</div>
                    </div>
                    <div id="learning-stages"></div>
                </div>
            `;
            
            const stages = [
                { percent: 20, text: "🔍 Collecting data..." },
                { percent: 40, text: "🧠 Analyzing patterns..." },
                { percent: 60, text: "📊 Building knowledge..." },
                { percent: 80, text: "🎯 Testing accuracy..." },
                { percent: 100, text: "✅ AI is now smarter!" }
            ];
            
            let currentStage = 0;
            const learningProgress = document.getElementById('learning-progress');
            const learningStages = document.getElementById('learning-stages');
            
            const interval = setInterval(() => {
                if (currentStage < stages.length) {
                    learningProgress.style.width = stages[currentStage].percent + '%';
                    learningProgress.textContent = stages[currentStage].percent + '%';
                    learningStages.innerHTML += `<div style="margin: 10px 0; color: #C8E6C9;">${stages[currentStage].text}</div>`;
                    currentStage++;
                } else {
                    clearInterval(interval);
                    learningStages.innerHTML += `
                        <div class="fun-fact" style="margin-top: 20px;">
                            💡 <strong>How it works:</strong> AI learns by practicing millions of times! 
                            The more it practices, the better it gets at its job!
                        </div>
                    `;
                }
            }, 800);
        });
        
        // Cloud Buttons
        const fileTypes = ['homework.txt 📝', 'vacation.jpg 📸', 'game.save 🎮', 'music.mp3 🎵', 
                          'drawing.png 🎨', 'video.mov 🎬', 'story.doc 📄', 'photos.zip 🖼️'];
        
        const cloudActivities = [
            "✨ Saving your file to multiple cloud servers around the world for safety!",
            "🌍 Your file is now accessible from any device, anywhere!",
            "🔄 The cloud is backing up your file so you never lose it!",
            "☁️ Your file is stored safely in the cloud and protected!"
        ];
        
        const devices = ['your laptop 💻', 'your tablet 📱', 'your phone 📲', 
                        'your smartwatch ⌚', 'a smart TV 📺', 'your gaming console 🎮'];
        
        enhanceButton(saveCloudBtn, () => {
            const randomFile = fileTypes[Math.floor(Math.random() * fileTypes.length)];
            const randomActivity = cloudActivities[Math.floor(Math.random() * cloudActivities.length)];
            
            modalBody.innerHTML = `
                <div class="output-icon">☁️</div>
                <div class="output-text">
                    <strong>💾 Saving to Cloud...</strong><br><br>
                    <div style="font-size: 1.5rem; margin: 15px 0;">
                        ${randomFile}
                    </div>
                    ${randomActivity}<br><br>
                    <div class="fun-fact">
                        💡 <strong>Cool Fact:</strong> The cloud isn't really in the sky! It's thousands of powerful 
                        computers in special buildings called data centers all around the world!
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        });
        
        enhanceButton(connectCloudBtn, () => {
            const connectedDevices = [];
            const numDevices = Math.floor(Math.random() * 3) + 3;
            
            for (let i = 0; i < numDevices; i++) {
                const device = devices[Math.floor(Math.random() * devices.length)];
                if (!connectedDevices.includes(device)) {
                    connectedDevices.push(device);
                }
            }
            
            modalBody.innerHTML = `
                <div class="output-icon">☁️</div>
                <div class="output-text">
                    <strong>🌐 Cloud Connection Established!</strong><br><br>
                    <div style="background: rgba(76, 175, 80, 0.2); padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <strong>Connected devices:</strong><br>
                        ${connectedDevices.map(d => `✅ ${d}`).join('<br>')}
                    </div>
                    All your devices can now share and sync data!<br><br>
                    <div class="fun-fact">
                        💡 <strong>Did you know?</strong> When you save a photo on your phone, the cloud can 
                        instantly make it appear on your tablet too! That's cloud magic! ✨
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        });
        
        enhanceButton(cloudPowerBtn, () => {
            modalBody.innerHTML = `
                <div class="output-icon">☁️</div>
                <div class="output-text">
                    <strong>⚡ Cloud Power Activated!</strong><br><br>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; text-align: left;">
                        <div style="background: rgba(33, 150, 243, 0.2); padding: 10px; border-radius: 8px;">
                            🎮 <strong>Gaming:</strong> Play online with friends
                        </div>
                        <div style="background: rgba(255, 152, 0, 0.2); padding: 10px; border-radius: 8px;">
                            🎥 <strong>Streaming:</strong> Watch videos anywhere
                        </div>
                        <div style="background: rgba(76, 175, 80, 0.2); padding: 10px; border-radius: 8px;">
                            📚 <strong>Learning:</strong> Access school apps
                        </div>
                        <div style="background: rgba(156, 39, 176, 0.2); padding: 10px; border-radius: 8px;">
                            👨‍👩‍👧 <strong>Sharing:</strong> Share photos with family
                        </div>
                    </div>
                    <div class="fun-fact">
                        💡 <strong>Super Cool:</strong> The cloud is like having a supercomputer that millions 
                        of people can use at the same time without slowing down!
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        });
        
        enhanceButton(cloudSyncBtn, () => {
            modal.classList.remove('hidden');
            
            modalBody.innerHTML = `
                <div class="output-icon">☁️</div>
                <div class="output-text">
                    <strong>🔄 Cloud Sync in Progress...</strong><br><br>
                    <div class="progress-bar">
                        <div class="progress-fill" id="sync-progress" style="width: 0%;">0%</div>
                    </div>
                    <div id="sync-status"></div>
                </div>
            `;
            
            const syncSteps = [
                { percent: 25, text: "📤 Uploading changes from phone..." },
                { percent: 50, text: "🔄 Syncing with cloud servers..." },
                { percent: 75, text: "📥 Downloading to other devices..." },
                { percent: 100, text: "✅ All devices are now in sync!" }
            ];
            
            let step = 0;
            const syncProgress = document.getElementById('sync-progress');
            const syncStatus = document.getElementById('sync-status');
            
            const syncInterval = setInterval(() => {
                if (step < syncSteps.length) {
                    syncProgress.style.width = syncSteps[step].percent + '%';
                    syncProgress.textContent = syncSteps[step].percent + '%';
                    syncStatus.innerHTML += `<div style="margin: 10px 0; color: #C8E6C9;">${syncSteps[step].text}</div>`;
                    step++;
                } else {
                    clearInterval(syncInterval);
                    syncStatus.innerHTML += `
                        <div class="fun-fact" style="margin-top: 20px;">
                            💡 <strong>Amazing:</strong> Cloud sync happens automatically! When you take a photo, 
                            it's instantly backed up and appears on all your devices within seconds!
                        </div>
                    `;
                }
            }, 700);
        });
        
        enhanceButton(cloudSecurityBtn, () => {
            modalBody.innerHTML = `
                <div class="output-icon">☁️</div>
                <div class="output-text">
                    <strong>🛡️ Cloud Security Check</strong><br><br>
                    <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                        <div style="margin: 15px 0; padding: 10px; background: rgba(76, 175, 80, 0.2); border-radius: 8px;">
                            ✅ <strong>Encryption:</strong> Your data is locked with a secret code
                        </div>
                        <div style="margin: 15px 0; padding: 10px; background: rgba(33, 150, 243, 0.2); border-radius: 8px;">
                            ✅ <strong>Passwords:</strong> Only you can access your files
                        </div>
                        <div style="margin: 15px 0; padding: 10px; background: rgba(255, 152, 0, 0.2); border-radius: 8px;">
                            ✅ <strong>Backups:</strong> Multiple copies kept safe
                        </div>
                        <div style="margin: 15px 0; padding: 10px; background: rgba(156, 39, 176, 0.2); border-radius: 8px;">
                            ✅ <strong>Firewalls:</strong> Protects against hackers
                        </div>
                    </div>
                    <div class="fun-fact" style="margin-top: 20px;">
                        💡 <strong>Stay Safe:</strong> Always use strong passwords and never share them with anyone! 
                        The cloud keeps your data safe, but you need to protect your password! 🔐
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        });
        
        // Enter key for AI question
        aiQuestionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                askAiBtn.click();
            }
        });
        
        // Handle virtual keyboard on mobile
        aiQuestionInput.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
        
        // Initialize
        aiSimulation.classList.remove('hidden');
        cloudSimulation.classList.add('hidden');
        
        // Initialize click counter
        trackClick('ai');
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // Update any dynamic elements if needed
            }, 250);
        });
        
        // Prevent double-tap zoom on mobile
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Handle orientation change
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        });