import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// TEMP: sanity logs (remove later)
console.log('[boot] starting app');
console.log('[env] api?', !!import.meta.env.VITE_FIREBASE_API_KEY, 'mode:', import.meta.env.MODE);
