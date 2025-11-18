import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { styles } from './styleTitle';

interface Props extends TextProps {
  text: string;
  fontSize?: number;
  style?: TextStyle;
}

export function FirstTitle({ text, fontSize, style, ...rest }: Props) {
  return (
    <Text
      style={[styles.title, { fontSize }, style]}
      {...rest} // repassa numberOfLines, ellipsizeMode, etc.
    >
      {text}
    </Text>
  );
}
