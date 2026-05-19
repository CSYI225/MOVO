import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import Accueil from './Pages/Accueil';
import Contestation from './Pages/Contestation';
import Notifications from './Pages/Notifications';
import Profil from './Pages/Profil';
import DetailsAvis from './Pages/DetailsAvis';
import ProfilPublic from './Pages/ProfilPublic';
import Auth from './Pages/Auth';
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user?.isLoggedIn ? (
        <>
          <Stack.Screen name="Accueil" component={Accueil} />
          <Stack.Screen name="Contestation" component={Contestation} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Profil" component={Profil} />
          <Stack.Screen name="DetailsAvis" component={DetailsAvis} />
          <Stack.Screen name="ProfilPublic" component={ProfilPublic} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={Auth} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
