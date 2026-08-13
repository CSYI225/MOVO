import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fs } from '../Styles/global';
import RatingStars from './RatingStars';

import { useAuth } from '../context/AuthContext';

const ReviewCard = ({ data, onValidate, onContest, showActions = true, status, onPress, compact = false }) => {
  const { API_URL } = useAuth() || {};

  const getFullFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    let url = fileUrl;
    if (url.startsWith('/uploads')) {
      const baseApi = (API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
      url = `${baseApi}${url}`;
    } else if (url.includes('/uploads/')) {
      const fileName = url.split('/uploads/').pop();
      const baseApi = (API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
      url = `${baseApi}/uploads/${fileName}`;
    }
    return url;
  };

  const handleOpenAttachment = (url, nom) => {
    const targetUrl = getFullFileUrl(url);
    if (targetUrl) {
      Linking.openURL(targetUrl).catch(() => Alert.alert('Erreur', `Impossible d'ouvrir ${nom}`));
    } else {
      Alert.alert('Fichier', nom || 'Pièce jointe');
    }
  };
  const bailleurNom = data?.bailleur
    ? `${data.bailleur.prenom || ''} ${data.bailleur.nom || ''}`.trim() || data.bailleur.email
    : data?.location || 'Bailleur MOVO';

  const bailleurInitiales = bailleurNom
    ? bailleurNom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'BL';

  // Infos du bien
  const typeBien = data?.type || data?.bien?.type || null;
  const adresseBien = data?.adresse || data?.bien?.adresse || null;
  const loyerBien = data?.price || data?.bien?.loyer || null;

  // Contesté: si `status` local ou `dejaConteste` venant du backend
  const isContested = status === 'contested' || data?.dejaConteste === true;
  const isValidated = status === 'validated';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
    >
      {/* Status Badge */}
      {isValidated && (
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
      )}
      {isContested && (
        <View style={styles.statusBadge}>
          <Ionicons name="alert-circle" size={24} color="#FF5252" />
        </View>
      )}

      {/* Compact date header */}
      {compact && (
        <View style={styles.compactHeader}>
          <Text style={styles.compactDateText}>{data?.date || ''}</Text>
          <RatingStars rating={data?.rating || 5} />
        </View>
      )}

      {/* Full header: bailleur avatar + name + date */}
      {!compact && (
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{bailleurInitiales}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{bailleurNom}</Text>
            <Text style={styles.userLocation}>{data?.date || ''}</Text>
          </View>
          <View style={styles.dateInfo}>
            <RatingStars rating={data?.rating || 5} style={styles.ratingStars} />
          </View>
        </View>
      )}

      {/* Section: Infos Bien */}
      <Text style={styles.sectionLabel}>Infos Bien</Text>
      <View style={styles.infoBienContainer}>
        {typeBien ? (
          <View style={styles.infoItem}>
            <Ionicons name="home-outline" size={14} color="#182C2A" />
            <Text style={styles.infoItemText}>{typeBien}</Text>
          </View>
        ) : null}
        {adresseBien ? (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color="#182C2A" />
            <Text style={styles.infoItemText} numberOfLines={1}>{adresseBien}</Text>
          </View>
        ) : null}
        {loyerBien ? (
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={14} color="#182C2A" />
            <Text style={styles.infoItemText}>{loyerBien}</Text>
          </View>
        ) : null}
        {!typeBien && !adresseBien && !loyerBien && (
          <Text style={{ fontSize: fs(11), color: '#94A3B8', fontStyle: 'italic' }}>Infos bien non disponibles</Text>
        )}
      </View>

      {/* Section: Commentaire */}
      <Text style={styles.sectionLabel}>Commentaire</Text>
      <View style={styles.commentBox}>
        <Text style={styles.commentText}>
          {data?.comment || data?.text || data?.commentaire || '—'}
        </Text>
      </View>

      {/* Section: Pièces jointes */}
      {data?.piecesJointes && data.piecesJointes.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Pièces jointes</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {data.piecesJointes.map(pj => (
              <TouchableOpacity key={pj.id} style={styles.pieceJointeBox} onPress={() => handleOpenAttachment(pj.url, pj.nom)} activeOpacity={0.7}>
                <Ionicons
                  name={pj.type === 'pdf' || pj.type === 'document' ? 'document-text-outline' : 'image-outline'}
                  size={20}
                  color="#0F322B"
                />
                <Text style={styles.pieceJointeText} numberOfLines={1}>{pj.nom}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Contestation notice */}
      {isContested && (
        <View style={styles.contestationBox}>
          <Ionicons name="warning-outline" size={14} color="#F43F5E" />
          <Text style={styles.contestationText}>Ce rapport a été contesté</Text>
        </View>
      )}

      {/* Actions: Valider / Contester */}
      {showActions && !isContested && !isValidated && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionValidate}
            onPress={onValidate}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionValidateText}>Valider</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionContest}
            onPress={onContest}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#182C2A" />
            <Text style={styles.actionContestText}>Contester</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    marginBottom: 20,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: -4,
  },
  compactDateText: {
    fontSize: fs(11),
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    backgroundColor: '#C9E84F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fs(18),
    fontWeight: '800',
    color: '#0F322B',
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#0F322B',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: fs(12),
    color: '#64748B',
  },
  dateInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ratingStars: {
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: fs(10),
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 18,
  },
  infoBienContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoItemText: {
    fontSize: fs(11),
    fontWeight: '700',
    color: '#0F322B',
    maxWidth: 100,
  },
  commentBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    minHeight: 60,
    justifyContent: 'center',
  },
  commentText: {
    fontSize: fs(13),
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
  },
  pieceJointeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FFF4',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  pieceJointeText: {
    fontSize: fs(10),
    color: '#0F322B',
    fontWeight: '600',
    maxWidth: 80,
  },
  contestationBox: {
    marginTop: 16,
    backgroundColor: '#FFF1F2',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F43F5E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contestationText: {
    fontSize: fs(11),
    fontWeight: '700',
    color: '#F43F5E',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  actionValidate: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F322B',
    paddingVertical: 12,
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionContestText: {
    color: '#182C2A',
    fontWeight: '700',
    fontSize: fs(13),
  },
});

export default ReviewCard;
