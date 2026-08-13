import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, fs } from '../Styles/global';
import UserAvatar from './UserAvatar';

import { useAuth } from '../context/AuthContext';

const Header = ({ 
  showSearch = false, 
  title, 
  onBack, 
  onNotificationPress, 
  onProfilePress,
  searchValue,
  onSearchChange,
  placeholder = "Rechercher..."
}) => {
  const { user, hasPendingDemandes } = useAuth();
  const userInitials = `${(user?.prenom && user.prenom[0]) || ''}${(user?.nom && user.nom[0]) || ''}`.toUpperCase() 
    || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'MO');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Left Side: Back Button or Menu Icon */}
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#182C2A" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="menu-outline" size={26} color="#182C2A" />
          </TouchableOpacity>
        )}
        
        {/* Center: Movo Logo Image */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logoImage} 
          />
        </View>

        {/* Right Side: Navigation or Page Title */}
        {onBack ? (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title || ""}</Text>
          </View>
        ) : (
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={24} color="#182C2A" />
              {hasPendingDemandes && <View style={styles.badge} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarWrapper} onPress={onProfilePress} activeOpacity={0.7}>
              <UserAvatar initials={userInitials} size={32} color="#C9E84F" textColor="#182C2A" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modern Outlined Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#7A8B89" style={styles.searchIcon} />
          <TextInput
            placeholder={placeholder}
            style={styles.searchInput}
            placeholderTextColor="#7A8B89"
            value={searchValue}
            onChangeText={onSearchChange}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F4',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  logoImage: {
    width: 80,
    height: 26,
    resizeMode: 'contain',
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: fs(15),
    fontWeight: '700',
    color: '#182C2A',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 12,
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#84B889',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
  avatarWrapper: {
    marginLeft: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 48,
    marginTop: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: fs(14),
    color: '#182C2A',
  },
});

export default Header;
