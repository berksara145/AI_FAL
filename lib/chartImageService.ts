/**
 * Chart Image Service
 * Handles generating and storing PNG from chart SVG (e.g. after view-shot capture).
 * SVG stays in DB; this module saves the image to cache and updates person.png_path for fast loading.
 */

import { saveTmpToCache } from "./svgCache";
import { updatePersonPngPath } from "../db/person.repo";

/**
 * Save a captured chart image (PNG file URI from view-shot) into the svg cache
 * and update the person's png_path in the DB so the image loads fast everywhere.
 */
export async function saveChartPngFromCapture(
  capturedFileUri: string,
  svgContent: string,
  personName: string
): Promise<string | null> {
  const pngPath = await saveTmpToCache(capturedFileUri, svgContent);
  if (pngPath && personName) {
    await updatePersonPngPath(personName, pngPath);
  }
  return pngPath;
}
