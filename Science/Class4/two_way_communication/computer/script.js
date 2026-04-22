// DOM Elements
const toggleModeBtn = document.getElementById('toggleModeBtn');
const oneWayDescription = document.getElementById('oneWayDescription');
const twoWayDescription = document.getElementById('twoWayDescription');
const modeIndicator = document.getElementById('modeIndicator');
const simulationContainer = document.getElementById('simulationContainer');
const messageAnimation = document.getElementById('messageAnimation');
const responseIndicator = document.getElementById('responseIndicator');

// Message elements
const senderMessageBubble = document.getElementById('senderMessageBubble');
const receiverMessageBubble = document.getElementById('receiverMessageBubble');
const senderMessageText = document.getElementById('senderMessageText');
const receiverMessageText = document.getElementById('receiverMessageText');

// UI elements
const oneWayInput = document.getElementById('oneWayInput');
const oneWaySendBtn = document.getElementById('oneWaySend');
const resetOneWayBtn = document.getElementById('resetOneWay');

const senderInput = document.getElementById('senderInput');
const receiverInput = document.getElementById('receiverInput');
const senderSendBtn = document.getElementById('senderSend');
const receiverSendBtn = document.getElementById('receiverSend');
const resetTwoWayBtn = document.getElementById('resetTwoWay');

// Human elements
const senderHumanEyes = document.querySelector('.sender .human-eyes');
const receiverHumanEyes = document.querySelector('.receiver .human-eyes');
const senderLeftArm = document.querySelector('.sender .left-arm');
const senderRightArm = document.querySelector('.sender .right-arm');
const receiverLeftArm = document.querySelector('.receiver .left-arm');
const receiverRightArm = document.querySelector('.receiver .right-arm');

// Simulation state
let isTwoWayMode = false;
let senderHasSent = false;
let animationInProgress = false;

// Initialize the application
function init() {
    // Add event listeners
    toggleModeBtn.addEventListener('click', toggleCommunicationMode);
    oneWaySendBtn.addEventListener('click', sendOneWayMessage);
    senderSendBtn.addEventListener('click', sendTwoWayMessage);
    receiverSendBtn.addEventListener('click', sendResponse);
    resetOneWayBtn.addEventListener('click', resetSimulation);
    resetTwoWayBtn.addEventListener('click', resetSimulation);
    
    // Setup Enter key for sending messages
    setupEnterKeyHandlers();
    
    // Add human animations
    animateHumans();
    
    console.log('Communication Simulation Initialized with Human Characters');
}

function toggleCommunicationMode() {
    isTwoWayMode = !isTwoWayMode;
    
    if (isTwoWayMode) {
        // Switch to two-way mode
        oneWayDescription.style.display = 'none';
        twoWayDescription.style.display = 'block';
        simulationContainer.classList.add('two-way-active');
        modeIndicator.textContent = 'Two-Way Communication Mode';
        modeIndicator.className = 'mode-indicator two-way-indicator';
        toggleModeBtn.textContent = 'Switch to One-Way Communication';
    } else {
        // Switch to one-way mode
        oneWayDescription.style.display = 'block';
        twoWayDescription.style.display = 'none';
        simulationContainer.classList.remove('two-way-active');
        modeIndicator.textContent = 'One-Way Communication Mode';
        modeIndicator.className = 'mode-indicator one-way-indicator';
        toggleModeBtn.textContent = 'Switch to Two-Way Communication';
    }
    
    resetSimulation();
}

function sendOneWayMessage() {
    if (animationInProgress) return;
    
    const message = oneWayInput.value.trim();
    if (message) {
        // Show message in sender bubble
        showMessageInBubble(senderMessageBubble, senderMessageText, message, "Sender");
        
        // Animate human sending
        animateHumanAction('sender', 'sending');
        
        // Animate message from sender to receiver
        animateMessage(message, false);
        
        // Show message in receiver bubble after animation
        setTimeout(() => {
            showMessageInBubble(receiverMessageBubble, receiverMessageText, message, "Receiver");
            animateHumanAction('receiver', 'receiving');
        }, 1000);
    }
}

function sendTwoWayMessage() {
    if (animationInProgress) return;
    
    const message = senderInput.value.trim();
    if (message) {
        // Show message in sender bubble
        showMessageInBubble(senderMessageBubble, senderMessageText, message, "Sender");
        
        // Animate human sending
        animateHumanAction('sender', 'sending');
        
        // Animate message from sender to receiver
        animateMessage(message, false);
        
        senderInput.value = '';
        senderSendBtn.disabled = true;
        senderHasSent = true;
        
        // Enable receiver after animation
        setTimeout(() => {
            showMessageInBubble(receiverMessageBubble, receiverMessageText, "✓ Message received! Type your response.", "System");
            animateHumanAction('receiver', 'receiving');
            receiverInput.disabled = false;
            receiverSendBtn.disabled = false;
            receiverInput.focus();
            responseIndicator.classList.add('show');
            
            // Hide indicator after 3 seconds
            setTimeout(() => {
                responseIndicator.classList.remove('show');
            }, 3000);
        }, 1000);
    }
}

