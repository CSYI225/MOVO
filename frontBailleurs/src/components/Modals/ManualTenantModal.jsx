import React, { useState, useMemo } from 'react';
import { X, User, Mail, Phone, MapPin, Camera, Home, Building, Hash, CheckCircle, Loader } from 'lucide-react';

const ManualTenantModal = ({ isOpen, onClose, onSave, fixedPropertyId = null, properties = [], token }) => {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(fixedPropertyId || null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedPropertyId(fixedPropertyId || null);
      setSelectedUnitId(null);
      setPhotoPreview(null);
      setError('');
      setLoading(false);
    }
  }, [isOpen, fixedPropertyId]);

  const selectedProperty = useMemo(
    () => properties.find(p => p.id === selectedPropertyId),
    [selectedPropertyId, properties]
  );
  const isImmeuble = selectedProperty?.type === 'Immeuble';
  const availableUnits = isImmeuble
    ? (selectedProperty?.units || []).filter(u => !u.tenantId)
    : [];

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setPhotoPreview(null);
    setSelectedPropertyId(null);
    setSelectedUnitId(null);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isImmeuble && !selectedUnitId) {
      setError('Veuillez sélectionner une unité pour cet immeuble.');
      return;
    }

    const formData = new FormData(e.target);
    const prenom = formData.get('prenom');
    const nom = formData.get('nom');
    const email = formData.get('email');
    const telephone = formData.get('telephone');

    if (!prenom || !nom) {
      setError('Le prénom et le nom sont obligatoires.');
      return;
    }

    if (!email && !telephone) {
      setError('Un email ou un numéro de téléphone est requis.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/locataires/creer-manuel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prenom, nom, email: email || undefined, telephone: telephone || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.utilisateurExistant) {
          const u = data.utilisateurExistant;
          setError(`Impossible de créer le compte : Une personne existe déjà sur la plateforme avec ces coordonnées.\nNom : ${u.name}\nEmail : ${u.email || 'N/A'}\nTéléphone : ${u.telephone || 'N/A'}`);
        } else {
          setError(data.message || 'Erreur lors de la création du locataire.');
        }
        setLoading(false);
        return;
      }

      const selectedUnit = isImmeuble
        ? selectedProperty?.units?.find(u => u.id === selectedUnitId)
        : null;

      // Si un bien est sélectionné, envoyer la demande d'assignation au backend
      if (selectedProperty) {
        try {
          const assignRes = await fetch('http://localhost:5000/api/baux/assigner', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bienId: selectedProperty.id,
              locataireId: data.locataire.id,
              prixParMois: selectedUnit?.price || selectedProperty.price ? String(selectedUnit?.price || selectedProperty.price).replace(/[^\d.]/g, '') : '0',
            }),
          });
          const assignData = await assignRes.json();
          if (!assignRes.ok) {
            console.warn('Note d\'assignation :', assignData.message);
          }
        } catch (assignErr) {
          console.error('Erreur assignation bail :', assignErr);
        }
      }

      // Appeler onSave avec les infos du locataire créé + mot de passe éphémère
      onSave({
        id: data.locataire.id,
        name: `${data.locataire.prenom} ${data.locataire.nom}`.trim(),
        prenom: data.locataire.prenom,
        nom: data.locataire.nom,
        email: data.locataire.email,
        telephone: data.locataire.telephone,
        initials: `${data.locataire.prenom?.[0] || ''}${data.locataire.nom?.[0] || ''}`.toUpperCase(),
        photo: photoPreview || null,
        location: formData.get('location'),
        occupancyDate: formData.get('occupancyDate') || new Date().toISOString().split('T')[0],
        property: selectedProperty || null,
        unit: selectedUnit || null,
        motDePasseEphemere: data.motDePasseEphemere,
      });

      setPhotoPreview(null);
      setSelectedPropertyId(null);
      setSelectedUnitId(null);
    } catch (err) {
      setError('Erreur réseau. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content report-detail-modal-v2 add-property-modal-v2" style={{ maxWidth: '560px' }}>
        <div className="modal-header-v2">
          <h2>Ajouter un nouveau locataire</h2>
          <button className="btn-close-v2" onClick={handleClose}><X size={20} /></button>
        </div>

        <form className="modal-body-v2" style={{ maxHeight: '80vh', overflowY: 'auto' }} onSubmit={handleSubmit}>
          <div className="form-sections-v2">

            {/* Photo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <label htmlFor="photo-upload-manual" style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: photoPreview ? 'transparent' : '#E8F5E9',
                  border: '2px dashed #73BA7C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', margin: '0 auto 8px'
                }}>
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Camera size={28} color="#73BA7C" />
                  }
                </div>
                <span style={{ fontSize: '12px', color: '#73BA7C', fontWeight: 600 }}>
                  {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                </span>
              </label>
              <input id="photo-upload-manual" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            {/* Tenant Info */}
            <div className="form-grid-v2">
              <div className="form-group-v2">
                <label>Prénom</label>
                <div className="input-with-icon-v2">
                  <User size={18} />
                  <input name="prenom" type="text" placeholder="ex: Jean" required />
                </div>
              </div>
              <div className="form-group-v2">
                <label>Nom</label>
                <div className="input-with-icon-v2">
                  <User size={18} />
                  <input name="nom" type="text" placeholder="ex: Dupont" required />
                </div>
              </div>
              <div className="form-group-v2">
                <label>Email <span style={{ color: '#94A3B8', fontWeight: 400 }}>(ou téléphone)</span></label>
                <div className="input-with-icon-v2">
                  <Mail size={18} />
                  <input name="email" type="email" placeholder="ex: jean.dupont@email.com" />
                </div>
              </div>
              <div className="form-group-v2">
                <label>Téléphone <span style={{ color: '#94A3B8', fontWeight: 400 }}>(ou email)</span></label>
                <div className="input-with-icon-v2">
                  <Phone size={18} />
                  <input name="telephone" type="tel" placeholder="ex: +225 07 00 00 00 00" />
                </div>
              </div>
              <div className="form-group-v2">
                <label>Localisation actuelle</label>
                <div className="input-with-icon-v2">
                  <MapPin size={18} />
                  <input name="location" type="text" placeholder="ex: Abidjan, Cocody" />
                </div>
              </div>
              <div className="form-group-v2">
                <label>Date d'arrivée</label>
                <div className="input-with-icon-v2">
                  <input name="occupancyDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                color: '#DC2626', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Property Association */}
            {properties.length > 0 && (
              <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: '20px', marginTop: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F322B', marginBottom: '12px' }}>
                  Associer à un bien <span style={{ color: '#999', fontWeight: 400 }}>(optionnel)</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
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
                              setSelectedPropertyId(p.id === selectedPropertyId ? null : p.id);
                              setSelectedUnitId(null);
                            }
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px',
                            border: `2px solid ${selectedPropertyId === p.id ? '#0F322B' : '#E5E7EB'}`,
                            borderRadius: '10px',
                            cursor: isOccupied ? 'not-allowed' : (fixedPropertyId ? 'default' : 'pointer'),
                            background: selectedPropertyId === p.id ? '#F0FAF1' : (isOccupied ? '#F9FAFB' : 'white'),
                            opacity: isOccupied ? 0.6 : 1,
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {p.type === 'Immeuble' ? <Building size={16} color="#F49E00" /> : <Home size={16} color="#F49E00" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '13px', color: isOccupied ? '#94A3B8' : '#1A1A1A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                            <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{p.type} · {p.location} {isOccupied ? '· (Occupé)' : ''}</p>
                          </div>
                          {isOccupied && <span style={{ fontSize: '11px', fontWeight: 600, color: '#EF4444', background: '#FEF2F2', padding: '2px 8px', borderRadius: '12px' }}>Occupé</span>}
                          {!isOccupied && selectedPropertyId === p.id && <CheckCircle size={16} color="#0F322B" />}
                        </div>
                      );
                    })}
                </div>

                {/* Unit selection for Immeuble */}
                {isImmeuble && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F322B', marginBottom: '10px' }}>
                      Unité disponible <span style={{ color: '#EF4444', fontWeight: 400 }}>(requise)</span>
                    </p>
                    {availableUnits.length === 0 ? (
                      <div className="form-info-card-v2">
                        <p>Toutes les unités de cet immeuble sont occupées.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                        {availableUnits.map(unit => (
                          <div
                            key={unit.id}
                            onClick={() => setSelectedUnitId(unit.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '8px 14px',
                              border: `2px solid ${selectedUnitId === unit.id ? '#0F322B' : '#E5E7EB'}`,
                              borderRadius: '8px', cursor: 'pointer',
                              background: selectedUnitId === unit.id ? '#F0FAF1' : 'white',
                              transition: 'all 0.15s'
                            }}
                          >
                            <Hash size={14} color="#666" />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>{unit.number}</p>
                              <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{unit.type} · {unit.price}</p>
                            </div>
                            {selectedUnitId === unit.id && <CheckCircle size={14} color="#0F322B" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="modal-footer-v2" style={{ marginTop: '20px' }}>
            <button type="button" className="btn-cancel-v2" onClick={handleClose}>Annuler</button>
            <button
              type="submit"
              className="btn-save-v2"
              disabled={loading || (isImmeuble && !selectedUnitId)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Création en cours...' : 'Créer le compte locataire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualTenantModal;
