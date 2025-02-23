// ShopScreen.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity, Text } from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { VStack, Box } from "native-base";
import BackgroundProvider from "../../providers/BackgroundProvider";
import SearchBar from "../../components/SearchBar";
import ProductCard from "../../components/ProductCard";
import LoadingSpinner from "../../components/Loading";
import { EXPO_PUBLIC_API_URL } from "@env";
import { useTheme } from "../../providers/ThemeProvider";
// Import lucide icons for filters
import { Layers, Shirt } from "lucide-react-native";
// Import local SVG icons
import Jacket from "../../assets/icons/Jacket.svg";
import Sneaker from "../../assets/icons/Sneaker.svg";
import Trousers from "../../assets/icons/Trousers.svg";

// UniformIcon component to enforce consistent icon sizing and stroke
const UniformIcon = ({ IconComponent, size = 16, color, style }) => {
  return (
    <IconComponent
      width={size}
      height={size}
      stroke={color}
      strokeWidth={1.5}
      style={style}
    />
  );
};

const filterOptions = ["ALL CLOTHINGS", "OUTERWEAR", "UPPERWEAR", "LOWERWEAR", "FOOTWEAR"];
const filterIcons = {
  "ALL CLOTHINGS": Layers,   // from lucide-react-native
  "OUTERWEAR": Jacket,       // local SVG
  "UPPERWEAR": Shirt,        // from lucide-react-native
  "LOWERWEAR": Trousers,     // local SVG
  "FOOTWEAR": Sneaker,       // local SVG
};

const ShopScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(["ALL CLOTHINGS"]);

  const fetchProducts = async (pageNumber, reset = false) => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);
    try {
      // If "ALL CLOTHINGS" is active, ignore type filter.
      const typeParam = activeFilters.includes("ALL CLOTHINGS")
        ? ""
        : `&type=${encodeURIComponent(activeFilters.join(","))}`;
      const url = `${EXPO_PUBLIC_API_URL}/api/mobile/home/get-products?limit=10&page=${pageNumber}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }${typeParam}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      if (data.products?.length > 0) {
        setProducts((prev) =>
          reset
            ? data.products
            : [
                ...prev,
                ...data.products.filter(
                  (product) => !prev.some((p) => p.id === product.id)
                ),
              ]
        );
        setPage(reset ? 2 : pageNumber + 1);
        if (data.products.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchProducts(1, true);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      await fetchProducts(page);
    }
  };

  // Toggle filter button
  const toggleFilter = (filter) => {
    if (filter === "ALL CLOTHINGS") {
      setActiveFilters(["ALL CLOTHINGS"]);
    } else {
      // Remove ALL CLOTHINGS if present
      let newFilters = activeFilters.filter((f) => f !== "ALL CLOTHINGS");
      if (newFilters.includes(filter)) {
        newFilters = newFilters.filter((f) => f !== filter);
      } else {
        newFilters.push(filter);
      }
      // If nothing is active, default to ALL CLOTHINGS
      if (newFilters.length === 0) {
        newFilters = ["ALL CLOTHINGS"];
      }
      setActiveFilters(newFilters);
    }
  };

  // Refresh when searchQuery or activeFilters changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleRefresh();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilters]);

  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Wrap each ProductCard in a container with margin to simulate gaps.
  const renderProductCard = ({ item }) => (
    <View style={styles.cardWrapper}>
      <ProductCard
        thumbnailURL={item.thumbnailURL}
        productName={item.productName}
        price={`PHP ${item.price}`}
        onPress={() => navigation.navigate("ProductView", { productId: item.id })}
      />
    </View>
  );

  if (loading && page === 1 && searchQuery === "" && products.length === 0) {
    return (
      <BackgroundProvider>
        <View style={styles.loadingContainerFull}>
          <LoadingSpinner size={300} messages="Loading shops..." visible />
        </View>
      </BackgroundProvider>
    );
  }

  return (
    <BackgroundProvider>
      <MasonryList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={renderProductCard}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        ListHeaderComponent={
          <>
            <VStack alignItems="center" mt={12}>
              <Box width="100%" mb={2} flexDirection="row" justifyContent="center" alignItems="center">
                <Box flex={1} px={1}>
                  <SearchBar
                    placeholder="Search products..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                  />
                </Box>
              </Box>
              {/* Filter buttons */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {filterOptions.map((filter) => {
                  const isActive = activeFilters.includes(filter);
                  const IconComponent = filterIcons[filter];
                  return (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => toggleFilter(filter)}
                      style={[
                        styles.filterButton,
                        { backgroundColor: isActive ? theme.colors.white : theme.colors.grey },
                      ]}
                    >
                      {IconComponent && (
                        <UniformIcon
                          IconComponent={IconComponent}
                          size={16}
                          color={isActive ? theme.colors.dark : theme.colors.white}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text style={{ color: isActive ? theme.colors.dark : theme.colors.white, fontSize: 12 }}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </VStack>
          </>
        }
        ListFooterComponent={
          loading && page > 1 && searchQuery === "" ? (
            <View style={styles.footerLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.white} />
            </View>
          ) : null
        }
      />
    </BackgroundProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainerFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 120,
  },
  footerLoadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  filterContainer: {
    paddingHorizontal: 5,
    marginBottom: 10,
    marginTop: 5,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 35,
    borderRadius: 5,
    marginRight: 8,
  },
  cardWrapper: {
    margin: 5, // Adjust this value to change the gap between product cards
  },
});

export default ShopScreen;