function sendResponse() {
    if (animationInProgress || !senderHasSent) return;
    
    const message = receiverInput.value.trim();
    if (message) {
        // Show message in receiver bubble
        showMessageInBubble(receiverMessageBubble, receiverMessageText, message, "Receiver");
        
        // Animate human sending response
        animateHumanAction('receiver', 'sending');
        
        // Animate response from receiver to sender
        animateMessage(message, true);
        
        receiverInput.value = '';
        receiverSendBtn.disabled = true;
        receiverInput.disabled = true;
        
        // Show response in sender bubble after animation
        setTimeout(() => {
            showMessageInBubble(senderMessageBubble, senderMessageText, "✓ Response received! Conversation continues.", "System");
            animateHumanAction('sender', 'receiving');
            senderSendBtn.disabled = false;
            senderHasSent = false;
            senderInput.focus();
        }, 1000);
    }
}

function animateMessage(message, isResponse) {
    animationInProgress = true;
    
    // Set up the animated message
    messageAnimation.textContent = message.length > 30 ? message.substring(0, 27) + "..." : message;
    messageAnimation.className = `message-animation ${isResponse ? 'receiving' : ''}`;
    messageAnimation.style.display = 'block';
    
    // Start position
    const startPos = isResponse ? 90 : 10; // percentage from left
    const endPos = isResponse ? 10 : 90;
    let currentPos = startPos;
    
    // Animation parameters
    const speed = 2; // percentage per frame
    
    const animate = () => {
        if ((isResponse && currentPos <= endPos) || (!isResponse && currentPos >= endPos)) {
            // Animation complete
            messageAnimation.style.display = 'none';
            animationInProgress = false;
            return;
        }
        
        // Update position
        if (isResponse) {
            currentPos -= speed;
        } else {
            currentPos += speed;
        }
        
        // Add vertical movement for curved effect
        const verticalOffset = Math.sin((currentPos - startPos) * 0.03) * 20;
        
        messageAnimation.style.left = currentPos + '%';
        messageAnimation.style.top = `calc(50% + ${verticalOffset}px)`;
        
        // Continue animation
        requestAnimationFrame(animate);
    };
    
    // Start animation
    requestAnimationFrame(animate);
}

function animateHumanAction(humanType, action) {
    const humanEyes = humanType === 'sender' ? 
        document.querySelector('.sender .human-eyes') : 
        document.querySelector('.receiver .human-eyes');
    
    const leftArm = humanType === 'sender' ? 
        document.querySelector('.sender .left-arm') : 
        document.querySelector('.receiver .left-arm');
    
    const rightArm = humanType === 'sender' ? 
        document.querySelector('.sender .right-arm') : 
        document.querySelector('.receiver .right-arm');
    
    // Add animation classes
    humanEyes.classList.add(`${action}-animation`);
    
    // Reset arm positions
    leftArm.style.animation = 'none';
    rightArm.style.animation = 'none';
    
    // Trigger reflow
    void leftArm.offsetWidth;
    void rightArm.offsetWidth;
    
    // Apply arm waving animation for sending/receiving
    if (action === 'sending') {
        leftArm.style.animation = 'waveArm 1s ease-in-out';
    } else if (action === 'receiving') {
        rightArm.style.animation = 'waveArm 1s ease-in-out';
    }
    
    // Remove animation class after 1 second
    setTimeout(() => {
        humanEyes.classList.remove(`${action}-animation`);
    }, 1000);
}

function animateHumans() {
    // CSS animations are already defined in the CSS file
    console.log('Human animations ready');
}

function showMessageInBubble(bubble, textElement, message, sender) {
    textElement.textContent = message;
    bubble.querySelector('.bubble-sender').textContent = sender;
    
    // Reset animation
    bubble.classList.remove('show');
    void bubble.offsetWidth; // Trigger reflow
    bubble.classList.add('show');
}

function setupEnterKeyHandlers() {
    // One-way input
    oneWayInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendOneWayMessage();
        }
    });
    
    // Two-way sender input
    senderInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendTwoWayMessage();
        }
    });
    
    // Two-way receiver input
    receiverInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendResponse();
        }
    });
}

function resetSimulation() {
    // Reset animation state
    animationInProgress = false;
    messageAnimation.style.display = 'none';
    responseIndicator.classList.remove('show');
    
    // Reset messages
    senderMessageText.textContent = 'Waiting for message...';
    receiverMessageText.textContent = 'Waiting for message...';
    senderMessageBubble.classList.remove('show');
    receiverMessageBubble.classList.remove('show');
    
    // Reset arm animations
    const arms = document.querySelectorAll('.human-arm');
    arms.forEach(arm => {
        arm.style.animation = 'none';
    });
    
    if (isTwoWayMode) {
        // Two-way mode reset
        senderInput.value = 'Hello! This is two-way communication between sender and receiver.';
        receiverInput.value = '';
        senderSendBtn.disabled = false;
        receiverSendBtn.disabled = true;
        receiverInput.disabled = true;
        senderHasSent = false;
    } else {
        // One-way mode reset
        oneWayInput.value = 'Hello! This is a one-way message from Sender  to Receiver .';
    }
}

// Initialize when the page loads
window.addEventListener('DOMContentLoaded', init);

// Add visual feedback for buttons
window.addEventListener('load', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
});