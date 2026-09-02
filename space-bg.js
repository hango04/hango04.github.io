/**
 * 🌌 3D SPACE BACKGROUND — Hango Portfolio
 * Three.js 3D flying starfield with parallax mouse tracking.
 */
(function () {
  'use strict';

  // Wait for Three.js to load just in case it's deferred
  function init3DSpace() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not found, retrying in 100ms...');
      setTimeout(init3DSpace, 100);
      return;
    }

    // Remove old 2D canvas if it exists
    const oldCanvas = document.getElementById('space-canvas');
    if (oldCanvas) oldCanvas.remove();

    const container = document.createElement('div');
    container.id = 'space-canvas'; // Reuse ID
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '-1',
      background: 'radial-gradient(circle at center, #0a0b16 0%, #05060b 100%)'
    });
    // Insert behind everything
    document.body.insertBefore(container, document.body.firstChild);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060b, 0.0015); // Fog to fade stars into the background

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize performance
    container.appendChild(renderer.domElement);

    // Particle Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    // Theme colors: White, Ice Blue, Royal Blue
    const color1 = new THREE.Color(0x00c2ff); 
    const color2 = new THREE.Color(0x0052ff); 
    const color3 = new THREE.Color(0xffffff); 

    for (let i = 0; i < starCount; i++) {
      // Scatter in a 3D box
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

      // Assign random color based on probabilities
      const randCol = Math.random();
      let c = color3;
      if (randCol < 0.2) c = color1;
      else if (randCol < 0.4) c = color2;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular particle texture generator (so we don't need external images)
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    };

    const starMat = new THREE.PointsMaterial({
      size: 3.5,
      map: createCircleTexture(),
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;
    document.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.1;
      targetY = (e.clientY - window.innerHeight / 2) * 0.1;
    });

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Slowly rotate the whole starfield
      stars.rotation.x += 0.0003;
      stars.rotation.y += 0.0006;

      // Smooth camera parallax
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Fly-through effect
      const positionsArray = starGeo.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        positionsArray[i * 3 + 2] += 0.8; // Move Z forward
        if (positionsArray[i * 3 + 2] > 400) {
          positionsArray[i * 3 + 2] = -400; // Reset behind camera
        }
      }
      starGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DSpace);
  } else {
    init3DSpace();
  }

})();
