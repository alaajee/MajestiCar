import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './PaymentConfirmation.css';

export default function PaymentConfirmation() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    date: '',
    reference: '',
    amount: ''
  });

  useEffect(() => {
    // Initialiser EmailJS
    emailjs.init('KUPBmz5lg0pubUDdW');

    // Récupérer les infos depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount') || '50.00';
    
    setPaymentInfo({
      date: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      reference: `#${Date.now().toString(36).toUpperCase()}`,
      amount: `${amount}€`
    });
  }, []);

  const handleSubmit = async () => {
    if (!email) return;

    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      // ✅ 1) Email pour le client
      await emailjs.send(
        'service_1wryoqr',
        'template_hcf4fln',
        {
          to_email: email,
          date: paymentInfo.date,
          reference: paymentInfo.reference,
          amount: paymentInfo.amount
        },
        'KUPBmz5lg0pubUDdW'
      );

      // ✅ 2) Email pour vous (admin)
      await emailjs.send(
        'service_1wryoqr',
        'template_x1vgr07', // ⚠️ Assurez-vous que ce template existe dans EmailJS
        {
          to_email: "alaejennine33@gmail.com", 
          client_email: email,
          date: paymentInfo.date,
          reference: paymentInfo.reference,
          amount: paymentInfo.amount
        },
        'KUPBmz5lg0pubUDdW'
      );

      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Erreur EmailJS:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="success-icon">
          <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="title">Paiement Confirmé ! 🎉</h1>
        <p className="subtitle">Merci pour votre commande</p>

        {/* Informations de paiement */}
        <div className="payment-details">
          <div className="detail-row">
            <span className="label">Date :</span>
            <span className="value">{paymentInfo.date}</span>
          </div>
          <div className="detail-row">
            <span className="label">Référence :</span>
            <span className="value">{paymentInfo.reference}</span>
          </div>
          <div className="detail-row">
            <span className="label">Montant :</span>
            <span className="value">{paymentInfo.amount}</span>
          </div>
        </div>

        {!success && (
          <div>
            <h2 className="email-title">📧 Recevoir la confirmation par email</h2>
            <div className="form">
              <label htmlFor="email">Votre adresse email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="exemple@email.com"
                disabled={loading}
              />
              <button onClick={handleSubmit} disabled={loading || !email}>
                {loading ? 'Envoi en cours...' : 'Envoyer la confirmation'}
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="msg success">
            ✓ Email de confirmation envoyé avec succès !
          </div>
        )}

        {error && (
          <div className="msg error">
            ✗ Erreur lors de l'envoi. Veuillez réessayer.
          </div>
        )}
      </div>
    </div>
  );
}