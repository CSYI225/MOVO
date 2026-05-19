import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, Building,
  ShieldCheck, FileText, History,
  Star, MessageSquare, AlertCircle,
  ExternalLink, MapPin, CheckCircle,
  AlertTriangle, Home, DollarSign
} from 'lucide-react';
import { allPlatformUsers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import ReportModal from '../../components/Modals/ReportModal';
import ReportDetailModal from '../../components/Modals/ReportDetailModal';
import './Locataires.css';

const LocataireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenants, properties, reports, addReport, updateReport, setTenants, setProperties, getTenantScore } = useAuth();
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isVacateModalOpen, setIsVacateModalOpen] = React.useState(false);
  const [departureDate, setDepartureDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedReport, setSelectedReport] = React.useState(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isPendingVacate, setIsPendingVacate] = React.useState(false);
  const [refresh, setRefresh] = React.useState(0);
  
  // Search in landlord's tenants first, then in the whole platform database
  const isMyTenant = tenants.some(t => t.id === parseInt(id));
  const tenant = tenants.find(t => t.id === parseInt(id)) || 
                 allPlatformUsers.find(u => u.id === parseInt(id));

  if (!tenant) return <div className="p-6">Locataire non trouvé.</div>;

  const currentProperty = properties.find(p => p.name === tenant.property);
  const currentUnit = currentProperty?.units?.find(u => u.number === tenant.unitNumber);
  
  const isActuallyOccupant = currentProperty?.currentTenants?.includes(tenant.id) || 
                             currentProperty?.units?.some(u => u.tenantId === tenant.id);
  
  // Strict check: must be my tenant AND currently residing in one of my properties
  const residesInMyProperty = isMyTenant && !!tenant.property && !!currentProperty;

  const existingReport = reports.find(
    r => r.tenantName === tenant?.name && r.propertyName === currentProperty?.name
  );

  return (
    <div className="locataire-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/locataires')}>
          <ArrowLeft size={20} />
          <span>Retour aux locataires</span>
        </button>
        <div className="header-actions">
          <button className="btn-outline">Contacter</button>
          
          {residesInMyProperty && (!tenant.reports || tenant.reports.length === 0) && (
            <button className="btn-evaluate" onClick={() => setIsReportModalOpen(true)}>
              <FileText size={18} />
              <span>Évaluer le locataire</span>
            </button>
          )}

          {residesInMyProperty && isActuallyOccupant && (
            <button className="btn-vacate" onClick={() => setIsVacateModalOpen(true)}>Libérer</button>
          )}
        </div>
      </div>

      <div className="tenant-header-card">
        <div className="profile-main">
          <div className="avatar-xl" style={{ overflow: 'hidden', padding: 0, background: tenant.photo ? 'transparent' : undefined }}>
            {tenant.photo
              ? <img src={tenant.photo} alt={tenant.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : tenant.initials
            }
          </div>
          <div className="profile-meta">
            <h1>{tenant.name}</h1>
            {residesInMyProperty && (
              <div className={`relation-status-badge ${
                tenant.status === 'Vérifié' ? 'status-check' : 
                tenant.status === 'Refusé' ? 'status-refused-bg' : 'status-unverified-bg'
              }`}>
                <ShieldCheck size={18} />
                <span>Statut : {tenant.status}</span>
              </div>
            )}
          </div>
        </div>
        <div className="profile-stats">
          <div className="rating-box">
            <span className="label">Note globale</span>
            <div className="rating-large">
              <Star size={24} fill="#F59E0B" color="#F59E0B" />
              <span>{getTenantScore(tenant.id)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="card-section">
            <h3><FileText size={20} /> Informations personnelles</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Email</label>
                <p>{tenant.email}</p>
              </div>
              <div className="info-item">
                <label>Téléphone</label>
                <p>{tenant.phone}</p>
              </div>
              <div className="info-item">
                <label>Date d'arrivée</label>
                <p>{tenant.occupancyDate || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>ID Locataire</label>
                <p>#LT-00{tenant.id}</p>
              </div>
            </div>
          </section>

          <section className="card-section">
            <h3><History size={20} /> Historique locatif</h3>
            <div className="history-list">
              {tenant.history?.map(item => (
                <Link to={`/locataires/${tenant.id}/historique/${item.id}`} key={item.id} className="history-item-link">
                  <div className="history-item">
                    <div className="hist-left">
                      <h4>{item.property}</h4>
                      <p>{item.period}</p>
                    </div>
                    <span className="status-badge-sm">{item.status}</span>
                  </div>
                </Link>
              ))}
              {(!tenant.history || tenant.history.length === 0) && (
                <p className="empty-state">Aucun historique précédent disponible.</p>
              )}
            </div>
          </section>
        </div>

        <div className="detail-sidebar">
          <section className="card-section current-occupancy-card">
            <h3>Logement actuel</h3>
            {currentProperty ? (
              <Link 
                to={currentProperty.type === 'Immeuble' && currentUnit ? `/biens/${currentProperty.id}/unite/${currentUnit.id}` : `/biens/${currentProperty.id}`} 
                className="property-link"
              >
                <div className="prop-icon-bg">
                  <Building size={24} color="#0F322B" />
                </div>
                <div className="prop-text">
                  <h4>{currentProperty.name}</h4>
                  <p>{currentProperty.location} - {tenant.unitNumber}</p>
                </div>
                <ExternalLink size={16} className="ml-auto" />
              </Link>
            ) : (
              <div className="property-info-fallback">
                 <div className="prop-icon-bg">
                    <MapPin size={24} color="#0F322B" />
                 </div>
                 <div className="prop-text">
                    <h4>{tenant.property}</h4>
                    <p>{tenant.unitNumber}</p>
                 </div>
              </div>
            )}
          </section>
        </div>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setIsPendingVacate(false);
        }}
        tenant={tenant}
        propertyName={currentProperty?.name}
        propertyType={currentProperty?.type}
        propertyPrice={currentUnit?.price || currentProperty?.price}
        reportToEdit={existingReport}
        onSubmit={(reportData) => {
          const isEdit = reports.some(r => r.id === reportData.id);
          
          if (!isEdit) {
            addReport(reportData);
          } else {
            updateReport(reportData);
          }

          if (isPendingVacate && currentProperty) {
            // Build history entry with departure date
            const startYear = tenant.occupancyDate ? tenant.occupancyDate : '2023-01-01';
            const endYear = departureDate;
            
            const newHistoryItem = {
              id: Date.now(),
              property: currentProperty.name,
              period: `${startYear} - ${endYear}`,
              status: reportData.status === 'Validé' ? 'Régulier' : 'Litige',
              propertyType: currentProperty.type,
              location: currentProperty.location,
              price: currentUnit?.price || currentProperty?.price,
              arrivalDate: startYear,
              departureDate: endYear,
              relationStatus: reportData.relation || 'Terminée',
              landlordName: 'Coulibaly Sékou'
            };

            // Update tenants
            setTenants(prev => prev.map(t => {
              if (t.id === tenant.id) {
                const history = t.history ? [newHistoryItem, ...t.history] : [newHistoryItem];
                return {
                  ...t,
                  property: null,
                  unitNumber: null,
                  history
                };
              }
              return t;
            }));

            // Update properties
            setProperties(prev => prev.map(p => {
              if (p.id === currentProperty.id) {
                const currentTenants = p.currentTenants ? p.currentTenants.filter(tid => tid !== tenant.id) : [];
                const occupants = currentTenants.length;
                const status = occupants === 0 ? 'Vacant' : (p.type === 'Immeuble' ? 'Partiellement occupé' : 'Occupé');
                
                const units = p.units ? p.units.map(u => {
                  if (u.tenantId === tenant.id) {
                    return { ...u, tenantId: null };
                  }
                  return u;
                }) : p.units;

                return { ...p, currentTenants, occupants, status, units };
              }
              return p;
            }));

            setIsPendingVacate(false);
            setRefresh(r => r + 1);
          }
        }}
      />

      {isVacateModalOpen && (
        <div className="modal-overlay">
          <div className="mini-modal">
            <h3>Confirmer la libération</h3>
            <p style={{ marginBottom: '16px' }}>Êtes-vous sûr de vouloir libérer {tenant.name} de ce logement ? Vous devrez remplir un rapport de sortie.</p>
            
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Date de départ</label>
              <input 
                type="date" 
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px' }}
              />
            </div>

            <div className="mini-modal-actions">
              <button className="btn-mini-cancel" onClick={() => setIsVacateModalOpen(false)}>Annuler</button>
              <button className="btn-mini-confirm" onClick={() => { 
                setIsVacateModalOpen(false);
                setIsPendingVacate(true); // Mark that we're vacating
                setIsReportModalOpen(true); // Force report before vacating
              }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      <ReportDetailModal 
        isOpen={isDetailOpen} 
        report={selectedReport} 
        onClose={() => setIsDetailOpen(false)} 
        onEdit={(id, comment) => console.log('Edit report', id, comment)}
      />
    </div>
  );
};

export default LocataireDetail;
