import { useState, useEffect } from "react";
import { getPersonsWithChartData, getSelfPerson, type Person } from "../../../db/person.repo";
import { useTranslation } from "react-i18next";

const FEATURE_NATAL_CHART_ANALYSIS = "Natal Chart Analysis";
const FEATURE_SOMEONE_SPECIAL = "Someone Special";
const FEATURE_FRIEND_DYNAMICS = "Friend Dynamics";

export type NoChartsReason = "noSelfChart" | "noOtherChart" | null;

export type ChatPersonsState = {
  chartPersons: Person[];
  selfPerson: Person | null;
  noCharts: boolean;
  noChartsReason: NoChartsReason;
  effectiveInitialMessage: string | undefined;
  loading: boolean;
};

/**
 * Loads the persons needed for chart-based chat features.
 * Replaces direct DB imports in ChatSessionScreen.
 */
export function useChatPersons(
  feature: string | undefined,
  initialMessage: string | undefined
): ChatPersonsState {
  const { t } = useTranslation();
  const [state, setState] = useState<ChatPersonsState>({
    chartPersons: [],
    selfPerson: null,
    noCharts: false,
    noChartsReason: null,
    effectiveInitialMessage: initialMessage,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (
        feature !== FEATURE_NATAL_CHART_ANALYSIS &&
        feature !== FEATURE_SOMEONE_SPECIAL &&
        feature !== FEATURE_FRIEND_DYNAMICS
      ) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      if (feature === FEATURE_NATAL_CHART_ANALYSIS) {
        const personsWithCharts = await getPersonsWithChartData();
        if (!mounted) return;
        if (personsWithCharts.length === 0) {
          const self = await getSelfPerson();
          if (!mounted) return;
          setState({
            chartPersons: [],
            selfPerson: self ?? null,
            noCharts: true,
            noChartsReason: !self?.chart_gpt_json ? "noSelfChart" : "noOtherChart",
            effectiveInitialMessage: t("chat.noBirthCharts"),
            loading: false,
          });
        } else {
          setState({
            chartPersons: personsWithCharts,
            selfPerson: null,
            noCharts: false,
            noChartsReason: null,
            effectiveInitialMessage: t("chat.selectBirthChart"),
            loading: false,
          });
        }
        return;
      }

      // SOMEONE_SPECIAL or FRIEND_DYNAMICS — need self + others
      const self = await getSelfPerson();
      if (!mounted) return;
      if (!self?.chart_gpt_json) {
        setState({
          chartPersons: [],
          selfPerson: self ?? null,
          noCharts: true,
          noChartsReason: "noSelfChart",
          effectiveInitialMessage: t("chat.noSelfChart"),
          loading: false,
        });
        return;
      }
      const personsWithCharts = await getPersonsWithChartData();
      if (!mounted) return;
      const others = personsWithCharts.filter(
        (p) => p.name?.toLowerCase() !== (self.name ?? "").toLowerCase()
      );
      if (others.length === 0) {
        setState({
          chartPersons: [],
          selfPerson: self,
          noCharts: true,
          noChartsReason: "noOtherChart",
          effectiveInitialMessage:
            feature === FEATURE_SOMEONE_SPECIAL
              ? t("chat.noPartnerChart")
              : t("chat.noFriendChart"),
          loading: false,
        });
      } else {
        setState({
          chartPersons: others,
          selfPerson: self,
          noCharts: false,
          noChartsReason: null,
          effectiveInitialMessage:
            feature === FEATURE_SOMEONE_SPECIAL
              ? t("chat.whosOnYourMind")
              : t("chat.whosYourFriend"),
          loading: false,
        });
      }
    };

    load();
    return () => { mounted = false; };
  }, [feature]);

  return state;
}
