import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-greeting">
        <h1>Bonjour, Coulibaly Sékou 👋</h1>
        <p>Voici un aperçu de votre activité aujourd'hui.</p>
      </div>
      
      <div className="header-actions">
        <button className="notification-btn">
          <Bell size={20} color="#1A1A1A" />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile-wrapper">
          <div className="user-profile" onClick={() => navigate('/profile')}>
            <div className="avatar">CS</div>
            <div className="user-info">
              <span className="user-name">Coulibaly Sékou</span>
              <span className="user-role">Bailleur</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
