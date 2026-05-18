import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../Styles/global';
import UserAvatar from './UserAvatar';

const UserRow = ({ item, onPress }) => (
  <TouchableOpacity 
    style={styles.userRow}
    onPress={onPress}
  >
    <UserAvatar initials={item.initials} size={60} color="#C3CECD" />
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{item.name}</Text>
      <View style={styles.locationContainer}>
        <View style={styles.greenDot} />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
    </View>
    <View style={styles.ratingContainer}>
      <View style={styles.ratingHeaderRow}>
        <Ionicons name="star" size={14} color="#F5A623" />
        <Text style={styles.ratingText}>{item.rating.toString().replace('.', ',')}</Text>
      </View>
      <Text style={styles.reviewCountText}>{item.reviewCount} avis</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: SIZES.padding,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.orange,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#84B889',
    marginRight: 6,
  },
  locationText: {
    fontSize: SIZES.small,
    color: COLORS.secondaryText,
  },
  ratingContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ratingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontWeight: 'bold',
    fontSize: SIZES.body2,
    color: COLORS.primaryText,
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 10,
    color: COLORS.secondaryText,
  },
});

export default UserRow;
