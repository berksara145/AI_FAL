import { useState, useRef, useCallback } from "react";
import { InteractionManager } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getPersonByName, updatePersonInterpretation } from "../../../db/person.repo";
import { generateChartInterpretation } from "../../../lib/chartInterpretationService";

const LOADING_PHRASES = [
  "Mapping planetary positions...",
  "Analyzing aspects and houses...",
  "Reading the celestial patterns...",
  "Consulting the cosmic blueprint...",
  "Decoding the birth map...",
  "Weaving your cosmic story...",
];

export function usePersonDetail(name: string) {
  const [loadingChart, setLoadingChart] = useState(true);
  const [pngUri, setPngUri] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [generatingInterpretation, setGeneratingInterpretation] = useState(false);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [birthTimeKnown, setBirthTimeKnown] = useState(true);

  const chartGptJsonRef = useRef<string | null>(null);
  const phraseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPhraseRotation = () => {
    let idx = 0;
    phraseIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_PHRASES.length;
      setLoadingPhrase(LOADING_PHRASES[idx]);
    }, 2500);
  };

  const stopPhraseRotation = () => {
    if (phraseIntervalRef.current) {
      clearInterval(phraseIntervalRef.current);
      phraseIntervalRef.current = null;
    }
  };

  const runGeneration = async (json: string, mounted: { value: boolean }) => {
    if (mounted.value) {
      setGeneratingInterpretation(true);
      setInterpretationError(null);
      setLoadingPhrase(LOADING_PHRASES[0]);
      startPhraseRotation();
    }
    try {
      const text = await generateChartInterpretation(json, name);
      if (mounted.value) {
        await updatePersonInterpretation(name, text);
        setInterpretation(text);
      }
    } catch {
      if (mounted.value) {
        setInterpretationError("Could not generate interpretation. Tap to retry.");
      }
    } finally {
      if (mounted.value) {
        setGeneratingInterpretation(false);
        stopPhraseRotation();
      }
    }
  };

  const retryGeneration = () => {
    const json = chartGptJsonRef.current;
    if (!json || generatingInterpretation) return;
    const mounted = { value: true };
    runGeneration(json, mounted);
  };

  useFocusEffect(
    useCallback(() => {
      const mounted = { value: true };
      setLoadingChart(true);

      InteractionManager.runAfterInteractions(() => {
        (async () => {
          try {
            if (!name) {
              if (mounted.value) { setPngUri(null); setLoadingChart(false); }
              return;
            }
            const person = await getPersonByName(name);
            if (!mounted.value) return;

            if (person) {
              setPngUri(person.png_path ?? null);
              setInterpretation(person.chart_interpretation ?? null);
              chartGptJsonRef.current = person.chart_gpt_json ?? null;
              setBirthTimeKnown(person.birth_time_known !== 0);
              setLoadingChart(false);

              // Auto-generate if chart exists but no interpretation yet
              if (person.chart_gpt_json && !person.chart_interpretation) {
                await runGeneration(person.chart_gpt_json, mounted);
              }
            } else {
              if (mounted.value) { setPngUri(null); setLoadingChart(false); }
            }
          } catch {
            if (mounted.value) { setPngUri(null); setLoadingChart(false); }
          }
        })();
      });

      return () => {
        mounted.value = false;
        stopPhraseRotation();
      };
    }, [name])
  );

  return {
    loadingChart,
    pngUri,
    interpretation,
    generatingInterpretation,
    interpretationError,
    loadingPhrase,
    hasChart: !!chartGptJsonRef.current,
    birthTimeKnown,
    retryGeneration,
  };
}
