import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, StatusBar, TextInput } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SIZES, globalStyles, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';

export default function Profil({ navigation }) {
  const { user, logout, hasActiveSubscription } = useAuth();
  const isVisitor = user?.role === 'visitor';

  // Initiales dynamiques : Première lettre du Nom + Première lettre du 1er Prénom
  const getInitials = (fullName) => {
    if (!fullName) return 'V';
    const parts = fullName.trim().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0] ? parts[0].slice(0, 2).toUpperCase() : 'V';
  };
  const initials = getInitials(user?.name);
  
  // Extraire Nom et Prénoms (la première partie est le nom, le reste est le prénom)
  const nameParts = user?.name ? user.name.trim().split(' ') : [];
  const firstName = nameParts.length > 0 ? nameParts[0] : '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const [isEditing, setIsEditing] = useState(false);
  const [nom, setNom] = useState(firstName);
  const [prenoms, setPrenoms] = useState(lastName);
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.trim().split(' ');
      setNom(parts[0] || '');
      setPrenoms(parts.slice(1).join(' '));
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);
  const [phone, setPhone] = useState('+225 07 08 09 10 11');
  const [password, setPassword] = useState('password123');

  // Infos abonnement visiteur
  const activeSub = hasActiveSubscription();
  const planLabels = { week: 'Semaine', month: 'Mois', year: 'Année' };
  const visitorPlanLabel = activeSub
    ? `Premium Visiteur — ${planLabels[user?.subscription?.plan] || ''}`
    : (user?.accessCredits > 0)
      ? `${user.accessCredits} crédit(s) restant(s)`
      : 'Gratuit';
  const visitorStatus = activeSub ? 'Actif' : (user?.accessCredits > 0 ? 'Crédité' : 'Gratuit');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Block in flat modern white with back button */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#182C2A" />
          </TouchableOpacity>
          <View style={styles.logoContainerSmall}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={{ width: 60, height: 25, resizeMode: 'contain' }} 
            />
          </View>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Info Header */}
        <View style={styles.userInfoSection}>
          <UserAvatar
            initials={initials}
            size={72}
            color={isVisitor ? '#FFF8E1' : '#E8F5E9'}
            textColor={isVisitor ? '#F59A23' : '#4CAF50'}
          />

          <View style={styles.userNameSection}>
            <Text style={styles.userName}>{user?.name || 'Coulibaly Sékou'}</Text>
            <View style={[styles.badgeBailleur, isVisitor && styles.badgeVisiteur]}>
              <Text style={[styles.badgeBailleurText, isVisitor && styles.badgeVisiteurText]}>
                {isVisitor ? 'Visiteur' : 'Bailleur Pro'}
              </Text>
            </View>
          </View>

          {/* Rating uniquement pour les bailleurs */}
          {!isVisitor && (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingBigText}>4,7</Text>
              <RatingStars rating={4.7} />
            </View>
          )}
        </View>

        {/* Abonnement Card (White, border, clickable) */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Abonnement')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeaderWithChevron}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="wallet-outline" size={22} color="#182C2A" />
              <Text style={styles.cardTitle}>Mon Abonnement</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#7A8B89" />
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Statut</Text>
            <View style={[styles.greenBadge, !activeSub && !isVisitor && styles.greenBadge,
              (visitorStatus === 'Gratuit') && styles.grayBadge,
              (visitorStatus === 'Crédité') && styles.orangeBadge,
            ]}>
              <Text style={[
                styles.greenBadgeText,
                (visitorStatus === 'Gratuit') && styles.grayBadgeText,
                (visitorStatus === 'Crédité') && styles.orangeBadgeText,
              ]}>
                {isVisitor ? visitorStatus : 'Actif'}
              </Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>{isVisitor ? 'Accès' : 'Type d\'abonnement'}</Text>
            <Text style={styles.rowValue}>{isVisitor ? visitorPlanLabel : 'Starter (Gratuit)'}</Text>
          </View>

          {!isVisitor && (
            <>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Depuis le</Text>
                <Text style={styles.rowValue}>12 Janvier 2024</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.rowLabel}>Validité</Text>
                <View style={styles.timeRemainingBadge}>
                  <Text style={styles.timeRemainingBadgeText}>Gratuit à vie</Text>
                </View>
              </View>
            </>
          )}

          {isVisitor && activeSub && (
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Expire le</Text>
              <Text style={styles.rowValue}>
                {new Date(user.subscription.expiresAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Compte Card (White, border, interactive) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={22} color="#182C2A" />
            <Text style={styles.cardTitle}>Mon Compte</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Nom</Text>
            {isEditing ? (
              <TextInput 
                style={styles.inputField} 
                value={nom} 
                onChangeText={setNom} 
              />
            ) : (
              <Text style={styles.rowValueBold}>{nom}</Text>
            )}
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Prénoms</Text>
            {isEditing ? (
              <TextInput 
                style={styles.inputField} 
                value={prenoms} 
                onChangeText={setPrenoms} 
              />
            ) : (
              <Text style={styles.rowValueBold}>{prenoms}</Text>
            )}
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Adresse e-mail</Text>
            {isEditing ? (
              <TextInput 
                style={styles.inputField} 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.rowValue}>{email}</Text>
            )}
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Téléphone</Text>
            {isEditing ? (
              <TextInput 
                style={styles.inputField} 
                value={phone} 
                onChangeText={setPhone} 
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.rowValue}>{phone}</Text>
            )}
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Mot de passe</Text>
            {isEditing ? (
              <TextInput 
                style={styles.inputField} 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={true}
              />
            ) : (
              <Text style={styles.passwordDots}>••••••••</Text>
            )}
          </View>

          <View style={styles.modifierContainer}>
            {isEditing ? (
              <View style={{ width: '100%', gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.modifierButton, { backgroundColor: '#4CAF50', borderColor: '#4CAF50' }]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={[styles.modifierButtonText, { color: '#FFFFFF' }]}>Enregistrer les modifications</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modifierButton, { backgroundColor: '#FAFBFB', borderColor: '#E2E8F0' }]}
                  onPress={() => {
                    // Reset to original values on cancel
                    setNom('Coulibaly');
                    setPrenoms('Sékou Yéfougn-gnigui');
                    setEmail('s.coulibaly@movo.ci');
                    setPhone('+225 07 08 09 10 11');
                    setPassword('password123');
                    setIsEditing(false);
                  }}
                >
                  <Text style={[styles.modifierButtonText, { color: '#7A8B89' }]}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.modifierButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.modifierButtonText}>Modifier mes informations</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Déconnexion Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => { logout(); }}
        >
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerBlock: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  logoContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fs(16),
    fontWeight: '700',
    color: '#182C2A',
  },

  // User Info Section
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  userNameSection: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  userName: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#182C2A',
    marginBottom: 4,
  },
  badgeBailleur: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeBailleurText: {
    color: '#4CAF50',
    fontWeight: '800',
    fontSize: fs(11),
  },
  badgeVisiteur: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeVisiteurText: {
    color: '#F59A23',
    fontWeight: '800',
    fontSize: fs(11),
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingBigText: {
    fontSize: fs(22),
    fontWeight: '800',
    color: '#182C2A',
    marginBottom: 2,
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF', // Clean white card
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderWithChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#182C2A',
    marginLeft: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputField: {
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: fs(13),
    color: '#182C2A',
    fontWeight: '600',
    width: 200,
    textAlign: 'right',
  },
  rowLabel: {
    fontSize: fs(13),
    color: '#556A68',
  },
  rowValue: {
    fontSize: fs(13),
    fontWeight: '700',
    color: '#182C2A',
  },
  rowValueBold: {
    fontSize: fs(13),
    fontWeight: '800',
    color: '#182C2A',
  },
  greenBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  greenBadgeText: {
    color: '#4CAF50',
    fontWeight: '800',
    fontSize: fs(11),
  },
  grayBadge: {
    backgroundColor: '#F2F4F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  grayBadgeText: {
    color: '#7A8B89',
    fontWeight: '800',
    fontSize: fs(11),
  },
  orangeBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orangeBadgeText: {
    color: '#F59A23',
    fontWeight: '800',
    fontSize: fs(11),
  },
  timeRemainingBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeRemainingBadgeText: {
    color: '#FF8F00',
    fontWeight: '800',
    fontSize: fs(11),
  },
  passwordDots: {
    color: '#4CAF50',
    fontSize: fs(16),
    fontWeight: '800',
  },
  modifierContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  modifierButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  modifierButtonText: {
    color: '#4CAF50',
    fontWeight: '800',
    fontSize: fs(13),
  },

  // Logout Button
  logoutButton: {
    backgroundColor: '#F59A23', // Warm Movo Orange
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fs(15),
  },
});
