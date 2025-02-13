import React, { useState, useEffect } from "react";
import { FlatList, Pressable, View, Alert, Image } from "react-native";
import { Store } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { VStack, Text, Box, HStack } from "native-base";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingSpinner from "../../components/Loading";

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define status color mapping for COMPLETED and CANCELLED orders.
  const statusColors = {
    COMPLETED: "#34D399", // bg-green-400
    CANCELLED: "#EF4444", // bg-red-500
  };

  const fetchCompletedOrders = async () => {
    let userId = null;
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        userId = JSON.parse(storedUser).id;
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
    }

    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.254.105:3000/api/mobile/orders/get-completed-orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch completed orders, status:", response.status);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
        <LoadingSpinner size={300} messages="Loading completed orders..." visible={true} />
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
            Order History
          </Text>
        </HStack>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
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
              }}
            >
              {/* Order number */}
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
              {/* Shop info row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
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
                <Text
                  style={{
                    fontSize: 14,
                    color: "#FFF",
                    backgroundColor: statusColors[item.status] || "#000",
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
              {/* Order items */}
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
                  <Image
                    source={{ uri: orderItem.thumbnailURL }}
                    style={{
                      width: 75,
                      height: 75,
                      marginRight: 10,
                      borderRadius: 4,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: "#FFF" }}>
                      {orderItem.productName}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#AAA" }}>
                      Color: {orderItem.productVariantColorName} | Size: {orderItem.productVariantSizeName}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#AAA" }}>
                      Price: PHP {orderItem.productVariantPrice} | Quantity: {orderItem.quantity}
                    </Text>
                  </View>
                </Box>
              ))}
              {/* Pricing breakdown */}
              <View
                style={{
                  marginTop: 10,
                  marginBottom: 20,
                  padding: 10,
                  borderRadius: 4,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, color: "#FFF", fontWeight: "bold" }}>
                    Item Total: PHP {item.orderTotal}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 4 }}
                >
                  <Text style={{ fontSize: 14, color: "#FFF", fontWeight: "bold" }}>
                    Delivery Fee: PHP {item.deliveryFee}
                  </Text>
                </View>
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
                    Total Payment: PHP {item.finalTotal}
                  </Text>
                </View>
              </View>
            </Box>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
          contentContainerStyle={{ paddingVertical: 15 }}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;
