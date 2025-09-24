import React, { useState } from 'react';
import './Reserver.css';

function Reserver() {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        jour: '',
        heure: '',
        paiement: 'CB',
        plan: 'bronze'
    });

    const joursDisponibles = [
        'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ];

    const heuresDisponibles = [
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation basique
        if (!formData.nom || !formData.email || !formData.jour || !formData.heure || !formData.plan) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const prix = {
            bronze: '15€',
            argent: '25€',
            or: '35€'
        };

        alert(`Merci ${formData.nom}, vous avez choisi la formule ${formData.plan.toUpperCase()} (${prix[formData.plan]}). Vous allez être redirigé vers la page de paiement.`);
        
        // Redirection selon le mode de paiement
        if (formData.paiement === 'CB') {
            if (formData.plan === 'bronze') {
                window.location.href = "https://buy.stripe.com/test_cNi8wRdio84Z9Dp3lM1oI00"; 
            } else if (formData.plan === 'argent') {
                window.location.href = "https://buy.stripe.com/test_14k8wRdio84Z9Dp3lM1oI00"; 
            } else if (formData.plan === 'or') {
                window.location.href = "https://buy.stripe.com/test_5kA5nO2io84Z9Dp3lM1oI00"; 
            }
        } else {
            // Pour le paiement en espèces, on peut rediriger vers une page de confirmation
            console.log('Réservation confirmée pour paiement en espèces:', formData);
            alert('Réservation confirmée ! N\'oubliez pas d\'apporter le montant exact le jour du rendez-vous.');
        }
    };

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
                    <h2>⭐ Choisissez votre formule *</h2>
                    <div className="payment-options">
                        <label className="payment-option">
                            <input
                                type="radio"
                                name="plan"
                                value="bronze"
                                checked={formData.plan === 'bronze'}
                                onChange={handleInputChange}
                            />
                            <div className="payment-card">
                                <span className="payment-icon">🥉</span>
                                <div>
                                    <strong>Formule Bronze</strong>
                                    <p>Lavage extérieur + intérieur basique - 50€</p>
                                </div>
                            </div>
                        </label>
                        
                        <label className="payment-option">
                            <input
                                type="radio"
                                name="plan"
                                value="argent"
                                checked={formData.plan === 'argent'}
                                onChange={handleInputChange}
                            />
                            <div className="payment-card">
                                <span className="payment-icon">🥈</span>
                                <div>
                                    <strong>Formule Argent</strong>
                                    <p>Lavage complet + aspiration + produits premium - 80€</p>
                                </div>
                            </div>
                        </label>
                        
                        <label className="payment-option">
                            <input
                                type="radio"
                                name="plan"
                                value="or"
                                checked={formData.plan === 'or'}
                                onChange={handleInputChange}
                            />
                            <div className="payment-card">
                                <span className="payment-icon">🥇</span>
                                <div>
                                    <strong>Formule Or</strong>
                                    <p>Service premium + cire + nettoyage jantes - 120€</p>
                                </div>
                            </div>
                        </label>
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

export default Reserver;