import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, globalStyles, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';

export default function DetailsAvis({ route, navigation }) {
  const { review, user } = route.params || {};

  // States pour les onglets
  const [infoTab, setInfoTab] = useState('Bien'); // 'Propriétaire' | 'Bien'
  const [mainTab, setMainTab] = useState('Avis'); // 'Avis' | 'Contestation'

  // Dummy data pour la contestation
  const hasContestation = true;

  const renderInfoBien = () => (
    <View style={styles.infoBienContent}>
      <View style={styles.infoItem}>
        <Ionicons name="home-outline" size={18} color="#182C2A" />
        <Text style={styles.infoText}>Duplex</Text>
      </View>
      <View style={styles.infoItem}>
        <Ionicons name="location-outline" size={18} color="#182C2A" />
        <Text style={styles.infoText}>{review?.location || 'Abidjan, Cocody'}</Text>
      </View>
      <View style={styles.infoItem}>
        <Ionicons name="cash-outline" size={18} color="#182C2A" />
        <Text style={styles.infoText}>15 000 000 FCFA</Text>
      </View>
    </View>
  );

  const renderInfoProprio = () => (
    <View style={styles.infoProprioContent}>
      <UserAvatar initials="B" size={40} color="#E8F5E9" textColor="#4CAF50" />
      <View style={styles.proprioDetails}>
        <Text style={styles.proprioName}>Bailleur Anonyme</Text>
        <RatingStars rating={4.7} />
      </View>
      <View style={styles.proprioContact}>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={12} color="#556A68" />
          <Text style={styles.contactText}>01 02 03 04 05</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={12} color="#556A68" />
          <Text style={styles.contactText}>bailleur@gmail.com</Text>
        </View>
      </View>
    </View>
  );

  const renderAvisContent = () => (
    <View style={[styles.mainCard, styles.mainCardAvis]}>

      <Text style={styles.sectionTitle}>Nom du locataire</Text>
      <View style={styles.whiteBox}>
        <UserAvatar initials={user?.initials || 'CS'} size={40} color="#C9E84F" textColor="#182C2A" photo={user?.avatar} />
        <View style={styles.locataireInfo}>
          <Text style={styles.locataireName}>{user?.name || 'Coulibaly Sékou'}</Text>
          <RatingStars rating={user?.rating || 4.7} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Note</Text>
      <View style={styles.noteContainer}>
        <View style={styles.squaresRow}>
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFilled = starIndex <= (review?.rating || 3);
            return (
              <View
                key={starIndex}
                style={[
                  styles.starSquare,
                  isFilled ? styles.starSquareFilled : styles.starSquareEmpty
                ]}
              >
                <Ionicons name="star" size={16} color="#FFFFFF" />
              </View>
            );
          })}
        </View>
        <Text style={styles.noteText}>{review?.rating || 3} sur 5 - Assez bien</Text>
      </View>

      <Text style={styles.sectionTitle}>Relation locataire-bailleur</Text>
      <View style={styles.badgesRow}>
        {/* Badge 1: Vérifiée */}
        <View style={[
          styles.badge, 
          (review?.relation === 'Vérifiée' || !review?.relation) ? styles.badgeActive : styles.badgeInactive
        ]}>
          {(review?.relation === 'Vérifiée' || !review?.relation) && <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
          <Text style={(review?.relation === 'Vérifiée' || !review?.relation) ? styles.badgeTextActive : styles.badgeTextInactive}>Vérifiée</Text>
        </View>

        {/* Badge 2: Non vérifiée */}
        <View style={[
          styles.badge, 
          review?.relation === 'Non vérifiée' ? { backgroundColor: '#FF9800', borderColor: '#FF9800', flexDirection: 'row', alignItems: 'center' } : styles.badgeInactive
        ]}>
          {review?.relation === 'Non vérifiée' && <Ionicons name="alert-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
          <Text style={review?.relation === 'Non vérifiée' ? [styles.badgeTextActive, { color: '#FFFFFF' }] : styles.badgeTextInactive}>Non vérifiée</Text>
        </View>

        {/* Badge 3: Refusée */}
        <View style={[
          styles.badge, 
          review?.relation === 'Refusée' ? { backgroundColor: '#F25C69', borderColor: '#F25C69', flexDirection: 'row', alignItems: 'center' } : styles.badgeInactive
        ]}>
          {review?.relation === 'Refusée' && <Ionicons name="close-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
          <Text style={review?.relation === 'Refusée' ? [styles.badgeTextActive, { color: '#FFFFFF' }] : styles.badgeTextInactive}>Refusée</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Commentaire</Text>
      <View style={styles.whiteBox}>
        <Text style={styles.commentText}>
          {review?.text || "Bon locataire, il paye toujours son loyer à temps et ses voisins ne se sont jamais plaints de lui."}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Régularité dans le paiement</Text>
      <View style={styles.badgesRow}>
        <View style={[styles.badge, styles.badgeActive]}>
          <Text style={styles.badgeTextActive}>Toujours à temps</Text>
        </View>
        <View style={[styles.badge, styles.badgeInactive]}>
          <Text style={styles.badgeTextInactive}>Peu de Retard</Text>
        </View>
        <View style={[styles.badge, styles.badgeInactive]}>
          <Text style={styles.badgeTextInactive}>Pas régulier</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Pièces Jointes - Preuves</Text>
      <View style={styles.piecesRow}>
        <View style={styles.pieceCard}>
          <Ionicons name="document-text" size={32} color="#84B889" />
          <Text style={styles.pieceText}>Quittance.pdf</Text>
        </View>
        <View style={styles.pieceCard}>
          <Ionicons name="image" size={32} color="#84B889" />
          <Text style={styles.pieceText}>Recu_bancaire.png</Text>
        </View>
      </View>
    </View>
  );

  const renderContestationContent = () => (
    <View style={[styles.mainCard, styles.mainCardContestation]}>
      {!hasContestation ? (
        <View style={styles.emptyContestation}>
          <Ionicons name="ban-outline" size={60} color="#F25C69" />
          <Text style={styles.emptyContestationText}>Aucune contestation</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitleRed}>Motifs de la contestation</Text>
          <View style={styles.whiteBox}>
            <Text style={styles.commentText}>
              Le bailleur prétend qu'il y a eu des retards, mais j'ai toutes les preuves de virements bancaires effectués à temps le 1er de chaque mois.
            </Text>
          </View>

          <Text style={styles.sectionTitleRed}>Pièces Jointes - Preuves</Text>
          <View style={styles.piecesRow}>
            <View style={styles.pieceCard}>
              <Ionicons name="document-text" size={32} color="#F25C69" />
              <Text style={styles.pieceText}>Relevé.pdf</Text>
            </View>
            <View style={styles.pieceCard}>
              <Ionicons name="image" size={32} color="#F25C69" />
              <Text style={styles.pieceText}>Capture.png</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Block in pure flat white */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#182C2A" />
            </TouchableOpacity>
            <View style={styles.logoContainerSmall}>
              <Image 
                source={require('../assets/images/logo.png')} 
                style={{ width: 60, height: 25, resizeMode: 'contain' }} 
              />
            </View>
          </View>
          <Text style={styles.headerTitle}>Avis propriétaires</Text>
          <View style={{ width: 60 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Info Box (Propriétaire / Bien) */}
        <View style={styles.infoBoxContainer}>
          <View style={styles.infoBoxContent}>
            <Text style={styles.infoBoxTitle}>{infoTab === 'Bien' ? 'Infos Bien' : 'Infos Propriétaire'}</Text>
            {infoTab === 'Bien' ? renderInfoBien() : renderInfoProprio()}
          </View>

          {/* Sub-tabs Infos */}
          <View style={styles.infoTabsRow}>
            <TouchableOpacity
              style={[styles.infoTab, infoTab === 'Propriétaire' ? styles.infoTabActive : styles.infoTabInactive]}
              onPress={() => setInfoTab('Propriétaire')}
            >
              <Text style={[styles.infoTabText, infoTab === 'Propriétaire' ? styles.infoTabTextActive : styles.infoTabTextInactive]}>
                Propriétaire
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.infoTab, infoTab === 'Bien' ? styles.infoTabActive : styles.infoTabInactive]}
              onPress={() => setInfoTab('Bien')}
            >
              <Text style={[styles.infoTabText, infoTab === 'Bien' ? styles.infoTabTextActive : styles.infoTabTextInactive]}>
                Bien
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Tabs (Avis / Contestation) */}
        <View style={styles.mainTabsRow}>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'Avis' ? styles.mainTabAvisActive : styles.mainTabInactive]}
            onPress={() => setMainTab('Avis')}
          >
            <Text style={[styles.mainTabText, mainTab === 'Avis' ? styles.mainTabTextActive : styles.mainTabTextInactive]}>
              Avis
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'Contestation' ? styles.mainTabContestationActive : styles.mainTabInactive]}
            onPress={() => setMainTab('Contestation')}
          >
            <Ionicons name="warning-outline" size={15} color={mainTab === 'Contestation' ? '#FFFFFF' : '#F25C69'} style={{ marginRight: 6 }} />
            <Text style={[styles.mainTabText, mainTab === 'Contestation' ? styles.mainTabTextActive : styles.mainTabTextInactive]}>
              Contestation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Card */}
        {mainTab === 'Avis' ? renderAvisContent() : renderContestationContent()}

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
    marginRight: 10,
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

  // Info Box
  infoBoxContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoBoxContent: {
    padding: 16,
    minHeight: 110,
  },
  infoBoxTitle: {
    fontSize: fs(14),
    fontWeight: '700',
    color: '#F59A23',
    marginBottom: 12,
  },
  infoBienContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 6,
    fontSize: fs(12),
    color: '#182C2A',
    fontWeight: '600',
  },
  infoProprioContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proprioDetails: {
    marginLeft: 12,
    flex: 1,
  },
  proprioName: {
    fontWeight: '700',
    color: '#182C2A',
    fontSize: fs(14),
    marginBottom: 2,
  },
  proprioContact: {
    alignItems: 'flex-start',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: fs(11),
    marginLeft: 6,
    color: '#556A68',
  },
  infoTabsRow: {
    flexDirection: 'row',
    height: 40,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  infoTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTabActive: {
    backgroundColor: '#E8F5E9',
  },
  infoTabInactive: {
    backgroundColor: '#FFFFFF',
  },
  infoTabText: {
    fontWeight: '700',
    fontSize: fs(12),
  },
  infoTabTextActive: {
    color: '#4CAF50',
  },
  infoTabTextInactive: {
    color: '#7A8B89',
  },

  // Main Tabs
  mainTabsRow: {
    flexDirection: 'row',
    marginBottom: -1, // Overlap border
    zIndex: 1,
  },
  mainTab: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#EAEAEA',
  },
  mainTabAvisActive: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#4CAF50',
    borderTopWidth: 3,
  },
  mainTabContestationActive: {
    backgroundColor: '#FDF2F2',
    borderColor: '#FAD4D4',
    borderTopColor: '#F25C69',
    borderTopWidth: 3,
  },
  mainTabInactive: {
    backgroundColor: '#F2F4F4',
    borderColor: '#EAEAEA',
  },
  mainTabText: {
    fontWeight: '700',
    fontSize: fs(12),
  },
  mainTabTextActive: {
    color: '#182C2A',
  },
  mainTabTextInactive: {
    color: '#7A8B89',
  },

  // Main Content Card
  mainCard: {
    borderWidth: 1.5,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  mainCardAvis: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0', // Cleaner flat outline border
    borderTopWidth: 0,
  },
  mainCardContestation: {
    backgroundColor: '#FDF2F2', // Soft pastel pink background
    borderColor: '#FAD4D4',
    borderLeftWidth: 6, // Premium left red border accent
    borderLeftColor: '#F25C69',
    borderTopWidth: 0,
  },
  sectionTitle: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#182C2A',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleRed: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#F25C69',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  whiteBox: {
    backgroundColor: '#FAFBFB', // Subtle contrast light background
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  locataireInfo: {
    marginLeft: 12,
  },
  locataireName: {
    fontWeight: '700',
    color: '#F59A23',
    fontSize: fs(15),
    marginBottom: 4,
  },
  noteContainer: {
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  squaresRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  starSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  starSquareFilled: {
    backgroundColor: '#4CAF50', // Emerald green squares
  },
  starSquareEmpty: {
    backgroundColor: '#EAEAEA',
  },
  noteText: {
    fontSize: fs(12),
    color: '#556A68',
    fontWeight: '600',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  badgeInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAEAEA',
  },
  badgeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fs(11),
    marginLeft: 4,
  },
  badgeTextInactive: {
    color: '#7A8B89',
    fontWeight: '700',
    fontSize: fs(11),
  },
  commentText: {
    fontSize: fs(13),
    color: '#182C2A',
    lineHeight: 20,
  },
  piecesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  pieceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 110,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Cleaner flat outline border
  },
  pieceText: {
    fontSize: fs(11),
    fontWeight: '700',
    color: '#182C2A',
    textAlign: 'center',
    marginTop: 6,
  },

  // Empty Contestation
  emptyContestation: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContestationText: {
    fontWeight: '700',
    fontSize: fs(14),
    color: '#7A8B89',
    marginTop: 15,
  },
});
