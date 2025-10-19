import React from 'react';
import { View, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from './styleperfilFoto';

interface ProfileFotoProps {
  imageUri?: string;
  showEditIcon?: boolean;
  onEditPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>; 
}

export function PerfilFoto({
  imageUri,
  showEditIcon = false,
  onEditPress,
  size = 100,
  style, 
}: ProfileFotoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Imagem do usuário */}
      <Image
        source={
          imageUri
            ? { uri: imageUri }
            : require('../../assets/images/logo.png')
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
