// screens/HomeScreen.js
import React from 'react';
import { ScrollView, Image } from 'react-native';
import { VStack, Text, Center, Box, IconButton } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import StylizedButton from '../../components/StylizedButton';
import GeneratedOutfitCards from '../../components/GeneratedOutfitCards';
import { Bell, Menu } from 'lucide-react-native';
import OpenAiLogoDark from '../../assets/icons/OpenAiLogoDark.svg';

export default function HomeScreen({ navigation }) {
  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}>
        <VStack space={4} alignItems="center" mt={8}>
          {/* Header with Bell and Menu icons */}
          <Box width="100%" flexDirection="row" justifyContent="space-between" alignItems="center">
            <IconButton
              icon={<Bell size={24} color="white" />}
              onPress={() => console.log("Notifications")}
            />
            <Image
              source={require('../../assets/icons/hue-fit-logo.png')}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
            <IconButton
              icon={<Menu size={24} color="white" />}
              onPress={() => console.log("Menu")}
            />
          </Box>

          {/* Generate Outfit Button */}
          <StylizedButton
            title="Generate Outfit"
            onPress={() => console.log("Generate Outfit")}
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
              onPress={() => console.log("View My 2024 Outfit Drip")}
              onFavoritePress={() => console.log("Favorite My 2024 Outfit Drip")}
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
              onPress={() => console.log("View Classic Looks")}
              onFavoritePress={() => console.log("Favorite Classic Looks")}
            />
            <GeneratedOutfitCards
              outfitName="Personal Style 1"
              onPress={() => console.log("View Personal Style 1")}
              onFavoritePress={() => console.log("Favorite Personal Style 1")}
            />
            <Text color="gray.500" fontSize="sm" mt={4}>
              YESTERDAY
            </Text>
            <GeneratedOutfitCards
              outfitName="Formal Outfit"
              onPress={() => console.log("View Formal Outfit")}
              onFavoritePress={() => console.log("Favorite Formal Outfit")}
            />
            <GeneratedOutfitCards
              outfitName="Personal Style 2"
              onPress={() => console.log("View Personal Style 2")}
              onFavoritePress={() => console.log("Favorite Personal Style 2")}
            />
            <GeneratedOutfitCards
              outfitName="Street Looks"
              onPress={() => console.log("View Street Looks")}
              onFavoritePress={() => console.log("Favorite Street Looks")}
            />
          </Box>
        </VStack>
      </ScrollView>
    </BackgroundProvider>
  );
}
