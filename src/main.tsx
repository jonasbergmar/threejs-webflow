import '@fontsource/inter';
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

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.TorusGeometry(1, 0.4, 32, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0xff3e3a });
  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enableDamping = true;

  function animate() {
    torus.rotation.x += 0.02;
    torus.rotation.y += 0.02;
    controls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
});
