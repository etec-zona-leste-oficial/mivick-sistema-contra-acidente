import { StyleSheet, Dimensions, PixelRatio } from "react-native";

const { width } = Dimensions.get("window");

// Função para ajustar tamanho da fonte dinamicamente
const scaleFont = (size: number) => {
  const scale = width / 375; // 375 = base iPhone X
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

export const styles = StyleSheet.create({
  title: {
    fontSize: scaleFont(35), // Responsivo (~24 base)
    color: "#FFFFFF",
    fontFamily: "SansBoldPro", // Mantém negrito
    marginBottom: 6,
  },
});
