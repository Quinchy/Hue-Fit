import React, { useState, useEffect } from "react";
import { FlatList, Pressable, View, Alert } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  VStack,
  Text,
  Box,
  HStack,
  Modal,
  Select
} from "native-base";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomInput from "../../components/Input";
import DefaultButton from "../../components/Button";
import LoadingSpinner from "../../components/Loading";

const Tab = createMaterialTopTabNavigator();

const OrderList = ({ status, ordersData, refreshOrders }) => {
  const orders = ordersData[status] || [];
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  // For PROCESSING orders cancellation reason state.
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Cancellation reasons for PROCESSING orders.
  const cancellationReasons = [
    "Not Interested anymore.",
    "Wrong color/size selected.",
    "Other"
  ];

  const handleCancelOrder = async () => {
    // Build the cancellation message.
    const cancellationMessage =
      selectedOrder?.status === "PROCESSING"
        ? cancelReason === "Other"
          ? customReason
          : cancelReason
        : ""; // For PENDING orders, no reason is needed.

    try {
      const response = await fetch(
        `http://192.168.254.105:3000/api/mobile/orders/cancel-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: selectedOrder.id,
            askingForCancellation: true,
            cancellationMessage: cancellationMessage
          })
        }
      );
      if (response.ok) {
        Alert.alert("Success", "Cancellation requested successfully");
        if (refreshOrders) refreshOrders();
      } else {
        Alert.alert("Error", "Failed to request cancellation");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      Alert.alert(
        "Error",
        "An error occurred while requesting cancellation"
      );
    } finally {
      setCancelModalVisible(false);
      setSelectedOrder(null);
      setCancelReason("");
      setCustomReason("");
    }
  };

  return (
    <VStack flex={1} p={4} style={{ backgroundColor: "#000" }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Box
            style={{
              backgroundColor: "#1A1A1A",
              padding: 16,
              marginBottom: 15,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#808080",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#FFF",
                marginBottom: 8,
              }}
            >
              Order No: {item.orderNo}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#FFF",
                marginBottom: 4,
              }}
            >
              Shop: {item.shopName}
            </Text>
            {item.orderItems.map((orderItem, index) => (
              <Box
                key={index}
                style={{
                  marginBottom: 8,
                  paddingLeft: 8,
                  borderLeftWidth: 2,
                  borderLeftColor: "#FFF",
                }}
              >
                <Text style={{ fontSize: 14, color: "#FFF" }}>
                  {orderItem.productName}
                </Text>
                <Text style={{ fontSize: 12, color: "#AAA" }}>
                  Color: {orderItem.productVariantColorName} | Size: {orderItem.productVariantSizeName}
                </Text>
                <Text style={{ fontSize: 12, color: "#AAA" }}>
                  Price: PHP {orderItem.productVariantPrice} | Quantity: {orderItem.quantity}
                </Text>
              </Box>
            ))}
            <Text style={{ fontSize: 14, color: "#CCC", marginTop: 4 }}>
              Status: {item.status}
            </Text>
            <Text
              style={{
                color: "#FFF",
                fontSize: 14,
                marginTop: 8,
                fontWeight: "bold",
              }}
            >
              Order Total: PHP {item.orderTotal} {"\n"}
              Delivery Fee: PHP {item.deliveryFee} {"\n"}
              Final Total: PHP {item.finalTotal}
            </Text>
            {/* Show cancel button for both PENDING and PROCESSING orders */}
            {(item.status === "PENDING" || item.status === "PROCESSING") && (
              <Pressable
                onPress={() => {
                  setSelectedOrder(item);
                  setCancelModalVisible(true);
                }}
                style={{
                  backgroundColor: "#FFF",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 4,
                  marginTop: 8,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: "#000",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  Cancel Order
                </Text>
              </Pressable>
            )}
          </Box>
        )}
      />

      <Modal
        isOpen={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
      >
        <Modal.Content
          maxWidth="400px"
          style={{
            backgroundColor: "#000",
            borderRadius: 10,
          }}
        >
          <Modal.CloseButton />
          <Modal.Header
            style={{
              backgroundColor: "#000",
              borderBottomWidth: 1,
              borderColor: "#808080",
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Cancel Order</Text>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: "#000" }}>
            {selectedOrder && selectedOrder.status === "PENDING" ? (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#FFF",
                  marginBottom: 8,
                }}
              >
                Are you sure you want to cancel this order?
              </Text>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#FFF",
                    marginBottom: 8,
                  }}
                >
                  Select a cancellation reason:
                </Text>
                <Select
                  placeholder="Select reason"
                  selectedValue={cancelReason}
                  onValueChange={(value) => setCancelReason(value)}
                  mt={2}
                  style={{
                    backgroundColor: "#444",
                    color: "#FFF",
                  }}
                  _selectedItem={{ bg: "gray.500" }}
                >
                  {cancellationReasons.map((reason) => (
                    <Select.Item key={reason} label={reason} value={reason} />
                  ))}
                </Select>
                {cancelReason === "Other" && (
                  <CustomInput
                    label="Other Reason"
                    placeholder="Enter your reason"
                    value={customReason}
                    onChangeText={setCustomReason}
                    variant="filled"
                    style={{
                      backgroundColor: "#444",
                      color: "#FFF",
                      marginTop: 10,
                    }}
                  />
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer
            style={{
              justifyContent: "center",
              backgroundColor: "#000",
              borderTopWidth: 1,
              borderColor: "#808080",
            }}
          >
            {selectedOrder && selectedOrder.status === "PENDING" ? (
              <>
                <DefaultButton
                  title="Yes"
                  onPress={handleCancelOrder}
                  style={{
                    backgroundColor: "#FFF",
                    marginHorizontal: 10,
                    marginBottom: 10,
                  }}
                  textStyle={{ color: "#000" }}
                />
                <DefaultButton
                  title="No"
                  onPress={() => setCancelModalVisible(false)}
                  style={{
                    backgroundColor: "#FFF",
                    marginHorizontal: 10,
                  }}
                  textStyle={{ color: "#000" }}
                />
              </>
            ) : (
              <>
                <DefaultButton
                  title="Confirm"
                  onPress={handleCancelOrder}
                  style={{
                    backgroundColor: "#FFF",
                    marginHorizontal: 10,
                    marginBottom: 10,
                  }}
                  textStyle={{ color: "#000" }}
                />
                <DefaultButton
                  title="Cancel"
                  onPress={() => setCancelModalVisible(false)}
                  style={{
                    backgroundColor: "#FFF",
                    marginHorizontal: 10,
                  }}
                  textStyle={{ color: "#000" }}
                />
              </>
            )}
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </VStack>
  );
};

const OrderTransactionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const initialTab = (route.params?.initialTab || "PENDING").toUpperCase();
  const insets = useSafeAreaInsets();
  const [ordersData, setOrdersData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    let userId = null;
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        userId = JSON.parse(storedUser).id;
      }
    } catch (error) {
      console.error("Error retrieving user from storage:", error);
    }

    if (!userId) {
      setOrdersData({});
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.254.105:3000/api/mobile/orders/get-orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrdersData(data.orders || {});
      } else {
        console.error("Failed to fetch orders, status code:", response.status);
        setOrdersData({});
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrdersData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          paddingTop: insets.top,
        }}
      >
        <LoadingSpinner size={300} messages="Loading orders..." visible={true} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top - 20,
        paddingBottom: insets.bottom,
        backgroundColor: "#000",
      }}
      edges={["top", "left", "right"]}
    >
      <VStack flex={1}>
        <HStack
          alignItems="center"
          space={2}
          mb={2}
          px={4}
          style={{ paddingTop: 10 }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ padding: 4 }}
            android_ripple={{
              color: "rgba(255, 255, 255, 0.3)",
              radius: 20,
              borderless: true,
            }}
            accessibilityLabel="Go back"
          >
            <ArrowLeft color="#FFF" size={24} />
          </Pressable>
          <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}>
            Order Transaction
          </Text>
        </HStack>
        <Tab.Navigator
          initialRouteName={initialTab}
          screenOptions={{
            tabBarIndicatorStyle: { backgroundColor: "#FFF" },
            tabBarStyle: { backgroundColor: "#000" },
            tabBarLabelStyle: { fontWeight: "bold", color: "#FFF" },
            tabBarPressColor: "rgba(255, 255, 255, 0.2)",
            tabBarScrollEnabled: true,
          }}
        >
          <Tab.Screen
            name="PENDING"
            children={() => (
              <OrderList
                status="PENDING"
                ordersData={ordersData}
                refreshOrders={fetchOrders}
              />
            )}
          />
          <Tab.Screen
            name="PROCESSING"
            children={() => (
              <OrderList status="PROCESSING" ordersData={ordersData} refreshOrders={fetchOrders} />
            )}
          />
          <Tab.Screen
            name="DELIVERING"
            children={() => (
              <OrderList status="DELIVERING" ordersData={ordersData} />
            )}
          />
          <Tab.Screen
            name="RESERVED"
            children={() => (
              <OrderList status="RESERVED" ordersData={ordersData} />
            )}
          />
        </Tab.Navigator>
      </VStack>
    </SafeAreaView>
  );
};

export default OrderTransactionScreen;
