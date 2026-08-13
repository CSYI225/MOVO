import React, { useState } from 'react';
import { X, Home, Building, Hash, CheckCircle } from 'lucide-react';

const PropertySelectionModal = ({ isOpen, onClose, onConfirm, tenantName, fixedPropertyId = null, properties = [] }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(fixedPropertyId || null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [occupancyDate, setOccupancyDate] = useState(new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedPropertyId(fixedPropertyId || null);
      setSelectedUnitId(null);
      setOccupancyDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, fixedPropertyId]);

  if (!isOpen) return null;

  const selectedProperty = (properties || []).find(p => String(p.id) === String(selectedPropertyId));
  const isImmeuble = selectedProperty?.type === 'Immeuble';
  const availableUnits = isImmeuble
    ? (selectedProperty?.units || []).filter(u => !u.tenantId)
    : [];

  const handleConfirm = () => {
    if (!selectedProperty) return;
    if (isImmeuble && !selectedUnitId) {
      alert("Veuillez sélectionner une unité pour cet immeuble.");
      return;
    }
    const selectedUnit = isImmeuble
      ? selectedProperty.units.find(u => u.id === selectedUnitId)
      : null;
    onConfirm(selectedProperty, selectedUnit, occupancyDate);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content report-detail-modal-v2 add-property-modal-v2" style={{ maxWidth: '500px' }}>
        <div className="modal-header-v2">
          <h2>Associer un logement</h2>
          <button className="btn-close-v2" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body-v2" style={{ padding: '20px' }}>
          {tenantName && (
            <div className="form-info-card-v2" style={{ marginBottom: '16px' }}>
              <p>Sélectionnez le bien à assigner à <strong>{tenantName}</strong>.</p>
            </div>
          )}

          {/* Property list */}
          {!fixedPropertyId && <p style={{ fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>Mes biens</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', marginBottom: '20px' }}>
            {properties
              .filter(p => fixedPropertyId ? p.id === fixedPropertyId : true)
              .map(p => {
                const isOccupied = p.type !== 'Immeuble' && (p.status === 'Occupé' || (p.currentTenants && p.currentTenants.length > 0) || (p.occupants && p.occupants > 0));
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (isOccupied) return;
                      if (!fixedPropertyId) {
                        setSelectedPropertyId(p.id);
                        setSelectedUnitId(null);
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px',
                      border: `2px solid ${selectedPropertyId === p.id ? '#0F322B' : '#E5E7EB'}`,
                      borderRadius: '12px',
                      cursor: isOccupied ? 'not-allowed' : (fixedPropertyId ? 'default' : 'pointer'),
                      background: selectedPropertyId === p.id ? '#F0FAF1' : (isOccupied ? '#F9FAFB' : 'white'),
                      opacity: isOccupied ? 0.6 : 1,
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.type === 'Immeuble' ? <Building size={18} color="#F49E00" /> : <Home size={18} color="#F49E00" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: isOccupied ? '#94A3B8' : '#1A1A1A', margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{p.type} · {p.location} {isOccupied ? '· (Occupé)' : ''}</p>
                    </div>
                    {isOccupied && <span style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444', background: '#FEF2F2', padding: '2px 8px', borderRadius: '12px' }}>Occupé</span>}
                    {!isOccupied && selectedPropertyId === p.id && <CheckCircle size={18} color="#0F322B" />}
                  </div>
                );
              })}
          </div>

          {/* Unit selection for Immeuble */}
          {isImmeuble && (
            <>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>Unité disponible</p>
              {availableUnits.length === 0 ? (
                <div className="form-info-card-v2">
                  <p>Toutes les unités de cet immeuble sont occupées.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {availableUnits.map(unit => (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 16px', border: `2px solid ${selectedUnitId === unit.id ? '#0F322B' : '#E5E7EB'}`,
                        borderRadius: '10px', cursor: 'pointer', background: selectedUnitId === unit.id ? '#F0FAF1' : 'white',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Hash size={16} color="#666" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{unit.number}</p>
                        <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{unit.type} · {unit.price}</p>
                      </div>
                      {selectedUnitId === unit.id && <CheckCircle size={16} color="#0F322B" />}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>Date d'arrivée</p>
            <input 
              type="date" 
              value={occupancyDate}
              onChange={(e) => setOccupancyDate(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '14px' }}
            />
          </div>
        </div>

        <div className="modal-footer-v2">
          <button type="button" className="btn-cancel-v2" onClick={onClose}>Annuler</button>
          <button
            type="button"
            className="btn-save-v2"
            onClick={handleConfirm}
            disabled={!selectedPropertyId || (isImmeuble && !selectedUnitId)}
          >
            Confirmer l'association
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertySelectionModal;
