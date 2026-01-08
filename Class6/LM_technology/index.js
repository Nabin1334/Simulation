// Nepali technology data with image URLs
        const nepaliTechnology = [
            {
                id: 1,
                name: "ढिकी (Traditional Rice Beater)",
                description: "Used to separate rice from husks. Made from wood and operated by foot.",
                type: "local",
                image: "dhiki.webp",
                emoji: "🍚"
            },
            {
                id: 2,
                name: "चुल्हो (Clay Stove)",
                description: "Traditional stove using firewood for cooking. Found in many Nepali homes.",
                type: "local",
                image: "chulha.webp",
                emoji: "🔥"
            },
            {
                id: 3,
                name: "कोदालो (Hoe)",
                description: "Tool for farming and digging soil. Used in agriculture across Nepal.",
                type: "local",
                image: "hoe.jpg",
                emoji: "🛠️"
            },
            {
                id: 4,
                name: "गाग्री  (Water Pot)",
                description: "Clay pot for carrying water. Keeps water cool in hot weather.",
                type: "local",
                image: "pot.webp",
                emoji: "🏺"
            },
            {
                id: 5,
                name: "सुकुल  (Mat)",
                description: "Woven mat for sitting and sleeping. Made from natural fibers.",
                type: "local",
                image: "sukul.webp",
                emoji: "📜"
            },
            {
                id: 6,
                name: "Mobile Phone",
                description: "For calling and messaging. Connects people across Nepal.",
                type: "modern",
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                emoji: "📱"
            },
            {
                id: 7,
                name: "Solar Panel",
                description: "For electricity from sunlight. Used in remote areas without grid power.",
                type: "modern",
                image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                emoji: "☀️"
            },
            {
                id: 8,
                name: "Motorcycle",
                description: "For transportation in cities and villages. Popular in Nepal.",
                type: "modern",
                image: "motorcycle.webp",
                emoji: "🏍️"
            },
            {
                id: 9,
                name: "Computer",
                description: "For learning and work. Used in schools and offices across Nepal.",
                type: "modern",
                image: "computers.webp",
                emoji: "💻"
            },
            {
                id: 10,
                name: "Rice Cooker",
                description: "Electric cooker for rice. Saves time in the kitchen.",
                type: "modern",
                image: "ricecooker.webp",
                emoji: "🍚"
            },
            {
                id: 11,
                name: "Traditional House",
                description: "Made from mud, stone, and wood. Stays cool in summer and warm in winter.",
                type: "local",
                image: "house.webp",
                emoji: "🛖"
            },
            {
                id: 12,
                name: "TV",
                description: "For news and entertainment. Found in many Nepali homes.",
                type: "modern",
                image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                emoji: "📺"
            }
        ];

        // Initialize the page with all technology items
        document.addEventListener('DOMContentLoaded', function() {
            displayTechnology('all');
        });

        function displayTechnology(type) {
            const gallery = document.getElementById('technology-gallery');
            gallery.innerHTML = '';
            
            const filteredTech = type === 'all' 
                ? nepaliTechnology 
                : nepaliTechnology.filter(tech => tech.type === type);
            
            if (filteredTech.length === 0) {
                gallery.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px;">No technology items found for this category.</p>';
                return;
            }
            
            filteredTech.forEach(tech => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.onclick = () => openModal(tech);
                
                const img = document.createElement('img');
                img.src = tech.image;
                img.alt = tech.name;
                
                const badge = document.createElement('div');
                badge.className = `tech-badge ${tech.type}-badge`;
                badge.textContent = tech.type === 'local' ? 'पुरानो' : 'नयाँ';
                
                const description = document.createElement('p');
                description.innerHTML = `<strong>${tech.name}</strong> ${tech.emoji}`;
                
                galleryItem.appendChild(img);
                galleryItem.appendChild(badge);
                galleryItem.appendChild(description);
                gallery.appendChild(galleryItem);
            });
        }

        function filterTechnology(type) {
            displayTechnology(type);
            
            // Update button styles
            document.querySelectorAll('.tech-btn').forEach(btn => {
                btn.style.opacity = '0.7';
            });
            
            if (type === 'local') {
                document.querySelector('.local-btn').style.opacity = '1';
            } else if (type === 'modern') {
                document.querySelector('.modern-btn').style.opacity = '1';
            } else {
                document.querySelector('.all-btn').style.opacity = '1';
            }
        }

        function openModal(tech) {
            const modal = document.getElementById('image-modal');
            const modalImage = document.getElementById('modal-image');
            const modalTitle = document.getElementById('modal-title');
            const modalDescription = document.getElementById('modal-description');
            
            modalImage.src = tech.image;
            modalImage.alt = tech.name;
            modalTitle.textContent = tech.name;
            modalDescription.textContent = tech.description;
            
            modal.style.display = 'flex';
        }

        function closeModal() {
            const modal = document.getElementById('image-modal');
            modal.style.display = 'none';
        }

        // Close modal when clicking outside the content
        window.onclick = function(event) {
            const modal = document.getElementById('image-modal');
            if (event.target === modal) {
                closeModal();
            }
        }