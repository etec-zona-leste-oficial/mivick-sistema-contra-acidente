import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Logo } from '@/components/Logo';
import { styles } from './styleHeader';

export function Header() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {/* Espaço à esquerda */}
      <View style={styles.spacer} />

      {/* Logo central clicável */}
      <TouchableOpacity onPress={() => router.push('/Home')}>
        <Logo />
      </TouchableOpacity>

      {/* Espaço à direita */}
      <View style={styles.spacer} />
    </View>
  );
}
