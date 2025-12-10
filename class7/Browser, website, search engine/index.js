 // Browser selection
 const browserCards = document.querySelectorAll('.browser-card');
 const websiteCards = document.querySelectorAll('.website-card');
 const websiteContents = document.querySelectorAll('.website-content');
 const defaultContent = document.getElementById('default-content');
 const searchInput = document.querySelector('.search-input');
 const searchButton = document.querySelector('.search-button');
 const searchResults = document.getElementById('search-results');
 const searchQuery = document.getElementById('search-query');
 const currentUrl = document.getElementById('current-url');
 const pageLoader = document.getElementById('page-loader');
 
 // Status elements
 const selectedBrowser = document.getElementById('selected-browser');
 const browserEngine = document.getElementById('browser-engine');
 const selectedWebsite = document.getElementById('selected-website');
 const simBrowser = document.getElementById('sim-browser');
 const simWebsite = document.getElementById('sim-website');
 const statusBrowser = document.getElementById('status-browser');
 const statusWebsite = document.getElementById('status-website');
 const loadTime = document.getElementById('load-time');

 // Browser data
 const browserData = {
     chrome: {
         name: "Google Chrome",
         engine: "Blink",
         marketShare: "63%",
         color: "#4285F4",
         url: "https://www.google.com/chrome"
     },
     firefox: {
         name: "Mozilla Firefox",
         engine: "Gecko",
         marketShare: "4%",
         color: "#FF7139",
         url: "https://www.mozilla.org/firefox"
     },
     safari: {
         name: "Apple Safari",
         engine: "WebKit",
         marketShare: "19%",
         color: "#1E73BE",
         url: "https://www.apple.com/safari"
     },
     edge: {
         name: "Microsoft Edge",
         engine: "Blink",
         marketShare: "5%",
         color: "#0078D7",
         url: "https://www.microsoft.com/edge"
     }
 };

 // Website data
 const websiteData = {
     google: {
         name: "Google",
         type: "Search Engine",
         color: "#4285F4",
         url: "https://www.google.com"
     },
     youtube: {
         name: "YouTube",
         type: "Video Platform",
         color: "#FF0000",
         url: "https://www.youtube.com"
     },
     wikipedia: {
         name: "Wikipedia",
         type: "Encyclopedia",
         color: "#000000",
         url: "https://en.wikipedia.org"
     },
     amazon: {
         name: "Amazon",
         type: "E-commerce",
         color: "#FF9900",
         url: "https://www.amazon.com"
     },
     github: {
         name: "GitHub",
         type: "Code Hosting",
         color: "#181717",
         url: "https://www.github.com"
     },
     twitter: {
         name: "Twitter",
         type: "Social Media",
         color: "#1DA1F2",
         url: "https://www.twitter.com"
     }
 };

 // Browser selection
 browserCards.forEach(card => {
     card.addEventListener('click', function() {
         // Remove active class from all browsers
         browserCards.forEach(b => b.classList.remove('active'));
         
         // Add active class to clicked browser
         this.classList.add('active');
         
         // Get browser data
         const browserType = this.getAttribute('data-browser');
         const browser = browserData[browserType];
         
         // Update browser info
         selectedBrowser.textContent = browser.name;
         browserEngine.textContent = browser.engine;
         simBrowser.textContent = browser.name;
         statusBrowser.textContent = browser.name;
         
         // Show loading animation
         showLoading();
     });
 });

 // Website selection
 websiteCards.forEach(card => {
     card.addEventListener('click', function() {
         // Remove active class from all websites
         websiteCards.forEach(w => w.classList.remove('active'));
         
         // Add active class to clicked website
         this.classList.add('active');
         
         // Get website data
         const websiteType = this.getAttribute('data-website');
         const website = websiteData[websiteType];
         
         // Hide all website content
         websiteContents.forEach(content => {
             content.classList.remove('active');
             content.style.display = 'none';
         });
         
         // Show loading animation
         showLoading();
         
         // After a short delay, show the website content
         setTimeout(() => {
             // Hide loader
             pageLoader.style.display = 'none';
             
             // Show selected website content
             const websiteId = websiteType + '-site';
             const selectedContent = document.getElementById(websiteId);
             
             if (selectedContent) {
                 selectedContent.classList.add('active');
                 selectedContent.style.display = 'block';
                 defaultContent.classList.remove('active');
                 defaultContent.style.display = 'none';
             }
             
             // Update website info
             selectedWebsite.textContent = website.name;
             simWebsite.textContent = website.name;
             statusWebsite.textContent = website.name;
             
             // Update URL bar
             currentUrl.textContent = website.url;
             
             // Update load time
             const loadTimeValue = (Math.random() * 1 + 0.3).toFixed(1);
             loadTime.textContent = loadTimeValue + 's';
             
             // Hide search results if visible
             searchResults.style.display = 'none';
         }, 800);
     });
 });

 // Search functionality
 searchButton.addEventListener('click', performSearch);
 searchInput.addEventListener('keypress', function(e) {
     if (e.key === 'Enter') {
         performSearch();
     }
 });

 function performSearch() {
     const query = searchInput.value.trim();
     
     if (!query) {
         searchInput.value = "how do web browsers work";
         return;
     }
     
     // Show loading animation
     showLoading();
     
     // Update search query display
     searchQuery.textContent = query;
     
     // Hide website content
     websiteContents.forEach(content => {
         content.style.display = 'none';
         content.classList.remove('active');
     });
     
     defaultContent.style.display = 'none';
     defaultContent.classList.remove('active');
     
     // After a delay, show search results
     setTimeout(() => {
         // Hide loader
         pageLoader.style.display = 'none';
         
         // Show search results
         searchResults.style.display = 'block';
         
         // Update URL bar
         currentUrl.textContent = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
         
         // Update load time
         const loadTimeValue = (Math.random() * 0.5 + 0.2).toFixed(1);
         loadTime.textContent = loadTimeValue + 's';
         
         // Highlight search terms in results
         highlightSearchResults(query);
         
         // Scroll to results
         searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
     }, 800);
 }

 function highlightSearchResults(query) {
     const results = document.querySelectorAll('.result-item');
     const queryWords = query.toLowerCase().split(' ');
     
     results.forEach(result => {
         const title = result.querySelector('.result-title');
         const desc = result.querySelector('.result-desc');
         
         // Reset HTML
         const originalTitle = title.textContent;
         const originalDesc = desc.textContent;
         
         title.innerHTML = originalTitle;
         desc.innerHTML = originalDesc;
         
         // Highlight each word in title and description
         queryWords.forEach(word => {
             if (word.length > 2) {
                 const regex = new RegExp(`(${word})`, 'gi');
                 title.innerHTML = title.innerHTML.replace(regex, '<span class="highlight">$1</span>');
                 desc.innerHTML = desc.innerHTML.replace(regex, '<span class="highlight">$1</span>');
             }
         });
     });
 }

 function showLoading() {
     // Show loader
     pageLoader.style.display = 'block';
     
     // Hide all website content
     websiteContents.forEach(content => {
         content.style.display = 'none';
     });
     
     defaultContent.style.display = 'none';
     
     // Hide search results
     searchResults.style.display = 'none';
 }

 // Click on search results
 document.querySelectorAll('.result-item').forEach(result => {
     result.addEventListener('click', function() {
         const url = this.getAttribute('data-url');
         
         // Show loading animation
         showLoading();
         
         // Update URL bar
         currentUrl.textContent = url;
         
         // After delay, show Wikipedia content (for demo)
         setTimeout(() => {
             pageLoader.style.display = 'none';
             
             // Hide all content
             websiteContents.forEach(content => {
                 content.style.display = 'none';
                 content.classList.remove('active');
             });
             
             // Show Wikipedia content
             const wikipediaContent = document.getElementById('wikipedia-site');
             wikipediaContent.style.display = 'block';
             wikipediaContent.classList.add('active');
             
             // Update website selection
             websiteCards.forEach(card => card.classList.remove('active'));
             document.querySelector('.website-card[data-website="wikipedia"]').classList.add('active');
             
             // Update website info
             selectedWebsite.textContent = "Wikipedia";
             simWebsite.textContent = "Wikipedia";
             statusWebsite.textContent = "Wikipedia";
             
             // Update load time
             const loadTimeValue = (Math.random() * 0.8 + 0.3).toFixed(1);
             loadTime.textContent = loadTimeValue + 's';
             
             // Hide search results
             searchResults.style.display = 'none';
         }, 800);
     });
 });

 // Browser controls
 document.querySelector('.control-close').addEventListener('click', function() {
     if (confirm("Close browser window?")) {
         // Reset to default state
         showLoading();
         
         setTimeout(() => {
             pageLoader.style.display = 'none';
             defaultContent.style.display = 'block';
             defaultContent.classList.add('active');
             
             // Reset selections
             browserCards.forEach(card => card.classList.remove('active'));
             document.querySelector('.browser-card[data-browser="chrome"]').classList.add('active');
             
             websiteCards.forEach(card => card.classList.remove('active'));
             document.querySelector('.website-card[data-website="google"]').classList.add('active');
             
             // Reset info
             selectedBrowser.textContent = "Google Chrome";
             browserEngine.textContent = "Blink";
             simBrowser.textContent = "Chrome";
             statusBrowser.textContent = "Google Chrome";
             
             selectedWebsite.textContent = "Google";
             simWebsite.textContent = "Google";
             statusWebsite.textContent = "Google";
             
             currentUrl.textContent = "https://www.google.com";
             loadTime.textContent = "0.8s";
             
             searchResults.style.display = 'none';
             searchInput.value = "";
         }, 500);
     }
 });

 // Initialize
 window.addEventListener('DOMContentLoaded', () => {
     // Set default search query
     searchInput.value = "how do web browsers work";
     
     // Animate process steps
     const steps = document.querySelectorAll('.process-step');
     steps.forEach((step, index) => {
         setTimeout(() => {
             step.style.opacity = '1';
             step.style.transform = 'translateY(0)';
         }, index * 200);
         
         step.style.opacity = '0';
         step.style.transform = 'translateY(20px)';
         step.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
     });
     
     // Show a welcome message
     setTimeout(() => {
         alert("Welcome to the Browser & Search Engine Visualizer!\n\nClick on different browsers and websites to see how they work together. Try using the search bar to simulate how search engines find information.");
     }, 1000);
 });