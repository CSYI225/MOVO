import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Home, MapPin, DollarSign, 
  User, Star, FileText, AlertTriangle,
  Calendar, CheckCircle
} from 'lucide-react';
import { tenants, reports, properties } from '../../data/mockData';
import ReportDetailModal from '../../components/Modals/ReportDetailModal';
import './Locataires.css';

const TenantHistoryDetail = () => {
  const { id, historyId } = useParams();
  const navigate = useNavigate();
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [localReport, setLocalReport] = React.useState(null);
  
  const tenant = tenants.find(t => t.id === parseInt(id));
  const historyEntry = tenant?.history?.find(h => h.id === parseInt(historyId));
  
  // Find report for this history entry (simulation)
  // In a real app, we would match by property and tenant
  const report = reports.find(r => r.tenantName === tenant?.name && r.propertyName === historyEntry?.property);

  React.useEffect(() => {
    if (report) {
      setLocalReport(report);
    }
  }, [report]);
  
  // Mock landlord info (simulation)
  const landlord = {
    name: "Coulibaly Sékou",
    email: "sekou@movo.ci",
    phone: "+225 07 08 09 10 11",
    rating: 4.9
  };

  if (!tenant || !historyEntry) return <div className="p-6">Historique non trouvé.</div>;

  return (
    <div className="locataire-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate(`/locataires/${tenant.id}`)}>
          <ArrowLeft size={20} />
          <span>Retour au profil</span>
        </button>
      </div>

      <div className="tenant-header-card">
        <div className="profile-main">
          <div className="avatar-xl">{tenant.initials}</div>
          <div className="profile-meta">
            <h1>{tenant.name}</h1>
            <p className="text-muted">Historique chez : {historyEntry.landlordName || landlord.name}</p>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="card-section">
            <h3><Home size={20} /> Informations sur le logement</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Type</label>
                <p>{historyEntry.propertyType || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Localisation</label>
                <p>{historyEntry.location || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Prix</label>
                <p>{historyEntry.price || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Date d'arrivée</label>
                <p>{historyEntry.arrivalDate || historyEntry.period?.split(' - ')[0] || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Date de départ</label>
                <p>{historyEntry.departureDate || historyEntry.period?.split(' - ')[1] || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Statut de la relation</label>
                <p>{historyEntry.relationStatus || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section className="card-section">
            <h3><FileText size={20} /> Rapport du propriétaire</h3>
            {report ? (
              <div className="report-card-mobile" style={{ margin: 0, width: '100%' }}>
                {report.status === 'Validé' && (
                  <div className="status-badge-top">
                    <CheckCircle size={24} color="#4CAF50" fill="white" />
                  </div>
                )}
                {report.status === 'Contesté' && (
                  <div className="status-badge-top">
                    <AlertTriangle size={24} color="#FF5252" fill="white" />
                  </div>
                )}

                <div className="report-card-header">
                  <div className="report-avatar">{report.tenantName?.charAt(0) || '?'}</div>
                  <div className="report-user-info">
                    <h4>{report.tenantName}</h4>
                    <p>{report.location || historyEntry.location || 'N/A'}</p>
                  </div>
                  <div className="report-date-stars">
                    <span className="date-text">{report.date}</span>
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={12} fill={report.rating >= s ? "#FFA000" : "none"} color="#FFA000" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="report-section-label">Infos Bien</div>
                <div className="report-info-bien">
                  <div className="info-item">
                    <Home size={14} color="#003366" />
                    <span>{report.propertyType || historyEntry.propertyType || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={14} color="#003366" />
                    <span>{report.propertyName || historyEntry.property || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <DollarSign size={14} color="#003366" />
                    <span>{report.price || historyEntry.price || 'N/A'}</span>
                  </div>
                </div>

                <div className="report-section-label">Commentaire</div>
                <div className="report-comment-box">
                  <p>{report.comment}</p>
                </div>

                {report.tenantResponse && (
                  <>
                    <div className="report-section-label" style={{ color: '#FF5252' }}>
                      <AlertTriangle size={14} /> Contestation
                    </div>
                    <div className="report-comment-box" style={{ background: '#FFF5F5', border: '1px solid #FFE5E5' }}>
                      <p>{report.tenantResponse}</p>
                    </div>
                  </>
                )}

                <div className="report-card-actions" style={{ marginTop: '16px' }}>
                  <button className="btn-primary-full-width" onClick={() => setIsDetailOpen(true)}>
                    Détails du rapport
                  </button>
                </div>
              </div>
            ) : (
              <p className="empty-state">Aucun rapport détaillé trouvé pour cette période.</p>
            )}
          </section>
        </div>

        <div className="detail-sidebar">
          <section className="card-section">
            <h3><User size={20} /> Propriétaire</h3>
            <div className="landlord-info-card">
              <h4>{landlord.name}</h4>
              <div className="rating-mini">
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <span>{landlord.rating}</span>
              </div>
              <div className="contact-details mt-4">
                <p><span>Email :</span> {landlord.email}</p>
                <p><span>Tel :</span> {landlord.phone}</p>
              </div>
            </div>
          </section>
          
          <div className="sidebar-card help-card">
            <h4>À propos de l'historique</h4>
            <p>Ces informations sont archivées et ne peuvent plus être modifiées.</p>
          </div>
        </div>
      </div>

      {localReport && (
        <ReportDetailModal
          isOpen={isDetailOpen}
          report={localReport}
          onClose={() => setIsDetailOpen(false)}
          onEdit={(id, comment) => {
            console.log('Edit report in history', id, comment);
            const idx = reports.findIndex(r => r.id === id);
            if (idx > -1) {
              reports[idx].comment = comment;
              setLocalReport({ ...reports[idx] });
            }
          }}
        />
      )}
    </div>
  );
};

export default TenantHistoryDetail;
