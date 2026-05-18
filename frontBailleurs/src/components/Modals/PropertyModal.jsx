import React from 'react';
import { X, MapPin } from 'lucide-react';
import { properties } from '../../data/mockData';

const PropertyModal = ({ isOpen, onClose, initialData = null, onSave }) => {
  const [propertyType, setPropertyType] = React.useState(initialData?.type || 'Villa');
  const [name, setName] = React.useState(initialData?.name || '');
  const [location, setLocation] = React.useState(initialData?.location || '');
  const [price, setPrice] = React.useState(initialData?.price || '');
  const [rooms, setRooms] = React.useState(initialData?.rooms || '');
  
  React.useEffect(() => {
    if (isOpen) {
      setPropertyType(initialData?.type || 'Villa');
      setName(initialData?.name || '');
      setLocation(initialData?.location || '');
      setPrice(initialData?.price || '');
      setRooms(initialData?.rooms || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  return (
    <div className="modal-overlay">
      <div className="modal-content report-detail-modal-v2 add-property-modal-v2">
        <div className="modal-header-v2">
          <h2>{isEdit ? 'Modifier le bien' : 'Enregistrer un nouveau bien'}</h2>
          <button className="btn-close-v2" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form className="modal-body-v2" onSubmit={(e) => { 
          e.preventDefault();
          if (initialData) {
            const index = properties.findIndex(p => p.id === initialData.id);
            if (index !== -1) {
              const wasImmeuble = properties[index].type === 'Immeuble';
              const isNowImmeuble = propertyType === 'Immeuble';
              if (wasImmeuble && !isNowImmeuble) {
                // Clear all units and their tenants when downgrading from Immeuble
                properties[index].units = [];
                properties[index].currentTenants = [];
              }
              properties[index] = { 
                ...properties[index], 
                name, location, type: propertyType, price,
                rooms: (propertyType !== 'Immeuble' && propertyType !== 'Studio') ? rooms : undefined,
                units: isNowImmeuble ? (properties[index].units || []) : undefined
              };
            }
          } else {
            const newProperty = {
              id: Date.now(),
              name,
              location,
              type: propertyType,
              price: propertyType !== 'Immeuble' ? price : '0 FCFA',
              rooms: (propertyType !== 'Immeuble' && propertyType !== 'Studio') ? rooms : undefined,
              status: 'Vacant',
              occupants: 0,
              icon: propertyType === 'Immeuble' ? 'building' : 'home',
              currentTenants: [],
              history: [],
              units: propertyType === 'Immeuble' ? [] : undefined
            };
            properties.unshift(newProperty);
          }
          if (onSave) onSave();
          onClose(); 
        }}>
          <div className="form-sections-v2">
            <div className="form-grid-v2">
              <div className="form-group-v2 full-width">
                <label>Nom du bien / Résidence</label>
                <input 
                  type="text" 
                  placeholder="ex: Résidence Les Palmiers" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required 
                />
              </div>
              
              <div className="form-group-v2 full-width">
                <label>Adresse complète / Localisation</label>
                <div className="input-with-icon-v2">
                  <MapPin size={18} />
                  <input 
                    type="text" 
                    placeholder="ex: Cocody, Riviera 3, Rue du Lycée" 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group-v2">
                <label>Type de bien</label>
                <div className="select-wrapper-v2">
                   <select 
                    value={propertyType} 
                    onChange={(e) => setPropertyType(e.target.value)}
                    required
                   >
                    <option value="Immeuble">Immeuble</option>
                    <option value="Villa">Villa</option>
                    <option value="Studio">Studio</option>
                    <option value="Appartement">Appartement</option>
                  </select>
                </div>
              </div>

              {propertyType !== 'Immeuble' && (
                <div className="form-group-v2">
                  <label>Prix mensuel (Loyer)</label>
                  <input 
                    type="text" 
                    placeholder="ex: 350,000 FCFA" 
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required 
                  />
                </div>
              )}

              {propertyType !== 'Immeuble' && propertyType !== 'Studio' && (
                <div className="form-group-v2">
                  <label>Nombre de pièces</label>
                  <input 
                    type="number" 
                    placeholder="ex: 4" 
                    value={rooms}
                    onChange={e => setRooms(e.target.value)}
                    required 
                  />
                </div>
              )}
            </div>

            <div className="form-info-card-v2">
               <p>Note: Le statut du bien sera automatiquement défini sur <strong>Vacant</strong> par défaut.</p>
            </div>
          </div>

          <div className="modal-footer-v2">
            <button type="button" className="btn-cancel-v2" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save-v2">
              {isEdit ? 'Mettre à jour' : 'Enregistrer le bien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;
