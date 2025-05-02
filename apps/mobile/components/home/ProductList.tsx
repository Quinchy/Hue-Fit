// components/Home/ProductList.tsx
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../constants/colors";
import ProductCard from "./ProductCard";
import SkeletonProductCard from "./SkeletonProductCard";
import { NavigationProp } from "../../types/navigation";

type ProductDto = {
  id: number;
  thumbnailURL: string;
  productName: string;
  price: string;
};

type Props = {
  products: ProductDto[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onFetchNextPage: () => void;
  onRefresh: () => void;
};

export default function ProductList({
  products,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onFetchNextPage,
  onRefresh,
}: Props) {
  const navigation = useNavigation<NavigationProp<"Shop">>();
  const showSkeletons = isLoading && products.length === 0;
  const skeletonData = Array.from({ length: 8 }, (_, i) => ({
    key: `skel-${i}`,
  }));

  const renderSkeletonCard = (item: { key: string }) => (
    <View style={styles.cardWrapper} key={item.key}>
      <SkeletonProductCard />
    </View>
  );
  const renderProductCard = (item: ProductDto) => (
    <View style={styles.cardWrapper} key={item.id}>
      <ProductCard
        thumbnailURL={item.thumbnailURL}
        productName={item.productName}
        price={`PHP ${item.price}`}
        onPress={() =>
          navigation.navigate("ProductView", { productId: item.id })
        }
      />
    </View>
  );

  return (
    <MasonryList
      data={showSkeletons ? skeletonData : products}
      keyExtractor={(item: any) =>
        showSkeletons ? item.key : item.id.toString()
      }
      numColumns={2}
      renderItem={({ item }) =>
        showSkeletons
          ? renderSkeletonCard(item as { key: string })
          : renderProductCard(item as ProductDto)
      }
      onRefresh={onRefresh}
      refreshing={isLoading}
      onEndReached={() => !showSkeletons && hasNextPage && onFetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    margin: 5,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  listContent: {
    marginHorizontal: -5,
    marginTop: -5,
    paddingBottom: 120,
  },
});
