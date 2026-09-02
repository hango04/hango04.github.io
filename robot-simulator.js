/**
 * Interactive 3D Robot SCARA Simulator for Ngô Mạnh Hà Portfolio
 * Based on Yamaha SCARA Robot & Automation Internship experience at Autotech
 */

(function () {
  let scene, camera, renderer;
  let robotBase, link1, link2, shaftZ, gripper, workpiece;
  let animId = null;
  let isAutoCycling = false;
  let cycleTime = 0;
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let cameraAngle = { theta: Math.PI / 4, phi: Math.PI / 6, radius: 14 };

  // Current joint positions
  const jointState = {
    j1: 0,        // deg (-120 to 120)
    j2: 0,        // deg (-145 to 145)
    z: 0,         // mm / units (0 to 3)
    grip: false   // workpiece attached
  };

  // Pick & Place cycle waypoints
  const PICK_POS = { j1: -45, j2: 40, zUp: 0.5, zDown: 2.8 };
  const PLACE_POS = { j1: 50, j2: -35, zUp: 0.5, zDown: 2.8 };

  function initSimulator() {
    const container = document.getElementById('robot-3d-canvas-container');
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    updateCameraPos();

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x7928ca, 2, 25);
    pointLight.position.set(-8, 10, -5);
    scene.add(pointLight);

    // Build SCARA Model
    buildWorkEnvironment();
    buildScaraRobot();

    // Setup mouse rotation controls
    setupCanvasControls(container);

    // UI Sliders & Buttons listeners
    setupUIControls();

    // Render loop
    animate();

    // Resize handler
    window.addEventListener('resize', onWindowResize);
  }

  function updateCameraPos() {
    camera.position.x = cameraAngle.radius * Math.sin(cameraAngle.theta) * Math.cos(cameraAngle.phi);
    camera.position.y = cameraAngle.radius * Math.sin(cameraAngle.phi);
    camera.position.z = cameraAngle.radius * Math.cos(cameraAngle.theta) * Math.cos(cameraAngle.phi);
    camera.lookAt(0, 2.8, 0);
  }

  function buildWorkEnvironment() {
    // Ground Grid
    const grid = new THREE.GridHelper(14, 14, 0x00d2ff, 0x1f2a48);
    grid.position.y = 0;
    scene.add(grid);

    // Industrial Pedestal Table
    const tableGeo = new THREE.CylinderGeometry(4.8, 5.2, 0.6, 32);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x111625,
      roughness: 0.4,
      metalness: 0.8
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.3;
    table.receiveShadow = true;
    scene.add(table);

    // Pedestal Glow Ring
    const ringGeo = new THREE.RingGeometry(4.6, 4.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.61;
    scene.add(ring);

    // Station A (Pick) Platform
    const binGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 16);
    const binMat = new THREE.MeshStandardMaterial({ color: 0x22324f, metalness: 0.6, roughness: 0.3 });
    const binA = new THREE.Mesh(binGeo, binMat);
    binA.position.set(-2.5, 0.8, 2.5);
    scene.add(binA);

    // Station B (Place) Platform
    const binB = new THREE.Mesh(binGeo, binMat.clone());
    binB.position.set(2.8, 0.8, 2.2);
    scene.add(binB);

    // Workpiece (Phôi linh kiện điện tử)
    const pieceGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16);
    const pieceMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x004466,
      roughness: 0.2,
      metalness: 0.9
    });
    workpiece = new THREE.Mesh(pieceGeo, pieceMat);
    workpiece.position.set(-2.5, 1.2, 2.5);
    scene.add(workpiece);
  }

  function buildScaraRobot() {
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf5f7fb,
      roughness: 0.2,
      metalness: 0.2
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1a2133,
      roughness: 0.5,
      metalness: 0.8
    });
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x0052ff,
      roughness: 0.3,
      metalness: 0.5
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.1,
      metalness: 0.95
    });

    // 1. Robot Base Column (Cột trụ đế Yamaha)
    robotBase = new THREE.Group();
    robotBase.position.set(0, 0.6, 0);

    const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 1.5, 32);
    const baseMesh = new THREE.Mesh(baseGeo, darkMat);
    baseMesh.position.y = 0.75;
    baseMesh.castShadow = true;
    robotBase.add(baseMesh);

    const brandRingGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.3, 32);
    const brandRing = new THREE.Mesh(brandRingGeo, blueMat);
    brandRing.position.y = 1.0;
    robotBase.add(brandRing);

    scene.add(robotBase);

    // 2. Link 1 (Cánh tay 1 - Xoay J1)
    link1 = new THREE.Group();
    link1.position.set(0, 1.6, 0);
    robotBase.add(link1);

    const arm1Joint = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.0, 32), whiteMat);
    arm1Joint.position.y = 0.5;
    link1.add(arm1Joint);

    const arm1Body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 2.4), whiteMat);
    arm1Body.position.set(0, 0.5, 1.2);
    link1.add(arm1Body);

    const arm1Cap = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.82, 32), whiteMat);
    arm1Cap.position.set(0, 0.5, 2.4);
    link1.add(arm1Cap);

    // 3. Link 2 (Cánh tay 2 - Xoay J2)
    link2 = new THREE.Group();
    link2.position.set(0, 0.4, 2.4);
    link1.add(link2);

    const arm2Body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 2.2), whiteMat);
    arm2Body.position.set(0, 0.35, 1.1);
    link2.add(arm2Body);

    const arm2Head = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.0, 32), darkMat);
    arm2Head.position.set(0, 0.5, 2.2);
    link2.add(arm2Head);

    // Cable harness curve (Mô phỏng ống dây dẫn khí / cáp encoder)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.9, 0.2),
      new THREE.Vector3(0, 1.8, 1.0),
      new THREE.Vector3(0, 1.2, 2.2)
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const cableHarness = new THREE.Mesh(tubeGeo, tubeMat);
    link2.add(cableHarness);

    // 4. Z-Axis Ball Screw Shaft (Trục nâng hạ Z)
    shaftZ = new THREE.Group();
    shaftZ.position.set(0, 0.5, 2.2);
    link2.add(shaftZ);

    const shaftRod = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.8, 24), chromeMat);
    shaftRod.position.y = 0;
    shaftZ.add(shaftRod);

    // Gripper / Suction Tool (Đầu kẹp gắp linh kiện)
    gripper = new THREE.Group();
    gripper.position.y = -1.9;
    shaftZ.add(gripper);

    const toolHead = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.35, 16), blueMat);
    gripper.add(toolHead);

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 16), darkMat);
    tip.position.y = -0.25;
    gripper.add(tip);

    applyJoints();
  }

  function applyJoints() {
    if (!link1 || !link2 || !shaftZ) return;
    link1.rotation.y = THREE.MathUtils.degToRad(jointState.j1);
    link2.rotation.y = THREE.MathUtils.degToRad(jointState.j2);
    shaftZ.position.y = 0.5 - jointState.z;

    // Attach workpiece if gripped
    if (jointState.grip && workpiece) {
      const tipWorld = new THREE.Vector3();
      gripper.getWorldPosition(tipWorld);
      workpiece.position.set(tipWorld.x, tipWorld.y - 0.3, tipWorld.z);
    }
  }

  function setupCanvasControls(container) {
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      cameraAngle.theta -= deltaX * 0.008;
      cameraAngle.phi = Math.max(0.1, Math.min(Math.PI / 2.2, cameraAngle.phi + deltaY * 0.008));

      updateCameraPos();
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      cameraAngle.theta -= deltaX * 0.01;
      cameraAngle.phi = Math.max(0.1, Math.min(Math.PI / 2.2, cameraAngle.phi + deltaY * 0.01));

      updateCameraPos();
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
  }

  function setupUIControls() {
    const sliderJ1 = document.getElementById('robot-j1');
    const sliderJ2 = document.getElementById('robot-j2');
    const sliderZ = document.getElementById('robot-z');
    const valJ1 = document.getElementById('val-j1');
    const valJ2 = document.getElementById('val-j2');
    const valZ = document.getElementById('val-z');
    const btnAuto = document.getElementById('btn-robot-auto');
    const btnReset = document.getElementById('btn-robot-reset');

    if (sliderJ1) {
      sliderJ1.addEventListener('input', (e) => {
        if (isAutoCycling) stopAutoCycle();
        jointState.j1 = parseFloat(e.target.value);
        if (valJ1) valJ1.textContent = `${jointState.j1}°`;
        applyJoints();
      });
    }

    if (sliderJ2) {
      sliderJ2.addEventListener('input', (e) => {
        if (isAutoCycling) stopAutoCycle();
        jointState.j2 = parseFloat(e.target.value);
        if (valJ2) valJ2.textContent = `${jointState.j2}°`;
        applyJoints();
      });
    }

    if (sliderZ) {
      sliderZ.addEventListener('input', (e) => {
        if (isAutoCycling) stopAutoCycle();
        jointState.z = parseFloat(e.target.value);
        if (valZ) valZ.textContent = `${Math.round(jointState.z * 50)}mm`;
        applyJoints();
      });
    }

    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        if (isAutoCycling) {
          stopAutoCycle();
        } else {
          startAutoCycle();
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        stopAutoCycle();
        jointState.j1 = 0;
        jointState.j2 = 0;
        jointState.z = 0;
        jointState.grip = false;
        if (sliderJ1) sliderJ1.value = 0;
        if (sliderJ2) sliderJ2.value = 0;
        if (sliderZ) sliderZ.value = 0;
        if (valJ1) valJ1.textContent = '0°';
        if (valJ2) valJ2.textContent = '0°';
        if (valZ) valZ.textContent = '0mm';
        if (workpiece) workpiece.position.set(-2.5, 1.2, 2.5);
        applyJoints();
      });
    }
  }

  function startAutoCycle() {
    isAutoCycling = true;
    cycleTime = 0;
    const btn = document.getElementById('btn-robot-auto');
    if (btn) {
      btn.classList.add('active');
      btn.innerHTML = `<span>Dừng Chu Trình</span>`;
    }
    const statusEl = document.getElementById('robot-status-text');
    if (statusEl) statusEl.textContent = 'AUTO CYCLE: ĐANG GẮP THẢ PHÔI...';
  }

  function stopAutoCycle() {
    isAutoCycling = false;
    const btn = document.getElementById('btn-robot-auto');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = `<span>Chạy Chu Trình Tự Động (Auto Pick & Place)</span>`;
    }
    const statusEl = document.getElementById('robot-status-text');
    if (statusEl) statusEl.textContent = 'MANUAL MODE: SẴN SÀNG ĐIỀU KHIỂN';
  }

  function updateAutoCycle(dt) {
    if (!isAutoCycling) return;
    cycleTime += dt;
    const totalDuration = 6.0; // 6 seconds loop
    const t = (cycleTime % totalDuration) / totalDuration;

    // Stage 1: Move above Pick (0.0 -> 0.2)
    if (t < 0.2) {
      const p = t / 0.2;
      jointState.j1 = THREE.MathUtils.lerp(PLACE_POS.j1, PICK_POS.j1, p);
      jointState.j2 = THREE.MathUtils.lerp(PLACE_POS.j2, PICK_POS.j2, p);
      jointState.z = PICK_POS.zUp;
      jointState.grip = false;
    }
    // Stage 2: Descend to Pick (0.2 -> 0.3)
    else if (t < 0.3) {
      const p = (t - 0.2) / 0.1;
      jointState.j1 = PICK_POS.j1;
      jointState.j2 = PICK_POS.j2;
      jointState.z = THREE.MathUtils.lerp(PICK_POS.zUp, PICK_POS.zDown, p);
      jointState.grip = p > 0.8;
    }
    // Stage 3: Ascend with workpiece (0.3 -> 0.4)
    else if (t < 0.4) {
      const p = (t - 0.3) / 0.1;
      jointState.j1 = PICK_POS.j1;
      jointState.j2 = PICK_POS.j2;
      jointState.z = THREE.MathUtils.lerp(PICK_POS.zDown, PICK_POS.zUp, p);
      jointState.grip = true;
    }
    // Stage 4: Move above Place (0.4 -> 0.7)
    else if (t < 0.7) {
      const p = (t - 0.4) / 0.3;
      jointState.j1 = THREE.MathUtils.lerp(PICK_POS.j1, PLACE_POS.j1, p);
      jointState.j2 = THREE.MathUtils.lerp(PICK_POS.j2, PLACE_POS.j2, p);
      jointState.z = PLACE_POS.zUp;
      jointState.grip = true;
    }
    // Stage 5: Descend to Place (0.7 -> 0.8)
    else if (t < 0.8) {
      const p = (t - 0.7) / 0.1;
      jointState.j1 = PLACE_POS.j1;
      jointState.j2 = PLACE_POS.j2;
      jointState.z = THREE.MathUtils.lerp(PLACE_POS.zUp, PLACE_POS.zDown, p);
      if (p > 0.5) jointState.grip = false;
    }
    // Stage 6: Ascend and reset workpiece back (0.8 -> 1.0)
    else {
      const p = (t - 0.8) / 0.2;
      jointState.j1 = PLACE_POS.j1;
      jointState.j2 = PLACE_POS.j2;
      jointState.z = THREE.MathUtils.lerp(PLACE_POS.zDown, PLACE_POS.zUp, p);
      jointState.grip = false;
      if (p > 0.9 && workpiece) {
        // Reset workpiece to station A for next loop
        workpiece.position.set(-2.5, 1.2, 2.5);
      }
    }

    // Sync UI sliders
    const sJ1 = document.getElementById('robot-j1');
    const sJ2 = document.getElementById('robot-j2');
    const sZ = document.getElementById('robot-z');
    const vJ1 = document.getElementById('val-j1');
    const vJ2 = document.getElementById('val-j2');
    const vZ = document.getElementById('val-z');
    if (sJ1) sJ1.value = jointState.j1;
    if (sJ2) sJ2.value = jointState.j2;
    if (sZ) sZ.value = jointState.z;
    if (vJ1) vJ1.textContent = `${Math.round(jointState.j1)}°`;
    if (vJ2) vJ2.textContent = `${Math.round(jointState.j2)}°`;
    if (vZ) vZ.textContent = `${Math.round(jointState.z * 50)}mm`;

    applyJoints();
  }

  let lastTime = performance.now();
  function animate() {
    animId = requestAnimationFrame(animate);
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (isAutoCycling) {
      updateAutoCycle(dt);
    }

    // Gentle camera orbit if idle
    if (!isDragging && !isAutoCycling) {
      cameraAngle.theta += 0.001;
      updateCameraPos();
    }

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    const container = document.getElementById('robot-3d-canvas-container');
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Initialize on window load or DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulator);
  } else {
    initSimulator();
  }
})();
