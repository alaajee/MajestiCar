import { useState, useEffect } from 'react'
import image1 from './assets/Photodecouv.jpeg'
import image2 from './assets/logo1.jpeg'
import { Link } from 'react-router-dom';
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
        
    </div>
  )
}

export default App