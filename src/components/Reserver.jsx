import React, { useState } from 'react';
import './Reserver.css';

function Reserver() {
    const [step, setStep] = useState(1); // 1: sélection, 2: paiement CB, 3: confirmation
    const [formData, setFormData] = useState({
        jour: '',
        heure: '',
        paiement: '',
        nom: '',
        email: '',
        telephone: ''
    });

    const joursDisponibles = [
        'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ];

    const heuresDisponibles = [
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.jour || !formData.heure || !formData.paiement || !formData.nom || !formData.email) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formData.paiement === 'CB') {
            setStep(2); // Aller à la page de paiement
        } else {
            setStep(3); // Aller directement à la confirmation
        }
    };

    const handlePaiementCB = (e) => {
        e.preventDefault();
        // Simulation du paiement
        setTimeout(() => {
            setStep(3);
        }, 1500);
    };

    const resetForm = () => {
        setFormData({
            jour: '',
            heure: '',
            paiement: '',
            nom: '',
            email: '',
            telephone: ''
        });
        setStep(1);
    };

    // ÉTAPE 1: Sélection des créneaux
    if (step === 1) {
        return (
            <div className="reservation-container">
                <header className="reservation-header">
                    <button onClick={() => window.location.href = '/MugiWash'} className="back-button">← Retour</button>
                    <h1>Réservation MugiWash</h1>
                </header>

                <form onSubmit={handleSubmit} className="reservation-form">
                    <div className="form-section">
                        <h2>📅 Informations personnelles</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nom">Nom complet *</label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Votre nom"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="telephone">Téléphone</label>
                            <input
                                type="tel"
                                id="telephone"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleInputChange}
                                placeholder="06 12 34 56 78"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>🗓️ Choisissez votre créneau</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="jour">Jour de la semaine *</label>
                                <select
                                    id="jour"
                                    name="jour"
                                    value={formData.jour}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Sélectionnez un jour</option>
                                    {joursDisponibles.map(jour => (
                                        <option key={jour} value={jour}>{jour}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="heure">Heure *</label>
                                <select
                                    id="heure"
                                    name="heure"
                                    value={formData.heure}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Sélectionnez une heure</option>
                                    {heuresDisponibles.map(heure => (
                                        <option key={heure} value={heure}>{heure}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>💳 Mode de paiement *</h2>
                        <div className="payment-options">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paiement"
                                    value="CB"
                                    checked={formData.paiement === 'CB'}
                                    onChange={handleInputChange}
                                />
                                <div className="payment-card">
                                    <span className="payment-icon">💳</span>
                                    <div>
                                        <strong>Carte Bancaire</strong>
                                        <p>Paiement sécurisé en ligne</p>
                                    </div>
                                </div>
                            </label>
                            
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="paiement"
                                    value="Espece"
                                    checked={formData.paiement === 'Espece'}
                                    onChange={handleInputChange}
                                />
                                <div className="payment-card">
                                    <span className="payment-icon">💵</span>
                                    <div>
                                        <strong>Espèces sur place</strong>
                                        <p>Payez directement au rendez-vous</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="submit-button">
                        {formData.paiement === 'CB' ? 'Procéder au paiement' : 'Confirmer la réservation'}
                    </button>
                </form>
            </div>
        );
    }

    // ÉTAPE 2: Paiement CB
    if (step === 2) {
        return (
            <div className="reservation-container">
                <header className="reservation-header">
                    <button onClick={() => setStep(1)} className="back-button">← Retour</button>
                    <h1>Paiement sécurisé</h1>
                </header>

                <div className="payment-summary">
                    <h3>Récapitulatif de votre réservation</h3>
                    <div className="summary-details">
                        <p><strong>Nom:</strong> {formData.nom}</p>
                        <p><strong>Jour:</strong> {formData.jour}</p>
                        <p><strong>Heure:</strong> {formData.heure}</p>
                        <p><strong>Prix:</strong> 25€</p>
                    </div>
                </div>

                <form onSubmit={handlePaiementCB} className="payment-form">
                    <div className="form-group">
                        <label htmlFor="cardNumber">Numéro de carte</label>
                        <input
                            type="text"
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            required
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="expiry">Date d'expiration</label>
                            <input
                                type="text"
                                id="expiry"
                                placeholder="MM/YY"
                                maxLength="5"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cvv">CVV</label>
                            <input
                                type="text"
                                id="cvv"
                                placeholder="123"
                                maxLength="3"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="payment-submit-button">
                        💳 Payer 25€
                    </button>
                </form>
            </div>
        );
    }

    // ÉTAPE 3: Confirmation
    return (
        <div className="reservation-container">
            <div className="confirmation-card">
                <div className="success-icon">✅</div>
                <h1>Réservation confirmée !</h1>
                
                <div className="confirmation-details">
                    <h3>Détails de votre rendez-vous</h3>
                    <div className="detail-item">
                        <span className="label">Nom:</span>
                        <span className="value">{formData.nom}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Email:</span>
                        <span className="value">{formData.email}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Jour:</span>
                        <span className="value">{formData.jour}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Heure:</span>
                        <span className="value">{formData.heure}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Paiement:</span>
                        <span className="value">{formData.paiement === 'CB' ? 'Carte bancaire (payé)' : 'Espèces sur place'}</span>
                    </div>
                </div>

                {formData.paiement === 'Espece' && (
                    <div className="cash-reminder">
                        <p>💰 N'oubliez pas d'apporter 25€ en espèces lors de votre rendez-vous.</p>
                    </div>
                )}

                <div className="confirmation-actions">
                    <button onClick={() => window.location.href = '/'} className="home-button">Retour à l'accueil</button>
                    <button onClick={resetForm} className="new-reservation-button">
                        Nouvelle réservation
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Reserver;