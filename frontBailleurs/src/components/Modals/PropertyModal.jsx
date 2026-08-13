import React from 'react';
import { X, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PropertyModal = ({ isOpen, onClose, initialData = null, onSave }) => {
  const { user, API_URL, fetchMesBiens } = useAuth();
  const [propertyType, setPropertyType] = React.useState(initialData?.type || 'Villa');
  const [name, setName] = React.useState(initialData?.name || initialData?.nom || '');
  const [location, setLocation] = React.useState(initialData?.location || initialData?.adresse || '');
  const [ville, setVille] = React.useState(initialData?.ville || '');
  const [price, setPrice] = React.useState(initialData?.price || '');
  const [rooms, setRooms] = React.useState(initialData?.rooms || initialData?.nombrePieces || '');
  const [photoFile, setPhotoFile] = React.useState(null);
  const [photoPreview, setPhotoPreview] = React.useState(initialData?.photo || initialData?.image || null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setPropertyType(initialData?.type || 'Villa');
      setName(initialData?.name || initialData?.nom || '');
      setLocation(initialData?.location || initialData?.adresse || '');
      setVille(initialData?.ville || '');
      setPrice(initialData?.price || '');
      setRooms(initialData?.rooms || initialData?.nombrePieces || '');
      setPhotoFile(null);
      setPhotoPreview(initialData?.photo || initialData?.image || null);
      setError('');
      setLoading(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = !!initialData;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = user?.token || localStorage.getItem('movo_bailleur_token');
      const prixNum = price ? parseFloat(price.toString().replace(/[^\d.]/g, '')) : null;

      const formData = new FormData();
      formData.append('nom', name);
      formData.append('type', propertyType);
      formData.append('adresse', location);
      formData.append('ville', ville || 'Abidjan');
      if (prixNum) formData.append('prixParMois', String(prixNum));
      formData.append('codeDevise', 'XOF');
      if (rooms) formData.append('nombrePieces', String(rooms));
      if (photoFile) formData.append('photo', photoFile);

      const url = isEdit ? `${API_URL}/biens/${initialData.id}` : `${API_URL}/biens`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'enregistrement du bien.');
      }

      // Recharger les biens depuis le backend
      if (fetchMesBiens) {
        await fetchMesBiens(token, user?.id);
      }

      if (onSave) onSave();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content report-detail-modal-v2 add-property-modal-v2">
        <div className="modal-header-v2">
          <h2>{isEdit ? 'Modifier le bien' : 'Enregistrer un nouveau bien'}</h2>
          <button className="btn-close-v2" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form className="modal-body-v2" onSubmit={handleSubmit}>
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
                <label>Adresse complète</label>
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
                <label>Ville</label>
                <input 
                  type="text" 
                  placeholder="ex: Abidjan" 
                  value={ville}
                  onChange={e => setVille(e.target.value)}
                />
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
                    placeholder="ex: 350000" 
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
                  />
                </div>
              )}

              <div className="form-group-v2 full-width">
                <label>Photo du bien (depuis votre appareil)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ fontSize: '13px' }}
                />
                {photoPreview && (
                  <div style={{ marginTop: '8px', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <img src={photoPreview} alt="Aperçu du bien" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px', padding: '8px 12px', background: '#FEF2F2', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <div className="form-info-card-v2">
               <p>Note: Le statut du bien sera automatiquement défini sur <strong>Vacant</strong> par défaut.</p>
            </div>
          </div>

          <div className="modal-footer-v2">
            <button type="button" className="btn-cancel-v2" onClick={onClose} disabled={loading}>Annuler</button>
            <button type="submit" className="btn-save-v2" disabled={loading}>
              {loading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Enregistrer le bien')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;

