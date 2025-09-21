import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Reserver from './components/Reserver.jsx' // Créez ce fichier
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reserver" element={<Reserver />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)