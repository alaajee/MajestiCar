import { useState, useEffect } from 'react'
import image1 from './assets/im.jpg'
import image2 from './assets/logov2.jpg'
import { Link } from 'react-router-dom';
import ProfessionalServices from './components/ProfessionalServices';
import {useRef} from 'react';
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  const servicesRef = useRef(null); 
  const AproposRef = useRef(null);
  const contactRef = useRef(null);
  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToApropos = () => {
    AproposRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
  useEffect(() => {
    const cards = document.querySelectorAll(".mw-card");
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add("visible"), 150 * i); // effet stagger
    });
  }, []);

  
  return (
    <div className="App">
      <div className="top-banner">
        <div className="slogan">✨ Bienvenue sur notre site ! Découvrez nos services exceptionnels ✨</div>
      </div>
      <header className="App-header">
        <div className="menu-container">
          <img src={image2} alt="Logo MajestiCar" className="menu-logo" />
          
          <a href="/MajestiCar" className="menu-item">Home</a>
          <a onClick={scrollToApropos} className="menu-item">A propos</a>
          <a onClick={scrollToServices} className="menu-item">Services</a>
          <a onClick={scrollToContact} className="menu-item">Contact</a>
  
       
         
          <button onClick={scrollToServices} className='Reserver-button'>
              Réserver
          </button>

        </div>
      </header>
      <div className="Photo">
        <img src={image1} alt="A beautiful scenery" />
        <div className="image-slogan">
          Votre voiture, notre soin, partout avec Majesti'Car.
        </div>

        <div className="Mes_services">
          <button onClick={scrollToServices} className='Button_services'>
            Voir nos services
          </button>
        </div> 

      </div>
      
      
      <div className="A_propos" ref={AproposRef}>
      <h2>À propos de Majesti’Car</h2>
      <p>
        Bienvenue chez Majesti’Car, votre partenaire du nettoyage automobile premium 💎.
        Nous avons conçu un utilitaire transformé en station de lavage mobile 🔋💧, 100% autonome en électricité et en eau, pour vous offrir un service rapide, pratique et haut de gamme. <br/>

        📍 Où vous voulez, quand vous voulez :<br />
        - À domicile 🏡<br />
        - Sur votre lieu de travail 🏢<br />
        - Ou à l’adresse de votre choix 📌<br /><br />

        ✅ Nos services :<br />
        - Nettoyage extérieur 🚿🚗<br />
        - Nettoyage intérieur 🧽🪣<br />
        - Finitions soignées pour un rendu comme neuf ✨<br /><br />

        Avec Majesti’Car, plus besoin de vous déplacer : 👉 Nous venons à vous et nous redonnons tout son éclat à votre véhicule.<br /><br />

        Confort, qualité et exigence sont au cœur de notre savoir-faire 💯.
      </p>
    </div>

          
      <ProfessionalServices />
     
      <h1 className='Diff_services' ref={servicesRef}>Nos differents services</h1>
      <div className="services" id='Diff_services'>
          
            <div class="service bronze">
                <h3>Formule Bronze</h3>
                <div class="price">40€</div>
                <ul class="features">
                    <li>Aspiration complète de l'habitacle</li>
                    <li>Nettoyage des vitres et pare-brise</li>
                    <li>Traitement des plastiques/tableau de bord</li>
                    <li>Parfum</li>
                </ul>
                <div class="option">
                    <h4>Shampouineuse en option :</h4>
                    <p>10€ par siège / 40€ pour les 5 sièges
                    <em>(avec les tapis et moquettes)</em></p>
                </div>
                <Link to="/reserver-bronze" className="select-button">
                  Choisir cette formule
                </Link>
            </div>

            <div class="service argent">
                <h3>Formule Argent</h3>
                <div class="price">80€</div>
                <ul class="features">
                    <li>Aspiration complète de l'habitacle</li>
                    <li>Décontamination vapeur sièges/tapis/moquettes/coffre</li>
                    <li>Nettoyage des vitres et pare-brise</li>
                    <li>Traitement des plastiques/tableau de bord</li>
                    <li>Nettoyage des seuils de portes</li>
                    <li>Dégraissage de la trappe à carburant</li>
                    <li>Parfum</li>
                </ul>
                <div class="option">
                    <h4>Shampouineuse en option :</h4>
                    <p>5€ par siège / 20€ pour les 5 sièges
                    <em>(avec les tapis et moquettes)</em></p>
                </div>

                <Link to="/reserver-argent" className="select-button">
                  Choisir cette formule
                </Link>
            </div>

            <div class="service or">
                <h3>Formule Or</h3>
                <div class="price">120€</div>
                <ul class="features">
                    <li>Aspiration complète de l'habitacle</li>
                    <li>Décontamination vapeur sièges/tapis/moquettes/coffre</li>
                    <li>Shampouineuse sièges/tapis/moquettes/coffre <strong>(INCLUSE)</strong></li>
                    <li>Nettoyage des vitres et pare-brise</li>
                    <li>Traitement des plastiques/tableau de bord</li>
                    <li>Nettoyage des seuils de portes</li>
                    <li>Dégraissage de la trappe à carburant</li>
                    <li>Parfum</li>
                    <li>Décontamination de l'habitacle et traitement du système d'aération</li>
                </ul>
                <Link to="/reserver-or" className="select-button">
                  Choisir cette formule
                </Link>
            </div>
        </div>
        <footer className="footer-section">
        <div className="footer-container">
          {/* Section Contact */}
          <div className="footer-contact">
            <h2>Contactez-nous</h2>
            <p>
              <strong>Téléphone :</strong> <a href="tel:+212612345678" className="footer-phone">+212 6 12 34 56 78</a>
            </p>
            <p>
              <strong>Email :</strong> <a href="mailto:alaejennine33@gmail.com" className="footer-email">alaejennine33@gmail.com</a>
            </p>
          </div>

          {/* Ligne verticale */}
          <div className="footer-divider"></div>

          {/* Section Réseaux sociaux */}
          <div className="footer-social">
            <h2>Suivez-nous</h2>
            <div className="social-links">
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Instagram</a>
            </div>
          </div>

          {/* Ligne verticale */}
          <div className="footer-divider"></div>

          {/* Section Informations */}
          <div className="footer-info">
            <h2>À propos</h2>
            <p>Majesti'Car est une plateforme moderne dédiée au lavage intelligent et écologique.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Majesti'Car. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

export default App