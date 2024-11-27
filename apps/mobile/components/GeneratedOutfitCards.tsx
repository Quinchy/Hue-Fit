// components/GeneratedOutfitCards.tsx
import React from 'react';
import { HStack, Text, IconButton, Box } from 'native-base';
import { Star, MoreVertical } from 'lucide-react-native';
import { Pressable } from 'react-native';
import OpenAiLogo from '../assets/icons/OpenAiLogo.svg';

interface GeneratedOutfitCardsProps {
  outfitName: string;
  onPress: () => void;
  onFavoritePress: () => void;
}

const GeneratedOutfitCards: React.FC<GeneratedOutfitCardsProps> = ({ outfitName, onPress, onFavoritePress }) => {
  return (
    <Pressable onPress={onPress}>
      <Box
        bg="#2E2E2E"
        rounded="md"
        p={3}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <HStack alignItems="center" space={3}>
          <OpenAiLogo width={25} height={25} />
          <Text color="white" fontSize="md" fontWeight="bold">
            {outfitName}
          </Text>
        </HStack>
        <HStack alignItems="center" space={3}>
          <IconButton
            icon={<MoreVertical size={20} color="white" />}
            onPress={() => console.log("More options")}
            _pressed={{ bg: 'gray.700' }}
            borderRadius="full" 
          />
          <IconButton
            icon={<Star size={20} color="white" />}
            onPress={onFavoritePress}
            _pressed={{ bg: 'gray.700' }}
            borderRadius="full" 
          />
        </HStack>
      </Box>
    </Pressable>
  );
};

export default GeneratedOutfitCards;
