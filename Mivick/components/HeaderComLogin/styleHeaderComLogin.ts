// styleHeaderComLogin.ts
import { StyleSheet, Dimensions, Platform, StatusBar } from "react-native";
const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: height * 0.11,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    backgroundColor: "#FF4500",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
