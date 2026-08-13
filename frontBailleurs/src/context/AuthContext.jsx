import React, { createContext, useContext, useState } from 'react';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('movo_bailleur_user');
    const savedToken = localStorage.getItem('movo_bailleur_token');
    return (savedUser && savedToken) ? JSON.parse(savedUser) : null;
  });

  const [tenantsList, setTenantsList] = useState(() => {
    const savedUser = localStorage.getItem('movo_bailleur_user');
    if (!savedUser) return [];
    try {
      const u = JSON.parse(savedUser);
      const saved = localStorage.getItem(`movo_bailleur_tenants_${u.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [propertiesList, setPropertiesList] = useState(() => {
    const savedUser = localStorage.getItem('movo_bailleur_user');
    if (!savedUser) return [];
    try {
      const u = JSON.parse(savedUser);
      const saved = localStorage.getItem(`movo_bailleur_properties_${u.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reportsList, setReportsList] = useState(() => {
    const savedUser = localStorage.getItem('movo_bailleur_user');
    if (!savedUser) return [];
    try {
      const u = JSON.parse(savedUser);
      const saved = localStorage.getItem(`movo_bailleur_reports_${u.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const API_URL = 'http://localhost:5000/api';

  const fetchMesLocataires = async (token, userId) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/locataires/mes-locataires`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.locataires) {
        const savedTenantsStr = localStorage.getItem(`movo_bailleur_tenants_${userId}`);
        const savedTenants = savedTenantsStr ? JSON.parse(savedTenantsStr) : [];
        
        // Fusionner les locataires backend avec les locataires locaux
        const backendTenantsMap = new Map();
        data.locataires.forEach(t => backendTenantsMap.set(String(t.id), t));

        // Fusionner avec local storage (garder property/unit info du local si présente)
        const merged = [...data.locataires.map(bt => {
          const localMatch = savedTenants.find(lt => String(lt.id) === String(bt.id));
          return localMatch ? { ...localMatch, ...bt } : bt;
        })];

        // Ajouter tout locataire purement local non encore dans le backend
        savedTenants.forEach(lt => {
          if (!backendTenantsMap.has(String(lt.id))) {
            merged.push(lt);
          }
        });

        setTenantsList(merged);
        localStorage.setItem(`movo_bailleur_tenants_${userId}`, JSON.stringify(merged));
      }
    } catch (err) {
      console.error('Erreur chargement locataires backend :', err);
    }
  };

  const fetchMesBiens = async (token, userId) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/biens/mes-biens`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.biens) {
        setPropertiesList(data.biens);
        localStorage.setItem(`movo_bailleur_properties_${userId}`, JSON.stringify(data.biens));
      }
    } catch (err) {
      console.error('Erreur chargement biens backend :', err);
    }
  };

  const fetchMesAvis = async (token, userId) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/avis/mes-avis-bailleur`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.avis) {
        // Map backend fields to frontend report structure
        const mapped = data.avis.map(a => ({
          id: a.id,
          tenantId: a.tenantId || a.locataire?.id,
          tenantName: a.tenantName || `${a.locataire?.prenom || ''} ${a.locataire?.nom || ''}`.trim() || a.locataire?.email,
          tenantEmail: a.tenantEmail || a.locataire?.email,
          rating: a.note,
          comment: a.commentaire,
          content: a.commentaire,
          regularity: a.regularitePaiement,
          status: a.hasContestation ? 'Contesté' : 'Validé',
          propertyName: a.propertyName || a.bien?.nom || null,
          bien: a.bien,
          attachments: a.attachments || a.piecesJointes || [],
          piecesJointes: a.piecesJointes || [],
          tenantResponse: a.tenantResponse || null,
          contestationPiecesJointes: a.contestationPiecesJointes || [],
          publieLe: a.publieLe,
        }));
        setReportsList(mapped);
        localStorage.setItem(`movo_bailleur_reports_${userId}`, JSON.stringify(mapped));
      }
    } catch (err) {
      console.error('Erreur chargement avis backend :', err);
    }
  };

  const loadUserData = (userId, token) => {
    const savedTenants = localStorage.getItem(`movo_bailleur_tenants_${userId}`);
    const savedProperties = localStorage.getItem(`movo_bailleur_properties_${userId}`);
    const savedReports = localStorage.getItem(`movo_bailleur_reports_${userId}`);
    setTenantsList(savedTenants ? JSON.parse(savedTenants) : []);
    setPropertiesList(savedProperties ? JSON.parse(savedProperties) : []);
    setReportsList(savedReports ? JSON.parse(savedReports) : []);

    if (token) {
      fetchMesLocataires(token, userId);
      fetchMesBiens(token, userId);
      fetchMesAvis(token, userId);
    }
  };

  // Synchronisation automatique dans localStorage
  React.useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`movo_bailleur_tenants_${user.id}`, JSON.stringify(tenantsList));
    }
  }, [tenantsList, user?.id]);

  React.useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`movo_bailleur_properties_${user.id}`, JSON.stringify(propertiesList));
    }
  }, [propertiesList, user?.id]);

  React.useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`movo_bailleur_reports_${user.id}`, JSON.stringify(reportsList));
    }
  }, [reportsList, user?.id]);

  React.useEffect(() => {
    if (user?.id && user?.token) {
      const loadAllData = () => {
        fetchMesLocataires(user.token, user.id);
        fetchMesBiens(user.token, user.id);
        fetchMesAvis(user.token, user.id);
      };
      loadAllData();
      const interval = setInterval(loadAllData, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.token, user?.id]);

  const login = async (identifiant, motDePasse) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiant, motDePasse }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion.');
      }
      const userData = {
        isLoggedIn: true,
        id: data.utilisateur.id,
        name: `${data.utilisateur.prenom || ''} ${data.utilisateur.nom || ''}`.trim() || data.utilisateur.email,
        email: data.utilisateur.email,
        roles: data.utilisateur.roles,
        token: data.token,
      };
      setUser(userData);
      localStorage.setItem('movo_bailleur_user', JSON.stringify(userData));
      localStorage.setItem('movo_bailleur_token', data.token);
      loadUserData(userData.id, data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (prenom, nom, email, motDePasse) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, motDePasse, roleCode: 'BAILLEUR' }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription.");
      }
      const userData = {
        isLoggedIn: true,
        id: data.utilisateur.id,
        name: `${data.utilisateur.prenom || ''} ${data.utilisateur.nom || ''}`.trim() || data.utilisateur.email,
        email: data.utilisateur.email,
        roles: data.utilisateur.roles,
        token: data.token,
      };
      setUser(userData);
      localStorage.setItem('movo_bailleur_user', JSON.stringify(userData));
      localStorage.setItem('movo_bailleur_token', data.token);
      loadUserData(userData.id, data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setTenantsList([]);
    setPropertiesList([]);
    setReportsList([]);
    localStorage.removeItem('movo_bailleur_user');
    localStorage.removeItem('movo_bailleur_token');
  };

  const addReport = async (report) => {
    const newReport = { ...report, id: report.id || Date.now() };
    setReportsList(prev => [newReport, ...prev]);
    
    // Also add to tenant's reports list
    setTenantsList(prev => prev.map(t => {
      if (String(t.id) === String(report.tenantId) || t.name === report.tenantName) {
        return {
          ...t,
          reports: [newReport, ...(t.reports || [])]
        };
      }
      return t;
    }));

    // Enregistrer l'avis en BD
    const targetTenantId = report.tenantId || tenantsList.find(t => t.name === report.tenantName)?.id;

    if (targetTenantId) {
      try {
        const token = user?.token || localStorage.getItem('movo_bailleur_token');
        const commentaire = report.comment || report.text || report.comments || report.commentaire || '';
        const regularitePaiement = report.regularity || report.regularitePaiement || 'Toujours à temps';
        
        const formData = new FormData();
        formData.append('sujetId', targetTenantId);
        formData.append('note', String(report.rating || 5));
        formData.append('commentaire', commentaire);
        formData.append('regularitePaiement', regularitePaiement);
        formData.append('typeAvis', 'locataire');

        if (Array.isArray(report.attachments)) {
          report.attachments.forEach(att => {
            if (att.file) {
              formData.append('piecesJointes', att.file);
            }
          });
        }

        const response = await fetch(`${API_URL}/avis`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
          console.error('Erreur API avis :', data.message);
        }
      } catch (err) {
        console.error('Erreur enregistrement avis en BD :', err);
      }
    }
  };

  const updateReportStatus = (id, status) => {
    setReportsList(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setTenantsList(prev => prev.map(t => {
      if (t.reports) {
        return {
          ...t,
          reports: t.reports.map(r => r.id === id ? { ...r, status } : r)
        };
      }
      return t;
    }));
  };

  const updateReport = async (updatedReport) => {
    setReportsList(prev => prev.map(r => {
      if (r.id === updatedReport.id || String(r.tenantId) === String(updatedReport.tenantId)) {
        return {
          ...r,
          ...updatedReport,
          propertyName: updatedReport.propertyName || r.propertyName,
          property: updatedReport.property || r.property,
          unitNumber: updatedReport.unitNumber || r.unitNumber,
        };
      }
      return r;
    }));
    setTenantsList(prev => prev.map(t => {
      if (t.reports) {
        return {
          ...t,
          reports: t.reports.map(r => {
            if (r.id === updatedReport.id || String(r.tenantId) === String(updatedReport.tenantId)) {
              return {
                ...r,
                ...updatedReport,
                propertyName: updatedReport.propertyName || r.propertyName,
                property: updatedReport.property || r.property,
                unitNumber: updatedReport.unitNumber || r.unitNumber,
              };
            }
            return r;
          })
        };
      }
      return t;
    }));

    // Enregistrer la modification de l'avis en BD
    const targetTenantId = updatedReport.tenantId || tenantsList.find(t => t.name === updatedReport.tenantName)?.id;

    if (targetTenantId) {
      try {
        const token = user?.token || localStorage.getItem('movo_bailleur_token');
        const commentaire = updatedReport.comment || updatedReport.text || updatedReport.comments || updatedReport.commentaire || '';
        const regularitePaiement = updatedReport.regularity || updatedReport.regularitePaiement || 'Toujours à temps';
        
        const formData = new FormData();
        formData.append('sujetId', targetTenantId);
        formData.append('note', String(updatedReport.rating || 5));
        formData.append('commentaire', commentaire);
        formData.append('regularitePaiement', regularitePaiement);
        formData.append('typeAvis', 'locataire');

        if (Array.isArray(updatedReport.attachments)) {
          updatedReport.attachments.forEach(att => {
            if (att.file) {
              formData.append('piecesJointes', att.file);
            }
          });
        }

        const response = await fetch(`${API_URL}/avis`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
          console.error('Erreur API modification avis :', data.message);
        }
      } catch (err) {
        console.error('Erreur enregistrement modification avis en BD :', err);
      }
    }
  };

  const getTenantScore = (tenantId) => {
    const tenant = tenantsList.find(t => t.id === Number(tenantId));
    if (!tenant) return 5.0;

    const tenantReports = [
      ...(tenant.reports || []),
      ...reportsList.filter(r => r.tenantName === tenant.name)
    ];

    // Deduplicate
    const uniqueReports = [];
    const seenIds = new Set();
    tenantReports.forEach(r => {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        uniqueReports.push(r);
      }
    });

    if (uniqueReports.length === 0) return tenant.rating || 5.0;

    let totalRating = 0;
    let totalWeight = 0;

    uniqueReports.forEach(r => {
      let weight = 1.0;
      const statusNormalized = r.status?.toLowerCase();
      if (statusNormalized === 'contesté' || statusNormalized === 'contested') {
        weight = 0.2;
      } else if (statusNormalized === 'validé' || statusNormalized === 'validated') {
        weight = 1.3;
      }
      totalRating += r.rating * weight;
      totalWeight += weight;
    });

    let baseScore = totalWeight > 0 ? (totalRating / totalWeight) : 5.0;

    // Adjust regularity
    let adjustment = 0;
    uniqueReports.forEach(r => {
      const statusNormalized = r.status?.toLowerCase();
      if (statusNormalized !== 'contesté' && statusNormalized !== 'contested') {
        if (r.regularity === 'Toujours à temps') adjustment += 0.05;
        if (r.regularity === 'Pas régulier') adjustment -= 0.4;
      }
    });

    const finalScore = Math.max(1.0, Math.min(5.0, baseScore + adjustment));
    return Math.round(finalScore * 10) / 10;
  };

  const getLandlordCredibility = () => {
    if (reportsList.length === 0) return 100;
    const contested = reportsList.filter(r => r.status === 'Contesté').length;
    const total = reportsList.length;
    const contestationRate = contested / total;
    return Math.round((1 - (contestationRate * 0.5)) * 100);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout,
      tenants: tenantsList,
      setTenants: setTenantsList,
      properties: propertiesList,
      setProperties: setPropertiesList,
      fetchMesBiens,
      fetchMesAvis,
      reports: reportsList,
      setReports: setReportsList,
      addReport,
      updateReportStatus,
      updateReport,
      getTenantScore,
      getLandlordCredibility,
      API_URL,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
