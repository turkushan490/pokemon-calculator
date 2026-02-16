import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

console.log('🚀 Renderer script loaded!');

const container = document.getElementById('root');
console.log('📦 Container element:', container);

if (container) {
  console.log('✅ Creating React root...');
  const root = createRoot(container);
  console.log('✅ Rendering App...');
  root.render(<App />);
  console.log('✅ App rendered!');
} else {
  console.error('❌ Root container not found!');
}
