import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, title = "Attention" }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="modal-content mini-modal">
        <div className="modal-header-centered">
          <AlertCircle size={40} color="#F59E0B" style={{ marginBottom: '16px' }} />
          <h3>{title}</h3>
        </div>
        <p>{message}</p>
        <div className="mini-modal-actions">
          <button className="btn-mini-cancel" onClick={onClose}>Non</button>
          <button className="btn-mini-confirm" onClick={onConfirm}>Oui</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
