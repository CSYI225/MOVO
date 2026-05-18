import React from 'react';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';

const ManualTenantModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content report-detail-modal-v2 add-property-modal-v2">
        <div className="modal-header-v2">
          <h2>Ajouter un nouveau locataire</h2>
          <button className="btn-close-v2" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form className="modal-body-v2" onSubmit={(e) => { 
          e.preventDefault(); 
          const formData = new FormData(e.target);
          onSave({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            location: formData.get('location'),
          });
        }}>
          <div className="form-sections-v2">
            <div className="form-grid-v2">
              <div className="form-group-v2 full-width">
                <label>Nom Complet</label>
                <div className="input-with-icon-v2">
                  <User size={18} />
                  <input name="name" type="text" placeholder="ex: Jean Dupont" required />
                </div>
              </div>
              
              <div className="form-group-v2">
                <label>Email</label>
                <div className="input-with-icon-v2">
                  <Mail size={18} />
                  <input name="email" type="email" placeholder="ex: jean.dupont@email.com" required />
                </div>
              </div>
              
              <div className="form-group-v2">
                <label>Téléphone</label>
                <div className="input-with-icon-v2">
                  <Phone size={18} />
                  <input name="phone" type="tel" placeholder="ex: 01 02 03 04 05" required />
                </div>
              </div>

              <div className="form-group-v2 full-width">
                <label>Localisation actuelle</label>
                <div className="input-with-icon-v2">
                  <MapPin size={18} />
                  <input name="location" type="text" placeholder="ex: Abidjan, Cocody" />
                </div>
              </div>
            </div>

            <div className="form-info-card-v2">
               <p>Note: Ce nouveau profil sera créé sur la plateforme et pourra ensuite être assigné à vos biens.</p>
            </div>
          </div>

          <div className="modal-footer-v2">
            <button type="button" className="btn-cancel-v2" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save-v2">Créer le profil</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualTenantModal;
