import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';
import { TimelineNode, ReviewItem } from '../components/ProfileComponents';
import { useAuth } from '../context/AuthContext';

const TIMELINE_BY_USER = {
  '1': [
    { id: '1', location: 'Abidjan, Cocody', date: 'Jul 2023 - Présent', relation: 'Vérifiée' },
    { id: '2', location: 'Abidjan, Marcory', date: 'Jan 2021 - Jui 2023', relation: 'Vérifiée' },
    { id: '3', location: 'Bouaké, Nimbo', date: 'Fév 2018 - Déc 2020', relation: 'Non vérifiée' },
  ],
  '2': [
    { id: '1', location: 'Abidjan, Marcory', date: 'Oct 2022 - Présent', relation: 'Vérifiée' },
    { id: '2', location: 'Abidjan, Cocody', date: 'Mar 2020 - Sep 2022', relation: 'Refusée' },
  ],
  '3': [
    { id: '1', location: 'Bouaké, Nimbo', date: 'Jan 2023 - Présent', relation: 'Non vérifiée' },
  ],
  '4': [
    { id: '1', location: 'Abidjan, Yopougon', date: 'Mai 2021 - Présent', relation: 'Vérifiée' },
    { id: '2', location: 'Korhogo', date: 'Fév 2019 - Avr 2021', relation: 'Non vérifiée' },
  ],
  '5': [
    { id: '1', location: 'San Pedro, Lac', date: 'Sep 2023 - Présent', relation: 'Vérifiée' },
    { id: '2', location: 'Abidjan, Treichville', date: 'Jan 2021 - Aoû 2023', relation: 'Vérifiée' },
  ],
  '6': [
    { id: '1', location: 'Abidjan, Plateau', date: 'Jan 2024 - Présent', relation: 'Vérifiée' },
  ],
  '7': [
    { id: '1', location: 'Abidjan, Treichville', date: 'Nov 2022 - Présent', relation: 'Vérifiée' },
  ],
  '8': [
    { id: '1', location: 'Korhogo', date: 'Mar 2023 - Présent', relation: 'Refusée' },
  ],
};

const REVIEWS_BY_USER = {
  '1': [
    { id: '1', location: 'Abidjan, Cocody', date: 'Mar 2024', rating: 5, text: "Excellent locataire, très courtois, discret, et paye toujours son loyer en avance. Les lieux ont été rendus dans un état impeccable.", relation: 'Vérifiée' },
    { id: '2', location: 'Abidjan, Marcory', date: 'Jui 2023', rating: 4, text: "Locataire très correct, respectueux des règles de la copropriété. Rien à signaler.", relation: 'Vérifiée' },
    { id: '3', location: 'Bouaké, Nimbo', date: 'Déc 2020', rating: 5, text: "Très bonne communication tout au long du bail. Je le recommande vivement.", relation: 'Non vérifiée' },
  ],
  '2': [
    { id: '1', location: 'Abidjan, Marcory', date: 'Avr 2024', rating: 5, text: "Amélie est une locataire exemplaire, très attentive à l'entretien de l'appartement. C'était un plaisir de l'avoir comme locataire.", relation: 'Vérifiée' },
    { id: '2', location: 'Abidjan, Cocody', date: 'Aoû 2022', rating: 4.8, text: "Rien à redire, paiement des loyers à date fixe, relationnel chaleureux.", relation: 'Refusée' },
  ],
  '3': [
    { id: '1', location: 'Bouaké, Nimbo', date: 'Jan 2024', rating: 4.2, text: "Traoré est très calme et respectueux, bien que le contrat soit géré en direct. Logement propre.", relation: 'Non vérifiée' },
  ],
  '4': [
    { id: '1', location: 'Abidjan, Yopougon', date: 'Fév 2024', rating: 3.8, text: "Paiements réguliers mais des retards occasionnels de quelques jours, toujours régularisés.", relation: 'Vérifiée' },
    { id: '2', location: 'Korhogo', date: 'Avr 2021', rating: 3.5, text: "Relation décentralisée correcte.", relation: 'Non vérifiée' },
  ],
  '5': [
    { id: '1', location: 'San Pedro, Lac', date: 'Mar 2024', rating: 4.5, text: "Fatou prend grand soin du logement. Nous sommes très satisfaits de cette location.", relation: 'Vérifiée' },
  ],
  '6': [
    { id: '1', location: 'Abidjan, Plateau', date: 'Fév 2024', rating: 5, text: "Paul est extrêmement rigoureux et poli. Paiements toujours instantanés.", relation: 'Vérifiée' },
  ],
  '7': [
    { id: '1', location: 'Abidjan, Treichville', date: 'Déc 2023', rating: 4.1, text: "Awa est une bonne locataire, respectueuse et discrète.", relation: 'Vérifiée' },
  ],
  '8': [
    { id: '1', location: 'Korhogo', date: 'Nov 2023', rating: 4.6, text: "Moussa est très sérieux et disponible.", relation: 'Refusée' },
  ],
};

