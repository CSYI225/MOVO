import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus, MapPin, Building, Home, X, Users } from 'lucide-react';
import { properties } from '../../data/mockData';
import './Biens.css';

import PropertyModal from '../../components/Modals/PropertyModal';

const Biens = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('Tous les types');

  const filteredProperties = React.useMemo(() => {
    return (properties || []).filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Tous les types' || p.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType]);

  return (
    <div className="biens-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Mes Biens</h1>
          <p>Gérez votre patrimoine immobilier</p>
        </div>
        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} />
          <span>Ajouter un bien</span>
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-container">
          <Search size={18} color="#9CA3AF" />
          <input 
            type="text" 
            placeholder="Rechercher un bien (nom, adresse...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <div className="select-filter-wrapper">
            <SlidersHorizontal size={18} color="#0F322B" />
            <select 
              className="select-filter-with-icon" 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option>Tous les types</option>
              <option>Immeuble</option>
              <option>Villa</option>
              <option>Appartement</option>
              <option>Studio</option>
            </select>
          </div>
        </div>
      </div>

      <div className="biens-grid">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <div key={property.id} className="property-card-large">
              <div className="property-image-placeholder">
                {property.type === 'Immeuble' ? <Building size={48} /> : <Home size={48} />}
                <span className={`status-badge ${property.status === 'Occupé' || property.status === 'Partiellement occupé' ? 'status-green' : 'status-orange'}`}>
                  {property.status}
                </span>
              </div>
              <div className="property-content">
                <div className="property-main-info">
                  <h3>{property.name}</h3>
                  <p className="location">
                    <MapPin size={14} />
                    <span>{property.location}</span>
                  </p>
                </div>
                
                <div className="property-stats-grid">
                  <div className="prop-stat">
                    <span className="label">Type</span>
                    <span className="column-value">{property.type}</span>
                  </div>
                  <div className="prop-stat">
                    <span className="label">Prix</span>
                    <span className="column-value">{property.price ? `${property.price.split(' ')[0]} ${property.price.split(' ')[1]}` : 'N/A'}</span>
                  </div>
                  <div className="prop-stat">
                    <span className="label">Occupants</span>
                    <span className="column-value">{property.occupants || 0} {property.units ? `/ ${property.units.length || property.units}` : ''}</span>
                  </div>
                </div>

                <div className="property-actions">
                  <button 
                    className="btn-outline-primary w-full"
                    onClick={() => navigate(`/biens/${property.id}`)}
                  >
                    Gérer le bien
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-full" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
             <h3>Aucun bien trouvé</h3>
             <p>Essayez de modifier vos filtres ou votre recherche.</p>
          </div>
        )}
      </div>

      <PropertyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default Biens;
