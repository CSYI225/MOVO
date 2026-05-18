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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Accueil" component={Accueil} />
          <Stack.Screen name="Contestation" component={Contestation} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Profil" component={Profil} />
          <Stack.Screen name="DetailsAvis" component={DetailsAvis} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
