import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ── Connexion ───────────────────────────────────────────
  const login = (role, name, email) => {
    setUser({
      isLoggedIn: true,
      role,          // 'visitor' | 'bailleur'
      name,
      email,
      accessCredits: 0,   // crédits ponctuel actuels
      totalPurchasedCredits: 0, // historique total pour les stats (dénominateur)
      unlockedProfiles: [], // IDs des profils débloqués
      subscription: null,  // { plan: 'week'|'month'|'year', startDate, expiresAt }
      invoices: [],        // historique des reçus de paiement
    });
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

  // ── Consommer un crédit pour débloquer un profil spécifique ────
  const consumeCredit = (profileId) => {
    setUser(prev => {
      if ((prev.accessCredits || 0) <= 0) return prev;
      if (prev.unlockedProfiles?.includes(profileId)) return prev; // Déjà débloqué
      
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
      accessCredits: 0, // les crédits ponctuels deviennent inutiles
      invoices: [generateInvoice(amount, planName), ...(prev.invoices || [])]
    }));
  };

  // ── Helpers ─────────────────────────────────────────────
  const hasActiveSubscription = () => {
    if (!user?.subscription) return false;
    return new Date(user.subscription.expiresAt) > new Date();
  };

  /**
   * Le visiteur peut voir un profil complet si :
   *  - il a un abonnement actif, OU
   *  - ce profil spécifique a été débloqué
   */
  const canViewProfile = (profileId) => {
    if (user?.role !== 'visitor') return true; // bailleurs = toujours OK
    return hasActiveSubscription() || (user?.unlockedProfiles || []).includes(profileId);
  };

  const [reviewsByUser, setReviewsByUser] = useState({
    '1': [
      { id: '1', status: 'validated', location: 'Abidjan, Cocody', date: 'Mar 2024', rating: 5, text: "Excellent locataire, très courtois, discret, et paye toujours son loyer en avance. Les lieux ont été rendus dans un état impeccable.", relation: 'Vérifiée', regularity: 'Toujours à temps' },
      { id: '2', status: null, location: 'Abidjan, Marcory', date: 'Jui 2023', rating: 4, text: "Locataire très correct, respectueux des règles de la copropriété. Rien à signaler.", relation: 'Vérifiée', regularity: 'Toujours à temps' },
      { id: '3', status: 'contested', location: 'Bouaké, Nimbo', date: 'Déc 2020', rating: 5, text: "Très bonne communication tout au long du bail. Je le recommande vivement.", relation: 'Non vérifiée', regularity: 'Toujours à temps' },
    ],
    '2': [
      { id: '1', status: 'validated', location: 'Abidjan, Marcory', date: 'Avr 2024', rating: 5, text: "Amélie est une locataire exemplaire, très attentive à l'entretien de l'appartement. C'était un plaisir de l'avoir comme locataire.", relation: 'Vérifiée', regularity: 'Toujours à temps' },
      { id: '2', status: null, location: 'Abidjan, Cocody', date: 'Aoû 2022', rating: 4.8, text: "Rien à redire, paiement des loyers à date fixe, relationnel chaleureux.", relation: 'Refusée', regularity: 'Toujours à temps' },
    ],
    '3': [
      { id: '1', status: null, location: 'Bouaké, Nimbo', date: 'Jan 2024', rating: 4.2, text: "Traoré est très calme et respectueux, bien que le contrat soit géré en direct. Logement propre.", relation: 'Non vérifiée', regularity: 'Peu de retard' },
    ],
    '4': [
      { id: '1', status: null, location: 'Abidjan, Yopougon', date: 'Fév 2024', rating: 3.8, text: "Paiements réguliers mais des retards occasionnels de quelques jours, toujours régularisés.", relation: 'Vérifiée', regularity: 'Peu de retard' },
      { id: '2', status: null, location: 'Korhogo', date: 'Avr 2021', rating: 3.5, text: "Relation décentralisée correcte.", relation: 'Non vérifiée', regularity: 'Pas régulier' },
    ],
  });

  const getTenantScore = (userId) => {
    const userReviews = reviewsByUser[userId] || [];
    if (userReviews.length === 0) return 5.0;

    let totalRating = 0;
    let totalWeight = 0;

    userReviews.forEach(r => {
      let weight = 1.0;
      if (r.status === 'contested') {
        weight = 0.2;
      } else if (r.status === 'validated') {
        weight = 1.3;
      }
      totalRating += r.rating * weight;
      totalWeight += weight;
    });

    let baseScore = totalWeight > 0 ? (totalRating / totalWeight) : 5.0;

    // Ajustement de régularité
    let adjustment = 0;
    userReviews.forEach(r => {
      if (r.status !== 'contested') {
        if (r.regularity === 'Toujours à temps') adjustment += 0.05;
        if (r.regularity === 'Pas régulier') adjustment -= 0.4;
      }
    });

    const finalScore = Math.max(1.0, Math.min(5.0, baseScore + adjustment));
    return Math.round(finalScore * 10) / 10;
  };

  const updateReviewStatus = (userId, reviewId, status) => {
    setReviewsByUser(prev => {
      const userReviews = prev[userId] || [];
      const updated = userReviews.map(r => r.id === reviewId ? { ...r, status } : r);
      return { ...prev, [userId]: updated };
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      purchaseAccess,
      consumeCredit,
      subscribe,
      hasActiveSubscription,
      canViewProfile,
      reviewsByUser,
      getTenantScore,
      updateReviewStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
