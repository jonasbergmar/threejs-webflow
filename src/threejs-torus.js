import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
      const container = document.getElementById('threejs-bg');

      if (!container) {
        throw new Error("Element with id 'threejs-bg' not found.");
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      const geometry = new THREE.TorusGeometry(1, 0.4, 32, 100);
      const material = new THREE.MeshBasicMaterial({ color: 0xFF3E3A });
const torus = new THREE.Mesh(geometry, material);
const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enableDamping = true;
      scene.add(torus);

      camera.position.z = 5;

      function animate() {
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.01;

        controls.update();

        renderer.render(scene, camera);
      }

      renderer.setAnimationLoop(animate);