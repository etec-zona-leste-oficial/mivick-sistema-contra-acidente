import { StyleSheet , Dimensions, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FF4500', // headerOrange
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  spacer: {
    width: 24,
  },
});
