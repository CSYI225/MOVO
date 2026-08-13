import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, StatusBar, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fs } from '../Styles/global';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const { user, changerMotDePasseTemporaire, logout } = useAuth();

  const [ancienMdp, setAncienMdp] = useState(user?.tempPassword || '');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmNouveauMdp, setConfirmNouveauMdp] = useState('');
  const [showNouveauPwd, setShowNouveauPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangerMdp = async () => {
    if (!ancienMdp) {
      Alert.alert('Erreur', 'Veuillez renseigner votre mot de passe temporaire.');
      return;
    }
    if (!nouveauMdp || nouveauMdp.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (nouveauMdp !== confirmNouveauMdp) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const res = await changerMotDePasseTemporaire(ancienMdp, nouveauMdp);
    setLoading(false);

    if (!res.success) {
      Alert.alert('Erreur de validation', res.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFB" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header section */}
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>MOVO</Text>
            <Text style={styles.tagline}>Activation obligatoire de votre compte locataire</Text>
          </View>

          {/* Decorative dots */}
          <View style={styles.dotsRow}>
            {['#4CAF50', '#C9E84F', '#182C2A'].map((c, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: c }]} />
            ))}
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            <Text style={styles.formTitle}>🔐 Activation de votre compte</Text>
            <Text style={styles.formSubtitle}>
              Bienvenue sur MOVO ! Votre compte a été initialisé par votre bailleur. Veuillez remplacer le mot de passe temporaire ci-dessous par votre propre mot de passe sécurisé.
            </Text>

            {/* Temporary password banner */}
            <View style={styles.tempPassBox}>
              <Text style={styles.tempPassLabel}>Mot de passe temporaire fourni :</Text>
              <Text style={styles.tempPassValue}>{user?.tempPassword || ancienMdp || 'Non disponible'}</Text>
            </View>

            {/* Ancien mot de passe (éditable si nécessaire) */}
            <View style={styles.inputGroup}>
              <Text style={styles.sectionLabel}>Mot de passe temporaire</Text>
              <View style={styles.inputWrapper}>
                <Feather name="key" size={16} color="#7A8B89" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Ex: Movo-1234"
                  placeholderTextColor="#AABAB8"
                  value={ancienMdp}
                  onChangeText={setAncienMdp}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Nouveau mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.sectionLabel}>Nouveau mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={16} color="#7A8B89" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Minimum 6 caractères"
                  placeholderTextColor="#AABAB8"
                  value={nouveauMdp}
                  onChangeText={setNouveauMdp}
                  secureTextEntry={!showNouveauPwd}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNouveauPwd(!showNouveauPwd)} style={{ padding: 4 }}>
                  <Feather name={showNouveauPwd ? 'eye-off' : 'eye'} size={16} color="#7A8B89" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmation nouveau mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.sectionLabel}>Confirmer le nouveau mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={16} color="#7A8B89" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Répétez votre nouveau mot de passe"
                  placeholderTextColor="#AABAB8"
                  value={confirmNouveauMdp}
                  onChangeText={setConfirmNouveauMdp}
                  secureTextEntry={!showNouveauPwd}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={handleChangerMdp}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Activation en cours...' : 'Activer mon compte et accéder'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={styles.logoutRow}>
              <Text style={styles.logoutText}>Se déconnecter et annuler</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFBFB' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },

  logoSection: { alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: fs(32), fontWeight: '900', color: '#182C2A', letterSpacing: 2, marginBottom: 4 },
  tagline: { fontSize: fs(12), color: '#7A8B89', fontWeight: '500', textAlign: 'center' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 24,
    marginBottom: 20,
    shadowColor: '#182C2A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  formTitle: { fontSize: fs(20), fontWeight: '800', color: '#182C2A', marginBottom: 6 },
  formSubtitle: { fontSize: fs(13), color: '#7A8B89', fontWeight: '500', marginBottom: 20, lineHeight: 18 },

  tempPassBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  tempPassLabel: { fontSize: fs(11), color: '#15803D', fontWeight: '700', marginBottom: 4 },
  tempPassValue: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: fs(18), fontWeight: '800', color: '#182C2A', letterSpacing: 2 },

  sectionLabel: { fontSize: fs(11), fontWeight: '700', color: '#7A8B89', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  inputGroup: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFBFB', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { fontSize: fs(14), color: '#182C2A', fontWeight: '500' },

  primaryBtn: {
    backgroundColor: '#182C2A', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 10, marginBottom: 16,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: fs(14), fontWeight: '800' },

  logoutRow: { alignItems: 'center', paddingVertical: 6 },
  logoutText: { color: '#FF5252', fontSize: fs(12), fontWeight: '700' },
});
