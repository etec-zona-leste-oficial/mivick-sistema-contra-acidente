import React from 'react';
import { Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle, View } from 'react-native';
import { styles } from './styleButton';

interface Props {
  title: string | React.ReactNode;  // aceita string ou JSX
  onPress?: () => void;
  customStyle?: StyleProp<ViewStyle>;
  customTextStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export function FirstButton({ title, onPress, customStyle, customTextStyle, icon }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, customStyle]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {icon && icon}

        {/* Renderiza string dentro de <Text> ou JSX diretamente */}
        {title !== null && title !== undefined && (
          typeof title === 'string' ? (
            <Text style={[styles.text, customTextStyle]}>{title}</Text>
          ) : (
            title
          )
        )}
      </View>
    </TouchableOpacity>
  );
}
