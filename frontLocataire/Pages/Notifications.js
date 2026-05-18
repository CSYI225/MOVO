import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../constants/Colors';

export default function Notifications({ navigation }) {
  // Local state for relationship requests
  const [requests, setRequests] = useState([
    { id: '1', name: 'Coulibaly Sékou', location: 'Abidjan, Cocody', date: 'Mar 2024', status: null },
  ]);

  const handleAction = (id, action) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Notification" 
        onBack={() => navigation.goBack()} 
        showSearch={false}
        onNotificationPress={() => {}}
        onProfilePress={() => navigation.navigate('Profil')}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {requests.map((request) => (
          <View key={request.id} style={styles.notificationCard}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                 <Text style={styles.avatarText}>CS</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{request.name}</Text>
                <Text style={styles.userLocation}>{request.location}</Text>
              </View>
              <Text style={styles.dateText}>{request.date}</Text>
            </View>
            
            <View style={styles.actionRow}>
              {request.status === 'validated' ? (
                <View style={[styles.statusIndicator, { backgroundColor: '#7ED38F' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Validé</Text>
                </View>
              ) : request.status === 'refused' ? (
                <View style={[styles.statusIndicator, { backgroundColor: '#F25F5C' }]}>
                  <Ionicons name="close-circle" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Refusé</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#7ED38F' }]}
                    onPress={() => handleAction(request.id, 'validated')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#F25F5C' }]}
                    onPress={() => handleAction(request.id, 'refused')}
                  >
                    <Ionicons name="close-circle" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Réfuser</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 20,
  },
  notificationCard: {
    backgroundColor: '#D1D9D9',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userLocation: {
    fontSize: 12,
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  }
});
