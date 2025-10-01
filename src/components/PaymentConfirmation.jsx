import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

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
    emailjs.init('YOUR_PUBLIC_KEY'); // 👈 À remplacer

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
      await emailjs.send(
        'YOUR_SERVICE_ID',  // 👈 À remplacer
        'YOUR_TEMPLATE_ID', // 👈 À remplacer
        {
          to_email: email,
          date: paymentInfo.date,
          reference: paymentInfo.reference,
          amount: paymentInfo.amount
        }
      );

      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Erreur:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-[slideUp_0.5s_ease]">
        
        {/* Icône de succès */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-[scaleIn_0.5s_ease_0.2s_backwards]">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Paiement Confirmé ! 🎉
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Merci pour votre commande
        </p>

        {/* Informations de paiement */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date :</span>
            <span className="font-semibold text-gray-800">{paymentInfo.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Référence :</span>
            <span className="font-semibold text-gray-800">{paymentInfo.reference}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t-2 border-gray-200">
            <span className="text-gray-600 font-bold">Montant payé :</span>
            <span className="font-bold text-gray-800">{paymentInfo.amount}</span>
          </div>
        </div>

        {/* Section email */}
        {!success && (
          <div>
            <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">
              📧 Recevoir la confirmation par email
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Votre adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="exemple@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer la confirmation'}
              </button>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
            ✓ Email de confirmation envoyé avec succès !
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mt-4">
            ✗ Erreur lors de l'envoi. Veuillez réessayer.
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}