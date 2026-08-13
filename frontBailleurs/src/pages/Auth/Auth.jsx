import React, { useState } from 'react';
import { Mail, Lock, User, Shield, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import LogoMovo from '../../Images/logo.png';

const Auth = () => {
  const { login, register } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (view === 'login') {
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error);
      }
    } else if (view === 'register') {
      if (password !== confirmPassword) {
        setErrorMessage('Les mots de passe ne correspondent pas.');
        return;
      }
      setLoading(true);
      const res = await register(prenom, nom, email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error);
      }
    } else {
      setForgotSent(true);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-brand-section">
          <img src={LogoMovo} alt="Logo Movo" className="auth-logo" />
          <h2>Espace Bailleur</h2>
          <p>Gérez vos biens immobiliers et fiabilisez vos relations locatives en toute simplicité.</p>
          <div className="decor-dots">
            <span className="dot dot-primary"></span>
            <span className="dot dot-accent"></span>
            <span className="dot dot-secondary"></span>
          </div>
        </div>

        <div className="auth-form-section">
          {errorMessage && (
            <div className="auth-error-banner" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
              {errorMessage}
            </div>
          )}

          {view === 'forgot' && (
            <button className="auth-back-btn" onClick={() => { setView('login'); setForgotSent(false); }}>
              <ChevronLeft size={16} />
              <span>Retour à la connexion</span>
            </button>
          )}

          {view === 'login' && (
            <>
              <h3>Connexion</h3>
              <p className="auth-subtitle">Accédez à votre espace de gestion</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>Adresse e-mail</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-icon" />
                    <input 
                      type="email" 
                      placeholder="nom@exemple.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <div className="label-row">
                    <label>Mot de passe</label>
                    <button type="button" className="auth-forgot-link" onClick={() => setView('forgot')}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-icon" />
                    <input 
                      type="password" 
                      placeholder="Votre mot de passe" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn">
                  Se connecter
                </button>
              </form>

              <div className="auth-switch-text">
                Pas encore inscrit ?{' '}
                <button onClick={() => setView('register')}>Créer un compte</button>
              </div>
            </>
          )}

          {view === 'register' && (
            <>
              <h3>Créer un compte</h3>
              <p className="auth-subtitle">Rejoignez la plateforme Movo Bailleurs</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-row-inputs">
                  <div className="auth-input-group">
                    <label>Nom</label>
                    <div className="auth-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="Dupont" 
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label>Prénom</label>
                    <div className="auth-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="Jean" 
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Adresse e-mail</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-icon" />
                    <input 
                      type="email" 
                      placeholder="jean.dupont@exemple.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Mot de passe</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-icon" />
                    <input 
                      type="password" 
                      placeholder="Minimum 8 caractères" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Confirmer le mot de passe</label>
                  <div className="auth-input-wrapper">
                    <Shield size={18} className="auth-icon" />
                    <input 
                      type="password" 
                      placeholder="Confirmez votre mot de passe" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn">
                  Créer mon compte
                </button>
              </form>

              <div className="auth-switch-text">
                Déjà inscrit ?{' '}
                <button onClick={() => setView('login')}>Se connecter</button>
              </div>
            </>
          )}

          {view === 'forgot' && (
            <>
              <h3>Mot de passe oublié</h3>
              <p className="auth-subtitle">
                Saisissez votre e-mail pour recevoir un lien de réinitialisation.
              </p>

              {forgotSent ? (
                <div className="auth-success-state">
                  <CheckCircle2 size={48} className="success-icon" />
                  <h4>Lien envoyé !</h4>
                  <p>
                    Nous avons envoyé un lien à l'adresse <strong>{email || 'votre adresse e-mail'}</strong>.
                    Veuillez vérifier votre boîte de réception.
                  </p>
                  <button className="auth-submit-btn" style={{ marginTop: '20px' }} onClick={() => { setView('login'); setForgotSent(false); }}>
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-input-group">
                    <label>Adresse e-mail</label>
                    <div className="auth-input-wrapper">
                      <Mail size={18} className="auth-icon" />
                      <input 
                        type="email" 
                        placeholder="nom@exemple.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    Envoyer le lien
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
