import '@fontsource/inter';
import './index.css';
import './three-scene.js'; // Import existing Three.js logic
import './threejs-torus.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PixelTrailDemo } from './demo';

// Determine root element. If standard "root" doesn't exist, try to find a container or create one.
// Since this is likely for a Webflow template, we might want to target a specific request ID or class.
// For the demo purpose, we'll look for "root" or append one.

// Determine root element.
// We target 'threejs-bg' as requested for Webflow integration.
// Ensure your Webflow project has a div with id="threejs-bg".

const rootId = 'threejs-bg';
const rootElement = document.getElementById(rootId);

if (rootElement) {
  console.log('React App attempting to mount into #threejs-bg');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PixelTrailDemo />
    </React.StrictMode>
  );
} else {
  console.warn(`Element with id "${rootId}" not found. React app will not render. Ensure you have a div with id="${rootId}" in your HTML.`);
}
