import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  StatusBar, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - 48;
const GAP = 16;

const CAROUSEL_TIPS = [
  {
    id: '1',
    title: 'Paiement Régulier',
    subtitle: 'Améliorez votre score',
    description: 'Payer votre loyer régulièrement améliore votre score Movo et vous rend prioritaire pour vos futures locations.',
    icon: 'credit-card',
    bg: '#E8F5E9',
    accent: '#4CAF50',
    iconColor: '#2E7D32',
  },
  {
    id: '2',
    title: 'Profil Vérifié',
    subtitle: 'Trouvez plus vite',
    description: 'Un dossier locataire complété à 100% avec des documents clairs est validé 3 fois plus rapidement par nos services.',
    icon: 'user-check',
    bg: '#E3F2FD',
    accent: '#2196F3',
    iconColor: '#1565C0',
  },
  {
    id: '3',
    title: 'Avis Bailleurs',
    subtitle: 'Bâtissez la confiance',
    description: 'Les recommandations et notes de vos anciens propriétaires sont des atouts précieux pour vos futurs logements.',
    icon: 'star',
    bg: '#FFF8E1',
    accent: '#FFC107',
    iconColor: '#FF8F00',
  },
  {
    id: '4',
    title: 'Assistance Movo',
    subtitle: 'Movo à vos côtés',
    description: "Une question ou besoin d'aide ? Notre assistance vous accompagne à chaque étape de votre vie de locataire.",
    icon: 'message-square',
    bg: '#F3E8FD',
    accent: '#9C27B0',
    iconColor: '#6A1B9A',
  }
];

const formatRating = (num) => {
  const val = Number(num);
  if (isNaN(val)) return '5';
  if (Number.isInteger(val)) return String(val);
  return val.toFixed(1).replace('.', ',');
};

