import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Image, StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SIZES, fs } from '../Styles/global';

export default function Parametres({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Block in pure flat white with back button */}
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
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1: COMPTE ET SÉCURITÉ */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Sécurité & Compte</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="lock" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Modifier le mot de passe</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#7A8B89" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="shield" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Double authentification</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#7A8B89" />
          </TouchableOpacity>
        </View>

        {/* SECTION 2: NOTIFICATIONS */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="bell" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Notifications Push</Text>
            </View>
            <Switch
              trackColor={{ false: '#EAEAEA', true: '#C8E6C9' }}
              thumbColor={pushEnabled ? '#4CAF50' : '#FAFBFB'}
              onValueChange={setPushEnabled}
              value={pushEnabled}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="mail" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Alertes par e-mail</Text>
            </View>
            <Switch
              trackColor={{ false: '#EAEAEA', true: '#C8E6C9' }}
              thumbColor={emailEnabled ? '#4CAF50' : '#FAFBFB'}
              onValueChange={setEmailEnabled}
              value={emailEnabled}
            />
          </View>
        </View>

        {/* SECTION 3: PRÉFÉRENCES */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Préférences</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="globe" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Langue de l'application</Text>
            </View>
            <View style={styles.settingRightContainer}>
              <Text style={styles.settingRightText}>Français</Text>
              <Ionicons name="chevron-forward" size={16} color="#7A8B89" style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="moon" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Mode Sombre</Text>
            </View>
            <Switch
              trackColor={{ false: '#EAEAEA', true: '#C8E6C9' }}
              thumbColor={darkModeEnabled ? '#4CAF50' : '#FAFBFB'}
              onValueChange={setDarkModeEnabled}
              value={darkModeEnabled}
            />
          </View>
        </View>

        {/* SECTION 4: ASSISTANCE & LÉGAL */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Support & Informations</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="help-circle" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Centre d'aide & Contact</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#7A8B89" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="file-text" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Conditions d'utilisation</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#7A8B89" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Feather name="eye" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.settingLabel}>Politique de confidentialité</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#7A8B89" />
          </TouchableOpacity>
        </View>

        {/* Version details */}
        <Text style={styles.versionText}>Movo v2.4.0 (PRO) - Version Premium</Text>

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

  // Cards
  card: {
    backgroundColor: '#FFFFFF', // Premium White Card
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    padding: 18,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#556A68',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F5E9', // Soft green background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: fs(14),
    fontWeight: '600',
    color: '#182C2A',
  },
  settingRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRightText: {
    fontSize: fs(13),
    color: '#7A8B89',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 12,
  },
  versionText: {
    fontSize: fs(11),
    color: '#7A8B89',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
});
