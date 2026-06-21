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

// Global Fetch Interceptor to route Vercel frontend requests to Render backend
const originalFetch = window.fetch;
const API_URL = (import.meta as any).env?.VITE_API_URL || "https://tochukwu-portfolio-vwa2.onrender.com";

const customFetch = function (input: RequestInfo | URL, init?: RequestInit) {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof Request) {
    url = input.url;
  } else if (input && typeof input === 'object' && 'href' in input) {
    url = (input as any).href;
  }
  
  if (url.startsWith('/api/') || url === '/api' || url.startsWith('api/')) {
    const isLocalDev = window.location.hostname === "localhost" || 
                       window.location.hostname === "127.0.0.1" || 
                       window.location.hostname.includes(".run.app") || 
                       window.location.hostname.includes("ais-");
    
    if (!isLocalDev) {
      const apiBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const relativePart = url.startsWith('/') ? url : `/${url}`;
      const newUrl = `${apiBase}${relativePart}`;
      
      if (typeof input === 'string') {
        const fetchInit: RequestInit = {
          ...init,
          credentials: init?.credentials || 'include',
        };
        return originalFetch(newUrl, fetchInit);
      } else {
        const newRequest = new Request(newUrl, input as Request);
        return originalFetch(newRequest, init);
      }
    }
  }
  return originalFetch(input, init);
};

// Apply customFetch using Object.defineProperty to bypass read-only Window properties
try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    writable: true,
    enumerable: true
  });
} catch (err) {
  console.warn("[DEFENSIVE] Failed to defineProperty fetch on window", err);
  try {
    (window as any).fetch = customFetch;
  } catch (err2) {
    console.warn("[DEFENSIVE] Direct assignment of fetch on window failed", err2);
  }
}

try {
  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  }
} catch (err) {
  console.warn("[DEFENSIVE] Failed to defineProperty fetch on globalThis", err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
