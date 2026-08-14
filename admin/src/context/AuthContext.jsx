import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const savedUser = localStorage.getItem('movo_admin_user');
    const savedToken = localStorage.getItem('movo_admin_token');
    return savedUser && savedToken ? JSON.parse(savedUser) : null;
  });

  const API_URL = 'http://localhost:5000/api';

  const login = async (identifiant, motDePasse) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiant, motDePasse }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion.');
      }

      // Vérifier que l'utilisateur est bien un ADMIN
      const isRoleAdmin = data.utilisateur.roles && data.utilisateur.roles.includes('ADMIN');
      if (!isRoleAdmin) {
        throw new Error("Accès refusé. Vous n'avez pas les droits d'administration MOVO.");
      }

      const adminData = {
        id: data.utilisateur.id,
        email: data.utilisateur.email,
        name: `${data.utilisateur.prenom || ''} ${data.utilisateur.nom || ''}`.trim() || data.utilisateur.email,
        roles: data.utilisateur.roles,
        token: data.token,
      };

      setAdmin(adminData);
      localStorage.setItem('movo_admin_user', JSON.stringify(adminData));
      localStorage.setItem('movo_admin_token', data.token);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('movo_admin_user');
    localStorage.removeItem('movo_admin_token');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
