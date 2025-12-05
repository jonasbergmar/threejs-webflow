import Matter from 'matter-js';

export const initMatter = () => {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Events = Matter.Events;

    // Create engine
    const engine = Engine.create();
    const world = engine.world;

    // Select elements
    const boxElements = document.querySelectorAll('.matter-box');
    const bodies = [];
    
    // Pastel colors
    const colors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9'];

    // Create bodies for each element
    boxElements.forEach(el => {
        // Randomize color
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.backgroundColor = randomColor;

        // Randomize position
        // Start above the viewport
        const startX = Math.random() * window.innerWidth;
        const startY = -Math.random() * 500 - 100; // Random height above viewport
        
        const width = 50; // Fixed size for now as per CSS, or get from rect if we want variable
        const height = 50;

        const body = Bodies.rectangle(startX, startY, width, height, {
            restitution: 0.8,
            friction: 0.5,
            density: 0.04,
            isStatic: true // Start static until triggered
        });
        
        bodies.push({ body, element: el });
        Composite.add(world, body);
    });

    // Add ground
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
    Composite.add(world, ground);
    
    // Add walls
    const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
    Composite.add(world, [leftWall, rightWall]);

    // Create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Update loop
    Events.on(engine, 'afterUpdate', () => {
        bodies.forEach(({ body, element }) => {
            const { x, y } = body.position;
            const angle = body.angle;
            
            element.style.position = 'fixed';
            element.style.top = '0';
            element.style.left = '0';
            element.style.transform = `translate(${x - 50 / 2}px, ${y - 50 / 2}px) rotate(${angle}rad)`;
        });
    });

    // Scroll Trigger
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Wake up bodies
                bodies.forEach(({ body }) => {
                    Matter.Body.setStatic(body, false);
                });
                // Disconnect observer after triggering
                observer.disconnect();
            }
        });
    }, { threshold: 0.1 });

    // Observe a trigger element. We'll look for #matter-trigger
    const trigger = document.getElementById('matter-trigger');
    if (trigger) {
        observer.observe(trigger);
    } else {
        // Fallback: if no trigger, just start immediately (or maybe wait for body?)
        console.warn('No #matter-trigger found, starting physics immediately');
        bodies.forEach(({ body }) => {
             Matter.Body.setStatic(body, false);
        });
    }

    // Handle resize
    window.addEventListener('resize', () => {
        Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
        Matter.Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
    });
};
