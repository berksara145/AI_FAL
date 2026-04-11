import { StyleSheet, Dimensions } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const GOLD_DIM = "#7a6230";
const DEEP = "#060412";
const CREAM = "#F5EDD8";

export { GOLD, GOLD_LIGHT, GOLD_DIM, DEEP, CREAM, W, H };

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DEEP,
  },

  page: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 28,
    justifyContent: "space-between",
  },

  // ── Close ────────────────────────────────────────────
  closeBtn: {
    position: "absolute",
    top: 16,
    left: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
    backgroundColor: "rgba(6,4,18,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeBtnText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: "500",
  },

  // ── Header ───────────────────────────────────────────
  header: {
    alignItems: "center",
    paddingTop: 8,
  },

  crownContainer: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  crownRing: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.28)",
    backgroundColor: "rgba(6,4,18,0.55)",
  },
  crownIcon: {
    fontSize: 26,
    color: GOLD_LIGHT,
    zIndex: 1,
  },

  appName: {
    fontSize: 10,
    letterSpacing: 5.5,
    color: GOLD,
    marginBottom: 8,
    opacity: 0.7,
    fontWeight: "600",
  },

  headline: {
    fontSize: 22,
    fontWeight: "700",
    color: GOLD_LIGHT,
    textAlign: "center",
    lineHeight: 30,
    letterSpacing: 0.3,
    marginBottom: 6,
  },

  subheadline: {
    fontSize: 13.5,
    color: "rgba(245,237,216,0.42)",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Ornament ─────────────────────────────────────────
  ornament: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  ornLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,168,76,0.3)",
  },
  ornCenter: {
    color: GOLD,
    fontSize: 9,
    opacity: 0.6,
    letterSpacing: 4,
    marginHorizontal: 10,
  },

  // ── Features description ─────────────────────────────
  featuresDesc: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "rgba(8,5,28,0.45)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.12)",
    borderRadius: 14,
  },

  featuresDescText: {
    fontSize: 13.5,
    color: "rgba(245,237,216,0.58)",
    fontStyle: "italic",
    lineHeight: 21,
    textAlign: "center",
    letterSpacing: 0.15,
  },

  // ── Pricing ──────────────────────────────────────────
  pricingCards: {
    gap: 10,
    marginTop: 2,
  },

  planWrapperPopular: {
    paddingTop: 13,
  },
  planWrapper: {
    paddingTop: 0,
  },

  planCard: {
    position: "relative",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.16)",
    backgroundColor: "rgba(8,5,28,0.65)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planCardSelected: {
    borderColor: "rgba(201,168,76,0.65)",
    backgroundColor: "rgba(12,6,36,0.8)",
  },
  planCardPopular: {
    borderColor: "rgba(201,168,76,0.28)",
  },

  popularBadgeWrap: {
    position: "absolute",
    top: -11,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  popularBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
  },
  popularBadgeText: {
    color: DEEP,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  planLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioRingSelected: {
    borderColor: GOLD,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  planLabel: {
    fontSize: 13,
    color: CREAM,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  planSublabel: {
    fontSize: 11,
    color: "rgba(245,237,216,0.36)",
    fontStyle: "italic",
    marginTop: 1,
  },

  planRight: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 16,
    color: GOLD_LIGHT,
    fontWeight: "600",
  },
  planPeriod: {
    fontSize: 10,
    color: "rgba(245,237,216,0.34)",
    marginTop: 1,
  },
  savingsBadge: {
    backgroundColor: "rgba(80,30,160,0.3)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
    borderWidth: 1,
    borderColor: "rgba(155,126,200,0.2)",
  },
  savingsText: {
    color: "#b899e8",
    fontSize: 9,
    fontWeight: "600",
  },

  // ── CTA ──────────────────────────────────────────────
  ctaBtn: {
    width: "100%",
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  ctaBtnContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ctaShimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: "rgba(255,255,255,0.22)",
    transform: [{ skewX: "-20deg" }],
  },
  ctaText: {
    color: DEEP,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    zIndex: 1,
  },

  // ── Trial banner ─────────────────────────────────────
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(201,168,76,0.08)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.35)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trialBannerEmoji: {
    fontSize: 26,
  },
  trialBannerText: {
    flex: 1,
  },
  trialBannerTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: GOLD_LIGHT,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  trialBannerSub: {
    fontSize: 11.5,
    color: "rgba(245,237,216,0.5)",
    lineHeight: 17,
  },

  trialNote: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(201,168,76,0.75)",
    fontStyle: "italic",
    marginTop: 8,
    letterSpacing: 0.2,
  },

  reassuranceRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 7,
    flexWrap: "wrap",
  },
  reassuranceItem: {
    fontSize: 10.5,
    color: "rgba(245,237,216,0.38)",
    letterSpacing: 0.1,
  },

  // ── Footer ───────────────────────────────────────────
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 22,
  },
  footerLink: {
    fontSize: 10,
    color: "rgba(245,237,216,0.2)",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
});
