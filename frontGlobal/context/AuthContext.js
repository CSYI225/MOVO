import React, { createContext, useContext, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
const PUBLIC_URL = `${API_URL}/public`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ── Connexion ───────────────────────────────────────────
  const login = async (uiRole, identifiant, motDePasse) => {
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
      const roleMapped = uiRole || (data.utilisateur.roles?.includes('BAILLEUR') ? 'bailleur' : 'visitor');
      setUser({
        isLoggedIn: true,
        id: data.utilisateur.id,
        role: roleMapped,
        name: `${data.utilisateur.prenom || ''} ${data.utilisateur.nom || ''}`.trim() || data.utilisateur.email,
        email: data.utilisateur.email,
        token: data.token,
        accessCredits: 0,
        totalPurchasedCredits: 0,
        unlockedProfiles: [],
        subscription: null,
        invoices: [],
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ── Inscription ──────────────────────────────────────────
  const register = async (uiRole, prenom, nom, email, motDePasse) => {
    try {
      const roleCode = uiRole === 'landlord' || uiRole === 'bailleur' ? 'BAILLEUR' : 'VISITEUR';
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, motDePasse, roleCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription.");
      }
      setUser({
        isLoggedIn: true,
        id: data.utilisateur.id,
        role: uiRole || 'visitor',
        name: `${data.utilisateur.prenom || ''} ${data.utilisateur.nom || ''}`.trim() || data.utilisateur.email,
        email: data.utilisateur.email,
        token: data.token,
        accessCredits: 0,
        totalPurchasedCredits: 0,
        unlockedProfiles: [],
        subscription: null,
        invoices: [],
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ── Déconnexion ─────────────────────────────────────────
  const logout = () => setUser(null);

  // ── Helper : générer un reçu ────────────────────────────
  const generateInvoice = (amount, planName) => {
    const id = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    return { id, date, amount, status: 'Payé', planName };
  };

  // ── Achat d'un accès ponctuel (500 FCFA = +3 crédits) ────
  const purchaseAccess = (amount = '500 FCFA', planName = 'Accès Ponctuel') => {
    setUser(prev => ({
      ...prev,
      accessCredits: (prev.accessCredits || 0) + 3,
      totalPurchasedCredits: (prev.totalPurchasedCredits || 0) + 3,
      invoices: [generateInvoice(amount, planName), ...(prev.invoices || [])]
    }));
  };

  // ── Consommer un crédit pour débloquer un profil ────────
  const consumeCredit = (profileId) => {
    setUser(prev => {
      if ((prev.accessCredits || 0) <= 0) return prev;
      if (prev.unlockedProfiles?.includes(profileId)) return prev;
      return {
        ...prev,
        accessCredits: prev.accessCredits - 1,
        unlockedProfiles: [...(prev.unlockedProfiles || []), profileId]
      };
    });
  };

  // ── Souscrire à un abonnement visiteur ──────────────────
  const subscribe = (plan, amount, planName) => {
    const now = new Date();
    const daysMap = { week: 7, month: 30, year: 365 };
    const days = daysMap[plan] || 30;
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    setUser(prev => ({
      ...prev,
      subscription: { plan, startDate: now.toISOString(), expiresAt },
      accessCredits: 0,
      invoices: [generateInvoice(amount, planName), ...(prev.invoices || [])]
    }));
  };

  // ── Helpers ─────────────────────────────────────────────
  const hasActiveSubscription = () => {
    if (!user?.subscription) return false;
    return new Date(user.subscription.expiresAt) > new Date();
  };

  const canViewProfile = (profileId) => {
    if (user?.role !== 'visitor') return true;
    return hasActiveSubscription() || (user?.unlockedProfiles || []).includes(profileId);
  };

  // ══════════════════════════════════════════════════════════
  // ── API CALLS : Données réelles depuis le backend ────────
  // ══════════════════════════════════════════════════════════

  /**
   * Rechercher des locataires via l'API publique
   * @param {string} query - Terme de recherche
   * @param {number} page - Numéro de page (1 par défaut)
   * @param {number} limit - Nombre de résultats (20 par défaut)
   * @returns {{ locataires: Array, total: number }}
   */
  const fetchLocataires = useCallback(async (query = '', page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        ...(query ? { q: query } : {}),
        page: String(page),
        limit: String(limit),
      });
      const response = await fetch(`${PUBLIC_URL}/locataires?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur serveur');
      return { locataires: data.locataires || [], total: data.total || 0 };
    } catch (error) {
      console.error('fetchLocataires error:', error);
      return { locataires: [], total: 0 };
    }
  }, []);

  /**
   * Obtenir le profil complet d'un locataire
   * @param {string} id - ID du locataire
   */
  const fetchLocataireById = useCallback(async (id) => {
    try {
      const response = await fetch(`${PUBLIC_URL}/locataires/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Introuvable');
      return data.locataire || null;
    } catch (error) {
      console.error('fetchLocataireById error:', error);
      return null;
    }
  }, []);

  /**
   * Obtenir les avis publics d'un locataire
   * @param {string} id - ID du locataire
   */
  const fetchAvisLocataire = useCallback(async (id) => {
    try {
      const response = await fetch(`${PUBLIC_URL}/locataires/${id}/avis`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');
      return data.avis || [];
    } catch (error) {
      console.error('fetchAvisLocataire error:', error);
      return [];
    }
  }, []);

  /**
   * Obtenir l'historique de location d'un locataire
   * @param {string} id - ID du locataire
   */
  const fetchHistoriqueLocataire = useCallback(async (id) => {
    try {
      const response = await fetch(`${PUBLIC_URL}/locataires/${id}/historique`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');
      return data.historique || [];
    } catch (error) {
      console.error('fetchHistoriqueLocataire error:', error);
      return [];
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      purchaseAccess,
      consumeCredit,
      subscribe,
      hasActiveSubscription,
      canViewProfile,
      // API calls
      fetchLocataires,
      fetchLocataireById,
      fetchAvisLocataire,
      fetchHistoriqueLocataire,
      API_URL,
      PUBLIC_URL,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
