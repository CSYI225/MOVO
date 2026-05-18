import React from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import ReviewCard from '../components/ReviewCard';
import { COLORS, fs } from '../Styles/global';

export default function Contestation({ navigation, route }) {
  const { onSubmit, reviewId } = route.params || {};

  const handleSubmit = () => {
    if (onSubmit) onSubmit(reviewId);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Contestation"
        onBack={() => navigation.goBack()}
        showSearch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Rapport Concerné</Text>
        <ReviewCard showActions={false} />

        <Text style={styles.sectionLabel}>Motif de la contestation</Text>
        <View style={styles.inputContainer}>
          <TextInput
            multiline
            numberOfLines={5}
            style={styles.textArea}
            placeholder="Renseignez ici le motif détaillé de votre contestation..."
            placeholderTextColor="#7A8B89"
            defaultValue="Le bailleur prétend qu'il y a eu des retards de paiement, mais j'ai toutes les preuves de virements bancaires effectués à temps le 1er de chaque mois."
          />
        </View>

        <Text style={styles.sectionLabel}>Pièces jointes - Preuves</Text>
        <View style={styles.proofsContainer}>
          <View style={styles.proofBox}>
            <Ionicons name="document-text-outline" size={28} color="#84B889" />
            <TouchableOpacity style={styles.removeProof} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#FF5252" />
            </TouchableOpacity>
          </View>
          <View style={styles.proofBox}>
            <Ionicons name="image-outline" size={28} color="#84B889" />
            <TouchableOpacity style={styles.removeProof} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#FF5252" />
            </TouchableOpacity>
          </View>
          <View style={styles.proofBox}>
            <Ionicons name="image-outline" size={28} color="#84B889" />
            <TouchableOpacity style={styles.removeProof} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#FF5252" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.proofBox, styles.addProof]} activeOpacity={0.7}>
            <Ionicons name="add" size={28} color="#7A8B89" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.7}>
          <Text style={styles.submitButtonText}>Soumettre la Contestation</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: fs(11),
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 20,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#FAD4D4',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFF1F2',
  },
  textArea: {
    fontSize: fs(13),
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
    textAlignVertical: 'top',
    height: 100,
  },
  proofsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 16,
  },
  proofBox: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  addProof: {
    borderWidth: 1.5,
    borderColor: '#7A8B89',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  removeProof: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
  },
  submitButton: {
    backgroundColor: '#0F322B', // Matches our primary dark sapin green!
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fs(14),
  }
});
