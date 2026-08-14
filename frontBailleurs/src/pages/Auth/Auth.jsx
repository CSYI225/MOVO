import React, { useState } from 'react';
import { Mail, Lock, Shield, ChevronLeft, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import LogoMovo from '../../Images/logo.png';

const Auth = () => {
  const { login } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot' | 'must_change_pwd'

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Forced password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (view === 'login') {
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error);
      } else if (res.mustChangePassword) {
        setView('must_change_pwd');
      }
    } else if (view === 'forgot') {
      setForgotSent(true);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 6) {
      setErrorMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('movo_bailleur_token');
      const response = await fetch('http://localhost:5000/api/locataires/changer-mot-de-passe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nouveauMotDePasse: newPassword }),
      });
      const data = await response.json();
      setLoading(false);
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe.');
      }
      setChangeSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message);
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

          {(view === 'forgot' || view === 'register') && (
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
                  <label>Adresse e-mail ou téléphone</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-icon" />
                    <input 
                      type="text" 
                      placeholder="nom@exemple.com ou 0708091011" 
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

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </form>

              <div className="auth-switch-text">
                Nouveau bailleur ?{' '}
                <button onClick={() => setView('register')}>Obtenir un compte</button>
              </div>
            </>
          )}

          {view === 'must_change_pwd' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Shield size={40} color="#F59A23" style={{ marginBottom: '8px' }} />
                <h3>Changement de mot de passe obligatoire</h3>
                <p className="auth-subtitle">
                  C'est votre première connexion avec vos accès temporaires. Veuillez définir votre mot de passe personnel.
                </p>
              </div>

              {changeSuccess ? (
                <div className="auth-success-state" style={{ textAlign: 'center' }}>
                  <CheckCircle2 size={48} className="success-icon" color="#10B981" />
                  <h4>Mot de passe mis à jour !</h4>
                  <p>Chargement de votre espace de gestion...</p>
                </div>
              ) : (
                <form onSubmit={handleChangePasswordSubmit} className="auth-form">
                  <div className="auth-input-group">
                    <label>Nouveau mot de passe</label>
                    <div className="auth-input-wrapper">
                      <Lock size={18} className="auth-icon" />
                      <input 
                        type="password" 
                        placeholder="Au moins 6 caractères" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Confirmer le nouveau mot de passe</label>
                    <div className="auth-input-wrapper">
                      <Shield size={18} className="auth-icon" />
                      <input 
                        type="password" 
                        placeholder="Confirmez votre nouveau mot de passe" 
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Valider et accéder à mon espace'}
                  </button>
                </form>
              )}
            </>
          )}

          {view === 'register' && (
            <>
              <h3>Création de compte Bailleur</h3>
              <p className="auth-subtitle">Information importante</p>

              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '10px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Info size={24} color="#1D4ED8" />
                  <span style={{ fontWeight: '700', fontSize: '15px', color: '#1E40AF' }}>
                    Compte géré par l'Administration MOVO
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#1E3A8A', lineHeight: '20px', margin: 0 }}>
                  Les comptes Bailleurs sont désormais créés exclusivement par l'Administrateur MOVO pour garantir la sécurité et la vérification des bailleurs de la plateforme.
                </p>
                <p style={{ fontSize: '13px', color: '#1E3A8A', lineHeight: '20px', margin: 0 }}>
                  Si vous n'avez pas encore vos identifiants temporaires, veuillez contacter le service d'administration à : <strong>admin@movo.ci</strong>.
                </p>
              </div>

              <button className="auth-submit-btn" onClick={() => setView('login')}>
                J'ai mes accès temporaires — Se connecter
              </button>
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
