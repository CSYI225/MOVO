import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Filter, UserPlus, Phone, Mail, Building, CheckCircle, Clock, XCircle } from 'lucide-react';
import { tenants, allPlatformUsers } from '../../data/mockData';
import TenantSelectionModal from '../../components/Modals/TenantSelectionModal';
import ManualTenantModal from '../../components/Modals/ManualTenantModal';
import './Locataires.css';

const Locataires = () => {
  const navigate = useNavigate();
  const [localTenants, setLocalTenants] = React.useState(tenants);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRelation, setFilterRelation] = React.useState('Toutes les relations');
  const [filterOccupancy, setFilterOccupancy] = React.useState('Tous les statuts');
  const [isSelectionModalOpen, setIsSelectionModalOpen] = React.useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);

  const filteredTenants = React.useMemo(() => {
    return (localTenants || []).filter(t => {
      const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.property?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRelation = filterRelation === 'Toutes les relations' || t.status === filterRelation;
      
      const occupancy = t.property ? 'Actif' : 'Ancien';
      const matchesOccupancy = filterOccupancy === 'Tous les statuts' || occupancy === filterOccupancy;
      
      return matchesSearch && matchesRelation && matchesOccupancy;
    });
  }, [localTenants, searchTerm, filterRelation, filterOccupancy]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Vérifié': return <CheckCircle size={14} color="#10B981" />;
      case 'Non-vérifié': return <Clock size={14} color="#F59E0B" />;
      case 'Refusé': return <XCircle size={14} color="#EF4444" />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Vérifié': return 'status-verified';
      case 'Non-vérifié': return 'status-unverified';
      case 'Refusé': return 'status-refused';
      default: return '';
    }
  };

  return (
    <div className="locataires-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Mes Locataires</h1>
          <p>Suivez vos relations locatives</p>
        </div>
         <button className="btn-primary" onClick={() => setIsSelectionModalOpen(true)}>
          <UserPlus size={20} />
          <span>Ajouter un locataire</span>
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-container">
          <Search size={18} color="#9CA3AF" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou bien..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <div className="select-filter-wrapper">
            <SlidersHorizontal size={18} color="#0F322B" />
            <select 
              className="select-filter-with-icon" 
              value={filterRelation}
              onChange={(e) => setFilterRelation(e.target.value)}
            >
              <option>Toutes les relations</option>
              <option>Vérifié</option>
              <option>Non-vérifié</option>
              <option>Refusé</option>
            </select>
          </div>
          <div className="select-filter-wrapper">
            <Filter size={18} color="#0F322B" />
            <select 
              className="select-filter-with-icon" 
              value={filterOccupancy}
              onChange={(e) => setFilterOccupancy(e.target.value)}
            >
              <option>Tous les statuts</option>
              <option>Actif</option>
              <option>Ancien</option>
            </select>
          </div>
        </div>
      </div>

      <div className="locataires-list-container">
        <div className="locataires-table-header">
          <span>Locataire</span>
          <span>Bien occupé</span>
          <span>Contact</span>
          <span>Relation</span>
          <span>Statut</span>
          <span>Actions</span>
        </div>

        <div className="locataires-list">
          {filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => (
              <div key={tenant.id} className="locataire-row" onClick={() => navigate(`/locataires/${tenant.id}`)}>
                <div className="tenant-main">
                  <div className="avatar-md">{tenant.initials}</div>
                  <div className="tenant-info">
                    <h4>{tenant.name}</h4>
                    <p>{tenant.email}</p>
                  </div>
                </div>

                <div className="tenant-property">
                  <Building size={16} />
                  <span>{tenant.property || 'Aucun bien'}</span>
                </div>

                <div className="tenant-contact">
                  <p><Phone size={14} /> {tenant.phone}</p>
                  <p><Mail size={14} /> {tenant.email}</p>
                </div>

                <div className="tenant-status">
                  <span className={`status-pill ${getStatusClass(tenant.status)}`}>
                    {getStatusIcon(tenant.status)}
                    {tenant.status}
                  </span>
                </div>

                <div className="tenant-occupancy">
                   <span className={`status-pill ${tenant.property ? 'status-active' : 'status-past'}`}>
                      {tenant.property ? 'Actif' : 'Ancien'}
                   </span>
                </div>

                <div className="tenant-actions">
                  <button className="btn-view">Voir profil</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-full" style={{ padding: '40px', textAlign: 'center' }}>
               <p>Aucun locataire trouvé.</p>
            </div>
          )}
        </div>
      </div>

      <TenantSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onManualAdd={() => {
          setIsSelectionModalOpen(false);
          setIsManualModalOpen(true);
        }}
        onSelect={(user) => {
          const newTenant = {
            ...user,
            id: Date.now(),
            status: 'Vérifié',
            property: null, // Just adding to the list, not assigned yet
            unitNumber: null,
            initials: user.initials || user.name.split(' ').map(n => n[0]).join('')
          };
          setLocalTenants([newTenant, ...localTenants]);
          setIsSelectionModalOpen(false);
          alert(`${user.name} a été ajouté à votre liste de locataires.`);
        }}
        title="Ajouter un locataire à votre liste"
      />

      <ManualTenantModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={(data) => {
          const newTenant = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            status: 'Non-vérifié',
            property: null,
            unitNumber: null,
            initials: data.name.split(' ').map(n => n[0]).join('')
          };
          setLocalTenants([newTenant, ...localTenants]);
          setIsManualModalOpen(false);
          alert(`Nouveau profil créé pour ${data.name}.`);
        }}
      />
    </div>
  );
};

export default Locataires;
