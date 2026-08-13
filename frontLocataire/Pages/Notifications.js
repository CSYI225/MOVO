import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { COLORS, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

export default function Notifications({ navigation }) {
  const { user, API_URL, fetchMonBienActuel } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDemandes = async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(false); // Don't block UI on polling
      const response = await fetch(`${API_URL}/baux/mes-demandes`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      if (response.ok && data.demandes) {
        const formatted = data.demandes.map(d => ({
          id: d.id,
          name: d.bailleur.nom,
          message: d.message || `Le bailleur ${d.bailleur.nom} vous demande de valider le rattachement au bien ${d.bien} (${d.adresse}).`,
          location: `${d.bien} • ${d.adresse}`,
          date: new Date(d.creeLe).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          status: d.statut === 'valide' ? 'validated' : d.statut === 'refuse' ? 'refused' : null,
        }));
        setRequests(formatted);
      }
    } catch (err) {
      console.error('Erreur chargement demandes liaison :', err);
    }
  };

  useEffect(() => {
    // Premier chargement avec spinner
    if (user?.token) {
      setLoading(true);
      fetchDemandes().finally(() => setLoading(false));
    }
    const interval = setInterval(fetchDemandes, 5000);
    return () => clearInterval(interval);
  }, [user?.token]);

  const handleAction = async (id, action) => {
    const accepter = action === 'validated';
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));

    try {
      const response = await fetch(`${API_URL}/baux/repondre-demande`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ demandeId: id, accepter }),
      });
      if (response.ok && accepter && fetchMonBienActuel) {
        fetchMonBienActuel(user?.token);
      }
    } catch (err) {
      console.error('Erreur réponse demande liaison :', err);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
        showSearch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 60 }}>
            <ActivityIndicator size="large" color="#0F322B" />
          </View>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <View key={request.id} style={styles.notificationCard}>
              <View style={styles.header}>
                <UserAvatar initials="BL" size={42} color="#C9E84F" textColor="#0F322B" />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{request.name}</Text>
                  <Text style={styles.userLocation}>Demande de liaison bailleur • {request.location}</Text>
                </View>
                <Text style={styles.dateText}>{request.date}</Text>
              </View>

              <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                <Text style={{ fontSize: fs(12), color: '#334155', fontWeight: '500', lineHeight: 17 }}>{request.message}</Text>
              </View>

              <View style={styles.actionRow}>
                {request.status === 'validated' ? (
                  <View style={[styles.statusIndicator, { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' }]}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                    <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Relation Validée</Text>
                  </View>
                ) : request.status === 'refused' ? (
                  <View style={[styles.statusIndicator, { backgroundColor: '#FFF1F2', borderColor: '#FAD4D4' }]}>
                    <Ionicons name="close-circle-outline" size={16} color="#FF5252" />
                    <Text style={[styles.actionButtonText, { color: '#FF5252' }]}>Relation Refusée</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#0F322B' }]}
                      onPress={() => handleAction(request.id, 'validated')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                      <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Valider la relation</Text>
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
          ))
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 60 }}>
            <Ionicons name="notifications-off-outline" size={48} color="#7A8B89" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: fs(13), color: '#7A8B89', fontWeight: '500' }}>Aucune demande de liaison en attente.</Text>
          </View>
        )}
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
