// screens/NotificationScreen.tsx
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Box, Text, VStack, HStack, IconButton, Icon, Spinner } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import GradientCard from '../../components/GradientCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { EXPO_PUBLIC_API_URL } from "@env";

type Notification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

type NotificationScreenProps = {
  navigation: any; // Replace with specific navigation type if available
};

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Retrieve user from AsyncStorage
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
        // Post to your API to fetch notifications filtered by userId
        const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/notification/get-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
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

  return (
    <BackgroundProvider>
      <VStack flex={1}>
        {/* Header with Back Button and Title */}
        <HStack alignItems="center" mt={10} justifyContent="space-between" padding={4}>
          <IconButton
            icon={<Icon as={ArrowLeft} color="white" size={24} />}
            onPress={() => navigation.goBack()}
          />
          <Text color="white" fontSize="xl" fontWeight="bold">
            Notifications
          </Text>
        </HStack>

        {loading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <Spinner color="white" size="lg" />
          </Box>
        ) : (
          <GradientCard padding={4} marginX={4}>
            {notifications.slice(0, 5).map((notif) => (
              <HStack key={notif.id} alignItems="center" space={3} mt={4}>
                {/* Notification Icon */}
                <Icon as={<Bell size={24} />} color="white" />
                {/* Notification Content */}
                <VStack flex={1}>
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {notif.title}
                  </Text>
                  <Text color="gray.300" fontSize="sm" isTruncated>
                    {notif.message}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </GradientCard>
        )}
      </VStack>
    </BackgroundProvider>
  );
};

export default NotificationScreen;
