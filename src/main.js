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

        // Helper to add a building block
        const addBlock = (w, h, d, px, py, pz) => {
            const geometry = new THREE.BoxGeometry(w, h, d);
            
            const edges = new THREE.EdgesGeometry(geometry);
            const lines = new THREE.LineSegments(edges, wireframeMaterial);
            lines.position.set(px, py + h / 2, pz);
            house.add(lines);

            const points = new THREE.Points(geometry, particleMaterial);
            points.position.set(px, py + h / 2, pz);
            house.add(points);
            
            return { w, h, d, px, py, pz };
        };

        // Helper to add a roof
        const addRoof = (w, d, py, pz, type = 'pyramid') => {
            let geometry;
            let roofHeight = 0.5 + Math.random() * 0.5;
            
            if (type === 'gable') {
                // Gable roof using Cylinder (prism)
                // Radius should be enough to cover width/depth
                // We'll use a 3-sided cylinder
                // This is a bit tricky to align perfectly with a box without custom geometry,
                // but let's try a simple Cone (pyramid) or a rotated Box for flat.
                // Actually, let's stick to Cone for now but vary parameters, 
                // or use a helper for Gable if we can make a prism.
                // Let's try a simple approach: 
                // 50% chance of Pyramid, 50% chance of "Flat" (just a top border) or taller pyramid.
                
                // Let's implement a simple Gable using a Cone with 4 radial segments but rotated 45 deg? 
                // No, Cone with 4 segments is a pyramid.
                // A prism is Cylinder with 3 segments.
                geometry = new THREE.CylinderGeometry(0, Math.max(w, d) * 0.6, roofHeight, 4, 1);
                // Rotate to align?
            } else {
                // Pyramid
                geometry = new THREE.ConeGeometry(Math.max(w, d) * 0.7, roofHeight, 4);
            }

            const edges = new THREE.EdgesGeometry(geometry);
            const lines = new THREE.LineSegments(edges, wireframeMaterial);
            lines.position.set(0, py + roofHeight / 2, pz);
            lines.rotation.y = Math.PI / 4;
            house.add(lines);

            const points = new THREE.Points(geometry, particleMaterial);
            points.position.set(0, py + roofHeight / 2, pz);
            points.rotation.y = Math.PI / 4;
            house.add(points);
        };

        // Main Block
        const mainWidth = 1 + Math.random() * 1.5;
        const mainHeight = 1 + Math.random() * 1.5;
        const mainDepth = 1 + Math.random() * 1.5;
        
        addBlock(mainWidth, mainHeight, mainDepth, 0, 0, 0);

        // Chance for L-Shape (add a side wing)
        if (Math.random() > 0.5) {
            const wingWidth = 0.8 + Math.random() * 0.5;
            const wingHeight = mainHeight * (0.5 + Math.random() * 0.3); // Lower than main
            const wingDepth = 0.8 + Math.random() * 0.5;
            
            // Position wing attached to main
            // E.g., shift x by (mainWidth/2 + wingWidth/2)
            const offsetX = (mainWidth / 2 + wingWidth / 2) - 0.1; // Slight overlap
            // Randomly place left or right, or front/back
            // Let's just do +X for simplicity
            
            addBlock(wingWidth, wingHeight, wingDepth, offsetX, 0, (mainDepth - wingDepth)/2);
            
            // Maybe add a small roof to the wing?
            // addRoof(wingWidth, wingDepth, wingHeight, (mainDepth - wingDepth)/2, 'pyramid');
        }

        // Add Main Roof
        // Simple variety: Pyramid vs Taller Pyramid
        addRoof(mainWidth, mainDepth, mainHeight, 0, Math.random() > 0.5 ? 'pyramid' : 'gable');

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
document.addEventListener('DOMContentLoaded', () => {
    initSuburbScene();
});
