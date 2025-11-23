import { StyleSheet } from 'react-native';

import {Dimensions} from 'react-native'

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 12,

    shadowColor: '#F85200',
    shadowOffset: { width: 0, height: -30 }, 
    shadowOpacity: 0.4,
    shadowRadius: 60,
    elevation: 30, 
  },

  linearGrad: {
    width: '100%',
    height: height * 0.18, // ⬅ ajusta o tamanho do fade
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1, // fica atrás do conteúdo
  },
});


