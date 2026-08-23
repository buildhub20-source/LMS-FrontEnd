import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../styles/globals.css';

// Apply saved theme immediately to avoid flash of wrong theme
const savedTheme = localStorage.getItem('lms-theme') || 'dark';
document.documentElement.classList.add(savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
