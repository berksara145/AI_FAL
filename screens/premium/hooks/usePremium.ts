import { useState, useEffect, useCallback } from "react";
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from "react-native-purchases";
import { Alert, Platform } from "react-native";

const RC_API_KEY_IOS     = "test_nvTtTRzmtDbnpPLqLrKUCGTqhwp";
const RC_API_KEY_ANDROID = "test_nvTtTRzmtDbnpPLqLrKUCGTqhwp";

export type PlanId = "weekly" | "monthly";

export interface PremiumPlan {
  id: PlanId;
  pkg: PurchasesPackage | null;
  price: string;        // formatted price string from store (e.g. "₺284,99")
  popular: boolean;
  hasSavings: boolean;
}

interface UsePremiumReturn {
  plans: PremiumPlan[];
  isPremium: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  selectedPlan: PlanId;
  setSelectedPlan: (plan: PlanId) => void;
  purchase: () => Promise<void>;
  restore: () => Promise<void>;
}

const FALLBACK_PRICES: Record<PlanId, string> = {
  weekly:  "₺284.99",
  monthly: "₺799.99",
};

export function usePremium(): UsePremiumReturn {
  const [plans, setPlans] = useState<PremiumPlan[]>([
    { id: "weekly",  pkg: null, price: FALLBACK_PRICES.weekly,  popular: true,  hasSavings: false },
    { id: "monthly", pkg: null, price: FALLBACK_PRICES.monthly, popular: false, hasSavings: true  },
  ]);
  const [isPremium, setIsPremium]       = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("weekly");

  // ── Init RevenueCat + load offerings ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const apiKey = Platform.OS === "ios" ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
        Purchases.configure({ apiKey });

        const [customerInfo, offerings] = await Promise.all([
          Purchases.getCustomerInfo(),
          Purchases.getOfferings(),
        ]);

        updatePremiumStatus(customerInfo);

        const current = offerings.current;
        if (current) {
          setPlans((prev) =>
            prev.map((plan) => {
              // Match packages by identifier — set yours in RevenueCat dashboard
              const pkg =
                current.availablePackages.find(
                  (p) =>
                    p.identifier === `$rc_${plan.id}` ||
                    p.identifier.toLowerCase().includes(plan.id)
                ) ?? null;
              return {
                ...plan,
                pkg,
                price: pkg?.product.priceString ?? FALLBACK_PRICES[plan.id],
              };
            })
          );
        }
      } catch (e) {
        // Network/config error — UI still works with fallback prices
        console.warn("RevenueCat init error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updatePremiumStatus = (info: CustomerInfo) => {
    const active = info.activeSubscriptions;
    setIsPremium(active.length > 0);
  };

  // ── Purchase ─────────────────────────────────────────────────────────────────
  const purchase = useCallback(async () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan?.pkg) {
      Alert.alert("Not available", "This plan is currently unavailable. Please try again later.");
      return;
    }

    setIsPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
      updatePremiumStatus(customerInfo);
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase failed", e.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [plans, selectedPlan]);

  // ── Restore ──────────────────────────────────────────────────────────────────
  const restore = useCallback(async () => {
    setIsPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      updatePremiumStatus(customerInfo);
      const active = customerInfo.activeSubscriptions;
      if (active.length > 0) {
        Alert.alert("Restored", "Your subscription has been restored.");
      } else {
        Alert.alert("No purchases found", "We couldn't find any active subscriptions to restore.");
      }
    } catch (e: any) {
      Alert.alert("Restore failed", e.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  return { plans, isPremium, isLoading, isPurchasing, selectedPlan, setSelectedPlan, purchase, restore };
}
