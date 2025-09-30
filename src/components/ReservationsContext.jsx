// reservationsContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const ReservationsContext = createContext();

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (!context) {
    throw new Error('useReservations doit être utilisé dans ReservationsProvider');
  }
  return context;
};

export const ReservationsProvider = ({ children }) => {
  // Charger les réservations depuis le stockage en mémoire
  const [reservations, setReservations] = useState([]);

  // Ajouter une réservation
  const ajouterReservation = (date, heure, formule) => {
    const nouvelleReservation = {
      id: Date.now(),
      date: date.toISOString(),
      heure,
      formule,
      timestamp: new Date().toISOString()
    };
    
    setReservations(prev => [...prev, nouvelleReservation]);
    return nouvelleReservation;
  };

  // Vérifier si un créneau est disponible
  const estDisponible = (date, heure) => {
    const dateStr = new Date(date).toDateString();
    return !reservations.some(resa => {
      const resaDateStr = new Date(resa.date).toDateString();
      return resaDateStr === dateStr && resa.heure === heure;
    });
  };

  // Obtenir toutes les réservations pour une date
  const getReservationsParDate = (date) => {
    const dateStr = new Date(date).toDateString();
    return reservations.filter(resa => {
      const resaDateStr = new Date(resa.date).toDateString();
      return resaDateStr === dateStr;
    });
  };

  // Obtenir les horaires disponibles pour une date
  const getHorairesDisponibles = (date) => {
    const tousLesHoraires = [
      "09:00", "10:00", "11:00", "12:00",
      "14:00", "15:00", "16:00", "17:00"
    ];
    
    return tousLesHoraires.filter(heure => estDisponible(date, heure));
  };

  // Supprimer une réservation (optionnel - pour admin)
  const supprimerReservation = (id) => {
    setReservations(prev => prev.filter(resa => resa.id !== id));
  };

  const value = {
    reservations,
    ajouterReservation,
    estDisponible,
    getReservationsParDate,
    getHorairesDisponibles,
    supprimerReservation
  };

  return (
    <ReservationsContext.Provider value={value}>
      {children}
    </ReservationsContext.Provider>
  );
};

export default ReservationsContext;