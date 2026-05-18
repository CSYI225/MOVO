import React, { useState } from 'react';
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

const Header = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="header">
      <div className="header-greeting">
        <h1>Bonjour, Coulibaly Sékou 👋</h1>
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
                {notifications.length === 0 && (
                  <p className="notif-empty">Aucune notification.</p>
                )}
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                    onClick={() => markRead(notif.id)}
                  >
                    <div className="notif-icon-wrap">
                      <NotifIcon type={notif.icon} />
                    </div>
                    <div className="notif-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notif-date">{notif.date}</span>
                    </div>
                    {!notif.read && <div className="notif-unread-dot" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile-wrapper">
          <div className="user-profile" onClick={() => navigate('/profile')}>
            <div className="avatar">CS</div>
            <div className="user-info">
              <span className="user-name">Coulibaly Sékou</span>
              <span className="user-role">Bailleur</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
