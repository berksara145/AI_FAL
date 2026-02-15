let FileSystem: any = null;
try {
  // Prefer the legacy API to avoid deprecation/runtime errors in older SDKs
  FileSystem = require("expo-file-system/legacy");
  // eslint-disable-next-line no-console
  console.log("[svgCache] using expo-file-system/legacy");
} catch (e) {
  try {
    FileSystem = require("expo-file-system");
    // eslint-disable-next-line no-console
    console.log("[svgCache] using expo-file-system");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[svgCache] failed to load expo-file-system:", err);
    FileSystem = null;
  }
}

import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_DIR = ((FileSystem && (FileSystem as any).documentDirectory) || "") + "svg-cache/";
const INDEX_KEY = "svgIndex";
const MAX_ITEMS = 12;

async function ensureDir() {
  try {
    console.log("[svgCache] ensureDir - ensuring cache directory exists:", CACHE_DIR);
    if (!FileSystem || typeof FileSystem.getInfoAsync !== "function") {
      console.warn("[svgCache] ensureDir - FileSystem.getInfoAsync not available");
      return;
    }
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists) {
      console.log("[svgCache] ensureDir - directory does not exist, creating:", CACHE_DIR);
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (e) {
    console.error("[svgCache] ensureDir - error ensuring directory:", e);
    // ignore
  }
}

export async function hashSvg(svg: string): Promise<string> {
  try {
    const h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, svg);
    console.log("[svgCache] hashSvg - computed hash:", h.slice(0, 12));
    return h;
  } catch (e) {
    console.error("[svgCache] hashSvg - error hashing svg:", e);
    throw e;
  }
}

export function pngPathForHash(hash: string) {
  const p = CACHE_DIR + hash + ".png";
  // console.log("[svgCache] pngPathForHash:", p);
  return p;
}

export function svgPathForHash(hash: string) {
  const p = CACHE_DIR + hash + ".svg";
  // console.log("[svgCache] svgPathForHash:", p);
  return p;
}

export async function getCachedPngUriForSvg(svg: string): Promise<string | null> {
  try {
    const hash = await hashSvg(svg);
    console.log("[svgCache] getCachedPngUriForSvg - looking for hash:", hash.slice(0, 12));
    await ensureDir();
    const path = pngPathForHash(hash);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      console.log("[svgCache] getCachedPngUriForSvg - found cached png:", path);
      return path;
    }
    console.log("[svgCache] getCachedPngUriForSvg - no cached png for hash");
    return null;
  } catch (e) {
    console.error("[svgCache] getCachedPngUriForSvg - error:", e);
    return null;
  }
}

export async function getCachedPngUriForSvgPath(svgPath: string): Promise<string | null> {
  try {
    if (!svgPath) return null;
    await ensureDir();
    // Read svg content and hash
    const svg = await FileSystem.readAsStringAsync(svgPath);
    const hash = await hashSvg(svg);
    const path = pngPathForHash(hash);
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) return path;
    return null;
  } catch (e) {
    console.error("[svgCache] getCachedPngUriForSvgPath - error:", e);
    return null;
  }
}

export async function saveSvgString(hash: string, svg: string): Promise<void> {
  try {
    console.log("[svgCache] saveSvgString - saving svg for hash:", hash.slice(0, 12));
    await ensureDir();
    const path = svgPathForHash(hash);
    // writeAsStringAsync encoding option types vary between SDKs; omit for compatibility
    await FileSystem.writeAsStringAsync(path, svg);
    console.log("[svgCache] saveSvgString - written svg to:", path);
  } catch (e) {
    console.error("[svgCache] saveSvgString - error saving svg:", e);
    // ignore
  }
}

async function readIndex(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    console.error("[svgCache] readIndex - error reading index:", e);
    return [];
  }
}

async function writeIndex(index: string[]) {
  try {
    console.log("[svgCache] writeIndex - writing index length:", index.length);
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.error("[svgCache] writeIndex - error writing index:", e);
    // ignore
  }
}

async function addToIndex(hash: string) {
  const index = await readIndex();
  // Move to front if exists
  const filtered = index.filter((h) => h !== hash);
  filtered.unshift(hash);
  // enforce max
  while (filtered.length > MAX_ITEMS) {
    const removed = filtered.pop()!;
    // delete files for removed
    try {
      console.log("[svgCache] addToIndex - removing old cache for hash:", removed.slice(0, 12));
      const png = pngPathForHash(removed);
      const svg = svgPathForHash(removed);
      const pInfo = await FileSystem.getInfoAsync(png);
      if (pInfo.exists) {
        await FileSystem.deleteAsync(png, { idempotent: true });
        console.log("[svgCache] addToIndex - deleted png:", png);
      }
      const sInfo = await FileSystem.getInfoAsync(svg);
      if (sInfo.exists) {
        await FileSystem.deleteAsync(svg, { idempotent: true });
        console.log("[svgCache] addToIndex - deleted svg:", svg);
      }
      await AsyncStorage.removeItem(`svgmeta:${removed}`);
    } catch (e) {
      console.error("[svgCache] addToIndex - error cleaning removed item:", e);
      // ignore
    }
  }
  await writeIndex(filtered);
}

