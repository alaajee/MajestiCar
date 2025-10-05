import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const finaliserReservation = async () => {
      try {
        console.log('=== DÉBUT FINALISATION ===');
        console.log('URL complète:', window.location.href);
        
        const paymentType = searchParams.get('payment');
        
        // Récupérer l'ID depuis sessionStorage (Stripe) ou URL (Cash)
        let reservationId = searchParams.get('reservationId');
        
        if (paymentType === 'stripe' && !reservationId) {
          reservationId = sessionStorage.getItem('stripe_pending_reservation');
          console.log('ID récupéré depuis sessionStorage:', reservationId);
        }
        
        console.log('Payment type:', paymentType);
        console.log('Reservation ID:', reservationId);
        
        if (!paymentType) {
          throw new Error('Paramètre "payment" manquant dans l\'URL');
        }
        
        const storageKey = `reservation_processed_${reservationId || 'cash'}`;
        
        // Vérifier si déjà traité
        if (sessionStorage.getItem(storageKey)) {
          console.log('Réservation déjà traitée');
          const savedData = sessionStorage.getItem(`reservation_data_${reservationId || 'cash'}`);
          if (savedData) {
            const data = JSON.parse(savedData);
            setReservationInfo(data);
            setIsCashPayment(data.paymentMethod === 'cash');
            setStatus('success');
            return;
          }
        }
        
        let data;

        // ========== CAS 1 : PAIEMENT STRIPE ==========
        if (paymentType === 'stripe') {
          console.log('💳 Mode Stripe détecté');
          
          let reservationId = searchParams.get('reservationId');
          let docRef; // ✅ Déclarer docRef ici
          
          if (!reservationId) {
            reservationId = sessionStorage.getItem('stripe_pending_reservation');
            console.log('📥 ID récupéré depuis sessionStorage:', reservationId);
          }
          
          if (!reservationId) {
            // SI TOUJOURS PAS D'ID : Chercher par email du client
            const clientEmail = sessionStorage.getItem('stripe_pending_email');
            
            if (clientEmail) {
              console.log('🔍 Recherche par email:', clientEmail);
              
              const { collection, query, where, getDocs } = await import('firebase/firestore');
              
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
                docRef = doc(db, 'pendingReservations', reservationId); // ✅ Créer docRef
                console.log('✅ Réservation trouvée par email:', reservationId);
              } else {
                throw new Error('Aucune réservation en attente trouvée pour cet email');
              }
            } else {
              throw new Error('Impossible de retrouver la réservation');
            }
          } else {
            // Récupération normale par ID
            console.log('📥 Récupération depuis Firebase...');
            docRef = doc(db, 'pendingReservations', reservationId); // ✅ Créer docRef
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
              throw new Error(`Réservation ${reservationId} non trouvée dans Firebase`);
            }
            
            data = docSnap.data();
            console.log('✅ Données récupérées:', data);
          }
          
          // Marquer comme traité AVANT toute opération
          sessionStorage.setItem(storageKey, 'true');
          sessionStorage.setItem(`reservation_data_${reservationId}`, JSON.stringify(data));
          
          // 1. Enregistrer dans reservations confirmées
          console.log('💾 Enregistrement dans reservations...');
          await ajouterReservation(
            new Date(data.dateISO), 
            data.heure, 
            data.formule
          );
          console.log('✅ Réservation enregistrée');
          
          // 2. Supprimer la réservation pending
          console.log('🗑️ Suppression pending...');
          await deleteDoc(docRef);
          console.log('✅ Pending supprimée');
          
          // 3. ENVOI DES EMAILS
          const templateParams = {
            from_name: `${data.prenom} ${data.nom}`,
            from_email: data.email,
            phone: data.telephone,
            date: data.date,
            time: data.heure,
            service: `Formule ${data.formule} - 50€`,
            options: data.optionsTexte,
            prix_total: `${data.prixTotal}€`,
            payment_status: '✅ Payé via Stripe'
          };

          // Email au CLIENT
          try {
            await emailjs.send(
              'service_1wryoqr',
              'template_x1vgr07',
              templateParams,
              'KUPBmz5lg0pubUDdW'
            );
            console.log('✅ Email client envoyé');
          } catch (emailError) {
            console.error('❌ Erreur email client:', emailError);
          }

          // Email à l'ADMIN
          try {
            const templateParamsAdmin = {
              ...templateParams,
              to_email: "votre-email@exemple.com"  // 👈 REMPLACEZ PAR VOTRE EMAIL
            };

            await emailjs.send(
              'service_1wryoqr',
              'template_x1vgr07',
              templateParamsAdmin,
              'KUPBmz5lg0pubUDdW'
            );
            console.log('✅ Email admin envoyé');
          } catch (emailError) {
            console.error('❌ Erreur email admin:', emailError);
          }

          // Nettoyer sessionStorage
          sessionStorage.removeItem('stripe_pending_reservation');
        } 
        // ========== CAS 2 : PAIEMENT CASH ==========
        else if (paymentType === 'cash') {
          console.log('💵 Mode Cash détecté');
          const dataParam = searchParams.get('data');
          
          if (!dataParam) {
            throw new Error('Paramètre "data" manquant pour paiement cash');
          }
          
          data = JSON.parse(decodeURIComponent(dataParam));
          console.log('✅ Données cash récupérées:', data);
          
          // Marquer comme traité
          sessionStorage.setItem(storageKey, 'true');
          sessionStorage.setItem(`reservation_data_cash`, JSON.stringify(data));
          
          // Enregistrer dans Firebase
          await ajouterReservation(
            new Date(data.dateISO), 
            data.heure, 
            data.formule
          );
          console.log('✅ Réservation enregistrée');
          
          // ENVOI DES EMAILS
          const templateParams = {
            from_name: `${data.prenom} ${data.nom}`,
            from_email: data.email,
            phone: data.telephone,
            date: data.date,
            time: data.heure,
            service: `Formule ${data.formule} - 50€`,
            options: data.optionsTexte,
            prix_total: `${data.prixTotal}€`,
            payment_status: '💵 Paiement sur place'
          };

          // Email au CLIENT
          try {
            await emailjs.send(
              'service_1wryoqr',
              'template_x1vgr07',
              templateParams,
              'KUPBmz5lg0pubUDdW'
            );
            console.log('✅ Email client envoyé');
          } catch (emailError) {
            console.error('❌ Erreur email client:', emailError);
          }

          // Email à l'ADMIN
          try {
            const templateParamsAdmin = {
              ...templateParams,
              to_email: "votre-email@exemple.com"  // 👈 REMPLACEZ PAR VOTRE EMAIL
            };

            await emailjs.send(
              'service_1wryoqr',
              'template_x1vgr07',
              templateParamsAdmin,
              'KUPBmz5lg0pubUDdW'
            );
            console.log('✅ Email admin envoyé');
          } catch (emailError) {
            console.error('❌ Erreur email admin:', emailError);
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