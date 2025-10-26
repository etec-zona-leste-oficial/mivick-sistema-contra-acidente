// components/styleFirstModal.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#2B2B2B",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderColor: "#F85200",
    borderWidth: 1,
    alignSelf: "center",
    justifyContent: "flex-start",
    width: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  bodyText: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  
  },
  activityIndicator: {
    marginVertical: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: "#F85200",
    borderRadius: 5,
    marginHorizontal: 5,
  },

  devicesContainer: {
    marginTop: 10,
    width: "100%",
    minHeight: 180, 
    paddingTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  devicesPlaceholder: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
});
