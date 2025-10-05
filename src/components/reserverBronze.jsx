import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import "moment/locale/fr";
import { useReservations } from './ReservationsContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './ReservationsContext';

moment.locale('fr');
const localizer = momentLocalizer(moment);

function reserverBronze() {
  
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

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  
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

  // const events = reservations.map(resa => ({
  //   title: `${resa.heure} - ${resa.formule}`,
  //   start: new Date(resa.date),
  //   end: new Date(resa.date),
  //   allDay: true
  // }));

  // Fonction pour gérer le clic sur une date (mobile-friendly)
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

  // Nouvelle fonction pour le clic direct sur un événement de date
  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);
    
    if (clickedDate >= today) {
      setSelectedDate(date);
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
  
      // 1. Enregistrer dans Firebase
      await ajouterReservation(selectedDate, selectedTime, 'Bronze');
  
      // 2. ENVOI EMAIL - C'ÉTAIT MANQUANT !
      const templateParams = {
        from_name: `${formData.prenom} ${formData.nom}`,
        from_email: formData.email,
        phone: formData.telephone,
        date: moment(selectedDate).format("DD/MM/YYYY"),
        time: selectedTime,
        service: `Formule Bronze - 50€`,
        options: optionsTexte,
        prix_total: `${prixTotal}€`,
        payment_status: "💵 Paiement sur place"
      };
  
     
  
      // 3. Redirection vers la page de succès
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
  
      // Créer un ID unique pour cette réservation
      const pendingId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
      // Enregistrer dans Firebase (collection "pendingReservations")
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
        paymentMethod: "stripe",  // ✅ STRIPE, pas cash !
        createdAt: new Date().toISOString()
      };
  
      await setDoc(doc(db, "pendingReservations", pendingId), reservationData);
      console.log("✅ Réservation pending créée:", pendingId);
  
      // SAUVEGARDER l'ID dans sessionStorage AVANT la redirection
      sessionStorage.setItem('stripe_pending_reservation', pendingId);
      sessionStorage.setItem('stripe_pending_email', formData.email);
      console.log("💾 ID sauvegardé dans sessionStorage:", pendingId);
  
      // Lien de paiement Stripe
      const paymentLinkBase = "https://buy.stripe.com/test_eVq00ldio4SNaHt3lM1oI02";
      
      // URL de redirection (sans paramètres dynamiques, juste payment=stripe)
      const paymentUrl = `${paymentLinkBase}?prefilled_email=${encodeURIComponent(formData.email)}`;
      
      console.log("🔗 Redirection vers Stripe");
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
      <style>{`
        .rbc-calendar {
          transition: all 0.3s ease;
        }
        .rbc-day-bg {
          transition: background-color 0.2s ease;
          cursor: pointer;
        }
        .rbc-day-bg:hover {
          background-color: #f0f7ff !important;
        }
        .rbc-selected {
          background-color: #2c5aa0 !important;
        }
        .rbc-today {
          background-color: #e3f2fd;
        }
        .rbc-off-range-bg {
          background-color: #fafafa;
        }
        .rbc-date-cell {
          padding: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .rbc-date-cell:hover {
          transform: scale(1.05);
        }
        .rbc-button-link {
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .rbc-button-link:hover {
          color: #2c5aa0;
        }
        .rbc-active {
          background-color: #2c5aa0 !important;
          color: white !important;
          box-shadow: 0 2px 8px rgba(44, 90, 160, 0.3);
        }
        .rbc-toolbar button {
          transition: all 0.2s ease;
          border-radius: 6px;
        }
        .rbc-toolbar button:hover {
          background-color: #2c5aa0;
          color: white;
          transform: translateY(-1px);
        }
        
        /* Mobile: rendre les dates plus cliquables */
        @media (max-width: 768px) {
          .rbc-date-cell {
            padding: 12px 8px;
            min-height: 50px;
          }
          .rbc-button-link {
            padding: 8px;
            display: block;
          }
        }
      `}</style>

      <h1 style={{ textAlign: "center", color: "#2c5aa0", marginBottom: "2rem" }}>
        Réservation Formule Bronze - 50€
      </h1>

      {/* ÉTAPE 1 : OPTIONS SUPPLÉMENTAIRES */}
      <div style={{ 
        marginTop: "2rem", 
        padding: "2rem", 
        background: "#fff8e1", 
        borderRadius: "12px",
        border: "2px solid #ffc107"
      }}>
        <h2 style={{ color: "#2c5aa0", marginBottom: "1rem" }}>
          Étape 1 : Options supplémentaires (facultatif)
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
                alignItems: "center",
                transform: selectedOptions.includes(option.id) ? "scale(1.02)" : "scale(1)"
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

      {/* ÉTAPE 2 : CALENDRIER */}
      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ color: "#2c5aa0" }}>Étape 2 : Sélectionnez une date</h2>
        
        <div style={{ 
          height: "600px", 
          marginTop: "1rem",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <Calendar
            localizer={localizer}
            events={[]}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={(event) => handleDateClick(event.start)}
            onNavigate={handleNavigate}
            onDrillDown={handleDateClick}
            date={currentDate}
            selectable
            views={['month']}
            defaultView="month"
            longPressThreshold={10}
            messages={{
              next: "Suivant",
              previous: "Précédent",
              today: "Aujourd'hui",
              month: "Mois"
            }}
            dayPropGetter={(date) => {
              const dateString = moment(date).format('YYYY-MM-DD');
              const selectedDateString = selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : null;
              
              if (dateString === selectedDateString) {
                return {
                  className: 'rbc-selected',
                  style: {
                    backgroundColor: '#2c5aa0',
                    color: 'white'
                  }
                };
              }
              return {};
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

      {/* ÉTAPE 3 : SELECTION HEURE */}
      {selectedDate && (
        <div style={{ 
          marginTop: "2rem", 
          padding: "2rem", 
          background: "#f9f9f9", 
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#2c5aa0" }}>Étape 3 : Choisissez une heure</h2>
          <p style={{ marginBottom: "1rem", color: "#555", fontSize: "1.1rem" }}>
            Date sélectionnée : <strong>{moment(selectedDate).format("dddd DD MMMM YYYY")}</strong>
          </p>

        
             
          

          {horairesDisponibles.length === 0 ? (
            <div style={{ 
              padding: "2rem", 
              textAlign: "center", 
              background: "#f8d7da",
              color: "#721c24",
              borderRadius: "8px",
              fontSize: "1.1rem"
            }}>
              Tous les créneaux sont réservés pour cette date. Veuillez choisir un autre jour.
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
                    transition: "all 0.3s",
                    transform: selectedTime === heure ? "scale(1.05)" : "scale(1)"
                  }}
                >
                  {heure}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORMULAIRE - identique au code précédent... */}
      {showForm && selectedTime && (
        <div style={{ 
          marginTop: "2rem", 
          padding: "2rem", 
          background: "white", 
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#2c5aa0", marginBottom: "1.5rem" }}>
                     Étape 4 : Vos informations
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
                             fontSize: "1rem",
                             transition: "border 0.3s"
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
                             fontSize: "1rem",
                             transition: "border 0.3s"
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
                           fontSize: "1rem",
                           transition: "border 0.3s"
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
                           fontSize: "1rem",
                           transition: "border 0.3s"
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
                             transition: "all 0.3s",
                             transform: paymentMethod === "stripe" ? "scale(1.02)" : "scale(1)"
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
                             transition: "all 0.3s",
                             transform: paymentMethod === "cash" ? "scale(1.02)" : "scale(1)"
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
                           transition: "all 0.3s",
                           transform: loading ? "scale(1)" : "scale(1)",
                         }}
                         onMouseOver={(e) => !loading && (e.target.style.transform = "scale(1.02)")}
                         onMouseOut={(e) => !loading && (e.target.style.transform = "scale(1)")}
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
                           transition: "all 0.3s"
                         }}
                         onMouseOver={(e) => !loading && (e.target.style.transform = "scale(1.02)")}
                         onMouseOut={(e) => !loading && (e.target.style.transform = "scale(1)")}
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
          to="/" 
          style={{
            padding: "1rem 2rem",
            background: "#6c757d",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            display: "inline-block"
          }}
        >
          Retour
        </Link>
      </div>
    </div>
  );
}

export default reserverBronze;