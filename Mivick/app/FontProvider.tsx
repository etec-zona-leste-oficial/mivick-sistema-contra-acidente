import React, { ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

interface Props {
  children: ReactNode; // <- aqui ajustamos
}

export function FontProvider({ children }: Props) {
  const [fontsLoaded] = useFonts({
    SansBoldPro: require('../assets/fonts/SourceSans3-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>; // agora deve aceitar corretamente
}
