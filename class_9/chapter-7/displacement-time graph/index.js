
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const bus = document.getElementById('bus');
    const throttle = document.getElementById('throttle');
    const startBtn = document.getElementById('startBtn');
    const wb = document.getElementById('wb');
    const wf = document.getElementById('wf');
    const velocityDisplay = document.getElementById('currentVelocity');

    // State Variables
    let isRunning = false;
    let time = 0;
    let displacement = 0;
    let velocity = 0;
    let dataPoints = [];
    let animationId;
    const MAX_TIME = 30;
    const MAX_DIST = 120;
    let BUS_WIDTH = 160; // Will be updated based on actual size
    let ROAD_WIDTH = 0; // Will be calculated

    // Responsive canvas setup
    function setupCanvas() {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = Math.min(400, containerWidth * 0.5625); // 16:9 aspect ratio
        
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // Get actual bus width for calculations
        BUS_WIDTH = bus.offsetWidth;
        ROAD_WIDTH = containerWidth - BUS_WIDTH;
        
        // Redraw grid with new dimensions
        drawGrid();
        if (dataPoints.length > 0) {
            drawDataPoints();
        }
    }

    // Improved grid drawing with better visual design
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate responsive font sizes
        const fontSize = Math.max(10, canvas.width / 60);
        const smallFontSize = Math.max(8, canvas.width / 80);
        
        // Draw major grid lines
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        
        // X-Axis (Time) - Major grid lines every 5 seconds
        for(let i = 0; i <= MAX_TIME; i += 5) {
            let x = (i / MAX_TIME) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            // Draw labels for major grid lines
            ctx.fillStyle = "#64748b";
            ctx.font = `bold ${smallFontSize}px 'Segoe UI'`;
            ctx.fillText(i + "s", x + 5, canvas.height - 10);
        }
        
        // Y-Axis (Displacement) - Major grid lines every 20m
        for(let i = 0; i <= MAX_DIST; i += 20) {
            let y = canvas.height - (i / MAX_DIST) * canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
            
            // Draw labels for major grid lines
            ctx.fillStyle = "#64748b";
            ctx.font = `bold ${smallFontSize}px 'Segoe UI'`;
            ctx.fillText(i + "m", 10, y - 5);
        }
        
        // Draw minor grid lines (lighter)
        ctx.strokeStyle = "#f1f5f9";
        ctx.lineWidth = 0.5;
        
        // X-Axis minor lines (every second)
        for(let i = 1; i <= MAX_TIME; i++) {
            if(i % 5 !== 0) {
                let x = (i / MAX_TIME) * canvas.width;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
        }
        
        // Y-Axis minor lines (every 5m)
        for(let i = 5; i <= MAX_DIST; i += 5) {
            if(i % 20 !== 0) {
                let y = canvas.height - (i / MAX_DIST) * canvas.height;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
        
        // Draw axis labels
        ctx.fillStyle = "#475569";
        ctx.font = `bold ${fontSize}px 'Segoe UI'`;
        ctx.textAlign = "center";
        ctx.fillText("Time (s)", canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(20, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Displacement (m)", 0, 0);
        ctx.restore();
        ctx.textAlign = "left";
    }

    // Draw the data points as a smooth curve
    function drawDataPoints() {
        if (dataPoints.length < 2) return;
        
        // Draw the line
        ctx.beginPath();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = Math.max(2, canvas.width / 300);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        // Start from the first point
        const firstPoint = dataPoints[0];
        ctx.moveTo((firstPoint.t / MAX_TIME) * canvas.width, 
                   canvas.height - (firstPoint.d / MAX_DIST) * canvas.height);
        
        // Draw a smooth curve through the points
        for (let i = 1; i < dataPoints.length; i++) {
            const p = dataPoints[i];
            ctx.lineTo((p.t / MAX_TIME) * canvas.width, 
                      canvas.height - (p.d / MAX_DIST) * canvas.height);
        }
        
        ctx.stroke();
        
        // Draw the current point as a circle
        if (dataPoints.length > 0) {
            const currentPoint = dataPoints[dataPoints.length - 1];
            const x = (currentPoint.t / MAX_TIME) * canvas.width;
            const y = canvas.height - (currentPoint.d / MAX_DIST) * canvas.height;
            
            // Draw a glow effect
            const pointSize = Math.max(5, canvas.width / 150);
            ctx.beginPath();
            ctx.arc(x, y, pointSize * 1.6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
            ctx.fill();
            
            // Draw the point
            ctx.beginPath();
            ctx.arc(x, y, pointSize, 0, Math.PI * 2);
            ctx.fillStyle = "#3b82f6";
            ctx.fill();
            ctx.strokeStyle = "#1d4ed8";
            ctx.lineWidth = Math.max(1, canvas.width / 400);
            ctx.stroke();
        }
    }

    // Toggle simulation state
    function toggleSim() {
        if (!isRunning) {
            isRunning = true;
            startBtn.innerText = "STOP ENGINE";
            startBtn.classList.add('running');
            runSimulation();
        } else {
            isRunning = false;
            startBtn.innerText = "START ENGINE";
            startBtn.classList.remove('running');
            cancelAnimationFrame(animationId);
        }
    }

    // Main simulation loop
    function runSimulation() {
        if (!isRunning) return;

        // Get velocity from throttle (with smoothing)
        const targetVelocity = parseFloat(throttle.value);
        
        // Smooth acceleration/deceleration for more realistic motion
        const acceleration = 0.5;
        if (velocity < targetVelocity) {
            velocity = Math.min(velocity + acceleration, targetVelocity);
        } else if (velocity > targetVelocity) {
            velocity = Math.max(velocity - acceleration, targetVelocity);
        }
        
        // Update physics
        const deltaTime = 1/60; // 60 FPS
        time += deltaTime;
        displacement += velocity * deltaTime;

        // Apply bounds
        if (displacement < 0) {
            displacement = 0;
            if (velocity < 0) velocity = 0; // Stop when hitting boundary
        }
        if (displacement > MAX_DIST) {
            displacement = MAX_DIST;
            if (velocity > 0) velocity = 0; // Stop when hitting boundary
        }
        
        // Stop simulation if time limit reached
        if (time >= MAX_TIME) {
            toggleSim();
            return;
        }

        // Update displays
        document.getElementById('timeVal').innerText = time.toFixed(1);
        document.getElementById('distVal').innerText = displacement.toFixed(1);
        velocityDisplay.innerText = velocity.toFixed(1);
        
        // Update bus position
        const busPos = (displacement / MAX_DIST) * ROAD_WIDTH;
        bus.style.left = busPos + "px";
        
        // Update bus direction and wheel animation
        if (velocity > 0.1) {
            bus.style.transform = "scaleX(1)";
            const animationDuration = Math.max(0.3, 2 / Math.abs(velocity));
            wb.style.animation = wf.style.animation = `wheelSpin ${animationDuration}s linear infinite`;
        } else if (velocity < -0.1) {
            bus.style.transform = "scaleX(-1)";
            const animationDuration = Math.max(0.3, 2 / Math.abs(velocity));
            wb.style.animation = wf.style.animation = `wheelSpin ${animationDuration}s linear infinite reverse`;
        } else {
            wb.style.animation = wf.style.animation = "none";
        }

        // Add data point (with some sampling to avoid too many points)
        if (dataPoints.length === 0 || time - dataPoints[dataPoints.length - 1].t > 0.1) {
            dataPoints.push({t: time, d: displacement});
        }

        // Redraw graph
        drawGrid();
        drawDataPoints();

        // Continue animation
        animationId = requestAnimationFrame(runSimulation);
    }

    // Reset the entire simulation
    function resetLab() {
        isRunning = false;
        cancelAnimationFrame(animationId);
        time = 0;
        displacement = 0;
        velocity = 0;
        dataPoints = [];
        throttle.value = 0;
        startBtn.innerText = "START ENGINE";
        startBtn.classList.remove('running');
        document.getElementById('timeVal').innerText = "0.0";
        document.getElementById('distVal').innerText = "0.0";
        velocityDisplay.innerText = "0.0";
        bus.style.left = "0px";
        bus.style.transform = "scaleX(1)";
        wb.style.animation = wf.style.animation = "none";
        setupCanvas(); // Use setupCanvas instead of drawGrid
    }

    // Handle window resize
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setupCanvas();
        }, 100);
    }

    // Initialize the simulation
    window.addEventListener('load', () => {
        setupCanvas();
        window.addEventListener('resize', handleResize);
    });

    // Clean up on page unload
    window.addEventListener('unload', () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
    });