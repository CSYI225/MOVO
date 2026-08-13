import React, { createContext, useContext, useState } from 'react';
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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // null = pas connecté, { ...data, doitChangerMdp: true } = premier login
  
  const [reviews, setReviews] = useState([]);
  const [bienActuel, setBienActuel] = useState(null);

  const updateReviewStatus = (id, status) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const getTenantScore = () => {
    if (reviews.length === 0) return 5.0;
    let totalRating = 0;
    let totalWeight = 0;
    reviews.forEach(r => {
      let weight = 1.0;
      if (r.status === 'contested') weight = 0.2;
      else if (r.status === 'validated') weight = 1.3;
      totalRating += r.rating * weight;
      totalWeight += weight;
    });
    let baseScore = totalWeight > 0 ? (totalRating / totalWeight) : 5.0;
    let adjustment = 0;
    reviews.forEach(r => {
      if (r.status !== 'contested') {
        if (r.regularitePaiement === 'Toujours à temps') adjustment += 0.05;
        if (r.regularitePaiement === 'Pas régulier') adjustment -= 0.4;
      }
    });
    const finalScore = Math.max(1.0, Math.min(5.0, baseScore + adjustment));
    return Math.round(finalScore * 10) / 10;
  };

  // Charge les avis reçus depuis le backend
  const fetchMesAvis = React.useCallback(async (tokenArg) => {
    const tokenToUse = tokenArg || user?.token;
    if (!tokenToUse) return;
    try {
      const response = await fetch(`${API_URL}/avis/mes-avis-locataire`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      const data = await response.json();
      if (response.ok && data.avis) {
        const avisFormates = data.avis.map((a) => ({
          id: a.id,
          status: a.dejaConteste ? 'contested' : null,
          date: new Date(a.publieLe).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          rating: a.note,
          text: a.commentaire,
          comment: a.commentaire,
          regularity: a.regularitePaiement,
          regularitePaiement: a.regularitePaiement,
          typeAvis: a.typeAvis,
          bailleur: a.bailleur,
          // Infos du bailleur
          location: a.bailleur
            ? `${a.bailleur.prenom || ''} ${a.bailleur.nom || ''}`.trim() || a.bailleur.email
            : 'Bailleur MOVO',
          // Infos du bien (pour ReviewCard)
          type: a.bien?.type || null,
          adresse: a.bien?.adresse || null,
          price: a.bien?.loyer || null,
          nomBien: a.bien?.nom || null,
          bien: a.bien,
          // Pièces jointes & contestation
          piecesJointes: a.piecesJointes || [],
          dejaConteste: a.dejaConteste || false,
          raisonContestation: a.raisonContestation || null,
          piecesJointesContestation: a.piecesJointesContestation || [],
        }));
        setReviews(avisFormates);
      }
    } catch (err) {
      console.error('Erreur chargement avis :', err);
    }
  }, [user?.token]);

  // Charge le bien actuellement occupé
  const fetchMonBienActuel = React.useCallback(async (tokenArg) => {
    const tokenToUse = tokenArg || user?.token;
    if (!tokenToUse) return;
    try {
      const response = await fetch(`${API_URL}/baux/mon-bien-actuel`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBienActuel(data.bienActuel || null);
      }
    } catch (err) {
      console.error('Erreur chargement bien actuel :', err);
    }
  }, [user?.token]);

  // Polling automatique toutes les 5s pour actualiser avis et bien
  React.useEffect(() => {
    if (!user?.token || user?.doitChangerMdp) return;

    // Chargement initial
    fetchMesAvis(user.token);
    fetchMonBienActuel(user.token);

    const token = user.token;
    const apiBase = API_URL;

    const tick = async () => {
      try {
        // Avis
        const r1 = await fetch(`${apiBase}/avis/mes-avis-locataire`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d1 = await r1.json();
        if (r1.ok && d1.avis) {
          const avisFormates = d1.avis.map((a) => ({
            id: a.id,
            status: a.dejaConteste ? 'contested' : null,
            date: new Date(a.publieLe).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
            rating: a.note,
            text: a.commentaire,
            comment: a.commentaire,
            regularity: a.regularitePaiement,
            regularitePaiement: a.regularitePaiement,
            typeAvis: a.typeAvis,
            bailleur: a.bailleur,
            location: a.bailleur ? `${a.bailleur.prenom || ''} ${a.bailleur.nom || ''}`.trim() || a.bailleur.email : 'Bailleur MOVO',
            type: a.bien?.type || null,
            adresse: a.bien?.adresse || null,
            price: a.bien?.loyer || null,
            nomBien: a.bien?.nom || null,
            bien: a.bien,
            piecesJointes: a.piecesJointes || [],
            dejaConteste: a.dejaConteste || false,
            raisonContestation: a.raisonContestation || null,
            piecesJointesContestation: a.piecesJointesContestation || [],
          }));
          setReviews(avisFormates);
        }

        // Bien actuel
        const r2 = await fetch(`${apiBase}/baux/mon-bien-actuel`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d2 = await r2.json();
        if (r2.ok) setBienActuel(d2.bienActuel || null);

      } catch {}
    };

    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [user?.token, user?.doitChangerMdp]);

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

      const isFirstLogin = data.utilisateur.estReclame === false;
      const userData = {
        isLoggedIn: true,
        id: data.utilisateur.id,
        prenom: data.utilisateur.prenom || '',
        nom: data.utilisateur.nom || '',
        name: `${data.utilisateur.prenom || ''} ${data.utilisateur.nom || ''}`.trim() || data.utilisateur.email,
        email: data.utilisateur.email,
        telephone: data.utilisateur.telephone,
        token: data.token,
        // Si estReclame = false → premier login, le locataire doit changer son mot de passe
        doitChangerMdp: isFirstLogin,
        tempPassword: isFirstLogin ? motDePasse : null,
      };

      setUser(userData);

      // Charger les avis depuis le backend (sauf si premier login)
      if (!isFirstLogin) {
        fetchMesAvis(data.token);
      } else {
        setReviews([]);
      }

      return { success: true, doitChangerMdp: userData.doitChangerMdp };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (prenom, nom, email, motDePasse) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, motDePasse, roleCode: 'LOCATAIRE' }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription.");
      }
      setUser({
        isLoggedIn: true,
        id: data.utilisateur.id,
        prenom: data.utilisateur.prenom || prenom,
        nom: data.utilisateur.nom || nom,
        name: `${data.utilisateur.prenom || prenom} ${data.utilisateur.nom || nom}`.trim() || data.utilisateur.email,
        email: data.utilisateur.email,
        telephone: data.utilisateur.telephone,
        token: data.token,
        doitChangerMdp: false,
      });
      setReviews([]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Changement de mot de passe temporaire lors du premier login
  const changerMotDePasseTemporaire = async (ancienMotDePasse, nouveauMotDePasse) => {
    try {
      const response = await fetch(`${API_URL}/locataires/changer-mdp-temporaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ ancienMotDePasse, nouveauMotDePasse }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe.');
      }
      // Marquer le compte comme activé et charger les avis
      setUser(prev => ({ ...prev, doitChangerMdp: false, tempPassword: null }));
      fetchMesAvis(user?.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const [hasPendingDemandes, setHasPendingDemandes] = useState(false);

  const checkPendingDemandes = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/baux/mes-demandes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.demandes) {
        const pending = data.demandes.some(d => d.statut === 'en_attente');
        setHasPendingDemandes(pending);
      }
    } catch (err) {
      console.error('Erreur check demandes en attente :', err);
    }
  };

  React.useEffect(() => {
    if (user?.token) {
      checkPendingDemandes(user.token);
      const interval = setInterval(() => checkPendingDemandes(user.token), 10000);
      return () => clearInterval(interval);
    }
  }, [user?.token]);

  const updateUserProfile = async ({ nom, prenom, email, motDePasse }) => {
    try {
      const response = await fetch(`${API_URL}/locataires/profil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ nom, prenom, email, motDePasse }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Erreur serveur (${response.status})`);
      }
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du profil.');
      }
      setUser(prev => ({
        ...prev,
        nom: data.utilisateur?.nom || nom || prev?.nom,
        prenom: data.utilisateur?.prenom || prenom || prev?.prenom,
        email: data.utilisateur?.email || email || prev?.email,
        name: data.utilisateur?.name || `${prenom} ${nom}`.trim() || prev?.name,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setReviews([]);
    setBienActuel(null);
    setHasPendingDemandes(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      reviews,
      updateReviewStatus,
      getTenantScore,
      changerMotDePasseTemporaire,
      updateUserProfile,
      hasPendingDemandes,
      checkPendingDemandes,
      fetchMesAvis,
      bienActuel,
      fetchMonBienActuel,
      API_URL,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

