import React from 'react';

const ServicesSection = () => {
  return (
    <div>
      <style jsx>{`
        .services-container {
          padding: 60px 20px;
          background:white;
        }

        .services-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .services-subtitle {
          text-align: center;
          color: #6c757d;
          font-size: 1.1rem;
          margin-bottom: 50px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .mw-cards {
          display: grid;
          gap: 30px;
          grid-template-columns: 1fr;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .mw-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .mw-card {
          background: white;
          border-radius: 16px;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
          position: relative;
          overflow: hidden;
        }

        .mw-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #007bff, #0056b3);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .mw-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .mw-card:hover::before {
          transform: translateX(0);
        }

        .mw-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          display: block;
          line-height: 1;
        }

        .mw-icon-bounce {
          animation: bounce 2s infinite;
        }

        .mw-icon-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-10px);
          }
          70% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .mw-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: black;
          margin-bottom: 15px;
          margin-top: 0;
        }

        .mw-text {
          color: black;
          line-height: 1.6;
          font-size: 1rem;
          margin: 0;
        }

        .mw-card:nth-child(1) {
          animation-delay: 0s;
        }

        .mw-card:nth-child(2) {
          animation-delay: 0.1s;
        }

        .mw-card:nth-child(3) {
          animation-delay: 0.2s;
        }

        .card-appear {
          opacity: 0;
          transform: translateY(30px);
          animation: slideInUp 0.6s ease-out forwards;
        }

        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Version alternative avec icônes SVG */
        .svg-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 20px;
          padding: 12px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          border-radius: 12px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .mw-card:hover .svg-icon {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>

      <section className="services-container">
        <h2 className="services-title">Pourquoi choisir MugiWash ?</h2>
        <p className="services-subtitle">
          Découvrez les avantages qui font de nous votre partenaire de confiance
        </p>

        <div className="mw-cards" id="cards-container">
          <article className="mw-card card-appear">
            <div className="mw-icon mw-icon-bounce">🧽</div>
            <h3 className="mw-title">Service à domicile</h3>
            <p className="mw-text">
              Nous venons chez vous au moment qui vous convient. Plus besoin de perdre du temps en
              déplacement — on s'occupe de tout, sur place.
            </p>
          </article>

          <article className="mw-card card-appear">
            <div className="mw-icon mw-icon-pulse">🌿</div>
            <h3 className="mw-title">Produits écologiques</h3>
            <p className="mw-text">
              Tous nos produits sont choisis pour leur efficacité et leur faible impact sur
              l'environnement, afin de protéger votre véhicule et la planète.
            </p>
          </article>

          <article className="mw-card card-appear">
            <div className="mw-icon mw-icon-pulse">✨</div>
            <h3 className="mw-title">Excellence professionnelle</h3>
            <p className="mw-text">
              Techniques avancées et attention aux détails pour une protection longue durée et un
              rendu impeccable.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default ServicesSection;