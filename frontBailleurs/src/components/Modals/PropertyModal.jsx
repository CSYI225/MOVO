import React from 'react';
import { X, MapPin } from 'lucide-react';

const PropertyModal = ({ isOpen, onClose, initialData = null }) => {
  const [propertyType, setPropertyType] = React.useState(initialData?.type || 'Villa');
  
  React.useEffect(() => {
    if (initialData) {
      setPropertyType(initialData.type);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  return (
    <div className="modal-overlay">
      <div className="modal-content report-detail-modal-v2 add-property-modal-v2">
        <div className="modal-header-v2">
          <h2>{isEdit ? 'Modifier le bien' : 'Enregistrer un nouveau bien'}</h2>
          <button className="btn-close-v2" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form className="modal-body-v2" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div className="form-sections-v2">
            <div className="form-grid-v2">
              <div className="form-group-v2 full-width">
                <label>Nom du bien / Résidence</label>
                <input 
                  type="text" 
                  placeholder="ex: Résidence Les Palmiers" 
                  defaultValue={initialData?.name || ''}
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
                    defaultValue={initialData?.location || ''}
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
                    defaultValue={initialData?.price || ''}
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
                    defaultValue={initialData?.rooms || ''}
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
