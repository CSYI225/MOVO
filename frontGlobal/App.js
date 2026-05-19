import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, TextInput } from 'react-native';

// Force absolute layout consistency across iOS and Android by disabling OS font scaling
if (Text.defaultProps == null) {
  Text.defaultProps = {};
}
Text.defaultProps.allowFontScaling = false;

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
}
TextInput.defaultProps.allowFontScaling = false;

import { AuthProvider, useAuth } from './context/AuthContext';

import Auth from './Pages/Auth';
import Accueil from './Pages/Accueil';
import DetailsProfil from './Pages/DetailsProfil';
import DetailsAvis from './Pages/DetailsAvis';
import Abonnement from './Pages/Abonnement';
import Parametres from './Pages/Parametres';
import Profil from './Pages/Profil';
import ListeLocataires from './Pages/ListeLocataires';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user?.isLoggedIn ? (
        // ── AUTH FLOW ─────────────────────────────────────────
        <Stack.Screen name="Auth" component={Auth} />
      ) : (
        // ── MAIN APP ──────────────────────────────────────────
        <>
          <Stack.Screen name="Accueil" component={Accueil} />
          <Stack.Screen name="DetailsProfil" component={DetailsProfil} />
          <Stack.Screen name="DetailsAvis" component={DetailsAvis} />
          <Stack.Screen name="Abonnement" component={Abonnement} />
          <Stack.Screen name="Parametres" component={Parametres} />
          <Stack.Screen name="Profil" component={Profil} />
          <Stack.Screen name="ListeLocataires" component={ListeLocataires} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
