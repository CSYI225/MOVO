import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Building, Home,
  Calendar, Users, DollarSign, FileText,
  ChevronRight, Star, ExternalLink,
  Bed, Hash, Search, SlidersHorizontal, Plus, Trash2, Edit
} from 'lucide-react';
import { properties, tenants, reports } from '../../data/mockData.jsx';
import ReportModal from '../../components/Modals/ReportModal';
import PropertyModal from '../../components/Modals/PropertyModal';
import UnitModal from '../../components/Modals/UnitModal';
import ConfirmationModal from '../../components/Modals/ConfirmationModal';
import TenantSelectionModal from '../../components/Modals/TenantSelectionModal';
import ManualTenantModal from '../../components/Modals/ManualTenantModal';
import './Biens.css';

const BienDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [selectedTenant, setSelectedTenant] = React.useState(null);
  const [searchTermUnits, setSearchTermUnits] = React.useState('');
  const [filterTypeUnits, setFilterTypeUnits] = React.useState('Tous');
  const [searchTermHistory, setSearchTermHistory] = React.useState('');
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = React.useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  
  const property = properties.find(p => p.id === parseInt(id));

  if (!property) return <div className="p-6">Bien non trouvé.</div>;

  const currentTenantsData = tenants.filter(t => property.currentTenants?.includes(t.id));
  
  const historyToDisplay = property?.type === 'Immeuble' && property.units 
    ? property.units.flatMap(u => u.history || [])
    : property?.history || [];

  return (
    <div className={`bien-detail-page ${property.type === 'Immeuble' ? 'full-width-page' : ''}`}>
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/biens')}>
          <ArrowLeft size={20} />
          <span>Retour aux biens</span>
        </button>
        <div className="header-actions">
          <button className="btn-outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit size={18} />
            <span>Modifier le bien</span>
          </button>
          <button className="btn-outline btn-danger-outline" onClick={() => setIsDeleteConfirmOpen(true)}>
            <Trash2 size={18} />
            <span>Supprimer le bien</span>
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="info-section">
            <div className="section-header-inline">
              <div className="title-with-icon">
                {property.type === 'Immeuble' ? <Building size={32} color="#F49E00" /> : <Home size={32} color="#F49E00" />}
                <div>
                  <h1>{property.name}</h1>
                  <p className="location"><MapPin size={16} /> {property.location}</p>
                </div>
              </div>
              <span className={`status-badge-lg ${property.status === 'Occupé' || property.status === 'Partiellement occupé' ? 'status-green' : 'status-orange'}`}>
                {property.status}
              </span>
            </div>

            <div className={`stats-row ${property.type !== 'Immeuble' && property.type !== 'Studio' ? 'stats-grid-2x2' : ''}`}>
              <div className="stat-box">
                <DollarSign size={20} />
                <div>
                  <span className="label">Loyer Total</span>
                  <span className="value">{property.price}</span>
                </div>
              </div>
              <div className="stat-box">
                <Users size={20} />
                <div>
                  <span className="label">Occupants</span>
                  <span className="value">{property.occupants || 0} personnes</span>
                </div>
              </div>
              <div className="stat-box">
                <FileText size={20} />
                <div>
                  <span className="label">Type de bien</span>
                  <span className="value">{property.type}</span>
                </div>
              </div>

              {property.type !== 'Immeuble' && property.type !== 'Studio' && (
                <div className="stat-box">
                  <Bed size={20} />
                  <div>
                    <span className="label">Nombre de pièces</span>
                    <span className="value">{property.rooms || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section détaillée pour les Immeubles : Liste des appartements */}
          {property.type === 'Immeuble' && property.units && (
            <section className="units-section">
              <div className="section-header-v3">
                <h3>Détails des Logements (Appartements)</h3>
                
                <div className="section-controls-v3">
                  <div className="search-wrapper-v2">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Rechercher par N° ou type..." 
                      value={searchTermUnits}
                      onChange={(e) => setSearchTermUnits(e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-wrapper-v2">
                    <SlidersHorizontal size={16} />
                    <select 
                      value={filterTypeUnits}
                      onChange={(e) => setFilterTypeUnits(e.target.value)}
                    >
                      <option value="Tous">Tous les types</option>
                      <option value="Studio">Studio</option>
                      <option value="2 pièces">2 pièces</option>
                      <option value="3 pièces">3 pièces</option>
                      <option value="4 pièces">4 pièces</option>
                    </select>
                  </div>
                  
                  <button className="btn-add-v2" onClick={() => setIsUnitModalOpen(true)}>
                    <Plus size={18} />
                    <span>Ajouter un appartement</span>
                  </button>
                </div>
              </div>
              <div className="units-grid">
                {property.units
                  .filter(unit => {
                    const matchesSearch = unit.number.toLowerCase().includes(searchTermUnits.toLowerCase()) || 
                                        unit.type.toLowerCase().includes(searchTermUnits.toLowerCase());
                    const matchesFilter = filterTypeUnits === 'Tous' || unit.type === filterTypeUnits;
                    return matchesSearch && matchesFilter;
                  })
                  .map(unit => {
                  const tenant = tenants.find(t => t.id === unit.tenantId);
                  return (
                    <div key={unit.id} className="unit-card">
                      <div className="unit-header">
                        <div className="unit-num">
                           <Hash size={16} />
                           <span>{unit.number}</span>
                        </div>
                        <span className={`unit-type-tag ${unit.type.toLowerCase().replace(' ', '-')}`}>{unit.type}</span>
                      </div>
                      <div className="unit-body">
                         <div className="unit-price">{unit.price}</div>
                         <div className="unit-tenant">
                            <Users size={14} />
                            <span>{tenant ? tenant.name : 'Vacant'}</span>
                         </div>
                      </div>
                      <div className="unit-actions">
                        <Link to={`/biens/${property.id}/unite/${unit.id}`} className="btn-view-mini-primary">Détails</Link>
                        {tenant && (
                           <Link to={`/locataires/${tenant.id}`} className="btn-view-mini">Profil</Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>

        {property.type !== 'Immeuble' && (
          <div className="detail-sidebar">
            <div className="sidebar-card">
              <h3>Locataire(s) actuel(s)</h3>
              <div className="current-tenants-list">
                {currentTenantsData.length > 0 ? (
                  currentTenantsData.map(tenant => (
                    <div key={tenant.id} className="tenant-card-compact">
                      <div className="tenant-header">
                        <div className="tenant-avatar-main">{tenant.initials}</div>
                        <div className="tenant-meta">
                          <h4>{tenant.name}</h4>
                          <div className="rating-mini">
                            <Star size={12} fill="#F59E0B" color="#F59E0B" />
                            <span>{tenant.rating || '4.5'}</span>
                          </div>
                        </div>
                        <Link to={`/locataires/${tenant.id}`} className="btn-icon-link">
                          <ExternalLink size={18} />
                        </Link>
                      </div>
                      <div className="tenant-details-mini">
                        <p><span>Logement :</span> {property.name} - {tenant.unitNumber}</p>
                        <p><span>Contact :</span> {tenant.phone}</p>
                      </div>
                      
                      {/* On a enlevé le bouton évaluer locataire ici aussi comme demandé */}
                    </div>
                  ))
                ) : (
                  <div className="empty-tenants">
                    <p>Aucun locataire actuel.</p>
                    <button 
                      className="btn-primary btn-full-width-sm" 
                      style={{ background: '#0F322B', marginTop: '12px' }}
                      onClick={() => setIsTenantModalOpen(true)}
                    >
                      <Plus size={16} />
                      <span>Ajouter un locataire</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="history-section full-width-section">
        <div className="section-header-flex">
          <h3>Historique des locataires</h3>
          <div className="section-filters">
            <div className="search-mini">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Nom du locataire..." 
                value={searchTermHistory}
                onChange={(e) => setSearchTermHistory(e.target.value)}
              />
            </div>
            <button className="btn-filter-mini">
              <SlidersHorizontal size={14} />
              <span>Filtres</span>
            </button>
          </div>
        </div>
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Locataire</th>
                <th>Période</th>
                <th>Note/Rapport</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyToDisplay
                .filter(entry => entry.tenantName.toLowerCase().includes(searchTermHistory.toLowerCase()))
                .map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div className="tenant-cell">
                      <div className="avatar-sm">{entry.tenantName.charAt(0)}</div>
                      <span>{entry.tenantName}</span>
                    </div>
                  </td>
                  <td>{entry.period}</td>
                  <td>
                    {(() => {
                      const report = reports.find(r => r.tenantName === entry.tenantName && r.propertyName === property.name);
                      return report ? (
                        <div className="history-report-cell">
                          <div className="stars-mini">
                            <Star size={12} fill="#FFA000" color="#FFA000" />
                            <span>{report.rating}</span>
                          </div>
                          <p className="comment-preview">{report.comment}</p>
                        </div>
                      ) : <span className="text-muted">N/A</span>;
                    })()}
                  </td>
                  <td>
                    <Link to={`/locataires/${entry.tenantId}`} className="btn-text">Voir profil</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedTenant(null);
        }}
        tenantName={selectedTenant}
      />

      <PropertyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={property}
      />

      <UnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          // Logic to delete property
          console.log("Suppression du bien:", property.id);
          setIsDeleteConfirmOpen(false);
          navigate('/biens');
        }}
        message={`Êtes-vous sûr de vouloir supprimer le bien "${property.name}" ? Cette action est irréversible.`}
      />

      <TenantSelectionModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        onManualAdd={() => {
          setIsTenantModalOpen(false);
          setIsManualModalOpen(true);
        }}
        onSelect={(tenant) => {
          console.log("Locataire sélectionné pour assignation:", tenant);
          setIsTenantModalOpen(false);
          // Logic to assign tenant to property
        }}
        title="Assigner un locataire au bien"
      />

      <ManualTenantModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};

export default BienDetail;
