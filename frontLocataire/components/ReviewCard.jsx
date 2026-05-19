import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, fs } from '../Styles/global';
import RatingStars from './RatingStars';

const ReviewCard = ({ data, onValidate, onContest, showActions = true, status, onPress, compact = false }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
    >
      {/* Top Status Icon Badge */}
      {status === 'validated' && (
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
      )}
      {status === 'contested' && (
        <View style={styles.statusBadge}>
          <Ionicons name="alert-circle" size={24} color="#FF5252" />
        </View>
      )}

      {/* Date Header for compact mode */}
      {compact && (
        <View style={styles.compactHeader}>
          <Text style={styles.compactDateText}>{data?.date || "Mars 2024"}</Text>
        </View>
      )}

      {/* Report Header: Rounded Square Avatar, Name, Date/Stars (Hidden in compact mode) */}
      {!compact && (
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>CS</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Coulibaly Sékou</Text>
            <Text style={styles.userLocation}>{data?.location || "Abidjan, Cocody"}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>{data?.date || "Mars 2024"}</Text>
            <RatingStars rating={data?.rating || 5} style={styles.ratingStars} />
          </View>
        </View>
      )}

      {/* Section: Infos Bien */}
      <Text style={styles.sectionLabel}>Infos Bien</Text>
      <View style={styles.infoBienContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="home-outline" size={14} color="#182C2A" />
          <Text style={styles.infoItemText}>{data?.type || "Duplex"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={14} color="#182C2A" />
          <Text style={styles.infoItemText}>{data?.location || "Abidjan, Cocody"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={14} color="#182C2A" />
          <Text style={styles.infoItemText}>{data?.price || "15 000 000 FCFA"}</Text>
        </View>
      </View>

      {/* Section: Commentaire */}
      <Text style={styles.sectionLabel}>Commentaire</Text>
      <View style={styles.commentBox}>
        <Text style={styles.commentText}>
          {data?.comment || data?.text || "Bon locataire, il paye toujours son loyer à temps."}
        </Text>
      </View>

      {/* Contestation Box (Displays only if contested) */}
      {status === 'contested' && (
        <View style={styles.contestationBox}>
          <Ionicons name="warning-outline" size={14} color="#F43F5E" />
          <Text style={styles.contestationText}>Ce rapport a été contesté par le locataire</Text>
        </View>
      )}

      {/* Actions Buttons (Valider / Contester) */}
      {showActions && !status && (
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
    borderColor: '#E2E8F0', // Sleek flat double-border line
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
    fontSize: fs(20),
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
  dateText: {
    fontSize: fs(11),
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
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
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    gap: 8,
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
  },
  commentBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    minHeight: 80,
    justifyContent: 'center',
  },
  commentText: {
    fontSize: fs(13),
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
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
