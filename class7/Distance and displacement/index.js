// Get canvas and context
const canvas = document.getElementById('physicsCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
function resizeCanvas() {
    const container = document.getElementById('visualFrame');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawCurrentPath();
}

// Path configurations
const pathConfigs = {
    lshape: {
        name: "L-Shape Path",
        points: [
            { x: 100, y: 300, label: "Start" },
            { x: 100, y: 100, label: "Point A" },
            { x: 400, y: 100, label: "End" }
        ],
        description: "Move up, then right (90° turn)"
    },
    ushape: {
        name: "U-Shape Path",
        points: [
            { x: 100, y: 300, label: "Start" },
            { x: 100, y: 100, label: "Top Left" },
            { x: 400, y: 100, label: "Top Right" },
            { x: 400, y: 300, label: "End" }
        ],
        description: "U-shaped path (returns parallel to start)"
    },
    triangle: {
        name: "Triangle Path",
        points: [
            { x: 100, y: 300, label: "Start" },
            { x: 250, y: 100, label: "Peak" },
            { x: 400, y: 300, label: "End" }
        ],
        description: "Triangular path (doesn't return to start)"
    },
    zigzag: {
        name: "Zigzag Path",
        points: [
            { x: 100, y: 250, label: "Start" },
            { x: 200, y: 100, label: "Peak 1" },
            { x: 300, y: 200, label: "Valley" },
            { x: 400, y: 150, label: "Peak 2" },
            { x: 500, y: 300, label: "End" }
        ],
        description: "Zigzag path with multiple turns"
    },
    circuit: {
        name: "Circuit Path",
        points: [
            { x: 200, y: 200, label: "Start" },
            { x: 400, y: 200, label: "Right Turn" },
            { x: 400, y: 400, label: "Down Turn" },
            { x: 200, y: 400, label: "Left Turn" },
            { x: 200, y: 200, label: "End" }
        ],
        description: "Complete circuit (returns to start)"
    },
    custom: {
        name: "Custom Path",
        points: [],
        description: "User-defined path"
    }
};

let currentPath = "lshape";
let complexity = 3;
let length = 3;

// Initialize
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Setup path buttons
    document.querySelectorAll('.path-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.path-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            currentPath = this.getAttribute('data-path');
            
            // Generate custom path if needed
            if (currentPath === "custom") {
                generateCustomPath();
            }
            
            drawCurrentPath();
            updateCalculations();
        });
    });
    
    // Setup sliders
    document.getElementById('complexity').addEventListener('input', function() {
        complexity = parseInt(this.value);
        if (currentPath === "custom") {
            generateCustomPath();
            drawCurrentPath();
            updateCalculations();
        }
    });
    
    document.getElementById('length').addEventListener('input', function() {
        length = parseInt(this.value);
        if (currentPath === "custom") {
            generateCustomPath();
            drawCurrentPath();
            updateCalculations();
        }
    });
    
    // Generate initial custom path if needed
    if (currentPath === "custom") {
        generateCustomPath();
    }
    
    // Draw initial path
    drawCurrentPath();
    updateCalculations();
}

// Generate custom path based on sliders
function generateCustomPath() {
    const points = [];
    const numPoints = 3 + complexity; // 4 to 8 points
    const maxX = canvas.width - 100;
    const maxY = canvas.height - 100;
    
    // Start point
    points.push({ x: 100, y: maxY/2, label: "Start" });
    
    // Generate intermediate points
    for (let i = 1; i < numPoints - 1; i++) {
        const x = 100 + (maxX - 100) * (i / (numPoints - 1));
        const yVariation = (maxY/2) * (complexity/5);
        const y = maxY/2 + (Math.random() * yVariation * 2 - yVariation);
        points.push({ x: x, y: y, label: `Point ${i}` });
    }
    
    // End point
    const endX = 100 + (maxX - 100) * (0.2 + length * 0.15);
    const endY = maxY/2 + (Math.random() * 100 - 50);
    points.push({ x: endX, y: endY, label: "End" });
    
    pathConfigs.custom.points = points;
}

// Draw current path
function drawCurrentPath() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    drawGrid();
    
    // Get current path points
    const points = pathConfigs[currentPath].points;
    
    if (points.length < 2) return;
    
    // Draw distance path (in red)
    drawDistancePath(points);
    
    // Draw displacement line (in blue)
    drawDisplacementLine(points[0], points[points.length-1]);
    
    // Draw all points
    drawPoints(points);
    
    // Draw axis labels
    drawAxisLabels();
    
    // Draw distance labels on path segments
    drawDistanceLabels(points);
    
    // Draw displacement label
    drawDisplacementLabel(points[0], points[points.length-1]);
}

// Draw background grid
function drawGrid() {
    const gridSize = 50;
    
    // Draw grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw coordinate axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(50, canvas.height - 50);
    ctx.lineTo(canvas.width - 50, canvas.height - 50);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, canvas.height - 50);
    ctx.stroke();
    
    // Axis labels
    ctx.fillStyle = '#666';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('X', canvas.width - 30, canvas.height - 40);
    ctx.fillText('Y', 35, 40);
}

