import React, { useState } from 'react';
import { ScrollView, Image, View } from 'react-native';
import { VStack, Text, Box, IconButton } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import StylizedButton from '../../components/StylizedButton';
import GeneratedOutfitCards from '../../components/GeneratedOutfitCards';
import DrawerMenu from '../../components/DrawerMenu';
import { Bell, Menu } from 'lucide-react-native';
import OpenAiLogoDark from '../../assets/icons/OpenAiLogoDark.svg';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { PanGestureHandler } from 'react-native-gesture-handler';

type HomeScreenProps = {
  navigation: any; // Replace `any` with the specific navigation type if known
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Gesture handler for swiping
  const handleGesture = (event: any) => {
    const { translationX } = event.nativeEvent;

    if (translationX < -50) {
      setIsMenuOpen(true); // Trigger drawer menu opening
    }
  };

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <View style={{ flex: 1 }}>
        <BackgroundProvider>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
            <VStack space={4} alignItems="center" mt={8}>
              {/* Header with Bell and Menu icons */}
              <Box width="100%" flexDirection="row" justifyContent="space-between" alignItems="center">
                <IconButton
                  icon={<Bell size={30} color="white" />}
                  onPress={() => navigation.navigate('Notification')}
                  _pressed={{ bg: 'gray.800' }}
                  borderRadius="full"
                />
                <Image
                  source={require('../../assets/icons/hue-fit-logo.png')}
                  style={{ width: 60, height: 60 }}
                  resizeMode="contain"
                />
                <IconButton 
                  icon={<Menu size={30} color="white" />} 
                  onPress={toggleMenu} 
                  _pressed={{ bg: 'gray.800' }}
                  borderRadius="full"
                />
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
                <Text color="gray.400" fontSize="md" fontWeight="bold" mb={2}>
                  Recently Generated Outfit:
                </Text>
                <GeneratedOutfitCards
                  outfitName="Outfit 1"
                  onPress={() => console.log('View My 2024 Outfit Drip')}
                  onFavoritePress={() => console.log('Favorite My 2024 Outfit Drip')}
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
