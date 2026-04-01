import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { updateBirthLocation, updateBirthTime } from "../../../db/user.repo";
import { generateAndSaveNatalChart } from "../../../lib/natalChartService";
import { getZodiacImageDataUris } from "../../../lib/zodiacImageLoader";
import type { ChartStyleConfig, GeneratedChart } from "../../../types/natalChart";
import { ChartColors } from "../../../utils/theme";

type BirthLocation = {
  placeName: string;
  placeId: string;
  lat: number;
  lng: number;
};

type AppendMessage = (role: "user" | "assistant", content: string, streaming?: boolean) => Promise<any>;

const CHART_STYLE: ChartStyleConfig = {
  size: 1000,
  backgroundColor: ChartColors.background,
  starry: true,
  starCount: 400,
  primaryRingColor: ChartColors.primaryRing,
  secondaryRingColor: ChartColors.secondaryRing,
  accentColor: ChartColors.accent,
  zodiacTextColor: ChartColors.zodiacText,
  bodyIconSize: 28,
  useGradients: true,
  glowEffect: true,
};

export function useBirthMapFlow(
  personName: string | null,
  appendMessage: AppendMessage,
  onChartReady: (chart: GeneratedChart) => void,
  onDone: () => void
) {
  const { t } = useTranslation();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [birthTime, setBirthTime] = useState({ hour: 12, minute: 0 });
  const [birthLocation, setBirthLocation] = useState<BirthLocation | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  // Explicit flags instead of English keyword matching — works regardless of language
  const awaitingTimePickerRef = useRef(personName !== null);
  const awaitingLocationSearchRef = useRef(false);

  const handleTimeConfirm = async () => {
    setShowTimePicker(false);
    const timeString = `${birthTime.hour.toString().padStart(2, "0")}:${birthTime.minute.toString().padStart(2, "0")}`;

    if (personName) {
      try {
        await updateBirthTime(birthTime.hour, birthTime.minute, personName, true);
      } catch (error) {
        console.error("[useBirthMapFlow] Error saving birth time:", error);
      }
    }

    await appendMessage("user", timeString);
    awaitingLocationSearchRef.current = true;
    await appendMessage(
      "assistant",
      t("birthMap.timeConfirmed", { time: timeString, name: personName ?? "you" }),
      true
    );
  };

  const handleTimeUnknown = async () => {
    setShowTimePicker(false);

    if (personName) {
      try {
        await updateBirthTime(12, 0, personName, false);
      } catch (error) {
        console.error("[useBirthMapFlow] Error saving unknown birth time:", error);
      }
    }

    await appendMessage("user", t("birthMap.timeUnknownUser"));
    awaitingLocationSearchRef.current = true;
    await appendMessage(
      "assistant",
      t("birthMap.timeUnknown", { name: personName ?? "you" }),
      true
    );
  };

  const handleLocationConfirm = async () => {
    if (!birthLocation) return;
    setShowLocationSearch(false);

    try {
      await updateBirthLocation(
        {
          placeName: birthLocation.placeName,
          placeId: birthLocation.placeId,
          lat: birthLocation.lat,
          lng: birthLocation.lng,
        },
        personName ?? undefined
      );
    } catch (error) {
      console.error("[useBirthMapFlow] Error saving birth location:", error);
    }

    await appendMessage("user", birthLocation.placeName);
    await generateChart();
  };

  const generateChart = async () => {
    if (!personName) {
      await appendMessage("assistant", t("birthMap.locationMissingError"));
      return;
    }

    try {
      setIsGenerating(true);
      const zodiacImageUrls = await getZodiacImageDataUris();
      const chart = await generateAndSaveNatalChart(
        { ...CHART_STYLE, zodiacImageUrls },
        undefined,
        personName
      );
      onChartReady(chart);
    } catch (error) {
      console.error("[useBirthMapFlow] Chart generation error:", error);
      await appendMessage("assistant", t("birthMap.chartError"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStreamingComplete = (_messageId: string, _content: string) => {
    if (awaitingTimePickerRef.current) {
      awaitingTimePickerRef.current = false;
      setTimeout(() => setShowTimePicker(true), 800);
    }
    if (awaitingLocationSearchRef.current) {
      awaitingLocationSearchRef.current = false;
      setTimeout(() => setShowLocationSearch(true), 2000);
    }
  };

  const expectTimePicker = () => { awaitingTimePickerRef.current = true; };

  return {
    showTimePicker,
    showLocationSearch,
    birthTime,
    setBirthTime,
    birthLocation,
    setBirthLocation,
    isGenerating,
    handleTimeConfirm,
    handleTimeUnknown,
    handleLocationConfirm,
    handleStreamingComplete,
    expectTimePicker,
  };
}
