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

    void main() {
      // 1. Lighting calculation
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(-vViewPosition);
      
      // Rim light for edge definition
      float rim = 1.0 - abs(dot(viewDir, normal));
      rim = pow(rim, 2.0);

      // Basic diffuse light (assuming top-right light source)
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diffuse = max(dot(normal, lightDir), 0.0);

      // Animation: Pulse the brightness slightly
      float pulse = 0.9 + 0.1 * sin(uTime * 2.0);
      
      // Combined brightness determines line thickness
      float brightness = (diffuse * 0.8 + rim * 0.5) * pulse;
      brightness = clamp(brightness, 0.0, 1.0);

      // 2. Halftone/Engraving Line Pattern
      // Screen-space vertical lines
      float frequency = 0.5; // Density of lines
      float pattern = (sin(gl_FragCoord.x * frequency) + 1.0) * 0.5; // 0.0 to 1.0

      // If pattern is within the 'brightness' threshold, we draw it.
      // Brighter areas = thicker lines (more opacity coverage)
      // Darker areas = thinner lines
      float line = step(1.0 - brightness, pattern);

      // 3. Output
      gl_FragColor = vec4(uColor, line);
      
      // Optional: Clean cut for performance/transparency sorting
      if (line < 0.1) discard;
    }
  `,
  transparent: true,
  side: THREE.DoubleSide,
});


  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = true; // Disable user drag control

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
  window.addEventListener('resize', () => {
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

});
