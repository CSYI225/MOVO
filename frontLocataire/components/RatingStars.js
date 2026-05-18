import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../Styles/global';

export default function RatingStars({ rating, reviewCount, showCount = false, style }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 1; i <= 5; i++) {
    let iconName = 'star-outline';
    if (i <= fullStars) {
      iconName = 'star';
    } else if (i === fullStars + 1 && hasHalfStar) {
      iconName = 'star-half';
    }
    stars.push(
      <Ionicons key={i} name={iconName} size={14} color={COLORS.star} style={{ marginRight: 2 }} />
    );
  }

  return (
    <View style={[styles.container, style]}>
      {stars}
      {showCount && (
        <Text style={styles.reviewCount}>{reviewCount} avis</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: 6,
    fontSize: 10,
    color: COLORS.secondaryText,
  },
});
