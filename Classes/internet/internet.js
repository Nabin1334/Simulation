let packets = [];
let acks = [];
let obstacles = [];
let mediumType = "fiber";
let packetsSent = 0;
let packetsReceived = 0;
let packetLoss = 0;
let transmissionSpeed = 100; // Mbps

function setup() {
    const canvas = createCanvas(900, 400);
    canvas.parent('canvas-container');
    
    // Create network obstacles based on medium type
    createMedium(mediumType);
    
    // Set up button event listeners
    document.getElementById('fiber-btn').addEventListener('click', () => setMedium('fiber'));
    document.getElementById('copper-btn').addEventListener('click', () => setMedium('copper'));
    document.getElementById('wireless-btn').addEventListener('click', () => setMedium('wireless'));
    document.getElementById('satellite-btn').addEventListener('click', () => setMedium('satellite'));
    document.getElementById('add-packet-btn').addEventListener('click', addPacket);
    
    // Add initial packets
    for (let i = 0; i < 3; i++) {
        addPacketWithDelay(i * 30);
    }
}

function draw() {
    background(15, 25, 35);
    
    // Draw medium background based on type
    drawMediumBackground();
    
    // Draw sender and receiver
    drawNodes();
    
    // Draw obstacles
    drawObstacles();
    
    // Draw connection line
    drawConnection();
    
    // Update and draw packets
    updatePackets();
    
    // Update and draw ACK packets
    updateAcks();
    
    // Update stats
    updateStats();
}

function drawMediumBackground() {
    noStroke();
    
    if (mediumType === "fiber") {
        // Fiber optic - clean blue lines
        for (let y = 0; y < height; y += 4) {
            fill(25, 118, 210, 100);
            rect(0, y, width, 1);
        }
    } else if (mediumType === "copper") {
        // Copper - orange with some noise
        for (let x = 0; x < width; x += 2) {
            for (let y = 0; y < height; y += 2) {
                fill(255, 152, 0, random(20, 40));
                rect(x, y, 2, 2);
            }
        }
    } else if (mediumType === "wireless") {
        // Wireless - wave pattern
        for (let x = 0; x < width; x += 5) {
            let waveY = sin((x + frameCount) * 0.05) * 20 + height/2;
            fill(156, 39, 176, 150);
            ellipse(x, waveY, 3, 3);
        }
    } else if (mediumType === "satellite") {
        // Satellite - starry background
        for (let i = 0; i < 50; i++) {
            let x = (i * 20 + frameCount) % width;
            let y = (i * 7) % height;
            fill(255, 255, 255, random(100, 200));
            ellipse(x, y, 1, 1);
        }
    }
}

function drawNodes() {
    // Draw sender
    fill(33, 150, 243);
    rect(50, height/2 - 50, 60, 100, 10);
    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Sender", 80, height/2);
    
    // Draw receiver
    fill(0, 150, 136);
    rect(width - 110, height/2 - 50, 60, 100, 10);
    fill(255);
    text("Receiver", width - 80, height/2);
}

function drawConnection() {
    stroke(255, 100);
    strokeWeight(2);
    
    if (mediumType === "satellite") {
        // Draw satellite connection with arcs
        noFill();
        beginShape();
        vertex(110, height/2);
        quadraticVertex(width/2, 50, width - 110, height/2);
        endShape();
        
        // Draw satellite
        fill(200);
        ellipse(width/2, 40, 30, 15);
    } else {
        // Draw direct connection
        line(110, height/2, width - 110, height/2);
    }
}

function drawObstacles() {
    for (let obs of obstacles) {
        fill(obs.color);
        if (obs.type === "rect") {
            rect(obs.x, obs.y, obs.w, obs.h);
        } else if (obs.type === "circle") {
            ellipse(obs.x, obs.y, obs.size, obs.size);
        }
    }
}

