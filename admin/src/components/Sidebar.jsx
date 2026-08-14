import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Building2, AlertTriangle, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: '#84B889', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#0F322B', fontWeight: '800', fontSize: '18px'
            }}>
              M
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.1 }}>MOVO</h2>
              <span className="sidebar-badge">ADMINISTRATION</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Tableau de bord</span>
          </NavLink>

          <NavLink to="/bailleurs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Gestion Bailleurs</span>
          </NavLink>

          <NavLink to="/locataires" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <UserCheck size={18} />
            <span>Locataires</span>
          </NavLink>

          <NavLink to="/biens" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Building2 size={18} />
            <span>Patrimoine & Biens</span>
          </NavLink>

          <NavLink to="/moderation" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <AlertTriangle size={18} />
            <span>Modération & Avis</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="admin-profile-card">
          <div className="admin-avatar">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="admin-info">
            <div className="admin-name">{admin?.name || 'Administrateur'}</div>
            <div className="admin-role">{admin?.email || 'admin@movo.ci'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
