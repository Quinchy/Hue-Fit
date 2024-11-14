// screens/WardrobeScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Image } from 'react-native';
import { VStack, HStack, Text, IconButton, Icon } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import SearchBar from '../../components/SearchBar';
import FilterButton from '../../components/FilterButton';
import GeneratedOutfitCards from '../../components/GeneratedOutfitCards';
import DrawerMenu from '../../components/DrawerMenu';
import { Menu } from 'lucide-react-native';

type WardrobeScreenProps = {
  navigation: any; // Update with a specific navigation type if possible
};

const WardrobeScreen: React.FC<WardrobeScreenProps> = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const [filters, setFilters] = useState<string[]>([]);

  const applyFilters = (selectedFilters: string[]) => {
    setFilters(selectedFilters);
  };

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
        <VStack space={4} mt={25}>
          {/* Header with Title and Menu Icon */}
          <HStack height={60} justifyContent="space-between" alignItems="center" mb={30}>
            <HStack alignItems="center" space={2}>
              <Image
                source={require('../../assets/icons/hue-fit-logo.png')}
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
              <Text fontSize="3xl" fontWeight="bold" color="white">
                WARDROBE
              </Text>
            </HStack>
            <IconButton
              icon={<Icon as={Menu} color="white" />}
              onPress={toggleMenu}
              size="lg" // Set size on IconButton to ensure consistent icon size
            />
          </HStack>

          {/* Search Bar */}
          <SearchBar placeholder="Search..." />

          {/* Generated Outfits Section Header */}
          <HStack justifyContent="space-between" alignItems="center" mt={4}>
            <Text color="gray.400" fontSize="md" fontWeight="bold">
              GENERATED OUTFITS:
            </Text>
            <FilterButton onApplyFilters={applyFilters} />
          </HStack>

          {/* Outfit Lists */}
          <VStack space={2}>
            <Text color="gray.500" fontSize="sm" mt={3}>
              TODAY
            </Text>
            <GeneratedOutfitCards
              outfitName="Classic Looks"
              onPress={() => console.log('View Classic Looks')}
              onFavoritePress={() => console.log('Favorite Classic Looks')}
            />
            <GeneratedOutfitCards
              outfitName="Personal Style 1"
              onPress={() => console.log('View Personal Style 1')}
              onFavoritePress={() => console.log('Favorite Personal Style 1')}
            />

            <Text color="gray.500" fontSize="sm" mt={4}>
              YESTERDAY
            </Text>
            <GeneratedOutfitCards
              outfitName="Formal Outfit"
              onPress={() => console.log('View Formal Outfit')}
              onFavoritePress={() => console.log('Favorite Formal Outfit')}
            />
            <GeneratedOutfitCards
              outfitName="Street Looks"
              onPress={() => console.log('View Street Looks')}
              onFavoritePress={() => console.log('Favorite Street Looks')}
            />
          </VStack>
        </VStack>
        {isMenuOpen && <DrawerMenu isOpen={isMenuOpen} onClose={closeMenu} navigation={navigation} />}
      </ScrollView>
    </BackgroundProvider>
  );
};

export default WardrobeScreen;
