import React, { useRef, useEffect } from "react";
import { View, Text, Image, Animated, Easing } from "react-native";
import { styles } from "../styles";

type Props = {
  initial: string;
  zodiacImage?: number;
};

export default function Avatar({ initial, zodiacImage }: Props) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.avatarWrap}>
      {zodiacImage ? (
        <Image source={zodiacImage} style={styles.avatarZodiacImage} resizeMode="contain" />
      ) : (
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
}
