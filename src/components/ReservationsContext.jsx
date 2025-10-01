// ReservationsContext.jsx - Firebase UNIQUEMENT pour le calendrier
import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot
} from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXwdQyFtYD0BzJ8LLkPPnpUihrrBh7oh8",
  authDomain: "majesti-car-14d12.firebaseapp.com",
  projectId: "majesti-car-14d12",
  storageBucket: "majesti-car-14d12.firebasestorage.app",
  messagingSenderId: "488881200493",
  appId: "1:488881200493:web:115f45c7e973f4a2718e64",
  measurementId: "G-0V84E9DXJZ"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ReservationsContext = createContext();

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (!context) {
    throw new Error('useReservations doit être utilisé dans ReservationsProvider');
  }
  return context;
};

export const ReservationsProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Synchronisation en temps réel avec Firebase
  useEffect(() => {
    const q = query(collection(db, 'reservations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservationsData = [];
      snapshot.forEach((doc) => {
        reservationsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setReservations(reservationsData);
      setLoading(false);
    });

    // Nettoyage à la désinscription
    return () => unsubscribe();
  }, []);

  // Ajouter une réservation dans Firebase
  const ajouterReservation = async (date, heure, formule) => {
    try {
      const nouvelleReservation = {
        date: date.toISOString(),
        heure,
        formule,
        timestamp: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'reservations'), nouvelleReservation);
      return {
        id: docRef.id,
        ...nouvelleReservation
      };
    } catch (error) {
      console.error("Erreur Firebase:", error);
      throw error;
    }
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

  const value = {
    reservations,
    ajouterReservation,
    estDisponible,
    getReservationsParDate,
    getHorairesDisponibles,
    loading
  };

  return (
    <ReservationsContext.Provider value={value}>
      {children}
    </ReservationsContext.Provider>
  );
};

// Exporter db pour utilisation dans d'autres fichiers
export { db };
export default ReservationsContext;