 const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e1e);
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x555555));

    const grid = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    grid.position.y = -2;
    scene.add(grid);

    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    const beam = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.2, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x999999 })
    );
    beam.castShadow = true;
    pivotGroup.add(beam);

    function createWeight(color, xPos) {
        const g = new THREE.Group();
        const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 0.4, 32),
            new THREE.MeshStandardMaterial({ color: color })
        );
        cyl.castShadow = true;
        cyl.position.y = 0.3;
        
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

    const effortObj = createWeight(0x00d2ff, 4.5);
    pivotGroup.add(effortObj);

    const loadObj = createWeight(0xff5555, -4.5);
    pivotGroup.add(loadObj);

    const fulcrum = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.5, 4),
        new THREE.MeshStandardMaterial({ color: 0x666666 })
    );
    fulcrum.position.y = -0.95;
    scene.add(fulcrum);

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

    const eLine = createLine(0x00d2ff);
    const lLine = createLine(0xff5555);
    scene.add(eLine);
    scene.add(lLine);

    camera.position.set(0, 1.5, 13);
    
    const uiEMass = document.getElementById('eMass');
    const uiLMass = document.getElementById('lMass');
    const uiPivot = document.getElementById('pivotPos');

    let currentAngle = 0;
    const MAX_TILT = 0.35;
    const GRAVITY = 9.81;

    function animate() {
        requestAnimationFrame(animate);

        const mE = parseFloat(uiEMass.value);
        const mL = parseFloat(uiLMass.value);
        const pOffset = parseFloat(uiPivot.value);

        // Update labels
        document.getElementById('effortMassLabel').textContent = mE.toFixed(1) + " kg";
        document.getElementById('loadMassLabel').textContent = mL.toFixed(1) + " kg";
        document.getElementById('pivotLabel').textContent = pOffset.toFixed(1) + " m";

        beam.position.x = pOffset;
        effortObj.position.x = pOffset + 4.5;
        loadObj.position.x = pOffset - 4.5;

        const distE = Math.abs(effortObj.position.x);
        const distL = Math.abs(loadObj.position.x);

        const torqueE = mE * distE;
        const torqueL = mL * distL;

        let targetAngle = 0;
        let balanceText = "BALANCED";
        let balanceColor = "#4CAF50";
        
        if (torqueE > torqueL + 2.0) {
            targetAngle = -MAX_TILT;
            balanceText = "EFFORT SIDE DOWN";
            balanceColor = "#00d2ff";
        } else if (torqueL > torqueE + 2.0) {
            targetAngle = MAX_TILT;
            balanceText = "LOAD SIDE DOWN";
            balanceColor = "#ff5555";
        }
        
        document.getElementById('balanceStatus').textContent = balanceText;
        document.getElementById('balanceStatus').style.color = balanceColor;
        
        currentAngle += (targetAngle - currentAngle) * 0.05;
        pivotGroup.rotation.z = currentAngle;

        const ePos = new THREE.Vector3();
        effortObj.getWorldPosition(ePos);
        const lPos = new THREE.Vector3();
        loadObj.getWorldPosition(lPos);

        eLine.geometry.setFromPoints([
            new THREE.Vector3(ePos.x, 0, 0),
            new THREE.Vector3(ePos.x, ePos.y, 0)
        ]);
        eLine.computeLineDistances();

        lLine.geometry.setFromPoints([
            new THREE.Vector3(lPos.x, 0, 0),
            new THREE.Vector3(lPos.x, lPos.y, 0)
        ]);
        lLine.computeLineDistances();

        // Calculate Forces (Weight = Mass × Gravity)
        const effortForce = mE * GRAVITY;
        const loadForce = mL * GRAVITY;

        // Calculate Vertical Distances moved
        const verticalDistE = Math.abs(ePos.y);
        const verticalDistL = Math.abs(lPos.y);

        // Calculate Work (Work = Force × Distance)
        const inputWork = effortForce * verticalDistE;
        const outputWork = loadForce * verticalDistL;

        // Calculate Efficiency
        let efficiency = 100;
        if (inputWork > 0) {
            efficiency = (outputWork / inputWork) * 100;
            efficiency = Math.min(efficiency, 100);
        }

        // Update UI
        document.getElementById('effortForceVal').textContent = effortForce.toFixed(1) + " N";
        document.getElementById('loadForceVal').textContent = loadForce.toFixed(1) + " N";
        document.getElementById('effortDistVal').textContent = verticalDistE.toFixed(2) + " m";
        document.getElementById('loadDistVal').textContent = verticalDistL.toFixed(2) + " m";
        
        document.getElementById('inputWorkVal').textContent = inputWork.toFixed(1) + " J";
        document.getElementById('outputWorkVal').textContent = outputWork.toFixed(1) + " J";
        
        document.getElementById('efficiencyResult').textContent = efficiency.toFixed(1) + "%";
        document.getElementById('efficiencyFill').style.width = efficiency.toFixed(1) + "%";
        
        document.getElementById('efficiencyCalc').textContent = 
            `(${outputWork.toFixed(1)} ÷ ${inputWork.toFixed(1)}) × 100% = ${efficiency.toFixed(1)}%`;

        renderer.render(scene, camera);
    }

    animate();

    window.onresize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };