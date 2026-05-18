import { Platform } from 'react-native';

export const isAndroid = Platform.OS === 'android';

// Flat font size reduction helper for Android to match iOS perfectly
export const fs = (size) => isAndroid ? Math.max(10, size - 2) : size;

export const COLORS = {
  background: '#FAFBFB', // Elegant light grey/white background
  primaryText: '#182C2A', // Deep green-black text
  secondaryText: '#556A68', // Medium teal-grey text
  orange: '#F59A23', // Movo primary brand color
  cardBackground: '#FFFFFF', // Premium white card background
  cardBorder: '#E2E8F0', // Sleek flat double-border line
  white: '#FFFFFF',
  verifiedBadge: '#C9E84F', // Lime green badge
  star: '#F5A623', // Warm yellow/orange stars
  divider: '#F2F4F4', // Soft grey divider lines
  greenAccent: '#4CAF50', // Soft active green
  lightGreen: '#E8F5E9', // Light green background for badges
};

export const SIZES = {
  h1: 24,
  h2: 20,
  h3: 18,
  body1: 16,
  body2: 14,
  small: 12,
  radius: 16,
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
