/**
 * STATIC ELECTRICITY SIMULATION
 * Realistic physics with proper colors and attachment
 */

class StaticElectricitySimulation {
  constructor() {
    console.log("🔬 Initializing Static Electricity Simulation...");

    // Core physics properties
    this.rulerCharge = 0; // 0-100% charge
    this.maxCharge = 100;
    this.chargeDecayRate = 0.12; // Realistic decay
    this.isDraggingRuler = false;
    this.isRubbing = false;
    this.rubbingSpeed = 0;
    this.paperPieces = [];
    this.collectedPapers = 0;
    this.totalPapers = 10;
    this.time = 0;
    this.currentStep = 1;
    this.transferredElectrons = 0;

    // Attachment points on ruler
    this.attachmentPoints = [];
    this.generateAttachmentPoints();

    // Initialize
    this.initializeScene();
    this.createAllObjects();
    this.setupUserInteraction();
    this.setupUIControls();
    this.startAnimation();

    // Initial guidance
    this.showFloatingHint(
      "👋 Drag the YELLOW plastic ruler to begin",
      3000
    );
  }

  /**
   * Generate attachment points on ruler bottom
   */
  generateAttachmentPoints() {
    // Create points along the bottom of the ruler
    for (let i = 0; i < 10; i++) {
      this.attachmentPoints.push({
        position: new THREE.Vector3((i / 9 - 0.5) * 14, -0.3, 0),
        occupied: false,
        occupiedBy: null,
      });
    }
  }

  /**
   * Get available attachment point
   */
  getAvailableAttachmentPoint() {
    for (let point of this.attachmentPoints) {
      if (!point.occupied) return point;
    }
    return null;
  }

  /**
   * Initialize the 3D scene
   */
  initializeScene() {
    // Scene with proper background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a237e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 22, 30);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document
      .getElementById("canvasContainer")
      .appendChild(this.renderer.domElement);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(20, 30, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    this.scene.add(mainLight);

    // Rim light for better contrast
    const rimLight = new THREE.DirectionalLight(0x4466ff, 0.4);
    rimLight.position.set(-15, 25, -20);
    this.scene.add(rimLight);

    // Interaction setup
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
    this.dragOffset = new THREE.Vector3();
    this.lastRulerPosition = new THREE.Vector3();
  }

  /**
   * Create all objects with proper colors and materials
   */
  createAllObjects() {
    this.createTable();
    this.createRuler();
    this.createCloth();
    this.createPapers();
  }

  /**
   * Create wooden table
   */
  createTable() {
    // Table top
    const tableGeometry = new THREE.BoxGeometry(35, 1, 25);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Brown wood color
      roughness: 0.9,
      metalness: 0.1,
      bumpScale: 0.1,
    });

    this.table = new THREE.Mesh(tableGeometry, tableMaterial);
    this.table.position.y = -0.5;
    this.table.receiveShadow = true;
    this.scene.add(this.table);

