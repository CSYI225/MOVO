import React from 'react';
import { X, Hash, DollarSign } from 'lucide-react';

const UnitModal = ({ isOpen, onClose, initialData = null }) => {
  const [unitType, setUnitType] = React.useState('Studio');
  
  React.useEffect(() => {
    if (initialData) {
      // If it's not a studio, we treat it as an apartment for the dropdown
      setUnitType(initialData.type === 'Studio' ? 'Studio' : 'Appartement');
    } else {
      setUnitType('Studio');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  return (
    <div className="modal-overlay">
      <div className="modal-content report-detail-modal-v2 add-property-modal-v2">
        <div className="modal-header-v2">
          <h2>{isEdit ? "Modifier l'unité" : 'Ajouter un nouvel appartement'}</h2>
          <button className="btn-close-v2" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form className="modal-body-v2" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div className="form-sections-v2">
            <div className="form-grid-v2">
              <div className="form-group-v2">
                <label>Numéro d'appartement</label>
                <div className="input-with-icon-v2">
                  <Hash size={18} />
                  <input 
                    type="text" 
                    placeholder="ex: A101" 
                    defaultValue={initialData?.number || ''}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group-v2">
                <label>Type d'unité</label>
                <div className="select-wrapper-v2">
                   <select 
                    value={unitType} 
                    onChange={(e) => setUnitType(e.target.value)}
                    required
                   >
                    <option value="Studio">Studio</option>
                    <option value="Appartement">Appartement</option>
                  </select>
                </div>
              </div>

              {unitType === 'Appartement' && (
                <div className="form-group-v2">
                  <label>Nombre de pièces</label>
                  <input 
                    type="number" 
                    placeholder="ex: 3" 
                    defaultValue={initialData?.rooms || (initialData?.type ? parseInt(initialData.type) : '') || ''}
                    required 
                  />
                </div>
              )}

              <div className="form-group-v2 full-width">
                <label>Loyer mensuel</label>
                <div className="input-with-icon-v2">
                  <DollarSign size={18} />
                  <input 
                    type="text" 
                    placeholder="ex: 75,000 FCFA" 
                    defaultValue={initialData?.price || ''}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-info-card-v2">
               <p>Note: Cet appartement sera rattaché à l'immeuble actuel. Le statut sera défini sur <strong>Vacant</strong> par défaut.</p>
            </div>
          </div>

          <div className="modal-footer-v2">
            <button type="button" className="btn-cancel-v2" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save-v2">
              {isEdit ? 'Mettre à jour' : 'Ajouter le logement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitModal;
