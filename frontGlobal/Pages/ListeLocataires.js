import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

const DUMMY_USERS = [
  { id: '1', name: 'Coulibaly Sékou', initials: 'CS', location: 'Abidjan, Cocody', rating: 4.7, reviewCount: 3, avatar: null },
  { id: '2', name: 'Koffi Amélie', initials: 'KA', location: 'Abidjan, Marcory', rating: 4.9, reviewCount: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: '3', name: 'Traoré Ibrahim', initials: 'TI', location: 'Bouaké, Nimbo', rating: 4.2, reviewCount: 1, avatar: null },
  { id: '4', name: 'Kouassi Jean', initials: 'KJ', location: 'Abidjan, Yopougon', rating: 3.8, reviewCount: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '5', name: 'Bamba Fatou', initials: 'BF', location: 'San Pedro, Lac', rating: 4.5, reviewCount: 1, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: '6', name: 'N\'Guessan Paul', initials: 'NP', location: 'Abidjan, Plateau', rating: 5.0, reviewCount: 1, avatar: null },
  { id: '7', name: 'Kone Awa', initials: 'KA', location: 'Abidjan, Treichville', rating: 4.1, reviewCount: 1, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { id: '8', name: 'Diarrassouba Moussa', initials: 'DM', location: 'Korhogo', rating: 4.6, reviewCount: 1, avatar: null },
];

const FILTER_CHIPS = [
  { id: 'all', label: 'Tous' },
  { id: 'Abidjan', label: 'Abidjan' },
  { id: 'Bouaké', label: 'Bouaké' },
  { id: 'San Pedro', label: 'San Pedro' },
  { id: 'rating45', label: '★ 4.5+' },
  { id: 'reviews2', label: '2+ avis' }
];

export default function ListeLocataires({ navigation }) {
  const { user, hasActiveSubscription, getTenantScore, reviewsByUser } = useAuth();
  const isVisitor = user?.role === 'visitor';
  const activeSub = hasActiveSubscription();
  const isLimitedVisitor = isVisitor && !activeSub;
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Enrich users with dynamic ratings and review counts from the context
  const dynamicUsers = DUMMY_USERS.map(u => ({
    ...u,
    rating: getTenantScore(u.id),
    reviewCount: reviewsByUser[u.id]?.length || 0
  }));

  // Filter users based on search & active filter chip
  const allFiltered = dynamicUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedFilter === 'Abidjan') return u.location.toLowerCase().includes('abidjan');
    if (selectedFilter === 'Bouaké') return u.location.toLowerCase().includes('bouaké');
    if (selectedFilter === 'San Pedro') return u.location.toLowerCase().includes('san pedro');
    if (selectedFilter === 'rating45') return u.rating >= 4.5;
    if (selectedFilter === 'reviews2') return u.reviewCount >= 2;
    return true;
  });

  // Limited visitors only see the first 3 results
  const VISITOR_LIMIT = 3;
  const filteredUsers = isLimitedVisitor ? allFiltered.slice(0, VISITOR_LIMIT) : allFiltered;
  const hasHiddenResults = isLimitedVisitor && allFiltered.length > VISITOR_LIMIT;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER BAR */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#182C2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tous les locataires</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* SEARCH BAR (Identical to homepage search bar) */}
      <View style={styles.searchSection}>
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
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={20} color={showFilters ? '#4CAF50' : '#7A8B89'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* FILTER CHIPS (Togglable Horizontal Scrollable chips row) */}
      {showFilters && (
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {FILTER_CHIPS.map(chip => {
              const isActive = selectedFilter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(chip.id)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* LIST OF LOCATAIRES */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
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
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun locataire trouvé</Text>
          </View>
        )}
        ListFooterComponent={() => hasHiddenResults ? (
          <View style={styles.paywallBanner}>
            <Ionicons name="lock-closed" size={20} color="#F59A23" style={{ marginBottom: 8 }} />
            <Text style={styles.paywallBannerTitle}>
              {allFiltered.length - VISITOR_LIMIT} résultat(s) masqué(s)
            </Text>
            <Text style={styles.paywallBannerSub}>
              Abonnez-vous pour accéder à tous les profils de locataires
            </Text>
            <TouchableOpacity
              style={styles.paywallBannerBtn}
              onPress={() => navigation.navigate('Abonnement')}
            >
              <Text style={styles.paywallBannerBtnText}>Voir les offres</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: fs(18),
    fontWeight: '700',
    color: '#182C2A',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFBFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F4',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    borderRadius: 30, // Fully rounded matching homepage
    paddingHorizontal: 16,
    height: 52, // Height 52 matching homepage
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
  listContent: {
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fs(14),
    color: '#7A8B89',
  },
  filterSection: {
    backgroundColor: '#FAFBFB',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F4',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#7A8B89',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },

  // Paywall Banner
  paywallBanner: {
    margin: 16,
    backgroundColor: '#FFF8E1',
    borderWidth: 1.5,
    borderColor: '#FFE082',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  paywallBannerTitle: {
    fontSize: fs(14),
    fontWeight: '800',
    color: '#182C2A',
    marginBottom: 6,
    textAlign: 'center',
  },
  paywallBannerSub: {
    fontSize: fs(12),
    color: '#7A8B89',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
  },
  paywallBannerBtn: {
    backgroundColor: '#F59A23',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  paywallBannerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: fs(13),
  },
});
