import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import ReviewCard from '../components/ReviewCard';
import { COLORS, fs } from '../Styles/global';
import { useAuth } from '../context/AuthContext';

const FILTERS = ['Tous', 'Non lu', 'Validés', 'Contestés'];

export default function Home({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const { reviews, updateReviewStatus } = useAuth();

  const handleValidate = (id) => {
    updateReviewStatus(id, 'validated');
  };

  const handleContest = (id) => {
    navigation.navigate('Contestation', {
      reviewId: id,
      onSubmit: () => {
        updateReviewStatus(id, 'contested');
      }
    });
  };

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === 'Tous') return true;
    if (activeFilter === 'Non lu') return r.status === null;
    if (activeFilter === 'Validés') return r.status === 'validated';
    if (activeFilter === 'Contestés') return r.status === 'contested';
    return true;
  });

  return (
    <View style={styles.container}>
      <Header
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('Profil')}
        showSearch={false}
      />

      {/* Category filter pills - Kept visible under the header */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButtonCard,
                activeFilter === filter && styles.filterButtonCardActive
              ]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reviews list - Passing compact={true} */}
      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ReviewCard
            data={item}
            status={item.status}
            onContest={() => handleContest(item.id)}
            onValidate={() => handleValidate(item.id)}
            onPress={() => navigation.navigate('DetailsAvis', {
              review: item,
              onValidate: handleValidate,
              onContest: handleContest
            })}
            showActions={item.status === null}
            compact={true} // Compact mode activated for cards on home screen
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color="#7A8B89" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>Aucun avis ne correspond à vos critères.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  filterWrapper: {
    marginVertical: 14,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButtonCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonCardActive: {
    backgroundColor: '#0F322B', // Matches frontBailleurs sapin green!
    borderColor: '#0F322B',
  },
  filterText: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#7A8B89',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: fs(13),
    color: '#7A8B89',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  }
});
