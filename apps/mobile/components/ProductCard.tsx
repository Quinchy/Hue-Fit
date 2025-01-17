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
    <TouchableOpacity onPress={onPress} style={{ width: '49.2%', marginBottom: 6 }}>
      <Box borderWidth={1} borderColor="muted.900" bg="dark.100" borderRadius={5} overflow="hidden">
        <Image source={{ uri: thumbnailURL }} style={{ width: '100%', height: 250 }} resizeMode="cover" />
        <Box p={2}>
          <Text fontSize="xs" color='white' fontWeight="thin" numberOfLines={1}>
            {productName}
          </Text>
          <Text color="#fff" fontSize="sm" fontWeight="bold">
            {price}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default ProductCard;
