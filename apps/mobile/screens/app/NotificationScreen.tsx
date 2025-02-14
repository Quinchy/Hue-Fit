// File: screens/NotificationScreen.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView, FlatList, Pressable } from "react-native";
import { VStack, Text, HStack, Box, Spinner } from "native-base";
import { ArrowLeft, ArrowRight, Bell } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackgroundProvider from "../../providers/BackgroundProvider";
import { EXPO_PUBLIC_API_URL } from "@env";

type Notification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

type NotificationScreenProps = {
  navigation: any; // Replace with your specific navigation type if available
};

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        let userId: number | undefined;
        if (storedUser) {
          userId = JSON.parse(storedUser).id;
        }
        if (!userId) {
          console.warn("No user data found in AsyncStorage");
          setLoading(false);
          return;
        }
        const response = await fetch(
          `${EXPO_PUBLIC_API_URL}/api/mobile/notification/get-notification`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          // Assumes API returns { notifications: [...] }
          setNotifications(data.notifications);
        } else {
          console.error("Error fetching notifications:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderNotification = ({ item }: { item: Notification }) => (
    <Pressable
      onPress={() =>
        navigation.navigate("ViewNotification", {
          notifId: item.id,
          title: item.title,
          message: item.message,
        })
      }
      style={({ pressed }) => [
        { backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "transparent" },
      ]}
    >
      <HStack
        alignItems="center"
        space={3}
        mt={4}
        px={4}
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#444",
          paddingBottom: 8,
        }}
      >
        <Bell size={24} color="#FFF" />
        <VStack flex={1}>
          <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>
            {item.title}
          </Text>
          <Text style={{ color: "#AAA", fontSize: 14 }} numberOfLines={1}>
            {item.message}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Determine the notifications for the current page
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <BackgroundProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#191919",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        edges={["top", "left", "right"]}
      >
        <VStack flex={1}>
          {/* Header */}
          <HStack
            alignItems="center"
            space={2}
            mb={2}
            px={4}
            style={{ paddingTop: 10 }}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                { padding: 4, borderRadius: 100 },
                pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
              ]}
              accessibilityLabel="Go back"
            >
              <ArrowLeft color="#FFF" size={24} />
            </Pressable>
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}>
              Notifications
            </Text>
          </HStack>

          {/* Content */}
          {loading ? (
            <Box flex={1} justifyContent="center" alignItems="center">
              <Spinner color="white" size="lg" />
            </Box>
          ) : (
            <>
              <FlatList
                data={paginatedNotifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNotification}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  <Box
                    flex={1}
                    justifyContent="center"
                    alignItems="center"
                    mt={10}
                  >
                    <Text style={{ color: "#FFF", fontSize: 16 }}>
                      No notifications found.
                    </Text>
                  </Box>
                }
              />
              {notifications.length > itemsPerPage && (
                <HStack
                  justifyContent="flex-end"
                  alignItems="center"
                  mt={4}
                  mb={4}
                  space={4}
                  px={4}
                >
                  {currentPage > 1 && (
                    <Pressable
                      onPress={handlePrevPage}
                      style={({ pressed }) => [
                        { padding: 8, borderRadius: 100 },
                        pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
                      ]}
                    >
                      <ArrowLeft color="#FFF" size={24} />
                    </Pressable>
                  )}
                  <Text style={{ color: "#FFF" }}>
                    {currentPage} / {totalPages}
                  </Text>
                  {currentPage < totalPages && (
                    <Pressable
                      onPress={handleNextPage}
                      style={({ pressed }) => [
                        { padding: 8, borderRadius: 100 },
                        pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
                      ]}
                    >
                      <ArrowRight color="#FFF" size={24} />
                    </Pressable>
                  )}
                </HStack>
              )}
            </>
          )}
        </VStack>
      </SafeAreaView>
    </BackgroundProvider>
  );
};

export default NotificationScreen;
