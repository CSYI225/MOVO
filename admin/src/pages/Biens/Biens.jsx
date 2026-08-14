import React, { useEffect, useState } from 'react';
import { Building2, MapPin, User, DoorClosed } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

const Biens = () => {
  const { admin, API_URL } = useAuth();
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBiens = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/biens`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBiens(data.biens || []);
      }
    } catch (err) {
      console.error('Erreur liste biens admin :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiens();
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Patrimoine Immobilier" />

      <div className="content-container">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F322B' }}>Ensemble des Biens de la Plateforme</h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>Consultez la liste des immeubles, villas et appartements enregistrés par les bailleurs</p>
        </div>

        <div className="card-box" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bien Immobilier</th>
                  <th>Type & Emplacement</th>
                  <th>Bailleur Propriétaire</th>
                  <th>Lots / Unités</th>
                  <th>Date de Création</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Chargement des biens...</td>
                  </tr>
                ) : biens.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>Aucun bien enregistré.</td>
                  </tr>
                ) : (
                  biens.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {b.photo ? (
                            <img src={b.photo} alt={b.nom} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#E8F5E9', color: '#0F322B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Building2 size={22} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: '700', color: '#0F322B' }}>{b.nom}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{b.nombrePieces ? `${b.nombrePieces} pièces` : 'Bâtiment'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{b.type || 'Appartement'}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          <span>{b.adresse ? `${b.adresse}, ${b.ville}` : b.ville || 'Côte d\'Ivoire'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F322B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} color="#64748B" />
                          <span>{b.bailleurNom}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#0F322B' }}>
                          <DoorClosed size={16} color="#84B889" />
                          <span>{b.nombreEspaces} lot(s)</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748B' }}>
                        {new Date(b.creeLe).toLocaleDateString('fr-FR')}
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

export default Biens;
