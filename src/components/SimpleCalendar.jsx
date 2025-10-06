import React, { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const SimpleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHeure, setSelectedHeure] = useState(null);
  const [selectedFormule, setSelectedFormule] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Mock data - remplacer par useReservations() dans votre app
  const reservations = [];
  
  const horairesDisponibles = ["08:00", "11:00", "14:00", "17:00", "19:00"];
  const formules = [
    { id: 'lavage', nom: 'Lavage Simple', prix: '15€' },
    { id: 'complet', nom: 'Lavage Complet', prix: '30€' },
    { id: 'premium', nom: 'Premium Detailing', prix: '50€' }
  ];

  // Vérifier si un créneau est disponible
  const estDisponible = (date, heure) => {
    const dateStr = date.toDateString();
    return !reservations.some(resa => {
      const resaDateStr = new Date(resa.date).toDateString();
      return resaDateStr === dateStr && resa.heure === heure;
    });
  };

  // Navigation mois
  const changerMois = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedHeure(null);
    setSelectedFormule(null);
  };

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours vides avant le début du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (date) => {
    if (!isPastDate(date)) {
      setSelectedDate(date);
      setSelectedHeure(null);
      setSelectedFormule(null);
    }
  };

  const handleReservation = () => {
    if (selectedDate && selectedHeure && selectedFormule) {
      // Ici, appeler ajouterReservation du contexte
      console.log('Réservation:', { selectedDate, selectedHeure, selectedFormule });
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedDate(null);
        setSelectedHeure(null);
        setSelectedFormule(null);
      }, 3000);
    }
  };

  const days = getDaysInMonth();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">Réservation</h1>
          </div>
          <p className="text-gray-600 text-sm">Choisissez votre créneau</p>
        </div>

        {/* Navigation mois */}
        <div className="bg-white border-2 border-blue-600 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changerMois(-1)}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors"
            >
              <ChevronLeft className="text-blue-600" size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => changerMois(1)}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors"
            >
              <ChevronRight className="text-blue-600" size={24} />
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const isTodayDate = isToday(date);
              const isPast = isPastDate(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  disabled={isPast}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all
                    ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-800'}
                    ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-105' : ''}
                    ${!isSelected && !isPast ? 'hover:bg-blue-50 hover:border-2 hover:border-blue-300' : ''}
                    ${isTodayDate && !isSelected ? 'border-2 border-blue-400' : 'border border-gray-200'}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sélection horaire */}
        {selectedDate && (
          <div className="bg-white border-2 border-blue-600 rounded-lg p-4 mb-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Horaires disponibles</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {horairesDisponibles.map(heure => {
                const dispo = estDisponible(selectedDate, heure);
                const isSelected = selectedHeure === heure;
                
                return (
                  <button
                    key={heure}
                    onClick={() => dispo && setSelectedHeure(heure)}
                    disabled={!dispo}
                    className={`
                      py-3 px-4 rounded-lg font-medium transition-all
                      ${!dispo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                      ${isSelected ? 'bg-blue-600 text-white shadow-lg' : ''}
                      ${dispo && !isSelected ? 'bg-white border-2 border-blue-400 text-blue-600 hover:bg-blue-50' : ''}
                    `}
                  >
                    {heure}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sélection formule */}
        {selectedDate && selectedHeure && (
          <div className="bg-white border-2 border-blue-600 rounded-lg p-4 mb-4 animate-in fade-in duration-300">
            <h3 className="font-semibold text-gray-800 mb-3">Choisissez votre formule</h3>
            <div className="space-y-2">
              {formules.map(formule => {
                const isSelected = selectedFormule === formule.id;
                
                return (
                  <button
                    key={formule.id}
                    onClick={() => setSelectedFormule(formule.id)}
                    className={`
                      w-full p-4 rounded-lg transition-all text-left
                      ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-blue-400 text-gray-800 hover:bg-blue-50'}
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{formule.nom}</span>
                      <span className="font-bold">{formule.prix}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bouton de confirmation */}
        {selectedDate && selectedHeure && selectedFormule && (
          <button
            onClick={handleReservation}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors animate-in fade-in duration-300"
          >
            Confirmer la réservation
          </button>
        )}

        {/* Message de confirmation */}
        {showConfirmation && (
          <div className="fixed top-4 left-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-in fade-in duration-300">
            <p className="font-semibold text-center">✓ Réservation confirmée !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleCalendar;