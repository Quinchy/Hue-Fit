// screens/app/ShopScreen.js
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { VStack, Box } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import SearchBar from '../../components/SearchBar';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/Loading';
import { EXPO_PUBLIC_API_URL } from '@env';

const ShopScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // For any fetch call
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async (pageNumber, reset = false) => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);
    try {
      const url = `${EXPO_PUBLIC_API_URL}/api/mobile/home/get-products?limit=10&page=${pageNumber}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      }`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      if (data.products?.length > 0) {
        setProducts((prev) =>
          reset ? data.products : [
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
      console.error('Error fetching products:', error);
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

  const renderProductCard = ({ item }) => (
    <ProductCard
      thumbnailURL={item.thumbnailURL}
      productName={item.productName}
      price={`PHP ${item.price}`}
      onPress={() => navigation.navigate('ProductView', { productId: item.id })}
    />
  );

  // Fetch initial products on mount.
  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Revalidate every time searchQuery changes (with a small debounce of 100ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleRefresh();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Only show the full-screen spinner on initial load if no products have been loaded yet.
  if (loading && page === 1 && searchQuery === '' && products.length === 0) {
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
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductCard}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <VStack alignItems="center" mt={12}>
            <Box width="100%" mb={2} flexDirection="row" justifyContent="center" alignItems="center">
              <Box flex={1} mx={4}>
                <SearchBar
                  placeholder="Search products..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                />
              </Box>
            </Box>
          </VStack>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          // Only show the footer spinner when loading more on the default list
          loading && page > 1 && searchQuery === '' ? (
            <View style={styles.footerLoadingContainer}>
              <ActivityIndicator size="small" color="#FFF" />
            </View>
          ) : null
        }
      />
    </BackgroundProvider>
  );
};

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  loadingContainerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 120,
  },
  footerLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default ShopScreen;
