// screens/app/CartScreen.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  Pressable,
  Actionsheet,
  Radio,
} from "native-base";
import {
  Image,
  ScrollView,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { Store, Minus, Plus, Trash2, ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import LoadingSpinner from "../../components/Loading";
import Alert, { AlertStatus } from "../../components/Alert";
import { EXPO_PUBLIC_API_URL } from "@env";
import { colors, applyOpacity } from "../../constants/colors";

const CartScreen = ({ navigation, route }) => {
  const [shopGroups, setShopGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  const [reserveItems, setReserveItems] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // alert state
  const [alert, setAlert] = useState<{
    message: string;
    status?: AlertStatus;
  } | null>(null);

  const compareData = (oldData, newData) =>
    JSON.stringify(oldData) === JSON.stringify(newData);

  const fetchCartItems = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true);
      const userId = await AsyncStorage.getItem("user").then((u) =>
        u ? JSON.parse(u).id : null
      );
      if (!userId) {
        setShopGroups([]);
        return;
      }
      const res = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/cart/get-cart-items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const newShops = data.shops || [];
        if (!compareData(shopGroups, newShops)) {
          const initialSelection = {};
          newShops.forEach((shop) => {
            initialSelection[shop.shop.id] = {
              isSelected: false,
              items: shop.items.reduce((acc, it) => {
                acc[it.id] = false;
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
    } catch (e) {
      console.error("Error fetching cart items:", e);
      setShopGroups([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        setHasLoadedOnce(true);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCartItems(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedOnce) fetchCartItems(false);
    }, [hasLoadedOnce])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCartItems(false);
  };

  const toggleShopSelection = (shopId) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      const s = updated[shopId];
      const selectAll = !s.isSelected;
      s.isSelected = selectAll;
      Object.keys(s.items).forEach((id) => (s.items[id] = selectAll));
      return updated;
    });
  };

  const toggleItemSelection = (shopId, itemId) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      const s = updated[shopId];
      s.items[itemId] = !s.items[itemId];
      s.isSelected = Object.values(s.items).every(Boolean);
      return updated;
    });
  };

  // optimistic update + debounce
  const updateQuantity = (cartItemId, qty) => {
    // optimistic
    setShopGroups((groups) =>
      groups.map((g) => ({
        ...g,
        items: g.items.map((it) =>
          it.id === cartItemId ? { ...it, quantity: qty } : it
        ),
      }))
    );
    // API
    fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/cart/update-cart-item-quantity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, quantity: qty }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
      })
      .catch(() => {
        setAlert({
          message: "Failed to update item quantity.",
          status: "error",
        });
        fetchCartItems(false);
      });
  };

  const deleteCartItem = async (item) => {
    try {
      await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/cart/delete-cart-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId: item.id }),
      });
      fetchCartItems(false);
      setAlert({ message: "Item removed from cart.", status: "success" });
    } catch (e) {
      console.error(e);
      setAlert({
        message: "Failed to remove item from cart.",
        status: "error",
      });
    }
  };

  const QuantityControl = ({ item, onDelete }) => {
    const [localQty, setLocalQty] = useState(item.quantity.toString());
    const timer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      setLocalQty(item.quantity.toString());
    }, [item.quantity]);

    const debounceUpdate = (n) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => updateQuantity(item.id, n), 500);
    };

    const dec = () => {
      let n = parseInt(localQty) || 0;
      n = n - 1;
      if (n < 1) onDelete(item);
      else {
        setLocalQty(n.toString());
        debounceUpdate(n);
      }
    };

    const inc = () => {
      let n = parseInt(localQty) || 0;
      if (n < 99) {
        n = n + 1;
        setLocalQty(n.toString());
        debounceUpdate(n);
      }
    };

    const onChange = (txt) => {
      if (txt === "") return setLocalQty("");
      let num = parseInt(txt.replace(/[^0-9]/g, "")) || 0;
      num = Math.min(num, 99);
      setLocalQty(num.toString());
      debounceUpdate(num);
    };

    const onBlur = () => {
      let num = parseInt(localQty) || 1;
      if (num < 1) num = 1;
      setLocalQty(num.toString());
      updateQuantity(item.id, num);
    };

    return (
      <HStack alignItems="center" space={2}>
        {parseInt(localQty) === 1 ? (
          <Pressable onPress={() => onDelete(item)} style={styles.qtyBtn}>
            <Trash2 color={colors.dark} size={14} strokeWidth={2} />
          </Pressable>
        ) : (
          <Pressable onPress={dec} style={styles.qtyBtn}>
            <Minus color={colors.dark} size={14} strokeWidth={2} />
          </Pressable>
        )}
        <TextInput
          style={styles.qtyInput}
          keyboardType="numeric"
          value={localQty}
          onChangeText={onChange}
          onBlur={onBlur}
        />
        <Pressable onPress={inc} style={styles.qtyBtn}>
          <Plus color={colors.dark} size={14} strokeWidth={2} />
        </Pressable>
      </HStack>
    );
  };

  let total = 0;
  shopGroups.forEach((g) =>
    g.items.forEach((it) => {
      if (selectedItems[g.shop.id]?.items[it.id]) {
        total += it.quantity * it.product.price;
      }
    })
  );

  const proceedCheckout = async (reserve = false) => {
    setCheckoutLoading(true);
    try {
      const userId = await AsyncStorage.getItem("user").then((u) =>
        u ? JSON.parse(u).id : null
      );
      const selected = Object.entries(selectedItems)
        .map(([sid, shop]) => ({
          shopId: sid,
          items: Object.entries(shop.items)
            .filter(([, sel]) => sel)
            .map(([iid]) => iid),
        }))
        .filter((x) => x.items.length);
      const res = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/orders/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            selectedItemsToCheckout: selected,
            paymentMethod: reserve ? "RESERVED" : paymentMethod,
          }),
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.notEnoughStock?.length && !reserve) {
        setReserveItems(data.notEnoughStock);
        setShowReserveDialog(true);
      } else {
        setAlert({
          message: "Order processed successfully.",
          status: "success",
        });
      }
      fetchCartItems(false);
    } catch (e) {
      console.error(e);
      setAlert({
        message: "An error occurred while processing your order.",
        status: "error",
      });
    } finally {
      setCheckoutLoading(false);
      setIsPaymentMethodOpen(false);
    }
  };

  const handleCheckout = () => {
    const anySelected = Object.values(selectedItems).some((s) =>
      Object.values(s.items).some(Boolean)
    );
    if (!anySelected) {
      setAlert({ message: "Select at least one item.", status: "info" });
      return;
    }
    setIsPaymentMethodOpen(true);
  };

  const confirmDeleteItem = (it) => {
    setItemToDelete(it);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (itemToDelete) deleteCartItem(itemToDelete);
    setIsDeleteConfirmOpen(false);
  };
  const handleDeleteCancelled = () => setIsDeleteConfirmOpen(false);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.darkGrey }]}
    >
      {alert && (
        <Alert
          message={alert.message}
          status={alert.status}
          onClose={() => setAlert(null)}
        />
      )}
      {loading && !hasLoadedOnce ? (
        <View style={styles.loadingContainerFull}>
          <LoadingSpinner size={300} messages="Loading cart..." visible />
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
              >
                <ArrowLeft color={colors.white} size={24} />
              </Pressable>
            )}
            <Text style={[styles.cartTitle, { color: colors.white }]}>
              My Cart
            </Text>
          </HStack>

          <VStack mb={75}>
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
                      <Store size={20} strokeWidth={2} color={colors.white} />
                      <Text style={[styles.shopName, { color: colors.white }]}>
                        {group.shop.name}
                      </Text>
                    </HStack>

                    <Pressable
                      onPress={() => toggleShopSelection(group.shop.id)}
                      android_ripple={{
                        color: "rgba(255,255,255,0.3)",
                        borderless: true,
                        radius: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: colors.greyWhite, // outer outline
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: selectedItems[group.shop.id]
                              ?.isSelected
                              ? colors.darkGrey // inner outline when selected
                              : "transparent",
                            backgroundColor: selectedItems[group.shop.id]
                              ?.isSelected
                              ? colors.white
                              : "transparent",
                          }}
                        />
                      </View>
                    </Pressable>
                  </HStack>
                  {group.items.map((item) => (
                    <HStack
                      key={item.id}
                      borderRadius={4}
                      padding={2}
                      style={styles.cartItem}
                    >
                      <Pressable
                        onPress={() =>
                          navigation.navigate("ProductView", {
                            productId: item.product.id,
                          })
                        }
                      >
                        <Image
                          source={{ uri: item.product.thumbnailURL }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      </Pressable>
                      <VStack flex={1}>
                        <Text
                          style={[styles.productName, { color: colors.white }]}
                          numberOfLines={1}
                        >
                          {item.product.name}
                        </Text>
                        <Text
                          style={[styles.productPrice, { color: colors.white }]}
                        >
                          PHP {item.product.price}
                        </Text>
                        <Text
                          style={[styles.productSize, { color: colors.grey }]}
                        >
                          Size: {item.size}
                        </Text>
                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <HStack alignItems="center" space={1}>
                            <View
                              style={[
                                styles.colorIndicator,
                                { backgroundColor: item.product.colorHex },
                              ]}
                            />
                            <Text
                              style={[
                                styles.productColor,
                                { color: colors.grey },
                              ]}
                            >
                              {item.product.color}
                            </Text>
                          </HStack>
                          <QuantityControl
                            item={item}
                            onDelete={confirmDeleteItem}
                          />
                        </HStack>
                      </VStack>
                      <Pressable
                        onPress={() =>
                          toggleItemSelection(group.shop.id, item.id)
                        }
                        android_ripple={{
                          color: "rgba(255,255,255,0.3)",
                          borderless: false,
                          radius: 12,
                        }}
                        style={{
                          alignSelf: "flex-start", // don't stretch
                          width: 22,
                          height: 22,
                          borderRadius: 14,
                          overflow: "hidden", // clip the ripple
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: colors.greyWhite,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: selectedItems[group.shop.id]?.items[
                                item.id
                              ]
                                ? colors.darkGrey
                                : "transparent",
                              backgroundColor: selectedItems[group.shop.id]
                                ?.items[item.id]
                                ? colors.white
                                : "transparent",
                            }}
                          />
                        </View>
                      </Pressable>
                    </HStack>
                  ))}
                </VStack>
              ))
            ) : (
              <VStack
                alignItems="center"
                justifyContent="center"
                marginTop={125}
              >
                <Image
                  source={require("../../assets/empty-cart.png")}
                  style={styles.emptyCartImage}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.emptyCartTitle,
                    { color: applyOpacity(colors.greyWhite, 0.75) },
                  ]}
                >
                  Your cart is empty
                </Text>
                <Text
                  style={[
                    styles.emptyCartSubtitle,
                    { color: applyOpacity(colors.greyWhite, 0.5) },
                  ]}
                >
                  Looks like you haven't added any items yet. Explore products
                  and start shopping!
                </Text>
              </VStack>
            )}

            {shopGroups.length > 0 && (
              <>
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  paddingY={4}
                >
                  <Text style={[styles.totalLabel, { color: colors.white }]}>
                    Total:
                  </Text>
                  <Text style={[styles.totalAmount, { color: colors.white }]}>
                    PHP {total.toFixed(2)}
                  </Text>
                </HStack>
                <Box paddingY={4} marginHorizontal={16}>
                  <TouchableOpacity
                    onPress={handleCheckout}
                    disabled={checkoutLoading}
                    style={[
                      styles.checkoutButton,
                      {
                        backgroundColor: checkoutLoading
                          ? colors.grey
                          : colors.white,
                      },
                    ]}
                  >
                    {checkoutLoading ? (
                      <HStack space={2} alignItems="center">
                        <ActivityIndicator color={colors.dark} />
                        <Text style={styles.checkoutButtonText}>
                          Checking-out...
                        </Text>
                      </HStack>
                    ) : (
                      <Text style={styles.checkoutButtonText}>Checkout</Text>
                    )}
                  </TouchableOpacity>
                </Box>
              </>
            )}
          </VStack>
        </ScrollView>
      )}

      {/* Payment Actionsheet */}
      <Actionsheet
        isOpen={isPaymentMethodOpen}
        onClose={() => setIsPaymentMethodOpen(false)}
      >
        <Actionsheet.Content
          style={[
            styles.actionsheetContent,
            { backgroundColor: colors.darkGrey },
          ]}
        >
          <Text style={[styles.actionsheetTitle, { color: colors.white }]}>
            Select a Payment Method
          </Text>
          <Radio.Group
            name="paymentMethod"
            value={paymentMethod}
            onChange={(val) => setPaymentMethod(val)}
          >
            <VStack space={2} width="100%" paddingX={5}>
              <Box
                style={[
                  styles.paymentMethodBox,
                  { backgroundColor: colors.grey },
                ]}
              >
                <Radio value="COD" colorScheme="gray">
                  <Text style={styles.paymentMethodText}>
                    Cash on Delivery (COD)
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
              {
                backgroundColor: checkoutLoading ? colors.grey : colors.white,
                marginTop: 20,
              },
            ]}
          >
            {checkoutLoading ? (
              <HStack space={2} alignItems="center">
                <ActivityIndicator color={colors.dark} />
                <Text style={styles.checkoutButtonText}>Processing...</Text>
              </HStack>
            ) : (
              <Text style={styles.checkoutButtonText}>Confirm</Text>
            )}
          </TouchableOpacity>
        </Actionsheet.Content>
      </Actionsheet>

      {/* Reserve Dialog */}
      <Actionsheet
        isOpen={showReserveDialog}
        onClose={() => setShowReserveDialog(false)}
      >
        <Actionsheet.Content
          style={[
            styles.actionsheetContent,
            { backgroundColor: colors.darkGrey },
          ]}
        >
          <Text style={[styles.actionsheetTitle, { color: colors.white }]}>
            Would you like to reserve this order?
          </Text>
          <Text style={[styles.reserveDialogText, { color: colors.white }]}>
            When you choose to reserve your order, it will be placed under a
            "Reserved" status. Reserved items, once back in stock, will
            automatically proceed in order.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowReserveDialog(false);
              setTimeout(() => proceedCheckout(true), 300);
            }}
            style={[
              styles.checkoutButton,
              { backgroundColor: colors.white, marginTop: 5 },
            ]}
          >
            <Text style={styles.checkoutButtonText}>Proceed to Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowReserveDialog(false)}
            style={[
              styles.checkoutButton,
              { backgroundColor: colors.grey, marginTop: 5 },
            ]}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Actionsheet.Content>
      </Actionsheet>

      {/* Delete Confirmation */}
      <Actionsheet isOpen={isDeleteConfirmOpen} onClose={handleDeleteCancelled}>
        <Actionsheet.Content
          style={[
            styles.actionsheetContent,
            { backgroundColor: colors.darkGrey },
          ]}
        >
          <Text style={[styles.actionsheetTitle, { color: colors.white }]}>
            Are you sure you want to remove this item?
          </Text>
          <HStack space={4} justifyContent="center" marginTop={20}>
            <TouchableOpacity
              onPress={handleDeleteConfirmed}
              style={[styles.confirmButton, { backgroundColor: colors.white }]}
            >
              <Text style={styles.confirmButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteCancelled}
              style={[
                styles.cancelButtonAction,
                { backgroundColor: colors.grey },
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
  safeArea: { flex: 1 },
  loadingContainerFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: { paddingBottom: 50, paddingHorizontal: 15 },
  backButton: { marginTop: 18, padding: 2 },
  cartTitle: { fontSize: 28, fontWeight: "bold", paddingTop: 35 },
  shopGroup: { flexDirection: "column", gap: 5, marginBottom: 2 },
  shopName: { fontSize: 16, fontWeight: "bold" },
  cartItem: { flexDirection: "row", gap: 4, borderRadius: 4, padding: 2 },
  productImage: { width: 100, height: 100, borderRadius: 2 },
  productName: { fontSize: 12, fontWeight: "bold" },
  productPrice: { fontSize: 18, fontWeight: "bold" },
  productSize: { fontSize: 14 },
  colorIndicator: { width: 12, height: 12, borderRadius: 6 },
  productColor: { fontSize: 14 },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalAmount: { fontSize: 18, fontWeight: "bold" },
  checkoutButton: {
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 10,
  },
  checkoutButtonText: { color: "#191919", fontSize: 16, fontWeight: "400" },
  cancelButtonText: { fontSize: 16, fontWeight: "400" },
  emptyCartImage: { width: 150, height: 150, marginBottom: 10 },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  actionsheetContent: { padding: 20 },
  actionsheetTitle: { fontSize: 20, marginBottom: 10 },
  paymentMethodBox: { borderRadius: 5, padding: 10 },
  paymentMethodText: { marginLeft: 8, fontSize: 16, width: "100%" },
  confirmButton: {
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  confirmButtonText: { fontSize: 16, fontWeight: "400" },
  cancelButtonAction: {
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  qtyBtn: { backgroundColor: colors.white, borderRadius: 2, padding: 5 },
  qtyInput: {
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
    minWidth: 10,
  },
});

export default CartScreen;
