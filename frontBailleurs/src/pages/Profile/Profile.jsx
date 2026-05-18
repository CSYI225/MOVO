import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Lock, Star, Edit3, Save } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="profile-page-container">
      <div className="profile-header-banner">
        <div className="profile-main-info">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">CS</div>
            {isEditing && (
              <button className="edit-avatar-btn">
                <Camera size={16} />
              </button>
            )}
          </div>
          <div className="profile-text-info">
            <h1>Coulibaly Sékou</h1>
            <p className="profile-subtitle">Bailleur Certifié • Membre depuis Janvier 2024</p>
            <div className="rating-badge-profile">
              <Star size={14} fill="#73BA7C" color="#73BA7C" />
              <span>4,7 / 5</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-main-column">
        <div className="profile-section-card">
          <div className="section-card-header">
            <User size={20} className="section-icon" />
            <h3>Informations du compte</h3>
          </div>
          <div className={`profile-form-grid ${!isEditing ? 'readonly' : ''}`}>
            <div className="form-group">
              <label>Nom complet</label>
              <div className="input-with-icon">
                <User size={18} />
                <input type="text" defaultValue="Coulibaly Sékou" readOnly={!isEditing} />
              </div>
            </div>
            <div className="form-group">
              <label>Adresse Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input type="email" defaultValue="sekou.coulibaly@email.com" readOnly={!isEditing} />
              </div>
            </div>
            <div className="form-group">
              <label>Numéro de Téléphone</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input type="tel" defaultValue="+225 07 08 09 10 11" readOnly={!isEditing} />
              </div>
            </div>
            <div className="form-group">
              <label>Adresse</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input type="text" defaultValue="Abidjan, Côte d'Ivoire" readOnly={!isEditing} />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Mot de passe</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input type="password" defaultValue="********" readOnly={!isEditing} />
              </div>
            </div>
          </div>

          <div className="profile-actions-footer">
            <button 
              className={`btn-edit-profile ${isEditing ? 'btn-save' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save size={18} />
                  <span>Enregistrer les modifications</span>
                </>
              ) : (
                <>
                  <Edit3 size={18} />
                  <span>Modifier le profil</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
