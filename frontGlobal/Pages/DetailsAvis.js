import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, globalStyles, fs } from '../Styles/global';
import UserAvatar from '../components/UserAvatar';
import RatingStars from '../components/RatingStars';

export default function DetailsAvis({ route, navigation }) {
  const { review, user, avisComplet } = route.params || {};

  // States pour les onglets
  const [infoTab, setInfoTab] = useState('Bien'); // 'Propriétaire' | 'Bien'
  const [mainTab, setMainTab] = useState('Avis'); // 'Avis' | 'Contestation'

  // Contestation depuis l'API ou le fallback
  const contestationData = avisComplet?.contestation;
  const hasContestation = avisComplet?.dejaConteste || !!contestationData || review?.status === 'contested';

  // Données du bien
  const bienData = avisComplet?.bien;
  const typeBien = bienData?.type || 'Logement';
  const locationBien = bienData?.location || review?.location || 'Côte d\'Ivoire';

  // Note et avis
  const noteValue = avisComplet?.note || review?.rating || 5;
  const commentValue = avisComplet?.commentaire || review?.text || "Aucun commentaire.";
  const regulariteValue = avisComplet?.regularitePaiement || review?.regularity || 'Toujours à temps';
  const piecesJointes = avisComplet?.piecesJointes || [];

  const handleOpenDoc = (url) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const renderInfoBien = () => (
    <View style={styles.infoBienContent}>
      <View style={styles.infoItem}>
        <Ionicons name="home-outline" size={18} color="#182C2A" />
        <Text style={styles.infoText}>{typeBien}</Text>
      </View>
      <View style={styles.infoItem}>
        <Ionicons name="location-outline" size={18} color="#182C2A" />
        <Text style={styles.infoText}>{locationBien}</Text>
      </View>
    </View>
  );

  const renderInfoProprio = () => (
    <View style={styles.infoProprioContent}>
      <UserAvatar initials={avisComplet?.bailleur?.initials || 'B'} size={40} color="#E8F5E9" textColor="#4CAF50" />
      <View style={styles.proprioDetails}>
        <Text style={styles.proprioName}>Bailleur MOVO (Anonyme)</Text>
        <RatingStars rating={5.0} />
      </View>
    </View>
  );

  const renderAvisContent = () => (
    <View style={[styles.mainCard, styles.mainCardAvis]}>

      <Text style={styles.sectionTitle}>Nom du locataire</Text>
      <View style={styles.whiteBox}>
        <UserAvatar initials={user?.initials || 'CS'} size={40} color="#C9E84F" textColor="#182C2A" photo={user?.avatar} />
        <View style={styles.locataireInfo}>
          <Text style={styles.locataireName}>{user?.name || 'Locataire'}</Text>
          <RatingStars rating={user?.rating || 5.0} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Note</Text>
      <View style={styles.noteContainer}>
        <View style={styles.squaresRow}>
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFilled = starIndex <= noteValue;
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
        <Text style={styles.noteText}>{noteValue} sur 5</Text>
      </View>

      <Text style={styles.sectionTitle}>Relation locataire-bailleur</Text>
      <View style={styles.badgesRow}>
        <View style={[styles.badge, styles.badgeActive]}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.badgeTextActive}>Vérifiée</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Commentaire</Text>
      <View style={styles.whiteBox}>
        <Text style={styles.commentText}>{commentValue}</Text>
      </View>

      <Text style={styles.sectionTitle}>Régularité dans le paiement</Text>
      <View style={styles.badgesRow}>
        {['Toujours à temps', 'Peu de retard', 'Pas régulier'].map((regOption) => {
          const isSelected = regulariteValue === regOption;
          return (
            <View
              key={regOption}
              style={[
                styles.badge,
                isSelected ? styles.badgeActive : styles.badgeInactive
              ]}
            >
              <Text style={isSelected ? styles.badgeTextActive : styles.badgeTextInactive}>
                {regOption}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Pièces Jointes - Preuves</Text>
      {piecesJointes.length > 0 ? (
        <View style={styles.piecesRow}>
          {piecesJointes.map((p) => (
            <TouchableOpacity key={p.id} style={styles.pieceCard} onPress={() => handleOpenDoc(p.url)}>
              <Ionicons name="document-text" size={32} color="#84B889" />
              <Text style={styles.pieceText} numberOfLines={1}>{p.nom || 'Document'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.whiteBox}>
          <Text style={{ fontSize: fs(12), color: '#7A8B89' }}>Aucune pièce jointe jointe à cet avis.</Text>
        </View>
      )}
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
              {contestationData?.raison || "Cet avis a été contesté par le locataire."}
            </Text>
          </View>

          <Text style={styles.sectionTitleRed}>Pièces Jointes - Preuves de contestation</Text>
          {contestationData?.piecesJointes && contestationData.piecesJointes.length > 0 ? (
            <View style={styles.piecesRow}>
              {contestationData.piecesJointes.map((p) => (
                <TouchableOpacity key={p.id} style={styles.pieceCard} onPress={() => handleOpenDoc(p.url)}>
                  <Ionicons name="document-text" size={32} color="#F25C69" />
                  <Text style={styles.pieceText} numberOfLines={1}>{p.nom || 'Preuve'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.whiteBox}>
              <Text style={{ fontSize: fs(12), color: '#7A8B89' }}>Aucune pièce jointe à la contestation.</Text>
            </View>
          )}
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
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
          <Text style={styles.headerTitle}>Détails de l'avis</Text>
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
            <Text style={[styles.mainTabText, mainTab === 'Contestation' ? styles.mainTabContestationTextActive : styles.mainTabTextInactive]}>
              Contestation {hasContestation ? '(1)' : '(0)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {mainTab === 'Avis' ? renderAvisContent() : renderContestationContent()}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFBFB' },
  scrollContent: { padding: 16, paddingTop: 10, paddingBottom: 40 },
  headerBlock: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F2F4F4',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { marginRight: 12, padding: 4 },
  logoContainerSmall: { justifyContent: 'center' },
  headerTitle: { fontSize: fs(17), fontWeight: '700', color: '#182C2A' },

  infoBoxContainer: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0',
    overflow: 'hidden', marginBottom: 20,
  },
  infoBoxContent: { padding: 16 },
  infoBoxTitle: { fontSize: fs(15), fontWeight: '700', color: '#182C2A', marginBottom: 12 },
  infoBienContent: { gap: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: fs(14), color: '#556A68' },
  infoProprioContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  proprioDetails: { flex: 1 },
  proprioName: { fontSize: fs(14), fontWeight: '700', color: '#182C2A', marginBottom: 4 },

  infoTabsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F2F4F4' },
  infoTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  infoTabActive: { backgroundColor: '#E8F5E9' },
  infoTabInactive: { backgroundColor: '#FFFFFF' },
  infoTabText: { fontSize: fs(13), fontWeight: '600' },
  infoTabTextActive: { color: '#4CAF50' },
  infoTabTextInactive: { color: '#7A8B89' },

  mainTabsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  mainTab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 },
  mainTabAvisActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  mainTabContestationActive: { backgroundColor: '#FEE2E2', borderColor: '#F25C69' },
  mainTabInactive: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  mainTabText: { fontSize: fs(14), fontWeight: '700' },
  mainTabTextActive: { color: '#4CAF50' },
  mainTabContestationTextActive: { color: '#F25C69' },
  mainTabTextInactive: { color: '#7A8B89' },

  mainCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5,
    borderColor: '#E2E8F0', padding: 20, gap: 14,
  },
  mainCardAvis: {},
  mainCardContestation: {},
  sectionTitle: { fontSize: fs(13), fontWeight: '700', color: '#182C2A' },
  sectionTitleRed: { fontSize: fs(13), fontWeight: '700', color: '#F25C69' },
  whiteBox: {
    backgroundColor: '#FAFBFB', borderRadius: 12, borderWidth: 1,
    borderColor: '#E2E8F0', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  locataireInfo: { flex: 1 },
  locataireName: { fontSize: fs(15), fontWeight: '700', color: '#F59A23', marginBottom: 4 },
  noteContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  squaresRow: { flexDirection: 'row', gap: 4 },
  starSquare: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  starSquareFilled: { backgroundColor: '#F5A623' },
  starSquareEmpty: { backgroundColor: '#E2E8F0' },
  noteText: { fontSize: fs(13), fontWeight: '700', color: '#182C2A' },

  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, flexDirection: 'row', alignItems: 'center',
  },
  badgeActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  badgeInactive: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  badgeTextActive: { color: '#FFFFFF', fontSize: fs(12), fontWeight: '700' },
  badgeTextInactive: { color: '#7A8B89', fontSize: fs(12), fontWeight: '600' },

  commentText: { fontSize: fs(13), color: '#4A5A58', lineHeight: 20 },

  piecesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pieceCard: {
    backgroundColor: '#FAFBFB', borderRadius: 12, borderWidth: 1,
    borderColor: '#E2E8F0', padding: 12, alignItems: 'center', width: 110, gap: 6,
  },
  pieceText: { fontSize: fs(11), color: '#182C2A', fontWeight: '600', textAlign: 'center' },

  emptyContestation: { padding: 40, alignItems: 'center', gap: 12 },
  emptyContestationText: { fontSize: fs(14), fontWeight: '700', color: '#F25C69' },
});
