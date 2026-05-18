import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../constants/Colors';

export default function Profil({ navigation }) {
  return (
    <View style={styles.container}>
      <Header 
        title="Profil" 
        onBack={() => navigation.goBack()} 
        showSearch={false}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => {}}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Info Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>CS</Text>
          </View>
          <View style={styles.profileMainInfo}>
            <Text style={styles.profileName}>Koné Ahmad</Text>
            <View style={styles.labelLocataire}>
              <Text style={styles.labelLocataireText}>Locataire</Text>
            </View>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingText}>4,7</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <FontAwesome key={s} name="star" size={10} color="#FFA000" style={styles.star} />
              ))}
            </View>
          </View>
        </View>

        {/* Compte Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color="black" />
            <Text style={styles.cardTitle}>Compte</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Nom</Text>
            <Text style={styles.rowValue}>Coulibaly</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Prénoms</Text>
            <Text style={styles.rowValue}>Sékou Yéfougn-gnigui</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Mot de passe</Text>
            <Text style={[styles.rowValue, { color: '#7ED38F' }]}>•••••</Text>
          </View>
          <TouchableOpacity style={styles.modifierButton}>
            <Text style={styles.modifierButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Infos Bien Actuel Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="home-outline" size={20} color="black" />
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
            <Text style={styles.rowValue}>Duplexe</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Localisation</Text>
            <Text style={styles.rowValue}>Abidjan,Cocody</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.rowLabel}>Prix</Text>
            <Text style={styles.rowValue}>15 000 000 FCFA</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE0B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  profileMainInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFA000',
  },
  labelLocataire: {
    backgroundColor: '#A5D6A7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  labelLocataireText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingBox: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  starsRow: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 1,
  },
  card: {
    backgroundColor: '#D1D9D9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: {
    color: '#333',
    fontSize: 13,
  },
  rowValue: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  modifierButton: {
    backgroundColor: '#7ED38F',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignSelf: 'center',
    marginTop: 10,
  },
  modifierButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FFCC80',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
