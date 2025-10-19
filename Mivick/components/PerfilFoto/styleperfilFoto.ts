import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#F85200', 
  },
  editButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#F85200',
    borderRadius: 20,
    padding: 6,
  },
});
