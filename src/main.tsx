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
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = viewPos.xyz;
      gl_Position = projectionMatrix * viewPos;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Use lighting or angle to camera to vary brightness
      float brightness = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));

      // Vertical stripe dithering
      float stripeX = mod(gl_FragCoord.x, 4.0);
      float stripeHeight = brightness * 200.0;

      if (gl_FragCoord.y > stripeHeight) discard;
      if (stripeX > 2.0) discard;

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
