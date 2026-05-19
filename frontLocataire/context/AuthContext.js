import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [reviews, setReviews] = useState([
    { id: '1', status: 'validated', date: 'Mars 2024', rating: 5, text: "Excellent locataire, loyer toujours réglé en avance.", location: 'Abidjan, Cocody', relation: 'Vérifiée', type: 'Duplex', price: '15 000 000 FCFA', regularity: 'Toujours à temps' },
    { id: '2', status: null, date: 'Février 2024', rating: 4.5, text: "Bon locataire, il paye toujours son loyer à temps.", location: 'Abidjan, Marcory', relation: 'Vérifiée', type: 'Appartement', price: '350 000 FCFA', regularity: 'Toujours à temps' },
    { id: '3', status: 'contested', date: 'Janvier 2024', rating: 3, text: "Rapport contesté concernant des retards prétendus.", location: 'Bouaké, Nimbo', relation: 'Non vérifiée', type: 'Studio', price: '75 000 FCFA', regularity: 'Pas régulier' },
    { id: '4', status: null, date: 'Décembre 2023', rating: 4.8, text: "Très soigneux avec le logement et discret.", location: 'Abidjan, Cocody', relation: 'Vérifiée', type: 'Duplex', price: '15 000 000 FCFA', regularity: 'Toujours à temps' },
  ]);

  const updateReviewStatus = (id, status) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const getTenantScore = () => {
    let totalRating = 0;
    let totalWeight = 0;
    
    reviews.forEach(r => {
      let weight = 1.0;
      if (r.status === 'contested') {
        weight = 0.2; // La contestation réduit grandement le poids de la note négative
      } else if (r.status === 'validated') {
        weight = 1.3; // Les avis validés par le locataire ont plus de poids
      }
      totalRating += r.rating * weight;
      totalWeight += weight;
    });

    let baseScore = totalWeight > 0 ? (totalRating / totalWeight) : 5.0;

    // Ajustement de régularité
    let adjustment = 0;
    reviews.forEach(r => {
      if (r.status !== 'contested') {
        if (r.regularity === 'Toujours à temps') adjustment += 0.05;
        if (r.regularity === 'Pas régulier') adjustment -= 0.4;
      }
    });

    const finalScore = Math.max(1.0, Math.min(5.0, baseScore + adjustment));
    return Math.round(finalScore * 10) / 10;
  };

  const login = (name, email) => {
    setUser({
      isLoggedIn: true,
      name,
      email,
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, reviews, updateReviewStatus, getTenantScore }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
