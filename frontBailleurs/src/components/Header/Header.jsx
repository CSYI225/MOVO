import React, { useState, useMemo } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, UserPlus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const mockNotifications = [
  {
    id: 1,
    type: 'report_validated',
    title: 'Rapport validé',
    message: 'Votre rapport sur Kouamé Marc a été validé par la plateforme.',
    date: 'Il y a 2h',
    read: false,
    icon: 'check',
  },
  {
    id: 2,
    type: 'report_contested',
    title: 'Rapport contesté',
    message: 'Soro Jean a contesté votre rapport sur Villa Riviera.',
    date: 'Il y a 5h',
    read: false,
    icon: 'alert',
  },
  {
    id: 3,
    type: 'relation_accepted',
    title: 'Demande acceptée',
    message: 'Diabaté Fatoumata a accepté votre demande de relation bailleur-locataire.',
    date: 'Hier',
    read: false,
    icon: 'user_ok',
  },
  {
    id: 4,
    type: 'relation_refused',
    title: 'Demande refusée',
    message: 'Bakayoko Moussa a refusé votre demande de relation bailleur-locataire.',
    date: 'Avant-hier',
    read: true,
    icon: 'user_no',
  },
  {
    id: 5,
    type: 'relation_pending',
    title: 'Demande envoyée',
    message: 'Une demande de relation a été envoyée à Toure Alassane. En attente de réponse.',
    date: 'Il y a 3 jours',
    read: true,
    icon: 'user_pending',
  },
];

const NotifIcon = ({ type }) => {
  switch (type) {
    case 'check': return <CheckCircle size={18} color="#4CAF50" />;
    case 'alert': return <AlertTriangle size={18} color="#FF5252" />;
    case 'user_ok': return <ShieldCheck size={18} color="#2196F3" />;
    case 'user_no': return <UserPlus size={18} color="#EF4444" />;
    default: return <UserPlus size={18} color="#F59E0B" />;
  }
};

import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, tenants, reports } = useAuth();
  const userId = user?.id || 'guest';

  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`movo_read_notifications_${userId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`movo_deleted_notifications_${userId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  React.useEffect(() => {
    if (userId) {
      localStorage.setItem(`movo_read_notifications_${userId}`, JSON.stringify([...readIds]));
    }
  }, [readIds, userId]);

  React.useEffect(() => {
    if (userId) {
      localStorage.setItem(`movo_deleted_notifications_${userId}`, JSON.stringify([...deletedIds]));
    }
  }, [deletedIds, userId]);

  // Générer des notifications dynamiques à partir des locataires et des rapports réels
  const dynamicNotifs = React.useMemo(() => {
    const list = [];
    
    (tenants || []).forEach((t, i) => {
      if (t.relation === 'Vérifié') {
        list.push({
          id: `tenant-ok-${t.id || i}`,
          type: 'relation_accepted',
          title: 'Demande acceptée',
          message: `${t.name} a accepté votre demande de relation bailleur-locataire.`,
          date: 'Récent',
          icon: 'user_ok',
        });
      } else if (t.relation === 'Refusé') {
        list.push({
          id: `tenant-no-${t.id || i}`,
          type: 'relation_refused',
          title: 'Demande refusée',
          message: `${t.name} a refusé votre demande de relation bailleur-locataire.`,
          date: 'Récent',
          icon: 'user_no',
        });
      } else if (t.relation === 'En attente') {
        list.push({
          id: `tenant-pending-${t.id || i}`,
          type: 'relation_pending',
          title: 'Demande envoyée',
          message: `Une demande de relation a été envoyée à ${t.name}. En attente de réponse.`,
          date: 'En attente',
          icon: 'user_pending',
        });
      }
    });

    (reports || []).forEach((r, i) => {
      if (r.status === 'Contesté' || r.hasContestation) {
        list.push({
          id: `report-contested-${r.id || i}`,
          type: 'report_contested',
          title: 'Rapport contesté',
          message: `${r.tenantName || 'Le locataire'} a contesté votre rapport.`,
          date: 'Contestation',
          icon: 'alert',
        });
      } else if (r.status === 'Validé') {
        list.push({
          id: `report-ok-${r.id || i}`,
          type: 'report_validated',
          title: 'Rapport validé',
          message: `Votre rapport sur ${r.tenantName || 'le locataire'} est validé.`,
          date: 'Actif',
          icon: 'check',
        });
      }
    });

    return list;
  }, [tenants, reports]);

  const visibleNotifs = useMemo(() => {
    return dynamicNotifs.filter(n => !deletedIds.has(n.id));
  }, [dynamicNotifs, deletedIds]);

  const unreadCount = visibleNotifs.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => {
    setReadIds(new Set(visibleNotifs.map(n => n.id)));
  };

  const markRead = (id) => {
    setReadIds(prev => new Set([...prev, id]));
  };

  const deleteNotif = (e, id) => {
    e.stopPropagation();
    setDeletedIds(prev => new Set([...prev, id]));
  };

  const getInitials = (name) => {
    if (!name) return 'CS';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-greeting">
        <h1>Bonjour, {user?.name || "Coulibaly Sékou"} 👋</h1>
        <p>Voici un aperçu de votre activité aujourd'hui.</p>
      </div>
      
      <div className="header-actions">
        <div className="notif-wrapper">
          <button className="notification-btn" onClick={() => setIsPanelOpen(v => !v)}>
            <Bell size={20} color="#1A1A1A" />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {isPanelOpen && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <h3>Notifications</h3>
                <div className="notif-header-actions">
                  {unreadCount > 0 && (
                    <button className="btn-mark-all" onClick={markAllRead}>Tout marquer lu</button>
                  )}
                  <button className="btn-close-notif" onClick={() => setIsPanelOpen(false)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="notif-list">
                {visibleNotifs.length === 0 && (
                  <p className="notif-empty">Aucune notification.</p>
                )}
                {visibleNotifs.map(notif => (
                  <div
                    key={notif.id}
                    className={`notif-item ${readIds.has(notif.id) ? 'read' : 'unread'}`}
                    onClick={() => markRead(notif.id)}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                  >
                    <div className="notif-icon-wrap">
                      <NotifIcon type={notif.icon} />
                    </div>
                    <div className="notif-content" style={{ flex: 1, paddingRight: '24px' }}>
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notif-date">{notif.date}</span>
                    </div>
                    {!readIds.has(notif.id) && <div className="notif-unread-dot" />}
                    <button
                      className="btn-delete-single-notif"
                      title="Supprimer la notification"
                      onClick={(e) => deleteNotif(e, notif.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px', borderRadius: '4px', color: '#94A3B8',
                        marginLeft: '6px'
                      }}
                    >
                      <X size={14} color="#94A3B8" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile-wrapper">
          <div className="user-profile" onClick={() => navigate('/profile')}>
            <div className="avatar">{getInitials(user?.name)}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || "Coulibaly Sékou"}</span>
              <span className="user-role">Bailleur</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
