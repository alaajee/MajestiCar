import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useReservations } from './ReservationsContext';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './ReservationsContext';
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
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const finaliserReservation = async () => {
      try {
        console.log('=== DÉBUT FINALISATION ===');
        const paymentType = searchParams.get('payment');
        let reservationId = searchParams.get('reservationId');

        if (paymentType === 'stripe' && !reservationId) {
          reservationId = sessionStorage.getItem('stripe_pending_reservation');
        }

        if (!paymentType) {
          throw new Error('Paramètre "payment" manquant dans lURL');
        }

        let data;
        let docRef;

        // ======== CAS 1 : PAIEMENT STRIPE ========
        if (paymentType === 'stripe') {
          console.log('💳 Mode Stripe détecté');
          
          const storageKey = `reservation_processed_${reservationId}`;
          if (sessionStorage.getItem(storageKey)) {
            console.log('Réservation Stripe déjà traitée.');
            const savedData = sessionStorage.getItem(`reservation_data_${reservationId}`);
            if (savedData) {
              const data = JSON.parse(savedData);
              setReservationInfo(data);
              setIsCashPayment(false);
              setStatus('success');
            }
            return;
          }

          if (!reservationId) {
            const clientEmail = sessionStorage.getItem('stripe_pending_email');
            if (clientEmail) {
              const q = query(
                collection(db, 'pendingReservations'),
                where('email', '==', clientEmail),
                where('status', '==', 'pending')
              );
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                const foundDoc = querySnapshot.docs[0];
                reservationId = foundDoc.id;
                data = foundDoc.data();
                docRef = doc(db, 'pendingReservations', reservationId);
              } else {
                throw new Error('Aucune réservation trouvée pour cet email');
              }
            } else {
              throw new Error('Impossible de retrouver la réservation');
            }
          } else {
            docRef = doc(db, 'pendingReservations', reservationId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
              throw new Error(`Réservation ${reservationId} non trouvée`);
            }
            data = docSnap.data();
          }

          sessionStorage.setItem(storageKey, 'true');
          sessionStorage.setItem(`reservation_data_${reservationId}`, JSON.stringify(data));
          
          await ajouterReservation(new Date(data.dateISO), data.heure, data.formule);
          await deleteDoc(docRef);

          // ENVOI EMAIL CLIENT - STRIPE
          const templateParams = {
            from_name: `${data.prenom} ${data.nom}`,
            from_email: data.email,
            phone: data.telephone,
            address: (data.adresse && data.adresse.trim()) ? data.adresse : 'Non renseignée',  // ✅ "address" pas "adresse"
            date: data.date,
            time: data.heure,
            service: `Formule ${data.formule} - 50€`,
            options: data.optionsTexte || 'Aucune',
            prix_total: `${data.prixTotal}€`,
            payment_status: '✅ Payé via Stripe'
          };

          console.log('📧 Envoi email Stripe avec données:', templateParams);

          try {
            await emailjs.send(
              'service_dfuagfb',
              'template_n1xx78h',
              templateParams,
              'PEOGgjS79RXoYneNz'
            );
            console.log('✅ Email de confirmation Stripe envoyé');
          } catch (err) {
            console.error('❌ Erreur envoi email Stripe:', err);
          }

          sessionStorage.removeItem('stripe_pending_reservation');
          sessionStorage.removeItem('stripe_pending_email');
        }
        
        // ======== CAS 2 : PAIEMENT CASH ========
        else if (paymentType === 'cash') {
          console.log('💵 Mode Cash détecté');
          const dataParam = searchParams.get('data');
          if (!dataParam) throw new Error('Paramètre "data" manquant');
          
          data = JSON.parse(decodeURIComponent(dataParam));
          
          // ✅ LOG POUR VÉRIFIER L'ADRESSE
          console.log('🔍 Données cash reçues:', data);
          console.log('🏠 Adresse dans data:', data.adresse);

          const cashReservationId = `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const storageKey = `reservation_processed_${cashReservationId}`;

          if (sessionStorage.getItem(storageKey)) {
            console.log('Réservation cash déjà traitée.');
            const savedData = sessionStorage.getItem(`reservation_data_${cashReservationId}`);
            if (savedData) {
              const savedReservation = JSON.parse(savedData);
              setReservationInfo(savedReservation);
              setIsCashPayment(true);
              setStatus('success');
            }
            return;
          }

          sessionStorage.setItem(storageKey, 'true');
          sessionStorage.setItem(`reservation_data_${cashReservationId}`, JSON.stringify(data));
          
          await ajouterReservation(new Date(data.dateISO), data.heure, data.formule);

          // EMAIL CLIENT - CASH
          const templateParams = {
            from_name: `${data.prenom} ${data.nom}`,
            from_email: data.email,
            phone: data.telephone,
            address: (data.adresse && data.adresse.trim()) ? data.adresse : 'Non renseignée',  // ✅ "address" pas "adresse"
            date: data.date,
            time: data.heure,
            service: `Formule ${data.formule} - 50€`,
            options: data.optionsTexte || 'Aucune',
            prix_total: `${data.prixTotal}€`,
            payment_status: '💵 Paiement sur place'
          };

          console.log('📧 Envoi email cash CLIENT avec données:', templateParams);

          try {
            await emailjs.send(
              'service_dfuagfb',
              'template_n1xx78h',
              templateParams,
              'PEOGgjS79RXoYneNz'
            );
            console.log('✅ Email client cash envoyé');
          } catch (err) {
            console.error('❌ Erreur email client cash:', err);
          }

          // EMAIL ADMIN - CASH
          try {
            const templateParamsAdmin = {
              from_name: `${data.prenom} ${data.nom}`,
              from_email: data.email,
              phone: data.telephone,
              address: (data.adresse && data.adresse.trim()) ? data.adresse : 'Non renseignée',  // ✅ "address" pas "adresse"
              date: data.date,
              time: data.heure,
              service: `Formule ${data.formule} - 50€`,
              options: data.optionsTexte || 'Aucune',
              prix_total: `${data.prixTotal}€`,
              payment_status: '💵 Paiement sur place',
              to_email: "alaajenn7@gmail.com",
              admin_message: `Nouvelle réservation CASH : ${data.prenom} ${data.nom}, ${data.date} à ${data.heure}`
            };

            console.log('📧 Envoi email cash ADMIN avec données:', templateParamsAdmin);

            await emailjs.send(
              'service_dfuagfb',
              'template_admin',
              templateParamsAdmin,
              'PEOGgjS79RXoYneNz'
            );
            console.log('✅ Email admin cash envoyé');
          } catch (err) {
            console.error('❌ Erreur email admin cash:', err);
          }
        }

        setReservationInfo(data);
        setIsCashPayment(paymentType === 'cash');
        setStatus('success');

      } catch (error) {
        console.error('❌ ERREUR FINALE:', error);
        setStatus('error');
      }
    };

    finaliserReservation();
  }, [searchParams, ajouterReservation]);

  // ========== ÉCRAN DE CHARGEMENT ==========
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

  // ========== ÉCRAN D'ERREUR ==========
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
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Une erreur s'est produite
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Votre paiement a été effectué, mais nous n'avons pas pu finaliser votre réservation automatiquement.
          </p>
          <div style={{
            background: '#fff3cd',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            border: '2px solid #ffc107'
          }}>
            <p style={{ margin: 0, color: '#856404', fontWeight: 'bold' }}>
              Nous vous contacterons sous peu pour confirmer votre réservation.
              Consultez la console (F12) pour plus de détails.
            </p>
          </div>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: '#2c5aa0',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold'
            }}
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // ========== ÉCRAN DE SUCCÈS ==========
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
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ color: '#28a745', marginBottom: '1rem', fontSize: '2.5rem' }}>
          {isCashPayment ? 'Réservation confirmée !' : 'Paiement réussi !'}
        </h1>
        <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '2rem' }}>
          {isCashPayment
            ? 'Votre réservation a été enregistrée avec succès'
            : 'Votre paiement a été accepté et votre réservation est confirmée'
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
            <h2 style={{ color: '#2c5aa0', marginBottom: '1.5rem', textAlign: 'center' }}>
              Récapitulatif
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>Client :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333' }}>
                {reservationInfo.prenom} {reservationInfo.nom}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>Email :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333' }}>{reservationInfo.email}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>Téléphone :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333' }}>{reservationInfo.telephone}</p>
            </div>

            {reservationInfo.adresse && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#2c5aa0' }}>Adresse :</strong>
                <p style={{ margin: '0.5rem 0', color: '#333' }}>{reservationInfo.adresse}</p>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>Date et heure :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333', fontSize: '1.1rem' }}>
                {reservationInfo.date} à {reservationInfo.heure}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#2c5aa0' }}>Formule :</strong>
              <p style={{ margin: '0.5rem 0', color: '#333' }}>
                {reservationInfo.formule} (50€)
              </p>
            </div>

            {reservationInfo.options && reservationInfo.options.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#2c5aa0' }}>Options :</strong>
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
                ? `À payer sur place : ${reservationInfo.prixTotal}€`
                : `Total payé : ${reservationInfo.prixTotal}€`
              }
            </div>
          </div>
        )}

        <div style={{
          background: isCashPayment ? '#fff3cd' : '#d1ecf1',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: `2px solid ${isCashPayment ? '#ffc107' : '#bee5eb'}`
        }}>
          <p style={{ margin: 0, color: isCashPayment ? '#856404' : '#0c5460' }}>
            Un email de confirmation a été envoyé à <strong>{reservationInfo?.email}</strong>
            {isCashPayment && (
              <>
                <br /><strong>N'oubliez pas :</strong> Le paiement de {reservationInfo?.prixTotal}€
                sera à effectuer sur place.
              </>
            )}
          </p>
        </div>

        <Link
          to="/"
          style={{
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

export default ReservationSuccess;