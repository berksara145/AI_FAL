/**
 * Load zodiac sign images from assets and return as data URIs
 * so they render inside SVG (SvgXml) and in captured PNG.
 * Order: Aries..Pisces = zodiacSign1..12.
 */

const ZODIAC_ASSETS = [
  require("../assets/zodiacs/zodiacSign1.png"),
  require("../assets/zodiacs/zodiacSign2.png"),
  require("../assets/zodiacs/zodiacSign3.png"),
  require("../assets/zodiacs/zodiacSign4.png"),
  require("../assets/zodiacs/zodiacSign5.png"),
  require("../assets/zodiacs/zodiacSign6.png"),
  require("../assets/zodiacs/zodiacSign7.png"),
  require("../assets/zodiacs/zodiacSign8.png"),
  require("../assets/zodiacs/zodiacSign9.png"),
  require("../assets/zodiacs/zodiacSign10.png"),
  require("../assets/zodiacs/zodiacSign11.png"),
  require("../assets/zodiacs/zodiacSign12.png"),
];

let _cached: string[] | null = null;

export async function getZodiacImageDataUris(): Promise<string[]> {
  if (_cached && _cached.length === 12 && _cached.every((u) => u.length > 0)) return _cached;

  try {
    const { Asset } = require("expo-asset");
    const FileSystem = require("expo-file-system/legacy") || require("expo-file-system");
    const EncodingType = (FileSystem as any).EncodingType ?? { Base64: "base64" };

    const assets = ZODIAC_ASSETS.map((src: number) => Asset.fromModule(src));
    await Asset.loadAsync(assets);

    const uris: string[] = [];
    for (let i = 0; i < assets.length; i++) {
      const a = assets[i];
      const localUri = a.localUri ?? a.uri;
      if (!localUri || typeof localUri !== "string") {
        if (typeof __DEV__ !== "undefined" && __DEV__) console.warn("[zodiacImageLoader] No localUri for asset", i + 1);
        uris.push("");
        continue;
      }
      try {
        let base64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: EncodingType.Base64 || "base64",
        });
        if (!base64 && localUri.startsWith("file://")) {
          const pathWithoutScheme = localUri.replace(/^file:\/\//, "");
          base64 = await FileSystem.readAsStringAsync(pathWithoutScheme, {
            encoding: EncodingType.Base64 || "base64",
          });
        }
        uris.push(base64 && base64.length > 0 ? `data:image/png;base64,${base64}` : "");
      } catch (err) {
        if (typeof __DEV__ !== "undefined" && __DEV__) console.warn("[zodiacImageLoader] read failed for", i + 1, err);
        uris.push("");
      }
    }
    const allOk = uris.length === 12 && uris.every((u) => u.length > 0);
    if (allOk) _cached = uris;
    else if (typeof __DEV__ !== "undefined" && __DEV__) console.warn("[zodiacImageLoader] Only", uris.filter((u) => u.length > 0).length, "/ 12 images loaded");
    return uris;
  } catch (e) {
    console.warn("[zodiacImageLoader] getZodiacImageDataUris failed:", e);
    return Array(12).fill("");
  }
}
