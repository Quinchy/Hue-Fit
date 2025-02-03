// screens/app/CartScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { VStack, HStack, Text, Box, Pressable, useToast, Actionsheet, Radio } from 'native-base';
import { Image, ScrollView, View, RefreshControl, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Store, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import LoadingSpinner from '../../components/Loading'; 
import { EXPO_PUBLIC_API_URL } from '@env';

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

  // **New State Variables for Delete Confirmation**
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
        `${EXPO_PUBLIC_API_URL}/api/mobile/cart/get-cart-items`,
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
      console.error('Error fetching cart items:', error);
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
        `${EXPO_PUBLIC_API_URL}/api/mobile/cart/update-cart-item-quantity`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemId: item.id, quantity: newQuantity }),
        }
      );
      fetchCartItems(false);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.show({
        description: 'Failed to update item quantity.',
        duration: 3000,
        placement: 'top',
      });
    }
  };

  const deleteCartItem = async (item) => {
    try {
      await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/cart/delete-cart-item`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemId: item.id }),
        }
      );
      fetchCartItems(false);
      toast.show({
        description: 'Item removed from cart.',
        duration: 3000,
        placement: 'top',
      });
    } catch (error) {
      console.error('Error deleting cart item:', error);
      toast.show({
        description: 'Failed to remove item from cart.',
        duration: 3000,
        placement: 'top',
      });
    }
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

  const QuantityControl = ({ item, onDelete }) => {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);

    useEffect(() => {
      setLocalQuantity(item.quantity);
    }, [item.quantity]);

    const handleDecrement = () => {
      const newQty = localQuantity - 1;
      setLocalQuantity(newQty);
      if (newQty < 1) {
        onDelete(item); // Trigger confirmation before deletion
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
            onPress={() => onDelete(item)} // Trigger confirmation before deletion
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
        `${EXPO_PUBLIC_API_URL}/api/mobile/orders/create-order`,
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
      toast.show({
        description: 'An error occurred while processing your order.',
        duration: 3000,
        placement: 'top',
      });
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

  // **New Functions for Delete Confirmation**
  const confirmDeleteItem = (item) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (itemToDelete) {
      deleteCartItem(itemToDelete);
      setItemToDelete(null);
    }
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteCancelled = () => {
    setItemToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Loading Spinner */}
      {loading && !hasLoadedOnce ? (
        <View style={styles.loadingContainerFull}>
          <LoadingSpinner size={300} messages="Loading cart..." visible={true} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <HStack alignItems="center" space={1}>
            {route.params?.fromProduct && (
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                android_ripple={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  radius: 20,
                  borderless: true,
                }}
              >
                <ArrowLeft color="#fff" size={24} />
              </Pressable>
            )}
            <Text style={styles.cartTitle}>Cart</Text>
          </HStack>

          <VStack>
            {shopGroups.length > 0 ? (
              shopGroups.map((group) => (
                <VStack
                  key={group.shop.id}
                  marginBottom={2}
                  style={styles.shopGroup}
                >
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    marginTop={4}
                    paddingRight={2}
                  >
                    <HStack alignItems="center" space={1}>
                      <Store size={20} strokeWidth={2} color="#fff" />
                      <Text style={styles.shopName}>{group.shop.name}</Text>
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
                      style={styles.cartItem}
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
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      </Pressable>
                      <VStack flex={1}>
                        <VStack>
                          <Text
                            style={styles.productName}
                            numberOfLines={1}
                          >
                            {item.product.name}
                          </Text>
                          <Text style={styles.productPrice}>
                            PHP {item.product.price}
                          </Text>
                        </VStack>
                        <VStack flex={1}>
                          <Text style={styles.productSize}>
                            Size: {item.size}
                          </Text>
                          <HStack justifyContent="space-between" alignItems="center">
                            <HStack alignItems="center" space={1}>
                              <View
                                style={[
                                  styles.colorIndicator,
                                  { backgroundColor: item.product.colorHex },
                                ]}
                              />
                              <Text style={styles.productColor}>
                                {item.product.color}
                              </Text>
                            </HStack>
                            <QuantityControl item={item} onDelete={confirmDeleteItem} />
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
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>
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
                          <Text style={styles.checkoutButtonText}>
                            Checking-out...
                          </Text>
                        </HStack>
                      ) : (
                        <Text style={styles.checkoutButtonText}>
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
                  style={styles.emptyCartImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyCartTitle}>
                  Your cart is empty
                </Text>
                <Text style={styles.emptyCartSubtitle}>
                  Looks like you haven't added any items yet. Explore products and
                  start shopping!
                </Text>
              </VStack>
            )}
          </VStack>
        </ScrollView>
      )}

      {/* Payment Method Actionsheet */}
      <Actionsheet isOpen={isPaymentMethodOpen} onClose={() => setIsPaymentMethodOpen(false)}>
        <Actionsheet.Content style={styles.actionsheetContent}>
          <Text style={styles.actionsheetTitle}>
            Select a Payment Method
          </Text>

          <Radio.Group
            name="paymentMethod"
            accessibilityLabel="Payment Method"
            value={paymentMethod}
            onChange={(nextValue) => setPaymentMethod(nextValue)}
          >
            <VStack space={2} width="100%" paddingX={5}>
              <Box style={styles.paymentMethodBox}>
                <Radio value="COD" colorScheme="gray">
                  <Text style={styles.paymentMethodText}>
                    Cash on Delivery (COD)
                  </Text>
                </Radio>
              </Box>
              <Box
                style={[
                  styles.paymentMethodBox,
                  { opacity: 0.4 },
                ]}
              >
                <Radio value="CARD" isDisabled colorScheme="gray">
                  <Text style={styles.paymentMethodText}>
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
                <Text style={styles.checkoutButtonText}>
                  Processing...
                </Text>
              </HStack>
            ) : (
              <Text style={styles.checkoutButtonText}>
                Confirm
              </Text>
            )}
          </TouchableOpacity>
        </Actionsheet.Content>
      </Actionsheet>

      {/* Reserve Dialog */}
      {showReserveDialog && (
        <Actionsheet isOpen={showReserveDialog} onClose={() => setShowReserveDialog(false)}>
          <Actionsheet.Content style={styles.actionsheetContent}>
            <Text style={styles.actionsheetTitle}>
              Would you like to reserve this order?
            </Text>
            <Text style={styles.reserveDialogText}>
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
              <Text style={styles.checkoutButtonText}>
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
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </Actionsheet.Content>
        </Actionsheet>
      )}

      {/* **Delete Confirmation Actionsheet** */}
      <Actionsheet isOpen={isDeleteConfirmOpen} onClose={handleDeleteCancelled}>
        <Actionsheet.Content style={styles.actionsheetContent}>
          <Text style={styles.actionsheetTitle}>
            Are you sure you want to remove this item?
          </Text>

          <HStack space={4} justifyContent="center" marginTop={20}>
            <TouchableOpacity
              onPress={handleDeleteConfirmed}
              style={[
                styles.confirmButton,
                { backgroundColor: 'white' },
              ]}
            >
              <Text style={styles.confirmButtonText}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteCancelled}
              style={[
                styles.cancelButtonAction,
                { backgroundColor: '#555' },
              ]}
            >
              <Text style={styles.cancelButtonText}>No</Text>
            </TouchableOpacity>
          </HStack>
        </Actionsheet.Content>
      </Actionsheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#191919',
    flex: 1,
  },
  loadingContainerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    paddingBottom: 50,
    paddingHorizontal: 10,
  },
  backButton: {
    marginTop: 5,
    padding: 2,
  },
  cartTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    paddingTop: 30,
    paddingLeft: 10,
  },
  shopGroup: {
    flexDirection: 'column',
    gap: 5,
    marginBottom: 2,
  },
  shopName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: 4,
    padding: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 2,
  },
  productName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productPrice: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productSize: {
    color: 'gray',
    fontSize: 14,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  productColor: {
    color: 'gray',
    fontSize: 14,
  },
  totalLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
  checkoutButtonText: {
    color: '#191919',
    fontSize: 16,
    fontWeight: '400',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  emptyCartImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyCartTitle: {
    color: 'gray',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyCartSubtitle: {
    color: 'gray',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actionsheetContent: {
    backgroundColor: '#191919',
    padding: 20,
  },
  actionsheetTitle: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
  },
  paymentMethodBox: {
    backgroundColor: '#4E4E4E',
    borderRadius: 5,
    padding: 10,
  },
  paymentMethodText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    width: '100%',
  },
  // **New Styles for Delete Confirmation**
  confirmButton: {
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  confirmButtonText: {
    color: '#191919',
    fontSize: 16,
    fontWeight: '400',
  },
  cancelButtonAction: { // Renamed to avoid conflict with existing 'cancelButtonText'
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
});

export default CartScreen;
