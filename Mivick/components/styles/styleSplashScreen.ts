import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,

    // Glow central bem suave (profissional)
    shadowColor: "#FF5500",
    shadowOpacity: 0.18,
    shadowRadius: 55,
  },

  logo: {
    width: 200,
    height: 200,

    // Glow do logo mais luxuoso e suave
    shadowColor: "rgba(255, 85, 0, 0.55)",
    shadowOpacity: 1,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },

    marginBottom: 35,
  },

  text: {
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: 1.1,

    // Glow mais bonito e natural no texto
    textShadowColor: "rgba(255, 100, 20, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,

    // Deixar o texto mais elegante e distribuído
    maxWidth: "85%",
    textAlign: "center",

    // Sutil profundidade
    paddingHorizontal: 6,
  },
});
