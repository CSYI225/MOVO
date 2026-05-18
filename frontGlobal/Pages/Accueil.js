import React, { useState, useRef, useEffect } from 'react';
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
  Platform, 
  Image 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SIZES, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - 48; // Slides leave 24px margin on both sides
const GAP = 16; // Elegant gap between slides

const DUMMY_USERS = [
  { id: '1', name: 'Coulibaly Sékou', initials: 'CS', location: 'Abidjan, Cocody', rating: 4.7, reviewCount: 3, avatar: null },
  { id: '2', name: 'Koffi Amélie', initials: 'KA', location: 'Abidjan, Marcory', rating: 4.9, reviewCount: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: '3', name: 'Traoré Ibrahim', initials: 'TI', location: 'Bouaké, Nimbo', rating: 4.2, reviewCount: 1, avatar: null },
  { id: '4', name: 'Kouassi Jean', initials: 'KJ', location: 'Abidjan, Yopougon', rating: 3.8, reviewCount: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
];

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
    description: 'Une question ou besoin d’aide ? Notre assistance vous accompagne à chaque étape de votre vie de locataire.',
    icon: 'message-square',
    bg: '#F3E8FD',
    accent: '#9C27B0',
    iconColor: '#6A1B9A',
  }
];

export default function Accueil({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselScrollRef = useRef(null);

  // Automatic Scroll Effect every 3s
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

  // Handle slide change on manual scroll
  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (SLIDE_WIDTH + GAP));
    if (index >= 0 && index < CAROUSEL_TIPS.length && index !== activeSlide) {
      setActiveSlide(index);
    }
  };

  // Filter users based on search
  const filteredUsers = DUMMY_USERS.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* sticky TOP HEADER BAR */}
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

          <TouchableOpacity 
            style={styles.profileAvatarCircle}
            onPress={() => navigation.navigate('Profil')}
          >
            <Text style={styles.profileAvatarText}>CS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
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
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => navigation.navigate('ListeLocataires')}
          >
            <Ionicons name="options-outline" size={20} color="#7A8B89" />
          </TouchableOpacity>
        </View>

        {/* ACCÈS RAPIDES SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Accès rapides</Text>
          <View style={styles.quickAccessGrid}>
            
            {/* Abonnement Card */}
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => navigation.navigate('Abonnement')}
            >
              <View style={styles.cardIconCircle}>
                <Feather name="credit-card" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.quickAccessLabel}>Abonnement</Text>
            </TouchableOpacity>

            {/* Paramètres Card */}
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => navigation.navigate('Parametres')}
            >
              <View style={styles.cardIconCircle}>
                <Feather name="sliders" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.quickAccessLabel}>Paramètres</Text>
            </TouchableOpacity>

            {/* Profil Card */}
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

          {/* Grand rectangle has been removed, ScrollView renders directly on page background */}
          <ScrollView
            ref={carouselScrollRef}
            horizontal
            pagingEnabled={false} // Paging false to snap perfectly at custom card widths
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
                    marginRight: index < CAROUSEL_TIPS.length - 1 ? GAP : 0 // Add gap margin between slides
                  }
                ]}
              >
                {/* Left solid color indicator bar */}
                <View style={[styles.slideAccentBar, { backgroundColor: tip.accent }]} />
                
                {/* Content box */}
                <View style={styles.slideContentContainer}>
                  <View style={styles.slideHeader}>
                    <Text style={[styles.slideSubtitle, { color: tip.iconColor }]}>{tip.subtitle}</Text>
                    <Text style={styles.slideTitle}>{tip.title}</Text>
                  </View>
                  <Text style={styles.slideDescription} numberOfLines={3}>
                    {tip.description}
                  </Text>
                </View>

                {/* Big watermark icon on background */}
                <View style={styles.slideWatermarkIconContainer}>
                  <Feather name={tip.icon} size={64} color={`${tip.accent}20`} />
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Carousel indicator dots directly on page background */}
          <View style={styles.dotsContainer}>
            {CAROUSEL_TIPS.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.dot, 
                  activeSlide === index ? styles.activeDot : styles.inactiveDot
                ]} 
              />
            ))}
          </View>
        </View>

        {/* QUELQUES LOCATAIRES SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quelques locataires</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ListeLocataires')}>
              {/* Renamed to "Voir plus" */}
              <Text style={styles.viewAllText}>Voir plus</Text>
            </TouchableOpacity>
          </View>

          {/* Group container with light borders and dividers */}
          <View style={styles.activitiesCardContainer}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((item, index) => (
                <View key={`${item.id}-${index}`}>
                  <TouchableOpacity 
                    style={styles.userRow}
                    onPress={() => navigation.navigate('DetailsProfil', { user: item })}
                  >
                    {/* Left avatar circle */}
                    <UserAvatar initials={item.initials} size={44} color="#E1EBE6" textColor="#182C2A" photo={item.avatar} />

                    {/* Center details */}
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <View style={styles.locationContainer}>
                        <View style={styles.greenDot} />
                        <Text style={styles.locationText}>{item.location}</Text>
                      </View>
                    </View>

                    {/* Right rating & review count */}
                    <View style={styles.rightStatsContainer}>
                      <View style={styles.ratingHeaderRow}>
                        <Ionicons name="star" size={14} color="#F5A623" />
                        <Text style={styles.ratingText}>{item.rating.toString().replace('.', ',')}</Text>
                      </View>
                      <Text style={styles.reviewCountText}>{item.reviewCount} avis</Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Divider line except for the last item */}
                  {index < filteredUsers.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun locataire trouvé</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  scrollContent: {
    paddingBottom: 30,
    paddingHorizontal: 0, // Set to 0 to let carousel touch edges perfectly, we use inner padding for other blocks
  },
  
  // --- HEADER BAR ---
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
  headerIconButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 35,
    resizeMode: 'contain',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    position: 'relative',
    marginRight: 14,
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#84B889',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C9E84F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: fs(12),
    fontWeight: 'bold',
    color: '#182C2A',
  },

  // --- SEARCH BAR ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 52,
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#182C2A',
    fontSize: fs(14),
  },
  filterButton: {
    padding: 4,
  },

  // --- SECTIONS ---
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: fs(18),
    fontWeight: '700',
    color: '#182C2A',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  viewAllText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#84B889',
  },

  // --- ACCÈS RAPIDES ---
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: fs(12),
    fontWeight: '600',
    color: '#182C2A',
  },

  // --- LE SAVIEZ-VOUS CAROUSEL ---
  carouselScrollView: {
    width: SCREEN_WIDTH,
  },
  carouselScrollContent: {
    paddingHorizontal: 24, // First item is perfectly centered at x = 24
  },
  carouselSlideCard: {
    width: SLIDE_WIDTH,
    height: 124,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
  },
  slideAccentBar: {
    width: 6,
    height: '100%',
  },
  slideContentContainer: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  slideHeader: {
    marginBottom: 4,
  },
  slideSubtitle: {
    fontSize: fs(10),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slideTitle: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#182C2A',
    marginTop: 1,
  },
  slideDescription: {
    fontSize: fs(12),
    color: '#4A5A58',
    lineHeight: 16,
  },
  slideWatermarkIconContainer: {
    position: 'absolute',
    bottom: -15,
    right: -10,
    zIndex: 1,
    opacity: 0.8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 14,
    backgroundColor: '#84B889',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#EAEAEA',
  },

  // --- ACTIVITÉS RÉCENTES ---
  activitiesCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E1EBE6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fs(14),
    fontWeight: '700',
    color: '#182C2A',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#F59A23',
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
    fontSize: fs(12),
    color: '#556A68',
  },
  rightStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  ratingText: {
    fontWeight: '700',
    fontSize: fs(13),
    color: '#182C2A',
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: fs(12),
    color: '#7A8B89',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F2F4F4',
    marginHorizontal: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fs(14),
    color: '#7A8B89',
  },
});
