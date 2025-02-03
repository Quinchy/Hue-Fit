// OrderTransactionScreen.js
import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, Pressable, ActivityIndicator, View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { VStack, Text, Box, HStack } from "native-base";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createMaterialTopTabNavigator();

const OrderList = ({ status, ordersData }) => {
  const orders = ordersData[status] || [];
  return (
    <VStack flex={1} p={4} style={{ backgroundColor: "#2E2E2E" }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Box style={styles.card}>
            <Text style={styles.orderNo}>Order No: {item.orderNo}</Text>
            {item.orderItems.map((orderItem, index) => (
              <Box key={index} style={styles.orderItem}>
                <Text style={styles.productName}>{orderItem.productName}</Text>
                <Text style={styles.detail}>
                  Color: {orderItem.productVariantColorName} | Size: {orderItem.productVariantSizeName}
                </Text>
                <Text style={styles.detail}>
                  Price: ${orderItem.productVariantPrice} | Quantity: {orderItem.quantity}
                </Text>
              </Box>
            ))}
            <Text style={styles.status}>{item.status}</Text>
          </Box>
        )}
      />
    </VStack>
  );
};

const OrderTransactionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // Convert initialTab to uppercase to match the screen names.
  const initialTab = (route.params?.initialTab || "PROCESSING").toUpperCase();
  const insets = useSafeAreaInsets();
  const [ordersData, setOrdersData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        const response = await fetch("http://192.168.254.105:3000/api/mobile/orders/get-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          // Expecting an object with an "orders" key
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

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top - 20,
          paddingBottom: insets.bottom,
          backgroundColor: "#191919",
        },
      ]}
      edges={["top", "left", "right"]}
    >
      <VStack flex={1}>
        <HStack alignItems="center" space={2} mb={2} px={4}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            android_ripple={{
              color: "rgba(255, 255, 255, 0.3)",
              radius: 20,
              borderless: true,
            }}
            accessibilityLabel="Go back"
          >
            <ArrowLeft color="#FFF" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Transaction</Text>
        </HStack>
        <Tab.Navigator
          initialRouteName={initialTab}
          screenOptions={{
            tabBarIndicatorStyle: { backgroundColor: "#FFF" },
            tabBarStyle: { backgroundColor: "#191919" },
            tabBarLabelStyle: { fontWeight: "bold", color: "#FFF" },
            tabBarPressColor: "rgba(255, 255, 255, 0.2)",
            // Enable scrolling for the tab bar
            tabBarScrollEnabled: true,
          }}
        >
          <Tab.Screen
            name="PROCESSING"
            children={() => <OrderList status="PROCESSING" ordersData={ordersData} />}
          />
          <Tab.Screen
            name="PACKAGING"
            children={() => <OrderList status="PACKAGING" ordersData={ordersData} />}
          />
          <Tab.Screen
            name="DELIVERING"
            children={() => <OrderList status="DELIVERING" ordersData={ordersData} />}
          />
          <Tab.Screen
            name="RESERVED"
            children={() => <OrderList status="RESERVED" ordersData={ordersData} />}
          />
        </Tab.Navigator>
      </VStack>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  card: {
    backgroundColor: "#191919",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  orderNo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  orderItem: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#FFF",
  },
  productName: {
    fontSize: 14,
    color: "#FFF",
  },
  detail: {
    fontSize: 12,
    color: "#AAA",
  },
  status: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#191919",
  },
});

export default OrderTransactionScreen;
