import './styles/style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
    

const initSuburbScene = () => {
    const container = document.getElementById('village-3d');
    if (!container) {
        console.warn('Container #village-3d not found');
        return;
    }

    // Scene Setup
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x050505); // Removed for transparency
    // scene.fog = new THREE.Fog(0x050505, 10, 50); // Removed for transparency

    // Camera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enableDamping = true; // Optional, but nice for smooth rotation


    // Lights
    const ambientLight = new THREE.AmbientLight(0x7747D0, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x7747D0, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Grid Helper (Ground)
    const gridHelper = new THREE.GridHelper(50, 50, 0xE1D6F5, 0xE1D6F5);
    scene.add(gridHelper);

    // House Generation Logic
    const houses = [];
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    const createHouse = (x, z) => {
        const house = new THREE.Group();

        // Materials
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x7747D0, transparent: true, opacity: 0.8 });
        const particleMaterial = new THREE.PointsMaterial({ color: 0x7747D0, size: 0.05 });

        // Base (Box)
        const width = 0.5 + Math.random() * 1;
        const height = 0.5 + Math.random() * 1;
        const depth = 0.5 + Math.random() * 1;
        
        const boxGeometry = new THREE.BoxGeometry(width, height, depth);
        
        // Wireframe for Box
        const boxEdges = new THREE.EdgesGeometry(boxGeometry);
        const boxLines = new THREE.LineSegments(boxEdges, wireframeMaterial);
        boxLines.position.y = height / 2;
        house.add(boxLines);

        // Particles for Box vertices
        const boxPoints = new THREE.Points(boxGeometry, particleMaterial);
        boxPoints.position.y = height / 2;
        house.add(boxPoints);

        // Roof (Cone)
        const roofHeight = 0.5 + Math.random() * 0.5;
        const coneGeometry = new THREE.ConeGeometry(Math.max(width, depth) * 0.8, roofHeight, 4);
        
        // Wireframe for Roof
        const coneEdges = new THREE.EdgesGeometry(coneGeometry);
        const coneLines = new THREE.LineSegments(coneEdges, wireframeMaterial);
        coneLines.position.y = height + roofHeight / 2;
        coneLines.rotation.y = Math.PI / 4; // Align with box
        house.add(coneLines);

        // Particles for Roof vertices
        const conePoints = new THREE.Points(coneGeometry, particleMaterial);
        conePoints.position.y = height + roofHeight / 2;
        conePoints.rotation.y = Math.PI / 4;
        house.add(conePoints);

        // Positioning
        house.position.set(x, 0, z);
        
        // Initial State for Animation (Hidden/Small)
        house.scale.set(0, 0, 0);
        house.visible = false;

        houseGroup.add(house);
        houses.push(house);
    };

    // Create Grid of Houses
    const gridSize = 5;
    const spacing = 3;
    const offset = (gridSize * spacing) / 2 - spacing / 2;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            // Add some randomness to position
            const x = (i * spacing) - offset + (Math.random() - 0.5);
            const z = (j * spacing) - offset + (Math.random() - 0.5);
            createHouse(x, z);
        }
    }

    // Cursor Interaction
    const cursor = { x: 0, y: 0 };
    window.addEventListener('mousemove', (event) => {
        cursor.x = (event.clientX / window.innerWidth) - 0.5;
        cursor.y = (event.clientY / window.innerHeight) - 0.5;
    });

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate group based on cursor
        // Target rotation
        const targetRotationY = cursor.x * Math.PI * 0.5; // +/- 45 degrees
        const targetRotationX = cursor.y * Math.PI * 0.2; // +/- 18 degrees

        // Smoothly interpolate
        houseGroup.rotation.y += (targetRotationY - houseGroup.rotation.y) * 0.05;
        houseGroup.rotation.x += (targetRotationX - houseGroup.rotation.x) * 0.05;
        
        controls.update();

        renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });


    // Shuffle houses array for random build order if desired, or keep linear
    // houses.sort(() => Math.random() - 0.5);

    const tl = gsap.timeline();

    houses.forEach((house, index) => {
        tl.to(house.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1,
            ease: "back.out(1.7)",
            onStart: () => { house.visible = true; }
        }, index * 0.1); // Stagger start times
    });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSuburbScene);
