import { useState } from 'react'
import image1 from './assets/Photodecouv.jpeg'
import image2 from './assets/MugiWash.jpg'
import { Link } from 'react-router-dom';
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="App">
      <div className="top-banner">
        <div className="slogan">✨ Bienvenue sur notre site ! Découvrez nos services exceptionnels ✨</div>
      </div>
      <header className="App-header">
        <div className="menu-container">
          <img src={image2} alt="Logo MugiWash" className="menu-logo" />

          <a href="#" className="menu-item">Home</a>
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

        
    </div>
  )
}

export default App