export async function saveTmpToCache(tmpFile: string, svg: string): Promise<string | null> {
  try {
    console.log("[svgCache] saveTmpToCache - tmpFile:", tmpFile);
    const hash = await hashSvg(svg);
    await ensureDir();
    const finalPath = pngPathForHash(hash);
    // Move tmp to final path
    await FileSystem.moveAsync({ from: tmpFile, to: finalPath });
    console.log("[svgCache] saveTmpToCache - moved tmp to finalPath:", finalPath);
    // Save svg too
    try {
      await saveSvgString(hash, svg);
    } catch (e) {
      console.error("[svgCache] saveTmpToCache - error saving svg string:", e);
      // ignore
    }
    const meta = {
      createdAt: new Date().toISOString(),
    };
    try {
      await AsyncStorage.setItem(`svgmeta:${hash}`, JSON.stringify(meta));
    } catch (e) {
      console.error("[svgCache] saveTmpToCache - error saving meta:", e);
      // ignore
    }
    await addToIndex(hash);
    console.log("[svgCache] saveTmpToCache - cached png path:", finalPath);
    return finalPath;
  } catch (e) {
    // fallback: try copy
    try {
      console.warn("[svgCache] saveTmpToCache - primary move failed, attempting copy fallback:", e);
      const hash = await hashSvg(svg);
      await ensureDir();
      const finalPath = pngPathForHash(hash);
      await FileSystem.copyAsync({ from: tmpFile, to: finalPath });
      await saveSvgString(hash, svg);
      await AsyncStorage.setItem(`svgmeta:${hash}`, JSON.stringify({ createdAt: new Date().toISOString() }));
      await addToIndex(hash);
      console.log("[svgCache] saveTmpToCache - copy fallback succeeded:", finalPath);
      return finalPath;
    } catch (err) {
      console.error("[svgCache] saveTmpToCache - fallback copy failed:", err);
      return null;
    }
  }
}

export async function saveTmpToCacheWithSvgFile(tmpFile: string, svgFilePath: string): Promise<string | null> {
  try {
    console.log("[svgCache] saveTmpToCacheWithSvgFile - tmpFile:", tmpFile, "svgFilePath:", svgFilePath);
    const svg = await FileSystem.readAsStringAsync(svgFilePath);
    const hash = await hashSvg(svg);
    await ensureDir();
    const finalPath = pngPathForHash(hash);
    // Move tmp to final path
    await FileSystem.moveAsync({ from: tmpFile, to: finalPath });
    console.log("[svgCache] saveTmpToCacheWithSvgFile - moved tmp to:", finalPath);
    // Save svg too (copy the svg file to svgPathForHash)
    try {
      await saveSvgString(hash, svg);
    } catch (e) {
      console.error("[svgCache] saveTmpToCacheWithSvgFile - error saving svg string:", e);
      // ignore
    }
    const meta = {
      createdAt: new Date().toISOString(),
      sourceFile: svgFilePath,
    };
    try {
      await AsyncStorage.setItem(`svgmeta:${hash}`, JSON.stringify(meta));
    } catch (e) {
      console.error("[svgCache] saveTmpToCacheWithSvgFile - error saving meta:", e);
      // ignore
    }
    await addToIndex(hash);
    console.log("[svgCache] saveTmpToCacheWithSvgFile - cached finalPath:", finalPath);
    return finalPath;
  } catch (e) {
    // fallback: try copy
    try {
      console.warn("[svgCache] saveTmpToCacheWithSvgFile - primary move failed, attempting copy fallback:", e);
      const svg = await FileSystem.readAsStringAsync(svgFilePath);
      const hash = await hashSvg(svg);
      await ensureDir();
      const finalPath = pngPathForHash(hash);
      await FileSystem.copyAsync({ from: tmpFile, to: finalPath });
      await saveSvgString(hash, svg);
      await AsyncStorage.setItem(`svgmeta:${hash}`, JSON.stringify({ createdAt: new Date().toISOString(), sourceFile: svgFilePath }));
      await addToIndex(hash);
      console.log("[svgCache] saveTmpToCacheWithSvgFile - copy fallback succeeded:", finalPath);
      return finalPath;
    } catch (err) {
      console.error("[svgCache] saveTmpToCacheWithSvgFile - fallback failed:", err);
      return null;
    }
  }
}

export default {
  hashSvg,
  getCachedPngUriForSvg,
  saveTmpToCache,
  saveSvgString,
  pngPathForHash,
  svgPathForHash,
};

