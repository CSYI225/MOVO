import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../Styles/global';

export default function UserAvatar({ initials, size = 50, color = COLORS.cardBackground, textColor = COLORS.primaryText, photo = null }) {
  if (photo) {
    return (
      <Image 
        source={{ uri: photo }} 
        style={{ width: size, height: size, borderRadius: size / 2, resizeMode: 'cover' }} 
      />
    );
  }
  return (
    <View style={[
      styles.avatarContainer,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color }
    ]}>
      <Text style={[styles.initials, { color: textColor, fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: 'bold',
  },
});
