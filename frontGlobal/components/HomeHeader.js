import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Platform, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, globalStyles } from '../Styles/global';

export const BigHeader = ({ opacity, onSearchChange }) => (
  <Animated.View style={[styles.bigHeaderContainer, { opacity }]}>
    <View style={styles.logoContainerCenter}>
      <View style={styles.logoBox}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={{ width: 120, height: 120, resizeMode: 'contain' }} 
        />
      </View>
    </View>

    <View style={styles.searchSection}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={COLORS.primaryText} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Recherche..."
          placeholderTextColor={COLORS.primaryText}
          onChangeText={onSearchChange}
        />
      </View>
      <TouchableOpacity style={styles.filterButton}>
        <Ionicons name="options" size={20} color={COLORS.primaryText} />
      </TouchableOpacity>
    </View>
  </Animated.View>
);

export const SmallHeader = ({ opacity, onSearchPress }) => (
  <Animated.View style={[styles.smallHeaderContainer, { opacity }]} pointerEvents="box-none">
    <View style={styles.smallHeaderContent}>
      <View style={styles.logoContainerSmall}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={{ width: 60, height: 30, resizeMode: 'contain' }} 
        />
      </View>
      <Text style={globalStyles.headerTitle}>Accueil</Text>
      <TouchableOpacity 
        style={styles.smallSearchButton}
        onPress={onSearchPress}
      >
        <Ionicons name="search" size={20} color={COLORS.primaryText} />
      </TouchableOpacity>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  // --- SMALL HEADER ---
  smallHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  smallHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
  },
  logoContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallSearchButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#D9B382',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- BIG HEADER ---
  bigHeaderContainer: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  logoContainerCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9C8A8', 
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: COLORS.primaryText,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#D9C8A8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
