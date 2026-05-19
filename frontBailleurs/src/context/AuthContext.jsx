import React, { createContext, useContext, useState } from 'react';
import { tenants as initialTenants, properties as initialProperties, reports as initialReports } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('movo_bailleur_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tenantsList, setTenantsList] = useState(initialTenants);
  const [propertiesList, setPropertiesList] = useState(initialProperties);
  const [reportsList, setReportsList] = useState(initialReports);

  const login = (name, email) => {
    const newUser = { isLoggedIn: true, name, email };
    setUser(newUser);
    localStorage.setItem('movo_bailleur_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('movo_bailleur_user');
  };

  const addReport = (report) => {
    const newReport = { ...report, id: Date.now() };
    setReportsList(prev => [newReport, ...prev]);
    
    // Also add to tenant's reports list
    setTenantsList(prev => prev.map(t => {
      if (t.name === report.tenantName) {
        return {
          ...t,
          reports: [newReport, ...(t.reports || [])]
        };
      }
      return t;
    }));
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

  const updateReport = (updatedReport) => {
    setReportsList(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
    setTenantsList(prev => prev.map(t => {
      if (t.reports) {
        return {
          ...t,
          reports: t.reports.map(r => r.id === updatedReport.id ? updatedReport : r)
        };
      }
      return t;
    }));
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
      logout,
      tenants: tenantsList,
      setTenants: setTenantsList,
      properties: propertiesList,
      setProperties: setPropertiesList,
      reports: reportsList,
      setReports: setReportsList,
      addReport,
      updateReportStatus,
      updateReport,
      getTenantScore,
      getLandlordCredibility
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
