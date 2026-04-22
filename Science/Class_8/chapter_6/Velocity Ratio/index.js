 // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e1e);
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x555555));

    // Floor Grid
    const grid = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    grid.position.y = -2;
    scene.add(grid);


    // --- 2. LEVER OBJECTS ---
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // The Beam
    const beam = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.2, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x999999 })
    );
    beam.castShadow = true;
    pivotGroup.add(beam);

    // Function to make nice weights
    function createWeight(color, xPos) {
        const g = new THREE.Group();
        
        // The Weight Cylinder
        const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 0.4, 32),
            new THREE.MeshStandardMaterial({ color: color })
        );
        cyl.castShadow = true;
        cyl.position.y = 0.3; // Sit on beam
        
        // A Handle on top
        const handle = new THREE.Mesh(
            new THREE.TorusGeometry(0.2, 0.05, 8, 20),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        handle.position.y = 0.55;
        handle.rotation.y = Math.PI / 2;

        g.add(cyl, handle);
        g.position.x = xPos;
        return g;
    }

    // Effort (Blue) - Right Side
    const effortObj = createWeight(0x00d2ff, 4.5);
    pivotGroup.add(effortObj);

    // Load (Red) - Left Side
    const loadObj = createWeight(0xff5555, -4.5);
    pivotGroup.add(loadObj);

    // Fulcrum (Triangle)
    const fulcrum = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x666666 })
    );
    fulcrum.position.y = -0.95;
    scene.add(fulcrum);


    // --- 3. DISTANCE MEASUREMENT LINES (Rulers) ---
    // These lines visualize the vertical distance traveled
    function createLine(color) {
        const mat = new THREE.LineDashedMaterial({ 
            color: color, 
            dashSize: 0.2, 
            gapSize: 0.1, 
            linewidth: 2 
        });
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
        const line = new THREE.Line(geo, mat);
        line.computeLineDistances();
        return line;
    }

    const eLine = createLine(0x00d2ff); // Blue Line
    const lLine = createLine(0xff5555); // Red Line
    scene.add(eLine);
    scene.add(lLine);


    // --- 4. LOGIC LOOP ---
    camera.position.set(0, 1.5, 13);
    
    // Inputs
    const uiEMass = document.getElementById('eMass');
    const uiLMass = document.getElementById('lMass');
    const uiPivot = document.getElementById('pivotPos');

    // State
    let currentAngle = 0;
    const MAX_TILT = 0.35; // The "floor" stop point

    function animate() {
        requestAnimationFrame(animate);

        // 1. Get Values
        const mE = parseFloat(uiEMass.value);
        const mL = parseFloat(uiLMass.value);
        const pOffset = parseFloat(uiPivot.value);

        // 2. Adjust Positions (Pivot Logic)
        // Move the beam relative to the center (simulating moving fulcrum)
        beam.position.x = pOffset;
        effortObj.position.x = pOffset + 4.5;
        loadObj.position.x = pOffset - 4.5;

        // 3. Physics (Torque Balance)
        // Distance from pivot (Absolute value)
        const distE = Math.abs(effortObj.position.x);
        const distL = Math.abs(loadObj.position.x);

        const torqueE = mE * distE;
        const torqueL = mL * distL;

        // Decide where to tilt
        let targetAngle = 0;
        // Sensitivity buffer of 2.0 to prevent flickering
        if (torqueE > torqueL + 2.0) targetAngle = -MAX_TILT; // Tilt Right (Effort goes down)
        else if (torqueL > torqueE + 2.0) targetAngle = MAX_TILT;  // Tilt Left (Load goes down)
        
        // Smooth Animation
        currentAngle += (targetAngle - currentAngle) * 0.05;
        pivotGroup.rotation.z = currentAngle;

        // 4. Update Visual Measurement Lines
        // We want to draw a line from the "Neutral Height" (0) to the "Current Height"
        
        // Get World Positions
        const ePos = new THREE.Vector3(); effortObj.getWorldPosition(ePos);
        const lPos = new THREE.Vector3(); loadObj.getWorldPosition(lPos);

        // Update Blue Line (Effort)
        eLine.geometry.setFromPoints([
            new THREE.Vector3(ePos.x, 0, 0),    // Ground/Neutral level
            new THREE.Vector3(ePos.x, ePos.y, 0)// Current Height
        ]);
        eLine.computeLineDistances(); // Update dashes

        // Update Red Line (Load)
        lLine.geometry.setFromPoints([
            new THREE.Vector3(lPos.x, 0, 0),
            new THREE.Vector3(lPos.x, lPos.y, 0)
        ]);
        lLine.computeLineDistances();

        // 5. Calculate & Display VR
        // VR is based on the lever arm lengths (geometry), which dictates the travel distance
        const vr = distE / distL;

        // Show the actual vertical distance covered (Height from 0)
        const verticalDistE = Math.abs(ePos.y); 
        const verticalDistL = Math.abs(lPos.y);

        // UI Updates
        // Show Effort and Load Weights
        document.getElementById('ewVal').innerText = mE.toFixed(1) + " kg";
        document.getElementById('lwVal').innerText = mL.toFixed(1) + " kg";
        
        // Show Effort and Load Distances
        document.getElementById('edVal').innerText = distE.toFixed(2) + " m"; // Using Arm Length for clarity
        document.getElementById('ldVal').innerText = distL.toFixed(2) + " m";
        document.getElementById('vrResult').innerText = vr.toFixed(2);

        renderer.render(scene, camera);
    }

    animate();

    window.onresize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
