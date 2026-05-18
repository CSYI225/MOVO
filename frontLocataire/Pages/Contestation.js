import React from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import ReviewCard from '../components/ReviewCard';
import Colors from '../constants/Colors';

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
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('Profil')}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Rapport</Text>
        <ReviewCard showActions={false} />

        <Text style={styles.sectionLabel}>Motif de la contestation</Text>
        <View style={styles.inputContainer}>
          <TextInput
            multiline
            numberOfLines={4}
            style={styles.textArea}
            placeholder="Écrivez ici le motif de votre contestation..."
            defaultValue="Bon locataire, il paye toujours son loyer à temps et ses voisins ne se sont jamais pleind de lui. En tout cas il n'y a rien à lui reprocher Bon locataire, il paye toujours son loyer à temps"
          />
        </View>

        <Text style={styles.sectionLabel}>Pièces jointes - Preuves</Text>
        <View style={styles.proofsContainer}>
          <View style={styles.proofBox}>
            <Ionicons name="document-text-outline" size={32} color="#CCC" />
            <TouchableOpacity style={styles.removeProof}>
              <Ionicons name="close-circle" size={20} color="#AAA" />
            </TouchableOpacity>
          </View>
          <View style={styles.proofBox}>
            <Ionicons name="image-outline" size={32} color="#CCC" />
            <TouchableOpacity style={styles.removeProof}>
              <Ionicons name="close-circle" size={20} color="#AAA" />
            </TouchableOpacity>
          </View>
          <View style={styles.proofBox}>
            <Ionicons name="image-outline" size={32} color="#CCC" />
            <TouchableOpacity style={styles.removeProof}>
              <Ionicons name="close-circle" size={20} color="#AAA" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.proofBox, styles.addProof]}>
            <Ionicons name="add" size={32} color="#607D8B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Soumettre</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#FF5252',
    borderRadius: 15,
    padding: 15,
    backgroundColor: 'white',
  },
  textArea: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  proofsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    backgroundColor: '#D1D9D9',
    padding: 15,
    borderRadius: 15,
  },
  proofBox: {
    width: 70,
    height: 70,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  addProof: {
    borderWidth: 1,
    borderColor: '#607D8B',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  removeProof: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  submitButton: {
    backgroundColor: '#7ED38F',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 50,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
