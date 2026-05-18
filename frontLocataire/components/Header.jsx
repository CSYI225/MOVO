import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const Header = ({ showSearch = true, title, onBack, onNotificationPress, onProfilePress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            {/* Replace with actual logo image if available */}
            <View style={styles.logoPlaceholder}>
               <Text style={styles.logoText}>movo</Text>
            </View>
          </View>
        )}
        
        {title && <Text style={styles.title}>{title}</Text>}

        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color="black" />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarContainer} onPress={onProfilePress}>
             <View style={styles.avatar}>
               <Text style={styles.avatarText}>CS</Text>
             </View>
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.gray} style={styles.searchIcon} />
          <TextInput
            placeholder="Recherche..."
            style={styles.searchInput}
            placeholderTextColor={Colors.gray}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoContainer: {
    width: 60,
    height: 40,
    justifyContent: 'center',
  },
  logoPlaceholder: {
    backgroundColor: '#003366',
    padding: 5,
    borderRadius: 5,
  },
  logoText: {
    color: '#FF9900',
    fontWeight: 'bold',
    fontSize: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 15,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 15,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  backButton: {
    padding: 5,
  }
});

export default Header;
