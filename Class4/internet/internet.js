document.addEventListener("DOMContentLoaded", function () {
  // Function to create and insert device images
  function createDeviceImages() {
    // Mobile Phone Image
    const mobileImg = document.createElement('img');
    mobileImg.src = './images/mobile.jpg';
    mobileImg.alt = 'Mobile Phone';
    mobileImg.className = 'device-icon';
    mobileImg.style.cssText = 'width: 120px; height: 90px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);';
    
    const mobileContainer = document.querySelector('#mobile-device .device-icon-container');
    if (mobileContainer) {
      mobileContainer.appendChild(mobileImg);
    }
    
    // Laptop Image
    const laptopImg = document.createElement('img');
    laptopImg.src = './images/laptop.jpg';
    laptopImg.alt = 'Laptop';
    laptopImg.className = 'device-icon';
    laptopImg.style.cssText = 'width: 120px; height: 90px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);';
    
    const laptopContainer = document.querySelector('#laptop-device .device-icon-container');
    if (laptopContainer) {
      laptopContainer.appendChild(laptopImg);
    }
    
    // Router Image
    const routerImg = document.createElement('img');
    routerImg.src = './images/router.jpg';
    routerImg.alt = 'Router';
    routerImg.style.cssText = 'width: 150px; height: 120px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);';
    
    const routerContainer = document.getElementById('router-device');
    if (routerContainer) {
      routerContainer.appendChild(routerImg);
    }
  }
  
  // Call the function to create images
  createDeviceImages();
  
  // Rest of your existing JavaScript code continues here...
  const startBtn = document.getElementById("start-btn");
  const resetBtn = document.getElementById("reset-btn");
  const packets = [
    document.getElementById("packet-1"),
    document.getElementById("packet-2"),
  ];
  
  // ... rest of your existing JavaScript code
});