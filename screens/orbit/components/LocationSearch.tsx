import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
const GOOGLE_PLACES_API_KEY = "AIzaSyAh7fHuXzW2sl7mItwWFFdIzzOZFOSCoSU";  

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
  const [selected, setSelected] = useState<BirthLocation | null>(null);
  const [queryText, setQueryText] = useState<string>("");

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
    <View style={styles.fullscreenContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Enter Your Birth Location</Text>
      </View>

      <View style={styles.autocompleteContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search for a place..."
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
              // typing means selection is no longer confirmed
              if (selected) setSelected(null);
            },
            placeholderTextColor: "rgba(212, 175, 55, 0.7)",
          }}
          styles={{
            textInputContainer: {
              backgroundColor: "transparent",
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            textInput: {
              backgroundColor: "#2d1b3d",
              borderWidth: 1,
              borderColor: "rgba(212, 175, 55, 0.3)",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: "#e5e5e5",
              fontSize: 15,
              fontWeight: "300",
              letterSpacing: 0.3,
            },
            listView: {
              backgroundColor: "#2d1b3d",
              borderRadius: 12,
              marginTop: 8,
            },
            row: {
              paddingVertical: 12,
              paddingHorizontal: 16,
              height: "auto",
            },
            separator: {
              height: 1,
              backgroundColor: "rgba(212, 175, 55, 0.1)",
            },
            description: {
              color: "#f4d26a", // softer gold for suggestions
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
          <Text style={styles.mapsButtonText}>Open in Google Maps</Text>
        </TouchableOpacity>

        <Text style={styles.hintText}>
          Tip: pick a suggestion to save the exact coordinates (lat/lng).
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, !selected && styles.confirmButtonDisabled]}
        onPress={() => {
          if (!selected) return;
          onConfirm();
        }}
        activeOpacity={0.8}
        disabled={!selected}
      >
        <Text style={styles.confirmButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a0d2e",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: { marginBottom: 16, alignItems: "center" },
  title: { fontSize: 16, fontWeight: "600", color: "#d4af37", letterSpacing: 1 },

  autocompleteContainer: { flex: 1, marginTop: 8, marginBottom: 16 },

  mapsButton: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.10)",
  },
  mapsButtonDisabled: { opacity: 0.45 },
  mapsButtonText: { color: "#d4af37", fontWeight: "600", letterSpacing: 0.6 },

  hintText: {
    marginTop: 10,
    color: "rgba(229,229,229,0.75)",
    fontSize: 12,
    textAlign: "center",
  },

  confirmButton: {
    backgroundColor: "#d4af37",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonText: {
    color: "#1a0d2e",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
