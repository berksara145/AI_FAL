import { useState, useRef, useEffect } from "react";
import ViewShot, { captureRef as captureViewShot } from "react-native-view-shot";
import { saveChartPngFromCapture } from "../../../lib/chartImageService";
import type { NatalChartData } from "../../../types/natalChart";

type PendingCapture = {
  svgContent: string;
  personName: string;
  chartData: NatalChartData;
};

export function useChartCapture(onCaptureDone: () => void) {
  const captureRef = useRef<ViewShot>(null);
  const captureDoneRef = useRef(false);
  const [pendingCapture, setPendingCapture] = useState<PendingCapture | null>(null);

  useEffect(() => {
    if (!pendingCapture || captureDoneRef.current) return;

    const { svgContent, personName } = pendingCapture;
    let cancelled = false;

    const run = async () => {
      // Give images a frame to render before capturing
      await new Promise((r) => setTimeout(r, 300));

      let attempts = 0;
      while (!captureRef.current && attempts < 50 && !cancelled) {
        await new Promise((r) => setTimeout(r, 50));
        attempts++;
      }
      if (cancelled || !captureRef.current) return;

      try {
        const uri = await captureViewShot(captureRef.current, { format: "png", result: "tmpfile" });
        if (cancelled) return;
        await saveChartPngFromCapture(uri, svgContent, personName);
      } catch (e) {
        console.error("[useChartCapture] Capture/save error:", e);
      } finally {
        if (!cancelled) {
          captureDoneRef.current = true;
          setPendingCapture(null);
          onCaptureDone();
        }
      }
    };

    run();
    return () => { cancelled = true; };
  }, [pendingCapture]);

  const startCapture = (svgContent: string, personName: string, chartData: NatalChartData) => {
    captureDoneRef.current = false;
    setPendingCapture({ svgContent, personName, chartData });
  };

  return {
    captureViewRef: captureRef,
    pendingCapture,
    startCapture,
  };
}
