import React, { useState, useEffect } from 'react';
import { VStack, HStack, Text, Box, IconButton, Icon } from 'native-base';
import { Image } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';
import { ArrowLeft } from 'lucide-react-native';
import GradientCard from '../../components/GradientCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({ navigation }: { navigation: any }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const userId = await AsyncStorage.getItem('user').then((user) =>
        user ? JSON.parse(user).id : null
      );

      if (!userId) {
        console.error('User ID not found.');
        setCartItems([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://192.168.254.105:3000/api/mobile/cart/get-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', response.statusText);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <BackgroundProvider>
      <VStack flex={1}>
        {/* Header */}
        <HStack
          alignItems="center"
          mt={10}
          justifyContent="space-between"
          padding={4}
          style={{ borderBottomWidth: 1, borderBottomColor: '#555' }}
        >
          <IconButton
            icon={<Icon as={ArrowLeft} color="white" size={24} />}
            onPress={() => navigation.goBack()}
          />
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Your Cart</Text>
        </HStack>

        {/* Cart Items */}
        <GradientCard>
          <VStack>
            {loading ? (
              <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center', marginTop: 20 }}>
                Loading orders...
              </Text>
            ) : cartItems.length > 0 ? (
              cartItems.map((item) => (
                <HStack
                  key={item.id}
                  alignItems="center"
                  bg="#2E2E2E"
                  space={1}
                  borderRadius={10}
                  paddingX={4}
                  paddingY={2}
                  marginBottom={4}
                >
                  {/* Item Image */}
                  <Image
                    source={{ uri: item.product.thumbnailURL || 'https://via.placeholder.com/100' }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      marginRight: 10,
                    }}
                    resizeMode="cover"
                  />
                  {/* Item Details */}
                  <VStack flex={1}>
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: 'Thin' }}>
                      {item.product.color} {item.product.name}
                    </Text>
                    <Text style={{ color: 'gray', fontSize: 14 }}>Size: {item.size || 'N/A'}</Text>
                    <Text style={{ color: 'gray', fontSize: 14 }}>Quantity: {item.quantity}</Text>
                    <Text style={{ color: 'gray', fontSize: 14 }}>Status: {item.status}</Text>
                  </VStack>
                  {/* Price */}
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    ₱{item.product.price}
                  </Text>
                </HStack>
              ))
            ) : (
              <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center', marginTop: 20 }}>
                Your cart is empty
              </Text>
            )}
          </VStack>
        </GradientCard>
      </VStack>
    </BackgroundProvider>
  );
};

export default CartScreen;
