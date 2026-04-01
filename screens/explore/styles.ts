import { StyleSheet } from "react-native";

// ── Settings screen color tokens ───────────────────────────────────────────────
export const C = {
  bg:             "#080314",
  cardBg:         "#0f0825",
  headerBg:       "#0d0520",
  gold:           "#c8922a",
  goldBright:     "#e8c060",
  text:           "#f0e0b0",
  textMuted:      "rgba(200,170,120,0.65)",
  textFaint:      "rgba(200,170,120,0.35)",
  border:         "rgba(200,146,42,0.2)",
  borderFaint:    "rgba(200,146,42,0.12)",
  borderFaintest: "rgba(200,146,42,0.08)",
  purple:         "rgba(120,80,200,0.15)",
  purpleBorder:   "rgba(140,100,220,0.3)",
  purpleText:     "#b090e8",
  danger:         "#e05050",
  dangerBg:       "rgba(180,40,40,0.12)",
  dangerBorder:   "rgba(180,40,40,0.2)",
} as const;

// ── Styles ────────────────────────────────────────────────────────────────────

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.headerBg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.headerBg,
  },
  headerSide: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 3,
    textAlign: "center",
    textTransform: "uppercase",
  },
  headerDivider: {
    height: 0.5,
    backgroundColor: C.border,
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${C.gold}14`,
    borderWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  sectionLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: `${C.gold}66`,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 10,
    paddingLeft: 2,
  },

  card: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: `${C.gold}26`,
    overflow: "hidden",
  },

  rowPressed: { backgroundColor: `${C.gold}0f` },

  // ── Profile card ──
  profileCard: {
    backgroundColor: C.cardBg,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 12,
  },

  // Avatar
  avatarWrap: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarSpinRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: `${C.gold}55`,
    borderStyle: "dashed",
  },
  avatarRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 0,
    borderColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  avatarCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "transparent",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: C.goldBright,
  },
  avatarZodiacImage: {
    width: 90,
    height: 90,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1a0a35",
    borderWidth: 1.5,
    borderColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  // Name
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 1,
  },
  profileNameUnset: {
    color: C.textFaint,
    fontStyle: "italic",
    fontWeight: "400",
    fontSize: 17,
  },
  editIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${C.gold}1e`,
    borderWidth: 0.5,
    borderColor: `${C.gold}4d`,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sign badge
  signBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.purple,
    borderWidth: 0.5,
    borderColor: C.purpleBorder,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  signSymbolWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(140,100,220,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  signSymbol: {
    fontSize: 11,
    color: C.purpleText,
  },
  signName: {
    fontSize: 14,
    color: C.purpleText,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },

  // Date pill
  datePill: {
    backgroundColor: `${C.gold}14`,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  datePillUnset: {
    backgroundColor: `${C.gold}0a`,
    borderColor: `${C.gold}1a`,
  },
  datePillText: {
    fontSize: 14,
    color: `rgba(200,170,100,0.8)`,
    letterSpacing: 0.5,
  },
  datePillTextUnset: {
    fontSize: 14,
    color: C.textFaint,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },

  // Profile edit wrap
  profileEditWrap: {
    width: "100%",
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: C.borderFaint,
    paddingTop: 14,
  },

  // Profile divider
  profileDivider: {
    width: "100%",
    height: 0.5,
    backgroundColor: C.borderFaint,
    marginTop: 4,
  },

  // Birth time + place columns
  birthRow: {
    flexDirection: "row",
    width: "100%",
  },
  birthCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  birthColDivider: {
    width: 0.5,
    backgroundColor: C.borderFaint,
    alignSelf: "stretch",
  },
  birthLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    color: `${C.gold}80`,
    textTransform: "uppercase",
  },
  birthValue: {
    fontSize: 13,
    color: C.textFaint,
    fontStyle: "italic",
  },
  birthValueSet: {
    color: "rgba(200,170,120,0.9)",
    fontStyle: "italic",
  },

  // ── Language ──
  langToggle: {
    flexDirection: "row",
    padding: 6,
    gap: 4,
  },
  langOpt: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  langOptActive: {
    backgroundColor: `${C.gold}26`,
    borderWidth: 0.5,
    borderColor: `${C.gold}59`,
  },
  langOptText: {
    fontSize: 13,
    letterSpacing: 1,
    color: C.textFaint,
    fontWeight: "500",
  },
  langOptTextActive: {
    color: C.goldBright,
    fontWeight: "700",
  },

  // ── List rows ──
  listRowBorderTop: {
    borderTopWidth: 0.5,
    borderTopColor: C.borderFaintest,
  },
  listRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    alignSelf: "stretch",
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText: { flex: 1, flexShrink: 1 },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 12,
    color: C.textFaint,
    fontStyle: "italic",
    letterSpacing: 0.2,
  },

  // ── Edit panels ──
  editPanel: { gap: 10 },
  editHint: {
    fontSize: 11,
    color: C.textFaint,
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: C.text,
  },
  dateRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  dateCell: { flex: 1 },
  yearCell: { flex: 1.6 },
  timeSep: {
    fontSize: 22,
    color: C.gold,
    fontWeight: "200",
  },
  editActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: "500",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.headerBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${C.gold}59`,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: 12,
    color: C.danger,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: C.border,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  modalRule: {
    height: 0.5,
    backgroundColor: C.borderFaint,
    marginBottom: 16,
  },
  modalScroll: { marginBottom: 20 },
  modalBody: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
  },
  modalCloseBtn: {
    backgroundColor: C.headerBg,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: `${C.gold}59`,
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 0.3,
  },

  // ── About modal content ──
  aboutContent: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  aboutStar: {
    fontSize: 26,
    color: C.gold,
    marginBottom: 2,
  },
  aboutApp: {
    fontSize: 22,
    fontWeight: "700",
    color: C.goldBright,
    letterSpacing: 6,
    marginTop: 2,
  },
  aboutTagline: {
    fontSize: 14,
    color: C.textMuted,
    letterSpacing: 0.3,
  },
  aboutRule: {
    width: 40,
    height: 0.5,
    backgroundColor: C.borderFaint,
    marginVertical: 6,
  },
  aboutSub: {
    fontSize: 12,
    color: `${C.gold}66`,
    letterSpacing: 0.3,
  },
  aboutLegalRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  aboutLegalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: `${C.gold}0f`,
    borderWidth: 0.5,
    borderColor: C.border,
    alignItems: "center",
  },
  aboutLegalBtnText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
