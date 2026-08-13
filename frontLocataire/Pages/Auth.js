import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, StatusBar, Image,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { fs } from '../Styles/global';
import { useAuth } from '../context/AuthContext';

const InputField = ({ label, icon, placeholder, value, onChange, secure, showToggle, onToggle, keyboardType, autoCapitalize }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      {icon && <Feather name={icon} size={16} color="#7A8B89" style={styles.inputIcon} />}
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor="#AABAB8"
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure && !showToggle}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
      />
      {secure && (
        <TouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
          <Feather name={showToggle ? 'eye-off' : 'eye'} size={16} color="#7A8B89" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function Auth() {
  const { login, register } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Register fields
  const [regNom, setRegNom] = useState('');
  const [regPrenom, setRegPrenom] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);

  // Forgot fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Erreur', 'Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    if (!res.success) {
      Alert.alert('Échec de la connexion', res.error);
    }
  };

  const handleRegister = async () => {
    if (!regNom || !regPrenom || !regEmail || !regPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (regPassword !== regConfirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const res = await register(regPrenom, regNom, regEmail, regPassword);
    setLoading(false);
    if (!res.success) {
      Alert.alert("Échec de l'inscription", res.error);
    }
  };

  const handleForgot = () => setForgotSent(true);

  const renderLogin = () => (
    <>
      <Text style={styles.formTitle}>Espace Locataire</Text>
      <Text style={styles.formSubtitle}>Accédez à votre dossier locatif</Text>
      
      <InputField
        label="Adresse e-mail" icon="mail" placeholder="exemple@email.com"
        value={loginEmail} onChange={setLoginEmail}
        keyboardType="email-address"
      />
      <InputField
        label="Mot de passe" icon="lock" placeholder="Votre mot de passe"
        value={loginPassword} onChange={setLoginPassword}
        secure showToggle={showLoginPwd} onToggle={() => setShowLoginPwd(!showLoginPwd)}
      />
      <TouchableOpacity onPress={() => { setView('forgot'); setForgotSent(false); }} style={styles.forgotLink}>
        <Text style={styles.forgotLinkText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>Se connecter</Text>
      </TouchableOpacity>
      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Pas encore inscrit ? </Text>
        <TouchableOpacity onPress={() => setView('register')}>
          <Text style={styles.switchLink}>Créer mon dossier</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderRegister = () => (
    <>
      <Text style={styles.formTitle}>Créer un dossier</Text>
      <Text style={styles.formSubtitle}>Rejoignez la communauté Movo</Text>
      
      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.sectionLabel}>Nom</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Dupont" placeholderTextColor="#AABAB8" value={regNom} onChangeText={setRegNom} />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.sectionLabel}>Prénom</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Jean" placeholderTextColor="#AABAB8" value={regPrenom} onChangeText={setRegPrenom} />
          </View>
        </View>
      </View>
      <InputField
        label="Adresse e-mail" icon="mail" placeholder="exemple@email.com"
        value={regEmail} onChange={setRegEmail} keyboardType="email-address"
      />
      <InputField
        label="Mot de passe" icon="lock" placeholder="Minimum 8 caractères"
        value={regPassword} onChange={setRegPassword}
        secure showToggle={showRegPwd} onToggle={() => setShowRegPwd(!showRegPwd)}
      />
      <InputField
        label="Confirmer le mot de passe" icon="lock" placeholder="Répétez votre mot de passe"
        value={regConfirm} onChange={setRegConfirm} secure showToggle={false} onToggle={() => {}}
      />
      <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>Créer mon compte</Text>
      </TouchableOpacity>
      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Déjà un compte ? </Text>
        <TouchableOpacity onPress={() => setView('login')}>
          <Text style={styles.switchLink}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderForgot = () => (
    <>
      <TouchableOpacity onPress={() => setView('login')} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color="#182C2A" />
        <Text style={styles.backBtnText}>Retour à la connexion</Text>
      </TouchableOpacity>
      <Text style={styles.formTitle}>Mot de passe oublié</Text>
      <Text style={styles.formSubtitle}>Un lien de réinitialisation vous sera envoyé par e-mail</Text>
      {forgotSent ? (
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-circle" size={52} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Lien envoyé !</Text>
          <Text style={styles.successSubtitle}>
            Vérifiez votre boîte mail à l'adresse{'\n'}
            <Text style={{ fontWeight: '800', color: '#182C2A' }}>{forgotEmail || 'votre adresse e-mail'}</Text>
          </Text>
          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={() => setView('login')}>
            <Text style={styles.primaryBtnText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <InputField
            label="Adresse e-mail" icon="mail" placeholder="exemple@email.com"
            value={forgotEmail} onChange={setForgotEmail} keyboardType="email-address"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleForgot} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Envoyer le lien</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>MOVO</Text>
            <Text style={styles.tagline}>Plateforme d'évaluation & réputation locative</Text>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: view === 'login' ? '#182C2A' : '#E2E8F0' }]} />
            <View style={[styles.dot, { backgroundColor: view === 'register' ? '#182C2A' : '#E2E8F0' }]} />
            <View style={[styles.dot, { backgroundColor: view === 'forgot' ? '#182C2A' : '#E2E8F0' }]} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {view === 'login' && renderLogin()}
            {view === 'register' && renderRegister()}
            {view === 'forgot' && renderForgot()}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFBFB' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  logoSection: { alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: fs(32), fontWeight: '900', color: '#182C2A', letterSpacing: 2, marginBottom: 4 },
  tagline: { fontSize: fs(12), color: '#7A8B89', fontWeight: '500', textAlign: 'center' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
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

  formTitle: { fontSize: fs(22), fontWeight: '800', color: '#182C2A', marginBottom: 4 },
  formSubtitle: { fontSize: fs(13), color: '#7A8B89', fontWeight: '500', marginBottom: 24, lineHeight: 18 },

  sectionLabel: { fontSize: fs(11), fontWeight: '700', color: '#7A8B89', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  inputGroup: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFBFB', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { fontSize: fs(14), color: '#182C2A', fontWeight: '500' },
  rowInputs: { flexDirection: 'row' },

  forgotLink: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotLinkText: { fontSize: fs(13), color: '#4CAF50', fontWeight: '700' },

  primaryBtn: {
    backgroundColor: '#182C2A', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: fs(15), fontWeight: '800' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText: { fontSize: fs(13), color: '#7A8B89', fontWeight: '500' },
  switchLink: { fontSize: fs(13), color: '#4CAF50', fontWeight: '700' },

  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtnText: { fontSize: fs(13), fontWeight: '700', color: '#182C2A', marginLeft: 8 },

  successCard: { alignItems: 'center', paddingVertical: 16 },
  successIconCircle: { marginBottom: 16 },
  successTitle: { fontSize: fs(20), fontWeight: '800', color: '#182C2A', marginBottom: 8 },
  successSubtitle: { fontSize: fs(13), color: '#7A8B89', textAlign: 'center', lineHeight: 20 },
});
