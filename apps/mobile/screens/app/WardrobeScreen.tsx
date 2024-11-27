import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { VStack, HStack, Text, IconButton, Icon } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import SearchBar from '../../components/SearchBar';
import FilterButton from '../../components/FilterButton';
import GeneratedOutfitCards from '../../components/GeneratedOutfitCards';
import DrawerMenu from '../../components/DrawerMenu';
import { Menu } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WardrobeScreen: React.FC = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wardrobes, setWardrobes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<string[]>([]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const applyFilters = (selectedFilters: string[]) => {
    setFilters(selectedFilters);
    // Add filtering logic based on `selectedFilters` if needed
  };

  const fetchWardrobes = async () => {
    try {
      const userId = await AsyncStorage.getItem('user').then((user) => user && JSON.parse(user).id);
      if (!userId) {
        console.warn('User ID not found in AsyncStorage');
        return;
      }

      const response = await fetch('http://192.168.254.105:3000/api/mobile/wardrobe/get-wardrobes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        console.error('Failed to fetch wardrobes:', response.statusText);
        return;
      }

      const data = await response.json();
      setWardrobes(data.wardrobes || []);
    } catch (error) {
      console.error('Error fetching wardrobes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWardrobes();
  }, []);

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
        <VStack space={4} mt={50}>
          {/* Header with Title and Menu Icon */}
          <HStack height={60} justifyContent="space-between" alignItems="center" mb={30}>
            <Text fontSize="3xl" fontWeight="bold" color="white">
              WARDROBE
            </Text>
            <IconButton
              icon={<Icon as={Menu} color="white" />}
              onPress={toggleMenu}
              size="lg"
            />
          </HStack>

          {/* Search Bar */}
          <SearchBar placeholder="Search..." />

          {/* Generated Outfits Section Header with Filters */}
          <HStack justifyContent="space-between" alignItems="center" mt={4}>
            <Text color="gray.400" fontSize="md" fontWeight="bold">
              GENERATED OUTFITS:
            </Text>
            <FilterButton onApplyFilters={applyFilters} />
          </HStack>

          {/* Outfit List */}
          {isLoading ? (
            <Text color="gray.400" textAlign="center" mt={5}>
              Loading wardrobes...
            </Text>
          ) : wardrobes.length === 0 ? (
            <Text color="gray.400" textAlign="center" mt={5}>
              No wardrobes found.
            </Text>
          ) : (
            <VStack space={2} mt={4}>
              {wardrobes.map((wardrobe) => (
                <GeneratedOutfitCards
                  key={wardrobe.id}
                  outfitName={wardrobe.outfitName}
                  onPress={() => navigation.navigate('Playground', { wardrobeId: wardrobe.id })}
                  onFavoritePress={() => console.log(`Favorite ${wardrobe.outfitName}`)}
                />
              ))}
            </VStack>
          )}
        </VStack>
        {isMenuOpen && <DrawerMenu isOpen={isMenuOpen} onClose={closeMenu} navigation={navigation} />}
      </ScrollView>
    </BackgroundProvider>
  );
};

export default WardrobeScreen;
