import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Building, Home,
  Calendar, Users, DollarSign, FileText,
  ChevronRight, Star, ExternalLink,
  Bed, Hash, Plus, UserPlus, Trash2, Edit
} from 'lucide-react';
import { properties, tenants, reports } from '../../data/mockData.jsx';
import ReportModal from '../../components/Modals/ReportModal';
import UnitModal from '../../components/Modals/UnitModal';
import ConfirmationModal from '../../components/Modals/ConfirmationModal';
import TenantSelectionModal from '../../components/Modals/TenantSelectionModal';
import ManualTenantModal from '../../components/Modals/ManualTenantModal';
import './Biens.css';

const UnitDetail = () => {
  const { id, unitId } = useParams();
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [selectedTenant, setSelectedTenant] = React.useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = React.useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  const [refresh, setRefresh] = React.useState(0);
  
  const property = properties.find(p => p.id === parseInt(id));
  const unit = property?.units?.find(u => u.id === parseInt(unitId));

  if (!property || !unit) return <div className="p-6">Unité non trouvée.</div>;

  const tenant = tenants.find(t => t.id === unit.tenantId);

  return (
    <div className="bien-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate(`/biens/${property.id}`)}>
          <ArrowLeft size={20} />
          <span>Retour au bâtiment</span>
        </button>
        <div className="header-actions">
          <button className="btn-outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit size={18} />
            <span>Modifier l'unité</span>
          </button>
          <button className="btn-outline btn-danger-outline" onClick={() => setIsDeleteConfirmOpen(true)}>
            <Trash2 size={18} />
            <span>Supprimer l'unité</span>
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="info-section">
            <div className="section-header-inline">
              <div className="title-with-icon">
                <Home size={32} color="#F49E00" />
                <div>
                  <h1>{property.name} - {unit.number}</h1>
                  <p className="location"><MapPin size={16} /> {property.location}</p>
                </div>
              </div>
              <span className={`status-badge-lg ${tenant ? 'status-green' : 'status-orange'}`}>
                {tenant ? 'Occupé' : 'Vacant'}
              </span>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <DollarSign size={20} />
                <div>
                  <span className="label">Loyer</span>
                  <span className="value">{unit.price}</span>
                </div>
              </div>
              <div className="stat-box">
                <Users size={20} />
                <div>
                  <span className="label">Occupant</span>
                  <span className="value">{tenant ? '1' : '0'}</span>
                </div>
              </div>
              <div className="stat-box">
                <FileText size={20} />
                <div>
                  <span className="label">Type d'unité</span>
                  <span className="value">{unit.type}</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h3>Locataire actuel</h3>
            <div className="current-tenants-list">
              {tenant ? (
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
                    <p><span>Contact :</span> {tenant.phone}</p>
                    <p><span>Email :</span> {tenant.email}</p>
                  </div>
                  
                  <button
                    className="btn-evaluate-sm"
                    onClick={() => {
                      setSelectedTenant(tenant.name);
                      setIsReportModalOpen(true);
                    }}
                  >
                    Évaluer ce locataire
                  </button>
                </div>
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
      </div>

      <section className="history-section full-width-section">
        <h3>Historique des locataires</h3>
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
              {unit.history?.map(entry => (
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

      <UnitModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={unit}
        propertyId={property.id}
        onSave={() => setRefresh(r => r + 1)}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (property.units) {
             const index = property.units.findIndex(u => u.id === unit.id);
             if (index > -1) {
               property.units.splice(index, 1);
             }
          }
          setIsDeleteConfirmOpen(false);
          navigate(`/biens/${property.id}`);
        }}
        message={`Êtes-vous sûr de vouloir supprimer l'unité "${unit.number}" ? Cette action est irréversible.`}
      />

      <TenantSelectionModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        onManualAdd={() => {
          setIsTenantModalOpen(false);
          setIsManualModalOpen(true);
        }}
        onSelect={(tenant) => {
          console.log("Locataire sélectionné pour assignation à l'unité:", tenant);
          setIsTenantModalOpen(false);
          // Logic to assign tenant to unit
        }}
        title="Assigner un locataire à l'appartement"
      />

      <ManualTenantModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};

export default UnitDetail;
