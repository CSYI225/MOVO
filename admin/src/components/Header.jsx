import React from 'react';
import { ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
  const { admin } = useAuth();

  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="header-actions">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#E8F5E9', padding: '6px 14px', borderRadius: '20px',
          color: '#0F322B', fontSize: '13px', fontWeight: '700'
        }}>
          <ShieldCheck size={16} color="#10B981" />
          <span>Accès Système Réseau Securisé</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
