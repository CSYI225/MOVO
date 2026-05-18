import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Filter, UserPlus, Phone, Mail, Building, CheckCircle, Clock, XCircle } from 'lucide-react';
import { tenants, allPlatformUsers, properties } from '../../data/mockData';
import TenantSelectionModal from '../../components/Modals/TenantSelectionModal';
import ManualTenantModal from '../../components/Modals/ManualTenantModal';
import PropertySelectionModal from '../../components/Modals/PropertySelectionModal';
import './Locataires.css';

const Locataires = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRelation, setFilterRelation] = React.useState('Toutes les relations');
  const [filterOccupancy, setFilterOccupancy] = React.useState('Tous les statuts');
  const [refresh, setRefresh] = React.useState(0);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = React.useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  const [isPropSelectionOpen, setIsPropSelectionOpen] = React.useState(false);
  const [pendingTenant, setPendingTenant] = React.useState(null); // tenant waiting for property assignment

  const filteredTenants = React.useMemo(() => {
    return (tenants || []).filter(t => {
      const sTerm = searchTerm.toLowerCase();
      const matchesSearch = (t.name || '').toLowerCase().includes(sTerm) || 
                            (t.email || '').toLowerCase().includes(sTerm) ||
                            (t.property || '').toLowerCase().includes(sTerm);
      
      const matchesRelation = filterRelation === 'Toutes les relations' || t.status === filterRelation;
      
      const occupancy = t.property ? 'Actif' : 'Ancien';
      const matchesOccupancy = filterOccupancy === 'Tous les statuts' || occupancy === filterOccupancy;
      
      return matchesSearch && matchesRelation && matchesOccupancy;
    });
  }, [tenants, searchTerm, filterRelation, filterOccupancy, refresh]);

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
        </div>

        <div className="locataires-list">
          {filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => (
              <div key={tenant.id} className="locataire-row" onClick={() => navigate(`/locataires/${tenant.id}`)}>
                <div className="tenant-main">
                  <div className="avatar-md" style={{ overflow: 'hidden', padding: 0, background: tenant.photo ? 'transparent' : undefined }}>
                    {tenant.photo
                      ? <img src={tenant.photo} alt={tenant.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : tenant.initials
                    }
                  </div>
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

              </div>
            ))
          ) : (
            <div className="empty-state-full" style={{ padding: '40px', textAlign: 'center' }}>
               <p>Aucun locataire trouvé.</p>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Choose existing or manual */}
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
            id: user.id || Date.now(),
            status: 'Non-vérifié',
            property: null,
            unitNumber: null,
            initials: user.initials || user.name.split(' ').map(n => n[0]).join('')
          };
          tenants.unshift(newTenant);
          setLocalTenants([...tenants]);
          setIsSelectionModalOpen(false);
          // Open property selection
          setPendingTenant(newTenant);
          setIsPropSelectionOpen(true);
        }}
        title="Ajouter un locataire à votre liste"
      />

      {/* Step 1b: Manual creation with inline property selection */}
      <ManualTenantModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={(data) => {
          const newTenant = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            phone: data.phone,
            photo: data.photo || null,
            status: 'Non-vérifié',
            property: data.property?.name || null,
            unitNumber: data.unit?.number || null,
            occupancyDate: data.occupancyDate || new Date().toISOString().split('T')[0],
            initials: data.name.split(' ').map(n => n[0]).join('')
          };
          tenants.unshift(newTenant);
          // Associate to property
          if (data.property) {
            const propRef = properties.find(p => p.id === data.property.id);
            if (propRef) {
              if (!propRef.currentTenants) propRef.currentTenants = [];
              propRef.currentTenants.push(newTenant.id);
              propRef.occupants = propRef.currentTenants.length;
              propRef.status = propRef.type === 'Immeuble' ? 'Partiellement occupé' : 'Occupé';
              // Mark unit if Immeuble
              if (data.unit && propRef.units) {
                const uIdx = propRef.units.findIndex(u => u.id === data.unit.id);
                if (uIdx > -1) propRef.units[uIdx].tenantId = newTenant.id;
              }
            }
          }
          setRefresh(r => r + 1);
          setIsManualModalOpen(false);
        }}
      />

      {/* Step 2: Associate property (+unit if Immeuble) */}
      <PropertySelectionModal
        isOpen={isPropSelectionOpen}
        onClose={() => { setIsPropSelectionOpen(false); setPendingTenant(null); }}
        tenantName={pendingTenant?.name}
        onConfirm={(property, unit, occupancyDate) => {
          // Update the tenant
          const idx = tenants.findIndex(t => t.id === pendingTenant.id);
          if (idx > -1) {
            tenants[idx].property = property.name;
            tenants[idx].unitNumber = unit ? unit.number : null;
            tenants[idx].occupancyDate = occupancyDate;
          }
          // Update the property
          if (!property.currentTenants) property.currentTenants = [];
          if (!property.currentTenants.includes(pendingTenant.id)) {
            property.currentTenants.push(pendingTenant.id);
          }
          property.occupants = property.currentTenants.length;
          property.status = property.type === 'Immeuble' ? 'Partiellement occupé' : 'Occupé';
          // Update the unit if applicable
          if (unit) {
            const propRef = properties.find(p => p.id === property.id);
            const uIdx = propRef?.units?.findIndex(u => u.id === unit.id);
            if (uIdx !== undefined && uIdx > -1) propRef.units[uIdx].tenantId = pendingTenant.id;
          }
          setRefresh(r => r + 1);
          setIsPropSelectionOpen(false);
          setPendingTenant(null);
          alert(`${tenants.find(t => t.id === (pendingTenant?.id))?.name || ''} a été associé(e) à ${property.name}${unit ? ` - ${unit.number}` : ''}.`);
        }}
      />
    </div>
  );
};

export default Locataires;
