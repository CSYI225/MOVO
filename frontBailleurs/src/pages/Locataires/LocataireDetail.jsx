import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, Building,
  ShieldCheck, FileText, History,
  Star, MessageSquare, AlertCircle,
  ExternalLink, MapPin, CheckCircle,
  AlertTriangle, Home, DollarSign
} from 'lucide-react';
import { tenants, properties, allPlatformUsers } from '../../data/mockData';
import ReportModal from '../../components/Modals/ReportModal';
import ReportDetailModal from '../../components/Modals/ReportDetailModal';
import './Locataires.css';

const LocataireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [isVacateModalOpen, setIsVacateModalOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  
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
          <div className="avatar-xl">{tenant.initials}</div>
          <div className="profile-meta">
            <h1>{tenant.name}</h1>
            {residesInMyProperty && (
              <div className={`relation-status-badge ${
                tenant.status === 'Vérifié' ? 'status-check' : 
                tenant.status === 'Refusé' ? 'status-refused-bg' : 'status-unverified-bg'
              }`}>
                <ShieldCheck size={18} />
                <span>Relation {tenant.status === 'Vérifié' ? 'Vérifiée' : tenant.status === 'Refusé' ? 'Refusée' : 'Non-vérifiée'}</span>
              </div>
            )}
          </div>
        </div>
        <div className="profile-stats">
          <div className="rating-box">
            <span className="label">Note globale</span>
            <div className="rating-large">
              <Star size={24} fill="#F59E0B" color="#F59E0B" />
              <span>{tenant.rating || '4.8'}</span>
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

          <section className="card-section">
            <h3><AlertCircle size={20} /> Rapports effectués</h3>
            <div className="reports-list">
              {tenant.reports?.map(report => (
                <div key={report.id} className="report-card-mobile" style={{ position: 'relative', margin: '0 0 16px 0', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', background: '#FFFFFF' }}>
                  {report.status === 'Validé' && (
                    <div className="status-badge-top" style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'white', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <CheckCircle size={24} color="#4CAF50" fill="white" />
                    </div>
                  )}
                  {report.status === 'Contesté' && (
                    <div className="status-badge-top" style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'white', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <AlertTriangle size={24} color="#FF5252" fill="white" />
                    </div>
                  )}

                  <div className="report-card-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <div className="report-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F3F4F6', color: '#003366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {report.author?.charAt(0) || tenant.initials?.charAt(0) || '?'}
                    </div>
                    <div className="report-user-info" style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1F2937' }}>{report.author}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6B7280' }}>{report.location || currentProperty?.location || 'N/A'}</p>
                    </div>
                    <div className="report-date-stars" style={{ textAlign: 'right' }}>
                      <span className="date-text" style={{ fontSize: '0.8rem', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>{report.date}</span>
                      <div className="stars-row" style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={12} fill={report.rating >= s ? "#FFA000" : "none"} color="#FFA000" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="report-section-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: '600' }}>Infos Bien</div>
                  <div className="report-info-bien" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', background: '#F9FAFB', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4B5563' }}>
                      <Home size={14} color="#003366" />
                      <span>{report.propertyType || currentProperty?.type || 'N/A'}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4B5563' }}>
                      <MapPin size={14} color="#003366" />
                      <span>{report.propertyName || tenant.property}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4B5563' }}>
                      <DollarSign size={14} color="#003366" />
                      <span>{report.price || currentUnit?.price || currentProperty?.price || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="report-section-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: '600' }}>Commentaire</div>
                  <div className="report-comment-box" style={{ background: '#F3F4F6', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: '#374151', lineHeight: '1.5', marginBottom: '16px' }}>
                    <p style={{ margin: 0 }}>{report.content || report.comment}</p>
                  </div>

                  {report.tenantResponse && (
                     <div className="contestation-box-sm" style={{ borderLeft: '3px solid #FF5252', padding: '10px', background: '#FEF2F2', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div className="contestation-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '0.85rem', fontWeight: '500' }}>
                          <AlertTriangle size={14} color="#FF5252" />
                          <span>Ce rapport a été contesté par le locataire</span>
                        </div>
                     </div>
                  )}

                  <div className="report-card-actions">
                    <button 
                      className="btn-primary-full-width" 
                      style={{ width: '100%', padding: '10px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }} 
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDetailOpen(true);
                      }}
                    >
                      Détails du rapport
                    </button>
                  </div>
                </div>
              ))}
              {(!tenant.reports || tenant.reports.length === 0) && (
                <p className="empty-state">Aucun rapport n'a encore été effectué sur ce locataire.</p>
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
        onClose={() => setIsReportModalOpen(false)}
        tenantName={tenant.name}
      />

      {isVacateModalOpen && (
        <div className="mini-modal-overlay">
          <div className="mini-modal">
            <h3>Confirmer la libération ?</h3>
            <p>Le locataire sera déplacé vers l'historique.</p>
            <div className="mini-modal-actions">
              <button className="btn-mini-cancel" onClick={() => setIsVacateModalOpen(false)}>Annuler</button>
              <button className="btn-mini-confirm" onClick={() => { setIsVacateModalOpen(false); alert('Logement libéré ! (Simulation)'); }}>Confirmer</button>
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
