// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom' // HashRouter au lieu de BrowserRouter
import App from './App.jsx'
import Reserver from './components/Reserver.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter> {/* Changement ici */}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reserver" element={<Reserver />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)