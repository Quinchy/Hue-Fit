import React, { useEffect, useState } from 'react';
import { ScrollView, Image, View } from 'react-native';
import { VStack, HStack, Text, Box, IconButton } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundProvider from '../../providers/BackgroundProvider';
import StylizedButton from '../../components/StylizedButton';
import GeneratedOutfitCards from '../../components/GeneratedOutfitCards';
import DrawerMenu from '../../components/DrawerMenu';
import { Bell, Menu, ShoppingCart } from 'lucide-react-native';
import OpenAiLogoDark from '../../assets/icons/OpenAiLogoDark.svg';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { EXPO_PUBLIC_API_URL } from '@env';
import { RENDER_API_URL } from '@env';

type HomeScreenProps = {
  navigation: any; // Replace `any` with the specific navigation type if known
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [outfitName, setOutfitName] = useState<string | null>(null);
  const [wardrobeId, setWardrobeId] = useState<number | null>(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Fetch the latest wardrobe data
  const fetchLatestWardrobe = async () => {
    try {
      const userId = await AsyncStorage.getItem('user').then((user) => user && JSON.parse(user).id);
      if (!userId) {
        console.warn('User ID not found in AsyncStorage');
        return;
      }

      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/home/get-latest-wardrobe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        console.error('Failed to fetch wardrobe:', response.statusText);
        return;
      }

      const data = await response.json();
      if (data && data.wardrobe) {
        setOutfitName(data.wardrobe.outfitName || 'Default Outfit Name');
        setWardrobeId(data.wardrobe.id || null); // Save the wardrobe ID
      } else {
        console.warn('No wardrobe data found');
      }
    } catch (error) {
      console.error('Error fetching wardrobe:', error);
    }
  };

  // Gesture handler for swiping
  const handleGesture = (event: any) => {
    const { translationX } = event.nativeEvent;

    if (translationX < -50) {
      setIsMenuOpen(true); // Trigger drawer menu opening
    }
  };

  useEffect(() => {
    fetchLatestWardrobe(); // Fetch the wardrobe on component mount
  }, []);

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <View style={{ flex: 1 }}>
        <BackgroundProvider>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
            <VStack space={4} alignItems="center" mt={8}>
              {/* Header with Bell and Menu icons */}
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
              <Box width="100%" mt={5}>
                <Text color="#C0C0C0" fontSize="md" fontWeight="bold" mb={2}>
                  Recently Generated Outfit:
                </Text>
                <GeneratedOutfitCards
                  outfitName={outfitName || 'Loading...'}
                  onPress={() => navigation.navigate('Playground', { wardrobeId })} // Pass wardrobeId
                  onFavoritePress={() => console.log('Favorite My Outfit')}
                />
              </Box>
            </VStack>
            {isMenuOpen && <DrawerMenu isOpen={isMenuOpen} onClose={closeMenu} navigation={navigation} />}
          </ScrollView>
        </BackgroundProvider>
      </View>
    </PanGestureHandler>
  );
};

export default HomeScreen;
