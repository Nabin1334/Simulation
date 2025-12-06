// script.js
document.addEventListener("DOMContentLoaded", function () {
    const devices = document.querySelectorAll(".device");
    const output = document.getElementById("output");
    const progressBar = document.querySelector(".progress-bar");
    const progress = document.querySelector(".progress");
    const dataBit = document.getElementById("data-bit");
    const keys = document.querySelectorAll(".key");
    let activeDevice = null;
    let isListening = false;
    let scanInterval = null;
    let printInterval = null;
    let dataFlowInterval = null;

    // Add event listeners to all devices
    devices.forEach((device) => {
        device.addEventListener("click", function () {
            // Remove active class from all devices
            devices.forEach((d) => d.classList.remove("active"));
            
            // Add active class to clicked device
            this.classList.add("active");
            activeDevice = this.getAttribute("data-device");
            
            // Clear any existing intervals
            clearAllIntervals();
            progressBar.style.display = "none";
            
            // Handle different devices
            handleDeviceActivation(activeDevice);
            
            // Start data flow animation
            startDataFlow();
        });
    });
    
    // Add event listeners to keyboard keys
    keys.forEach(key => {
        key.addEventListener("click", function() {
            if (activeDevice === "keyboard") {
                const keyValue = this.getAttribute("data-key");
                output.innerHTML = `You pressed: <strong>${keyValue === " " ? "Space" : keyValue}</strong>`;
                animateDataFlow();
                
                // Visual feedback
                this.style.backgroundColor = "#4a90e2";
                this.style.color = "white";
                setTimeout(() => {
                    this.style.backgroundColor = "";
                    this.style.color = "";
                }, 200);
            }
        });
    });
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
    
    // Add keyboard event listener
    document.addEventListener("keydown", function (event) {
        if (activeDevice === "keyboard") {
            let key = event.key;
            if (key === " ") {
                key = "Space";
                // Prevent scrolling when spacebar is pressed
                event.preventDefault();
            }
            if (key === "Enter") key = "Enter ↵";
            if (key === "Escape") key = "Escape";
            if (key === "Tab") {
                key = "Tab";
                event.preventDefault();
            }
            if (key === "Shift") key = "Shift";
            if (key === "Control") key = "Control";
            if (key === "Alt") key = "Alt";
            if (key === "CapsLock") key = "Caps Lock";
            if (key === "Backspace") key = "Backspace";
            
            output.innerHTML = `You pressed: <strong>${key.toUpperCase()}</strong>`;
            animateDataFlow();
            
            // Visual feedback for the key
            const keyElement = document.querySelector(`.key[data-key="${event.key.toLowerCase()}"]`);
            if (keyElement) {
                keyElement.style.backgroundColor = "#4a90e2";
                keyElement.style.color = "white";
                setTimeout(() => {
                    keyElement.style.backgroundColor = "";
                    keyElement.style.color = "";
                }, 200);
            }
        }
    });
    
    // Add mouse event listener for all buttons
    document.addEventListener("mousedown", function (event) {
        if (activeDevice === "mouse") {
            let buttonName = "";
            if (event.button === 0) buttonName = "Left Button";
            else if (event.button === 1) buttonName = "Middle Button";
            else if (event.button === 2) buttonName = "Right Button";
            
            output.innerHTML = `Mouse <strong>${buttonName}</strong> clicked at position <strong>(${event.clientX}, ${event.clientY})</strong>`;
            animateDataFlow();
            
            // Visual feedback for mouse click
            const mouseDevice = document.getElementById("mouse-device");
            mouseDevice.style.transform = "scale(0.95)";
            setTimeout(() => {
                mouseDevice.style.transform = "";
            }, 100);
        }
    });
    
    // Add mouse movement event listener
    document.addEventListener("mousemove", function (event) {
        if (activeDevice === "mouse") {
            const mouseDevice = document.getElementById("mouse-device");
            mouseDevice.querySelector(".device-icon").style.transform = `translate(${event.movementX/5}px, ${event.movementY/5}px)`;
        }
    });
    
    // Add microphone simulation
    document.addEventListener("click", function (event) {
        if (activeDevice === "microphone" && event.target.closest("#microphone-device")) {
            if (!isListening) {
                output.innerHTML = "Listening... <strong>Speak now!</strong>";
                progressBar.style.display = "block";
                progress.style.width = "0%";
                isListening = true;
                
                // Simulate listening progress
                let micProgress = 0;
                const micInterval = setInterval(() => {
                    micProgress += 5;
                    progress.style.width = `${micProgress}%`;
                    
                    if (micProgress >= 100) {
                        clearInterval(micInterval);
                        output.innerHTML = "Heard: <strong>'Hello Computer!'</strong>";
                        isListening = false;
                        
                        // After 2 seconds, show the output on speakers
                        setTimeout(() => {
                            if (activeDevice === "microphone") {
                                output.innerHTML = "Playing back: <strong>'Hello Computer!'</strong>";
                                animateDataFlow();
                            }
                        }, 2000);
                    }
                }, 150);
            }
        }
    });
    
    // Add scanner simulation
    document.addEventListener("click", function (event) {
        if (activeDevice === "scanner" && event.target.closest("#scanner-device")) {
            output.innerHTML = "Scanning document...";
            progressBar.style.display = "block";
            progress.style.width = "0%";
            
            // Simulate scanning process
            let progressValue = 0;
            scanInterval = setInterval(() => {
                progressValue += 10;
                progress.style.width = `${progressValue}%`;
                output.innerHTML = `Scanning document... <strong>${progressValue}%</strong>`;
                
                if (progressValue >= 100) {
                    clearInterval(scanInterval);
                    output.innerHTML = "Scan complete! <strong>Document saved.</strong>";
                    animateDataFlow();
                }
            }, 300);
        }
    });
    
    // Add monitor simulation
    document.addEventListener("click", function (event) {
        if (activeDevice === "monitor" && event.target.closest("#monitor-device")) {
            progressBar.style.display = "none";
            output.innerHTML = "Displaying: <strong>Welcome to Computer Class!</strong>";
            
            // Simulate changing display
            setTimeout(() => {
                if (activeDevice === "monitor") {
                    output.innerHTML = "Displaying: <strong>Learning about Input/Output Devices</strong>";
                }
            }, 2000);
            
            setTimeout(() => {
                if (activeDevice === "monitor") {
                    output.innerHTML = "Displaying: <strong>5th Grade Computer Science</strong>";
                }
            }, 4000);
        }
    });
    
    // Add printer simulation
    document.addEventListener("click", function (event) {
        if (activeDevice === "printer" && event.target.closest("#printer-device")) {
            output.innerHTML = "Printing: <strong>Computer Basics Worksheet...</strong>";
            progressBar.style.display = "block";
            progress.style.width = "0%";
            
            // Simulate printing process
            let progressValue = 0;
            printInterval = setInterval(() => {
                progressValue += 20;
                progress.style.width = `${progressValue}%`;
                output.innerHTML = `Printing: Computer Basics Worksheet... <strong>${progressValue}%</strong>`;
                
                if (progressValue >= 100) {
                    clearInterval(printInterval);
                    output.innerHTML = "Print complete! <strong>Please collect your document.</strong>";
                }
            }, 500);
        }
    });
    
    // Add speaker simulation
    document.addEventListener("click", function (event) {
        if (activeDevice === "speaker" && event.target.closest("#speaker-device")) {
            progressBar.style.display = "none";
            output.innerHTML = "Playing sound: <strong>Beep boop beep!</strong>";
            
            // Visual feedback for sound waves
            const speaker = document.querySelector("#speaker-device");
            speaker.classList.add("active");
            
            setTimeout(() => {
                speaker.classList.remove("active");
            }, 1000);
        }
    });
    
    // Add headphones simulation
    document.addEventListener("click", function (event) {
        if (activeDevice === "headphones" && event.target.closest("#headphones-device")) {
            progressBar.style.display = "none";
            output.innerHTML = "Playing audio: <strong>Welcome to the digital world!</strong>";
            
            // Visual feedback for audio
            const headphones = document.querySelector("#headphones-device");
            headphones.classList.add("active");
            
            setTimeout(() => {
                headphones.classList.remove("active");
            }, 1000);
        }
    });
    
    function handleDeviceActivation(deviceType) {
        let message = "";
        progressBar.style.display = "none";
        
        switch (deviceType) {
            case "keyboard":
                message = "Try typing on your keyboard or click the keys below! The keys you press will appear here.";
                break;
            case "mouse":
                message = "Try clicking anywhere on the page! Mouse actions will be shown here.";
                break;
            case "microphone":
                message = "Click the microphone again to simulate speaking!";
                break;
            case "scanner":
                message = "Click the scanner again to simulate scanning a document!";
                break;
            case "monitor":
                message = "Click the monitor again to see it display information!";
                break;
            case "printer":
                message = "Click the printer again to simulate printing a document!";
                break;
            case "speaker":
                message = "Click the speaker again to hear simulated sound!";
                break;
            case "headphones":
                message = "Click the headphones again to hear simulated audio!";
                break;
        }
        
        output.textContent = message;
    }
    
    function startDataFlow() {
        // Clear any existing data flow animation
        if (dataFlowInterval) clearInterval(dataFlowInterval);
        
        // Start data flow animation
        dataBit.style.left = "0";
        dataFlowInterval = setInterval(() => {
            dataBit.style.left = "100%";
            setTimeout(() => {
                dataBit.style.left = "0";
            }, 1000);
        }, 2000);
    }
    
    function animateDataFlow() {
        // Animate data flow for output devices
        dataBit.style.left = "100%";
        setTimeout(() => {
            dataBit.style.left = "0";
        }, 500);
    }
    
    function clearAllIntervals() {
        if (scanInterval) clearInterval(scanInterval);
        if (printInterval) clearInterval(printInterval);
        if (dataFlowInterval) clearInterval(dataFlowInterval);
    }
});