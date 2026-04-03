import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { ChatColors } from "../../../utils/theme";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";

const GOOGLE_PLACES_API_KEY = (Constants.expoConfig?.extra?.googlePlacesApiKey ?? "") as string;

type BirthLocation = {
  placeName: string;
  placeId: string;
  lat: number;
  lng: number;
};

interface LocationSearchProps {
  onLocationSelect: (loc: BirthLocation) => void;
  onConfirm: () => void;
}

export default function LocationSearch({ onLocationSelect, onConfirm }: LocationSearchProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<BirthLocation | null>(null);
  const [queryText, setQueryText] = useState<string>("");
  const insets = useSafeAreaInsets();

  const canOpenMaps = useMemo(() => queryText.trim().length >= 2, [queryText]);

  const openInMaps = async () => {
    const q = encodeURIComponent(queryText.trim());
    if (!q) return;

    // Universal Google Maps search URL (works everywhere)
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;

    // Try app deep links first, fallback to web
    const iosUrl = `comgooglemaps://?q=${q}`; // requires Google Maps installed
    const androidGeoUrl = `geo:0,0?q=${q}`; // opens maps app chooser / Google Maps

    try {
      if (Platform.OS === "ios") {
        const supported = await Linking.canOpenURL(iosUrl);
        await Linking.openURL(supported ? iosUrl : webUrl);
      } else {
        const supported = await Linking.canOpenURL(androidGeoUrl);
        await Linking.openURL(supported ? androidGeoUrl : webUrl);
      }
    } catch {
      // last resort
      await Linking.openURL(webUrl);
    }
  };

  return (
    <SafeAreaView style={styles.fullscreenContainer} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("locationSearch.title")}</Text>
      </View>


      <View style={styles.autocompleteContainer}>
        <GooglePlacesAutocomplete
          placeholder={t("locationSearch.placeholder")}
          fetchDetails
          onPress={(data, details) => {
            const placeName = data.description || details?.formatted_address || details?.name || "";
            const placeId = data.place_id || details?.place_id || "";

            const loc: any = details?.geometry?.location;
            // Some environments return functions: lat(), lng()
            const rawLat = loc?.lat;
            const rawLng = loc?.lng;
            const lat = typeof rawLat === "function" ? rawLat() : rawLat;
            const lng = typeof rawLng === "function" ? rawLng() : rawLng;

            if (!placeName || !placeId || typeof lat !== "number" || typeof lng !== "number") {
              setSelected(null);
              return;
            }

            const payload: BirthLocation = { placeName, placeId, lat, lng };
            setSelected(payload);
            setQueryText(placeName); // keep input synced to chosen place
            onLocationSelect(payload);
          }}
          query={{
            key: GOOGLE_PLACES_API_KEY,
            language: "en",
          }}
          debounce={300}
          enablePoweredByContainer={false}
          GooglePlacesDetailsQuery={{
            fields: "place_id,formatted_address,name,geometry",
          }}
          textInputProps={{
            value: queryText,
            onChangeText: (t) => {
              setQueryText(t);
              if (selected) setSelected(null);
            },
            placeholderTextColor: ChatColors.placeholder,
          }}
          styles={{
            textInputContainer: {
              backgroundColor: "transparent",
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            textInput: {
              backgroundColor: ChatColors.inputFieldBg,
              borderWidth: 1.5,
              borderColor: "rgba(100,80,40,0.25)",
              borderRadius: 28,
              paddingHorizontal: 20,
              paddingVertical: 12,
              color: ChatColors.lunaraText,
              fontSize: 15,
              fontWeight: "400",
              letterSpacing: 0.3,
            },
            listView: {
              backgroundColor: ChatColors.inputBarBg,
              borderRadius: 12,
              marginTop: 8,
            },
            row: {
              backgroundColor: ChatColors.inputBarBg,
              paddingVertical: 12,
              paddingHorizontal: 16,
              minHeight: 48,
              justifyContent: "center",
              width: "100%",
            },
            separator: {
              height: 1,
              backgroundColor: ChatColors.divider,
            },
            description: {
              color: ChatColors.lunaraText,
              fontSize: 14,
              fontWeight: "400",
            },
          }}
          onFail={(e) => console.log("PLACES FAIL:", e)}
          onNotFound={() => console.log("PLACES: no results")}
          requestUrl={{
            useOnPlatform: "all",
            url: "https://maps.googleapis.com/maps/api",
          }}
        />

        {/* Open in Maps while typing */}
        <TouchableOpacity
          style={[styles.mapsButton, !canOpenMaps && styles.mapsButtonDisabled]}
          onPress={openInMaps}
          activeOpacity={0.85}
          disabled={!canOpenMaps}
        >
          <Text style={styles.mapsButtonText}>{t("locationSearch.openInMaps")}</Text>
        </TouchableOpacity>

        <Text style={styles.hintText}>{t("locationSearch.hint")}</Text>
      </View>

      <View style={[styles.confirmWrapper, { paddingBottom: Math.max(insets.bottom + 8, 16) }]}>
        <TouchableOpacity
          style={[styles.confirmButton, !selected && styles.confirmButtonDisabled]}
          onPress={() => {
            if (!selected) return;
            onConfirm();
          }}
          activeOpacity={0.8}
          disabled={!selected}
        >
          <Text style={styles.confirmButtonText}>{t("common.continue")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ChatColors.bg,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    marginTop: -16,
    marginBottom: 16,
    marginHorizontal: -16,
    backgroundColor: ChatColors.headerBg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#d4af37", letterSpacing: 1 },

  autocompleteContainer: { flex: 1, marginTop: 8, marginBottom: 16 },

  mapsButton: {
    marginTop: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(100,80,40,0.30)",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: ChatColors.inputBarBg,
  },
  mapsButtonDisabled: { opacity: 0.45 },
  mapsButtonText: { color: ChatColors.lunaraLabel, fontWeight: "600", letterSpacing: 0.6 },

  hintText: {
    marginTop: 10,
    color: ChatColors.loadingText,
    fontSize: 12,
    textAlign: "center",
  },

  confirmWrapper: {
    marginHorizontal: -16,
    marginBottom: -24,
    backgroundColor: ChatColors.headerBg,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  confirmButton: {
    backgroundColor: ChatColors.sendActive,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonText: {
    color: ChatColors.headerBg,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
