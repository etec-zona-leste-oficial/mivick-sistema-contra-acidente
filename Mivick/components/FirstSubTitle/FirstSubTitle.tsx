import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { styles as defaultStyles } from '../FirstSubTitle/styleSubTitle';

interface Props {
  text: string;

  style?: TextStyle;  // permite adicionar margin, padding, etc.
}

export function FirstSubTitle({ text, style }: Props) {
  return (
    <Text style={[defaultStyles.subTitle, style]}>
      {text}
    </Text>
  );
}
