import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Box, Text } from 'native-base';

type ProductCardProps = {
  thumbnailURL: string;
  productName: string;
  price: string;
  onPress: () => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ thumbnailURL, productName, price, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: '49%', marginBottom: 7 }}>
      <Box borderWidth={1} borderColor="#c0c0c025" bg="#272727" borderRadius="md" overflow="hidden">
        <Image source={{ uri: thumbnailURL }} style={{ width: '100%', height: 175 }} resizeMode="cover" />
        <Box p={2}>
          <Text fontSize="md" color='white' fontWeight="bold" numberOfLines={1}>
            {productName}
          </Text>
          <Text color="#C0C0C0" fontSize="sm">
            {price}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default ProductCard;
