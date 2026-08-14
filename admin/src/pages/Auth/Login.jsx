import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(identifiant, motDePasse);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F322B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '440px',
        width: '100%',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: '#0F322B',
            color: '#84B889',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 10px 15px -3px rgba(15, 50, 43, 0.3)',
          }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F322B', marginBottom: '6px' }}>
            MOVO Admin
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            Portail d'administration et de gestion globale
          </p>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F322B', marginBottom: '8px' }}>
              Email Administrateur
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              padding: '0 14px',
              height: '48px',
            }}>
              <Mail size={18} color="#64748B" style={{ marginRight: '10px' }} />
              <input
                type="email"
                placeholder="admin@movo.ci"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                required
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F322B', marginBottom: '8px' }}>
              Mot de passe
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              padding: '0 14px',
              height: '48px',
            }}>
              <Lock size={18} color="#64748B" style={{ marginRight: '10px' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#0F322B',
              color: '#FFFFFF',
              height: '50px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              boxShadow: '0 4px 6px -1px rgba(15, 50, 43, 0.2)',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter au Panel Admin'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>
          Identifiants par défaut : <strong>admin@movo.ci</strong> / <strong>Admin123456!</strong>
        </div>
      </div>
    </div>
  );
};

export default Login;