export default function DetailsProfil({ route, navigation }) {
  const { user, canViewProfile, consumeCredit, getTenantScore, reviewsByUser } = useAuth();
  const isVisitor = user?.role === 'visitor';
  const { user: profileUser } = route.params || {};

  const userId = profileUser?.id || '1';
  const hasAccess = canViewProfile(userId);
  const timelineData = TIMELINE_BY_USER[userId] || TIMELINE_BY_USER['1'];
  const reviewsData = reviewsByUser[userId] || [];

  const profileName = profileUser?.name || "Coulibaly Sékou";
  const profileInitials = profileUser?.initials || "CS";
  const profileLocation = profileUser?.location || "Abidjan, Cocody";
  const profileRating = getTenantScore(userId);

  const PaywallCard = () => (
    <View style={styles.paywallCard}>
      <View style={styles.paywallIconRow}>
        <View style={styles.paywallIconCircle}>
          <Ionicons name="lock-closed" size={24} color="#F59A23" />
        </View>
      </View>
      <Text style={styles.paywallTitle}>Accès Complet</Text>
      <Text style={styles.paywallSubtitle}>
        Débloquez l'historique complet et tous les avis de ce profil
      </Text>
      <View style={styles.paywallButtons}>
        {user?.accessCredits > 0 ? (
          <TouchableOpacity style={styles.paywallBtnPrimary} onPress={() => consumeCredit(userId)}>
            <Text style={styles.paywallBtnPrimaryText}>Débloquer (1 crédit)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.paywallBtnPrimary} onPress={() => navigation.navigate('Abonnement')}>
            <Text style={styles.paywallBtnPrimaryText}>Payer 500 FCFA</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.paywallBtnSecondary}
          onPress={() => navigation.navigate('Abonnement')}
        >
          <Text style={styles.paywallBtnSecondaryText}>S'abonner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Redesigned clean, modern flat white Header Bar */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#182C2A" />
          </TouchableOpacity>
          
          <View style={styles.profileHeaderInfo}>
            <UserAvatar initials={profileInitials} size={50} color="#E8F5E9" textColor="#4CAF50" photo={user?.avatar} />
            <View style={styles.profileNameContainer}>
              <Text style={styles.userName}>{profileName}</Text>
              <Text style={styles.userLocation}>{profileLocation}</Text>
            </View>
          </View>
          
          <View style={styles.ratingHeaderContainer}>
            <Text style={styles.bigRatingText}>{profileRating.toString().replace('.', ',')}</Text>
            <RatingStars rating={profileRating} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Historique de location */}
        <Text style={styles.sectionHeaderTitle}>Historique de location</Text>

        {!hasAccess ? (
          <PaywallCard />
        ) : (
          <View style={styles.card}>
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
          </View>
        )}

        {/* Avis propriétaires */}
        <Text style={styles.sectionHeaderTitle}>Avis propriétaires</Text>

        <View style={styles.card}>
          {reviewsData.map((item, index) => (
            <ReviewItem
              key={item.id}
              item={item}
              isLast={index === reviewsData.length - 1}
              blurred={!hasAccess}
              onPress={() => navigation.navigate('DetailsAvis', {
                review: item,
                user: { name: profileName, initials: profileInitials, rating: profileRating, avatar: profileUser?.avatar }
              })}
            />
          ))}
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
    color: '#F59A23', // Clean Movo orange
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
    backgroundColor: '#FFFFFF', // Modern crisp white
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#182C2A', // Premium dark green text
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: fs(15),
    fontWeight: '800',
    color: '#182C2A',
    marginLeft: 4,
    marginBottom: 12,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    marginTop: 10,
    marginBottom: 10,
  },
  timelineLine: {
    position: 'absolute',
    top: 25,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#E8F5E9', // Light green connecting line
    zIndex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rowLabel: {
    fontSize: fs(13),
    color: '#556A68',
  },
  rowValue: {
    fontSize: fs(13),
    fontWeight: '700',
    color: '#182C2A',
  },
  rowValueBold: {
    fontSize: fs(13),
    fontWeight: '800',
    color: '#182C2A',
  },
  greenBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  greenBadgeText: {
    color: '#4CAF50',
    fontWeight: '800',
    fontSize: fs(11),
  },
  grayBadge: {
    backgroundColor: '#FAFBFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  grayBadgeText: {
    color: '#7A8B89',
    fontWeight: '800',
    fontSize: fs(11),
  },

  // ── Paywall Card ───────────────────────────────────────
  paywallCard: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1.5,
    borderColor: '#FFE082',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  paywallIconRow: { marginBottom: 12 },
  paywallIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#FFE082',
    justifyContent: 'center', alignItems: 'center',
  },
  paywallTitle: {
    fontSize: fs(16), fontWeight: '800', color: '#182C2A', marginBottom: 6,
  },
  paywallSubtitle: {
    fontSize: fs(12), color: '#7A8B89', textAlign: 'center', lineHeight: 17, marginBottom: 16,
  },
  paywallButtons: { flexDirection: 'row', gap: 10 },
  paywallBtnPrimary: {
    backgroundColor: '#F59A23', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
  },
  paywallBtnPrimaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: fs(13) },
  paywallBtnSecondary: {
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
  },
  paywallBtnSecondaryText: { color: '#182C2A', fontWeight: '700', fontSize: fs(13) },
});