    // Table legs
    const legGeometry = new THREE.CylinderGeometry(0.7, 0.9, 3, 8);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x5d4037,
      roughness: 0.8,
    });

    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      const x = i % 2 === 0 ? -16 : 16;
      const z = i < 2 ? -11 : 11;
      leg.position.set(x, -2.5, z);
      leg.castShadow = true;
      this.scene.add(leg);
    }
  }

  /**
   * Create plastic ruler with clear yellow color
   */
  createRuler() {
    // Main ruler body - BRIGHT YELLOW
    const rulerGeometry = new THREE.BoxGeometry(16, 0.5, 2.8);
    const rulerMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700, // Bright yellow - GOLD
      shininess: 100,
      specular: 0x222222,
      transparent: true,
      opacity: 0.55, // More translucent
      emissive: 0x000000,
      emissiveIntensity: 0,
    });

    this.ruler = new THREE.Mesh(rulerGeometry, rulerMaterial);
    this.ruler.position.set(0, 1, 0);
    this.ruler.castShadow = true;
    this.ruler.receiveShadow = true;
    this.scene.add(this.ruler);

    // Add detailed centimeter markings
    this.addRulerMarkings();

    // Add electron flow visualization (hidden initially)
    this.createElectronFlow();

    console.log("📏 Ruler created - YELLOW plastic");
  }

  /**
   * Add detailed centimeter markings
   */
  addRulerMarkings() {
    const markingsGroup = new THREE.Group();

    for (let i = 0; i <= 15; i++) {
      // Different line lengths
      const isLong = i % 5 === 0;
      const isMedium = i % 1 === 0 && !isLong;
      const isShort = !isLong && !isMedium;

      const lineHeight = isLong ? 0.8 : isMedium ? 0.6 : 0.4;
      const lineWidth = isLong ? 0.12 : 0.08;
      const lineDepth = 0.02;

      const lineGeometry = new THREE.BoxGeometry(
        lineWidth,
        lineDepth,
        lineHeight
      );
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: isLong ? 0x000000 : 0x333333,
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);

      // Position on ruler edge
      line.position.set(i - 7.5, 0.26, 1.4);
      markingsGroup.add(line);

      // Add numbers at 5cm intervals
      if (isLong && i > 0) {
        const numberCanvas = document.createElement("canvas");
        numberCanvas.width = 64;
        numberCanvas.height = 64;
        const ctx = numberCanvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(i.toString(), 32, 32);

        const numberTexture = new THREE.CanvasTexture(numberCanvas);
        const numberMaterial = new THREE.MeshBasicMaterial({
          map: numberTexture,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const numberPlane = new THREE.PlaneGeometry(0.8, 0.8);
        const number = new THREE.Mesh(numberPlane, numberMaterial);
        number.position.set(i - 7.5, 0.26, 0.5);
        number.rotation.x = -Math.PI / 2;
        markingsGroup.add(number);
      }
    }

    this.ruler.add(markingsGroup);
  }

  /**
   * Create electron flow visualization
   */
  createElectronFlow() {
    this.electronParticles = new THREE.Group();

    // Create particle system for electron flow
    const particleCount = 30;
    const particleGeometry = new THREE.SphereGeometry(0.05, 6, 6);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7, // Light blue for electrons
      transparent: true,
      opacity: 0,
    });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        particleGeometry,
        particleMaterial.clone()
      );
      particle.visible = false;
      this.electronParticles.add(particle);
    }

    this.ruler.add(this.electronParticles);
  }

  /**
   * Create wool cloth with proper red color
   */
  createCloth() {
    // Main cloth body - DEEP RED
    const clothGeometry = new THREE.BoxGeometry(6, 0.5, 6);
    const clothMaterial = new THREE.MeshStandardMaterial({
      color: 0xc62828, // Deep red - like wool
      roughness: 0.95,
      metalness: 0,
      bumpScale: 0.2,
    });

    this.cloth = new THREE.Mesh(clothGeometry, clothMaterial);
    this.cloth.position.set(-11, 0.7, 0); // Left side of table
    this.cloth.castShadow = true;
    this.cloth.receiveShadow = true;
    this.scene.add(this.cloth);

    // Add fabric texture with dots
    const textureGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const dotGeometry = new THREE.CylinderGeometry(
          0.08,
          0.08,
          0.1,
          8
        );
        const dotMaterial = new THREE.MeshStandardMaterial({
          color: 0xb71c1c,
          roughness: 0.8,
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set((i - 2.5) * 1.2, 0.26, (j - 2.5) * 1.2);
        dot.rotation.x = Math.PI / 2;
        textureGroup.add(dot);
      }
    }
    this.cloth.add(textureGroup);

    console.log("🧶 Wool cloth created - DEEP RED");
  }

  /**
   * Create paper pieces with proper white color
   */
  createPapers() {
    for (let i = 0; i < this.totalPapers; i++) {
      // Each paper is slightly different size
      const width = 0.8 + Math.random() * 0.7;
      const height = 0.6 + Math.random() * 0.5;
      const geometry = new THREE.PlaneGeometry(width, height);

      // Add slight curvature to papers
      const vertices = geometry.attributes.position;
      for (let j = 0; j < vertices.count; j++) {
        vertices.setZ(j, (Math.random() - 0.5) * 0.03);
      }
      geometry.computeVertexNormals();

      // PURE WHITE paper material
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Pure white
        roughness: 0.7,
        metalness: 0,
        side: THREE.DoubleSide,
        emissive: 0x000000,
        emissiveIntensity: 0,
      });

      const paper = new THREE.Mesh(geometry, material);

      // Position on right side of table
      paper.position.set(
        5 + Math.random() * 9,
        0.2 + Math.random() * 0.1,
        (Math.random() - 0.5) * 18
      );

      // Lay flat on table
      paper.rotation.x = Math.PI / 2;
      paper.rotation.z = Math.random() * Math.PI * 2;

      paper.castShadow = true;
      paper.receiveShadow = true;

      // Enhanced paper physics properties
      paper.userData = {
        id: i,
        originalPosition: paper.position.clone(),
        originalRotation: paper.rotation.clone(),
        isAttached: false,
        isBeingAttracted: false,
        attachedPoint: null,
        attachmentOffset: new THREE.Vector3(),
        velocity: new THREE.Vector3(0, 0, 0),
        angularVelocity: new THREE.Vector3(0, 0, 0),
        mass: 0.02 + Math.random() * 0.03,
        charge: 0,
        wobblePhase: Math.random() * Math.PI * 2,
        attachTime: 0,
        stiffness: 0.8 + Math.random() * 0.4,
      };

      this.scene.add(paper);
      this.paperPieces.push(paper);
    }

    console.log(`📄 Created ${this.totalPapers} WHITE paper pieces`);
  }

  /**
   * Setup user interaction
   */
  setupUserInteraction() {
    const canvas = this.renderer.domElement;

    // Mouse events
    canvas.addEventListener("mousedown", (e) => this.onPointerDown(e));
    canvas.addEventListener("mousemove", (e) => this.onPointerMove(e));
    canvas.addEventListener("mouseup", () => this.onPointerUp());
    canvas.addEventListener("mouseleave", () => this.onPointerUp());

    // Touch events
    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.onPointerDown(touch);
      },
      { passive: false }
    );

    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.onPointerMove(touch);
      },
      { passive: false }
    );

    canvas.addEventListener("touchend", () => this.onPointerUp());

    // Window resize
    window.addEventListener("resize", () => this.onWindowResize());
  }

  /**
   * Handle pointer down
   */
  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.ruler, true);

    if (intersects.length > 0) {
      this.isDraggingRuler = true;

      const intersectPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);
      this.dragOffset.copy(intersectPoint).sub(this.ruler.position);
      this.lastRulerPosition.copy(this.ruler.position);

      this.renderer.domElement.style.cursor = "grabbing";

      // Visual feedback
      this.createGrabEffect(intersects[0].point);
    }
  }

  /**
   * Create grab effect
   */
  createGrabEffect(position) {
    const ringGeometry = new THREE.RingGeometry(0.1, 0.4, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffeb3b,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.position.y += 0.5;
    ring.rotation.x = Math.PI / 2;
    this.scene.add(ring);

    // Animate
    let scale = 1;
    let opacity = 0.7;

    const animateRing = () => {
      scale += 0.15;
      opacity -= 0.1;

      ring.scale.setScalar(scale);
      ringMaterial.opacity = opacity;

      if (opacity <= 0) {
        this.scene.remove(ring);
        ringGeometry.dispose();
        ringMaterial.dispose();
        return;
      }

      requestAnimationFrame(animateRing);
    };

    animateRing();
  }

  /**
   * Handle pointer move
   */
  onPointerMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    if (!this.isDraggingRuler) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObject(this.ruler, true);
      this.renderer.domElement.style.cursor =
        intersects.length > 0 ? "grab" : "default";
      return;
    }

    // Calculate new position
    const intersectPoint = new THREE.Vector3();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);

    const newPosition = intersectPoint.sub(this.dragOffset);
    newPosition.y = 1; // Keep at constant height

    // Boundary constraints
    newPosition.x = THREE.MathUtils.clamp(newPosition.x, -14, 14);
    newPosition.z = THREE.MathUtils.clamp(newPosition.z, -10, 10);

    // Calculate speed
    const deltaPosition = newPosition.distanceTo(this.lastRulerPosition);
    this.rubbingSpeed =
      this.rubbingSpeed * 0.6 + deltaPosition * 60 * 0.4;

    // Update ruler position
    this.ruler.position.copy(newPosition);

    // Check physics
    this.checkIfRubbingCloth();
    this.applyElectrostaticForces();
    this.updateAttachedPapers();

    this.lastRulerPosition.copy(newPosition);
  }

  /**
   * Handle pointer up
   */
  onPointerUp() {
    this.isDraggingRuler = false;
    this.isRubbing = false;
    this.renderer.domElement.style.cursor = "default";
  }

  /**
   * Check if ruler is rubbing cloth and build charge
   */
  checkIfRubbingCloth() {
    const rulerBox = new THREE.Box3().setFromObject(this.ruler);
    const clothBox = new THREE.Box3().setFromObject(this.cloth);

    if (rulerBox.intersectsBox(clothBox)) {
      if (this.rubbingSpeed > 3) {
        this.isRubbing = true;

        // Build charge based on rubbing speed
        const chargeGain = Math.min(this.rubbingSpeed * 0.25, 4);
        const previousCharge = this.rulerCharge;
        this.rulerCharge = Math.min(
          this.maxCharge,
          this.rulerCharge + chargeGain
        );

        // Track electron transfer
        this.transferredElectrons += chargeGain * 1e12;

        if (this.rulerCharge > previousCharge) {
          // Show electron flow
          this.showElectronFlow();

          // Visual feedback
          if (Math.random() < 0.3) {
            this.createSparkEffect();
          }

          // Animate cloth
          const rubIntensity = Math.min(this.rubbingSpeed / 20, 1);
          this.cloth.position.y =
            0.7 + Math.sin(Date.now() * 0.03) * 0.2 * rubIntensity;
          this.cloth.rotation.x =
            Math.sin(Date.now() * 0.025) * 0.1 * rubIntensity;

          // Update UI
          this.updateStatusDisplay();

          console.log(`⚡ Charging... ${Math.round(this.rulerCharge)}%`);
        }
      } else {
        this.isRubbing = false;
      }
    } else {
      this.isRubbing = false;
      // Return cloth to normal
      this.cloth.position.y += (0.7 - this.cloth.position.y) * 0.1;
      this.cloth.rotation.x += (0 - this.cloth.rotation.x) * 0.1;
    }
  }

  /**
   * Show electron flow visualization
   */
  showElectronFlow() {
    const particles = this.electronParticles.children;
    const chargeRatio = this.rulerCharge / this.maxCharge;

    // Show random particles based on charge
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      if (Math.random() < chargeRatio * 0.3) {
        if (!particle.visible) {
          // Position particle randomly on ruler
          particle.position.set(
            (Math.random() - 0.5) * 14,
            -0.2 + Math.random() * 0.1,
            (Math.random() - 0.5) * 2
          );
          particle.material.opacity = 0.8;
          particle.visible = true;
        }

        // Animate movement toward cloth
        const direction = new THREE.Vector3(-11, 0.7, 0)
          .sub(this.ruler.position)
          .normalize();

        particle.position.add(direction.multiplyScalar(0.1));
        particle.material.opacity -= 0.05;

        if (particle.material.opacity <= 0) {
          particle.visible = false;
        }
      }
    }
  }

  /**
   * Create spark effect
   */
  createSparkEffect() {
    // Create small spark at contact point
    const sparkGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.9,
    });

    const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);

    // Position between ruler and cloth
    const midPoint = new THREE.Vector3()
      .addVectors(this.ruler.position, this.cloth.position)
      .multiplyScalar(0.5);
    spark.position.copy(midPoint);
    spark.position.y += 1;

    this.scene.add(spark);

    // Animate spark
    let opacity = 0.9;
    let scale = 1;

    const animateSpark = () => {
      opacity -= 0.1;
      scale += 0.2;

      spark.material.opacity = opacity;
      spark.scale.setScalar(scale);

      if (opacity <= 0) {
        this.scene.remove(spark);
        sparkGeometry.dispose();
        sparkMaterial.dispose();
        return;
      }

      requestAnimationFrame(animateSpark);
    };

    animateSpark();
  }

  /**
   * Apply electrostatic forces to papers
   */
  applyElectrostaticForces() {
    if (this.rulerCharge < 20) return;

    const chargeRatio = this.rulerCharge / this.maxCharge;
    const attractionRadius = 4 + chargeRatio * 6;
    const attractionPower = this.rulerCharge * 0.0008;

    for (const paper of this.paperPieces) {
      if (paper.userData.isAttached) continue;

      const distance = paper.position.distanceTo(this.ruler.position);

      if (distance < attractionRadius) {
        const heightDifference = this.ruler.position.y - paper.position.y;

        if (heightDifference > 0.4) {
          paper.userData.isBeingAttracted = true;

          // Calculate force magnitude (inverse square law)
          const forceMagnitude =
            attractionPower / Math.max(distance * distance, 0.5);

          // Direction toward ruler
          const direction = new THREE.Vector3()
            .subVectors(this.ruler.position, paper.position)
            .normalize();

          if (paper.position.y < 0.3) {
            // Paper is on table - apply horizontal force
            const horizontalForce = direction.clone();
            horizontalForce.y = 0;
            horizontalForce
              .normalize()
              .multiplyScalar(forceMagnitude * 0.4);
            paper.userData.velocity.add(horizontalForce);

            // Edge lifting effect
            if (distance < 3) {
              const liftAmount = (3 - distance) / 3;
              paper.userData.velocity.y +=
                forceMagnitude * liftAmount * 0.3;

              // Rotate edge up
              const targetAngle = Math.PI / 2 - liftAmount * 0.4;
              paper.rotation.x += (targetAngle - paper.rotation.x) * 0.1;
            }

            // Vibrate slightly when close
            if (distance < 2.5) {
              paper.position.x += (Math.random() - 0.5) * 0.02;
              paper.position.z += (Math.random() - 0.5) * 0.02;
            }
          } else {
            // Paper is airborne - apply full force
            paper.userData.velocity.add(
              direction.multiplyScalar(forceMagnitude)
            );
            paper.userData.angularVelocity.z += forceMagnitude * 0.2;
          }

          // Check if should attach
          if (distance < 1.8 && paper.position.y > 0.5) {
            this.attachPaperToRuler(paper);
          }
        }
      } else {
        if (paper.userData.isBeingAttracted) {
          paper.userData.isBeingAttracted = false;
          // Apply gravity
          paper.userData.velocity.y -= 0.05;
        }
      }
    }
  }

  /**
   * Attach paper to ruler PROPERLY
   */
  attachPaperToRuler(paper) {
    if (paper.userData.isAttached) return;

    // Find available attachment point
    const attachPoint = this.getAvailableAttachmentPoint();
    if (!attachPoint) return; // No space left

    console.log(`📄 Paper ${paper.userData.id} attached to ruler`);

    // Mark point as occupied
    attachPoint.occupied = true;
    attachPoint.occupiedBy = paper;

    // Update paper data
    paper.userData.isAttached = true;
    paper.userData.isBeingAttracted = false;
    paper.userData.attachedPoint = attachPoint;
    paper.userData.attachTime = this.time;

    // Calculate attachment offset (local to ruler)
    paper.userData.attachmentOffset.copy(attachPoint.position);

    // Update counter
    this.collectedPapers++;
    document.getElementById("paperCounterNumber").textContent =
      this.collectedPapers;
    document.getElementById(
      "paperStatus"
    ).textContent = `${this.collectedPapers} / ${this.totalPapers}`;

    // Visual effect
    this.createAttachmentEffect(paper.position);
  }

  /**
   * Update positions of attached papers
   */
  updateAttachedPapers() {
    for (const paper of this.paperPieces) {
      if (paper.userData.isAttached && paper.userData.attachedPoint) {
        const point = paper.userData.attachedPoint;
        const timeSinceAttach = this.time - paper.userData.attachTime;

        // Calculate world position of attachment point
        const worldPosition = new THREE.Vector3()
          .copy(point.position)
          .add(this.ruler.position);

        // Add gentle wobble
        const wobbleAmount = 0.1;
        const wobbleX =
          Math.sin(timeSinceAttach * 3 + paper.userData.wobblePhase) *
          wobbleAmount;
        const wobbleZ =
          Math.cos(timeSinceAttach * 4 + paper.userData.wobblePhase) *
          wobbleAmount;

        worldPosition.x += wobbleX;
        worldPosition.z += wobbleZ;

        // Add gentle bobbing
        worldPosition.y += Math.sin(timeSinceAttach * 2) * 0.05;

        // Smooth movement to target position
        paper.position.lerp(worldPosition, 0.3);

        // Gentle rotation
        paper.rotation.x =
          Math.PI / 2 + Math.sin(timeSinceAttach * 1.5) * 0.08;
        paper.rotation.z += 0.02;

        // Papers fall off if charge is too low
        if (this.rulerCharge < 15) {
          const detachChance = ((15 - this.rulerCharge) / 15) * 0.01;
          if (Math.random() < detachChance) {
            this.detachPaper(paper);
          }
        }
      }
    }
  }

  /**
   * Detach paper from ruler
   */
  detachPaper(paper) {
    if (!paper.userData.isAttached) return;

    console.log(`📄 Paper ${paper.userData.id} detached`);

    // Free attachment point
    if (paper.userData.attachedPoint) {
      paper.userData.attachedPoint.occupied = false;
      paper.userData.attachedPoint.occupiedBy = null;
    }

    // Update paper state
    paper.userData.isAttached = false;
    paper.userData.isBeingAttracted = false;
    paper.userData.velocity.set(0, -0.1, 0);
    paper.userData.angularVelocity.set(
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3
    );

    // Update counter
    this.collectedPapers = Math.max(0, this.collectedPapers - 1);
    document.getElementById("paperCounterNumber").textContent =
      this.collectedPapers;
    document.getElementById(
      "paperStatus"
    ).textContent = `${this.collectedPapers} / ${this.totalPapers}`;
  }

  /**
   * Create attachment effect
   */
  createAttachmentEffect(position) {
    const particleCount = 8;
    const colors = [0x4caf50, 0x8bc34a, 0xcddc39];

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.08, 6, 6);
      const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0.9,
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      particle.position.y += 0.3;
      this.scene.add(particle);

      // Radial burst
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.15;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 0.1,
        Math.sin(angle) * speed
      );

      // Animate
      const animateParticle = () => {
        particle.position.add(velocity);
        velocity.multiplyScalar(0.9);
        material.opacity -= 0.05;

        if (material.opacity <= 0) {
          this.scene.remove(particle);
          geometry.dispose();
          material.dispose();
          return;
        }

        requestAnimationFrame(animateParticle);
      };

      animateParticle();
    }
  }

  /**
   * Update paper physics
   */
  updatePaperPhysics(deltaTime) {
    const fixedDeltaTime = Math.min(deltaTime, 1 / 30);

    for (const paper of this.paperPieces) {
      const data = paper.userData;

      if (!data.isAttached) {
        // Apply velocity
        paper.position.add(data.velocity);

        // Apply angular velocity
        paper.rotation.x += data.angularVelocity.x * fixedDeltaTime;
        paper.rotation.y += data.angularVelocity.y * fixedDeltaTime;
        paper.rotation.z += data.angularVelocity.z * fixedDeltaTime;

        // Apply gravity
        if (!data.isBeingAttracted) {
          data.velocity.y -= 0.098 * fixedDeltaTime;
        }

        // Air resistance
        data.velocity.multiplyScalar(0.95);
        data.angularVelocity.multiplyScalar(0.9);

        // Table collision
        if (paper.position.y < 0.15) {
          paper.position.y = 0.15;
          if (data.velocity.y < 0) {
            data.velocity.y = -data.velocity.y * 0.5; // Bounce
            data.velocity.multiplyScalar(0.7); // Friction
          }
        }

        // Boundary constraints
        paper.position.x = THREE.MathUtils.clamp(
          paper.position.x,
          -16,
          16
        );
        paper.position.z = THREE.MathUtils.clamp(
          paper.position.z,
          -11,
          11
        );

        // Gentle breathing when at rest
        if (data.velocity.length() < 0.01 && paper.position.y <= 0.16) {
          const breatheAmount = 0.008;
          const targetY =
            0.15 +
            Math.sin(this.time * 0.5 + data.wobblePhase) * breatheAmount;
          paper.position.y += (targetY - paper.position.y) * 0.1;
        }
      }
    }
  }

  /**
   * Update charge decay
   */
  updateChargeDecay(deltaTime) {
    if (!this.isRubbing && this.rulerCharge > 0) {
      const decay = Math.exp(-this.chargeDecayRate * deltaTime);
      this.rulerCharge *= decay;

      // Hide electron flow when charge is low
      if (this.rulerCharge < 10) {
        const particles = this.electronParticles.children;
        for (let particle of particles) {
          particle.visible = false;
        }
      }

      // Update display occasionally
      if (Math.random() < 0.15) {
        this.updateStatusDisplay();
      }
    }
  }

  /**
   * Update ruler visual effects
   */
  updateRulerVisualEffects() {
    const chargeRatio = this.rulerCharge / this.maxCharge;
    const material = this.ruler.material;

    // Glow effect when charged
    if (chargeRatio > 0.2) {
      const glowIntensity = Math.pow(chargeRatio, 1.5) * 0.8;
      material.emissive = new THREE.Color(0xffeb3b);
      material.emissiveIntensity = glowIntensity * 0.3;

      // Pulsing effect when highly charged
      if (chargeRatio > 0.7) {
        const pulse = 1 + Math.sin(this.time * 10) * 0.04;
        this.ruler.scale.y = pulse;
      }
    } else {
      material.emissiveIntensity = 0;
      this.ruler.scale.y = 1;
    }
  }

  /**
   * Setup UI controls
   */
  setupUIControls() {
    // Reset button
    document
      .getElementById("resetButton")
      .addEventListener("click", () => {
        this.resetExperiment();
      });

    // Initial UI update
    this.updateStatusDisplay();
  }

  /**
   * Reset experiment
   */
  resetExperiment() {
    console.log("🔄 Resetting experiment...");

    // Reset properties
    this.rulerCharge = 0;
    this.collectedPapers = 0;
    this.transferredElectrons = 0;

    // Reset ruler position
    this.ruler.position.set(0, 1, 0);
    this.lastRulerPosition.copy(this.ruler.position);

    // Reset cloth
    this.cloth.position.y = 0.7;
    this.cloth.rotation.x = 0;

    // Reset papers
    for (const paper of this.paperPieces) {
      paper.position.copy(paper.userData.originalPosition);
      paper.rotation.copy(paper.userData.originalRotation);
      paper.userData.isAttached = false;
      paper.userData.isBeingAttracted = false;
      paper.userData.velocity.set(0, 0, 0);
      paper.userData.angularVelocity.set(0, 0, 0);

      // Free attachment points
      if (paper.userData.attachedPoint) {
        paper.userData.attachedPoint.occupied = false;
        paper.userData.attachedPoint.occupiedBy = null;
        paper.userData.attachedPoint = null;
      }
    }

    // Reset attachment points
    for (let point of this.attachmentPoints) {
      point.occupied = false;
      point.occupiedBy = null;
    }

    // Update UI
    this.updateStatusDisplay();
    document.getElementById("paperCounterNumber").textContent = "0";
    document.getElementById("paperStatus").textContent = "0 / 10";
    document.getElementById("speedStatus").textContent = "0 cm/s";
  }

  /**
   * Update status display
   */
  updateStatusDisplay() {
    const chargePercent = (this.rulerCharge / this.maxCharge) * 100;

    // Update charge meter
    document.getElementById(
      "chargeMeterIndicator"
    ).style.left = `${chargePercent}%`;

    // Update charge status
    const chargeStatus = document.getElementById("chargeStatus");
    if (this.rulerCharge < 15) {
      chargeStatus.textContent = "NEUTRAL";
      chargeStatus.style.color = "#95a5a6";
    } else if (this.rulerCharge < 40) {
      chargeStatus.textContent = "SLIGHTLY CHARGED";
      chargeStatus.style.color = "#2196F3";
    } else if (this.rulerCharge < 75) {
      chargeStatus.textContent = "CHARGED";
      chargeStatus.style.color = "#9C27B0";
    } else {
      chargeStatus.textContent = "HIGHLY CHARGED!";
      chargeStatus.style.color = "#F44336";
    }

    // Update speed
    document.getElementById("speedStatus").textContent = `${Math.round(
      this.rubbingSpeed
    )} cm/s`;

    // Update electron count
    const electronCount =
      Math.round(this.transferredElectrons / 1e10) * 10;
    document.getElementById(
      "electronStatus"
    ).textContent = `${electronCount.toLocaleString()} e⁻`;
  }

  /**
   * Celebration when all papers collected
   */
  celebrateCompletion() {
    console.log("🎉 ALL PAPERS COLLECTED!");
    this.showFloatingHint("🎉 Amazing! All papers collected electrostatically! 🎉", 4000);

    // Confetti celebration
    for (let i = 0; i < 80; i++) {
      setTimeout(() => this.createConfettiParticle(), i * 40);
    }
  }

  /**
   * Create confetti particle
   */
  createConfettiParticle() {
    const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.03);
    const colors = [0xffd700, 0xc62828, 0xffffff, 0x4caf50];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
    });

    const confetti = new THREE.Mesh(geometry, material);

    // Start above scene
    confetti.position.set(
      (Math.random() - 0.5) * 25,
      15,
      (Math.random() - 0.5) * 20
    );

    this.scene.add(confetti);

    // Physics
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.15,
      -0.2 - Math.random() * 0.1,
      (Math.random() - 0.5) * 0.15
    );

    const rotationSpeed = new THREE.Vector3(
      Math.random() * 0.2,
      Math.random() * 0.2,
      Math.random() * 0.2
    );

    // Animate
    const animate = () => {
      confetti.position.add(velocity);
      confetti.rotation.x += rotationSpeed.x;
      confetti.rotation.y += rotationSpeed.y;
      confetti.rotation.z += rotationSpeed.z;

      velocity.y += 0.001; // Gravity
      material.opacity -= 0.008;

      if (material.opacity <= 0 || confetti.position.y < 0) {
        this.scene.remove(confetti);
        geometry.dispose();
        material.dispose();
        return;
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Show floating hint
   */
  showFloatingHint(message, duration = 2500) {
    const hint = document.getElementById("floatingHint");
    hint.textContent = message;
    hint.classList.add("show");
    
    setTimeout(() => {
      hint.classList.remove("show");
    }, duration);
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Main animation loop
   */
  startAnimation() {
    let lastTime = 0;

    const animate = (currentTime) => {
      requestAnimationFrame(animate);

      // Calculate delta time
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      this.time = currentTime / 1000;

      // Fixed time step for physics
      const fixedDeltaTime = Math.min(deltaTime, 1 / 30);

      // Update systems
      this.updatePaperPhysics(fixedDeltaTime);
      this.updateChargeDecay(fixedDeltaTime);
      this.updateRulerVisualEffects();

      // Check for celebration
      if (this.collectedPapers === this.totalPapers) {
        this.celebrateCompletion();
        this.collectedPapers++; // Prevent continuous celebration
      }

      // Render
      this.renderer.render(this.scene, this.camera);
    };

    animate(0);
  }
}

/**
 * START THE SIMULATION
 */
window.addEventListener("load", () => {
  console.log("🚀 Launching Static Electricity Simulation...");
  try {
    new StaticElectricitySimulation();
  } catch (error) {
    console.error("Failed to initialize simulation:", error);
    document.getElementById("floatingHint").textContent =
      "Error loading simulation. Please refresh.";
    document.getElementById("floatingHint").classList.add("show");
  }
});