// Draw distance path
function drawDistancePath(points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 4;
    ctx.stroke();
}

// Draw displacement line
function drawDisplacementLine(start, end) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw arrow head
    drawArrow(start.x, start.y, end.x, end.y, '#3498db');
}

// Draw arrow head
function drawArrow(fromX, fromY, toX, toY, color) {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    // Starting point of the arrow
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), 
              toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), 
              toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Draw points
function drawPoints(points) {
    for (let i = 0; i < points.length; i++) {
        let color, radius;
        
        if (i === 0) {
            color = '#2ecc71'; // Green for start
            radius = 10;
        } else if (i === points.length - 1) {
            color = '#e74c3c'; // Red for end
            radius = 10;
        } else {
            color = '#f39c12'; // Orange for mid points
            radius = 8;
        }
        
        // Draw point
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw point label
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(points[i].label, points[i].x, points[i].y - 15);
    }
}

// Draw axis labels
function drawAxisLabels() {
    // Draw scale markers on X-axis
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    
    for (let x = 100; x <= canvas.width - 100; x += 100) {
        ctx.fillText((x-100)/10 + 'm', x, canvas.height - 30);
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 50);
        ctx.lineTo(x, canvas.height - 45);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw scale markers on Y-axis
    for (let y = canvas.height - 100; y >= 100; y -= 100) {
        const value = (canvas.height - 50 - y)/10;
        ctx.fillText(value + 'm', 30, y + 4);
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(55, y);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Draw distance labels on path segments
function drawDistanceLabels(points) {
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 1; i < points.length; i++) {
        const midX = (points[i-1].x + points[i].x) / 2;
        const midY = (points[i-1].y + points[i].y) / 2;
        
        // Calculate segment length
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        const length = Math.sqrt(dx*dx + dy*dy) / 10; // Convert to meters
        
        // Draw label with background
        ctx.save();
        ctx.translate(midX, midY);
        
        // Rotate label to align with segment
        const angle = Math.atan2(dy, dx);
        ctx.rotate(angle);
        
        // Draw background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(-30, -15, 60, 30);
        
        // Draw text
        ctx.fillStyle = '#e74c3c';
        ctx.fillText(`d${i} = ${length.toFixed(1)}m`, 0, 5);
        
        ctx.restore();
    }
}

// Draw displacement label
function drawDisplacementLabel(start, end) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Calculate displacement
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const magnitude = Math.sqrt(dx*dx + dy*dy) / 10; // Convert to meters
    
    // Determine direction
    let direction = "";
    if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? "East" : "West";
    } else {
        direction = dy > 0 ? "South" : "North";
    }
    
    // Draw label
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    
    // Draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(midX - 80, midY - 20, 160, 40);
    
    // Draw text
    ctx.fillStyle = '#3498db';
    ctx.fillText(`Δx = ${magnitude.toFixed(1)}m ${direction}`, midX, midY + 5);
}

// Update calculations and display
function updateCalculations() {
    const points = pathConfigs[currentPath].points;
    
    if (points.length < 2) return;
    
    // Calculate total distance
    let totalDistance = 0;
    let distanceFormula = "d = ";
    
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        const segmentLength = Math.sqrt(dx*dx + dy*dy) / 10; // Convert to meters
        totalDistance += segmentLength;
        
        if (i > 1) distanceFormula += " + ";
        distanceFormula += `d${i}`;
    }
    
    // Calculate displacement
    const start = points[0];
    const end = points[points.length-1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const displacement = Math.sqrt(dx*dx + dy*dy) / 10; // Convert to meters
    
    // Determine direction for displacement
    let direction = "";
    if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? "East" : "West";
    } else {
        direction = dy > 0 ? "South" : "North";
    }
    
    // Update display values
    document.getElementById('distanceValue').textContent = totalDistance.toFixed(1);
    document.getElementById('displacementValue').textContent = displacement.toFixed(1);
    
    // Update formulas
    document.getElementById('distanceFormula').textContent = distanceFormula;
    
    // Create detailed distance formula with values
    let detailedDistance = "d = ";
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        const segmentLength = Math.sqrt(dx*dx + dy*dy) / 10;
        
        if (i > 1) detailedDistance += " + ";
        detailedDistance += `${segmentLength.toFixed(1)}m`;
    }
    detailedDistance += ` = ${totalDistance.toFixed(1)}m`;
    
    // Find the element after distanceFormula and update it
    const distanceFormulaElement = document.getElementById('distanceFormula');
    const nextElement = distanceFormulaElement.nextElementSibling;
    if (nextElement && nextElement.classList.contains('formula')) {
        nextElement.textContent = detailedDistance;
    }
    
    // Update displacement formula
    document.getElementById('displacementFormula').textContent = `Δx = ${displacement.toFixed(1)}m ${direction}`;
    
    // Update ratio
    const ratio = displacement > 0 ? (totalDistance / displacement).toFixed(1) : "∞";
    document.getElementById('ratioValue').textContent = ratio;
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', init);