import React, { useState } from 'react';
import { X, Copy, CheckCircle, KeyRound, User, Mail, Phone, ShieldCheck } from 'lucide-react';

const TempPasswordModal = ({ isOpen, onClose, locataire, motDePasseEphemere }) => {
  const [copie, setCopie] = useState(false);

  if (!isOpen || !locataire) return null;

  const texteAcces = `🔑 Accès MOVO Locataire
----------------------------
Nom : ${locataire.prenom} ${locataire.nom}
Email : ${locataire.email || 'N/A'}
Téléphone : ${locataire.telephone || 'N/A'}
Mot de passe temporaire : ${motDePasseEphemere}
----------------------------
Connectez-vous sur l'application MOVO et changez votre mot de passe dès la première connexion.`;

  const handleCopier = async () => {
    try {
      await navigator.clipboard.writeText(texteAcces);
      setCopie(true);
      setTimeout(() => setCopie(false), 3000);
    } catch {
      // fallback pour les navigateurs sans clipboard API
      const el = document.createElement('textarea');
      el.value = texteAcces;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopie(true);
      setTimeout(() => setCopie(false), 3000);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '480px',
          width: '90%',
          borderRadius: '20px',
          padding: 0,
          overflow: 'hidden',
          background: '#FFFFFF',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        {/* En-tête vert */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F322B 0%, #1B5E4F 100%)',
            padding: '28px 28px 24px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <X size={16} />
          </button>

          <div
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle size={36} color="#73BA7C" />
          </div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: 700 }}>
            Compte locataire créé !
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: '13px' }}>
            Transmettez les accès ci-dessous au locataire
          </p>
        </div>

        {/* Corps */}
        <div style={{ padding: '24px 28px' }}>

          {/* Infos locataire */}
          <div
            style={{
              background: '#F8FFFE',
              border: '1.5px solid #D1FAE5',
              borderRadius: '14px',
              padding: '16px 18px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <User size={16} color="#0F322B" />
              <span style={{ fontWeight: 700, color: '#0F322B', fontSize: '14px' }}>
                {locataire.prenom} {locataire.nom}
              </span>
            </div>

            {locataire.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Mail size={14} color="#64748B" />
                <span style={{ fontSize: '13px', color: '#475569' }}>{locataire.email}</span>
              </div>
            )}

            {locataire.telephone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Phone size={14} color="#64748B" />
                <span style={{ fontSize: '13px', color: '#475569' }}>{locataire.telephone}</span>
              </div>
            )}
          </div>

          {/* Mot de passe éphémère */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
              Mot de passe temporaire
            </p>
            <div
              style={{
                background: '#FFF9EC',
                border: '2px solid #F49E00',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <KeyRound size={20} color="#F49E00" />
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#0F322B',
                    letterSpacing: '2px',
                  }}
                >
                  {motDePasseEphemere}
                </span>
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <div
            style={{
              background: '#FFF3CD',
              border: '1px solid #FCD34D',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={16} color="#92400E" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: '12px', color: '#78350F', margin: 0, lineHeight: '18px' }}>
              Ce mot de passe est <strong>temporaire</strong>. Le locataire sera invité à le changer dès sa première connexion sur l'application MOVO Locataire.
            </p>
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCopier}
              style={{
                flex: 1,
                background: copie ? '#10B981' : '#0F322B',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.3s',
              }}
            >
              {copie ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copie ? 'Copié !' : 'Copier les accès'}
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: '#F1F5F9',
                color: '#0F322B',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempPasswordModal;
