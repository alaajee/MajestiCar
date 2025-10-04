// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Reserver from './components/Reserver.jsx'
import ReserverBronze from './components/reserverBronze.jsx'
import ReserverArgent from './components/reserverArgent.jsx'
import ReserverOr from './components/reserverOr.jsx'
import { ReservationsProvider } from './components/ReservationsContext.jsx'
import ReservationSuccess from './components/ReservationSuccess';
import PaymentConfirmation from './components/PaymentConfirmation.jsx';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReservationsProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/reserver" element={<Reserver />} />
          <Route path="/reserver-bronze" element={<ReserverBronze />} />
          <Route path="/reserver-argent" element={<ReserverArgent />} />
          <Route path="/reserver-or" element={<ReserverOr />} />
          <Route path="/reservation-success" element={<ReservationSuccess />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        </Routes>
      </HashRouter>
    </ReservationsProvider>
  </React.StrictMode>,
)