import { useState } from 'react'
import image1 from './assets/Photodecouv.jpeg'
import image2 from './assets/MugiWash.jpg'
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

          <div className="menu-item">Home</div>
          <div className="menu-item">A propos</div>
          <div className="menu-item">Services</div>
          <div className="menu-item">Contact</div>
         
        </div>
      </header>
      <div className="Photo">
        <img src={image1} alt="A beautiful scenery" />
        <div className="image-slogan">
          Votre voiture, notre soin, partout avec MugiWash.
        </div>
      </div>
    </div>
  )
}

export default App