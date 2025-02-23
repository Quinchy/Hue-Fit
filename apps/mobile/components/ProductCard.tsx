// ProductCard.js
import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../providers/ThemeProvider";

const ProductCard = ({ thumbnailURL, productName, price, onPress }) => {
  const { theme } = useTheme();
  // Memoize the random aspect ratio to keep it stable across re-renders.
  const randomAspectRatio = useMemo(() => Math.random() * (1.2 - 0.7) + 0.7, []);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.darkGrey }]}
      onPress={onPress}
    >
      <Image
        source={{ uri: thumbnailURL }}
        style={[styles.image, { aspectRatio: randomAspectRatio }]}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.white }]} numberOfLines={1}>
          {productName}
        </Text>
        <Text style={[styles.price, { color: theme.colors.greyWhite }]}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 4,
    borderRadius: 10,
    overflow: "hidden",
    flex: 1,
  },
  image: {
    width: "100%",
    resizeMode: "cover",
  },
  textContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
  },
});

// Export wrapped with React.memo to avoid unnecessary re-renders.
export default React.memo(ProductCard);
