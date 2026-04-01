import { StyleSheet } from "react-native";
import { Colors } from "../../utils/theme";

export const styles = StyleSheet.create({
  personButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  personButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(120,80,200,0.35)",
    backgroundColor: "#2d1f5e",
  },
  createChartButton: {
    backgroundColor: "#2d1f5e",
  },
  personButtonText: {
    color: Colors.goldPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  savePersonSection: {
    backgroundColor: Colors.bgMain,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGold,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  savePersonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.goldPrimary,
    marginBottom: 4,
  },
  savePersonSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.white,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginBottom: 12,
  },
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
});