function updatePackets() {
    for (let i = packets.length - 1; i >= 0; i--) {
        let p = packets[i];
        
        // Move packet based on medium type
        if (mediumType === "satellite") {
            // Satellite follows a curved path
            let t = (p.x - 110) / (width - 220);
            p.y = height/2 - 200 * sin(t * PI);
            p.x += p.speed;
        } else {
            p.x += p.speed;
        }
        
        // Check for collisions with obstacles
        for (let obs of obstacles) {
            if (obs.type === "rect" && 
                p.x > obs.x && p.x < obs.x + obs.w &&
                p.y > obs.y && p.y < obs.y + obs.h) {
                
                if (random() < obs.lossRate) {
                    // Packet is lost
                    packets.splice(i, 1);
                    continue;
                } else if (random() < obs.corruptionRate) {
                    // Packet is corrupted
                    p.corrupted = true;
                    p.color = color(255, 82, 82);
                }
                
                // Slow down packet
                p.speed *= obs.slowdown;
            }
        }
        
        // Draw packet
        fill(p.color);
        noStroke();
        ellipse(p.x, p.y, p.size, p.size);
        
        // Draw data inside packet
        fill(255);
        textSize(10);
        text(p.data, p.x, p.y);
        
        // Check if packet reached receiver
        if (p.x > width - 110) {
            packets.splice(i, 1);
            packetsReceived++;
            
            // Send ACK back to sender
            let ackColor = p.corrupted ? color(255, 82, 82) : color(105, 240, 174);
            acks.push({
                x: width - 110,
                y: height/2,
                speed: -3,
                size: 12,
                color: ackColor,
                data: p.corrupted ? "NACK" : "ACK"
            });
        }
    }
}

function updateAcks() {
    for (let i = acks.length - 1; i >= 0; i--) {
        let a = acks[i];
        
        // Move ACK packet
        a.x += a.speed;
        
        // Draw ACK packet
        fill(a.color);
        noStroke();
        ellipse(a.x, a.y, a.size, a.size);
        
        // Draw ACK text
        fill(255);
        textSize(10);
        text(a.data, a.x, a.y);
        
        // Check if ACK reached sender
        if (a.x < 110) {
            acks.splice(i, 1);
        }
    }
}

function addPacket() {
    let packetData = "";
    for (let i = 0; i < 4; i++) {
        packetData += String.fromCharCode(65 + floor(random(26)));
    }
    
    packets.push({
        x: 110,
        y: height/2,
        speed: map(transmissionSpeed, 10, 500, 2, 8),
        size: 16,
        color: color(79, 195, 247),
        data: packetData,
        corrupted: false
    });
    
    packetsSent++;
}

function addPacketWithDelay(delay) {
    setTimeout(() => {
        addPacket();
    }, delay);
}

function setMedium(type) {
    mediumType = type;
    packets = [];
    acks = [];
    createMedium(type);
    
    // Set transmission speed based on medium
    switch(type) {
        case "fiber":
            transmissionSpeed = 1000;
            break;
        case "copper":
            transmissionSpeed = 100;
            break;
        case "wireless":
            transmissionSpeed = 50;
            break;
        case "satellite":
            transmissionSpeed = 25;
            break;
    }
}

function createMedium(type) {
    obstacles = [];
    
    if (type === "fiber") {
        // Few obstacles, low loss rate
        addRandomObstacles(2, 0.1, 0.05, 0.7);
    } else if (type === "copper") {
        // More obstacles, moderate loss rate
        addRandomObstacles(4, 0.2, 0.1, 0.6);
    } else if (type === "wireless") {
        // Many small obstacles, higher loss rate
        addRandomObstacles(8, 0.3, 0.2, 0.5);
    } else if (type === "satellite") {
        // Few but strong obstacles
        addRandomObstacles(3, 0.4, 0.3, 0.4);
    }
}

function addRandomObstacles(count, lossRate, corruptionRate, slowdown) {
    for (let i = 0; i < count; i++) {
        let type = random() > 0.5 ? "rect" : "circle";
        let x = random(150, width - 150);
        let y = random(50, height - 50);
        
        if (type === "rect") {
            obstacles.push({
                type: "rect",
                x: x,
                y: y,
                w: random(30, 100),
                h: random(20, 60),
                color: color(255, 100, 100, 150),
                lossRate: lossRate,
                corruptionRate: corruptionRate,
                slowdown: slowdown
            });
        } else {
            obstacles.push({
                type: "circle",
                x: x,
                y: y,
                size: random(30, 60),
                color: color(255, 100, 100, 150),
                lossRate: lossRate,
                corruptionRate: corruptionRate,
                slowdown: slowdown
            });
        }
    }
}

function updateStats() {
    document.getElementById('sent-value').textContent = packetsSent;
    document.getElementById('received-value').textContent = packetsReceived;
    
    // Calculate packet loss percentage
    if (packetsSent > 0) {
        packetLoss = ((packetsSent - packetsReceived) / packetsSent * 100).toFixed(1);
    }
    document.getElementById('loss-value').textContent = packetLoss + '%';
    
    document.getElementById('speed-value').textContent = transmissionSpeed + ' Mbps';
}