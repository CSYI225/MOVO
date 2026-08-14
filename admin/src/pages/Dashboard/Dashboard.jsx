import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Building2, FileText, Star, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { admin, API_URL } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Erreur chargement stats admin :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Tableau de bord Général" />

      <div className="content-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F322B' }}>Vue d'ensemble du réseau MOVO</h2>
            <p style={{ fontSize: '14px', color: '#64748B' }}>Statistiques et activité globale de la plateforme</p>
          </div>

          <button className="btn-secondary" onClick={fetchStats} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Grille des Métriques */}
        <div className="stat-grid">
          <div className="stat-card">
            <div>
              <div className="stat-label">Bailleurs Enregistrés</div>
              <div className="stat-value">{stats ? stats.bailleurs : '...'}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#E8F5E9', color: '#10B981' }}>
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Locataires Actifs</div>
              <div className="stat-value">{stats ? stats.locataires : '...'}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
              <UserCheck size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Biens Immobiliers</div>
              <div className="stat-value">{stats ? stats.biens : '...'}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#F3E8FF', color: '#8B5CF6' }}>
              <Building2 size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Baux en Cours</div>
              <div className="stat-value">{stats ? stats.bauxActifs : '...'}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <FileText size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Avis & Évaluations</div>
              <div className="stat-value">{stats ? stats.avis : '...'}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <Star size={24} />
            </div>
          </div>

          <div className="stat-card" style={{ borderColor: stats?.contestationsEnAttente > 0 ? '#FCA5A5' : undefined }}>
            <div>
              <div className="stat-label">Contestations en Attente</div>
              <div className="stat-value" style={{ color: stats?.contestationsEnAttente > 0 ? '#DC2626' : undefined }}>
                {stats ? stats.contestationsEnAttente : '...'}
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        {/* Accès rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="card-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F322B' }}>
                  <Users size={20} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F322B' }}>Gestion des Bailleurs</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '22px' }}>
                Créer de nouveaux comptes bailleurs avec mots de passe temporaires, consulter leurs biens et activer/désactiver des comptes.
              </p>
            </div>
            <button className="btn-primary" style={{ marginTop: '20px', alignSelf: 'flex-start' }} onClick={() => navigate('/bailleurs')}>
              <span>Gérer les Bailleurs</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="card-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                  <AlertTriangle size={20} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F322B' }}>Modération & Arbitrage</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '22px' }}>
                Traiter les contestations des locataires contre les avis déposés par les bailleurs et garantir la transparence des réputations.
              </p>
            </div>
            <button className="btn-primary" style={{ marginTop: '20px', alignSelf: 'flex-start', backgroundColor: '#EF4444' }} onClick={() => navigate('/moderation')}>
              <span>Traiter les Contestations</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
