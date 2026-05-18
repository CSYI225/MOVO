import React from 'react';
import { X, Hash, DollarSign } from 'lucide-react';
import { properties } from '../../data/mockData';

const UnitModal = ({ isOpen, onClose, initialData = null, propertyId, onSave }) => {
  const [unitType, setUnitType] = React.useState('Studio');
  const [number, setNumber] = React.useState('');
  const [rooms, setRooms] = React.useState('');
  const [price, setPrice] = React.useState('');
  
  React.useEffect(() => {
    if (initialData) {
      setUnitType(initialData.type === 'Studio' ? 'Studio' : 'Appartement');
      setNumber(initialData.number);
      setRooms(initialData.type !== 'Studio' ? parseInt(initialData.type) : '');
      setPrice(initialData.price);
    } else {
      setUnitType('Studio');
      setNumber('');
      setRooms('');
      setPrice('');
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
        
        <form className="modal-body-v2" onSubmit={(e) => { 
          e.preventDefault();
          const property = properties.find(p => p.id === propertyId);
          if (property && property.units) {
             const actualType = unitType === 'Studio' ? 'Studio' : `${rooms} pièces`;
             if (initialData) {
               const index = property.units.findIndex(u => u.id === initialData.id);
               if (index !== -1) {
                 property.units[index] = { ...property.units[index], number, type: actualType, price };
               }
             } else {
               property.units.push({
                 id: Date.now(),
                 number,
                 type: actualType,
                 price,
                 tenantId: null,
                 history: []
               });
             }
          }
          if (onSave) onSave();
          onClose(); 
        }}>
          <div className="form-sections-v2">
            <div className="form-grid-v2">
              <div className="form-group-v2">
                <label>Numéro d'appartement</label>
                <div className="input-with-icon-v2">
                  <Hash size={18} />
                  <input 
                    type="text" 
                    placeholder="ex: A101" 
                    value={number}
                    onChange={e => setNumber(e.target.value)}
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
                    value={rooms}
                    onChange={e => setRooms(e.target.value)}
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
                    value={price}
                    onChange={e => setPrice(e.target.value)}
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
