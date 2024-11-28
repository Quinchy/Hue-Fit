import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, StyleSheet } from 'react-native';
import { VStack, HStack, Text, Box, IconButton } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundProvider from '../../providers/BackgroundProvider';
import StylizedButton from '../../components/StylizedButton';
import GeneratedOutfitCards from '../../components/GeneratedOutfitCards';
import DrawerMenu from '../../components/DrawerMenu';
import ProductCard from '../../components/ProductCard';
import { Bell, Menu, ShoppingCart } from 'lucide-react-native';
import OpenAiLogoDark from '../../assets/icons/OpenAiLogoDark.svg';
import { EXPO_PUBLIC_API_URL } from '@env';
import * as NavigationBar from 'expo-navigation-bar';
import { Image } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [outfitName, setOutfitName] = useState<string | null>(null);
  const [wardrobeId, setWardrobeId] = useState<number | null>(null);
  const [hasGeneratedOutfit, setHasGeneratedOutfit] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Fetch latest wardrobe
  const fetchLatestWardrobe = async () => {
    try {
      const userId = await AsyncStorage.getItem('user').then((user) => user && JSON.parse(user).id);
      if (!userId) return;

      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/home/get-latest-wardrobe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutfitName(data?.wardrobe?.outfitName || 'Default Outfit Name');
        setWardrobeId(data?.wardrobe?.id || null);
        setHasGeneratedOutfit(true);
      } else if (response.status === 404) {
        setHasGeneratedOutfit(false);
      }
    } catch (error) {
      console.error('Error fetching wardrobe:', error);
    }
  };

  // Fetch products
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

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([fetchLatestWardrobe(), fetchProducts(1, true)]);
    setRefreshing(false);
  };

  // Load more data when user scrolls to the bottom
  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      await fetchProducts(page);
    }
  };

  useEffect(() => {
    fetchLatestWardrobe();
    fetchProducts(1);
  }, []);

  const renderProductCard = ({ item }) => (
    <ProductCard
      thumbnailURL={item.thumbnailURL}
      productName={item.productName}
      price={`$${item.price}`}
      onPress={() => navigation.navigate('ProductView', { productVariantNo: item.productVariantNo })}
    />
  );
  
  NavigationBar.setPositionAsync('absolute');
  NavigationBar.setBackgroundColorAsync('#19191901');

  return (
    <BackgroundProvider>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductCard}
        numColumns={2}
        paddingHorizontal={10}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <VStack space={4} alignItems="center" mt={8}>
            {/* Header */}
            <Box width="100%" mt={5} flexDirection="row" justifyContent="space-between" alignItems="center">
              <Image
                source={require('../../assets/icons/hue-fit-logo.png')}
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
              <HStack>
                <IconButton
                  icon={<Bell size={25} color="white" />}
                  onPress={() => navigation.navigate('Notification')}
                  _pressed={{ bg: 'gray.800' }}
                  borderRadius="full"
                />
                <IconButton
                  icon={<ShoppingCart size={25} color="white" />}
                  onPress={() => navigation.navigate('Notification')}
                  _pressed={{ bg: 'gray.800' }}
                  borderRadius="full"
                />
                <IconButton
                  icon={<Menu size={25} color="white" />}
                  onPress={toggleMenu}
                  _pressed={{ bg: 'gray.800' }}
                  borderRadius="full"
                />
              </HStack>
            </Box>

            {/* Generate Outfit */}
            <StylizedButton
              title="Generate Outfit"
              onPress={() => navigation.navigate('Input')}
              style={styles.generateButton}
              icon={<OpenAiLogoDark width={30} height={30} fill="red" />}
            />

            {/* Outfit Section */}
            <Box width="100%" mt={5}>
              <Text color="#C0C0C0" fontSize="md" fontWeight="bold" mb={2}>
                Recently Generated Outfit:
              </Text>
              {hasGeneratedOutfit ? (
                <GeneratedOutfitCards
                  outfitName={outfitName || 'Loading...'}
                  onPress={() => navigation.navigate('Playground', { wardrobeId })}
                  onFavoritePress={() => console.log('Favorite My Outfit')}
                />
              ) : (
                <Text color="#C0C0C0" fontSize="sm" mt={1} textAlign="center">
                  You have no generated outfits yet.
                </Text>
              )}
            </Box>

            {/* Product Section Header */}
            <Box width="100%" mt={5}>
              <Text color="#C0C0C0" fontSize="md" fontWeight="bold" mb={2}>
                Products:
              </Text>
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
      {isMenuOpen && <DrawerMenu isOpen={isMenuOpen} onClose={closeMenu} navigation={navigation} />}
    </BackgroundProvider>
  );
};

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  generateButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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

export default HomeScreen;
