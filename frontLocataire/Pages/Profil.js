import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { COLORS, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';

export default function Profil({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nom, setNom] = useState('Coulibaly');
  const [prenoms, setPrenoms] = useState('Sékou Yéfougn-gnigui');

  return (
    <View style={styles.container}>
      <Header
        title="Profil"
        onBack={() => navigation.goBack()}
        showSearch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Info Header */}
        <View style={styles.profileHeader}>
          <UserAvatar initials="CS" size={72} color="#C9E84F" textColor="#0F322B" />
          <View style={styles.profileMainInfo}>
            <Text style={styles.profileName}>{nom} {prenoms.split(' ')[0]}</Text>
            <View style={styles.labelLocataire}>
              <Text style={styles.labelLocataireText}>Locataire Vérifié</Text>
            </View>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingText}>5.0</Text>
            <RatingStars rating={5} />
          </View>
        </View>

        {/* Compte Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color="#0F322B" />
            <Text style={styles.cardTitle}>Compte</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Nom</Text>
            {isEditing ? (
              <TextInput
                style={styles.rowInput}
                value={nom}
                onChangeText={setNom}
                placeholder="Nom"
                placeholderTextColor="#7A8B89"
              />
            ) : (
              <Text style={styles.rowValue}>{nom}</Text>
            )}
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Prénoms</Text>
            {isEditing ? (
              <TextInput
                style={styles.rowInput}
                value={prenoms}
                onChangeText={setPrenoms}
                placeholder="Prénoms"
                placeholderTextColor="#7A8B89"
              />
            ) : (
              <Text style={styles.rowValue}>{prenoms}</Text>
            )}
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Mot de passe</Text>
            <Text style={[styles.rowValue, { color: '#4CAF50' }]}>••••••••</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.modifierButton, isEditing && styles.saveButton]} 
            onPress={() => setIsEditing(!isEditing)}
            activeOpacity={0.7}
          >
            <Text style={[styles.modifierButtonText, isEditing && styles.saveButtonText]}>
              {isEditing ? "Enregistrer les modifications" : "Modifier les informations"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Infos Bien Actuel Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="home-outline" size={20} color="#0F322B" />
            <Text style={styles.cardTitle}>Infos Bien Actuel</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Nom bailleur</Text>
            <Text style={styles.rowValue}>Coulibaly</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Prénoms bailleur</Text>
            <Text style={styles.rowValue}>Sékou Yéfougn-gnigui</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Type maison</Text>
            <Text style={styles.rowValue}>Duplex</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Localisation</Text>
            <Text style={styles.rowValue}>Abidjan, Cocody</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Prix mensuel</Text>
            <Text style={styles.rowValue}>15 000 000 FCFA</Text>
          </View>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Déconnexion du compte</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
  },
  profileMainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: fs(18),
    fontWeight: '700',
    color: '#0F322B',
  },
  labelLocataire: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  labelLocataireText: {
    color: '#4CAF50',
    fontSize: fs(10),
    fontWeight: '700',
  },
  ratingBox: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: fs(20),
    fontWeight: '800',
    color: '#0F322B',
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F4',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: fs(14),
    fontWeight: '700',
    marginLeft: 8,
    color: '#0F322B',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    color: '#64748B',
    fontSize: fs(12),
    fontWeight: '500',
  },
  rowValue: {
    fontWeight: '700',
    fontSize: fs(12),
    color: '#182C2A',
  },
  rowInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: fs(12),
    fontWeight: '700',
    color: '#182C2A',
    backgroundColor: '#FAFBFB',
    minWidth: 180,
    textAlign: 'right',
  },
  modifierButton: {
    borderWidth: 1.5,
    borderColor: '#0F322B',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modifierButtonText: {
    color: '#0F322B',
    fontWeight: '700',
    fontSize: fs(12),
  },
  saveButton: {
    backgroundColor: '#0F322B',
    borderColor: '#0F322B',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#FAD4D4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FF5252',
    fontWeight: '700',
    fontSize: fs(14),
  }
});
