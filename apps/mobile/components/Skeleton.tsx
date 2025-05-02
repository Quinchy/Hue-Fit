// components/Skeleton.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../constants/colors";

type SkeletonProps = {
  style?: ViewStyle;
};

export default function Skeleton({ style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return <Animated.View style={[styles.loader, style, { opacity }]} />;
}

const styles = StyleSheet.create({
  loader: {
    backgroundColor: colors.grey,
    borderRadius: 8,
  },
});
