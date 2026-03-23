import { StyleSheet, Dimensions } from "react-native";

const { width: W } = Dimensions.get("window");

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const GOLD_DIM = "#7a6230";
const DEEP = "#060412";
const CREAM = "#F5EDD8";

export { GOLD, GOLD_LIGHT, GOLD_DIM, DEEP, CREAM, W };

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DEEP,
  },

  // ── Scroll ──────────────────────────────────────────
  scrollContent: {
    paddingBottom: 52,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    alignItems: "center",
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 8,
    position: "relative",
  },

  closeBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
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

  crownContainer: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  crownRing: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.28)",
    backgroundColor: "rgba(6,4,18,0.55)",
  },
  crownIcon: {
    fontSize: 30,
    color: GOLD_LIGHT,
    zIndex: 1,
  },

  appName: {
    fontSize: 11,
    letterSpacing: 6,
    color: GOLD,
    marginBottom: 10,
    opacity: 0.72,
    fontWeight: "600",
  },

  headline: {
    fontSize: 26,
    fontWeight: "700",
    color: GOLD_LIGHT,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 13,
    letterSpacing: 0.4,
  },

  subheadline: {
    fontSize: 15,
    color: "rgba(245,237,216,0.48)",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
  },

  // ── Ornament ─────────────────────────────────────────
  ornament: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginVertical: 24,
  },
  ornLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,168,76,0.35)",
  },
  ornCenter: {
    color: GOLD,
    fontSize: 10,
    opacity: 0.65,
    letterSpacing: 4,
    marginHorizontal: 10,
  },

  // ── Features ─────────────────────────────────────────
  features: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 13,
    paddingHorizontal: 16,
    backgroundColor: "rgba(8,5,28,0.52)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.11)",
    borderRadius: 14,
  },

  featureIcon: {
    fontSize: 21,
    marginTop: 1,
    marginRight: 14,
  },

  featureText: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: GOLD_LIGHT,
    marginBottom: 3,
    letterSpacing: 0.4,
  },

  featureDesc: {
    fontSize: 13,
    color: "rgba(245,237,216,0.48)",
    lineHeight: 18,
  },

  // ── Testimonial ──────────────────────────────────────
  testimonial: {
    marginHorizontal: 20,
    marginBottom: 22,
    padding: 14,
    paddingHorizontal: 18,
    backgroundColor: "rgba(8,5,28,0.48)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.1)",
    borderRadius: 14,
    alignItems: "center",
  },

  starsRow: {
    color: GOLD,
    fontSize: 12,
    marginBottom: 7,
    letterSpacing: 4,
  },

  testimonialText: {
    fontSize: 13,
    fontStyle: "italic",
    color: "rgba(245,237,216,0.48)",
    lineHeight: 20,
    textAlign: "center",
  },

  testimonialAuthor: {
    fontSize: 10.5,
    color: GOLD_DIM,
    marginTop: 7,
    letterSpacing: 1.2,
  },

  // ── Pricing ──────────────────────────────────────────
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 22,
  },

  pricingLabel: {
    fontSize: 10,
    letterSpacing: 3.5,
    color: GOLD,
    textAlign: "center",
    marginBottom: 14,
    opacity: 0.62,
    fontWeight: "600",
  },

  pricingCards: {
    gap: 10,
  },

  planWrapper: {
    paddingTop: 0,
  },

  planWrapperPopular: {
    paddingTop: 12,
  },

  planCard: {
    position: "relative",
    paddingVertical: 15,
    paddingHorizontal: 17,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.16)",
    backgroundColor: "rgba(8,5,28,0.68)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  planCardSelected: {
    borderColor: "rgba(201,168,76,0.68)",
    backgroundColor: "rgba(12,6,36,0.82)",
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
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 20,
  },

  popularBadgeText: {
    color: DEEP,
    fontSize: 8.5,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  planLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  radioRing: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },

  radioRingSelected: {
    borderColor: GOLD,
  },

  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: GOLD,
  },

  planLabel: {
    fontSize: 12.5,
    color: CREAM,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: 0.3,
  },

  planSublabel: {
    fontSize: 11.5,
    color: "rgba(245,237,216,0.38)",
    fontStyle: "italic",
  },

  planRight: {
    alignItems: "flex-end",
  },

  planPrice: {
    fontSize: 16,
    color: GOLD_LIGHT,
    fontWeight: "600",
    lineHeight: 20,
  },

  planPeriod: {
    fontSize: 10.5,
    color: "rgba(245,237,216,0.36)",
    marginTop: 2,
  },

  savingsBadge: {
    backgroundColor: "rgba(80,30,160,0.32)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(155,126,200,0.2)",
  },

  savingsText: {
    color: "#b899e8",
    fontSize: 9.5,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── CTA ──────────────────────────────────────────────
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  ctaBtn: {
    width: "100%",
    height: 56,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 14,
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
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    zIndex: 1,
  },

  trialNote: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(245,237,216,0.32)",
    fontStyle: "italic",
  },

  // ── Footer ───────────────────────────────────────────
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 24,
    marginTop: 18,
  },

  footerLink: {
    fontSize: 10.5,
    color: "rgba(245,237,216,0.22)",
    letterSpacing: 0.6,
    fontWeight: "500",
  },
});
