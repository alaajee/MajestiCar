import { useState, useEffect } from 'react'
import image1 from './assets/im.jpg'
import image2 from './assets/logo1.jpeg'
import { Link } from 'react-router-dom';
import ProfessionalServices from './components/ProfessionalServices';
import {useRef} from 'react';
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  const servicesRef = useRef(null);
  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
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
          <img src={image2} alt="Logo MugiWash" className="menu-logo" />

          <a href="/MugiWash" className="menu-item">Home</a>
          <a href="#" className="menu-item">A propos</a>
          <a href="#" className="menu-item">Services</a>
          <a href="#" className="menu-item">Contact</a>
          <a href="#" className="menu-item">MugiWash</a>
       
         
          <Link to="/reserver" className="Reserver-button">
              Réserver
          </Link>

        </div>
      </header>
      <div className="Photo">
        <img src={image1} alt="A beautiful scenery" />
        <div className="image-slogan">
          Votre voiture, notre soin, partout avec MugiWash.
        </div>

        <div className="Mes_services">
          <button onClick={scrollToServices} className='Button_services'>
            Voir nos services
          </button>
        </div> 

      </div>
      
      
      <div className="A_propos">
      <h2>À propos de MugiWash</h2>
      <p>
        Avec Mugiwash, plus besoin de vous déplacer pour redonner éclat et propreté à votre véhicule.
        Notre station de lavage automobile mobile, entièrement autonome en électricité, se déplace directement chez vous ou sur votre lieu de travail.
        Équipés de tout le matériel nécessaire installé dans notre Kangoo utilitaire, nous vous proposons un service complet de nettoyage, du toit jusqu'aux roues, sans que vous ayez à bouger votre voiture.
        <ul>
          <li>✅ <strong>Service à domicile ou sur site</strong> – gain de temps garanti</li>
          <li>✅ <strong>Autonomie totale</strong> – pas besoin de branchement, nous apportons tout</li>
          <li>✅ <strong>Nettoyage complet</strong> – intérieur, extérieur, toit, jantes, détails</li>
          <li>✅ <strong>Respect du véhicule et de l'environnement</strong> – produits adaptés et efficaces</li>
        </ul>
        Que ce soit pour un entretien régulier ou un nettoyage en profondeur, Mugiwash vous apporte la qualité d’une station de lavage professionnelle, avec la praticité d’un service mobile.
        👉 Réservez dès maintenant votre lavage mobile Mugiwash et profitez d’un véhicule propre sans contrainte 
      </p>
      
     
     </div>
          
      <ProfessionalServices />
     
      <h1 className='Diff_services' ref={servicesRef}>Nos differents services</h1>
      <div className="services" id='Diff_services'>
          
            <div class="service bronze">
                <h3>Formule Bronze</h3>
                <div class="price">50€</div>
                <ul class="features">
                    <li>Aspiration complète de l'habitacle</li>
                    <li>Décontamination vapeur tapis/moquettes/coffre</li>
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

        <div className="contact-section">
          <h2>Contactez-nous</h2>
          <form className="contact-form">
            <input type="text" placeholder="Votre nom" required />
            <input type="email" placeholder="Votre email" required />
            <textarea placeholder="Votre message" required></textarea>
            <button type="submit">Envoyer</button>
          </form>
        </div>
        
      <footer className="App-footer">
        <p>&copy; 2024 MugiWash. Tous droits réservés.</p>
        <div className="social-links">
          <a href="#" className="social-link">Facebook</a>
          <a href="#" className="social-link">Twitter</a>
          <a href="#" className="social-link">Instagram</a>
        </div>
      </footer>
    </div>
  )
}

export default App