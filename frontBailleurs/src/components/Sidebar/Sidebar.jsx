import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  CreditCard,
  HelpCircle,
  ChevronLeft
} from 'lucide-react';
import './Sidebar.css';
import Logomovo from "../../Images/logo.png"

import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/biens', name: 'Mes biens', icon: <Home size={20} /> },
    { path: '/locataires', name: 'Mes locataires', icon: <Users size={20} /> },
    { path: '/rapports', name: 'Mes rapports', icon: <FileText size={20} /> },
    { path: '/abonnement', name: 'Abonnement', icon: <CreditCard size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img className='logo' src={Logomovo} alt="" />
          <span className='logo-text'>Espace Bailleur</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.name === 'Messages' && <span className="badge">3</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="help-center">
          <HelpCircle size={20} />
          <div className="help-text">
            <span>Besoin d'aide ?</span>
            <a href="#">Centre d'aide</a>
          </div>
        </div>
        <button className="collapse-btn" onClick={logout}>
          <ChevronLeft size={20} /> Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
