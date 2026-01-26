
        // Navigation functionality
        const navItems = document.querySelectorAll('.nav-item');
        const contentSections = document.querySelectorAll('.content-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Hide all content sections
                contentSections.forEach(section => section.classList.remove('active'));
                
                // Show the selected section
                const sectionId = item.getAttribute('data-section');
                document.getElementById(sectionId).classList.add('active');
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
        
        // Show/hide messages
        function showMessage(elementId, message, isError = false) {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.style.display = 'block';
            
            // Hide message after 3 seconds
            setTimeout(() => {
                element.style.display = 'none';
            }, 3000);
        }
        
        // Google Search functionality
        function fillSearch(text) {
            document.getElementById('googleSearchInput').value = text;
            showMessage('searchSuccess', '✓ Search term added to search box');
        }
        
        function performSearch() {
            const query = document.getElementById('googleSearchInput').value.trim();
            const errorElement = document.getElementById('searchError');
            const successElement = document.getElementById('searchSuccess');
            
            // Hide previous messages
            errorElement.style.display = 'none';
            successElement.style.display = 'none';
            
            if (!query) {
                showMessage('searchError', '⚠️ Please enter a search term or click an example.', true);
                return;
            }
            
            if (query.length < 3) {
                showMessage('searchError', '⚠️ Search term is too short. Please enter at least 3 characters.', true);
                return;
            }
            
            // Simulate search
            showMessage('searchSuccess', '🔍 Searching Google for: ' + query);
        }
        
        function copyToClipboard(text) {
            const errorElement = document.getElementById('copyError');
            const successElement = document.getElementById('copySuccess');
            
            // Hide previous messages
            errorElement.style.display = 'none';
            successElement.style.display = 'none';
            
            // Create a temporary textarea element
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showMessage('copySuccess', '✓ Copied to clipboard: ' + text);
                } else {
                    showMessage('copyError', '⚠️ Could not copy to clipboard. Please try again.', true);
                }
            } catch (err) {
                showMessage('copyError', '⚠️ Could not copy to clipboard. Please try again.', true);
            }
            
            // Remove the textarea
            document.body.removeChild(textarea);
        }
        
        // Make example boxes clickable
        document.querySelectorAll('.example-box').forEach(box => {
            box.style.cursor = 'pointer';
            box.title = 'Click to use this search';
        });
        
        // Enter key support for search
        document.getElementById('googleSearchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });