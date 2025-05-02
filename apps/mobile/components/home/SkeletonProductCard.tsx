// components/Home/SkeletonProductCard.tsx
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { colors, applyOpacity } from "../../constants/colors";
import Skeleton from "../Skeleton";

export default function SkeletonProductCard() {
  const randomAspectRatio = useMemo(
    () => Math.random() * (1.2 - 0.7) + 0.7,
    []
  );
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <Skeleton
          style={
            [styles.imagePlaceholder, { aspectRatio: randomAspectRatio }] as any
          }
        />
        <View style={styles.textContainer}>
          <Skeleton style={styles.titlePlaceholder} />
          <Skeleton style={styles.pricePlaceholder} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
  },
  card: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.darkGrey,
    borderWidth: 1,
    borderColor: applyOpacity(colors.white, 0.15),
  },
  imagePlaceholder: {
    width: "100%",
    borderRadius: 0,
    backgroundColor: applyOpacity(colors.white, 0.15),
  },
  textContainer: {
    padding: 8,
  },
  titlePlaceholder: {
    height: 14,
    width: "60%",
    backgroundColor: applyOpacity(colors.white, 0.15),
    borderRadius: 4,
    marginBottom: 6,
  },
  pricePlaceholder: {
    height: 12,
    width: "40%",
    backgroundColor: applyOpacity(colors.white, 0.15),
    borderRadius: 4,
  },
});
