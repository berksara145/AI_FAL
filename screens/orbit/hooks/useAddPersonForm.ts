import { useState } from "react";
import { createPersonMinimal, MAX_PERSONS } from "../../../db/person.repo";
import { updateBirthTime, updateBirthLocation } from "../../../db/user.repo";
import { generateAndSaveNatalChart } from "../../../lib/natalChartService";
import { getZodiacImageDataUris } from "../../../lib/zodiacImageLoader";
import { ChartColors } from "../../../utils/theme";
import type { ChartStyleConfig, GeneratedChart } from "../../../types/natalChart";

type BirthLocation = { placeName: string; placeId: string; lat: number; lng: number };

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

export type BirthDateFormState = { year: number; month: number; day: number };

export function useAddPersonForm(
  onChartReady: (chart: GeneratedChart, name: string, month: number, day: number, year: number) => void
) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<BirthDateFormState>({
    year: new Date().getFullYear() - 25,
    month: 1,
    day: 1,
  });
  const [birthTime, setBirthTime] = useState({ hour: 12, minute: 0 });
  const [birthLocation, setBirthLocation] = useState<BirthLocation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = name.trim().length > 0 && birthLocation !== null;

  const handleGenerate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !birthLocation) return;

    setError(null);
    setIsGenerating(true);
    try {
      await createPersonMinimal({
        name: trimmedName,
        birth_year: birthDate.year,
        birth_month: birthDate.month,
        birth_day: birthDate.day,
      });
      await updateBirthTime(birthTime.hour, birthTime.minute, trimmedName);
      await updateBirthLocation(
        {
          placeName: birthLocation.placeName,
          placeId: birthLocation.placeId,
          lat: birthLocation.lat,
          lng: birthLocation.lng,
        },
        trimmedName
      );

      const zodiacImageUrls = await getZodiacImageDataUris();
      const chart = await generateAndSaveNatalChart(
        { ...CHART_STYLE, zodiacImageUrls },
        undefined,
        trimmedName
      );
      onChartReady(chart, trimmedName, birthDate.month, birthDate.day, birthDate.year);
    } catch (e: any) {
      if (e?.message === "PERSON_LIMIT_REACHED") {
        setError(`You've reached the maximum of ${MAX_PERSONS} people.`);
      } else {
        setError("Something went wrong. Please check all fields and try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    name, setName,
    birthDate, setBirthDate,
    birthTime, setBirthTime,
    birthLocation, setBirthLocation,
    isGenerating, error, canGenerate,
    handleGenerate,
  };
}
