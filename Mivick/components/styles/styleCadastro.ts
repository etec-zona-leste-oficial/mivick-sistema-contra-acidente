import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.04, // pouco mais de espaçamento do topo
  },
  textField: {
    marginTop: height * 0.015, // reduzido para aproximar os campos
    backgroundColor: '#fff',
    height: height * 0.065, // ligeiramente menor
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#1A202C',
  },
  signupButton: {
    backgroundColor: '#F85200',
    marginTop: height * 0.03,
    marginBottom: height * 0.015,
    width: '100%',
    minHeight: height * 0.065, // altura mínima em vez de fixa
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.03, // adiciona respiro lateral
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.017, // reduzido
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginTop: height * 0.015, // reduzido
    borderColor: '#F85200',
    borderWidth: 2,
    width: '100%',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: height * 0.02, // reduzido
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.016, // reduzido
  },
  checkbox: {
    width: width * 0.055, // ligeiramente menor
    height: width * 0.055,
    borderWidth: 2,
    borderColor: '#6D96FF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6D96FF',
    borderColor: '#fff',
  },
  checkboxText: {
    color: '#fff',
    fontSize: height * 0.018, // ligeiramente menor
    marginLeft: 8,
    flexShrink: 1,
  },
  termsText: {
    color: '#6D96FF',
    textDecorationLine: 'underline',
  },
});
