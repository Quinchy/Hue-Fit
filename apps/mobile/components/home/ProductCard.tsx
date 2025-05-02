// components/ProductCard.tsx
import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { colors, applyOpacity } from "../../constants/colors";

interface ProductCardProps {
  thumbnailURL: string;
  productName: string;
  price: string;
  onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  thumbnailURL,
  productName,
  price,
  onPress,
}) => {
  // Memoize a random aspect ratio so it doesn't change on re-renders
  const randomAspectRatio = useMemo(
    () => Math.random() * (1.2 - 0.7) + 0.7,
    []
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <Image
        source={{ uri: thumbnailURL }}
        style={[styles.image, { aspectRatio: randomAspectRatio }]}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {productName}
        </Text>
        <Text style={styles.price}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.darkGrey,
    borderWidth: 1,
    borderColor: applyOpacity(colors.white, 0.15),
    elevation: 10,
  },
  image: {
    width: "100%",
    resizeMode: "cover",
  },
  textContainer: {
    padding: 8,
  },
  title: {
    fontSize: 12,
    marginBottom: 2,
    color: colors.greyWhite,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white,
  },
});

export default React.memo(ProductCard);
