import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'     // ✅ add

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />     {/* ✅ add */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
