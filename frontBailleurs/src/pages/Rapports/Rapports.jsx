import React, { useState, useMemo } from 'react';
import {
  FileText, Search, Filter, CheckCircle,
  AlertTriangle, Star, Home,
  MapPin, DollarSign, ChevronDown, X,
  Search as SearchIcon, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReportModal from '../../components/Modals/ReportModal';
import ReportDetailModal from '../../components/Modals/ReportDetailModal';
import ConfirmationModal from '../../components/Modals/ConfirmationModal';
import TenantSelectionModal from '../../components/Modals/TenantSelectionModal';
import './Rapports.css';

const Rapports = () => {
  const { reports, updateReport, fetchMesAvis, user } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTenantSelectOpen, setIsTenantSelectOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTenant, setActiveTenant] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filteredReports = useMemo(() => {
    return (reports || []).filter(r => {
      const matchesSearch = r.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.propertyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'Tous' || r.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [reports, searchTerm, filterStatus, refresh]);

  const handleOpenDetail = (report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleStartNewReport = () => {
    setIsTenantSelectOpen(true);
  };

  const handleTenantSelected = (tenant) => {
    setActiveTenant(tenant);
    setIsTenantSelectOpen(false);

    // Check if tenant already has reports
    if (tenant.reports && tenant.reports.length > 0) {
      setIsConfirmOpen(true);
    } else {
      setIsReportModalOpen(true);
    }
  };

  const handleConfirmModify = () => {
    setIsConfirmOpen(false);
    setIsReportModalOpen(true);
    // Ideally we should open the report in edit mode, 
    // but the instruction says "voulez vous le modifier", 
    // so we open the report modal (which is our form).
  };

  return (
    <div className="rapports-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Mes Rapports</h1>
          <p>Gérez les avis et les contestations de vos locataires</p>
        </div>
        <button className="btn-primary" onClick={handleStartNewReport}>
          <FileText size={20} />
          <span>Nouveau rapport</span>
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-container">
          <Search size={18} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Rechercher par locataire ou bien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <div className="select-filter-wrapper">
            <Filter size={18} color="#0F322B" />
            <select 
              className="select-filter-with-icon" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Validé">Validés</option>
              <option value="Contesté">Contestés</option>
            </select>
          </div>
        </div>
      </div>

      <div className="reports-grid-mobile-style">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report.id} className="report-card-mobile">
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
                  <p>{report.tenantEmail || ''}</p>
                </div>
                <div className="report-date-stars">
                  <span className="date-text">{report.publieLe ? new Date(report.publieLe).toLocaleDateString('fr-FR') : report.date || ''}</span>
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
                  <span>{report.bien?.type || report.propertyType || '—'}</span>
                </div>
                <div className="info-item">
                  <MapPin size={14} color="#003366" />
                  <span>{report.bien?.adresse || report.propertyName || '—'}</span>
                </div>
                <div className="info-item">
                  <DollarSign size={14} color="#003366" />
                  <span>{report.bien?.loyer || report.price || '—'}</span>
                </div>
              </div>

              <div className="report-section-label">Commentaire</div>
              <div className="report-comment-box">
                <p>{report.comment || report.commentaire || report.content}</p>
              </div>


              {report.tenantResponse && (
                <div className="contestation-box-sm">
                  <div className="contestation-header">
                    <AlertTriangle size={14} color="#FF5252" />
                    <span>Ce rapport a été contesté par le locataire</span>
                  </div>
                </div>
              )}

              <div className="report-card-actions">
                <button className="btn-primary-full-width" onClick={() => handleOpenDetail(report)}>
                  Détails du rapport
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-full">Aucun rapport correspondant à votre recherche.</div>
        )}
      </div>

      <ReportDetailModal
        isOpen={isDetailOpen}
        report={selectedReport}
        onClose={() => setIsDetailOpen(false)}
        onEdit={async (id, changes) => {
           // changes = { comment, rating, regularity, attachments }
           const updatedReport = {
             ...selectedReport,
             id,
             comment: changes.comment,
             content: changes.comment,
             rating: changes.rating,
             regularity: changes.regularity,
             attachments: changes.attachments,
           };
           await updateReport(updatedReport);
           // Refresh reports from backend
           if (fetchMesAvis && user?.token && user?.id) {
             await fetchMesAvis(user.token, user.id);
           }
           setIsDetailOpen(false);
           setRefresh(r => r + 1);
        }}
      />

      <TenantSelectionModal
        isOpen={isTenantSelectOpen}
        onClose={() => setIsTenantSelectOpen(false)}
        onSelect={handleTenantSelected}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmModify}
        message="Ce locataire a déjà un rapport voulez vous le modifier ?"
      />

      {activeTenant && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setActiveTenant(null);
          }}
          tenantName={activeTenant.name}
          onSave={() => setRefresh(r => r + 1)}
        />
      )}
    </div>
  );
};

export default Rapports;
