import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';
import Header from '../components/Header';

export default function DetailsAvis({ route, navigation }) {
  const { review } = route.params || {};

  // Tabs states
  const [infoTab, setInfoTab] = useState('Bien'); // 'Propriétaire' | 'Bien'
  const [mainTab, setMainTab] = useState('Avis'); // 'Avis' | 'Contestation'

  // Determine if this review has contestation based on state or params
  const hasContestation = review?.status === 'contested' || review?.id === '3';

  // Badges state evaluation
  const relation = review?.relation || 'Vérifiée';
  const regularity = review?.regularity || 'Toujours à temps';

  const renderInfoBien = () => (
    <View style={styles.infoBienContent}>
      <View style={styles.infoItem}>
        <Ionicons name="home-outline" size={18} color="#182C2A" />
        <Text style={styles.infoText}>{review?.type || "Duplex"}</Text>
      </View>
      <View style={styles.infoItem}>
        <Ionicons name="location-outline" size={18} color="#182C2A" />
        <Text style={styles.infoText}>{review?.location || "Abidjan, Cocody"}</Text>
      </View>
      <View style={styles.infoItem}>
        <Ionicons name="cash-outline" size={18} color="#182C2A" />
        <Text style={styles.infoText}>{review?.price || "15 000 000 FCFA"}</Text>
      </View>
    </View>
  );

  const renderInfoProprio = () => (
    <View style={styles.infoProprioContent}>
      <UserAvatar initials="CS" size={40} color="#E8F5E9" textColor="#4CAF50" />
      <View style={styles.proprioDetails}>
        <Text style={styles.proprioName}>Coulibaly Sékou</Text>
        <RatingStars rating={5} />
      </View>
      <View style={styles.proprioContact}>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={12} color="#556A68" />
          <Text style={styles.contactText}>+225 07 08 09 10 11</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={12} color="#556A68" />
          <Text style={styles.contactText}>s.coulibaly@movo.ci</Text>
        </View>
      </View>
    </View>
  );

  const renderAvisContent = () => (
    <View style={[styles.mainCard, styles.mainCardAvis]}>
      {/* Corrected label to Nom du locataire */}
      <Text style={styles.sectionTitle}>Nom du locataire</Text>
      <View style={styles.whiteBox}>
        <UserAvatar initials="CS" size={40} color="#C9E84F" textColor="#182C2A" />
        <View style={styles.locataireInfo}>
          <Text style={styles.locataireName}>Coulibaly Sékou</Text>
          <RatingStars rating={review?.rating || 5} />
        </View>
      </View>

      <View style={styles.noteContainer}>
        <View style={styles.squaresRow}>
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFilled = starIndex <= (review?.rating || 5);
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
        <Text style={styles.noteText}>{review?.rating || 5} sur 5 - {review?.rating >= 4 ? 'Excellent' : 'Correct'}</Text>
      </View>

      {/* Corrected Relation Section showing all three options */}
      <Text style={styles.sectionTitle}>Relation locataire-bailleur</Text>
      <View style={styles.badgesRow}>
        {/* Badges Option 1: Vérifiée */}
        <View style={[styles.badge, relation === 'Vérifiée' ? styles.badgeActive : styles.badgeInactive]}>
          {relation === 'Vérifiée' && <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
          <Text style={relation === 'Vérifiée' ? styles.badgeTextActive : styles.badgeTextInactive}>Vérifiée</Text>
        </View>
        
        {/* Badges Option 2: Non vérifiée */}
        <View style={[
          styles.badge, 
          relation === 'Non vérifiée' ? { backgroundColor: '#FF9800', borderColor: '#FF9800', flexDirection: 'row', alignItems: 'center' } : styles.badgeInactive
        ]}>
          {relation === 'Non vérifiée' && <Ionicons name="alert-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
          <Text style={relation === 'Non vérifiée' ? [styles.badgeTextActive, { color: '#FFFFFF' }] : styles.badgeTextInactive}>Non vérifiée</Text>
        </View>

        {/* Badges Option 3: Refusée */}
        <View style={[
          styles.badge, 
          relation === 'Refusée' ? { backgroundColor: '#F25C69', borderColor: '#F25C69', flexDirection: 'row', alignItems: 'center' } : styles.badgeInactive
        ]}>
          {relation === 'Refusée' && <Ionicons name="close-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
          <Text style={relation === 'Refusée' ? [styles.badgeTextActive, { color: '#FFFFFF' }] : styles.badgeTextInactive}>Refusée</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Commentaire</Text>
      <View style={styles.whiteBox}>
        <Text style={styles.commentText}>
          {review?.text || review?.comment || "Aucun commentaire."}
        </Text>
      </View>

      {/* Corrected Regularity Section showing all three options */}
      <Text style={styles.sectionTitle}>Régularité dans le paiement</Text>
      <View style={styles.badgesRow}>
        {/* Option 1: Toujours à temps */}
        <View style={[styles.badge, regularity === 'Toujours à temps' ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={regularity === 'Toujours à temps' ? styles.badgeTextActive : styles.badgeTextInactive}>Toujours à temps</Text>
        </View>

        {/* Option 2: Peu de Retard */}
        <View style={[styles.badge, regularity === 'Peu de Retard' ? { backgroundColor: '#FF9800', borderColor: '#FF9800' } : styles.badgeInactive]}>
          <Text style={regularity === 'Peu de Retard' ? [styles.badgeTextActive, { color: '#FFFFFF' }] : styles.badgeTextInactive}>Peu de Retard</Text>
        </View>

        {/* Option 3: Pas régulier */}
        <View style={[styles.badge, regularity === 'Pas régulier' ? { backgroundColor: '#F25C69', borderColor: '#F25C69' } : styles.badgeInactive]}>
          <Text style={regularity === 'Pas régulier' ? [styles.badgeTextActive, { color: '#FFFFFF' }] : styles.badgeTextInactive}>Pas régulier</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Pièces Jointes - Preuves</Text>
      <View style={styles.piecesRow}>
        <View style={styles.pieceCard}>
          <Ionicons name="document-text-outline" size={32} color="#84B889" />
          <Text style={styles.pieceText}>Quittance.pdf</Text>
        </View>
        <View style={styles.pieceCard}>
          <Ionicons name="image-outline" size={32} color="#84B889" />
          <Text style={styles.pieceText}>Recu_paiement.png</Text>
        </View>
      </View>
    </View>
  );

  const renderContestationContent = () => (
    <View style={[styles.mainCard, styles.mainCardContestation]}>
      {!hasContestation ? (
        <View style={styles.emptyContestation}>
          <Ionicons name="ban-outline" size={48} color="#F25C69" />
          <Text style={styles.emptyContestationText}>Aucune contestation sur cet avis</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitleRed}>Motifs de la contestation</Text>
          <View style={styles.whiteBox}>
            <Text style={styles.commentText}>
              Le commentaire indique que je n'ai pas payé une partie du loyer, ce qui est faux car j'ai tous les reçus de virement bancaire.
            </Text>
          </View>

          <Text style={styles.sectionTitleRed}>Pièces Jointes - Preuves</Text>
          <View style={styles.piecesRow}>
            <View style={styles.pieceCard}>
              <Ionicons name="document-text-outline" size={32} color="#F25C69" />
              <Text style={styles.pieceText}>Relevé.pdf</Text>
            </View>
            <View style={styles.pieceCard}>
              <Ionicons name="image-outline" size={32} color="#F25C69" />
              <Text style={styles.pieceText}>Virement.png</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Header 
        title="Détail Avis"
        onBack={() => navigation.goBack()}
        showSearch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Landlord / Property upper switcher box */}
        <View style={styles.infoBoxContainer}>
          <View style={styles.infoBoxContent}>
            <Text style={styles.infoBoxTitle}>{infoTab === 'Bien' ? 'Infos Bien' : 'Infos Propriétaire'}</Text>
            {infoTab === 'Bien' ? renderInfoBien() : renderInfoProprio()}
          </View>

          <View style={styles.infoTabsRow}>
            <TouchableOpacity
              style={[styles.infoTab, infoTab === 'Propriétaire' ? styles.infoTabActive : styles.infoTabInactive]}
              onPress={() => setInfoTab('Propriétaire')}
              activeOpacity={0.7}
            >
              <Text style={[styles.infoTabText, infoTab === 'Propriétaire' ? styles.infoTabTextActive : styles.infoTabTextInactive]}>
                Propriétaire
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.infoTab, infoTab === 'Bien' ? styles.infoTabActive : styles.infoTabInactive]}
              onPress={() => setInfoTab('Bien')}
              activeOpacity={0.7}
            >
              <Text style={[styles.infoTabText, infoTab === 'Bien' ? styles.infoTabTextActive : styles.infoTabTextInactive]}>
                Bien
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab switch bar (Avis / Contestation) */}
        <View style={styles.mainTabsRow}>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'Avis' ? styles.mainTabAvisActive : styles.mainTabInactive]}
            onPress={() => setMainTab('Avis')}
            activeOpacity={0.7}
          >
            <Text style={[styles.mainTabText, mainTab === 'Avis' ? styles.mainTabTextActive : styles.mainTabTextInactive]}>
              Avis
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.mainTab, mainTab === 'Contestation' ? styles.mainTabContestationActive : styles.mainTabInactive]}
            onPress={() => setMainTab('Contestation')}
            activeOpacity={0.7}
          >
            <Ionicons name="warning-outline" size={15} color={mainTab === 'Contestation' ? '#FFFFFF' : '#F25C69'} style={{ marginRight: 6 }} />
            <Text style={[styles.mainTabText, mainTab === 'Contestation' ? styles.mainTabTextActive : styles.mainTabTextInactive]}>
              Contestation {hasContestation ? "(1)" : ""}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Detail Content Card */}
        {mainTab === 'Avis' ? renderAvisContent() : renderContestationContent()}

        {/* Valider / Contester Actions at the bottom */}
        {review?.status === null ? (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionValidate}
              onPress={() => {
                if (route.params?.onValidate) route.params.onValidate(review.id);
                navigation.goBack();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionValidateText}>Valider l'Avis</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionContest}
              onPress={() => {
                navigation.navigate('Contestation', { 
                  reviewId: review.id,
                  onSubmit: () => {
                    if (route.params?.onContest) route.params.onContest(review.id);
                    navigation.goBack();
                  }
                });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#182C2A" />
              <Text style={styles.actionContestText}>Contester</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Modification actions if already validated or contested
          <View style={styles.actionContainer}>
            {review?.status === 'validated' ? (
              <TouchableOpacity 
                style={[styles.actionContest, { flex: 1 }]}
                onPress={() => {
                  navigation.navigate('Contestation', { 
                    reviewId: review.id,
                    onSubmit: () => {
                      if (route.params?.onContest) route.params.onContest(review.id);
                      navigation.goBack();
                    }
                  });
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="alert-circle-outline" size={18} color="#182C2A" />
                <Text style={styles.actionContestText}>Contester l'Avis</Text>
              </TouchableOpacity>
            ) : (
              // If already contested, show BOTH "Valider l'Avis" (transform contestation into validation) and "Modifier" (modify the dispute)
              <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                <TouchableOpacity 
                  style={[styles.actionValidate, { flex: 1.4, backgroundColor: '#0F322B' }]}
                  onPress={() => {
                    if (route.params?.onValidate) route.params.onValidate(review.id);
                    navigation.goBack();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.actionValidateText}>Valider l'Avis</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionContest, { flex: 1 }]}
                  onPress={() => {
                    navigation.navigate('Contestation', { 
                      reviewId: review.id,
                      onSubmit: () => {
                        if (route.params?.onContest) route.params.onContest(review.id);
                        navigation.goBack();
                      }
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color="#182C2A" />
                  <Text style={styles.actionContestText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

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
  infoBoxContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
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

  // Main Tabs switching
  mainTabsRow: {
    flexDirection: 'row',
    marginBottom: -1,
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

  // Content card
  mainCard: {
    borderWidth: 1.5,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  mainCardAvis: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderTopWidth: 0,
  },
  mainCardContestation: {
    backgroundColor: '#FDF2F2',
    borderColor: '#FAD4D4',
    borderLeftWidth: 6,
    borderLeftColor: '#F25C69',
    borderTopWidth: 0,
  },
  sectionTitle: {
    fontSize: fs(11),
    fontWeight: '700',
    color: '#182C2A',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleRed: {
    fontSize: fs(11),
    fontWeight: '700',
    color: '#F25C69',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  whiteBox: {
    backgroundColor: '#FAFBFB',
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
    fontSize: fs(14),
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
    backgroundColor: '#4CAF50',
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
    fontWeight: '500',
  },
  piecesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  pieceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  pieceText: {
    fontSize: fs(10),
    fontWeight: '700',
    color: '#182C2A',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyContestation: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContestationText: {
    fontWeight: '700',
    fontSize: fs(13),
    color: '#7A8B89',
    marginTop: 12,
  },

  // Validate / Contest bottom bar actions
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  actionValidate: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F322B',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  actionValidateText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fs(13),
  },
  actionContest: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBFB',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  actionContestText: {
    color: '#182C2A',
    fontWeight: '700',
    fontSize: fs(13),
  },
});
