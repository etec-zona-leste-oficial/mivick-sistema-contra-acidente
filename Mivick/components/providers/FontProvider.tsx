import { useFonts } from 'expo-font';
import React, { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface FontProviderProps {
  children?: ReactNode;
}

export default function FontProvider({ children }: FontProviderProps) {
  const [fontsLoaded] = useFonts({
    SansBoldPro: require('../../assets/fonts/SourceSans3-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F85200" />
        <Text>Carregando fontes...</Text>
      </View>
    );
  }

  // Garante que strings soltas sejam encapsuladas em <Text>
  if (typeof children === 'string') {
    return <Text>{children}</Text>;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
}
