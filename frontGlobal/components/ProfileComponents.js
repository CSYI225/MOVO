import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../Styles/global';
import RatingStars from './RatingStars';

export const TimelineNode = ({ item, width = 130 }) => {
  const relation = item.relation || 'Vérifiée';
  
  let badgeBg = '#E8F5E9';
  let badgeText = '#4CAF50';
  
  if (relation === 'Non vérifiée') {
    badgeBg = '#FFF3E0';
    badgeText = '#FF9800';
  } else if (relation === 'Refusée') {
    badgeBg = '#FDF2F2';
    badgeText = '#F25C69';
  }

  return (
    <View style={[styles.timelineNodeContainer, { width }]}>
      <View style={[
        styles.verifiedBadge,
        { backgroundColor: badgeBg, borderColor: badgeBg }
      ]}>
        <Text style={[
          styles.verifiedText,
          { color: badgeText }
        ]}>
          {relation}
        </Text>
      </View>
      <View style={styles.nodeCircle}>
        <View style={styles.innerCircle} />
      </View>
      <Text style={styles.nodeLocation}>{item.location}</Text>
      <Text style={styles.nodeDate}>{item.date}</Text>
    </View>
  );
};

export const ReviewItem = ({ item, onPress, isLast }) => {
  const relation = item.relation || 'Vérifiée';
  
  let badgeBg = '#C9E84F';
  let badgeText = '#182C2A';
  
  if (relation === 'Non vérifiée') {
    badgeBg = '#FFF3E0';
    badgeText = '#FF9800';
  } else if (relation === 'Refusée') {
    badgeBg = '#FDF2F2';
    badgeText = '#F25C69';
  }

  return (
    <TouchableOpacity 
      style={styles.reviewItem}
      onPress={onPress}
    >
      <View style={styles.reviewHeaderRow}>
        <Text style={styles.reviewLocation}>{item.location}</Text>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>
      <View style={styles.reviewSubRow}>
        <RatingStars rating={item.rating} />
        <View style={[styles.verifiedBadgeSmall, { backgroundColor: badgeBg }]}>
          <Text style={[styles.verifiedTextSmall, { color: badgeText }]}>
            {relation}
          </Text>
        </View>
      </View>
      <Text style={styles.reviewText}>
        {item.text}
      </Text>
      {!isLast && <View style={styles.reviewSeparator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  timelineNodeContainer: {
    alignItems: 'center',
    flex: 1,
    zIndex: 2,
  },
  verifiedBadge: {
    backgroundColor: COLORS.verifiedBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.primaryText,
  },
  nodeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50', // Modern premium emerald green bullet
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  nodeLocation: {
    fontSize: 10,
    fontWeight: '700',
    color: '#182C2A',
    textAlign: 'center',
  },
  nodeDate: {
    fontSize: 9,
    color: '#556A68',
    textAlign: 'center',
    marginTop: 2,
  },
  reviewItem: {
    marginBottom: 15,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewLocation: {
    fontSize: 13,
    fontWeight: '700',
    color: '#182C2A',
  },
  reviewDate: {
    fontSize: 11,
    color: '#7A8B89',
  },
  reviewSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedBadgeSmall: {
    backgroundColor: '#C9E84F', // Vibrant verified green badge
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTextSmall: {
    fontSize: 8,
    fontWeight: '700',
    color: '#182C2A',
  },
  reviewText: {
    fontSize: 12,
    color: '#556A68',
    lineHeight: 18,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: '#F2F4F4', // Thin light gray separator divider
    marginTop: 15,
  },
});
