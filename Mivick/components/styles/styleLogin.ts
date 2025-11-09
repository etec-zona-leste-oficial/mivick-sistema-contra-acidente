import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  content: {
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.08, // abaixa o grupo inteiro, mas sem exagero
  },

  textField: {
    width: '100%',
    height: height * 0.07,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: height * 0.012, // diminui espaçamento entre campos
    color: '#1A202C',
  },

  forgotPassword: {
    flexDirection: 'row',

  },
  forgotPasswordText: {
    color: '#6D96FF',
    fontSize: height * 0.02,
    textDecorationLine: 'underline',

  },

  loginButton: {
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
    paddingVertical: height * 0.019,
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginTop: height * 0.015,
    borderColor: '#F85200',
    borderWidth: 2,
    width: '100%',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: height * 0.022,
    marginLeft: 8,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.015, // reduz espaço entre botão Google e checkbox
  },
  checkbox: {
    width: width * 0.06,
    height: width * 0.06,
    borderWidth: 2,
    borderColor: '#6D96FF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6D96FF',
    borderColor: '#FFFFFF',
  },
  checkboxText: {
    color: '#FFFFFF',
    fontSize: height * 0.018,
    marginLeft: 8,
    flexShrink: 1,
  },
  termsText: {
    color: '#6D96FF',
    textDecorationLine: 'underline',
  },

  title: {
    marginBottom: height * 0.015, // controla o espaço entre título e primeiro TextField
  },
});
