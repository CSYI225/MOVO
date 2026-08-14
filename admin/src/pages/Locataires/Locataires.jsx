import React, { useEffect, useState } from 'react';
import { Search, UserCheck, ShieldCheck, Star } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

const Locataires = () => {
  const { admin, API_URL } = useAuth();
  const [locataires, setLocataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLocataires = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/locataires?q=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLocataires(data.locataires || []);
      }
    } catch (err) {
      console.error('Erreur liste locataires :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocataires();
  }, [searchTerm]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Gestion des Locataires" />

      <div className="content-container">
        {/* Barre d'outils */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 14px', width: '360px', height: '44px' }}>
            <Search size={18} color="#64748B" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Rechercher nom, prénom, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Table des locataires */}
        <div className="card-box" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nom & Prénom</th>
                  <th>Contacts</th>
                  <th>Identité / CNI</th>
                  <th>Avis Recus</th>
                  <th>Statut Compte</th>
                  <th>Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Chargement des locataires...</td>
                  </tr>
                ) : locataires.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>Aucun locataire trouvé.</td>
                  </tr>
                ) : (
                  locataires.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0F322B' }}>{l.nomComplet}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: '#0F172A' }}>{l.email || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{l.telephone || 'N/A'}</div>
                      </td>
                      <td>
                        {l.pieceVerifiee ? (
                          <span className="badge-status badge-active">
                            <ShieldCheck size={14} /> Pièce Vérifiée
                          </span>
                        ) : (
                          <span className="badge-status badge-pending">Non Vérifié</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                          <Star size={16} color="#F59A23" fill="#F59A23" />
                          <span>{l.reviewCount} avis</span>
                        </div>
                      </td>
                      <td>
                        {l.estActif ? (
                          <span className="badge-status badge-active">Actif</span>
                        ) : (
                          <span className="badge-status badge-inactive">Désactivé</span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748B' }}>
                        {new Date(l.creeLe).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locataires;
