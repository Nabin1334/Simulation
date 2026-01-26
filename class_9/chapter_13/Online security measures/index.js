// Image URLs to be loaded via JavaScript
        const imageData = {
            privacy: [
                {
                    id: "privacy-image-1",
                    url: "online_piracy.webp",
                    alt: "Online privacy concept with lock and digital elements"
                },
                {
                    id: "privacy-image-2", 
                    url: "pyracy_setting.webp",
                    alt: "Privacy settings on a digital device"
                }
            ],
            cyberbullying: [
                {
                    id: "cyberbullying-image-1",
                    url: "cyber_bullying.jpeg",
                    alt: "Cyberbullying awareness and prevention"
                },
                {
                    id: "cyberbullying-image-2",
                    url: "stop.webp",
                    alt: "Support for cyberbullying victims"
                }
            ],
            footprint: [
                {
                    id: "footprint-image-1",
                    url: "digital_footprint.webp",
                    alt: "Digital footprint concept with data trail"
                },
                {
                    id: "footprint-image-2",
                    url: "digital.webp",
                    alt: "Visibility of digital information"
                }
            ],
            firewall: [
                {
                    id: "firewall-image-1",
                    url: "firewall.webp",
                    alt: "Firewall protection concept"
                },
                {
                    id: "firewall-image-2",
                    url: "anti.webp",
                    alt: "Antivirus software protection"
                }
            ],
            social: [
                {
                    id: "social-image-1",
                    url: "https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    alt: "Social media safety practices"
                },
                {
                    id: "social-image-2",
                    url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    alt: "Account security settings"
                }
            ],
            socialGallery: [
                {
                    url: "https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    alt: "Social media safety tip 1"
                },
                {
                    url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    alt: "Social media safety tip 2"
                },
                {
                    url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    alt: "Social media safety tip 3"
                },
                {
                    url: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    alt: "Social media safety tip 4"
                }
            ]
        };
        
        // Notification system functions
        const notificationPanel = document.getElementById('notification-panel');
        const notificationTitle = document.getElementById('notification-title');
        const notificationMessage = document.getElementById('notification-message');
        const notificationIcon = document.getElementById('notification-icon');
        const notificationClose = document.getElementById('notification-close');
        
        function showNotification(title, message, type = 'info') {
            notificationTitle.textContent = title;
            notificationMessage.textContent = message;
            
            // Set color and icon based on type
            if (type === 'success') {
                notificationPanel.style.borderLeftColor = '#4caf50';
                notificationIcon.className = 'fas fa-check-circle';
                notificationIcon.style.color = '#4caf50';
            } else if (type === 'warning') {
                notificationPanel.style.borderLeftColor = '#ff9800';
                notificationIcon.className = 'fas fa-exclamation-triangle';
                notificationIcon.style.color = '#ff9800';
            } else if (type === 'error') {
                notificationPanel.style.borderLeftColor = '#f44336';
                notificationIcon.className = 'fas fa-times-circle';
                notificationIcon.style.color = '#f44336';
            } else {
                notificationPanel.style.borderLeftColor = '#3949ab';
                notificationIcon.className = 'fas fa-info-circle';
                notificationIcon.style.color = '#3949ab';
            }
            
            notificationPanel.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                notificationPanel.classList.remove('show');
            }, 5000);
        }
        
        notificationClose.addEventListener('click', function() {
            notificationPanel.classList.remove('show');
        });
        
        // Function to load images dynamically
        function loadImages() {
            console.log("Loading images dynamically via JavaScript...");
            
            // Load images for each section
            Object.keys(imageData).forEach(section => {
                if (section !== 'socialGallery') {
                    imageData[section].forEach(imgData => {
                        const imgElement = document.getElementById(imgData.id);
                        if (imgElement) {
                            const img = new Image();
                            img.src = imgData.url;
                            img.alt = imgData.alt;
                            img.classList.add('card-image');
                            
                            img.onload = function() {
                                imgElement.parentNode.replaceChild(img, imgElement);
                                console.log(`Loaded image: ${imgData.id}`);
                            };
                            
                            img.onerror = function() {
                                console.error(`Failed to load image: ${imgData.url}`);
                                imgElement.innerHTML = `<i class="fas fa-image" style="font-size: 3rem; color: #ccc;"></i><br>Image: ${imgData.alt}`;
                                imgElement.classList.remove('image-loading');
                            };
                        }
                    });
                }
            });
            
            // Load social media gallery images
            const socialGallery = document.getElementById('social-gallery');
            if (socialGallery) {
                // Clear any existing content
                socialGallery.innerHTML = '';
                
                imageData.socialGallery.forEach(imgData => {
                    const img = new Image();
                    img.src = imgData.url;
                    img.alt = imgData.alt;
                    img.classList.add('gallery-img');
                    
                    img.onload = function() {
                        socialGallery.appendChild(img);
                    };
                    
                    img.onerror = function() {
                        console.error(`Failed to load gallery image: ${imgData.url}`);
                    };
                });
            }
        }
        
        // Function to load images for a specific section
        function loadSectionImages(sectionId) {
            console.log(`Loading images for section: ${sectionId}`);
            
            if (imageData[sectionId]) {
                imageData[sectionId].forEach(imgData => {
                    const imgElement = document.getElementById(imgData.id);
                    if (imgElement && !imgElement.src) {
                        const img = new Image();
                        img.src = imgData.url;
                        img.alt = imgData.alt;
                        img.classList.add('card-image');
                        
                        img.onload = function() {
                            if (imgElement.parentNode) {
                                imgElement.parentNode.replaceChild(img, imgElement);
                            }
                        };
                    }
                });
            }
        }
        
        // Navigation between sections
        const navButtons = document.querySelectorAll('.nav-btn');
        const contentSections = document.querySelectorAll('.content-section');
        
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons and sections
                navButtons.forEach(btn => btn.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Show corresponding section
                const sectionId = this.getAttribute('data-section');
                document.getElementById(sectionId).classList.add('active');
                
                // Load images for this section if not already loaded
                loadSectionImages(sectionId);
            });
        });
        
        // Privacy Checker
        const privacyOptions = document.querySelectorAll('.privacy-option');
        const checkPrivacyBtn = document.getElementById('check-privacy');
        const privacyResults = document.getElementById('privacy-results');
        
        privacyOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selection from other options in same question
                const questionDiv = this.closest('.privacy-question');
                const siblings = questionDiv.querySelectorAll('.privacy-option');
                siblings.forEach(sib => sib.classList.remove('selected'));
                
                // Select this option
                this.classList.add('selected');
            });
        });
        
        checkPrivacyBtn.addEventListener('click', function() {
            let totalScore = 0;
            let maxScore = 0;
            
            // Calculate score from all questions
            const questions = document.querySelectorAll('.privacy-question');
            questions.forEach(question => {
                const selectedOption = question.querySelector('.privacy-option.selected');
                if (selectedOption) {
                    totalScore += parseInt(selectedOption.getAttribute('data-value'));
                }
                maxScore += 3; // Each question has max 3 points
            });
            
            // Calculate percentage
            const percentage = Math.round((totalScore / maxScore) * 100);
            
            // Update display
            const privacyScoreBar = document.getElementById('privacy-score-bar');
            const privacyScoreText = document.getElementById('privacy-score-text');
            const privacyFeedback = document.getElementById('privacy-feedback');
            
            privacyScoreBar.style.width = `${percentage}%`;
            privacyScoreText.textContent = `Privacy Score: ${percentage}%`;
            
            // Provide feedback based on score
            if (percentage >= 80) {
                privacyScoreBar.style.backgroundColor = '#4caf50';
                privacyFeedback.textContent = "Excellent! You have strong privacy habits. Keep making safe choices online.";
                privacyFeedback.style.color = '#4caf50';
            } else if (percentage >= 60) {
                privacyScoreBar.style.backgroundColor = '#ff9800';
                privacyFeedback.textContent = "Good! You're aware of privacy concerns but could improve. Review the tips in this guide.";
                privacyFeedback.style.color = '#ff9800';
            } else {
                privacyScoreBar.style.backgroundColor = '#f44336';
                privacyFeedback.textContent = "Your privacy awareness needs improvement. Be more cautious about what you share online.";
                privacyFeedback.style.color = '#f44336';
            }
            
            // Show results
            privacyResults.classList.add('show');
            
            // Show notification instead of alert
            showNotification(
                "Privacy Check Complete", 
                `Your privacy score is ${percentage}%`, 
                percentage >= 80 ? 'success' : (percentage >= 60 ? 'warning' : 'error')
            );
            
            // Update security score
            updateSecurityScore(5);
        });
        
        // Cyberbullying Response Checker
        const cyberResponseOptions = document.querySelectorAll('.privacy-option[id^="cyber-response"]');
        const checkCyberResponseBtn = document.getElementById('check-cyber-response');
        const cyberResponseResults = document.getElementById('cyber-response-results');
        
        cyberResponseOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selection from other options
                cyberResponseOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Select this option
                this.classList.add('selected');
            });
        });
        
        checkCyberResponseBtn.addEventListener('click', function() {
            const selectedResponse = document.querySelector('.privacy-option[id^="cyber-response"].selected');
            
            if (!selectedResponse) {
                showNotification("Selection Required", "Please select a response first", "warning");
                return;
            }
            
            cyberResponseResults.style.display = 'block';
            
            // Show feedback based on selection
            if (selectedResponse.id === 'cyber-response-4') {
                // Correct answer
                cyberResponseResults.innerHTML = `
                    <h3><i class="fas fa-check-circle" style="color: #4caf50;"></i> Correct Response!</h3>
                    <p>You chose: <strong>Take screenshot, block, and report</strong></p>
                    <p>This is the safest approach because:</p>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>It documents the incident for future reference</li>
                        <li>It immediately stops further contact from the bully</li>
                        <li>It helps the platform identify and take action</li>
                        <li>It doesn't escalate the situation</li>
                    </ul>
                `;
                
                showNotification("Correct Response", "You chose the safest option!", "success");
                updateSecurityScore(3);
            } else {
                // Incorrect answer
                cyberResponseResults.innerHTML = `
                    <h3><i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i> Safer Response Available</h3>
                    <p>While your response might feel right, there's a safer approach:</p>
                    <p><strong>Recommended:</strong> Take a screenshot, block the user, and report the behavior to the platform.</p>
                    <p style="margin-top: 15px;"><strong>Why this works better:</strong></p>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>Creates evidence if you need to involve adults or authorities</li>
                        <li>Immediately prevents more messages</li>
                        <li>Helps keep the platform safer for everyone</li>
                        <li>Avoids making the situation worse</li>
                    </ul>
                `;
                
                showNotification("Important Safety Tip", "Remember to document and report cyberbullying", "warning");
            }
            
            cyberResponseResults.classList.add('show');
        });
        
        // Digital Footprint Simulation
        const simulateFootprintBtn = document.getElementById('simulate-footprint');
        const footprintSizeBar = document.getElementById('footprint-size-bar');
        const footprintSizeText = document.getElementById('footprint-size-text');
        
        simulateFootprintBtn.addEventListener('click', function() {
            // Generate random footprint size
            const sizes = [35, 50, 65, 80, 95];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            
            footprintSizeBar.style.width = `${randomSize}%`;
            
            // Update text based on size
            if (randomSize <= 40) {
                footprintSizeText.textContent = "Small Digital Footprint";
                footprintSizeBar.style.backgroundColor = '#4caf50';
            } else if (randomSize <= 70) {
                footprintSizeText.textContent = "Medium Digital Footprint";
                footprintSizeBar.style.backgroundColor = '#ff9800';
            } else {
                footprintSizeText.textContent = "Large Digital Footprint";
                footprintSizeBar.style.backgroundColor = '#f44336';
            }
            
            // Show notification
            showNotification(
                "Footprint Updated", 
                `Your digital footprint size is now ${randomSize}%`, 
                randomSize <= 40 ? 'success' : (randomSize <= 70 ? 'warning' : 'error')
            );
            
            // Update security score
            updateSecurityScore(2);
        });
        
        // Firewall & Antivirus Simulation
        const toggleFirewallBtn = document.getElementById('toggle-firewall');
        const scanDeviceBtn = document.getElementById('scan-device');
        const scanResults = document.getElementById('scan-results');
        const scanResultText = document.getElementById('scan-result-text');
        let firewallActive = true;
        
        toggleFirewallBtn.addEventListener('click', function() {
            firewallActive = !firewallActive;
            
            if (firewallActive) {
                toggleFirewallBtn.innerHTML = '<i class="fas fa-power-off"></i> Disable Firewall';
                showNotification("Firewall Enabled", "Your firewall is now active and protecting your device", "success");
                updateSecurityScore(2);
            } else {
                toggleFirewallBtn.innerHTML = '<i class="fas fa-power-off"></i> Enable Firewall';
                showNotification("Firewall Disabled", "Warning: Your device is now more vulnerable to network threats", "error");
                updateSecurityScore(-2);
            }
        });
        
        scanDeviceBtn.addEventListener('click', function() {
            // Simulate scanning
            const originalText = scanDeviceBtn.innerHTML;
            scanDeviceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
            scanDeviceBtn.disabled = true;
            
            setTimeout(() => {
                // Simulate finding threats or not
                const foundThreats = Math.random() > 0.7;
                
                scanDeviceBtn.innerHTML = '<i class="fas fa-search"></i> Scan Device Now';
                scanDeviceBtn.disabled = false;
                
                // Show results in the interface instead of alert
                scanResults.style.display = 'block';
                
                if (foundThreats) {
                    scanResultText.textContent = "Scan complete: Found 1 potential threat. It has been quarantined successfully.";
                    scanResultText.style.color = '#f44336';
                    showNotification("Threat Detected", "1 potential threat found and quarantined", "error");
                    updateSecurityScore(1);
                } else {
                    scanResultText.textContent = "Scan complete: No threats found. Your device is secure.";
                    scanResultText.style.color = '#4caf50';
                    showNotification("Scan Complete", "No threats found. Your device is secure!", "success");
                    updateSecurityScore(3);
                }
                
                // Auto-hide scan results after 5 seconds
                setTimeout(() => {
                    scanResults.style.display = 'none';
                }, 5000);
            }, 2000);
        });
        
        // Social Media Privacy Calculator
        const updateSocialPrivacyBtn = document.getElementById('update-social-privacy');
        const socialPrivacyScore = document.getElementById('social-privacy-score');
        const socialPrivacyBar = document.getElementById('social-privacy-bar');
        
        updateSocialPrivacyBtn.addEventListener('click', function() {
            // Calculate score based on settings
            const postVisibility = document.getElementById('post-visibility').value;
            const taggingPermissions = document.getElementById('tagging-permissions').value;
            const searchVisibility = document.getElementById('search-visibility').checked;
            
            let score = 50; // Base score
            
            // Adjust based on post visibility
            if (postVisibility === 'friends') score += 20;
            else if (postVisibility === 'private') score += 30;
            else score -= 10; // public
            
            // Adjust based on tagging
            if (taggingPermissions === 'friends') score += 15;
            else if (taggingPermissions === 'none') score += 20;
            else score -= 10; // anyone
            
            // Adjust based on search visibility
            if (!searchVisibility) score += 15;
            
            // Ensure score is between 0-100
            score = Math.max(0, Math.min(100, score));
            
            // Update display
            socialPrivacyScore.textContent = `${score}%`;
            socialPrivacyBar.style.width = `${score}%`;
            
            // Update color based on score
            if (score >= 80) {
                socialPrivacyBar.style.backgroundColor = '#4caf50';
                socialPrivacyScore.style.color = '#4caf50';
            } else if (score >= 60) {
                socialPrivacyBar.style.backgroundColor = '#ff9800';
                socialPrivacyScore.style.color = '#ff9800';
            } else {
                socialPrivacyBar.style.backgroundColor = '#f44336';
                socialPrivacyScore.style.color = '#f44336';
            }
            
            // Show notification
            showNotification(
                "Privacy Score Updated", 
                `Your social media privacy score is ${score}%`, 
                score >= 80 ? 'success' : (score >= 60 ? 'warning' : 'error')
            );
            
            // Update security score
            updateSecurityScore(1);
        });
        
        // Security Score Updater
        const securityScoreElement = document.getElementById('security-score');
        const scoreBar = document.getElementById('score-bar');
        let currentSecurityScore = 78;
        
        function updateSecurityScore(points) {
            currentSecurityScore += points;
            
            // Keep score between 0-100
            currentSecurityScore = Math.max(0, Math.min(100, currentSecurityScore));
            
            // Update display
            securityScoreElement.textContent = `${currentSecurityScore}%`;
            scoreBar.style.width = `${currentSecurityScore}%`;
            
            // Update color based on score
            if (currentSecurityScore >= 80) {
                scoreBar.style.backgroundColor = '#4caf50';
            } else if (currentSecurityScore >= 60) {
                scoreBar.style.backgroundColor = '#ff9800';
            } else {
                scoreBar.style.backgroundColor = '#f44336';
            }
            
            console.log(`Security score updated: ${currentSecurityScore}% (${points > 0 ? '+' : ''}${points})`);
        }
        
        // Initialize
        window.addEventListener('DOMContentLoaded', function() {
            console.log("Initializing Online Security Guide...");
            
            // Load all images
            loadImages();
            
            // Initialize privacy checker with some selections
            setTimeout(() => {
                document.querySelectorAll('.privacy-option')[0].classList.add('selected');
                document.querySelectorAll('.privacy-option')[3].classList.add('selected');
            }, 500);
            
            // Initialize social media privacy calculator
            updateSocialPrivacyBtn.click();
            
            // Show welcome notification
            setTimeout(() => {
                showNotification("Welcome to Security Guide", "Navigate using the buttons on the left to learn about online security", "info");
            }, 1000);
            
            console.log("Online Security Guide initialized successfully!");
        });
        
        // Fix for mobile viewport height issue
        function setVhUnit() {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        // Initial set
        setVhUnit();
        
        // Update on resize and orientation change
        window.addEventListener('resize', setVhUnit);
        window.addEventListener('orientationchange', setVhUnit);