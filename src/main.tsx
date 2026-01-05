import "./index.css";
import "lenis/dist/lenis.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);

// ----------- shared globals -----------
const mouse = new THREE.Vector2();
let scrollProgress = 0;

// track mouse position
document.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// setup Lenis once
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
lenis.on("scroll", ({ progress }) => {
  scrollProgress = progress;
});

// ----------- Hero Torus -----------
function initHeroTorus() {
  const container = document.getElementById("threejs-bg");
  if (!container) return console.error("Missing #threejs-bg");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
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
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(-vViewPosition);

        float rim = 1.0 - abs(dot(viewDir, normal));
        rim = pow(rim, 2.0);

        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diffuse = max(dot(normal, lightDir), 0.0);

        float pulse = 0.9 + 0.1 * sin(uTime * 2.0);
        float brightness = (diffuse * 0.8 + rim * 0.5) * pulse;
        brightness = clamp(brightness, 0.0, 1.0);

        float frequency = 0.5;
        float pattern = (sin(gl_FragCoord.x * frequency) + 1.0) * 0.5;
        float line = step(1.0 - brightness, pattern);

        gl_FragColor = vec4(uColor, line);

        if (line < 0.1) discard;
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enableDamping = true;

  function animate(time: number) {
    uniforms.uTime.value = time * 0.001;

    const mouseTargetX = mouse.y * Math.PI * 0.25;
    const mouseTargetY = mouse.x * Math.PI * 0.25;
    const scrollBoost = scrollProgress * Math.PI * 4.0;

    const combinedX = mouseTargetX + scrollBoost;
    const combinedY = mouseTargetY + scrollBoost;

    torus.rotation.x += (combinedX - torus.rotation.x) * 0.1;
    torus.rotation.y += (combinedY - torus.rotation.y) * 0.1;

    const start = 0.3;
    const end = 0.6;

    // Normalize scroll into 0 → 1 range within that step
    let t = (scrollProgress - start) / (end - start);
    t = THREE.MathUtils.clamp(t, 0, 1);

    // Eased scroll-based position
    const eased = THREE.MathUtils.smoothstep(0, 1, t); // smoother than linear

    // Move left to x = -2
    torus.position.x = -2 * eased;

    controls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

initHeroTorus();

// ----------- About Model (same animation) -----------
function initAboutModel() {
  const container = document.getElementById("about-container");
  if (!container) return;

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
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false; // Optional, disable if you want consistent scale

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);
  const modelUrl =
    "https://pub-9a148005ec23411eaa0569d3cf870b96.r2.dev/Jonas%203D%20Export_0004.glb";
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      function animateModel() {
        const mouseTargetX = mouse.y * Math.PI * 0.25;
        const mouseTargetY = mouse.x * Math.PI * 0.25;
        const scrollBoost = scrollProgress * Math.PI * 4.0;

        const combinedX = mouseTargetX + scrollBoost;
        const combinedY = mouseTargetY + scrollBoost;

        model.rotation.x += (combinedX - model.rotation.x) * 0.1;
        model.rotation.y += (combinedY - model.rotation.y) * 0.1;

        renderer.render(scene, camera);
        controls.update();
      }

      gsap.ticker.add(animateModel);
    },
    undefined,
    (err) => console.error("GLTF load error:", err)
  );

  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

initAboutModel();
