import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleProp, TextStyle } from 'react-native';
import { styles } from '../FirstTextField/styleTextField';

interface Props extends TextInputProps {
  placeholder: string;
  style?: StyleProp<TextStyle>; 
}

export function FirstTextField({ placeholder, style, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#A0AEC0"
      style={[
        styles.input,
        style,
        { borderColor: isFocused ? '#F85200' : '#ccc', borderWidth: 2 },
      ]}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
}
