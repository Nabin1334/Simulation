
        // DOM Elements
        const prevSlideBtn = document.getElementById('prevSlide');
        const nextSlideBtn = document.getElementById('nextSlide');
        const slideIndicator = document.getElementById('slideIndicator');
        const slides = document.querySelectorAll('.slide');
        const scanBtn = document.getElementById('scanBtn');
        const resetBtn = document.getElementById('resetBtn');
        const scannerLight = document.getElementById('scannerLight');
        const documentText = document.getElementById('documentText');
        const statusMessage = document.getElementById('statusMessage');
        
        // Current slide
        let currentSlide = 0;
        let isScanning = false;
        
        // Image URLs
        const slideImages = [
            'scanner.webp',
            'scanner1.webp'
        ];
        
        // Initialize
        function init() {
            // Load images using JavaScript
            loadImages();
            
            updateSlide();
            
            // Event listeners for slide navigation
            prevSlideBtn.addEventListener('click', showPrevSlide);
            nextSlideBtn.addEventListener('click', showNextSlide);
            
            // Event listeners for scanner
            scanBtn.addEventListener('click', startScanning);
            resetBtn.addEventListener('click', resetScanner);
        }
        
        // Load images using JavaScript
        function loadImages() {
            // Load slide 1 image
            const slide1Container = document.getElementById('slide1ImageContainer');
            const slide1Img = createImage(slideImages[0], 'Scanner Device');
            slide1Container.appendChild(slide1Img);
            
            // Load slide 2 image
            const slide2Container = document.getElementById('slide2ImageContainer');
            const slide2Img = createImage(slideImages[1], 'Document Scanning');
            slide2Container.appendChild(slide2Img);
        }
        
        // Create image element with responsive sizing
        function createImage(src, alt) {
            const img = document.createElement('img');
            img.className = 'slide-image';
            img.src = src;
            img.alt = alt;
            
            img.onload = function() {
                img.style.display = 'block';
                
                // Calculate and set optimal height based on aspect ratio
                adjustImageSize(img);
                
                // Adjust on window resize
                window.addEventListener('resize', function() {
                    adjustImageSize(img);
                });
            };
            
            img.onerror = function() {
                // If image fails to load, show fallback
                showFallbackImage(this);
            };
            return img;
        }
        
        // Adjust image size to fit screen properly
        function adjustImageSize(img) {
            const container = img.parentElement;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // For mobile screens, use smaller max height
            if (screenWidth < 768) {
                container.style.maxHeight = '280px';
                img.style.maxHeight = '260px';
            } 
            // For tablets, use medium height
            else if (screenWidth < 1024) {
                container.style.maxHeight = '350px';
                img.style.maxHeight = '330px';
            }
            // For desktops, use larger height
            else {
                container.style.maxHeight = '400px';
                img.style.maxHeight = '380px';
            }
            
            // Ensure the image maintains aspect ratio
            img.style.height = 'auto';
            img.style.width = '100%';
            img.style.objectFit = 'contain';
        }
        
        // Show fallback image if main image fails to load
        function showFallbackImage(imgElement) {
            const container = imgElement.parentElement;
            
            // Set container height for fallback
            const screenWidth = window.innerWidth;
            if (screenWidth < 768) {
                container.style.height = '250px';
            } else if (screenWidth < 1024) {
                container.style.height = '300px';
            } else {
                container.style.height = '350px';
            }
            
            // Create fallback content
            const fallbackDiv = document.createElement('div');
            fallbackDiv.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #34495e;
                color: white;
                text-align: center;
                padding: 20px;
            `;
            
            if (currentSlide === 0) {
                fallbackDiv.innerHTML = `
                    <div style="font-size: 40px; margin-bottom: 10px;">📄</div>
                    <div style="font-weight: bold; margin-bottom: 5px;">SCANNER DEVICE</div>
                    <div style="font-size: 14px;">Flatbed Scanner</div>
                `;
            } else {
                fallbackDiv.innerHTML = `
                    <div style="font-size: 40px; margin-bottom: 10px;">🖨️</div>
                    <div style="font-weight: bold; margin-bottom: 5px;">DOCUMENT SCANNING</div>
                    <div style="font-size: 14px;">Scanning in Progress</div>
                `;
            }
            
            container.innerHTML = '';
            container.appendChild(fallbackDiv);
        }
        
        // Show previous slide
        function showPrevSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlide();
            }
        }
        
        // Show next slide
        function showNextSlide() {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                updateSlide();
            }
        }
        
        // Update slide display
        function updateSlide() {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Show current slide
            slides[currentSlide].classList.add('active');
            
            // Update slide indicator
            slideIndicator.textContent = `Slide ${currentSlide + 1} of ${slides.length}`;
            
            // Update navigation buttons
            prevSlideBtn.disabled = currentSlide === 0;
            nextSlideBtn.disabled = currentSlide === slides.length - 1;
        }
        
        // Start scanning
        function startScanning() {
            if (isScanning) return;
            
            isScanning = true;
            scanBtn.disabled = true;
            
            // Update display
            statusMessage.textContent = "Scanning in progress...";
            documentText.textContent = "Scanning document...";
            
            // Show scanning animation
            scannerLight.style.opacity = '1';
            scannerLight.classList.add('scanning');
            
            // Simulate scanning process
            setTimeout(() => {
                // Complete scanning
                isScanning = false;
                
                // Hide light
                scannerLight.style.opacity = '0';
                scannerLight.classList.remove('scanning');
                
                // Update display
                statusMessage.textContent = "✓ Scan complete! Digital copy is ready";
                documentText.textContent = "Digital document ready!";
                scanBtn.disabled = false;
                scanBtn.textContent = "Scan Again";
                
                // Show success message
                showMessage("Document successfully scanned!");
            }, 2000);
        }
        
        // Reset scanner
        function resetScanner() {
            isScanning = false;
            
            // Reset display
            scannerLight.style.opacity = '0';
            scannerLight.classList.remove('scanning');
            
            // Update text
            statusMessage.textContent = "Ready to scan - Click 'Start Scan' to begin";
            documentText.textContent = "Document ready for scanning";
            scanBtn.textContent = "Start Scan";
            scanBtn.disabled = false;
            
            // Show reset message
            showMessage("Scanner reset to initial state");
        }
        
        // Show message
        function showMessage(text) {
            // Create message element
            const messageDiv = document.createElement('div');
            messageDiv.textContent = text;
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                background: #27ae60;
                color: white;
                font-weight: 500;
                z-index: 1000;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
                max-width: 350px;
            `;
            
            // Add to page
            document.body.appendChild(messageDiv);
            
            // Remove after 3 seconds
            setTimeout(() => {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (document.body.contains(messageDiv)) {
                        document.body.removeChild(messageDiv);
                    }
                }, 300);
            }, 3000);
            
            // Add CSS animations
            if (!document.getElementById('messageStyles')) {
                const style = document.createElement('style');
                style.id = 'messageStyles';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Initialize when page loads
        window.addEventListener('DOMContentLoaded', init);