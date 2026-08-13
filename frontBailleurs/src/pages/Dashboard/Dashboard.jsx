import React, { useState, useEffect, useCallback } from 'react';
import {
  Home,
  Users,
  FileText,
  Phone,
  Search,
  Star,
  Building,
  Home as HomeIcon,
  SlidersHorizontal,
  Wallet,
  MapPin,
  ChevronRight,
  Loader
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, tenants, properties, reports, API_URL } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [platformUsers, setPlatformUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Safety checks for data
  const safeTenants = tenants || [];
  const safeProperties = properties || [];
  const safeReports = reports || [];

  const getInitials = (name) => {
    if (!name) return 'B';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  // Fetch platform tenants from backend
  const fetchPlatformUsers = useCallback(async (q = '') => {
    setLoadingUsers(true);
    try {
      const token = user?.token || localStorage.getItem('movo_bailleur_token');
      const url = q.trim().length > 0
        ? `${API_URL}/locataires/recherche?q=${encodeURIComponent(q)}`
        : `${API_URL}/locataires/recherche?q=`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.locataires) {
        setPlatformUsers(data.locataires);
      }
    } catch (err) {
      console.error('Erreur chargement annuaire :', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [user, API_URL]);

  // Load on mount
  useEffect(() => {
    if (user?.id) fetchPlatformUsers('');
  }, [user?.id]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlatformUsers(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const displayedUsers = showAllUsers ? platformUsers : platformUsers.slice(0, 7);

  return (
    <div className="dashboard-page">
      <div className="dashboard-layout-container">
        {/* Left Side: Stats + Recent Content */}
        <div className="dashboard-left-content">
          <div className="dashboard-stats-grid">
            {/* Profile Card */}
            <div className="profile-stat-card">
              <div className="profile-large-avatar">{getInitials(user?.name)}</div>
              <div className="profile-stat-details">
                <h2>{user?.name || 'Bailleur'}</h2>
                <p>{user?.email || 'Bailleur Movo'}</p>
                <div className="rating-badge">
                  <Star size={12} fill="#73BA7C" color="#73BA7C" />
                  <span>5,0 / 5</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mini-stat-card">
              <div className="mini-stat-icon icon-green">
                <HomeIcon size={20} />
              </div>
              <div className="mini-stat-info">
                <h3>{safeProperties.length}</h3>
                <p>Biens<br />actifs</p>
              </div>
            </div>

            <div className="mini-stat-card">
              <div className="mini-stat-icon icon-purple">
                <Users size={20} />
              </div>
              <div className="mini-stat-info">
                <h3>{safeTenants.length}</h3>
                <p>Locataires<br />actifs</p>
              </div>
            </div>

            <div className="mini-stat-card">
              <div className="mini-stat-icon icon-blue">
                <FileText size={20} />
              </div>
              <div className="mini-stat-info">
                <h3>{safeReports.length}</h3>
                <p>Rapports<br />générés</p>
              </div>
            </div>
          </div>

          <div className="dashboard-lower-grid">
            {/* Column 1: Recent Tenants */}
            <div className="main-column">
              <div className="column-header">
                <h3>Locataires les plus récents</h3>
                <Link to="/locataires" className="view-all-link">Voir tout</Link>
              </div>
              <div className="tenants-vertical-list">
                {safeTenants.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                    <p style={{ marginBottom: '8px', fontWeight: '500' }}>Aucun locataire enregistré pour le moment.</p>
                    <button className="btn-primary" style={{ margin: '0 auto', fontSize: '12px', padding: '6px 12px' }} onClick={() => navigate('/locataires')}>
                      + Ajouter un locataire
                    </button>
                  </div>
                ) : (
                  safeTenants.slice(0, 6).map((tenant) => (
                    <div key={tenant.id} className="tenant-item-row" onClick={() => navigate(`/locataires/${tenant.id}`)}>
                      <div className="tenant-circle-avatar">{tenant.initials}</div>
                      <div className="tenant-main-info">
                        <h4>{tenant.name}</h4>
                        <p>{tenant.email}</p>
                      </div>
                      <div className="tenant-side-info">
                        <div className="phone-row">
                          <Phone size={10} />
                          <span>{tenant.phone}</span>
                        </div>
                        <p className="property-tag">{tenant.property || 'Sans bien'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="btn-footer-outline" onClick={() => navigate('/locataires')}>
                Voir tous les locataires
              </button>
            </div>

            {/* Column 2: Recent Properties */}
            <div className="main-column">
              <div className="column-header">
                <h3>Biens les plus récents</h3>
                <Link to="/biens" className="view-all-link">Voir tout</Link>
              </div>
              <div className="properties-mini-grid">
                {safeProperties.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '14px', gridColumn: '1 / -1' }}>
                    <p style={{ marginBottom: '8px', fontWeight: '500' }}>Aucun bien immobilier enregistré.</p>
                    <button className="btn-primary" style={{ margin: '0 auto', fontSize: '12px', padding: '6px 12px' }} onClick={() => navigate('/biens')}>
                      + Ajouter un bien
                    </button>
                  </div>
                ) : (
                  safeProperties.slice(0, 6).map((property) => (
                    <div key={property.id} className="property-mini-card">
                      <div className="prop-card-header">
                        {property.icon === 'building' ? <Building size={18} color="#F49E00" /> : <Home size={18} color="#F49E00" />}
                        <span className={`status-tag ${property.status === 'Occupé' || property.status === 'Partiellement occupé' ? 'tag-green' : 'tag-orange'}`}>
                          {property.status}
                        </span>
                      </div>
                      <h4>{property.name}</h4>
                      <p className="location-row"><MapPin size={12} /> {property.location}</p>
                      <div className="prop-type-info">
                        <p>Type: <span>{property.type}</span></p>
                        {property.type === 'Immeuble' && (
                          <p>Logements: <span>{property.units ? property.units.length : '0'}</span></p>
                        )}
                      </div>
                      <button className="btn-gerer" onClick={() => navigate(`/biens/${property.id}`)}>
                        Gérer
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button className="btn-footer-outline" onClick={() => navigate('/biens')}>
                Voir tous les biens
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Platform Tenant Database Sidebar */}
        <div className="dashboard-right-sidebar">
          <div className="search-filter-container">
            <div className="search-input-wrapper">
              <Search size={18} color="#94A3B8" />
              <input 
                type="text" 
                placeholder="Rechercher un locataire..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SlidersHorizontal size={18} color="#94A3B8" className="filter-icon" />
            </div>
          </div>

          <div className="activities-section">
            <h3 className="section-title">Bases de données locataires</h3>
            <div className={`activities-vertical-list ${showAllUsers ? 'scrollable' : ''}`}>
              {displayedUsers.length > 0 ? displayedUsers.map((u) => (
                <div key={u.id} className="activity-row-card" onClick={() => navigate(`/locataires/${u.id}`)} style={{cursor: 'pointer'}}>
                  <div className="activity-circle-avatar">
                    {getInitials(`${u.prenom || ''} ${u.nom || ''}`).trim() || u.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="activity-row-content">
                    <div className="activity-row-header">
                      <h4>{`${u.prenom || ''} ${u.nom || ''}`.trim() || u.email}</h4>
                      <div className="row-rating">
                        <Star size={10} fill="#F49E00" color="#F49E00" />
                        <span>5,0</span>
                      </div>
                    </div>
                    <div className="activity-row-footer">
                      <p className="loc-dot">{u.email || u.telephone || 'MOVO'}</p>
                      <span className="avis-count">locataire</span>
                    </div>
                  </div>
                </div>
              )) : (
                !loadingUsers && <p className="empty-state">Aucun locataire trouvé.</p>
              )}
              {loadingUsers && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
                  <Loader size={18} className="spin" style={{ opacity: 0.5 }} />
                </div>
              )}
            </div>
            {!showAllUsers && platformUsers.length > 7 && (
              <button className="btn-footer-outline" onClick={() => setShowAllUsers(true)}>
                Voir tout l'annuaire
              </button>
            )}
            {showAllUsers && (
              <button className="btn-footer-outline" onClick={() => setShowAllUsers(false)}>
                Réduire la liste
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
