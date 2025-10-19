import React, { ReactNode } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { styles } from './styleContactCard';

interface Props {
  children?: ReactNode;
  customStyle?: StyleProp<ViewStyle>; 
  style?: StyleProp<ViewStyle>;       
}

export function ContactCard({ children, customStyle, style }: Props) {
  return <View style={[styles.cardContainer, customStyle, style]}>{children}</View>;
}
