import Matter from 'matter-js';

export const initMatter = () => {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Events = Matter.Events;

    // Find trigger/container element
    const container = document.getElementById('matter-trigger');
    
    if (!container) {
        console.warn('Matter.js: #matter-trigger element not found. Animation will not run.');
        return;
    }

    // Ensure container has relative positioning for absolute children
    container.style.position = 'relative';
    // Optional: hide overflow if you don't want them visible outside
    // container.style.overflow = 'hidden'; 

    const width = container.clientWidth;
    const height = container.clientHeight;

    console.log(`Matter.js: Container dimensions ${width}x${height}`);

    if (container.tagName === 'CANVAS') {
        console.warn('Matter.js: #matter-trigger is a <canvas> element. Child elements (boxes) will NOT be visible. Please use a <div> instead.');
    }

    // Create engine
    const engine = Engine.create();
    const world = engine.world;

    // Select elements INSIDE the container
    const boxElements = container.querySelectorAll('.matter-box');
    console.log(`Matter.js: Found ${boxElements.length} .matter-box elements inside container`);
    
    if (boxElements.length === 0) {
        console.warn('Matter.js: No .matter-box elements found inside #matter-trigger');
        return;
    }

    const bodies = [];
    
    // Pastel colors
    const colors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9'];

    // Create bodies for each element
    boxElements.forEach(el => {
        // Randomize color
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.backgroundColor = randomColor;
        el.style.zIndex = '10'; // Ensure visibility
        el.style.display = 'block'; // Force display
        el.style.opacity = '1'; // Force opacity
        el.style.visibility = 'visible'; // Force visibility

        // Randomize position
        // Start above the container top
        const startX = Math.random() * width;
        const startY = -Math.random() * 500 - 100; 
        
        // Use element dimensions if available, else default
        const elWidth = el.offsetWidth || 50;
        const elHeight = el.offsetHeight || 50;

        const body = Bodies.rectangle(startX, startY, elWidth, elHeight, {
            restitution: 0.8,
            friction: 0.5,
            density: 0.04,
            isStatic: true // Start static until triggered
        });
        
        bodies.push({ body, element: el });
        Composite.add(world, body);
    });

    // Add ground at the bottom of the container
    const ground = Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
    Composite.add(world, ground);
    
    // Add walls
    const leftWall = Bodies.rectangle(-50, height / 2, 100, height * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height * 2, { isStatic: true });
    Composite.add(world, [leftWall, rightWall]);

    // Runner creation moved to scroll trigger

    // Update loop
    Events.on(engine, 'afterUpdate', () => {
        bodies.forEach(({ body, element }) => {
            const { x, y } = body.position;
            const angle = body.angle;
            
            // Use absolute positioning relative to the container
            element.style.position = 'absolute';
            // Reset top/left to 0 so transform works from top-left origin
            element.style.top = '0';
            element.style.left = '0';
            
            // Translate to physics position
            // Matter.js bodies are centered, so offset by half width/height
            const elWidth = element.offsetWidth || 50;
            const elHeight = element.offsetHeight || 50;
            
            element.style.transform = `translate(${x - elWidth / 2}px, ${y - elHeight / 2}px) rotate(${angle}rad)`;
        });
        
        // Debug: Log first body position every 60 frames (approx 1 sec)
        if (engine.timing.timestamp % 1000 < 20 && bodies.length > 0) {
             const b = bodies[0].body;
             console.log(`Matter.js: Body 0 pos: x=${b.position.x.toFixed(0)}, y=${b.position.y.toFixed(0)}`);
        }
    });

    // Scroll Trigger
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Matter.js: Container in view, starting physics');
                
                // Create and start the runner now to ensure fresh timing
                const runner = Runner.create();
                Runner.run(runner, engine);

                // Wake up bodies
                bodies.forEach(({ body }) => {
                    Matter.Body.setStatic(body, false);
                    // Explicitly set velocity to 0 to avoid any accumulated NaN
                    Matter.Body.setVelocity(body, { x: 0, y: 0 });
                    Matter.Body.setAngularVelocity(body, 0);
                });
                // Disconnect observer after triggering
                observer.disconnect();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);

    // Handle resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        Matter.Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 50 });
        // Update ground width if needed (requires recreating or scaling, but position update helps)
        // For walls:
        Matter.Body.setPosition(rightWall, { x: newWidth + 50, y: newHeight / 2 });
    });
};
