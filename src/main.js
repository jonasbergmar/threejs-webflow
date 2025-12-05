import './styles/style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
    
gsap.registerPlugin(ScrollTrigger);

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
    const gridHelper = new THREE.GridHelper(50, 50, 0xC3AEEA, 0xE1D6F5);
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
        const width = 1 + Math.random() * 0.5;
        const height = 1 + Math.random() * 1;
        const depth = 1 + Math.random() * 0.5;
        
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

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Subtle rotation of the entire group
        houseGroup.rotation.y += 0.001;
        
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

    // ScrollTrigger Animation
    // Sort houses by distance from center or just random/linear for the "building after each other" effect
    // Let's do a simple stagger based on their index
    
    // We want the animation to happen while scrolling through the container
    // But usually, for a "scene" like this, we might want to pin the container
    
    ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom top", // Scroll distance to complete the animation
        scrub: 1,
        onUpdate: (self) => {
            // Optional: Rotate camera or group based on scroll progress
            houseGroup.rotation.y = self.progress * Math.PI * 0.5;
        }
    });

    // Animate houses in
    // We can't use a simple stagger with scrub directly on the timeline easily if we want complex "building" effect
    // But we can map the progress to the houses array
    
    const totalHouses = houses.length;
    
    // Create a timeline linked to the same ScrollTrigger
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom top",
            scrub: 1,
        }
    });

    // Shuffle houses array for random build order if desired, or keep linear
    // houses.sort(() => Math.random() - 0.5);

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
