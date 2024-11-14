// screens/HomeScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Image } from 'react-native';
import { VStack, Text, Box, IconButton } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import StylizedButton from '../../components/StylizedButton';
import GeneratedOutfitCards from '../../components/GeneratedOutfitCards';
import DrawerMenu from '../../components/DrawerMenu';
import { Bell, Menu } from 'lucide-react-native';
import OpenAiLogoDark from '../../assets/icons/OpenAiLogoDark.svg';

type HomeScreenProps = {
  navigation: any; // Replace `any` with the specific navigation type if known
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
        <VStack space={4} alignItems="center" mt={8}>
          {/* Header with Bell and Menu icons */}
          <Box width="100%" flexDirection="row" justifyContent="space-between" alignItems="center">
            <IconButton
              icon={<Bell size={30} color="white" />}
              onPress={() => navigation.navigate('Notification')}
            />
            <Image
              source={require('../../assets/icons/hue-fit-logo.png')}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
            <IconButton icon={<Menu size={30} color="white" />} onPress={toggleMenu} />
          </Box>

          {/* Generate Outfit Button */}
          <StylizedButton
            title="Generate Outfit"
            onPress={() => navigation.navigate('Input')}
            style={{
              width: '100%',
              height: 50,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}
            icon={<OpenAiLogoDark width={30} height={30} fill="red" />}
          />

          {/* Current Outfit Section */}
          <Box width="100%" mt={10}>
            <Text color="gray.400" fontSize="md" fontWeight="bold">
              CURRENT:
            </Text>
            <GeneratedOutfitCards
              outfitName="My 2024 Outfit Drip"
              onPress={() => console.log('View My 2024 Outfit Drip')}
              onFavoritePress={() => console.log('Favorite My 2024 Outfit Drip')}
            />
          </Box>

          {/* Recent Outfits Section */}
          <Box width="100%" mt={6}>
            <Text color="gray.400" fontSize="md" fontWeight="bold">
              RECENT:
            </Text>
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
              outfitName="Personal Style 2"
              onPress={() => console.log('View Personal Style 2')}
              onFavoritePress={() => console.log('Favorite Personal Style 2')}
            />
            <GeneratedOutfitCards
              outfitName="Street Looks"
              onPress={() => console.log('View Street Looks')}
              onFavoritePress={() => console.log('Favorite Street Looks')}
            />
          </Box>
        </VStack>
        {isMenuOpen && <DrawerMenu isOpen={isMenuOpen} onClose={closeMenu} navigation={navigation} />}
      </ScrollView>
    </BackgroundProvider>
  );
};

export default HomeScreen;
