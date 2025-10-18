import React from 'react';
import { Text } from 'react-native';
import { styles } from '../FirstTitle/styleTitle';

interface Props {
  text: string;
  fontSize?: number;
  style?: object;

}

export function FirstTitle({ text, fontSize, style }: Props) {
  return <Text style={[styles.title, { fontSize }, style]}>{text}</Text>;
}
