import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import "moment/locale/fr";
import emailjs from "emailjs-com";
import { useReservations } from './ReservationsContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './ReservationsContext';

moment.locale('fr');
const localizer = momentLocalizer(moment);

function reserverArgent() {
  const navigate = useNavigate();
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
  const [paymentMethod, setPaymentMethod] = useState(""); // "stripe" ou "cash"
  
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
    { id: "cire", nom: "Elimination poils d'animaux", prix: 15 },
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
    const prixBase = 80;
    const prixOptions = selectedOptions.reduce((total, optionId) => {
      const option = optionsDisponibles.find(opt => opt.id === optionId);
      return total + (option ? option.prix : 0);
    }, 0);
    return prixBase + prixOptions;
  };

  // Paiement sur place
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

      // Enregistrer la réservation dans Firebase
      await ajouterReservation(selectedDate, selectedTime, 'Bronze');

      // Envoyer l'email de confirmation
      const templateParams = {
        from_name: `${formData.prenom} ${formData.nom}`,
        from_email: formData.email,
        phone: formData.telephone,
        date: moment(selectedDate).format('DD/MM/YYYY'),
        time: selectedTime,
        service: `Formule Bronze - 50€`,
        options: optionsTexte,
        prix_total: `${prixTotal}€`,
        payment_status: '💵 Paiement sur place'
      };

      // await emailjs.send(
      //   'service_1wryoqr',
      //   'template_x1vgr07',
      //   templateParams,
      //   'KUPBmz5lg0pubUDdW'
      // );

      // Rediriger vers une page de confirmation
      const reservationData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        date: moment(selectedDate).format('DD/MM/YYYY'),
        dateISO: selectedDate.toISOString(),
        heure: selectedTime,
        options: selectedOptions,
        optionsTexte: optionsTexte,
        formule: 'Bronze',
        prixTotal: prixTotal,
        paymentMethod: 'cash'
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
        date: moment(selectedDate).format("DD/MM/YYYY"),
        dateISO: selectedDate.toISOString(),
        heure: selectedTime,
        formule: "Bronze",
        options: selectedOptions,
        optionsTexte: optionsTexte,
        prixTotal: prixTotal,
        status: "pending",
        createdAt: new Date().toISOString(),
        paymentMethod: "stripe"
      };
  
      // 🔹 1) Sauvegarder la réservation en attente dans Firestore
      await setDoc(doc(db, "pendingReservations", pendingId), reservationData);
  
      // 🔹 2) Envoyer l’email avec EmailJS
      const templateParams = {
        from_name: `${formData.prenom} ${formData.nom}`,
        from_email: formData.email,
        phone: formData.telephone,
        date: moment(selectedDate).format("DD/MM/YYYY"),
        time: selectedTime,
        service: `Formule Bronze - 50€`,
        options: optionsTexte,
        prix_total: `${prixTotal}€`,
        payment_status: "💳 Paiement en ligne (Stripe)"
      };
  
      await emailjs.send(
        "service_1wryoqr",   
        "template_x1vgr07",  
        templateParams,
        "KUPBmz5lg0pubUDdW" 
      );
  
      console.log("📧 Email envoyé avec succès");
  
      // 🔹 3) Rediriger vers Stripe
      const paymentLinkBase = "https://buy.stripe.com/test_00wfZjdio3OJaHt4pQ1oI03";
      const successUrl = encodeURIComponent(
        `https://alaajee.github.io/MugiWash/reservation-success?payment=stripe&reservationId=${pendingId}`
      );
  
      const paymentUrl = `${paymentLinkBase}?prefilled_email=${encodeURIComponent(formData.email)}&success_url=${successUrl}`;
  
      window.location.href = paymentUrl;
  
    } catch (error) {
      console.error("Erreur:", error);
      alert(`Erreur lors du paiement: ${error.message || "Veuillez réessayer."}`);
      setLoading(false);
    }
  };
  

  const horairesDisponibles = selectedDate ? getHorairesDisponiblesForDate(selectedDate) : [];
  const reservationsJour = selectedDate ? getReservationsParDate(selectedDate) : [];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#2c5aa0", marginBottom: "2rem" }}>
        Réservation Formule Argent - 80€
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

          <form>
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

            {/* CHOIX DU MODE DE PAIEMENT */}
            <div style={{ 
              marginBottom: "2rem",
              padding: "1.5rem",
              background: "#f8f9fa",
              borderRadius: "12px",
              border: "2px solid #dee2e6"
            }}>
              <h3 style={{ color: "#2c5aa0", marginTop: 0, marginBottom: "1.5rem" }}>
                💳 Mode de paiement
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  onClick={() => setPaymentMethod("stripe")}
                  style={{
                    padding: "1.5rem",
                    border: paymentMethod === "stripe" ? "3px solid #635bff" : "2px solid #ddd",
                    background: paymentMethod === "stripe" ? "#f7f6ff" : "white",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "stripe"}
                      onChange={() => setPaymentMethod("stripe")}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                        💳 Paiement en ligne par carte
                      </div>
                      <div style={{ color: "#666", fontSize: "0.95rem" }}>
                        Paiement sécurisé via Stripe • Confirmation immédiate
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("cash")}
                  style={{
                    padding: "1.5rem",
                    border: paymentMethod === "cash" ? "3px solid #28a745" : "2px solid #ddd",
                    background: paymentMethod === "cash" ? "#f1f9f3" : "white",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                        💵 Paiement sur place
                      </div>
                      <div style={{ color: "#666", fontSize: "0.95rem" }}>
                        Espèces ou carte le jour du rendez-vous • Total : {calculerPrixTotal()}€
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOUTONS DE PAIEMENT */}
            {paymentMethod === "stripe" && (
              <button
                onClick={handleStripePayment}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "1.5rem",
                  background: loading ? "#6c757d" : "#635bff",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.3s"
                }}
              >
                {loading ? "Redirection..." : `💳 Payer ${calculerPrixTotal()}€ avec Stripe`}
              </button>
            )}

            {paymentMethod === "cash" && (
              <button
                onClick={handleCashPayment}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "1.5rem",
                  background: loading ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.3s"
                }}
              >
                {loading ? "Réservation en cours..." : `✅ Confirmer la réservation (${calculerPrixTotal()}€ sur place)`}
              </button>
            )}

            {!paymentMethod && (
              <div style={{
                width: "100%",
                padding: "1.5rem",
                background: "#e9ecef",
                color: "#6c757d",
                border: "2px dashed #adb5bd",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                textAlign: "center"
              }}>
                ⬆️ Veuillez choisir un mode de paiement
              </div>
            )}
          </form>

          <p style={{ 
            marginTop: "1rem", 
            textAlign: "center", 
            color: "#666",
            fontSize: "0.9rem"
          }}>
            🔒 Vos données sont sécurisées et ne seront pas partagées
          </p>
        </div>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Link 
          to="/MajestiCar"  
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