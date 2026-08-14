import React, { useEffect, useState } from 'react';
import { Plus, Search, UserPlus, ToggleLeft, ToggleRight, Copy, CheckCircle, X, KeyRound, Building, Mail, Phone, User } from 'lucide-react';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

const Bailleurs = () => {
  const { admin, API_URL } = useAuth();
  const [bailleurs, setBailleurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal creation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [motDePasseTemp, setMotDePasseTemp] = useState('Bailleur2026!');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Success Modal state
  const [createdBailleur, setCreatedBailleur] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchBailleurs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/bailleurs?q=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBailleurs(data.bailleurs || []);
      }
    } catch (err) {
      console.error('Erreur liste bailleurs :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBailleurs();
  }, [searchTerm]);

  const handleToggleStatut = async (id, currentStatut) => {
    try {
      const res = await fetch(`${API_URL}/admin/bailleurs/${id}/statut`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify({ estActif: !currentStatut }),
      });
      if (res.ok) {
        fetchBailleurs();
      }
    } catch (err) {
      console.error('Erreur modification statut bailleur :', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const res = await fetch(`${API_URL}/admin/bailleurs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify({
          prenom,
          nom,
          email: email || undefined,
          telephone: telephone || undefined,
          nomEntreprise: nomEntreprise || undefined,
          motDePasseTemp,
        }),
      });

      const data = await res.json();
      setCreating(false);

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la création du bailleur.');
      }

      setIsModalOpen(false);
      setCreatedBailleur(data.bailleur);
      // Reset form
      setPrenom('');
      setNom('');
      setEmail('');
      setTelephone('');
      setNomEntreprise('');
      setMotDePasseTemp('Bailleur2026!');
      fetchBailleurs();
    } catch (err) {
      setCreating(false);
      setCreateError(err.message);
    }
  };

  const copyCredentials = async () => {
    if (!createdBailleur) return;
    const text = `🔑 ACCÈS BAILLEUR MOVO
-----------------------------
Nom : ${createdBailleur.prenom} ${createdBailleur.nom}
Email : ${createdBailleur.email || 'N/A'}
Téléphone : ${createdBailleur.telephone || 'N/A'}
Mot de passe temporaire : ${createdBailleur.motDePasseTemp}
-----------------------------
Connectez-vous sur l'application MOVO Bailleur (http://localhost:5173). Vous devrez modifier votre mot de passe à la première connexion.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Gestion des Bailleurs" />

      <div className="content-container">
        {/* Barre d'outils */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 14px', width: '320px', height: '44px' }}>
            <Search size={18} color="#64748B" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Rechercher nom, email, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '14px' }}
            />
          </div>

          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} />
            <span>Nouveau Bailleur</span>
          </button>
        </div>

        {/* Table des bailleurs */}
        <div className="card-box" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nom / Entreprise</th>
                  <th>Contacts</th>
                  <th>Biens</th>
                  <th>Baux</th>
                  <th>Statut Compte</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Chargement des bailleurs...</td>
                  </tr>
                ) : bailleurs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>Aucun bailleur trouvé.</td>
                  </tr>
                ) : (
                  bailleurs.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0F322B' }}>{b.nomComplet}</div>
                        {b.nomEntreprise && (
                          <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={12} />
                            <span>{b.nomEntreprise}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: '#0F172A' }}>{b.email || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{b.telephone || 'N/A'}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700' }}>{b.nombreBiens}</span> bien(s)
                      </td>
                      <td>
                        <span style={{ fontWeight: '700' }}>{b.nombreBaux}</span> bail/baux
                      </td>
                      <td>
                        {b.estActif ? (
                          <span className="badge-status badge-active">Actif</span>
                        ) : (
                          <span className="badge-status badge-inactive">Désactivé</span>
                        )}
                        {!b.estReclame && (
                          <span className="badge-status badge-pending" style={{ marginLeft: '6px' }}>Mdp Temp</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={b.estActif ? "btn-danger" : "btn-secondary"}
                          onClick={() => handleToggleStatut(b.id, b.estActif)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          {b.estActif ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          <span>{b.estActif ? 'Désactiver' : 'Activer'}</span>
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

      {/* Modal Création Bailleur */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ background: '#0F322B', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={22} color="#84B889" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Nouveau Compte Bailleur</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '24px' }}>
              {createError && (
                <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F322B', marginBottom: '6px' }}>Prénom *</label>
                  <input type="text" placeholder="Jean" value={prenom} onChange={(e) => setPrenom(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F322B', marginBottom: '6px' }}>Nom *</label>
                  <input type="text" placeholder="Kouassi" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F322B', marginBottom: '6px' }}>Adresse E-mail</label>
                <input type="email" placeholder="bailleur@exemple.ci" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '14px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F322B', marginBottom: '6px' }}>Numéro de Téléphone</label>
                <input type="text" placeholder="0708091011" value={telephone} onChange={(e) => setTelephone(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '14px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F322B', marginBottom: '6px' }}>Nom d'Entreprise / SCI (Optionnel)</label>
                <input type="text" placeholder="SCI Horizon Immobilier" value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '14px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F322B', marginBottom: '6px' }}>Mot de passe temporaire</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={motDePasseTemp} onChange={(e) => setMotDePasseTemp(e.target.value)} required style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #F49E00', backgroundColor: '#FFF9EC', fontFamily: 'monospace', fontWeight: '700', fontSize: '15px' }} />
                  <button type="button" className="btn-secondary" onClick={() => setMotDePasseTemp(`Bailleur${Math.floor(1000 + Math.random() * 9000)}!`)}>
                    Générer
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary" disabled={creating} style={{ flex: 1, justifyContent: 'center' }}>
                  {creating ? 'Création en cours...' : 'Créer le Compte Bailleur'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Succès avec Identifiants */}
      {createdBailleur && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F322B', marginBottom: '8px' }}>
              Compte Bailleur Créé !
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>
              Transmettez les identifiants temporaires ci-dessous au bailleur :
            </p>

            <div style={{ backgroundColor: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '24px', fontSize: '13px' }}>
              <div><strong>Bailleur :</strong> {createdBailleur.prenom} {createdBailleur.nom}</div>
              {createdBailleur.email && <div><strong>Email :</strong> {createdBailleur.email}</div>}
              {createdBailleur.telephone && <div><strong>Téléphone :</strong> {createdBailleur.telephone}</div>}
              <div style={{ marginTop: '8px', color: '#D97706', fontWeight: '800', fontSize: '15px' }}>
                Mot de passe temporaire : <span style={{ fontFamily: 'monospace' }}>{createdBailleur.motDePasseTemp}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={copyCredentials} style={{ flex: 1, justifyContent: 'center', backgroundColor: copied ? '#10B981' : '#0F322B' }}>
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                <span>{copied ? 'Copié !' : 'Copier les accès'}</span>
              </button>
              <button className="btn-secondary" onClick={() => setCreatedBailleur(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bailleurs;
