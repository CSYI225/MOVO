import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, ChevronDown, Loader } from 'lucide-react';

const TenantSelectionModal = ({ isOpen, onClose, onSelect, onManualAdd, title = "Sélectionner un locataire", token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const authToken = token || localStorage.getItem('movo_bailleur_token');

  // Recherche automatique dès l'ouverture et à chaque frappe
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const qParam = searchTerm.trim();
        const response = await fetch(
          `http://localhost:5000/api/locataires/recherche?q=${encodeURIComponent(qParam)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        setResults(data.locataires || []);
      } catch (err) {
        console.error('Erreur de recherche :', err);
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, authToken]);

  // Réinitialiser à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      setSearched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

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
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {loading && <Loader size={16} color="#0F322B" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
          </div>

          <div className="tenants-list-selection-v2">
            {/* Chargement */}
            {loading && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                Chargement des locataires...
              </div>
            )}

            {/* Résultats trouvés */}
            {!loading && results.length > 0 && (
              results.map(user => (
                <div
                  key={user.id}
                  className="tenant-select-item-v2"
                  onClick={() => onSelect(user)}
                >
                  <div className="avatar-v2">{getInitials(user.name)}</div>
                  <div className="item-info-v2">
                    <h4>{user.name}</h4>
                    <p>{user.email || user.telephone}</p>
                  </div>
                  <ChevronDown size={18} color="#0F322B" style={{ transform: 'rotate(-90deg)', marginLeft: 'auto' }} />
                </div>
              ))
            )}

            {/* Aucun résultat */}
            {!loading && searched && results.length === 0 && (
              <div className="empty-state-modal-v2" style={{ padding: '28px 20px', textAlign: 'center' }}>
                <p style={{ color: '#64748B', marginBottom: '12px', fontSize: '14px', fontWeight: 500 }}>
                  Aucun profil trouvé sur la plateforme {searchTerm ? `pour « ${searchTerm} »` : ''}.
                </p>
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

