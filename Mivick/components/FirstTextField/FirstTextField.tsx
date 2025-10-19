import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleProp, TextStyle } from 'react-native';
import { styles } from '../FirstTextField/styleTextField';

interface Props extends TextInputProps {
  placeholder: string;
  style?: StyleProp<TextStyle>;
  maskTelefone?: boolean;
}

export function FirstTextField({
  placeholder,
  style,
  maskTelefone = false,
  value,
  onChangeText,
  ...props
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [textValue, setTextValue] = useState(value || '');

  const formatarTelefone = (text: string) => {
    const numeros = text.replace(/\D/g, '').slice(0, 11); // só números, até 11 dígitos
    let formatted = '';

    if (numeros.length > 0) formatted += `(${numeros.slice(0, 2)}`;
    if (numeros.length >= 3) formatted += `) ${numeros.slice(2, 7)}`;
    if (numeros.length >= 8) formatted += `-${numeros.slice(7, 11)}`;

    return formatted;
  };

  const handleChange = (text: string) => {
    if (maskTelefone) {
      // permite apagar corretamente e formata apenas o que existe
      const numeros = text.replace(/\D/g, '').slice(0, 11);
      const newText = formatarTelefone(numeros);
      setTextValue(newText);
      onChangeText && onChangeText(newText);
    } else {
      setTextValue(text);
      onChangeText && onChangeText(text);
    }
  };

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
      value={textValue}
      onChangeText={handleChange}
      keyboardType={maskTelefone ? 'numeric' : 'default'}
      {...props}
    />
  );
}
