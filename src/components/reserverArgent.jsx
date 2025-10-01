import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/fr";
import emailjs from "emailjs-com";
import { useReservations } from './ReservationsContext';
import { loadStripe } from '@stripe/stripe-js';

moment.locale('fr');
const localizer = momentLocalizer(moment);

// ⚠️ Remplacez par votre clé publique Stripe
const stripePromise = loadStripe('pk_test_VOTRE_CLE_PUBLIQUE_STRIPE');

function reserverArgent() {
  const { 
    reservations, 
    ajouterReservation, 
    getHorairesDisponibles,
    getReservationsParDate 
  } = useReservations();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // "stripe" ou "surplace"
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: ""
  });

  const [selectedOptions, setSelectedOptions] = useState([]);

  const optionsDisponibles = [
    { id: "interieur", nom: "Shampouineuses siège, tapis et moquettes", prix: 25 },
    { id: "jantes", nom: "Lavage extérieur avec shampoing", prix: 20 },
    { id: "polish", nom: "Lavage moteur", prix: 15 },
    { id: "cire", nom: "Elimination poils d’animaux", prix: 15 },
    { id: "vitres", nom: "Véhicules très sale (ex: vomis..)", prix: 15 },
  ];

  const getHorairesDisponiblesForDate = (date) => {
    if (!date) return [];
    return getHorairesDisponibles(date);
  };

  const events = reservations.map(resa => ({
    title: `${resa.heure} - ${resa.formule}`,
    start: new Date(resa.date),
    end: new Date(resa.date),
    allDay: true
  }));

  const handleSelectSlot = (slotInfo) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (slotInfo.start >= today) {
      setSelectedDate(slotInfo.start);
      setSelectedTime("");
      setShowForm(false);
      setPaymentMethod("");
    } else {
      alert("Vous ne pouvez pas réserver dans le passé");
    }
  };

  const handleNavigate = (date) => {
    setCurrentDate(date);
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
    const prixBase = 50;
    const prixOptions = selectedOptions.reduce((total, optionId) => {
      const option = optionsDisponibles.find(opt => opt.id === optionId);
      return total + (option ? option.prix : 0);
    }, 0);
    return prixBase + prixOptions;
  };

  // 💳 Fonction de paiement Stripe
  const handleStripePayment = async () => {
    try {
      const stripe = await stripePromise;
      
      // Appel à votre backend pour créer une session Stripe Checkout
      const response = await fetch('https://votre-backend.com/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculerPrixTotal() * 100, // Stripe utilise les centimes
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          date: moment(selectedDate).format('DD/MM/YYYY'),
          time: selectedTime,
          formule: 'Argent',
          options: selectedOptions
        }),
      });

      const session = await response.json();

      // Redirection vers Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Erreur Stripe:', error);
      alert('Erreur lors du paiement : ' + error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!selectedDate || !selectedTime) {
      alert("Veuillez sélectionner une date et une heure");
      return;
    }

    if (!paymentMethod) {
      alert("Veuillez choisir un mode de paiement");
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
      const optionsTexte = selectedOptions.length > 0
        ? selectedOptions.map(optionId => {
            const option = optionsDisponibles.find(opt => opt.id === optionId);
            return `${option.nom} (+${option.prix}€)`;
          }).join(', ')
        : 'Aucune option supplémentaire';

      // SI PAIEMENT PAR CARTE
      if (paymentMethod === "stripe") {
        // 1️⃣ Bloquer le créneau dans Firebase
        await ajouterReservation(selectedDate, selectedTime, 'Argent');
        
        // 2️⃣ Rediriger vers Stripe (l'email sera envoyé après paiement réussi)
        await handleStripePayment();
        return; // Arrêter ici, Stripe gère la suite
      }

      // SI PAIEMENT SUR PLACE
      if (paymentMethod === "surplace") {
        // 1️⃣ Bloquer le créneau dans Firebase
        await ajouterReservation(selectedDate, selectedTime, 'Argent');
        
        // 2️⃣ Envoyer l'email de confirmation
        const templateParams = {
          from_name: `${formData.prenom} ${formData.nom}`,
          from_email: formData.email,
          phone: formData.telephone,
          date: moment(selectedDate).format('DD/MM/YYYY'),
          time: selectedTime,
          service: 'Formule Argent - 50€',
          options: optionsTexte,
          prix_total: `${calculerPrixTotal()}€`,
          payment_method: 'Paiement sur place'
        };
    
        await emailjs.send(
          'service_1wryoqr',
          'template_x1vgr07',
          templateParams,
          'KUPBmz5lg0pubUDdW'
        );
        
        alert('✅ Réservation confirmée ! Paiement à effectuer sur place.\nUn email de confirmation vous a été envoyé.');
        
        // Reset
        setFormData({ nom: "", prenom: "", email: "", telephone: "" });
        setSelectedDate(null);
        setSelectedTime("");
        setShowForm(false);
        setSelectedOptions([]);
        setPaymentMethod("");
      }
      
    } catch (error) {
      console.error('Erreur complète:', error);
      alert(`Erreur lors de la réservation: ${error.message || 'Veuillez réessayer.'}`);
    } finally {
      setLoading(false);
    }
  };

  const horairesDisponibles = selectedDate ? getHorairesDisponiblesForDate(selectedDate) : [];
  const reservationsJour = selectedDate ? getReservationsParDate(selectedDate) : [];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#2c5aa0", marginBottom: "2rem" }}>
        Réservation Formule Argent - 50€
      </h1>

      {/* CALENDRIER */}
      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ color: "#2c5aa0" }}>Étape 1 : Sélectionnez une date</h2>
        
        <div style={{ height: "600px", marginTop: "1rem" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            onSelectSlot={handleSelectSlot}
            onNavigate={handleNavigate}
            date={currentDate}
            selectable
            views={['month']}
            defaultView="month"
            messages={{
              next: "Suivant",
              previous: "Précédent",
              today: "Aujourd'hui",
              month: "Mois"
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: '#2c5aa0',
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
              }
            })}
          />
        </div>
      </div>

      {/* SELECTION HEURE */}
      {selectedDate && (
        <div style={{ 
          marginTop: "2rem", 
          padding: "2rem", 
          background: "#f9f9f9", 
          borderRadius: "12px" 
        }}>
          <h2 style={{ color: "#2c5aa0" }}>Étape 2 : Choisissez une heure</h2>
          <p style={{ marginBottom: "1rem", color: "#555", fontSize: "1.1rem" }}>
            📅 Date sélectionnée : <strong>{moment(selectedDate).format("dddd DD MMMM YYYY")}</strong>
          </p>

          {reservationsJour.length > 0 && (
            <div style={{ 
              marginBottom: "1rem", 
              padding: "1rem", 
              background: "#fff3cd", 
              borderRadius: "8px",
              border: "1px solid #ffc107"
            }}>
              <strong>⚠️ Créneaux déjà réservés ce jour :</strong>
              <div style={{ marginTop: "0.5rem" }}>
                {reservationsJour.map(resa => (
                  <span key={resa.id} style={{ 
                    display: "inline-block",
                    margin: "0.25rem",
                    padding: "0.5rem",
                    background: "#dc3545",
                    color: "white",
                    borderRadius: "5px",
                    fontSize: "0.9rem"
                  }}>
                    {resa.heure} ({resa.formule})
                  </span>
                ))}
              </div>
            </div>
          )}

          {horairesDisponibles.length === 0 ? (
            <div style={{ 
              padding: "2rem", 
              textAlign: "center", 
              background: "#f8d7da",
              color: "#721c24",
              borderRadius: "8px",
              fontSize: "1.1rem"
            }}>
              ❌ Tous les créneaux sont réservés pour cette date. Veuillez choisir un autre jour.
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
              gap: "1rem",
              marginTop: "1.5rem"
            }}>
              {horairesDisponibles.map((heure) => (
                <button
                  key={heure}
                  onClick={() => handleTimeSelect(heure)}
                  style={{
                    padding: "1rem",
                    border: selectedTime === heure ? "2px solid #2c5aa0" : "1px solid #ddd",
                    background: selectedTime === heure ? "#2c5aa0" : "white",
                    color: selectedTime === heure ? "white" : "#333",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  {heure} ✓
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OPTIONS SUPPLEMENTAIRES */}
      {showForm && selectedTime && (
        <div style={{ 
          marginTop: "2rem", 
          padding: "2rem", 
          background: "#fff8e1", 
          borderRadius: "12px",
          border: "2px solid #ffc107"
        }}>
          <h2 style={{ color: "#2c5aa0", marginBottom: "1rem" }}>
            Options supplémentaires
          </h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Améliorez votre prestation avec nos options premium
          </p>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "1rem"
          }}>
            {optionsDisponibles.map((option) => (
              <div
                key={option.id}
                onClick={() => toggleOption(option.id)}
                style={{
                  padding: "1rem",
                  border: selectedOptions.includes(option.id) 
                    ? "2px solid #2c5aa0" 
                    : "1px solid #ddd",
                  background: selectedOptions.includes(option.id) 
                    ? "#e3f2fd" 
                    : "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => {}}
                    style={{ marginRight: "0.5rem", cursor: "pointer" }}
                  />
                  <strong>{option.nom}</strong>
                </div>
                <span style={{ 
                  color: "#2c5aa0", 
                  fontWeight: "bold",
                  fontSize: "1.1rem"
                }}>
                  +{option.prix}€
                </span>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: "1.5rem", 
            padding: "1rem", 
            background: "#2c5aa0",
            color: "white",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "1.3rem",
            fontWeight: "bold"
          }}>
            Prix total : {calculerPrixTotal()}€
          </div>
        </div>
      )}

      {/* FORMULAIRE */}
      {showForm && selectedTime && (
        <div style={{ 
          marginTop: "2rem", 
          padding: "2rem", 
          background: "white", 
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#2c5aa0", marginBottom: "1.5rem" }}>
            Étape 3 : Vos informations
          </h2>

          <div style={{ 
            padding: "1rem", 
            background: "#e3f2fd", 
            borderRadius: "8px",
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            <strong>Récapitulatif :</strong> {moment(selectedDate).format("DD/MM/YYYY")} à {selectedTime}
            {selectedOptions.length > 0 && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>
                Options : {selectedOptions.map(optionId => {
                  const option = optionsDisponibles.find(opt => opt.id === optionId);
                  return option.nom;
                }).join(', ')}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "1rem",
              marginBottom: "1rem"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
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
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
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
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
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
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
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
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem"
                }}
              />
            </div>

            {/* MODE DE PAIEMENT */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "#2c5aa0", marginBottom: "1rem" }}>
                💳 Mode de paiement *
              </h3>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "1rem" 
              }}>
                {/* OPTION CARTE BANCAIRE */}
                <div
                  onClick={() => setPaymentMethod("stripe")}
                  style={{
                    padding: "1.5rem",
                    border: paymentMethod === "stripe" 
                      ? "3px solid #635bff" 
                      : "2px solid #ddd",
                    background: paymentMethod === "stripe" 
                      ? "#f6f9fc" 
                      : "white",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💳</div>
                  <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                    Carte bancaire
                  </strong>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    Paiement sécurisé par Stripe
                  </span>
                </div>

                {/* OPTION SUR PLACE */}
                <div
                  onClick={() => setPaymentMethod("surplace")}
                  style={{
                    padding: "1.5rem",
                    border: paymentMethod === "surplace" 
                      ? "3px solid #28a745" 
                      : "2px solid #ddd",
                    background: paymentMethod === "surplace" 
                      ? "#f0fdf4" 
                      : "white",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏪</div>
                  <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                    Sur place
                  </strong>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    Paiement lors du rendez-vous
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !paymentMethod}
              style={{
                width: "100%",
                padding: "1.5rem",
                background: loading || !paymentMethod 
                  ? "#6c757d" 
                  : paymentMethod === "stripe" 
                    ? "#635bff" 
                    : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                cursor: loading || !paymentMethod ? "not-allowed" : "pointer",
                transition: "background 0.3s"
              }}
            >
              {loading 
                ? "Traitement en cours..." 
                : paymentMethod === "stripe"
                  ? `💳 Payer ${calculerPrixTotal()}€ par carte`
                  : paymentMethod === "surplace"
                    ? `Confirmer la réservation - ${calculerPrixTotal()}€`
                    : "Choisissez un mode de paiement"}
            </button>
          </form>
        </div>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Link 
          to="/MugiWash" 
          style={{
            padding: "1rem 2rem",
            background: "#6c757d",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            display: "inline-block"
          }}
        >
          ← Retour
        </Link>
      </div>
    </div>
  );
}

export default reserverArgent;