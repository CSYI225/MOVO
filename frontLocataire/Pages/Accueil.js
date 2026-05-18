import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import ReviewCard from '../components/ReviewCard';
import Colors from '../constants/Colors';

const FILTERS = ['Tous', 'Non lu', 'Validés', 'Contestés'];

export default function Home({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Tous');
  
  // Real state for reviews
  const [reviews, setReviews] = useState([
    { id: '1', status: 'validated' },
    { id: '2', status: null }, // status null means 'Non lu' (unread)
    { id: '3', status: 'contested' },
    { id: '4', status: null },
  ]);

  const handleValidate = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'validated' } : r));
  };

  const handleContest = (id) => {
    // Navigate to Contestation screen and pass the review ID to update it later
    // For now, let's assume we update it directly for the demo
    navigation.navigate('Contestation', { 
        reviewId: id,
        onSubmit: () => {
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'contested' } : r));
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
      />
      
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(filter)}
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

      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ReviewCard 
            status={item.status} 
            onContest={() => handleContest(item.id)}
            onValidate={() => handleValidate(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun avis dans cette catégorie.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterWrapper: {
    marginVertical: 15,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#607D8B',
    borderColor: '#607D8B',
  },
  filterText: {
    fontWeight: 'bold',
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  }
});
