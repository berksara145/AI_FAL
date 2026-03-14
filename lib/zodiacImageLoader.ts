export const ZODIAC_ASSETS = [
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
let _cachedLocalUris: string[] | null = null;

function getLegacyFileSystem() {
  try {
    return require("expo-file-system/legacy"); // ✅ SDK 50+
  } catch {
    return require("expo-file-system");        // fallback
  }
}

export async function getZodiacLocalUris(): Promise<string[]> {
  if (_cachedLocalUris?.length === 12 && _cachedLocalUris.every(Boolean)) return _cachedLocalUris;

  try {
    const { Asset } = require("expo-asset");
    const assets = ZODIAC_ASSETS.map((src: number) => Asset.fromModule(src));
    for (const a of assets) await a.downloadAsync();

    const uris = assets.map((a: any) => a.localUri ?? a.uri ?? "");
    const allOk = uris.length === 12 && uris.every(Boolean);
    if (allOk) _cachedLocalUris = uris;
    return uris;
  } catch (e) {
    console.warn("[zodiacImageLoader] getZodiacLocalUris failed:", e);
    return Array(12).fill("");
  }
}

export async function getZodiacImageDataUris(): Promise<string[]> {
  if (_cached?.length === 12 && _cached.every(Boolean)) return _cached;

  try {
    const { Asset } = require("expo-asset");
    const FileSystem = getLegacyFileSystem();
    const EncodingType = (FileSystem as any).EncodingType ?? { Base64: "base64" };

    const assets = ZODIAC_ASSETS.map((src: number) => Asset.fromModule(src));

    // ✅ IMPORTANT: actually download each asset so localUri exists in Expo Go
    for (const a of assets) {
      await a.downloadAsync();
    }

    const uris: string[] = [];

    for (let i = 0; i < assets.length; i++) {
      const a = assets[i];
      const uri: string | undefined = a.localUri ?? a.uri;

      if (!uri) {
        console.warn("[zodiacImageLoader] missing uri for", i + 1, a);
        uris.push("");
        continue;
      }

      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: EncodingType.Base64 || "base64",
        });

        uris.push(base64 ? `data:image/png;base64,${base64}` : "");
      } catch (err) {
        console.warn("[zodiacImageLoader] read failed for", i + 1, uri, err);
        uris.push("");
      }
    }

    const allOk = uris.length === 12 && uris.every(Boolean);
    if (allOk) _cached = uris;

    return uris;
  } catch (e) {
    console.warn("[zodiacImageLoader] getZodiacImageDataUris failed:", e);
    return Array(12).fill("");
  }
}
