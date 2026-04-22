let digits = []; // Array to hold digit objects for the input number
let inputNumber = "000000"; // The number to expand (default 000000)
let placeValues = ["Hundred Thousands", "Ten Thousands", "Thousands", "Hundreds", "Tens", "Ones"]; // Labels for each digit place
let expandedForm = []; // Array to hold expanded form values
let draggedDigit = null; // The digit currently being dragged
let digitPositions = []; // Stores positions of digit boxes for mouse interaction
let expansionSlots = []; // Array for slots where digits are dropped
let isDragging = false; // Flag for drag state
let offsetX, offsetY; // Mouse offset for dragging

function setup() {
    let canvas = createCanvas(900, 500); // Create a canvas of 800x500 pixels
    canvas.parent('canvas-container'); // Attach canvas to the HTML div with id 'canvas-container'
    
    updateNumber(inputNumber); // Initialize digits for the default number
    
    let slotWidth = 100; // Width of each expansion slot
    let startX = (width - (slotWidth * 6)) / 2; // Calculate starting X position to center slots
    for (let i = 0; i < 6; i++) {
        expansionSlots.push({
            x: startX + i * slotWidth, // X position for slot
            y: 370, // Y position for slot
            width: 125, // Slot width
            height: 110, // Slot height
            value: null, // Digit value in slot (null if empty)
            label: placeValues[i] // Place value label
        });
    }
}

function draw() {
    background(740); // Set background color
    
    fill(74, 74, 156); // Set fill color for title
    textSize(24); // Set text size
    textAlign(CENTER); // Center text
    text("The Expansion Machine", width/5, 50); // Draw title
    
    fill(100); // Set fill color for instructions
    textSize(16); // Set text size
    text("Drag digits to the expansion area below", width/5, 70); // Draw instructions
    
    drawOriginalNumber(); // Draw the digit boxes for the original number
    drawExpansionSlots(); // Draw the slots for expanded form
    drawExpandedForm(); // Draw the expanded form equation
    
    if (isDragging && draggedDigit !== null) {
        fill(170, 180, 255); // Fill color for dragged digit
        stroke(74, 74, 156); // Stroke color
        strokeWeight(2); // Stroke thickness
        rect(mouseX - offsetX, mouseY - offsetY, 60, 60, 10); // Draw dragged digit box
        
        fill(0); // Fill color for digit text
        noStroke(); // No border for text
        textSize(32); // Text size for digit
        textAlign(CENTER, CENTER); // Center text
        text(draggedDigit.value, mouseX - offsetX + 30, mouseY - offsetY + 30); // Draw digit value
    }
}

function drawOriginalNumber() {
    fill(74, 74, 225); // Fill color for label
    textSize(18); // Text size
    textAlign(CENTER); // Center text
    text("Standard Form: " + inputNumber.toLocaleString(), width/2, 110); // Draw standard form label
    
    let startX = (width - (70 * digits.length)) / 2; // Center digit boxes
    for (let i = 0; i < digits.length; i++) {
        let digit = digits[i];
        
        if (digit.inSlot) continue; // Skip digits already in slots
        
        fill(200, 200, 255); // Fill color for digit box
        stroke(74, 74, 156); // Stroke color
        strokeWeight(2); // Stroke thickness
        rect(startX + i * 70, 150, 60, 60, 10); // Draw digit box
        
        fill(0); // Fill color for digit text
        noStroke(); // No border for text
        textSize(32); // Text size
        textAlign(CENTER, CENTER); // Center text
        text(digit.value, startX + i * 70 + 30, 150 + 30); // Draw digit value
        
        digitPositions[i] = {
            x: startX + i * 70, // X position
            y: 150, // Y position
            width: 60, // Box width
            height: 60 // Box height
        };
    }
}

function drawDigits() {
    for (let i = 0; i < expansionSlots.length; i++) {
        let slot = expansionSlots[i];
        if (slot.value !== null) {
            fill(180, 230, 180); // Fill color for digit in slot
            stroke(50, 130, 50); // Stroke color
            strokeWeight(2); // Stroke thickness
            rect(slot.x + 20, slot.y + 20, 60, 60, 10); // Draw digit box in slot
            
            fill(0); // Fill color for digit text
            noStroke(); // No border for text
            textSize(32); // Text size
            textAlign(CENTER, CENTER); // Center text
            text(slot.value, slot.x + 50, slot.y + 50); // Draw digit value
        }
    }
}

