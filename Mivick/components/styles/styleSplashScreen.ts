// screens/stylesSplash.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fundo preto como você usa
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },

  text: {
    color: '#FF4500',
    fontSize: 20,
    fontWeight: '600',
  },
});
