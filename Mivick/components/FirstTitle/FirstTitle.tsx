import React from 'react';
import { Text, TextStyle } from 'react-native';
import { styles } from './styleTitle';

interface Props {
  text: string;
  fontSize?: number;
  style?: TextStyle;
}

export function FirstTitle({ text, fontSize, style }: Props) {
  return <Text style={[styles.title, { fontSize }, style]}>{text}</Text>;
}
