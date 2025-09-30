import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/fr";
import emailjs from "emailjs-com";

moment.locale('fr');
const localizer = momentLocalizer(moment);

function reserverOr() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: ""
  });

  const horairesDispo = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00"
  ];

  const handleSelectSlot = (slotInfo) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (slotInfo.start >= today) {
      setSelectedDate(slotInfo.start);
      console.log("Date sélectionnée:", slotInfo.start);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedDate || !selectedTime) {
      alert("Veuillez sélectionner une date et une heure");
      return;
    }

    const { nom, prenom, email, telephone } = formData;
    if (!nom || !prenom || !email || !telephone) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Email invalide");
      return;
    }

    // Validation téléphone
    const telRegex = /^[0-9]{10}$/;
    if (!telRegex.test(telephone.replace(/\s/g, ''))) {
      alert("Numéro de téléphone invalide (10 chiffres requis)");
      return;
    }

    setLoading(true);

    // Préparer les données pour l'email
    const templateParams = {
      from_name: `${prenom} ${nom}`,
      from_email: email,
      phone: telephone,
      date: moment(selectedDate).format('DD/MM/YYYY'),
      time: selectedTime,
      service: 'Formule Bronze - 50€'
    };

    try {
      // Envoi de l'email via EmailJS
      await emailjs.send(
        'service_1wryoqr',      // À remplacer
        'template_x1vgr07',     // À remplacer
        templateParams,
        'KUPBmz5lg0pubUDdW'       // À remplacer
      );
      
      alert('Réservation confirmée ! Un email de confirmation vous a été envoyé.');
      
      // Reset du formulaire
      setFormData({ nom: "", prenom: "", email: "", telephone: "" });
      setSelectedDate(null);
      setSelectedTime("");
      setShowForm(false);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#2c5aa0", marginBottom: "2rem" }}>
        Réservation Formule Bronze - 50€
      </h1>

      {/* CALENDRIER */}
      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ color: "#2c5aa0" }}>Étape 1 : Sélectionnez une date</h2>
        
        <div style={{ height: "600px", marginTop: "1rem" }}>
          <Calendar
            localizer={localizer}
            events={[]}
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
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
            gap: "1rem",
            marginTop: "1.5rem"
          }}>
            {horairesDispo.map((heure) => (
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
                {heure}
              </button>
            ))}
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

            <button
              type="submit"
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
              {loading ? "Envoi en cours..." : "Confirmer la réservation"}
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

export default reserverOr;