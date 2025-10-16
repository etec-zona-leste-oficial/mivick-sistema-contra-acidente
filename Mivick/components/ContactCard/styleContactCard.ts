// styleContactCard.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#2D2D2D',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    width: 212,
    height: 255,

    // layout interno
    justifyContent: 'space-between',
    alignItems: 'flex-start',

    // centralização dentro do ScrollView
    alignSelf: 'center',

    // sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
