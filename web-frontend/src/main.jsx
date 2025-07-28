import L from "leaflet";
import "leaflet-routing-machine";
import 'leaflet/dist/leaflet.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
import App from './App.jsx';
import './index.css';

// Make L globally available
window.L = L;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <App />
      <ToastContainer
        position="bottom-right" // Position of the toast
        autoClose={1000} // Auto close after 5 seconds
        hideProgressBar={false} // Show progress bar
        newestOnTop={false} // Show newest toast at the top
        closeOnClick // Close on click
        rtl={false} // Right-to-left support
        pauseOnFocusLoss // Pause when the window loses focus
        draggable // Allow dragging to dismiss
        pauseOnHover // Pause on hover
        theme="colored" // Colored theme
      />
    </>
  </StrictMode>
);
