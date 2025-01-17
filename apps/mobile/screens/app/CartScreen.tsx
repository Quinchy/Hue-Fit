import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Pressable,
  useToast,
  Actionsheet,
  Radio,
} from 'native-base';
import {
  Image,
  ScrollView,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Store, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const CartScreen = ({ navigation, route }) => {
  const [shopGroups, setShopGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const toast = useToast();
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Dialog for "Would you like to reserve this order?"
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  const [reserveItems, setReserveItems] = useState([]);

  const compareData = (oldData, newData) => {
    return JSON.stringify(oldData) === JSON.stringify(newData);
  };

  const fetchCartItems = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      const userId = await AsyncStorage.getItem('user').then((user) =>
        user ? JSON.parse(user).id : null
      );
      if (!userId) {
        setShopGroups([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        'http://192.168.254.105:3000/api/mobile/cart/get-cart-items',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newShops = data.shops || [];

        if (!compareData(shopGroups, newShops)) {
          const initialSelection = {};
          newShops.forEach((shop) => {
            initialSelection[shop.shop.id] = {
              isSelected: false,
              items: shop.items.reduce((acc, item) => {
                acc[item.id] = false;
                return acc;
              }, {}),
            };
          });
          setSelectedItems(initialSelection);
          setShopGroups(newShops);
        }
      } else {
        setShopGroups([]);
      }
    } catch (error) {
      setShopGroups([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        setHasLoadedOnce(true);
      }
    }
  };

  useEffect(() => {
    fetchCartItems(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedOnce) {
        fetchCartItems(false);
      }
    }, [hasLoadedOnce])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCartItems(false);
    setRefreshing(false);
  };

  const toggleShopSelection = (shopId) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      const shop = updated[shopId];
      const isShopSelected = !shop.isSelected;
      shop.isSelected = isShopSelected;
      Object.keys(shop.items).forEach((itemId) => {
        shop.items[itemId] = isShopSelected;
      });
      return updated;
    });
  };

  const toggleItemSelection = (shopId, itemId) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      updated[shopId].items[itemId] = !updated[shopId].items[itemId];
      const allSelected = Object.values(updated[shopId].items).every(
        (isSelected) => isSelected
      );
      updated[shopId].isSelected = allSelected;
      return updated;
    });
  };

  const updateQuantity = async (item, newQuantity) => {
    try {
      await fetch(
        'http://192.168.254.105:3000/api/mobile/cart/update-cart-item-quantity',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemId: item.id, quantity: newQuantity }),
        }
      );
      fetchCartItems(false);
    } catch (error) {}
  };

  const deleteCartItem = async (item) => {
    try {
      await fetch(
        'http://192.168.254.105:3000/api/mobile/cart/delete-cart-item',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemId: item.id }),
        }
      );
      fetchCartItems(false);
    } catch (error) {}
  };

  const CustomCheckbox = ({ isChecked, onPress, accessibilityLabel }) => (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={{
        width: 18,
        height: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isChecked ? 'white' : '#999',
        backgroundColor: isChecked ? 'white' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true }}
    >
      {isChecked && <MaterialIcons name="check" size={13} color="#191919" />}
    </Pressable>
  );

  const QuantityControl = ({ item }) => {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);

    useEffect(() => {
      setLocalQuantity(item.quantity);
    }, [item.quantity]);

    const handleDecrement = () => {
      const newQty = localQuantity - 1;
      setLocalQuantity(newQty);
      if (newQty < 1) {
        deleteCartItem(item);
      } else {
        updateQuantity(item, newQty);
      }
    };

    const handleIncrement = () => {
      const newQty = localQuantity + 1;
      setLocalQuantity(newQty);
      updateQuantity(item, newQty);
    };

    return (
      <HStack alignItems="center" space={2}>
        {localQuantity === 1 ? (
          <Pressable
            onPress={() => deleteCartItem(item)}
            style={{ backgroundColor: 'white', borderRadius: 2, padding: 5 }}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.5)', borderless: false }}
          >
            <Trash2 color="#191919" size={14} strokeWidth={2} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleDecrement}
            style={{ backgroundColor: 'white', borderRadius: 2, padding: 5 }}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.5)', borderless: false }}
          >
            <Minus color="#191919" size={14} strokeWidth={2} />
          </Pressable>
        )}
        <Text style={{ color: 'white', fontSize: 16 }}>{localQuantity}</Text>
        <Pressable
          onPress={handleIncrement}
          style={{ backgroundColor: 'white', borderRadius: 2, padding: 5 }}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.5)', borderless: false }}
        >
          <Plus color="#191919" size={14} strokeWidth={2} />
        </Pressable>
      </HStack>
    );
  };

  let total = 0;
  shopGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (selectedItems[group.shop.id]?.items[item.id]) {
        total += item.quantity * item.product.price;
      }
    });
  });

  const proceedCheckout = async (reserveMode = false) => {
    setCheckoutLoading(true);
    try {
      const userId = await AsyncStorage.getItem('user').then((user) =>
        user ? JSON.parse(user).id : null
      );

      const selectedItemsToCheckout = Object.entries(selectedItems).reduce(
        (acc, [shopId, shop]) => {
          const picked = Object.entries(shop.items)
            .filter(([, isSelected]) => isSelected)
            .map(([itemId]) => itemId);
          if (picked.length > 0) acc.push({ shopId, items: picked });
          return acc;
        },
        []
      );

      const response = await fetch(
        'http://192.168.254.105:3000/api/mobile/orders/create-order',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            selectedItemsToCheckout,
            paymentMethod: reserveMode ? 'RESERVED' : paymentMethod,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create order.');
      }

      const data = await response.json();
      console.log('Order response:', data);

      // If there are any leftover items that couldn't proceed (notEnoughStock)
      if (data.notEnoughStock && data.notEnoughStock.length > 0 && !reserveMode) {
        setReserveItems(data.notEnoughStock);
        setShowReserveDialog(true);
      } else {
        toast.show({
          description: 'Order processed successfully.',
          duration: 3000,
          placement: 'top',
        });
      }

      fetchCartItems(false);
    } catch (error) {
      console.error(error);
    } finally {
      setCheckoutLoading(false);
      setIsPaymentMethodOpen(false);
    }
  };

  const handleCheckout = () => {
    const selectedItemsToCheckout = Object.entries(selectedItems).reduce(
      (acc, [shopId, shop]) => {
        const picked = Object.entries(shop.items)
          .filter(([, isSelected]) => isSelected)
          .map(([itemId]) => itemId);
        if (picked.length > 0) acc.push({ shopId, items: picked });
        return acc;
      },
      []
    );

    if (selectedItemsToCheckout.length === 0) {
      toast.show({
        description: 'You should at least select 1 item from your cart.',
        duration: 3000,
        placement: 'top',
      });
      return;
    }

    setIsPaymentMethodOpen(true);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#191919', height: '100%' }}>
      {loading && !hasLoadedOnce ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <HStack alignItems="center" space={1}>
            {route.params?.fromProduct && (
              <Pressable
                onPress={() => navigation.goBack()}
                marginTop={5}
                padding={2}
                android_ripple={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  radius: 20,
                  borderless: true,
                }}
              >
                <ArrowLeft color="#fff" size={24} />
              </Pressable>
            )}
            <Text
              style={{
                color: 'white',
                fontSize: 28,
                fontWeight: 'bold',
                paddingTop: 30,
                paddingLeft: 10,
              }}
            >
              Cart
            </Text>
          </HStack>

          <VStack>
            {shopGroups.length > 0 ? (
              shopGroups.map((group) => (
                <VStack
                  key={group.shop.id}
                  marginBottom={2}
                  style={{ flexDirection: 'column', gap: 5 }}
                >
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    marginTop={4}
                    paddingRight={2}
                  >
                    <HStack alignItems="center" space={1}>
                      <Store size={20} strokeWidth={2} color="#fff" />
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                        {group.shop.name}
                      </Text>
                    </HStack>
                    <CustomCheckbox
                      isChecked={selectedItems[group.shop.id]?.isSelected || false}
                      onPress={() => toggleShopSelection(group.shop.id)}
                      accessibilityLabel={`Select all items from ${group.shop.name}`}
                    />
                  </HStack>

                  {group.items.map((item) => (
                    <HStack
                      key={item.id}
                      borderRadius={4}
                      padding={2}
                      style={{ flexDirection: 'row', gap: 4 }}
                    >
                      <Pressable
                        onPress={() => {
                          navigation.navigate('ProductView', {
                            productId: item.product.id,
                          });
                        }}
                      >
                        <Image
                          source={{ uri: item.product.thumbnailURL }}
                          style={{ width: 100, height: 100, borderRadius: 2 }}
                          resizeMode="cover"
                        />
                      </Pressable>
                      <VStack flex={1}>
                        <VStack>
                          <Text
                            style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}
                            numberOfLines={1}
                          >
                            {item.product.name}
                          </Text>
                          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                            PHP {item.product.price}
                          </Text>
                        </VStack>
                        <VStack flex={1}>
                          <Text style={{ color: 'gray', fontSize: 14 }}>
                            Size: {item.size}
                          </Text>
                          <HStack justifyContent="space-between" alignItems="center">
                            <HStack alignItems="center" space={1}>
                              <View
                                style={{
                                  width: 12,
                                  height: 12,
                                  backgroundColor: item.product.colorHex,
                                }}
                              />
                              <Text style={{ color: 'gray', fontSize: 14 }}>
                                {item.product.color}
                              </Text>
                            </HStack>
                            <QuantityControl item={item} />
                          </HStack>
                        </VStack>
                      </VStack>
                      <CustomCheckbox
                        isChecked={selectedItems[group.shop.id]?.items[item.id] || false}
                        onPress={() => toggleItemSelection(group.shop.id, item.id)}
                        accessibilityLabel={`Select ${item.product.name}`}
                      />
                    </HStack>
                  ))}

                  <HStack justifyContent="space-between" alignItems="center" paddingY={4}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                      Total:
                    </Text>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                      PHP {total.toFixed(2)}
                    </Text>
                  </HStack>

                  <Box paddingY={4}>
                    <TouchableOpacity
                      onPress={handleCheckout}
                      disabled={checkoutLoading}
                      style={[
                        styles.checkoutButton,
                        { backgroundColor: checkoutLoading ? 'gray' : 'white' },
                      ]}
                    >
                      {checkoutLoading ? (
                        <HStack space={2} alignItems="center">
                          <ActivityIndicator color="#191919" />
                          <Text style={{ color: '#191919', fontSize: 16, fontWeight: '400' }}>
                            Checking-out...
                          </Text>
                        </HStack>
                      ) : (
                        <Text style={{ color: '#191919', fontSize: 16, fontWeight: '400' }}>
                          Checkout
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Box>
                </VStack>
              ))
            ) : (
              <VStack alignItems="center" justifyContent="center" marginTop={75}>
                <Image
                  source={require('../../assets/empty-cart.png')}
                  style={{ width: 150, height: 150, marginBottom: 20 }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    color: 'gray',
                    fontSize: 20,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  Your cart is empty
                </Text>
                <Text
                  style={{
                    color: 'gray',
                    fontSize: 14,
                    textAlign: 'center',
                    paddingHorizontal: 20,
                  }}
                >
                  Looks like you haven't added any items yet. Explore products and
                  start shopping!
                </Text>
              </VStack>
            )}
          </VStack>
        </ScrollView>
      )}

      <Actionsheet isOpen={isPaymentMethodOpen} onClose={() => setIsPaymentMethodOpen(false)}>
        <Actionsheet.Content style={{ backgroundColor: '#191919' }}>
          <Text style={{ color: 'white', fontSize: 20, marginBottom: 10 }}>
            Select a Payment Method
          </Text>

          <Radio.Group
            name="paymentMethod"
            accessibilityLabel="Payment Method"
            value={paymentMethod}
            onChange={(nextValue) => setPaymentMethod(nextValue)}
          >
            <VStack space={2} width="100%" paddingX={5}>
              <Box
                style={{
                  backgroundColor: '#4E4E4E',
                  borderRadius: 5,
                  padding: 10,
                }}
              >
                <Radio value="COD" colorScheme="gray">
                  <Text style={{ color: 'white', marginLeft: 8, fontSize: 16, width: '100%' }}>
                    Cash on Delivery (COD)
                  </Text>
                </Radio>
              </Box>
              <Box
                style={{
                  backgroundColor: '#4E4E4E',
                  borderRadius: 5,
                  padding: 10,
                  opacity: 0.4,
                }}
              >
                <Radio value="CARD" isDisabled colorScheme="gray">
                  <Text style={{ color: 'white', marginLeft: 8, fontSize: 16, width: '100%' }}>
                    Credit Card
                  </Text>
                </Radio>
              </Box>
            </VStack>
          </Radio.Group>

          <TouchableOpacity
            onPress={() => proceedCheckout(false)}
            disabled={checkoutLoading}
            style={[
              styles.checkoutButton,
              { backgroundColor: checkoutLoading ? 'gray' : 'white', marginTop: 20 },
            ]}
          >
            {checkoutLoading ? (
              <HStack space={2} alignItems="center">
                <ActivityIndicator color="#191919" />
                <Text style={{ color: '#191919', fontSize: 16, fontWeight: '400' }}>
                  Processing...
                </Text>
              </HStack>
            ) : (
              <Text style={{ color: '#191919', fontSize: 16, fontWeight: '400' }}>
                Confirm
              </Text>
            )}
          </TouchableOpacity>
        </Actionsheet.Content>
      </Actionsheet>

      {/* Reserve Dialog */}
      {showReserveDialog && (
        <Actionsheet isOpen={showReserveDialog} onClose={() => setShowReserveDialog(false)}>
          <Actionsheet.Content style={{ backgroundColor: '#191919' }}>
            <Text style={{ color: 'white', fontSize: 20, marginBottom: 10 }}>
              Would you like to reserve this order?
            </Text>
            <Text style={{ color: 'gray', marginBottom: 20, textAlign: 'center' }}>
              When you choose to reserve your order, it will be placed under a "Reserved" status.
              "Reserved Items", once are back in stock, will automatically proceed in order.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowReserveDialog(false);
                setTimeout(() => {
                  proceedCheckout(true);
                }, 300);
              }}
              style={[
                styles.checkoutButton,
                { backgroundColor: 'white', marginTop: 5 },
              ]}
            >
              <Text style={{ color: '#191919', fontSize: 16, fontWeight: '400' }}>
                Proceed to Reserve
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowReserveDialog(false);
                // do nothing, user opts not to reserve
              }}
              style={[
                styles.checkoutButton,
                { backgroundColor: '#555', marginTop: 5 },
              ]}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '400' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </Actionsheet.Content>
        </Actionsheet>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  checkoutButton: {
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
});

export default CartScreen;
