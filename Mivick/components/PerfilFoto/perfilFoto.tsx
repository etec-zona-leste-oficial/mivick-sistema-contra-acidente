import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from './styleperfilFoto'

interface ProfileFotoProps {
  imageUri?: string; 
  showEditIcon?: boolean; 
  onEditPress?: () => void; 
  size?: number; 
}

export function ProfilePhoto({
  imageUri,
  showEditIcon = false,
  onEditPress,
  size = 100,
}: ProfileFotoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
        
      {/* Imagem do usuário */}
      <Image
        source={
          imageUri
            ? { uri: imageUri }
            : require('../../assets/default-profile.png') // 🔸 imagem padrão
        }
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />

      
      {showEditIcon && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          activeOpacity={0.7}
        >
          <FontAwesome name="camera" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}