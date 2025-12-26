  // Simple JS for demonstration: Log on click
        const items = document.querySelectorAll('.example-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                console.log(`Opening ${item.querySelector('p').textContent}`);
            });
            item.addEventListener('mouseover', () => {
                item.style.boxShadow = '0 0 15px rgba(0, 123, 255, 0.5)';
            });
            item.addEventListener('mouseout', () => {
                item.style.boxShadow = 'none';
            });
        });