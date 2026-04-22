
      let currentForce = 10;
      let currentTime = 5;
      let currentDistance = 2;
      let calculatedWork = 0;
      let calculatedPower = 0;

      // --- THREE.js Scene Setup ---
      let scene, camera, renderer, character, block, distanceLine;
      let groundPlane;
      let animationFrameId = null;

      const threeContainer = document.getElementById("three-container");

      // Initial positions
      const initialCharacterX = -1.5;
      const initialBlockX = -0.5;
      const blockDepth = 0.2;

      function initThree() {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        // Camera
        const aspect = threeContainer.clientWidth / threeContainer.clientHeight;
        camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        camera.position.set(0, 1.5, 3.5);
        camera.lookAt(0, 0.7, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
          threeContainer.clientWidth,
          threeContainer.clientHeight
        );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        threeContainer.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        scene.add(directionalLight);

        // Ground Plane
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMaterial = new THREE.MeshPhongMaterial({
          color: 0x666666,
          side: THREE.DoubleSide,
        });
        groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        groundPlane.rotation.x = -Math.PI / 2;
        groundPlane.position.y = 0;
        groundPlane.receiveShadow = true;
        scene.add(groundPlane);

        // Grid Helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
        gridHelper.position.y = 0.01;
        scene.add(gridHelper);

        // Character
        character = new THREE.Group();
        character.name = "Character";

        const bodyGeo = new THREE.BoxGeometry(0.3, 0.6, 0.2);
        const bodyMat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        character.add(body);

        const headGeo = new THREE.SphereGeometry(0.15, 32, 32);
        const headMat = new THREE.MeshPhongMaterial({ color: 0xf0d5bb });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.3;
        character.add(head);

        const eyeGeo = new THREE.SphereGeometry(0.02, 8, 8);
        const eyeMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.05, 0.05, 0.12);
        head.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.05, 0.05, 0.12);
        head.add(rightEye);

        const noseGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.05, 8);
        const noseMat = new THREE.MeshPhongMaterial({ color: 0xf0d5bb });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 0, 0.13);
        nose.rotation.x = Math.PI / 2;
        head.add(nose);

        const armGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
        const armMat = new THREE.MeshPhongMaterial({ color: 0xf0d5bb });
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.2, 1.0, 0);
        leftArm.rotation.z = Math.PI / 8;
        character.add(leftArm);

        const handGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const handMat = new THREE.MeshPhongMaterial({ color: 0xf0d5bb });
        const leftHand = new THREE.Mesh(handGeo, handMat);
        leftHand.position.set(0, -0.22, 0);
        leftArm.add(leftHand);

        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.2, 1.0, 0);
        rightArm.rotation.z = -Math.PI / 8;
        character.add(rightArm);

        const rightHand = new THREE.Mesh(handGeo, handMat);
        rightHand.position.set(0, -0.22, 0);
        rightArm.add(rightHand);

        const legGeo = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const legMat = new THREE.MeshPhongMaterial({ color: 0x000080 });
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.1, 0.25, 0);
        leftLeg.rotation.x = Math.PI / 16;
        character.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.1, 0.25, 0);
        rightLeg.rotation.x = -Math.PI / 16;
        character.add(rightLeg);

        character.position.set(initialCharacterX, 0, 0);
        character.leftArm = leftArm;
        character.rightArm = rightArm;
        character.traverse((child) => {
          if (child.isMesh) child.castShadow = true;
        });
        scene.add(character);

        // Block
        const blockGeometry = new THREE.BoxGeometry(1, 1.5, blockDepth);
        const blockMaterial = new THREE.MeshPhongMaterial({
          color: 0x8b4513,
          shininess: 30,
        });
        block = new THREE.Mesh(blockGeometry, blockMaterial);
        block.position.set(initialBlockX, 0.75, 0);
        block.name = "Block";
        block.castShadow = true;
        scene.add(block);

        // Distance Line
        const distanceLineColor = 0x007bff;
        const distanceLineMaterial = new THREE.LineBasicMaterial({
          color: distanceLineColor,
          linewidth: 3,
        });

        const distanceLineGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          initialBlockX + 0.5,
          0.05,
          0, // Start at block center
          initialBlockX + 0.5,
          0.05,
          0, // End at same position initially
        ]);
        distanceLineGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(vertices, 3)
        );

        distanceLine = new THREE.Line(
          distanceLineGeometry,
          distanceLineMaterial
        );
        distanceLine.name = "DistanceLine";
        scene.add(distanceLine);

        // Window resize handler
        window.addEventListener("resize", onWindowResize, false);
        animate();
      }

      function onWindowResize() {
        camera.aspect =
          threeContainer.clientWidth / threeContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          threeContainer.clientWidth,
          threeContainer.clientHeight
        );
      }

      function animate() {
        animationFrameId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }

      // --- UI Elements ---
      const forceInput = document.getElementById("force-input");
      const timeInput = document.getElementById("time-input");
      const distanceInput = document.getElementById("distance-input");
      const workOutput = document.getElementById("work-output");
      const powerOutput = document.getElementById("power-output");
      const startBtn = document.getElementById("start-btn");
      const stopBtn = document.getElementById("stop-btn");
      const resetBtn = document.getElementById("reset-btn");

      // --- Physics Calculation ---
      function calculatePhysics() {
        currentForce = parseFloat(forceInput.value) || 0;
        currentTime = parseFloat(timeInput.value) || 0.1;
        currentDistance = parseFloat(distanceInput.value) || 0;

        calculatedWork = currentForce * currentDistance;
        calculatedPower = currentTime > 0 ? calculatedWork / currentTime : 0;

        workOutput.textContent = calculatedWork.toFixed(2);
        powerOutput.textContent = calculatedPower.toFixed(2);
      }

      // --- Animation Logic ---
      let animationRunning = false;
      let animationStartTime = 0;
      let animationDuration = 0;

      function updateSimulation(timestamp) {
        if (!animationRunning) return;

        if (animationStartTime === 0) animationStartTime = timestamp;
        const elapsed = (timestamp - animationStartTime) / 1000;

        if (elapsed <= animationDuration) {
          const progress = Math.min(elapsed / animationDuration, 1);
          const currentMovedDistance = currentDistance * progress;

          // Update positions
          character.position.x = initialCharacterX + currentMovedDistance;
          block.position.x = initialBlockX + currentMovedDistance;

          // Animate character pushing
          const pushProgress = Math.min(progress * 3, 1);
          character.rightArm.rotation.z =
            -Math.PI / 8 - (Math.PI / 4) * pushProgress;
          character.leftArm.rotation.z =
            Math.PI / 8 + (Math.PI / 6) * pushProgress;
          character.rotation.y = -0.05 * pushProgress;

          // Update distance line
          const positions = distanceLine.geometry.attributes.position.array;
          positions[3] = initialBlockX + 0.5 + currentMovedDistance; // End point X
          distanceLine.geometry.attributes.position.needsUpdate = true;

          // Update displayed values during animation
          const elapsedTime = elapsed;
          const currentWork = currentForce * currentMovedDistance;
          const currentPower = elapsedTime > 0 ? currentWork / elapsedTime : 0;

          workOutput.textContent = currentWork.toFixed(2);
          powerOutput.textContent = currentPower.toFixed(2);

          requestAnimationFrame(updateSimulation);
        } else {
          // Animation complete
          handleStop();
          calculatePhysics(); // Final calculation
        }
      }

      function handleStart() {
        if (animationRunning) return;

        currentForce = parseFloat(forceInput.value) || 0;
        currentTime = parseFloat(timeInput.value) || 0.1;
        currentDistance = parseFloat(distanceInput.value) || 0;
        animationDuration = currentTime;

        if (currentDistance <= 0 || currentTime <= 0) {
          alert("Please enter positive values for Distance and Time.");
          return;
        }

        // Reset animation state
        animationRunning = true;
        animationStartTime = 0;

        // Reset positions
        character.position.x = initialCharacterX;
        block.position.x = initialBlockX;

        // Reset distance line
        const positions = distanceLine.geometry.attributes.position.array;
        positions[0] = initialBlockX + 0.5;
        positions[3] = initialBlockX + 0.5;
        distanceLine.geometry.attributes.position.needsUpdate = true;

        // Update UI
        forceInput.disabled = true;
        timeInput.disabled = true;
        distanceInput.disabled = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = true;

        // Start animation
        requestAnimationFrame(updateSimulation);
      }

      function handleStop() {
        if (!animationRunning) return;

        animationRunning = false;

        // Update UI
        forceInput.disabled = false;
        timeInput.disabled = false;
        distanceInput.disabled = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = false;
      }

      function handleReset() {
        handleStop();

        // Reset inputs
        forceInput.value = "10";
        timeInput.value = "5";
        distanceInput.value = "2";

        // Reset 3D objects
        character.position.x = initialCharacterX;
        block.position.x = initialBlockX;

        // Reset character pose
        character.leftArm.rotation.z = Math.PI / 8;
        character.rightArm.rotation.z = -Math.PI / 8;
        character.rotation.y = 0;

        // Reset distance line
        const positions = distanceLine.geometry.attributes.position.array;
        positions[0] = initialBlockX + 0.5;
        positions[3] = initialBlockX + 0.5;
        distanceLine.geometry.attributes.position.needsUpdate = true;

        // Recalculate physics
        calculatePhysics();

        // Reset button states
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = false;
      }

      // --- Initialization ---
      document.addEventListener("DOMContentLoaded", () => {
        initThree();
        calculatePhysics();

        // Event listeners
        forceInput.addEventListener("input", calculatePhysics);
        timeInput.addEventListener("input", calculatePhysics);
        distanceInput.addEventListener("input", calculatePhysics);

        startBtn.addEventListener("click", handleStart);
        stopBtn.addEventListener("click", handleStop);
        resetBtn.addEventListener("click", handleReset);
      });

      // Cleanup animation frame on page unload
      window.addEventListener("beforeunload", () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      });