function drawExpansionSlots() {
    for (let i = 0; i < expansionSlots.length; i++) {
        let slot = expansionSlots[i];
        
        fill(230); // Fill color for slot
        stroke(150); // Stroke color
        strokeWeight(1); // Stroke thickness
        rect(slot.x, slot.y, slot.width, slot.height, 5); // Draw slot
        
        fill(100); // Fill color for label
        noStroke(); // No border for text
        textSize(14); // Text size
        textAlign(CENTER); // Center text
        text(slot.label, slot.x + slot.width/2, slot.y + 15); // Draw slot label
        
        if (slot.value === null) {
            fill(180); // Fill color for hint text
            textSize(14); // Text size
            text("Drag digit here", slot.x + slot.width/2, slot.y + 60); // Draw hint
        }
    }
}

function drawExpandedForm() {
    let equation = "Expanded Form: "; // Start equation string
    let first = true; // Flag for first value
    
    for (let i = 0; i < expansionSlots.length; i++) {
        if (expansionSlots[i].value !== null) {
            if (!first) {
                equation += " + "; // Add plus sign between values
            }
            
            let power = 5 - i; // Calculate power for place value
            let value = expansionSlots[i].value * Math.pow(10, power); // Calculate expanded value
            equation += value.toLocaleString(); // Add value to equation string
            first = false; // Set flag to false after first value
        }
    }
    
    fill(74, 74, 156); // Fill color for equation
    textSize(20); // Text size
    textAlign(CENTER); // Center text
    text(equation, width/2, 450); // Draw expanded form equation
}

function mousePressed() {
    for (let i = 0; i < digitPositions.length; i++) {
        let pos = digitPositions[i];
        if (pos && mouseX > pos.x && mouseX < pos.x + pos.width &&
            mouseY > pos.y && mouseY < pos.y + pos.height) {
            
            draggedDigit = digits[i]; // Set dragged digit
            isDragging = true; // Set dragging flag
            offsetX = mouseX - pos.x; // Calculate mouse offset X
            offsetY = mouseY - pos.y; // Calculate mouse offset Y
            return; // Stop checking after finding digit
        }
    }
    
    for (let i = 0; i < expansionSlots.length; i++) {
        let slot = expansionSlots[i];
        if (slot.value !== null && 
            mouseX > slot.x + 20 && mouseX < slot.x + 80 &&
            mouseY > slot.y + 20 && mouseY < slot.y + 80) {
            
            for (let j = 0; j < digits.length; j++) {
                if (digits[j].value === slot.value && digits[j].position === i) {
                    digits[j].inSlot = false; // Mark digit as not in slot
                    break;
                }
            }
            
            slot.value = null; // Remove digit from slot
            return; // Stop checking after finding slot
        }
    }
}

function mouseReleased() {
    if (!isDragging || draggedDigit === null) return; // Do nothing if not dragging
    
    for (let i = 0; i < expansionSlots.length; i++) {
        let slot = expansionSlots[i];
        if (mouseX > slot.x && mouseX < slot.x + slot.width &&
            mouseY > slot.y && mouseY < slot.y + slot.height) {
            
            if (slot.value === null) {
                slot.value = draggedDigit.value; // Place digit in slot
                draggedDigit.inSlot = true; // Mark digit as in slot
                draggedDigit.position = i; // Store slot index in digit
                break; // Stop after placing digit
            }
        }
    }
    
    isDragging = false; // Stop dragging
    draggedDigit = null; // Clear dragged digit
}

function updateNumber(num) {
    inputNumber = num; // Update input number
    digits = []; // Clear digits array
    expandedForm = []; // Clear expanded form array
    
    let numStr = num.toString(); // Convert number to string
    for (let i = 0; i < numStr.length; i++) {
        digits.push({
            value: parseInt(numStr[i]), // Digit value
            inSlot: false, // Not in slot yet
            position: -1 // No slot position yet
        });
    }
    
    for (let i = 0; i < expansionSlots.length; i++) {
        if (expansionSlots[i]) {
            expansionSlots[i].value = null; // Clear slot value
        }
    }
    
    for (let i = 0; i < digits.length; i++) {
        digits[i].inSlot = false; // Mark digit as not in slot
        digits[i].position = -1; // Reset slot position
    }
}

// dom.js
function setupDOM() {
    document.getElementById('generate-btn').addEventListener('click', function() {
        let inputElem = document.getElementById('number-input'); // Get input element
        let num = parseInt(inputElem.value); // Parse input value
        
        if (isNaN(num) || num < 0) {
            alert("Please enter a valid positive number"); // Alert for invalid input
            return;
        }
        
        if (num.toString().length > 6) {
            alert("Please enter a number with 6 digits or less for the best experience"); // Alert for too many digits
            return;
        }
        
        updateNumber(num); // Update number and redraw
    });
    
    document.getElementById('reset-btn').addEventListener('click', function() {
        updateNumber(inputNumber); // Reset to current number
    });
} 

window.onload = setupDOM; // Run setupDOM when page loads