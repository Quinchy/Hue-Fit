// screens/app/ShopScreen.js
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, StyleSheet } from 'react-native';
import { VStack, HStack, Text, Box, IconButton } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import SearchBar from '../../components/SearchBar';
import { Bell } from 'lucide-react-native';
import ProductCard from '../../components/ProductCard';

const ShopScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
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
      if (!response.ok) return;
      const data = await response.json();
      if (data.products?.length > 0) {
        setProducts((prev) => (reset ? data.products : [...prev, ...data.products]));
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

  return (
    <BackgroundProvider>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductCard}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        marginBottom={120}
        ListHeaderComponent={
          <VStack alignItems="center" mt={10}>
            <Box width="100%" mb={2} flexDirection="row" justifyContent="space-between" alignItems="center">
              <Box flex={1} mx={2}>
                <SearchBar placeholder="Search products..." onChangeText={(text) => setSearchQuery(text)} />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C0C0C0" />
              <Text style={styles.loadingText}>Loading more products...</Text>
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
  loadingContainer: {
    marginVertical: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});

export default ShopScreen;
