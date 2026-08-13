import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Building, Home,
  Calendar, Users, DollarSign, FileText,
  ChevronRight, Star, ExternalLink,
  Bed, Hash, Search, SlidersHorizontal, Plus, Trash2, Edit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReportModal from '../../components/Modals/ReportModal';
import PropertyModal from '../../components/Modals/PropertyModal';
import UnitModal from '../../components/Modals/UnitModal';
import ConfirmationModal from '../../components/Modals/ConfirmationModal';
import TenantSelectionModal from '../../components/Modals/TenantSelectionModal';
import ManualTenantModal from '../../components/Modals/ManualTenantModal';
import PropertySelectionModal from '../../components/Modals/PropertySelectionModal';
import './Biens.css';

const BienDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, tenants, reports, setTenants, setProperties, user, API_URL } = useAuth();
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
  const [isPropSelectionOpen, setIsPropSelectionOpen] = React.useState(false);
  const [pendingTenant, setPendingTenant] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);
  
  const safeProperties = properties || [];
  const safeTenants = tenants || [];
  const safeReports = reports || [];

  const property = safeProperties.find(p => String(p.id) === String(id));

  if (!property) return <div className="p-6" style={{ padding: '40px', textAlign: 'center' }}>Bien non trouvé.</div>;

  const currentTenantsData = safeTenants.filter(t => 
    t.property === property.name || 
    (property.currentTenants || []).some(ct => String(ct) === String(t.id) || String(ct?.id) === String(t.id))
  );
  const occupiedCount = property.units ? property.units.filter(u => u.tenantId !== null && u.tenantId !== undefined).length : currentTenantsData.length;
  
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
        onSave={() => setRefresh(r => r + 1)}
      />

      <UnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        propertyId={property.id}
        onSave={() => setRefresh(r => r + 1)}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          const index = properties.findIndex(p => p.id === property.id);
          if (index > -1) {
            properties.splice(index, 1);
          }
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
        onSelect={async (selectedUser) => {
          setIsTenantModalOpen(false);
          if (selectedUser.estActif || selectedUser.estActifAilleurs || selectedUser.bienActuel) {
            const nomBien = selectedUser.bienActuel?.nom || 'un autre bien';
            alert(`Action impossible : ${selectedUser.name || 'Le locataire'} occupe déjà le bien « ${nomBien} ». Un locataire ne peut pas avoir deux baux actifs simultanément.`);
            return;
          }
          if (property.type === 'Immeuble') {
            setPendingTenant(selectedUser);
            setIsPropSelectionOpen(true);
          } else {
            const tenantName = selectedUser.name || `${selectedUser.prenom || ''} ${selectedUser.nom || ''}`.trim() || selectedUser.email;
            const tenantObj = {
              id: selectedUser.id,
              name: tenantName,
              prenom: selectedUser.prenom,
              nom: selectedUser.nom,
              email: selectedUser.email,
              telephone: selectedUser.telephone,
              property: property.name,
              status: 'Actif',
              occupancyDate: new Date().toISOString().split('T')[0]
            };
            // Update local state
            setTenants(prev => {
              const existingIdx = (prev || []).findIndex(t => String(t.id) === String(selectedUser.id));
              if (existingIdx === -1) {
                return [tenantObj, ...(prev || [])];
              } else {
                return (prev || []).map(t => String(t.id) === String(selectedUser.id) ? { ...t, property: property.name, isFormer: false, status: 'Actif' } : t);
              }
            });
            setProperties(prev => (prev || []).map(p => {
              if (String(p.id) === String(property.id)) {
                const updatedTenants = p.currentTenants ? [...p.currentTenants] : [];
                if (!updatedTenants.some(id => String(id) === String(selectedUser.id))) {
                  updatedTenants.push(selectedUser.id);
                }
                return { ...p, currentTenants: updatedTenants, occupants: updatedTenants.length, status: 'Occupé' };
              }
              return p;
            }));
            setRefresh(r => r + 1);
            const token = user?.token || localStorage.getItem('movo_bailleur_token');
            try {
              const assignResp = await fetch(`${API_URL}/baux/assigner`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  bienId: property.id,
                  locataireId: selectedUser.id,
                  prixParMois: property.price ? String(property.price).replace(/[^\d.]/g, '') : '0',
                }),
              });
              const assignData = await assignResp.json();
              if (!assignResp.ok) {
                alert(`Impossible d'assigner le locataire : ${assignData.message}`);
                return;
              }
              // Succes: mettre a jour l'etat local
              setProperties(prev => (prev || []).map(p => {
                if (String(p.id) === String(property.id)) {
                  const updatedTenants = p.currentTenants ? [...p.currentTenants] : [];
                  if (!updatedTenants.some(id => String(id) === String(selectedUser.id))) {
                    updatedTenants.push(selectedUser.id);
                  }
                  return { ...p, currentTenants: updatedTenants, occupants: updatedTenants.length, status: 'Occupe' };
                }
                return p;
              }));
              setRefresh(r => r + 1);
              alert(`Locataire ${tenantName} assigne avec succes ! Demande de liaison envoyee au locataire.`);
            } catch (err) {
              console.error('Erreur assignation bail :', err);
              alert('Erreur lors de la connexion au serveur.');
            }
          }
        }}
        title="Assigner un locataire au bien"
      />

      <ManualTenantModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        fixedPropertyId={property.id}
        onSave={(data) => {
          const newTenant = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            photo: data.photo || null,
            status: 'Non-vérifié',
            property: property.name,
            unitNumber: data.unit ? data.unit.number : null,
            occupancyDate: data.occupancyDate || new Date().toISOString().split('T')[0],
            initials: data.name.split(' ').map(n => n[0]).join('')
          };
          tenants.push(newTenant);
          if (!property.currentTenants) property.currentTenants = [];
          property.currentTenants.push(newTenant.id);
          property.occupants = property.currentTenants.length;
          property.status = property.type === 'Immeuble' ? 'Partiellement occupé' : 'Occupé';
          
          if (data.unit && property.units) {
            const uIdx = property.units.findIndex(u => u.id === data.unit.id);
            if (uIdx > -1) property.units[uIdx].tenantId = newTenant.id;
          }
          
          setIsManualModalOpen(false);
          setRefresh(r => r + 1);
          alert(`Nouveau locataire ${data.name} créé et assigné !`);
        }}
      />

      <PropertySelectionModal
        isOpen={isPropSelectionOpen}
        onClose={() => { setIsPropSelectionOpen(false); setPendingTenant(null); }}
        tenantName={pendingTenant?.name}
        fixedPropertyId={property.id}
        properties={properties || [property]}
        onConfirm={(selProp, selUnit, occupancyDate) => {
          if (!property.currentTenants) property.currentTenants = [];
          if (!property.currentTenants.includes(pendingTenant.id)) property.currentTenants.push(pendingTenant.id);
          
          const existingIdx = tenants.findIndex(t => t.id === pendingTenant.id);
          if (existingIdx === -1) {
            tenants.push({ ...pendingTenant, id: pendingTenant.id || Date.now(), property: property.name, unitNumber: selUnit?.number, status: 'Non-vérifié', occupancyDate });
          } else {
            tenants[existingIdx].property = property.name;
            tenants[existingIdx].unitNumber = selUnit?.number;
            tenants[existingIdx].occupancyDate = occupancyDate;
          }

          if (selUnit && property.units) {
            const uIdx = property.units.findIndex(u => u.id === selUnit.id);
            if (uIdx > -1) property.units[uIdx].tenantId = pendingTenant.id || tenants[tenants.length - 1].id;
          }

          property.occupants = property.currentTenants.length;
          property.status = 'Partiellement occupé';
          setIsPropSelectionOpen(false);
          setPendingTenant(null);
          setRefresh(r => r + 1);
          alert(`Locataire ${pendingTenant.name} assigné à l'unité ${selUnit?.number} avec succès !`);
        }}
      />
    </div>
  );
};

export default BienDetail;
