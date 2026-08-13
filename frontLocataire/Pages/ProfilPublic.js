import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';

const formatRating = (num) => {
  const val = Number(num);
  if (isNaN(val)) return '5';
  if (Number.isInteger(val)) return String(val);
  return val.toFixed(1).replace('.', ',');
};

// ── Components localisés pour correspondre exactement à DetailsProfil ──

const TimelineNode = ({ item, width = 130 }) => {
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

const ReviewItem = ({ item, onPress, isLast }) => {
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
      activeOpacity={0.7}
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
      <Text style={styles.reviewText}>{item.text}</Text>
      {!isLast && <View style={styles.reviewSeparator} />}
    </TouchableOpacity>
  );
};

import { useAuth } from '../context/AuthContext';

// ── Écran Principal de Profil Public ──

export default function ProfilPublic({ navigation }) {
  const { user, reviews, getTenantScore } = useAuth();

  const profileName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.name || user?.email || 'Locataire MOVO';
  const profileInitials = `${(user?.prenom && user.prenom[0]) || ''}${(user?.nom && user.nom[0]) || ''}`.toUpperCase() || 'MO';
  const profileLocation = 'Abidjan, Côte d\'Ivoire';
  const profileRating = getTenantScore();

  const timelineData = [];
  const reviewsData = reviews;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Bar identique à DetailsProfil */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#182C2A" />
          </TouchableOpacity>
          
          <View style={styles.profileHeaderInfo}>
            <UserAvatar initials={profileInitials} size={50} color="#E8F5E9" textColor="#4CAF50" />
            <View style={styles.profileNameContainer}>
              <Text style={styles.userName}>{profileName}</Text>
              <Text style={styles.userLocation}>{profileLocation}</Text>
            </View>
          </View>
          
          <View style={styles.ratingHeaderContainer}>
            <Text style={styles.bigRatingText}>{formatRating(profileRating)}</Text>
            <RatingStars rating={profileRating} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Historique de location */}
        <Text style={styles.sectionHeaderTitle}>Historique de location</Text>

        <View style={styles.card}>
          {timelineData.length > 0 ? (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <View style={{ position: 'relative', width: timelineData.length * 130, paddingVertical: 10 }}>
                <View
                  style={{
                    position: 'absolute', top: 40, left: 65,
                    width: (timelineData.length - 1) * 130, height: 3,
                    backgroundColor: '#E8F5E9', zIndex: 1,
                  }}
                />
                <View style={{ flexDirection: 'row' }}>
                  {timelineData.map((item) => (
                    <TimelineNode key={item.id} item={item} width={130} />
                  ))}
                </View>
              </View>
            </ScrollView>
          ) : (
            <Text style={{ fontSize: fs(12), color: '#7A8B89', textAlign: 'center', paddingVertical: 8 }}>
              Aucun historique de location enregistré.
            </Text>
          )}
        </View>

        {/* Avis propriétaires */}
        <Text style={styles.sectionHeaderTitle}>Avis propriétaires</Text>

        <View style={styles.card}>
          {reviewsData.length > 0 ? (
            reviewsData.map((item, index) => (
              <ReviewItem
                key={item.id}
                item={item}
                isLast={index === reviewsData.length - 1}
                onPress={() => navigation.navigate('DetailsAvis', {
                  review: item,
                  user: { name: profileName, initials: profileInitials, rating: profileRating }
                })}
              />
            ))
          ) : (
            <Text style={{ fontSize: fs(12), color: '#7A8B89', textAlign: 'center', paddingVertical: 8 }}>
              Aucun avis pour le moment.
            </Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerBlock: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  profileHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileNameContainer: {
    marginLeft: 12,
  },
  userName: {
    fontSize: fs(16),
    fontWeight: '700',
    color: '#F59A23', // Movo Orange
  },
  userLocation: {
    fontSize: fs(12),
    color: '#556A68',
    marginTop: 2,
  },
  ratingHeaderContainer: {
    alignItems: 'center',
  },
  bigRatingText: {
    fontSize: fs(22),
    fontWeight: '800',
    color: '#182C2A',
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: fs(15),
    fontWeight: '800',
    color: '#182C2A',
    marginLeft: 4,
    marginBottom: 12,
  },
  
  // TimelineNode styling
  timelineNodeContainer: {
    alignItems: 'center',
    flex: 1,
    zIndex: 2,
  },
  verifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  nodeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
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

  // ReviewItem styling
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTextSmall: {
    fontSize: 8,
    fontWeight: '700',
  },
  reviewText: {
    fontSize: 12,
    color: '#556A68',
    lineHeight: 18,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: '#F2F4F4',
    marginTop: 15,
  },
});
