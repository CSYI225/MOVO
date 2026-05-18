import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { tenants, properties, allPlatformUsers } from '../../data/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);
  
  // Safety checks for data
  const safeTenants = tenants || [];
  const safeProperties = properties || [];
  const safePlatformUsers = allPlatformUsers || [];

  // Filter platform users based on search
  const filteredUsers = safePlatformUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 7);

  return (
    <div className="dashboard-page">
      <div className="dashboard-layout-container">
        {/* Left Side: Stats + Recent Content */}
        <div className="dashboard-left-content">
          <div className="dashboard-stats-grid">
            {/* Profile Card */}
            <div className="profile-stat-card">
              <div className="profile-large-avatar">CS</div>
              <div className="profile-stat-details">
                <h2>Coulibaly Sékou</h2>
                <p>Bailleur</p>
                <div className="rating-badge">
                  <Star size={12} fill="#73BA7C" color="#73BA7C" />
                  <span>4,7 / 5</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mini-stat-card">
              <div className="mini-stat-icon icon-green">
                <HomeIcon size={20} />
              </div>
              <div className="mini-stat-info">
                <h3>8</h3>
                <p>Biens<br />actifs</p>
              </div>
            </div>

            <div className="mini-stat-card">
              <div className="mini-stat-icon icon-purple">
                <Users size={20} />
              </div>
              <div className="mini-stat-info">
                <h3>12</h3>
                <p>Locataires<br />actifs</p>
              </div>
            </div>

            <div className="mini-stat-card">
              <div className="mini-stat-icon icon-blue">
                <FileText size={20} />
              </div>
              <div className="mini-stat-info">
                <h3>24</h3>
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
                {safeTenants.slice(0, 6).map((tenant) => (
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
                ))}
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
                {safeProperties.slice(0, 6).map((property) => (
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
                ))}
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
              {displayedUsers.map((user) => (
                <div key={user.id} className="activity-row-card" onClick={() => navigate(`/locataires/${user.id}`)} style={{cursor: 'pointer'}}>
                  <div className="activity-circle-avatar">
                    {user.initials}
                  </div>
                  <div className="activity-row-content">
                    <div className="activity-row-header">
                      <h4>{user.name}</h4>
                      <div className="row-rating">
                        <Star size={10} fill="#F49E00" color="#F49E00" />
                        <span>{user.rating || '4,5'}</span>
                      </div>
                    </div>
                    <div className="activity-row-footer">
                      <p className="loc-dot">{user.location || 'Abidjan, CI'}</p>
                      <span className="avis-count">15 avis</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="empty-state">Aucun utilisateur trouvé.</p>}
            </div>
            {!showAllUsers && filteredUsers.length > 7 && (
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
