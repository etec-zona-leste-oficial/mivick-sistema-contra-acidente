import { StyleSheet, Dimensions, PixelRatio } from "react-native";

const { width } = Dimensions.get("window");

const scaleFont = (size: number) => {
  const scale = width / 375;
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

export const styles = StyleSheet.create({
  subTitle: {
    fontSize: scaleFont(16), // Responsivo (~16 base)
    color: "#FFFFFF",
    marginBottom: 7,
    fontFamily: "SansRegularPro", // Regular (não negrito)
  },
});
