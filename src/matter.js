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

    // Create bodies for each element
    boxElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Matter.js bodies are positioned at their center
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        const body = Bodies.rectangle(x, y, rect.width, rect.height, {
            restitution: 0.8,
            friction: 0.5,
            density: 0.04
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
            
            // Update DOM element
            // We need to offset by width/height/2 because DOM elements are usually positioned top-left (unless transformed),
            // but here we are likely just applying transform to their initial static position?
            // Actually, if we set position: absolute on them, we can just move them.
            // Or we can use translate.
            // Let's assume they are in the flow initially, so we need to calculate delta or set them to absolute.
            // A common approach is to set them to absolute position initially or just use transform from 0,0.
            // However, getBoundingClientRect gives viewport coordinates.
            // So if we set `position: fixed` or `absolute` relative to body, we can just use x/y.
            
            // Let's try setting transform. 
            // Since the body x/y is the center, and we want to place the element center there.
            // But CSS transform origin is usually center.
            // If the element is statically positioned in the DOM, applying transform(x, y) adds to that.
            // That's messy.
            // Better strategy:
            // 1. Get initial rect.
            // 2. Set element to position: fixed (or absolute to body) at top:0, left:0.
            // 3. Apply transform translate(x - width/2, y - height/2) rotate(angle).
            
            element.style.position = 'fixed';
            element.style.top = '0';
            element.style.left = '0';
            element.style.transform = `translate(${x - element.offsetWidth / 2}px, ${y - element.offsetHeight / 2}px) rotate(${angle}rad)`;
        });
    });

    // Handle resize
    window.addEventListener('resize', () => {
        // Update ground and walls
        Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
        // We might need to resize ground width too, but Body.setVertices is complex. 
        // For now, let's just make ground very wide initially or recreate it.
        // Recreating is easier but might glitch.
        // Let's just make it huge initially.
    });
};