export default function Accueil({ navigation }) {
  const { user, fetchLocataires } = useAuth();
  const isVisitor = user?.role === 'visitor';

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : (name.slice(0, 2) || 'CS').toUpperCase();
  };
  const userInitials = getInitials(user?.name || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselScrollRef = useRef(null);
  const [locataires, setLocataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  // Chargement initial des locataires
  useEffect(() => {
    loadLocataires('');
  }, []);

  const loadLocataires = async (query) => {
    setLoading(true);
    const result = await fetchLocataires(query, 1, 8);
    setLocataires(result.locataires);
    setLoading(false);
  };

  // Recherche avec debounce 400ms
  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadLocataires(text);
    }, 400);
  }, []);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // Carousel automatique toutes les 3s
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeSlide + 1) % CAROUSEL_TIPS.length;
      carouselScrollRef.current?.scrollTo({
        x: nextIndex * (SLIDE_WIDTH + GAP),
        animated: true,
      });
      setActiveSlide(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (SLIDE_WIDTH + GAP));
    if (index >= 0 && index < CAROUSEL_TIPS.length && index !== activeSlide) {
      setActiveSlide(index);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER BAR */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.headerIconButton}>
          <Ionicons name="menu-outline" size={26} color="#182C2A" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
          />
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={[styles.headerIconButton, styles.bellButton]}>
            <Ionicons name="notifications-outline" size={24} color="#182C2A" />
            <View style={styles.bellBadge} />
          </TouchableOpacity>

          {isVisitor ? (
            <TouchableOpacity
              style={styles.visitorBadge}
              onPress={() => navigation.navigate('Profil')}
            >
              <Feather name="eye" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.visitorBadgeText}>Visiteur</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.profileAvatarCircle}
              onPress={() => navigation.navigate('Profil')}
            >
              <Text style={styles.profileAvatarText}>{userInitials}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#7A8B89" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un locataire"
            placeholderTextColor="#7A8B89"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('ListeLocataires')}
          >
            <Ionicons name="options-outline" size={20} color="#7A8B89" />
          </TouchableOpacity>
        </View>

        {/* ACCÈS RAPIDES */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Accès rapides</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={styles.quickAccessCard}
              onPress={() => navigation.navigate('Abonnement')}
            >
              <View style={styles.cardIconCircle}>
                <Feather name="credit-card" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.quickAccessLabel}>Abonnement</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessCard}
              onPress={() => navigation.navigate('Parametres')}
            >
              <View style={styles.cardIconCircle}>
                <Feather name="sliders" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.quickAccessLabel}>Paramètres</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessCard}
              onPress={() => navigation.navigate('Profil')}
            >
              <View style={styles.cardIconCircle}>
                <Feather name="user" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.quickAccessLabel}>Profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LE SAVIEZ-VOUS CAROUSEL */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Le saviez-vous</Text>
          <ScrollView
            ref={carouselScrollRef}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SLIDE_WIDTH + GAP}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselScrollContent}
            style={styles.carouselScrollView}
          >
            {CAROUSEL_TIPS.map((tip, index) => (
              <View
                key={tip.id}
                style={[
                  styles.carouselSlideCard,
                  {
                    backgroundColor: tip.bg,
                    marginRight: index < CAROUSEL_TIPS.length - 1 ? GAP : 0
                  }
                ]}
              >
                <View style={[styles.slideAccentBar, { backgroundColor: tip.accent }]} />
                <View style={styles.slideContentContainer}>
                  <View style={styles.slideHeader}>
                    <Text style={[styles.slideSubtitle, { color: tip.iconColor }]}>{tip.subtitle}</Text>
                    <Text style={styles.slideTitle}>{tip.title}</Text>
                  </View>
                  <Text style={styles.slideDescription} numberOfLines={3}>
                    {tip.description}
                  </Text>
                </View>
                <View style={styles.slideWatermarkIconContainer}>
                  <Feather name={tip.icon} size={64} color={`${tip.accent}20`} />
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsContainer}>
            {CAROUSEL_TIPS.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeSlide === index ? styles.activeDot : styles.inactiveDot]}
              />
            ))}
          </View>
        </View>

        {/* QUELQUES LOCATAIRES */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quelques locataires</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ListeLocataires')}>
              <Text style={styles.viewAllText}>Voir plus</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesCardContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#84B889" />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : locataires.length > 0 ? (
              locataires.map((item, index) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.userRow}
                    onPress={() => navigation.navigate('DetailsProfil', { locataireId: item.id, locataireBasic: item })}
                  >
                    <UserAvatar initials={item.initials} size={44} color="#E1EBE6" textColor="#182C2A" photo={item.avatar} />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <View style={styles.locationContainer}>
                        <View style={styles.greenDot} />
                        <Text style={styles.locationText}>{item.location}</Text>
                      </View>
                    </View>
                    <View style={styles.rightStatsContainer}>
                      <View style={styles.ratingHeaderRow}>
                        <Ionicons name="star" size={14} color="#F5A623" />
                        <Text style={styles.ratingText}>{formatRating(item.rating)}</Text>
                      </View>
                      <Text style={styles.reviewCountText}>{item.reviewCount} avis</Text>
                    </View>
                  </TouchableOpacity>
                  {index < locataires.length - 1 && <View style={styles.rowDivider} />}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Aucun locataire trouvé pour cette recherche.' : 'Aucun locataire enregistré pour l\'instant.'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FAFBFB' },
  scrollContent: { paddingBottom: 30, paddingHorizontal: 0 },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F4',
    backgroundColor: '#FFFFFF',
  },
  headerIconButton: { padding: 4, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logoImage: { width: 100, height: 35, resizeMode: 'contain' },
  headerRightActions: { flexDirection: 'row', alignItems: 'center' },
  bellButton: { position: 'relative', marginRight: 14 },
  bellBadge: {
    position: 'absolute', top: 2, right: 2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#84B889', borderWidth: 1.5, borderColor: '#FFFFFF',
  },
  profileAvatarCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#C9E84F', justifyContent: 'center', alignItems: 'center',
  },
  profileAvatarText: { fontSize: fs(12), fontWeight: 'bold', color: '#182C2A' },
  visitorBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F59A23', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  visitorBadgeText: { fontSize: fs(11), fontWeight: '800', color: '#FFFFFF' },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 30, paddingHorizontal: 16, height: 52,
    marginTop: 16, marginBottom: 8, marginHorizontal: 16,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, height: '100%', color: '#182C2A', fontSize: fs(14) },
  filterButton: { padding: 4 },

  sectionContainer: { marginTop: 20, paddingHorizontal: 0 },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: fs(18), fontWeight: '700', color: '#182C2A',
    marginBottom: 10, paddingHorizontal: 16,
  },
  viewAllText: { fontSize: fs(14), fontWeight: '600', color: '#84B889' },

  quickAccessGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 },
  quickAccessCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginHorizontal: 4,
  },
  cardIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  quickAccessLabel: { fontSize: fs(12), fontWeight: '600', color: '#182C2A' },

  carouselScrollView: { width: SCREEN_WIDTH },
  carouselScrollContent: { paddingHorizontal: 24 },
  carouselSlideCard: {
    width: SLIDE_WIDTH, height: 124, borderRadius: 16,
    flexDirection: 'row', overflow: 'hidden', position: 'relative',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  slideAccentBar: { width: 6, height: '100%' },
  slideContentContainer: { flex: 1, padding: 14, justifyContent: 'space-between', zIndex: 2 },
  slideHeader: { marginBottom: 4 },
  slideSubtitle: { fontSize: fs(10), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  slideTitle: { fontSize: fs(15), fontWeight: '700', color: '#182C2A', marginTop: 1 },
  slideDescription: { fontSize: fs(12), color: '#4A5A58', lineHeight: 16 },
  slideWatermarkIconContainer: { position: 'absolute', bottom: -15, right: -10, zIndex: 1, opacity: 0.8 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 3 },
  activeDot: { width: 14, backgroundColor: '#84B889' },
  inactiveDot: { width: 6, backgroundColor: '#EAEAEA' },

  activitiesCardContainer: {
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 16, overflow: 'hidden', marginHorizontal: 16,
  },
  loadingContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 24, gap: 10,
  },
  loadingText: { fontSize: fs(13), color: '#7A8B89' },
  userRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16,
  },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: fs(15), fontWeight: '700', color: '#F59A23' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#84B889', marginRight: 6 },
  locationText: { fontSize: fs(12), color: '#556A68' },
  rightStatsContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingHeaderRow: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  ratingText: { fontWeight: '700', fontSize: fs(13), color: '#182C2A', marginLeft: 4 },
  reviewCountText: { fontSize: fs(12), color: '#7A8B89' },
  rowDivider: { height: 1, backgroundColor: '#F2F4F4', marginHorizontal: 16 },
  emptyContainer: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: fs(14), color: '#7A8B89', textAlign: 'center' },
});
