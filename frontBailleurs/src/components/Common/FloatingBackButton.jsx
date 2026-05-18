import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './FloatingBackButton.css';

const FloatingBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on dashboard (it's the home page)
  if (location.pathname === '/dashboard') return null;

  return (
    <button 
      className="floating-back-btn" 
      onClick={() => navigate(-1)}
      title="Retour"
    >
      <ArrowLeft size={24} />
    </button>
  );
};

export default FloatingBackButton;
