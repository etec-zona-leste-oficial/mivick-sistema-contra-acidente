import { StyleSheet } from "react-native";

export const stylesModalTerms = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#1F1F1F",        // Fundo do modal
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: "#F85200",            // Borda (Laranja Mivick)
    maxHeight: "80%",
  },

  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#333",
    borderRadius: 22,
    padding: 4,
  },

  scrollArea: {
    marginTop: 40,
  },

  scrollContent: {
    paddingBottom: 40,
    paddingRight: 8,
  },

  termsParagraph: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 18,
    letterSpacing: 0.3,
    textAlign: "left",
  },
});
