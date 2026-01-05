import "./index.css";
import "lenis/dist/lenis.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const modelUrl = 'https://pub-9a148005ec23411eaa0569d3cf870b96.r2.dev/Jonas%203D%20Export_0004.glb';

document.addEventListener("DOMContentLoaded", () => {
  initHeroTorus();
  initAboutModel();
});

function initHeroTorus() {
  const container = document.getElementById("threejs-bg");

  if (!container) {
    console.error("Could not find #threejs-bg in the DOM");
    return;
  }

  let scrollProgress = 0;
  const lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert time from seconds to milliseconds
  });
  gsap.ticker.lagSmoothing(0);

  lenis.on("scroll", ({ progress }: { progress: number }) => {
    scrollProgress = progress; // a value between 0 and 1
  });

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
  controls.enableZoom = false;

  // Track mouse position
  const mouse = new THREE.Vector2();
  document.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  function animate(time: number) {
    lenis.raf(time);
    uniforms.uTime.value = time * 0.001;

    const mouseTargetX = mouse.y * Math.PI * 0.25;
    const mouseTargetY = mouse.x * Math.PI * 0.25;

    const scrollBoost = scrollProgress * Math.PI * 2.0; // 0–360°
    const combinedX = mouseTargetX + scrollBoost;
    const combinedY = mouseTargetY + scrollBoost;

    torus.rotation.x += (combinedX - torus.rotation.x) * 0.1;
    torus.rotation.y += (combinedY - torus.rotation.y) * 0.1;

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
  window.addEventListener("resize", () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  });
}

function initAboutModel() {
  const container = document.getElementById("about-container");
  if (!container) return; // Silent fail if container doesn't exist yet

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    100
  );
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Loader
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      
      // Basic rotation loop for this model
      gsap.ticker.add(() => {
        model.rotation.y += 0.005;
      });
    },
    undefined,
    (error) => {
      console.error('Error loading GLB:', error);
    }
  );

  function resize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener("resize", resize);
  
  gsap.ticker.add(() => {
    renderer.render(scene, camera);
  });
}
