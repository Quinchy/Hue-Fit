import React, { useState, useEffect } from "react";
import {
  FlatList,
  Pressable,
  View,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import { Store, ArrowLeft, Loader, X } from "lucide-react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { VStack, Text, Box, HStack, Modal, Select } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomInput from "../../components/Input";
import DefaultButton from "../../components/Button";
import OutlineButton from "../../components/OutlineButton";
import LoadingSpinner from "../../components/Loading";
import { EXPO_PUBLIC_API_URL } from "@env";

const Tab = createMaterialTopTabNavigator();

const OrderList = ({ status, ordersData, refreshOrders }) => {
  const orders = ordersData[status] || [];
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // For PROCESSING orders cancellation reason state.
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  // State to indicate cancellation submission in progress
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Define the color mapping
  const statusColors = {
    PENDING: "#60A5FA",
    PROCESSING: "#F59E0B",
    DELIVERING: "#A78BFA",
    RESERVED: "#e60076",
    COMPLETED: "#7BE24A",
    CANCELLED: "#E24A4A",
  };

  // Cancellation reasons for PROCESSING orders.
  const cancellationReasons = [
    "Not Interested anymore.",
    "Wrong color/size selected.",
    "Other",
  ];

  const handleCancelOrder = async () => {
    setCancelSubmitting(true);
    // For PROCESSING orders, build the cancellation message; otherwise, leave empty.
    const cancellationMessage =
      selectedOrder?.status === "PROCESSING"
        ? cancelReason === "Other"
          ? customReason
          : cancelReason
        : "";
    try {
      const response = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/orders/cancel-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: selectedOrder.id,
            askingForCancellation: true,
            cancellationMessage: cancellationMessage,
          }),
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
      Alert.alert("Error", "An error occurred while requesting cancellation");
    } finally {
      setCancelSubmitting(false);
      setCancelModalVisible(false);
      setSelectedOrder(null);
      setCancelReason("");
      setCustomReason("");
    }
  };

  const renderOrderItem = ({ item }) => (
    <Box
      style={{
        backgroundColor: "#191919",
        padding: 15,
        marginHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#C0C0C025",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 15,
      }}
    >
      <Text
        style={{
          marginBottom: 5,
          alignSelf: "flex-start",
          fontSize: 16,
          fontWeight: "bold",
          color: "#FFF",
          backgroundColor: "#C0C0C025",
          padding: 5,
          borderRadius: 4,
        }}
      >
        {item.orderNo}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {/* Left part: Icon and shop name */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Store width={20} height={20} strokeWidth={1.5} color="#FFF" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#FFF",
              marginLeft: 5,
            }}
          >
            {item.shopName}
          </Text>
        </View>
        {/* Right part: Order status */}
        <Text
          style={{
            fontSize: 14,
            color: "#FFF",
            backgroundColor: statusColors[item.status] || "#191919",
            padding: 5,
            borderRadius: 4,
            minWidth: 85,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {item.status}
        </Text>
      </View>
      {item.orderItems.map((orderItem, index) => (
        <Box
          key={index}
          style={{
            marginBottom: 10,
            paddingLeft: 10,
            borderLeftWidth: 1,
            borderLeftColor: "#C0C0C025",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Product thumbnail */}
          <Image
            source={{ uri: orderItem.thumbnailURL }}
            style={{
              width: 75,
              height: 75,
              marginRight: 10,
              borderRadius: 4,
            }}
          />
          {/* Order item details */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: "#FFF" }}>
              {orderItem.productName}
            </Text>
            <Text style={{ fontSize: 12, color: "#AAA" }}>
              Color: {orderItem.productVariantColorName} | Size:{" "}
              {orderItem.productVariantSizeName}
            </Text>
            <Text style={{ fontSize: 12, color: "#AAA" }}>
              Price: PHP {orderItem.productVariantPrice} | Quantity:{" "}
              {orderItem.quantity}
            </Text>
          </View>
        </Box>
      ))}
      <View
        style={{
          marginTop: 10,
          marginBottom: 20,
          padding: 10,
          borderRadius: 4,
        }}
      >
        {/* Item Total */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, color: "#FFF", fontWeight: "bold" }}>
            Item Total Prices: PHP {item.orderTotal}
          </Text>
        </View>
        {/* Delivery Fee */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 14, color: "#FFF", fontWeight: "bold" }}>
            Delivery Fee: PHP {item.deliveryFee}
          </Text>
        </View>
        {/* Total Payment */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: 8,
            paddingTop: 4,
            borderTopWidth: 1,
            borderTopColor: "#C0C0C025",
          }}
        >
          <Text style={{ fontSize: 14, color: "#FFF", fontWeight: "bold" }}>
            Total ammount: PHP {item.finalTotal}
          </Text>
        </View>
      </View>
      {(item.status === "PENDING" ||
        item.status === "PROCESSING" ||
        item.status === "RESERVED") &&
        (item.status === "PROCESSING" && item.askingForCancel ? (
          <Pressable
            disabled
            style={{
              minWidth: 150,
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "#C0C0C050",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 4,
              marginTop: 8,
              alignSelf: "flex-end",
            }}
          >
            <Text
              style={{
                color: "#C0C0C050",
                fontSize: 14,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Cancellation in Progress
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              setSelectedOrder(item);
              setCancelModalVisible(true);
            }}
            android_ripple={{
              color: "rgba(255, 255, 255, 0)",
              radius: 20,
              borderless: true,
            }}
            style={{
              minWidth: 150,
              backgroundColor: "#FFF",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 4,
              marginTop: 8,
              alignSelf: "flex-end",
            }}
          >
            <Text
              style={{
                color: "#191919",
                fontSize: 14,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Cancel Order
            </Text>
          </Pressable>
        ))}
    </Box>
  );

  return (
    <VStack flex={1} style={{ backgroundColor: "#191919" }}>
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={{ paddingVertical: 15 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refreshOrders}
              tintColor="#FFF"
            />
          }
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#4E4E4E",
              textAlign: "center",
              marginTop: -150,
            }}
          >
            You have no {status} Orders
          </Text>
        </View>
      )}

      <Modal
        isOpen={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
      >
        <Modal.Content
          maxWidth="400px"
          style={{
            backgroundColor: "#191919",
            borderRadius: 10,
          }}
        >
          {/* Custom Modal Header with Exit Icon */}
          <Modal.Header
            style={{
              backgroundColor: "#191919",
              borderBottomWidth: 1,
              borderColor: "#C0C0C025",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: 10,
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
              Cancel Order
            </Text>
            <Pressable
              onPress={() => setCancelModalVisible(false)}
              style={({ pressed }) => [
                {
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  justifyContent: "center",
                  alignItems: "center",
                },
                pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
              ]}
              android_ripple={{
                color: "rgba(255,255,255,0.1)",
                borderless: true,
                radius: 15,
              }}
            >
              <X size={20} color="#FFF" />
            </Pressable>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: "#191919" }}>
            {selectedOrder && selectedOrder.status === "PROCESSING" ? (
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
                  placeholder="Select a reason"
                  selectedValue={cancelReason}
                  onValueChange={(value) => setCancelReason(value)}
                  mt={2}
                  bg="#191919"
                  color="#FFF"
                  borderWidth={1}
                  borderColor="#4E4E4E"
                  _actionSheetContent={{
                    backgroundColor: "#191919",
                    borderRadius: "lg",
                  }}
                  _selectedItem={{
                    borderRadius: "md",
                  }}
                  _item={
                    {
                      bg: "#191919",
                      my: 0.5,
                      _text: {
                        color: "#FFF",
                      },
                      _pressed: {
                        bg: "#4E4E4E",
                        borderRadius: "md",
                      },
                    }
                  }
                  _selectedItem={{ bg: "#4E4E4E" }}
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
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "semibold",
                  color: "#FFFFFF75",
                  marginBottom: 8,
                }}
              >
                Are you sure you want to cancel this order?
              </Text>
            )}
          </Modal.Body>
          <Modal.Footer
            style={{
              justifyContent: "center",
              backgroundColor: "#191919",
              borderTopWidth: 1,
              borderColor: "#C0C0C025",
            }}
          >
            {selectedOrder &&
            (selectedOrder.status === "PENDING" ||
              selectedOrder.status === "RESERVED") ? (
              <>
                <DefaultButton
                  title={cancelSubmitting ? "" : "Yes"}
                  onPress={handleCancelOrder}
                  disabled={cancelSubmitting}
                  style={{
                    backgroundColor: "#FFF",
                    marginHorizontal: 10,
                    marginBottom: 10,
                  }}
                  textStyle={{ color: "#191919" }}
                >
                  {cancelSubmitting && <Loader size={20} color="#191919" />}
                </DefaultButton>
                <OutlineButton
                  title="No"
                  onPress={() => setCancelModalVisible(false)}
                  disabled={cancelSubmitting}
                  style={{
                    marginHorizontal: 10,
                    width: "100%",
                  }}
                />
              </>
            ) : (
              <>
                <DefaultButton
                  title={cancelSubmitting ? "" : "Confirm"}
                  onPress={handleCancelOrder}
                  disabled={cancelSubmitting}
                  style={{
                    backgroundColor: "#FFF",
                    marginHorizontal: 10,
                    marginBottom: 10,
                  }}
                  textStyle={{ color: "#191919" }}
                >
                  {cancelSubmitting && <Loader size={20} color="#191919" />}
                </DefaultButton>
                <OutlineButton
                  title="Cancel"
                  onPress={() => setCancelModalVisible(false)}
                  disabled={cancelSubmitting}
                  style={{
                    width: "100%",
                  }}
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
        `${EXPO_PUBLIC_API_URL}/api/mobile/orders/get-orders`,
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
          backgroundColor: "#191919",
          paddingTop: insets.top,
        }}
      >
        <LoadingSpinner
          size={300}
          messages="Loading orders..."
          visible={true}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top - 20,
        paddingBottom: insets.bottom,
        backgroundColor: "#191919",
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
            style={() => [
              {
                padding: 4,
                borderRadius: 25,
              }
            ]}
            android_ripple={{
              color: "rgba(255,255,255,0.1)",
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
            tabBarStyle: { backgroundColor: "#191919" },
            tabBarLabelStyle: { fontWeight: "bold", color: "#FFF" },
            tabBarPressColor: "rgba(255, 255, 255, 0.1)",
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
              <OrderList
                status="PROCESSING"
                ordersData={ordersData}
                refreshOrders={fetchOrders}
              />
            )}
          />
          <Tab.Screen
            name="DELIVERING"
            children={() => (
              <OrderList
                status="DELIVERING"
                ordersData={ordersData}
                refreshOrders={fetchOrders}
              />
            )}
          />
          <Tab.Screen
            name="RESERVED"
            children={() => (
              <OrderList
                status="RESERVED"
                ordersData={ordersData}
                refreshOrders={fetchOrders}
              />
            )}
          />
        </Tab.Navigator>
      </VStack>
    </SafeAreaView>
  );
};

export default OrderTransactionScreen;
