import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HeroBG: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Append rendering canvas to the container
    container.appendChild(renderer.domElement);

    // --- Shader Material ---
    // The "Glyph Dither" effect: 
    // We use screen space or UV coordinates to draw vertical lines.
    // We create a "lighting" value based on normal dot lightDir.
    // Segments of the lines are discarded or thinned based on this lighting value.

    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      uniform float uTime;
      uniform vec3 uColor;

      void main() {
        // Simple directional light from top-right
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float light = max(dot(vNormal, lightDir), 0.0);
        
        // Add some ambient light
        light = light * 0.8 + 0.2;

        // Create vertical lines pattern
        // Using gl_FragCoord.x ensures lines are fixed to screen space (like a CRT/overlay)
        // Or determine lines based on UVs for "texture" stickiness?
        // The reference looks like the lines follow the object form roughly, but actually
        // the straight vertical nature suggests a screen-space or projected texture.
        // Let's try UV based first for better 3D feel, then switch to FragCoord if needed.
        
        // Let's try a high frequency sine wave on UV.x
        float lines = sin(vUv.x * 200.0); // 200 lines across U
        
        // Thresholding to create the "cut" effect (dithering)
        // We compare the line pattern against the light intensity.
        // If light is low, we need thicker gaps.
        
        // Quantize light for that "glyph" step feel
        float qLight = floor(light * 5.0) / 5.0;
        
        // A modulation pattern. 
        // We want the lines to be visible where there is light.
        // And maybe broken segments.
        
        float pattern = step(0.5, sin(vUv.x * 200.0) * sin(vUv.y * 10.0 + qLight * 10.0)); 
        
        // Let's go for a cleaner "vertical scanlines modulated by light" approach
        // 1. Vertical bars
        float bar = step(0.5, sin(gl_FragCoord.x * 0.2)); 
        
        // 2. Modulate height/length of bars based on light? 
        // Actually the reference image shows consistent vertical lines, 
        // but their *width* or *presence* seems determined by the shape.
        
        // Better Strategy:
        // Use standard "Hatching" shader logic.
        
        float frequency = 100.0;
        float width = 0.5; // Base line width
        
        // Modify width by light intensity
        // Light 1.0 -> Width 0.8 (Thick lines)
        // Light 0.0 -> Width 0.0 (No lines)
        float activeWidth = light * 0.8;
        
        // Generate stripes based on UV or Screen X. Reference implies Screen X (perfectly vertical).
        float stripe = step(1.0 - activeWidth, fract(gl_FragCoord.x * 0.3));
        
        // Color
        vec3 finalColor = uColor * stripe;
        
        // Alpha - fully clear if no stripe
        if (finalColor.r < 0.1) discard;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ff4d4d') } // Reddish color from reference
      },
      side: THREE.DoubleSide,
      transparent: true
    });

    // --- Geometry: Torus ---
    const geometry = new THREE.TorusGeometry(1, 0.4, 32, 100);
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      if (material.uniforms && material.uniforms.uTime) {
          material.uniforms.uTime.value = elapsedTime;
      }
      
      // Rotate Torus
      torus.rotation.x = elapsedTime * 0.2;
      torus.rotation.y = elapsedTime * 0.3;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    // --- Resize Handler ---
    const handleResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      
      if (container && renderer.domElement instanceof Node) {
        container.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full -z-10 bg-[#1a1a1a]"
      aria-hidden="true"
    />
  );
};

export default HeroBG;
