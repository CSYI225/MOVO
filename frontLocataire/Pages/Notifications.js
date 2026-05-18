import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { COLORS, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';

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
        title="Notifications"
        onBack={() => navigation.goBack()}
        showSearch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {requests.map((request) => (
          <View key={request.id} style={styles.notificationCard}>
            <View style={styles.header}>
              <UserAvatar initials="CS" size={42} color="#C9E84F" textColor="#0F322B" />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{request.name}</Text>
                <Text style={styles.userLocation}>{request.location}</Text>
              </View>
              <Text style={styles.dateText}>{request.date}</Text>
            </View>

            <View style={styles.actionRow}>
              {request.status === 'validated' ? (
                <View style={[styles.statusIndicator, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Rapport Validé</Text>
                </View>
              ) : request.status === 'refused' ? (
                <View style={[styles.statusIndicator, { backgroundColor: '#FFF1F2', borderColor: '#FAD4D4' }]}>
                  <Ionicons name="close-circle-outline" size={16} color="#FF5252" />
                  <Text style={[styles.actionButtonText, { color: '#FF5252' }]}>Rapport Refusé</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#0F322B' }]}
                    onPress={() => handleAction(request.id, 'validated')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0' }]}
                    onPress={() => handleAction(request.id, 'refused')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#FF5252" />
                    <Text style={[styles.actionButtonText, { color: '#FF5252' }]}>Refuser</Text>
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
    backgroundColor: '#FAFBFB',
  },
  scrollContent: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontWeight: '700',
    fontSize: fs(14),
    color: '#0F322B',
  },
  userLocation: {
    fontSize: fs(12),
    color: '#64748B',
    marginTop: 2,
  },
  dateText: {
    fontSize: fs(11),
    color: '#94A3B8',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F4F4',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontWeight: '700',
    fontSize: fs(12),
  }
});
