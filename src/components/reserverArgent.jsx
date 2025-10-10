import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import "moment/locale/fr";
import { useReservations } from './ReservationsContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './ReservationsContext';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

moment.locale('fr');

function reserverArgent() {
  const navigate = useNavigate();
  const { 
    reservations, 
    ajouterReservation, 
    getHorairesDisponibles,
    getReservationsParDate 
  } = useReservations();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: ""
  });

  const [selectedOptions, setSelectedOptions] = useState([]);

  const optionsDisponibles = [
    { id: "interieur", nom: "🧽 Shampouineuse tapis & moquettes", prix: 15 },
    { id: "jantes", nom: "🐾 Élimination poils d’animaux", prix: 15 },
    { id: "polish", nom: "🚗 Lavage extérieur", prix: 20 },
    { id: "cire", nom: "⚙️ Lavage moteur", prix: 15 },
    { id: "vitres", nom: "🛞 Lavage jantes", prix: 10 },
    { id: "trappe", nom: "⛽ Dégraissage trappe à carburant", prix: 10 },
  ];


  // Navigation mois
  const changerMois = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
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
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
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
      setSelectedTime("");
      setShowForm(false);
      setPaymentMethod("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTimeSelect = (heure) => {
    setSelectedTime(heure);
    setShowForm(true);
  };

  const toggleOption = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const calculerPrixTotal = () => {
    const prixBase = 90;
    const prixOptions = selectedOptions.reduce((total, optionId) => {
      const option = optionsDisponibles.find(opt => opt.id === optionId);
      return total + (option ? option.prix : 0);
    }, 0);
    return prixBase + prixOptions;
  };

  const handleCashPayment = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      alert("Veuillez sélectionner une date et une heure");
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Veuillez entrer un email valide");
      return;
    }
  
    const phoneRegex = /^[0-9\s+()-]{10,}$/;
    if (!phoneRegex.test(formData.telephone)) {
      alert("Veuillez entrer un numéro de téléphone valide");
      return;
    }
  
    setLoading(true);
  
    try {
      const prixTotal = calculerPrixTotal();
      
      const optionsTexte = selectedOptions.length > 0
        ? selectedOptions.map(optionId => {
            const option = optionsDisponibles.find(opt => opt.id === optionId);
            return `${option.nom} (+${option.prix}€)`;
          }).join(', ')
        : 'Aucune option supplémentaire';
  
      await ajouterReservation(selectedDate, selectedTime, 'Bronze');
      const reservationData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,  
        date: moment(selectedDate).format("DD/MM/YYYY"),
        dateISO: selectedDate.toISOString(),
        heure: selectedTime,
        formule: "Bronze",
        options: selectedOptions,
        optionsTexte: optionsTexte,
        prixTotal: prixTotal,
        status: "pending",
        paymentMethod: "stripe",
        createdAt: new Date().toISOString()
      };
  
      navigate(`/reservation-success?data=${encodeURIComponent(JSON.stringify(reservationData))}&payment=cash`);
  
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur lors de la réservation: ${error.message || 'Veuillez réessayer.'}`);
      setLoading(false);
    }
  };

  const handleStripePayment = async (e) => {
    e.preventDefault();
  
    if (!selectedDate || !selectedTime) {
      alert("Veuillez sélectionner une date et une heure");
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Veuillez entrer un email valide");
      return;
    }
  
    const phoneRegex = /^[0-9\s+()-]{10,}$/;
    if (!phoneRegex.test(formData.telephone)) {
      alert("Veuillez entrer un numéro de téléphone valide");
      return;
    }
  
    setLoading(true);
  
    try {
      const prixTotal = calculerPrixTotal();
  
      const optionsTexte = selectedOptions.length > 0
        ? selectedOptions.map(optionId => {
            const option = optionsDisponibles.find(opt => opt.id === optionId);
            return `${option.nom} (+${option.prix}€)`;
          }).join(", ")
        : "Aucune option supplémentaire";
  
      const pendingId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
      const reservationData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,  // ✅ AJOUTÉ ICI
        date: moment(selectedDate).format("DD/MM/YYYY"),
        dateISO: selectedDate.toISOString(),
        heure: selectedTime,
        formule: "Bronze",
        options: selectedOptions,
        optionsTexte: optionsTexte,
        prixTotal: prixTotal,
        status: "pending",
        paymentMethod: "stripe",
        createdAt: new Date().toISOString()
      };
  
      await setDoc(doc(db, "pendingReservations", pendingId), reservationData);
  
      sessionStorage.setItem('stripe_pending_reservation', pendingId);
      sessionStorage.setItem('stripe_pending_email', formData.email);
  
      const paymentLinkBase = "https://buy.stripe.com/test_6oU5kFdiofxrdTF3lM1oI05";
      const paymentUrl = `${paymentLinkBase}?prefilled_email=${encodeURIComponent(formData.email)}`;
      
      window.location.href = paymentUrl;
  
    } catch (error) {
      console.error("Erreur:", error);
      alert(`Erreur lors du paiement: ${error.message || "Veuillez réessayer."}`);
      setLoading(false);
    }
  };
  
  const horairesDisponibles = selectedDate ? getHorairesDisponibles(selectedDate) : [];
  const days = getDaysInMonth();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div style={{ 
      padding: "1rem", 
      maxWidth: "600px", 
      margin: "0 auto",
      minHeight: "100vh",
      backgroundColor: "white"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ 
          color: "#2c5aa0", 
          fontSize: "1.5rem",
          marginBottom: "0.5rem"
        }}>
          Réservation Formule Argent
        </h1>
        <p style={{ 
          color: "#666",
          fontSize: "1.2rem",
          fontWeight: "bold"
        }}>
          90€
        </p>
      </div>

      {/* ÉTAPE 1 : OPTIONS */}
      <div style={{ 
        marginBottom: "1.5rem", 
        padding: "1rem", 
        background: "white", 
        borderRadius: "12px",
        border: "2px solid #2c5aa0"
      }}>
        <h2 style={{ 
          color: "#2c5aa0", 
          marginBottom: "1rem",
          fontSize: "1.2rem"
        }}>
          Étape 1 : Options supplémentaires
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {optionsDisponibles.map((option) => (
            <div
              key={option.id}
              onClick={() => toggleOption(option.id)}
              style={{
                padding: "0.75rem",
                border: selectedOptions.includes(option.id) 
                  ? "2px solid #2c5aa0" 
                  : "1px solid #ddd",
                background: selectedOptions.includes(option.id) 
                  ? "#e3f2fd" 
                  : "white",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "0.9rem" }}>
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => {}}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {option.nom}
                </div>
                <span style={{ 
                  color: "#2c5aa0", 
                  fontWeight: "bold"
                }}>
                  +{option.prix}€
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          marginTop: "1rem", 
          padding: "0.75rem", 
          background: "#2c5aa0",
          color: "white",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "1.1rem",
          fontWeight: "bold"
        }}>
          Prix total : {calculerPrixTotal()}€
        </div>
      </div>

      {/* ÉTAPE 2 : CALENDRIER */}
      <div style={{ 
        marginBottom: "1.5rem",
        background: "white",
        border: "2px solid #2c5aa0",
        borderRadius: "12px",
        padding: "1rem"
      }}>
        <h2 style={{ 
          color: "#2c5aa0",
          marginBottom: "1rem",
          fontSize: "1.2rem"
        }}>
          Étape 2 : Choisissez une date
        </h2>

        {/* Navigation mois */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "1rem"
        }}>
          <button
            onClick={() => changerMois(-1)}
            style={{
              padding: "0.5rem",
              background: "white",
              border: "2px solid #2c5aa0",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ChevronLeft style={{ color: "#2c5aa0" }} size={24} />
          </button>
          
          <h3 style={{ 
            margin: 0,
            color: "#2c5aa0",
            fontSize: "1.1rem",
            fontWeight: "bold"
          }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => changerMois(1)}
            style={{
              padding: "0.5rem",
              background: "white",
              border: "2px solid #2c5aa0",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ChevronRight style={{ color: "#2c5aa0" }} size={24} />
          </button>
        </div>

        {/* Jours semaine */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          gap: "0.25rem",
          marginBottom: "0.5rem"
        }}>
          {dayNames.map(day => (
            <div key={day} style={{ 
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#666",
              padding: "0.5rem 0"
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Grille jours */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(7, 1fr)", 
          gap: "0.25rem"
        }}>
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} />;
            }

            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isTodayDate = isToday(date);
            const isPast = isPastDate(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                disabled={isPast}
                style={{
                  aspectRatio: "1",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  border: isSelected 
                    ? "2px solid #2c5aa0"
                    : isTodayDate 
                    ? "2px solid #2c5aa0"
                    : "1px solid #e0e0e0",
                  background: isSelected 
                    ? "#2c5aa0" 
                    : isPast 
                    ? "#f5f5f5"
                    : "white",
                  color: isSelected 
                    ? "white" 
                    : isPast 
                    ? "#ccc"
                    : "#333",
                  cursor: isPast ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* ÉTAPE 3 : HORAIRES */}
      {selectedDate && (
        <div style={{ 
          marginBottom: "1.5rem",
          padding: "1rem",
          background: "white",
          border: "2px solid #2c5aa0",
          borderRadius: "12px"
        }}>
          <h2 style={{ 
            color: "#2c5aa0",
            marginBottom: "0.5rem",
            fontSize: "1.2rem"
          }}>
            Étape 3 : Choisissez une heure
          </h2>
          <p style={{ 
            marginBottom: "1rem",
            color: "#666",
            fontSize: "0.9rem"
          }}>
            {moment(selectedDate).format("dddd DD MMMM YYYY")}
          </p>

          {horairesDisponibles.length === 0 ? (
            <div style={{ 
              padding: "1rem",
              textAlign: "center",
              background: "#ffe0e0",
              color: "#c00",
              borderRadius: "8px",
              fontSize: "0.9rem"
            }}>
              Tous les créneaux sont réservés
            </div>
          ) : (
            <div style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.75rem"
            }}>
              {horairesDisponibles.map((heure) => (
                <button
                  key={heure}
                  onClick={() => handleTimeSelect(heure)}
                  style={{
                    padding: "0.75rem",
                    border: selectedTime === heure 
                      ? "2px solid #2c5aa0"
                      : "2px solid #e0e0e0",
                    background: selectedTime === heure 
                      ? "#2c5aa0"
                      : "white",
                    color: selectedTime === heure 
                      ? "white"
                      : "#333",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {heure}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ÉTAPE 4 : FORMULAIRE */}
      {showForm && selectedTime && (
        <div style={{ 
          marginBottom: "1.5rem",
          padding: "1rem",
          background: "white",
          border: "2px solid #2c5aa0",
          borderRadius: "12px"
        }}>
          <h2 style={{ 
            color: "#2c5aa0",
            marginBottom: "1rem",
            fontSize: "1.2rem"
          }}>
            Étape 4 : Vos informations
          </h2>

          <div style={{ 
            padding: "0.75rem",
            background: "#e3f2fd",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            <strong>Récapitulatif :</strong><br/>
            {moment(selectedDate).format("DD/MM/YYYY")} à {selectedTime}
            {selectedOptions.length > 0 && (
              <div style={{ marginTop: "0.25rem" }}>
                Options : {selectedOptions.map(optionId => {
                  const option = optionsDisponibles.find(opt => opt.id === optionId);
                  return option.nom;
                }).join(', ')}
              </div>
            )}
          </div>

          <form>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ 
                display: "block",
                marginBottom: "0.25rem",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}>
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ 
                display: "block",
                marginBottom: "0.25rem",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}>
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ 
                display: "block",
                marginBottom: "0.25rem",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ 
                display: "block",
                marginBottom: "0.25rem",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}>
                Téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="06 12 34 56 78"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }}
              />
            </div>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ 
                display: "block",
                marginBottom: "0.25rem",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}>
                Adresse 
                </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                placeholder="9 xx Rue Exemple, 38000 Grenoble"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }}
              />
            </div>
            {/* MODE PAIEMENT */}
            <div style={{ 
              marginBottom: "1rem",
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
              border: "2px solid #e0e0e0"
            }}>
              <h3 style={{ 
                margin: "0 0 0.75rem 0",
                fontSize: "1rem",
                color: "#2c5aa0"
              }}>
                💳 Mode de paiement
              </h3>
              
              <div
                onClick={() => setPaymentMethod("stripe")}
                style={{
                  padding: "0.75rem",
                  border: paymentMethod === "stripe" 
                    ? "2px solid #635bff"
                    : "2px solid #ddd",
                  background: paymentMethod === "stripe" 
                    ? "#f7f6ff"
                    : "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "0.75rem",
                  fontSize: "0.9rem"
                }}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "stripe"}
                  onChange={() => {}}
                  style={{ marginRight: "0.5rem" }}
                />
                <strong>💳 Carte bancaire</strong>
                <div style={{ fontSize: "0.8rem", color: "#666", marginLeft: "1.5rem" }}>
                  Paiement sécurisé Stripe
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod("cash")}
                style={{
                  padding: "0.75rem",
                  border: paymentMethod === "cash" 
                    ? "2px solid #28a745"
                    : "2px solid #ddd",
                  background: paymentMethod === "cash" 
                    ? "#f1f9f3"
                    : "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "cash"}
                  onChange={() => {}}
                  style={{ marginRight: "0.5rem" }}
                />
                <strong>💵 Sur place</strong>
                <div style={{ fontSize: "0.8rem", color: "#666", marginLeft: "1.5rem" }}>
                  Total : {calculerPrixTotal()}€
                </div>
              </div>
            </div>

            {/* BOUTONS */}
            {paymentMethod === "stripe" && (
            <>
              <div style={{
                padding: "0.75rem",
                background: "#fff3cd",
                border: "2px solid #ffc107",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                color: "#856404"
              }}>
                ⚠️ <strong>Important :</strong> Sur la page de paiement Stripe, vous devrez resélectionner vos options supplémentaires pour payer le montant total.
              </div>
              
              <button
                onClick={handleStripePayment}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: loading ? "#6c757d" : "#635bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Redirection..." : `💳 Payer ${calculerPrixTotal()}€`}
              </button>
            </>
          )}
                      {paymentMethod === "cash" && (
              <button
                onClick={handleCashPayment}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: loading ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Réservation..." : `✅ Confirmer (${calculerPrixTotal()}€)`}
              </button>
            )}

            {!paymentMethod && (
              <div style={{
                width: "100%",
                padding: "1rem",
                background: "#e9ecef",
                color: "#6c757d",
                border: "2px dashed #adb5bd",
                borderRadius: "8px",
                fontSize: "0.9rem",
                textAlign: "center"
              }}>
                ⬆️ Choisissez un mode de paiement
              </div>
            )}
          </form>
        </div>
      )}

      {/* BOUTON RETOUR */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link 
          to="/" 
          style={{
            padding: "0.75rem 1.5rem",
            background: "#6c757d",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            display: "inline-block",
            fontSize: "0.9rem"
          }}
        >
          ← Retour
        </Link>
      </div>
    </div>
  );
}

export default reserverArgent;