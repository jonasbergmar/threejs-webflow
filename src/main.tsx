import './index.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('threejs-bg');

  if (!container) {
    console.error('Could not find #threejs-bg in the DOM');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.TorusGeometry(1, 0.4, 32, 100);

  const uniforms = {
    uColor: { value: new THREE.Color(0xff3e3a) },
    uTime: { value: 0.0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      varying vec3 vNormal;

      void main() {
        float stripeWidth = 2.0;
        float x = mod(gl_FragCoord.x + uTime * 20.0, stripeWidth * 4.0);
        if (x > stripeWidth) discard;

        gl_FragColor = vec4(uColor, 1.0);
      }
    `,
    transparent: true,
  });

  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false; // Disable user drag control

  // Track mouse position
  const mouse = new THREE.Vector2();
  document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  function animate(time: number) {
    uniforms.uTime.value = time * 0.001;

    // Smooth torus rotation toward mouse
    const targetX = mouse.y * Math.PI * 0.25;
    const targetY = mouse.x * Math.PI * 0.25;

    torus.rotation.x += (targetX - torus.rotation.x) * 0.05;
    torus.rotation.y += (targetY - torus.rotation.y) * 0.05;

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
});
