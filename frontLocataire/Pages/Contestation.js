import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Header from '../components/Header';
import ReviewCard from '../components/ReviewCard';
import { COLORS, fs } from '../Styles/global';
import { useAuth } from '../context/AuthContext';

export default function Contestation({ navigation, route }) {
  const { onSubmit, reviewId, review } = route.params || {};
  const { user, API_URL } = useAuth();
  const [proofs, setProofs] = useState(() => {
    if (review?.piecesJointesContestation && Array.isArray(review.piecesJointesContestation)) {
      return review.piecesJointesContestation.map(pj => ({
        id: pj.id,
        type: pj.type || 'document',
        name: pj.nom,
        url: pj.url,
      }));
    }
    return [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [reason, setReason] = useState(review?.raisonContestation || review?.contestationRaison || '');

  const handleAddProof = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name || `Piece_jointe_${Date.now()}.${asset.mimeType?.includes('pdf') ? 'pdf' : 'jpg'}`;
        const isPdf = asset.mimeType?.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

        const newProof = {
          id: Date.now().toString(),
          type: isPdf ? 'document' : 'image',
          name: fileName,
          uri: asset.uri,
          file: {
            uri: asset.uri,
            name: fileName,
            type: asset.mimeType || (isPdf ? 'application/pdf' : 'image/jpeg'),
          },
        };
        setProofs(prev => [...prev, newProof]);
      }
    } catch (err) {
      console.error('Erreur sélection document :', err);
      Alert.alert('Erreur', 'Impossible d\'accéder aux fichiers de votre appareil.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveProof = (id) => {
    setProofs(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le motif de votre contestation.');
      return;
    }

    if (onSubmit) onSubmit(reviewId);
    if (reviewId && user?.token) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('raison', reason);
        proofs.forEach(p => {
          if (p.file) {
            formData.append('piecesJointes', {
              uri: Platform.OS === 'android' ? p.file.uri : p.file.uri.replace('file://', ''),
              name: p.file.name,
              type: p.file.type,
            });
          }
        });

        const res = await fetch(`${API_URL}/avis/${reviewId}/contester`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          Alert.alert('Erreur', data.message || 'Erreur lors de la contestation.');
          return;
        }

        Alert.alert('Succès', data.message || 'Votre contestation a bien été enregistrée.');
        navigation.goBack();
      } catch (err) {
        console.error('Erreur soumission contestation :', err);
        Alert.alert('Erreur', 'Erreur réseau lors de la soumission.');
      } finally {
        setIsUploading(false);
      }
    } else {
      navigation.goBack();
    }
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
        <ReviewCard data={review} showActions={false} />

        <Text style={styles.sectionLabel}>Motif de la contestation</Text>
        <View style={styles.inputContainer}>
          <TextInput
            multiline
            numberOfLines={5}
            style={styles.textArea}
            placeholder="Renseignez ici le motif détaillé de votre contestation..."
            placeholderTextColor="#7A8B89"
            value={reason}
            onChangeText={setReason}
          />
        </View>

        <Text style={styles.sectionLabel}>Pièces jointes - Preuves</Text>
        <View style={styles.proofsContainer}>
          {proofs.map(proof => (
            <View key={proof.id} style={styles.proofBox}>
              <Ionicons name={proof.type === 'document' ? "document-text-outline" : "image-outline"} size={28} color="#84B889" />
              <TouchableOpacity style={styles.removeProof} onPress={() => handleRemoveProof(proof.id)} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity style={[styles.proofBox, styles.addProof]} onPress={handleAddProof} disabled={isUploading} activeOpacity={0.7}>
            {isUploading ? (
              <ActivityIndicator size="small" color="#7A8B89" />
            ) : (
              <Ionicons name="add" size={28} color="#7A8B89" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isUploading} activeOpacity={0.7}>
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Soumettre la Contestation</Text>
          )}
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
    backgroundColor: '#0F322B',
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
