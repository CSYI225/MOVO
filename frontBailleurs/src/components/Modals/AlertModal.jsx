import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, message, title = "Information", type = "warning" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
      case 'warning':
        return <AlertTriangle size={28} color="#EF4444" />;
      case 'success':
        return <CheckCircle size={28} color="#10B981" />;
      default:
        return <Info size={28} color="#3B82F6" />;
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(3px)' }}>
      <div 
        className="modal-content"
        style={{
          width: '90%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: type === 'error' || type === 'warning' ? '#FEE2E2' : type === 'success' ? '#D1FAE5' : '#DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          {getIcon()}
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
          {title}
        </h3>

        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', marginBottom: '24px' }}>
          {message}
        </p>

        <button 
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0F322B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Compris
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
