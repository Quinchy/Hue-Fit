// ShopScreen.tsx
import React, { useState } from "react";
import { VStack } from "native-base";
import { Image, View } from "react-native";
import BackgroundProvider from "../../providers/BackgroundProvider";
import SearchBar from "../../components/home/SearchBar";
import FilterBar from "../../components/home/FilterBar";
import ProductList from "../../components/home/ProductList";
import { useProducts } from "../../hooks/useProducts";

export default function ShopScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "ALL CLOTHINGS",
  ]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useProducts({
    search: searchQuery,
    filters: activeFilters,
  });

  const products = data?.pages.flatMap((pg) => pg.products) ?? [];

  return (
    <BackgroundProvider>
      <View style={{ flex: 1, paddingHorizontal: 10, marginTop: 40 }}>
        <VStack alignItems="center" space={2} mb={2}>
          <SearchBar
            placeholder="Search products..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
          <FilterBar
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
        </VStack>
        <ProductList
          products={products}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onFetchNextPage={fetchNextPage}
          onRefresh={refetch}
        />
      </View>
    </BackgroundProvider>
  );
}
