import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Header from '../components/Header';
import { COLORS, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';

const formatRating = (num) => {
  const val = Number(num);
  if (isNaN(val)) return '5';
  if (Number.isInteger(val)) return String(val);
  return val.toFixed(1).replace('.', ',');
};

export default function Profil({ navigation }) {
  const { user, logout, getTenantScore, bienActuel, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nom, setNom] = useState(user?.nom || (user?.name ? user.name.split(' ').pop() : 'Locataire'));
  const [prenoms, setPrenoms] = useState(user?.prenom || (user?.name ? user.name.split(' ').slice(0, -1).join(' ') : ''));
  const [email, setEmail] = useState(user?.email || '');
  const [motDePasse, setMotDePasse] = useState('');

  const tenantScore = getTenantScore();
  const initials = `${(prenoms && prenoms[0]) || ''}${(nom && nom[0]) || ''}`.toUpperCase() || 'MO';

  const handleSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setLoading(true);
    const res = await updateUserProfile({ nom, prenom: prenoms, email, motDePasse: motDePasse || undefined });
    setLoading(false);

    if (res.success) {
      Alert.alert("Succès", "Vos informations ont été mises à jour avec succès.");
      setIsEditing(false);
      setMotDePasse('');
    } else {
      Alert.alert("Erreur", res.error || "Impossible de mettre à jour le profil.");
    }
  };

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
          <UserAvatar initials={initials} size={72} color="#C9E84F" textColor="#0F322B" />
          <View style={styles.profileMainInfo}>
            <Text style={styles.profileName}>{`${prenoms} ${nom}`.trim() || user?.email}</Text>
            <View style={styles.labelLocataire}>
              <Text style={styles.labelLocataireText}>Locataire MOVO</Text>
            </View>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingText}>{formatRating(tenantScore)}</Text>
            <RatingStars rating={tenantScore} />
          </View>
          
          <TouchableOpacity 
            style={styles.publicViewBtn}
            onPress={() => navigation.navigate('ProfilPublic')}
            activeOpacity={0.8}
          >
            <Feather name="eye" size={16} color="#182C2A" style={{ marginRight: 8 }} />
            <Text style={styles.publicViewBtnText}>Aperçu du profil public</Text>
          </TouchableOpacity>
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
              <Text style={styles.rowValue}>{nom || 'Non renseigné'}</Text>
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
              <Text style={styles.rowValue}>{prenoms || 'Non renseigné'}</Text>
            )}
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.rowInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#7A8B89"
              />
            ) : (
              <Text style={styles.rowValue}>{email || user?.email || 'Non renseigné'}</Text>
            )}
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Mot de passe</Text>
            {isEditing ? (
              <TextInput
                style={styles.rowInput}
                value={motDePasse}
                onChangeText={setMotDePasse}
                placeholder="Nouveau mot de passe (optionnel)"
                secureTextEntry
                placeholderTextColor="#7A8B89"
              />
            ) : (
              <Text style={[styles.rowValue, { color: '#4CAF50' }]}>••••••••</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.modifierButton, isEditing && styles.saveButton]} 
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#0F322B" size="small" />
            ) : (
              <Text style={[styles.modifierButtonText, isEditing && styles.saveButtonText]}>
                {isEditing ? "Enregistrer les modifications" : "Modifier les informations"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Infos Bien Actuel Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="home-outline" size={20} color="#0F322B" />
            <Text style={styles.cardTitle}>Infos Bien Actuel</Text>
          </View>

          {bienActuel ? (
            <View>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Bien</Text>
                <Text style={styles.rowValue}>{bienActuel.nom}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Type</Text>
                <Text style={styles.rowValue}>{bienActuel.type}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Adresse</Text>
                <Text style={styles.rowValue}>{bienActuel.adresse}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Loyer</Text>
                <Text style={[styles.rowValue, { color: '#0F322B', fontWeight: '700' }]}>{bienActuel.loyer}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Bailleur</Text>
                <Text style={styles.rowValue}>{bienActuel.bailleur}</Text>
              </View>
              <View style={[styles.cardRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.rowLabel}>Statut</Text>
                <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: '#4CAF50', fontWeight: '700', fontSize: fs(12) }}>{bienActuel.statut}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Ionicons name="information-circle-outline" size={32} color="#7A8B89" style={{ marginBottom: 6 }} />
              <Text style={{ fontSize: fs(12), color: '#7A8B89', fontWeight: '600', textAlign: 'center' }}>
                Aucun bien actuellement associé.
              </Text>
            </View>
          )}
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
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
    flexDirection: 'column',
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
    alignItems: 'center',
    marginVertical: 12,
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
  publicViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  publicViewBtnText: {
    fontSize: fs(13),
    fontWeight: '700',
    color: '#182C2A',
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
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navRowTitle: {
    fontSize: fs(14),
    fontWeight: '700',
    color: '#182C2A',
  },
  navRowSubtitle: {
    fontSize: fs(12),
    color: '#F59A23',
    marginTop: 2,
  }
});
