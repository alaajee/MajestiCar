import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/fr";
import emailjs from "emailjs-com";


moment.locale('fr');
const localizer = momentLocalizer(moment);

function reserverArgent() {
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

  // NOUVELLES OPTIONS
  const [selectedOptions, setSelectedOptions] = useState([]);

  const optionsDisponibles = [
    { id: "interieur", nom: "Nettoyage intérieur complet", prix: 15 },
    { id: "jantes", nom: "Nettoyage jantes premium", prix: 10 },
    { id: "polish", nom: "Polish carrosserie", prix: 25 },
    { id: "cire", nom: "Application cire protectrice", prix: 20 },
    { id: "vitres", nom: "Traitement vitres hydrophobe", prix: 12 },
    { id: "moteur", nom: "Nettoyage moteur", prix: 18 }
  ];

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

  // GESTION DES OPTIONS
  const toggleOption = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  // CALCUL DU PRIX TOTAL
  const calculerPrixTotal = () => {
    const prixBase = 50;
    const prixOptions = selectedOptions.reduce((total, optionId) => {
      const option = optionsDisponibles.find(opt => opt.id === optionId);
      return total + (option ? option.prix : 0);
    }, 0);
    return prixBase + prixOptions;
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

    // Préparer la liste des options sélectionnées
    const optionsTexte = selectedOptions.length > 0
      ? selectedOptions.map(optionId => {
          const option = optionsDisponibles.find(opt => opt.id === optionId);
          return `${option.nom} (+${option.prix}€)`;
        }).join(', ')
      : 'Aucune option';

    // Préparer les données pour l'email
    const templateParams = {
      from_name: `${prenom} ${nom}`,
      from_email: email,
      phone: telephone,
      date: moment(selectedDate).format('DD/MM/YYYY'),
      time: selectedTime,
      service: 'Formule Bronze - 50€',
      options: optionsTexte,
      prix_total: `${calculerPrixTotal()}€`
    };

    try {
      // Envoi de l'email via EmailJS
      await emailjs.send(
        'service_1wryoqr',
        'template_x1vgr07',
        templateParams,
        'KUPBmz5lg0pubUDdW'
      );
      
      alert('Réservation confirmée ! Un email de confirmation vous a été envoyé.');
      
      // Reset du formulaire
      setFormData({ nom: "", prenom: "", email: "", telephone: "" });
      setSelectedDate(null);
      setSelectedTime("");
      setShowForm(false);
      setSelectedOptions([]);
      
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
              {loading ? "Envoi en cours..." : `Confirmer la réservation - ${calculerPrixTotal()}€`}
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