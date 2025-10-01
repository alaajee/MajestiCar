import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useReservations } from './ReservationsContext';
import emailjs from 'emailjs-com';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

function ReservationSuccess() {
  const [searchParams] = useSearchParams();
  const { ajouterReservation } = useReservations();
  
  const [status, setStatus] = useState('loading');
  const [reservationInfo, setReservationInfo] = useState(null);
  const [isCashPayment, setIsCashPayment] = useState(false);

  useEffect(() => {
    const finaliserReservation = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;
      
      try {
        // Essayer de récupérer depuis l'URL
        let dataParam = searchParams.get('data');
        const paymentType = searchParams.get('payment');
        
        // Si pas dans l'URL, récupérer depuis sessionStorage
        if (!dataParam && paymentType === 'stripe') {
          dataParam = sessionStorage.getItem('pendingReservation');
          sessionStorage.removeItem('pendingReservation'); // Nettoyer
        }
  
        if (!dataParam) {
          setStatus('error');
          return;
        }
  
        const data = typeof dataParam === 'string' 
          ? JSON.parse(dataParam.startsWith('%') ? decodeURIComponent(dataParam) : dataParam)
          : dataParam;
        
        setReservationInfo(data);
        
        const isCash = paymentType === 'cash' || data.paymentMethod === 'cash';
        setIsCashPayment(isCash);
  
        // Enregistrer la réservation
        await ajouterReservation(
          new Date(data.dateISO), 
          data.heure, 
          data.formule
        );
  
        // Envoyer l'email
        const paymentStatus = isCash ? '💵 Paiement sur place' : '✅ Payé via Stripe';
  
        const templateParams = {
          from_name: `${data.prenom} ${data.nom}`,
          from_email: data.email,
          phone: data.telephone,
          date: data.date,
          time: data.heure,
          service: `Formule ${data.formule} - 50€`,
          options: data.optionsTexte,
          prix_total: `${data.prixTotal}€`,
          payment_status: paymentStatus
        };
  
        await emailjs.send(
          'service_1wryoqr',
          'template_x1vgr07',
          templateParams,
          'KUPBmz5lg0pubUDdW'
        );
  
        setStatus('success');
  
      } catch (error) {
        console.error('Erreur:', error);
        setStatus('error');
      }
    };
  
    finaliserReservation();
  }, [searchParams]);
  
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #2c5aa0',
            borderRadius: '50%',
            margin: '0 auto 2rem',
            animation: 'spin 1s linear infinite'
          }} />
          <h2 style={{ color: '#2c5aa0', marginBottom: '1rem' }}>
            Finalisation de votre réservation...
          </h2>
          <p style={{ color: '#666' }}>
            Veuillez patienter quelques instants
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '600px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '1rem'
          }}>
            ⚠️
          </div>
          <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Une erreur s'est produite
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            {isCashPayment 
              ? "Nous n'avons pas pu finaliser votre réservation."
              : "Votre paiement a été effectué, mais nous n'avons pas pu finaliser votre réservation automatiquement."
            }
          </p>
          <div style={{
            background: '#fff3cd',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            border: '2px solid #ffc107'
          }}>
            <p style={{ margin: 0, color: '#856404', fontWeight: 'bold' }}>
              📧 Nous vous contacterons sous peu pour confirmer votre réservation.
            </p>
          </div>
          <Link
            to="/MugiWash"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: '#2c5aa0',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isCashPayment 
        ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        textAlign: 'center',
        maxWidth: '700px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideIn 0.5s ease-out'
      }}>
        <div style={{
          fontSize: '6rem',
          marginBottom: '1rem',
          animation: 'bounce 0.6s ease-out'
        }}>
          ✅
        </div>

        <h1 style={{
          color: '#28a745',
          marginBottom: '1rem',
          fontSize: '2.5rem'
        }}>
          {isCashPayment ? 'Réservation confirmée !' : 'Paiement réussi !'}
        </h1>

        <p style={{
          color: '#666',
          fontSize: '1.2rem',
          marginBottom: '2rem'
        }}>
          {isCashPayment 
            ? 'Votre réservation a été enregistrée avec succès'
            : 'Votre réservation a été confirmée avec succès'
          }
        </p>

        {reservationInfo && (
          <div style={{
            background: '#f8f9fa',
            padding: '2rem',
            borderRadius: '15px',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h2 style={{
              color: '#2c5aa0',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '1.5rem'
            }}>
              📋 Récapitulatif de votre réservation
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>👤 Client :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333' }}>
                {reservationInfo.prenom} {reservationInfo.nom}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>📧 Email :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333' }}>
                {reservationInfo.email}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>📞 Téléphone :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333' }}>
                {reservationInfo.telephone}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>📅 Date et heure :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333', fontSize: '1.1rem' }}>
                {reservationInfo.date} à {reservationInfo.heure}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>🚗 Formule :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333' }}>
                {reservationInfo.formule} (50€)
              </p>
            </div>

            {reservationInfo.options && reservationInfo.options.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#2c5aa0' }}>➕ Options :</strong>
                <p style={{ margin: '0.5rem 0', color: '#333' }}>
                  {reservationInfo.optionsTexte}
                </p>
              </div>
            )}

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: isCashPayment ? '#28a745' : '#635bff',
              color: 'white',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '1.3rem',
              fontWeight: 'bold'
            }}>
              {isCashPayment 
                ? `💵 À payer sur place : ${reservationInfo.prixTotal}€`
                : `💳 Total payé : ${reservationInfo.prixTotal}€`
              }
            </div>
          </div>
        )}

        {isCashPayment ? (
          <div style={{
            background: '#fff3cd',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            border: '2px solid #ffc107'
          }}>
            <p style={{
              margin: 0,
              color: '#856404',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              💰 <strong>N'oubliez pas :</strong> Le paiement de {reservationInfo?.prixTotal}€ 
              sera à effectuer sur place le jour de votre rendez-vous.
              <br />
              📨 Un email de confirmation a été envoyé à <strong>{reservationInfo?.email}</strong>
            </p>
          </div>
        ) : (
          <div style={{
            background: '#d1ecf1',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            border: '2px solid #bee5eb'
          }}>
            <p style={{
              margin: 0,
              color: '#0c5460',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              📨 Un email de confirmation a été envoyé à <strong>{reservationInfo?.email}</strong>
              <br />
              Nous avons hâte de vous accueillir !
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/MugiWash"
            style={{
              padding: '1rem 2rem',
              background: '#2c5aa0',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🏠 Retour à l'accueil
          </Link>

          <Link
            to="/mes-reservations"
            style={{
              padding: '1rem 2rem',
              background: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            📋 Voir mes réservations
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default ReservationSuccess;