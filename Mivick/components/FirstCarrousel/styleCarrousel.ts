// styleCarrousel.ts
import { StyleSheet, Dimensions } from 'react-native';
const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  carouselContainer: {
    width: '100%',
    height: height * 0.75, // 45% da tela (ajuste conforme preferir)
    alignSelf: 'center',
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end', // empurra indicadores para a base
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'black',
    opacity: 0.35,
  },
  indicatorsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    // opcional: um leve blur/gradiente, aqui mantemos transparente
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginHorizontal: 6,
  },
});
