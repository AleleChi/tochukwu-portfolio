import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Defensive Engineering: Global fallback for invalid JSON responses (e.g., HTML pages from server/proxy reboots)
const originalJson = Response.prototype.json;
Response.prototype.json = async function () {
  try {
    return await originalJson.call(this);
  } catch (err) {
    console.warn("[DEFENSIVE] Intercepted non-JSON response body. Returning fallback structure:", err);
    return { success: false, error: "The server returned an invalid response. Please try again." };
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
