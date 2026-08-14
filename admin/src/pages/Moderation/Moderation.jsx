import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, FileText, Star, Eye } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

const Moderation = () => {
  const { admin, API_URL } = useAuth();
  const [contestations, setContestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContestation, setSelectedContestation] = useState(null);
  const [noteResolution, setNoteResolution] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchContestations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/contestations`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setContestations(data.contestations || []);
      }
    } catch (err) {
      console.error('Erreur contestations admin :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestations();
  }, []);

  const handleArbitrer = async (id, action) => {
    try {
      setProcessing(true);
      const res = await fetch(`${API_URL}/admin/contestations/${id}/arbitrer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify({ action, noteResolution }),
      });
      setProcessing(false);

      if (res.ok) {
        setSelectedContestation(null);
        setNoteResolution('');
        fetchContestations();
      }
    } catch (err) {
      setProcessing(false);
      console.error('Erreur arbitrage contestation :', err);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Modération & Arbitrage des Contestations" />

      <div className="content-container">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F322B' }}>Contestations d'Avis Dépôtées par les Locataires</h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>Examinez les preuves soumises par les locataires et arbitrez la validité des avis de bailleurs</p>
        </div>

        <div className="card-box" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Locataire Plaignant</th>
                  <th>Avis Contesté</th>
                  <th>Motif de la Contestation</th>
                  <th>Statut</th>
                  <th>Date Soumission</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Chargement des contestations...</td>
                  </tr>
                ) : contestations.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>Aucune contestation enregistrée.</td>
                  </tr>
                ) : (
                  contestations.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0F322B' }}>{c.plaignantNom}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#D97706' }}>
                          <Star size={14} fill="#F59A23" color="#F59A23" />
                          <span>{c.noteAvis}/5 par {c.auteurAvisNom}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{c.commentaireAvis}"
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: '#0F172A', maxWidth: '280px' }}>
                          {c.raison}
                        </div>
                      </td>
                      <td>
                        {c.statut === 'en_attente' && (
                          <span className="badge-status badge-pending">
                            <AlertTriangle size={12} /> En Attente
                          </span>
                        )}
                        {c.statut === 'resolu_valide' && (
                          <span className="badge-status badge-active">
                            <CheckCircle size={12} /> Approuvée (Avis Masqué)
                          </span>
                        )}
                        {c.statut === 'resolu_rejete' && (
                          <span className="badge-status badge-inactive">
                            <XCircle size={12} /> Rejetée
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748B' }}>
                        {new Date(c.soumisLe).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <button className="btn-secondary" onClick={() => setSelectedContestation(c)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Eye size={16} />
                          <span>Examiner</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal d'examen & arbitrage */}
      {selectedContestation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ background: '#0F322B', padding: '20px 24px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Arbitrage de Contestation</h3>
              <button onClick={() => setSelectedContestation(null)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ backgroundColor: '#FFF9EC', border: '1.5px solid #FCD34D', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#B45309', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Avis déposé par le bailleur ({selectedContestation.auteurAvisNom})
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F322B', marginBottom: '4px' }}>
                  Note : {selectedContestation.noteAvis}/5
                </div>
                <div style={{ fontSize: '14px', color: '#334155', fontStyle: 'italic' }}>
                  "{selectedContestation.commentaireAvis}"
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F322B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Motif de la contestation ({selectedContestation.plaignantNom})
                </div>
                <div style={{ fontSize: '14px', color: '#0F172A', lineHeight: '20px' }}>
                  {selectedContestation.raison}
                </div>

                {selectedContestation.piecesJointes.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>Preuves jointes :</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedContestation.piecesJointes.map((p) => (
                        <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#3B82F6', textDecoration: 'none', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
                          <FileText size={14} />
                          <span>{p.nom}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedContestation.statut === 'en_attente' ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F322B', marginBottom: '6px' }}>Note / Justification de la décision d'arbitrage (Optionnel)</label>
                    <textarea
                      placeholder="Ex: Avis masqué suite aux preuves bancaires de paiement à jour fournies par le locataire."
                      value={noteResolution}
                      onChange={(e) => setNoteResolution(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-primary" disabled={processing} onClick={() => handleArbitrer(selectedContestation.id, 'approuver')} style={{ flex: 1, justifyContent: 'center', backgroundColor: '#10B981' }}>
                      <CheckCircle size={18} />
                      <span>Approuver & Masquer l'Avis</span>
                    </button>
                    <button className="btn-danger" disabled={processing} onClick={() => handleArbitrer(selectedContestation.id, 'rejeter')} style={{ flex: 1, justifyContent: 'center' }}>
                      <XCircle size={18} />
                      <span>Rejeter la Contestation</span>
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#F1F5F9', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                  Cette contestation a déjà été arbitrée ({selectedContestation.statut}).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;
