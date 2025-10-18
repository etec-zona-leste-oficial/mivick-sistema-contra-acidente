import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlayContent: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  appNameContainer: {
    marginTop: 48,
    paddingHorizontal: 44,
    paddingVertical: 12,
    backgroundColor: '#2D2D2D',
    borderRadius: 20,
    opacity: 0.9,
  },
  appNameText: {
    color: '#F85200',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 32,
    backgroundColor: '#000000',
  },
  loginButton: {
    backgroundColor: '#F85200',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F85200',
  },
  signupButtonText: {
    color: '#F85200',
  },
});
