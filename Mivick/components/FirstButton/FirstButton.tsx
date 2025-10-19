// components/FirstButton.tsx
import React from 'react';
import { Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { styles } from './styleButton';

interface Props {
  title: string;
  onPress?: () => void;
  customStyle?: StyleProp<ViewStyle>;
  customTextStyle?: StyleProp<TextStyle>;
}

export function FirstButton({ title, onPress, customStyle, customTextStyle }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, customStyle]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, customTextStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}
