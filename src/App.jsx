import { useState, useEffect } from 'react'
import image1 from './assets/im.jpg'
import image2 from './assets/logov2.jpg'
import picture1 from './assets/picture1.jpeg'
import picture2 from './assets/picture2.jpeg'
import picture3 from './assets/picture3.jpeg'
import picture4 from './assets/picture4.jpeg'
import video1 from './assets/vid1.mp4'
import video2 from './assets/vid2.mp4'
import video3 from './assets/vid3.mp4'
import video4 from './assets/vid4.mp4'
import { Link } from 'react-router-dom';
import ProfessionalServices from './components/ProfessionalServices';
import {useRef} from 'react';
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const carouselImages = [
    picture1,
    picture2,
    picture3,
    picture4,
  ];

  const carouselVideos = [
    video1,
    video2,
    video3,
    video4
  ];
  const allMedia = [
    ...carouselImages.map(src => ({ type: 'image', src })),
    ...carouselVideos.map(src => ({ type: 'video', src }))
  ];

  // Fonction pour passer à l'image suivante
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Fonction pour passer à l'image précédente
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const cards = document.querySelectorAll(".mw-card");
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add("visible"), 150 * i);
    });

    // Auto-play du carrousel
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="App">
      <div className="top-banner">
        <div className="slogan">✨ Bienvenue sur notre site ! Découvrez nos services exceptionnels ✨</div>
      </div>
      <header className="App-header">
        <div className="menu-container">
          <img src={image2} alt="Logo" className="menu-logo" />
          
          {/* Bouton hamburger */}
          <div 
            className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          {/* Items du menu */}
          <div className={`menu-items-wrapper ${isMenuOpen ? 'open' : ''}`}>
            <a href="/MajestiCar" className="menu-item">Home</a>
            <a onClick={scrollToApropos} className="menu-item">A propos</a>
            <a onClick={scrollToServices} className="menu-item">Services</a>
            <a onClick={scrollToContact} className="menu-item">Contact</a>
            <button onClick={scrollToServices} className='Reserver-button'>
              Réserver
            </button>
          </div>
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
      <h2>À propos de Majesti'Car</h2>
      <p>
        Bienvenue chez Majesti'Car, votre partenaire du nettoyage automobile premium 💎.
        Nous avons conçu un utilitaire transformé en station de lavage mobile 🔋💧, 100% autonome en électricité et en eau, pour vous offrir un service rapide, pratique et haut de gamme. <br/>

        📍 Où vous voulez, quand vous voulez :<br />
        - À domicile 🏡<br />
        - Sur votre lieu de travail 🏢<br />
        - Ou à l'adresse de votre choix 📌<br /><br />

        ✅ Nos services :<br />
        - Nettoyage extérieur 🚿🚗<br />
        - Nettoyage intérieur 🧽🪣<br />
        - Finitions soignées pour un rendu comme neuf ✨<br /><br />

        Avec Majesti'Car, plus besoin de vous déplacer : 👉 Nous venons à vous et nous redonnons tout son éclat à votre véhicule.<br /><br />

        Confort, qualité et exigence sont au cœur de notre savoir-faire 💯.
      </p>
    </div>

          
      <ProfessionalServices />
     
      <h1 className='Diff_services' ref={servicesRef}>Nos differents services</h1>
      <div className="services" id='Diff_services'>
          
            <div className="service bronze">
                <h3>Formule Bronze</h3>
                <div className="price">40€</div>
                <ul className="features">
                    <li>Aspiration complète de l'habitacle</li>
                    <li>Traitement des plastiques et tableau de bord</li>
                    <li>Nettoyage vitres & pare-brise</li>
                    <li>Parfum intérieur</li>
                </ul>
              
                <Link to="/reserver-bronze" className="select-button">
                  Choisir cette formule
                </Link>
            </div>

            <div className="service argent">
                <h3>Formule Argent</h3>
                <div className="price">80€</div>
                <ul className="features">
                    <li>Aspiration complète de l'habitacle</li>
                    <li>Traitement des plastiques et tableau de bord</li>
                    <li>Nettoyage vitres & pare-brise</li>
                    <li>Parfum intérieur</li>
                    <li>Nettoyage vapeur sièges & tableau de bord</li>
                    <li>Shampouineuse 5 sièges</li>
                    <li>Nettoyage des seuils de portes</li>
                   
                </ul>
               

                <Link to="/reserver-argent" className="select-button">
                  Choisir cette formule
                </Link>
            </div>

            <div className="service or">
                <h3>Formule Or</h3>
                <div className="price">120€</div>
                <ul className="features">
                    <li>Aspiration complète de l'habitacle</li>
                    <li>Traitement des plastiques et tableau de bord</li>
                    <li>Nettoyage vitres & pare-brise</li>
                    <li>Parfum intérieur</li>
                    <li>Nettoyage vapeur sièges & tableau de bord</li>
                    <li>Shampouineuse 5 sièges</li>
                    <li>Nettoyage des seuils de portes</li>
                    <li>Lavage extérieur complet (prélavage + shampoing)</li>
                    <li>Lavage jantes</li>
                    <li>Shampouineuse sièges, tapis, moquettes & coffre</li>
                    <li>Décontamination vapeur de l'habitacle</li>
                </ul>
                <Link to="/reserver-or" className="select-button">
                  Choisir cette formule
                </Link>
            </div>
        </div>

        {/* Section Galerie Photos */}
        <div className="gallery-section">
          <h1 className="gallery-title">Notre Galerie</h1>
          <p className="gallery-subtitle">Découvrez nos réalisations</p>
          
          <div className="gallery-carousel">
            <button className="gallery-arrow gallery-arrow-left" onClick={prevImage}>
              ‹
            </button>
            <div className="gallery-image-container">
          {allMedia[currentImageIndex].type === 'image' ? (
            <img 
              src={allMedia[currentImageIndex].src} 
              alt={`Réalisation ${currentImageIndex + 1}`} 
              className="gallery-image" 
            />
          ) : (
            <video 
              src={allMedia[currentImageIndex].src} 
              className="gallery-image"
              controls
              autoPlay
              muted
              loop
            />
          )}
        </div>
            <button className="gallery-arrow gallery-arrow-right" onClick={nextImage}>
              ›
            </button>
          </div>
          
          <div className="gallery-dots">
            {carouselImages.map((_, index) => (
              <span
                key={index}
                className={`gallery-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
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