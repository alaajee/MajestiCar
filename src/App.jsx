import { useState, useEffect } from 'react'
import image1 from './assets/im.jpg'
import image2 from './assets/logo1.jpeg'
import { Link } from 'react-router-dom';
import ContactForm from "./components/ContactForm";
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  
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
      </div>

      
      <div className="A_propos">
        <h2>À propos de MugiWash</h2>
        <p>
          MugiWash est une entreprise de lavage automobile mobile dédiée à offrir un service de qualité supérieure directement à votre porte. Nous utilisons des produits écologiques et des techniques avancées pour garantir que votre véhicule soit propre et protégé.
        </p>
      </div>

     
      <div className="mw-cards" id="cards-container">
        <article className="mw-card">
          <div className="mw-icon mw-icon-bounce">🧽</div>
          <h3 className="mw-title">Service à domicile</h3>
          <p className="mw-text">
            Nous venons chez vous au moment qui vous convient. Plus besoin de perdre du temps en
            déplacement — on s'occupe de tout, sur place.
          </p>
        </article>

        <article className="mw-card">
          <div className="mw-icon mw-icon-pulse">🌿</div>
          <h3 className="mw-title">Produits écologiques</h3>
          <p className="mw-text">
            Tous nos produits sont choisis pour leur efficacité et leur faible impact sur
            l’environnement, afin de protéger votre véhicule et la planète.
          </p>
        </article>

        <article className="mw-card">
          <div className="mw-icon mw-icon-pulse">✨</div>
          <h3 className="mw-title">Finition professionnelle</h3>
          <p className="mw-text">
            Techniques avancées et attention aux détails pour une protection longue durée et un
            rendu impeccable.
          </p>
        </article>
      </div>
      <h1 className='Diff_services'>Nos differents services</h1>
      <div class="services">
          
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