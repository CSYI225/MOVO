import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Filter, UserPlus, Phone, Mail, Building, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TenantSelectionModal from '../../components/Modals/TenantSelectionModal';
import ManualTenantModal from '../../components/Modals/ManualTenantModal';
import PropertySelectionModal from '../../components/Modals/PropertySelectionModal';
import TempPasswordModal from '../../components/Modals/TempPasswordModal';
import AlertModal from '../../components/Modals/AlertModal';
import './Locataires.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Locataires = () => {
  const navigate = useNavigate();
  const { tenants, properties, setTenants, setProperties, user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRelation, setFilterRelation] = React.useState('Toutes les relations');
  const [filterOccupancy, setFilterOccupancy] = React.useState('Tous les statuts');
  const [refresh, setRefresh] = React.useState(0);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = React.useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  const [isPropSelectionOpen, setIsPropSelectionOpen] = React.useState(false);
  const [pendingTenant, setPendingTenant] = React.useState(null);

  // État pour la modale de mot de passe éphémère
  const [isTempPwdOpen, setIsTempPwdOpen] = React.useState(false);
  const [createdLocataire, setCreatedLocataire] = React.useState(null);
  const [motDePasseEphemere, setMotDePasseEphemere] = React.useState('');

  // État pour la modale d'alerte personnalisée
  const [alertConfig, setAlertConfig] = React.useState({ isOpen: false, title: '', message: '', type: 'warning' });

  const showAlert = (message, title = "Information", type = "warning") => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const filteredTenants = React.useMemo(() => {
    return (tenants || []).filter(t => {
      const sTerm = searchTerm.toLowerCase();
      const matchesSearch = (t.name || '').toLowerCase().includes(sTerm) ||
                            (t.email || '').toLowerCase().includes(sTerm) ||
                            (t.property || '').toLowerCase().includes(sTerm);
      const matchesRelation = filterRelation === 'Toutes les relations' || t.status === filterRelation;
      const occupancy = t.isFormer ? 'Ancien' : 'Actif';
      const matchesOccupancy = filterOccupancy === 'Tous les statuts' || occupancy === filterOccupancy;
      return matchesSearch && matchesRelation && matchesOccupancy;
    });
  }, [tenants, searchTerm, filterRelation, filterOccupancy, refresh]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Vérifié': return <CheckCircle size={14} color="#10B981" />;
      case 'En attente': return <Clock size={14} color="#F59E0B" />;
      case 'Non-vérifié': return <Clock size={14} color="#F59E0B" />;
      case 'Refusé': return <XCircle size={14} color="#EF4444" />;
      default: return <Clock size={14} color="#F59E0B" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Vérifié': return 'status-verified';
      case 'En attente': return 'status-unverified';
      case 'Non-vérifié': return 'status-unverified';
      case 'Refusé': return 'status-refused';
      default: return 'status-unverified';
    }
  };

  const handleDeleteTenant = async (e, tenant) => {
    e.stopPropagation();
    if (tenant.relation === 'Vérifié' || tenant.status === 'Vérifié') {
      showAlert(
        `Vous ne pouvez pas supprimer ${tenant.name} de votre liste car la demande de liaison a été acceptée et le bail est actif. Vous devez d'abord libérer le logement.`,
        "Action impossible",
        "warning"
      );
      return;
    }

    try {
      const token = user?.token || localStorage.getItem('movo_bailleur_token');
      await fetch(`${API_URL}/locataires/mes-locataires/${tenant.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(prev => (prev || []).filter(t => String(t.id) !== String(tenant.id)));
      showAlert(`${tenant.name} a été retiré de votre liste avec succès.`, "Locataire retiré", "success");
    } catch (err) {
      console.error('Erreur suppression locataire :', err);
    }
  };

  const handleManualSave = (data) => {
    const newTenant = {
      id: data.id || Date.now(),
      name: data.name,
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      phone: data.telephone,
      photo: data.photo || null,
      status: 'Non-vérifié',
      property: data.property?.name || null,
      unitNumber: data.unit?.number || null,
      occupancyDate: data.occupancyDate || new Date().toISOString().split('T')[0],
      initials: `${data.prenom?.[0] || ''}${data.nom?.[0] || ''}`.toUpperCase(),
    };
    setTenants(prev => {
      const exists = prev.some(t =>
        String(t.id) === String(newTenant.id) ||
        (newTenant.email && t.email && t.email.toLowerCase() === newTenant.email.toLowerCase()) ||
        (newTenant.phone && t.phone && t.phone === newTenant.phone)
      );
      if (exists) {
        return prev.map(t =>
          (String(t.id) === String(newTenant.id) || (newTenant.email && t.email && t.email.toLowerCase() === newTenant.email.toLowerCase()))
            ? { ...t, ...newTenant }
            : t
        );
      }
      return [newTenant, ...prev];
    });

    // Associer au bien si sélectionné
    if (data.property) {
      setProperties(prev => prev.map(p => {
        if (p.id === data.property.id) {
          const currentTenants = p.currentTenants ? [...p.currentTenants, newTenant.id] : [newTenant.id];
          const occupants = currentTenants.length;
          const status = p.type === 'Immeuble' ? 'Partiellement occupé' : 'Occupé';
          const units = p.units ? p.units.map(u => {
            if (data.unit && u.id === data.unit.id) return { ...u, tenantId: newTenant.id };
            return u;
          }) : p.units;
          return { ...p, currentTenants, occupants, status, units };
        }
        return p;
      }));
    }

    setRefresh(r => r + 1);
    setIsManualModalOpen(false);

    // Afficher la modale de mot de passe éphémère
    if (data.motDePasseEphemere) {
      setCreatedLocataire({ prenom: data.prenom, nom: data.nom, email: data.email, telephone: data.telephone });
      setMotDePasseEphemere(data.motDePasseEphemere);
      setIsTempPwdOpen(true);
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
                  <span className={`status-pill ${getStatusClass(tenant.relation || tenant.status)}`}>
                    {getStatusIcon(tenant.relation || tenant.status)}
                    {tenant.relation || tenant.status || 'En attente'}
                  </span>
                </div>

                <div className="tenant-occupancy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    {tenant.isFormer ? (
                      <span className="status-pill status-past">Ancien</span>
                    ) : (tenant.relation === 'Vérifié' || tenant.status === 'Vérifié') && tenant.property && tenant.property !== 'Aucun bien' ? (
                      <span className="status-pill status-active">Actif</span>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: 600 }}>—</span>
                    )}
                  </div>
                  {(() => {
                    const isVerified = tenant.relation === 'Vérifié' || tenant.status === 'Vérifié';
                    return (
                      <button 
                        title={isVerified ? "Impossible de supprimer un locataire vérifié avec un bail actif" : "Retirer ce locataire de votre liste"}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: isVerified ? 'not-allowed' : 'pointer',
                          color: isVerified ? '#CBD5E1' : '#EF4444',
                          opacity: isVerified ? 0.35 : 1,
                          padding: '6px',
                          borderRadius: '6px',
                          transition: 'all 0.2s'
                        }}
                        onClick={(e) => handleDeleteTenant(e, tenant)}
                      >
                        <Trash2 size={16} color={isVerified ? "#CBD5E1" : "#EF4444"} />
                      </button>
                    );
                  })()}
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

      {/* Étape 1 : Recherche globale sur la plateforme */}
      <TenantSelectionModal
        isOpen={isSelectionModalOpen}
        token={user?.token}
        onClose={() => setIsSelectionModalOpen(false)}
        onManualAdd={() => {
          setIsSelectionModalOpen(false);
          setIsManualModalOpen(true);
        }}
        onSelect={(selectedUser) => {
          // 1. Vérifier si le locataire est déjà dans la liste de ce bailleur
          const dejaDansLaListe = tenants.some(t =>
            String(t.id) === String(selectedUser.id) ||
            (selectedUser.email && t.email && t.email.toLowerCase() === selectedUser.email.toLowerCase()) ||
            (selectedUser.telephone && t.phone && t.phone === selectedUser.telephone)
          );
          if (dejaDansLaListe) {
            showAlert(`Action impossible : ${selectedUser.name || 'Ce locataire'} fait déjà partie de votre liste de locataires.`, "Action impossible", "warning");
            setIsSelectionModalOpen(false);
            return;
          }

          // 2. Vérifier s'il a un bail actif
          if (selectedUser.estActif || selectedUser.estActifAilleurs || selectedUser.bienActuel) {
            const nomBien = selectedUser.bienActuel?.nom || 'un autre bien';
            showAlert(`Action impossible : ${selectedUser.name || 'Le locataire'} occupe déjà le bien « ${nomBien} ». Un locataire ne peut pas avoir deux baux actifs simultanément.`, "Action impossible", "warning");
            setIsSelectionModalOpen(false);
            return;
          }

          const newTenant = {
            ...selectedUser,
            id: selectedUser.id || Date.now(),
            status: 'Actif',
            property: null,
            unitNumber: null,
            initials: selectedUser.name ? selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?',
          };
          setTenants(prev => [newTenant, ...prev]);
          setIsSelectionModalOpen(false);
          setPendingTenant(newTenant);
          setIsPropSelectionOpen(true);
        }}
        title="Ajouter un locataire à votre liste"
      />

      {/* Étape 1b : Création manuelle avec appel API et mot de passe éphémère */}
      <ManualTenantModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleManualSave}
        properties={properties || []}
        token={user?.token}
      />

      {/* Modale de confirmation avec mot de passe éphémère */}
      <TempPasswordModal
        isOpen={isTempPwdOpen}
        onClose={() => { setIsTempPwdOpen(false); setCreatedLocataire(null); setMotDePasseEphemere(''); }}
        locataire={createdLocataire}
        motDePasseEphemere={motDePasseEphemere}
      />

      {/* Étape 2 : Associer à un bien (pour locataire existant sélectionné) */}
      <PropertySelectionModal
        isOpen={isPropSelectionOpen}
        onClose={() => { setIsPropSelectionOpen(false); setPendingTenant(null); }}
        tenantName={pendingTenant?.name}
        properties={properties || []}
        onConfirm={async (property, unit, occupancyDate) => {
          // Persist bail in database & send liaison request - check for conflicts first
          const token = user?.token || localStorage.getItem('movo_bailleur_token');
          try {
            const r = await fetch(`${API_URL}/baux/assigner`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                bienId: property.id,
                locataireId: pendingTenant.id,
                prixParMois: unit?.price || property.price ? String(unit?.price || property.price).replace(/[^\d.]/g, '') : '0',
              }),
            });
            const data = await r.json();
            if (!r.ok) {
              showAlert(`Impossible d'assigner le locataire : ${data.message}`, "Erreur assignation", "error");
              setIsPropSelectionOpen(false);
              setPendingTenant(null);
              return;
            }
            // Succes: mettre a jour l'etat local
            setTenants(prev => (prev || []).map(t => {
              if (String(t.id) === String(pendingTenant.id)) {
                return { ...t, property: property.name, unitNumber: unit ? unit.number : null, occupancyDate };
              }
              return t;
            }));
            setProperties(prev => (prev || []).map(p => {
              if (String(p.id) === String(property.id)) {
                const currentTenants = p.currentTenants ? [...p.currentTenants] : [];
                if (!currentTenants.includes(pendingTenant.id)) currentTenants.push(pendingTenant.id);
                const occupants = currentTenants.length;
                const status = p.type === 'Immeuble' ? 'Partiellement occupe' : 'Occupe';
                const units = p.units ? p.units.map(u => {
                  if (unit && u.id === unit.id) return { ...u, tenantId: pendingTenant.id };
                  return u;
                }) : p.units;
                return { ...p, currentTenants, occupants, status, units };
              }
              return p;
            }));
            setRefresh(r2 => r2 + 1);
            setIsPropSelectionOpen(false);
            setPendingTenant(null);
            showAlert(`Locataire ${pendingTenant?.name} assigné avec succès ! Demande de liaison envoyée.`, "Demande envoyée", "success");
          } catch (err) {
            console.error('Erreur assignation bail :', err);
            showAlert('Erreur lors de la connexion au serveur.', "Erreur", "error");
          }
        }}
      />

      {/* Modale d'alerte universelle */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};

export default Locataires;
