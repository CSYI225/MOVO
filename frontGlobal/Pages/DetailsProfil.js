import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';
import { TimelineNode, ReviewItem } from '../components/ProfileComponents';
import { useAuth } from '../context/AuthContext';

const formatRating = (num) => {
  const val = Number(num);
  if (isNaN(val)) return '5';
  if (Number.isInteger(val)) return String(val);
  return val.toFixed(1).replace('.', ',');
};

export default function DetailsProfil({ route, navigation }) {
  const { user, canViewProfile, consumeCredit, fetchAvisLocataire, fetchHistoriqueLocataire } = useAuth();
  const isVisitor = user?.role === 'visitor';

  // On récupère soit l'ID seul, soit un objet locataireBasic passé depuis la liste
  const { locataireId, locataireBasic } = route.params || {};
  const userId = locataireId || locataireBasic?.id;

  const hasAccess = canViewProfile(userId);

  // Données de base (passées depuis la liste ou chargées)
  const [profileData, setProfileData] = useState(locataireBasic || null);
  const [avis, setAvis] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadDetails();
  }, [userId]);

  const loadDetails = async () => {
    setLoadingDetails(true);
    const [avisData, histData] = await Promise.all([
      fetchAvisLocataire(userId),
      fetchHistoriqueLocataire(userId),
    ]);
    setAvis(avisData);
    setHistorique(histData);
    setLoadingDetails(false);
  };

  const profileName = profileData?.name || 'Locataire';
  const profileInitials = profileData?.initials || 'LC';
  const profileLocation = profileData?.location || 'Côte d\'Ivoire';
  const profileRating = profileData?.rating ?? 5.0;
  const reviewCount = profileData?.reviewCount ?? avis.length;

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
        <TouchableOpacity style={styles.paywallBtnSecondary} onPress={() => navigation.navigate('Abonnement')}>
          <Text style={styles.paywallBtnSecondaryText}>S'abonner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
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
            <Text style={styles.reviewCountSmall}>{reviewCount} avis</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* HISTORIQUE DE LOCATION */}
        <Text style={styles.sectionHeaderTitle}>Historique de location</Text>

        {loadingDetails ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#84B889" />
          </View>
        ) : !hasAccess ? (
          <PaywallCard />
        ) : historique.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>Aucun historique disponible.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ position: 'relative', width: historique.length * 130, paddingVertical: 10 }}>
                <View
                  style={{
                    position: 'absolute', top: 40, left: 65,
                    width: (historique.length - 1) * 130, height: 3,
                    backgroundColor: '#E8F5E9', zIndex: 1,
                  }}
                />
                <View style={{ flexDirection: 'row' }}>
                  {historique.map((item) => (
                    <TimelineNode key={item.id} item={item} width={130} />
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {/* AVIS PROPRIÉTAIRES */}
        <Text style={styles.sectionHeaderTitle}>Avis propriétaires</Text>

        {loadingDetails ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#84B889" />
          </View>
        ) : avis.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>Aucun avis pour ce locataire.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {avis.map((item, index) => {
              // Adapter les données de l'API au format attendu par ReviewItem
              const reviewFormatted = {
                id: item.id,
                status: item.dejaConteste ? 'contested' : null,
                date: new Date(item.publieLe).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
                rating: item.note,
                text: item.commentaire,
                location: item.bien?.location || 'Côte d\'Ivoire',
                relation: 'Vérifiée',
                regularity: item.regularitePaiement,
                bien: item.bien,
                bailleur: item.bailleur,
              };
              return (
                <ReviewItem
                  key={item.id}
                  item={reviewFormatted}
                  isLast={index === avis.length - 1}
                  blurred={!hasAccess}
                  onPress={() => navigation.navigate('DetailsAvis', {
                    review: reviewFormatted,
                    avisComplet: item,
                    user: {
                      name: profileName,
                      initials: profileInitials,
                      rating: profileRating,
                      avatar: null,
                    },
                  })}
                />
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFBFB' },
  scrollContent: { padding: 16, paddingTop: 10, paddingBottom: 40 },
  headerBlock: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F2F4F4',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { marginRight: 12, padding: 4 },
  profileHeaderInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  profileNameContainer: { marginLeft: 12 },
  userName: { fontSize: fs(16), fontWeight: '700', color: '#F59A23' },
  userLocation: { fontSize: fs(12), color: '#556A68', marginTop: 2 },
  ratingHeaderContainer: { alignItems: 'center' },
  bigRatingText: { fontSize: fs(22), fontWeight: '800', color: '#182C2A', marginBottom: 2 },
  reviewCountSmall: { fontSize: fs(11), color: '#7A8B89', marginTop: 2 },

  sectionHeaderTitle: {
    fontSize: fs(15), fontWeight: '800', color: '#182C2A', marginLeft: 4, marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0', padding: 20, marginBottom: 20,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    padding: 30, marginBottom: 20, alignItems: 'center',
  },
  emptyText: { fontSize: fs(13), color: '#7A8B89', textAlign: 'center' },

  paywallCard: {
    backgroundColor: '#FFF8E1', borderWidth: 1.5, borderColor: '#FFE082',
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20,
  },
  paywallIconRow: { marginBottom: 12 },
  paywallIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FFE082',
    justifyContent: 'center', alignItems: 'center',
  },
  paywallTitle: { fontSize: fs(16), fontWeight: '800', color: '#182C2A', marginBottom: 6 },
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
