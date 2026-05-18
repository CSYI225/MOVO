import React, { useState, useMemo } from 'react';
import { X, Search as SearchIcon, ChevronDown } from 'lucide-react';
import { tenants, allPlatformUsers } from '../../data/mockData';

const TenantSelectionModal = ({ isOpen, onClose, onSelect, onManualAdd, title = "Sélectionner un locataire" }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    // We search through ALL platform users, not just current ones
    const source = allPlatformUsers && allPlatformUsers.length > 0 ? allPlatformUsers : tenants;
    
    return (source || []).map(u => {
      // Check if user is already in our tenants list and assigned
      const existingTenant = tenants.find(t => t.id === u.id);
      const isAssigned = existingTenant ? !!existingTenant.property : false;
      return { ...u, isAssigned, currentProp: existingTenant?.property };
    }).filter(t =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone?.includes(searchTerm)
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content report-detail-modal-v2 tenant-select-modal-v2">
        <div className="modal-header-v2">
          <h2>{title}</h2>
          <button className="btn-close-v2" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body-selection">
          <div className="search-box-modal-v2">
            <SearchIcon size={18} color="#0F322B" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone (Global)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="tenants-list-selection-v2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className={`tenant-select-item-v2 ${user.isAssigned ? 'item-disabled' : ''}`}
                  onClick={() => !user.isAssigned && onSelect(user)}
                >
                  <div className="avatar-v2">{user.initials || user.name.charAt(0)}</div>
                  <div className="item-info-v2">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    {user.isAssigned && <span className="status-indicator-mini" style={{ color: '#F59E0B', fontSize: '11px', fontWeight: 600 }}>Déjà occupé ({user.currentProp})</span>}
                  </div>
                  {!user.isAssigned && <ChevronDown size={18} color="#0F322B" style={{ transform: 'rotate(-90deg)', marginLeft: 'auto' }} />}
                </div>
              ))
            ) : (
              <div className="empty-state-modal-v2">
                <p>Aucun profil trouvé sur la plateforme.</p>
                <button className="btn-manual-add" onClick={onManualAdd}>
                  Créer un nouveau profil manuellement
                </button>
              </div>
            )}
          </div>
          
          <div className="modal-selection-footer">
             <button className="btn-text-manual" onClick={onManualAdd}>
                Le locataire n'est pas sur la plateforme ? Ajouter manuellement
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSelectionModal;
