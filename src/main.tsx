import '@fontsource/inter';
import './index.css';
import './three-scene.js'; // Import existing Three.js logic
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PixelTrailDemo } from './demo';

// Determine root element. If standard "root" doesn't exist, try to find a container or create one.
// Since this is likely for a Webflow template, we might want to target a specific request ID or class.
// For the demo purpose, we'll look for "root" or append one.

// Determine root element.
// We target 'pixel-trail-bg' as requested for Webflow integration.

const rootId = 'pixel-trail-bg';
const rootElement = document.getElementById(rootId);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PixelTrailDemo />
    </React.StrictMode>
  );
} else {
  console.warn(`Element with id "${rootId}" not found. PixelTrail will not render.`);
}
