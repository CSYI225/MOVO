import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const ReviewCard = ({ data, onValidate, onContest, showActions = true, status }) => {
  return (
    <View style={styles.card}>
      {status === 'validated' && (
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
      )}
      {status === 'contested' && (
        <View style={styles.statusBadge}>
          <Ionicons name="warning" size={24} color="#FF5252" />
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.avatar}>
           <Text style={styles.avatarText}>CS</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Coulibaly Sékou</Text>
          <Text style={styles.userLocation}>Abidjan, Cocody</Text>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>Mar 2024</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <FontAwesome key={s} name="star" size={12} color="#FFA000" style={styles.star} />
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Infos Bien</Text>
      <View style={styles.infoBienContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="home-outline" size={16} color="#003366" />
          <Text style={styles.infoItemText}>Duplexe</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color="#003366" />
          <Text style={styles.infoItemText}>Abidjan,Cocody</Text>
        </View>
        <View style={styles.infoItem}>
          <FontAwesome name="money" size={16} color="#003366" />
          <Text style={styles.infoItemText}>15 000 000 FCFA</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Commentaire</Text>
      <View style={styles.commentBox}>
        <Text style={styles.commentText} numberOfLines={8}>
          Bon locataire, il paye toujours son loyer à temps et ses voisins ne se sont jamais pleind de lui. 
          En tout cas il n'y a rien à lui reprocher Bon locataire, il paye toujours son loyer à temps...
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Régularité dans le paiement</Text>
      <View style={styles.regularityContainer}>
        <View style={[styles.regularityButton, { backgroundColor: '#7ED38F' }]}>
          <Text style={styles.regularityText}>Toujours à temps</Text>
        </View>
        <View style={[styles.regularityButton, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: 1 }]}>
          <Text style={[styles.regularityText, { color: '#666' }]}>Peu de Retard</Text>
        </View>
        <View style={[styles.regularityButton, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', borderWidth: 1 }]}>
          <Text style={[styles.regularityText, { color: '#666' }]}>Pas régulier</Text>
        </View>
      </View>

      {showActions && !status && (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={onValidate}
          >
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.actionButtonText}>Valider</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Colors.secondary }]}
            onPress={onContest}
          >
            <Ionicons name="alert-circle" size={18} color="white" />
            <Text style={styles.actionButtonText}>Contester</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E0E7E7',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userLocation: {
    fontSize: 12,
    color: '#666',
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  stars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  star: {
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  infoBienContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemText: {
    fontSize: 10,
    marginLeft: 4,
    color: '#003366',
    fontWeight: '600',
  },
  commentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  regularityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  regularityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 0.32,
    alignItems: 'center',
  },
  regularityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '45%',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default ReviewCard;
