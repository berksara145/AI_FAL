import { useState } from "react";
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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [birthTime, setBirthTime] = useState({ hour: 12, minute: 0 });
  const [birthLocation, setBirthLocation] = useState<BirthLocation | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTimeConfirm = async () => {
    setShowTimePicker(false);
    const timeString = `${birthTime.hour.toString().padStart(2, "0")}:${birthTime.minute.toString().padStart(2, "0")}`;

    try {
      await updateBirthTime(birthTime.hour, birthTime.minute, personName ?? undefined, true);
    } catch (error) {
      console.error("[useBirthMapFlow] Error saving birth time:", error);
    }

    await appendMessage("user", timeString);
    await appendMessage(
      "assistant",
      `Thank you! You were born at ${timeString}. Now, please enter the location where you were born.`,
      true
    );
  };

  const handleTimeUnknown = async () => {
    setShowTimePicker(false);

    try {
      await updateBirthTime(12, 0, personName ?? undefined, false);
    } catch (error) {
      console.error("[useBirthMapFlow] Error saving unknown birth time:", error);
    }

    await appendMessage("user", "I don't know my birth time");
    await appendMessage(
      "assistant",
      "No problem! We'll use a noon chart — you'll still get accurate planetary positions and aspects. Now, please enter the location where you were born.",
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
      await appendMessage(
        "assistant",
        "Please tell me the person's name and birth date first, or open Birth Map from a person's profile."
      );
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
      await appendMessage(
        "assistant",
        "I encountered an error generating your natal chart. Please ensure all information (birth date, time, and location) is complete."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStreamingComplete = (messageId: string, content: string) => {
    const lower = content.toLowerCase();
    if (lower.includes("what time were you born") || (lower.includes("what time was ") && lower.includes(" born"))) {
      setTimeout(() => setShowTimePicker(true), 800);
    }
    if (lower.includes("location where you were born") || (lower.includes("location where") && lower.includes("born"))) {
      setTimeout(() => setShowLocationSearch(true), 2000);
    }
  };

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
  };
}
