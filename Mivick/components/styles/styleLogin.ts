import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.02,
    
  },
  
 textField: {
  width: '100%',
  height: height * 0.07,
  backgroundColor: '#FFFFFF',
  borderRadius: 8,
  paddingHorizontal: 12,
  marginVertical: height * 0.015, // mantém espaçamento entre os campos
  marginTop: height * 0.20,       // aumenta a distância do topo, “abaixando” os campos
  color: '#1A202C', // texto preto/cinza escuro
  

},
forgotPassword: {
  flexDirection: 'row',
  marginTop: height * 0.01,      // aumenta a distância do campo de senha para o link
},
forgotPasswordText: {
  color: '#6D96FF',
  fontSize: height * 0.02,
},

  loginButton: {
    backgroundColor: '#F85200',
    marginTop: height * 0.09,
    marginBottom: height * 0.02,
    width: '100%',
    height: height * 0.07,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginTop: height * 0.02,
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
    marginTop: height * 0.02,
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
  },
});
