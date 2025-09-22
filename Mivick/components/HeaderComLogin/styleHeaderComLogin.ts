import { StyleSheet , Dimensions, Platform, StatusBar } from 'react-native';
const { width, height } = Dimensions.get("window");
export const styles = StyleSheet.create({
  header: {
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: height * 0.11,          // altura proporcional
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    backgroundColor: '#FF4500', // cor principal
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    width: 180,
    paddingVertical: 12,
    marginTop: 60,
    marginRight: 10,
    borderRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
  },
  menuText: {
    fontSize: height * 0.02,
    color: '#333',
  },
});
