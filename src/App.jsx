import { useState, useEffect } from 'react'
import image1 from './assets/im.jpg'
import image2 from './assets/logov2.jpg'
import picture1 from './assets/picture1.jpeg'
import picture2 from './assets/picture2.jpeg'
import picture3 from './assets/picture3.jpeg'
import photo from './assets/lavage-auto.jpg'
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
  // Fonction pour passer à l'image suivante
  // Fonction pour passer à l'image suivante
  const autoPlayRef = useRef(null);


  // Relancer l'autoplay quand l'index change
  useEffect(() => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
  
    // Si c'est une image, on utilise un timer
    if (allMedia[currentImageIndex].type === 'image') {
      autoPlayRef.current = setTimeout(() => {
        nextImage();
      }, 10000); // 5 secondes par image
    }
    // Si c'est une vidéo, on ne fait rien (géré par onEnded)
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [currentImageIndex]);
  // Navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  useEffect(() => {
    const cards = document.querySelectorAll(".mw-card");
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add("visible"), 150 * i);
    });

    // Auto-play du carrousel
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
      <img src={photo} alt="A beautiful scenery" />
      
      <div className="image-title">
        MAJESTI'CAR
      </div>
      
      <div className="image-slogan">
        DETAILING AUTOMOBILE PREMIUM
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
      Majesti’Car, votre station de lavage automobile mobile premium.

      Autonome en électricité et en eau, nous venons directement à vous pour redonner à votre véhicule toute sa brillance.

      Un service pratique, écologique et 100 % mobile. Majesti’Car, la qualité du lavage professionnel, directement chez vous.

       
      </p>
      </div>

          
      <ProfessionalServices />
     
      <h1 className='Diff_services' ref={servicesRef}>Nos differents services</h1>
      <div className="services" id='Diff_services'>
          
            <div className="service bronze">
                <h3>Formule Bronze</h3>
                <div className="price">50€</div>
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
                <div className="price">90€</div>
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
                <div className="price">130€</div>
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
          <h1 className="gallery-title">Galerie</h1>
          <p className="gallery-subtitle">Notre qualité à votre service</p>
          
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
                key={currentImageIndex}
                src={allMedia[currentImageIndex].src}
                className="gallery-image"
                autoPlay
                muted
                playsInline
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                style={{ pointerEvents: 'none' }}
                onEnded={nextImage} // ← Passe à la suivante quand la vidéo se termine
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
          <div className="footer-contact" useRef={contactRef}>
            <h2>Contactez-nous</h2>
            <p>
              <strong>Téléphone :</strong> <a href="tel:+336 74 14 07 46" className="footer-phone">+212 6 12 34 56 78</a>
            </p>
            <p>
              <strong>Email :</strong> <a href="mailto:abedjaoui74380@gmail.com" className="footer-email">alaejennine33@gmail.com</a>
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