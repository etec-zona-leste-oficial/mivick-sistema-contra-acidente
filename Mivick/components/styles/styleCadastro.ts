import { StyleSheet , Dimensions} from 'react-native';

export const { width, height } = Dimensions.get("window");
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingHorizontal: width * 0.05, // 5% de cada lado
    paddingTop: height * 0.02,
  },
  textField: {
    marginTop: height * 0.02,
    backgroundColor: '#fff',
    height: height * 0.07, // 7% da altura da tela
    width: '100%',          // ocupa todo o espaço do padding horizontal
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#1A202C', // texto preto/cinza escuro
    
  },
  signupButton: {
    backgroundColor: '#F85200',
    marginTop: height * 0.03,
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
    color: '#fff',
    fontSize: height * 0.022, // tamanho da fonte proporcional
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  checkbox: {
    width: width * 0.06, // 6% da largura da tela
    height: width * 0.06,
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
    fontSize: height * 0.018,
    marginLeft: 8,
    flexShrink: 1, // para quebrar linha em telas pequenas
  },
  termsText: {
    color: '#6D96FF',
  },
});

