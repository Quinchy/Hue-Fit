// screens/app/ShopScreen.js
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  StyleSheet,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import { VStack, HStack, Box, IconButton } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import SearchBar from '../../components/SearchBar';
import { Bell } from 'lucide-react-native';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/Loading'; // Import LoadingSpinner

const ShopScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state for initial load and loading more
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async (pageNumber, reset = false) => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.254.105:3000/api/mobile/home/get-products?limit=10&page=${pageNumber}`
      );
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      if (data.products?.length > 0) {
        setProducts((prev) => {
          if (reset) {
            return data.products;
          } else {
            // Prevent duplicates by filtering out products that already exist
            const existingProductIds = new Set(prev.map((product) => product.id));
            const newProducts = data.products.filter(
              (product) => !existingProductIds.has(product.id)
            );
            return [...prev, ...newProducts];
          }
        });
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
      onPress={() => navigation.navigate('ProductView', { productId: item.id })} // Pass product.id
    />
  );

  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Show LoadingSpinner during initial load
  if (loading && page === 1) {
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
        // Remove the incorrect marginBottom prop
        // Add paddingBottom via contentContainerStyle
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <VStack alignItems="center" mt={10}>
            <Box
              width="100%"
              mb={2}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box flex={1} mx={2}>
                <SearchBar
                  placeholder="Search products..."
                  onChangeText={(text) => setSearchQuery(text)}
                  value={searchQuery}
                />
              </Box>
              <HStack>
                <IconButton
                  icon={<Bell size={25} color="white" />}
                  mr={2}
                  onPress={() => navigation.navigate('Notification')}
                  _pressed={{ bg: 'dark.100' }}
                  borderRadius="full"
                />
              </HStack>
            </Box>
          </VStack>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && page > 1 ? ( // Show ActivityIndicator when loading more products
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
    paddingHorizontal: 7,
  },
  loadingContainerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  // Add a new style for the FlatList content
  listContent: {
    paddingBottom: 120, // Adjust this value as needed
  },
  footerLoadingContainer: { // New style for the footer loading indicator
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default ShopScreen;
