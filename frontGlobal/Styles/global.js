import { Platform } from 'react-native';

export const isAndroid = Platform.OS === 'android';

// Flat font size reduction helper for Android to match iOS perfectly
export const fs = (size) => isAndroid ? Math.max(10, size - 2) : size;

export const COLORS = {
  background: '#CED8D7', // Gris bleuté de fond
  primaryText: '#182C2A', // Texte foncé
  secondaryText: '#556A68', // Texte secondaire
  orange: '#F59A23', // Couleur des noms et titres
  cardBackground: '#C3CECD', // Fond des cartes (Mockup 2)
  cardBorder: '#84B889', // Bordure verte des cartes (Mockup 2)
  white: '#FFFFFF', // Fond blanc (Mockup 1)
  verifiedBadge: '#C9E84F', // Badge vert clair
  star: '#F5A623', // Étoiles jaunes/oranges
  divider: '#B5C4C2', // Lignes de séparation
};

export const SIZES = {
  h1: 24,
  h2: 20,
  h3: 18,
  body1: 16,
  body2: 14,
  small: 12,
  radius: 12,
  padding: 16,
};

export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primaryText,
  },
};
