import React from 'react';
import { View, Image, TouchableOpacity, StyleProp, ViewStyle, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // caso queira abrir a galeria
import { styles } from './styleperfilFoto';

interface ProfileFotoProps {
  imageUri?: string;
  showEditIcon?: boolean;
  onEditPress?: () => void;
  onChangePhoto?: (uri: string) => void; // recebe a URI da nova imagem
  size?: number;
  style?: StyleProp<ViewStyle>; 
}

export function PerfilFoto({
  imageUri,
  showEditIcon = false,
  onEditPress,
  onChangePhoto,
  size = 100,
  style, 
}: ProfileFotoProps) {

  // Função para selecionar imagem da galeria
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        if (onChangePhoto) onChangePhoto(uri); 
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
    }
  };

  const handleEditPress = () => {
    if (onEditPress) onEditPress();
    handlePickImage();
  };

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

      {/* Ícone de edição */}
      {showEditIcon && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditPress}
          activeOpacity={0.7}
        >
          <FontAwesome name="camera" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
