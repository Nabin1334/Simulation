
        // Get canvas and context
        const canvas = document.getElementById('leverCanvas');
        const ctx = canvas.getContext('2d');

        // Physics variables
        let loadWeight = 100; // Newtons
        let effortForce = 50; // Newtons
        let loadArmLength = 1.0; // meters (fixed)
        let effortArmLength = 2.0; // meters (fixed)
        let leverAngle = 0;

        // UI elements
        const loadWeightSlider = document.getElementById('loadWeight');
        const effortForceSlider = document.getElementById('effortForce');
        const loadWeightValue = document.getElementById('loadWeightValue');
        const effortForceValue = document.getElementById('effortForceValue');
        const maValue = document.getElementById('maValue');
        const loadTorqueValue = document.getElementById('loadTorque');
        const effortTorqueValue = document.getElementById('effortTorque');
        const leverState = document.getElementById('leverState');
        const resetBtn = document.getElementById('resetBtn');
        const balanceBtn = document.getElementById('balanceBtn');

        // Initialize canvas
        function initCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            drawSimulation();
        }

        // Calculate physics
        function calculatePhysics() {
            const loadTorque = loadWeight * loadArmLength;
            const effortTorque = effortForce * effortArmLength;
            const mechanicalAdvantage = loadWeight / effortForce;
            const netTorque = effortTorque - loadTorque;
            
            // Determine lever state
            let state = "";
            let stateEmoji = "";
            
            if (Math.abs(netTorque) < 0.1) {
                state = "Balanced";
                stateEmoji = "⚖️";
                leverAngle = 0;
            } else if (netTorque > 0) {
                state = "Effort Winning";
                stateEmoji = "↑";
                leverAngle = Math.min(0.3, netTorque / 1000);
            } else {
                state = "Load Winning";
                stateEmoji = "↓";
                leverAngle = Math.max(-0.3, netTorque / 1000);
            }
            
            return {
                loadTorque: loadTorque.toFixed(1),
                effortTorque: effortTorque.toFixed(1),
                ma: mechanicalAdvantage.toFixed(2),
                state: `${state} ${stateEmoji}`,
                netTorque: netTorque
            };
        }

        // Draw simulation
        function drawSimulation() {
            const physics = calculatePhysics();
            
            // Clear canvas with gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#e3f2fd');
            gradient.addColorStop(1, '#bbdefb');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw ground
            const groundY = canvas.height * 0.7;
            ctx.fillStyle = '#795548';
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
            
            // Draw grass
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(0, groundY, canvas.width, 10);
            
            // Calculate positions
            const fulcrumX = canvas.width / 2;
            const fulcrumY = groundY - 80;
            const scale = 60; // pixels per meter
            
            // Save context for rotation
            ctx.save();
            ctx.translate(fulcrumX, fulcrumY);
            ctx.rotate(leverAngle);
            
            // Draw lever beam
            const totalLength = (loadArmLength + effortArmLength) * scale;
            ctx.fillStyle = '#795548';
            ctx.fillRect(-loadArmLength * scale, -8, totalLength, 16);
            
            // Draw beam details
            ctx.strokeStyle = '#5d4037';
            ctx.lineWidth = 2;
            ctx.strokeRect(-loadArmLength * scale, -8, totalLength, 16);
            
            // Draw center marker
            ctx.fillStyle = '#1976d2';
            ctx.fillRect(-2, -15, 4, 30);
            
            // Draw fulcrum
            ctx.fillStyle = '#1976d2';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#0d47a1';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw load (left side) - on the surface
            const loadX = -loadArmLength * scale;
            const loadSize = 30 + (loadWeight / 500) * 40;
            const loadY = -8; // On the surface of the lever
            
            // Load shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(loadX - loadSize/2 + 3, loadY - loadSize + 3, loadSize, loadSize);
            
            // Load box (red) - sits on lever
            ctx.fillStyle = '#d32f2f';
            ctx.fillRect(loadX - loadSize/2, loadY - loadSize, loadSize, loadSize);
            
            // Load outline
            ctx.strokeStyle = '#b71c1c';
            ctx.lineWidth = 3;
            ctx.strokeRect(loadX - loadSize/2, loadY - loadSize, loadSize, loadSize);
            
            // Load label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${loadWeight} N`, loadX, loadY - loadSize/2);
            
            // Draw effort (right side) - on the surface like load
            const effortX = effortArmLength * scale;
            const effortSize = 30 + (effortForce / 250) * 40;
            const effortY = -8; // On the surface of the lever
            
            // Effort shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(effortX - effortSize/2 + 3, effortY - effortSize + 3, effortSize, effortSize);
            
            // Effort box (green) - sits on lever
            ctx.fillStyle = '#388e3c';
            ctx.fillRect(effortX - effortSize/2, effortY - effortSize, effortSize, effortSize);
            
            // Effort outline
            ctx.strokeStyle = '#2e7d32';
            ctx.lineWidth = 3;
            ctx.strokeRect(effortX - effortSize/2, effortY - effortSize, effortSize, effortSize);
            
            // Effort label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`${effortForce} N`, effortX, effortY - effortSize/2);
            
            // Draw connection between boxes and lever
            ctx.setLineDash([]);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            
            // Connection lines from lever to boxes
            ctx.beginPath();
            ctx.moveTo(loadX, loadY);
            ctx.lineTo(loadX, loadY - effortSize);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(effortX, effortY);
            ctx.lineTo(effortX, effortY - effortSize);
            ctx.stroke();
            
            // Draw measurement lines and labels
            ctx.setLineDash([5, 3]);
            
            // Load arm measurement
            ctx.beginPath();
            ctx.moveTo(loadX, loadY - loadSize);
            ctx.lineTo(loadX, loadY - loadSize - 40);
            ctx.stroke();
            
            // Effort arm measurement
            ctx.beginPath();
            ctx.moveTo(effortX, effortY - effortSize);
            ctx.lineTo(effortX, effortY - effortSize - 40);
            ctx.stroke();
            
            ctx.setLineDash([]);
            
            // Arm length labels
            ctx.fillStyle = '#424242';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`${loadArmLength.toFixed(1)} m`, loadX, loadY - loadSize - 55);
            ctx.fillText(`${effortArmLength.toFixed(1)} m`, effortX, effortY - effortSize - 55);
            
            // Draw labels for Load and Effort
            ctx.fillStyle = '#d32f2f';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('LOAD', loadX, loadY + 25);
            
            ctx.fillStyle = '#388e3c';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('EFFORT', effortX, effortY + 25);
            
            ctx.restore();
            
            // Draw fulcrum label
            ctx.fillStyle = '#1976d2';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('FULCRUM', fulcrumX, fulcrumY + 40);
            
            // Update display values
            maValue.textContent = physics.ma;
            loadTorqueValue.textContent = `${physics.loadTorque} N·m`;
            effortTorqueValue.textContent = `${physics.effortTorque} N·m`;
            leverState.textContent = physics.state;
            
            // Status explanation
            const statusDiv = document.querySelector('.status-display');
            if (Math.abs(physics.netTorque) < 0.1) {
                statusDiv.textContent = "Perfectly balanced! Load × Load Arm = Effort × Effort Arm";
                statusDiv.style.background = '#388e3c';
                statusDiv.style.border = '2px solid #2e7d32';
            } else if (physics.netTorque > 0) {
                statusDiv.textContent = `Effort is stronger by ${Math.abs(physics.netTorque).toFixed(1)} N·m - lever tips right`;
                statusDiv.style.background = '#1976d2';
                statusDiv.style.border = '2px solid #1565c0';
            } else {
                statusDiv.textContent = `Load is heavier by ${Math.abs(physics.netTorque).toFixed(1)} N·m - lever tips left`;
                statusDiv.style.background = '#d32f2f';
                statusDiv.style.border = '2px solid #b71c1c';
            }
        }

        // Event listeners
        loadWeightSlider.addEventListener('input', function() {
            loadWeight = parseInt(this.value);
            loadWeightValue.textContent = `${loadWeight} N`;
            drawSimulation();
        });

        effortForceSlider.addEventListener('input', function() {
            effortForce = parseInt(this.value);
            effortForceValue.textContent = `${effortForce} N`;
            drawSimulation();
        });

        resetBtn.addEventListener('click', function() {
            loadWeight = 100;
            effortForce = 50;
            loadWeightSlider.value = 100;
            effortForceSlider.value = 50;
            loadWeightValue.textContent = '100 N';
            effortForceValue.textContent = '50 N';
            leverAngle = 0;
            
            // Visual feedback
            this.textContent = '✓ Reset!';
            setTimeout(() => {
                this.textContent = 'Reset All';
            }, 1000);
            
            drawSimulation();
        });

        balanceBtn.addEventListener('click', function() {
            // Calculate required effort for balance: Load × Load Arm = Effort × Effort Arm
            const requiredEffort = (loadWeight * loadArmLength) / effortArmLength;
            effortForce = Math.max(5, Math.min(250, Math.round(requiredEffort)));
            effortForceSlider.value = effortForce;
            effortForceValue.textContent = `${effortForce} N`;
            
            // Visual feedback
            this.textContent = '✓ Balanced!';
            setTimeout(() => {
                this.textContent = 'Auto Balance';
            }, 1000);
            
            drawSimulation();
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'r' || e.key === 'R') {
                resetBtn.click();
            }
            if (e.key === 'b' || e.key === 'B') {
                balanceBtn.click();
            }
        });

        // Initialize
        window.addEventListener('load', function() {
            initCanvas();
            window.addEventListener('resize', initCanvas);
            
            // Add tooltips
            loadWeightSlider.title = "Adjust the weight you want to lift (10-500 Newtons)";
            effortForceSlider.title = "Adjust how hard you need to push (5-250 Newtons)";
            resetBtn.title = "Press R to reset to default values";
            balanceBtn.title = "Press B to auto-calculate balanced effort";
            
            // Welcome message
            console.log("⚖️ Mechanical Advantage Simulator Loaded!");
            console.log("🎮 Controls:");
            console.log("• Adjust sliders to change load and effort");
            console.log("• Press B for auto-balance");
            console.log("• Press R to reset");
            console.log("🎯 Remember: MA = Load ÷ Effort");
            console.log("📐 Both weights now sit on the lever surface properly!");
        });