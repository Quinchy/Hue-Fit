import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  Pressable,
  Image,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  ScrollView,
  RefreshControl,
} from "react-native";
import {
  Archive,
  MonitorCog,
  Package,
  Truck,
  Shirt,
  LogOut,
  Pencil,
  Bell,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import BackgroundProvider from "../../providers/BackgroundProvider";
import GradientCard from "../../components/GradientCard";
import { useTheme, applyOpacity } from "../../providers/ThemeProvider";
import { EXPO_PUBLIC_API_URL } from "@env";

// AnimatedPressable for settings options with ease in/out animations.
const AnimatedPressable = ({ children, style, onPress, ...props }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  const animatedStyle = {
    backgroundColor: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", applyOpacity("#ffffff", 0.1)],
    }),
  };

  const handlePressIn = () => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      {...props}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch user data from the API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        const response = await fetch(
          `${EXPO_PUBLIC_API_URL}/api/mobile/profile/get-user`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: storedUserId }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Failed to fetch user data");
        }
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Refresh handler for pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Updated tabs array with 4 tabs, including "Reserved"
  const tabs = [
    { name: "Pending", icon: MonitorCog },
    { name: "Processing", icon: Package },
    { name: "Delivering", icon: Truck },
    { name: "Reserved", icon: Archive },
  ];

  // Navigate to Reserved screen or OrderTransactionScreen based on tab name
  const handleNavigate = (tabName) => {
    navigation.navigate("OrderTransactionScreen", { initialTab: tabName });
  };

  return (
    <BackgroundProvider>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: "transparent" }]}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.white}
            />
          }
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
              My Profile
            </Text>
            <Pressable
              onPress={() => navigation.navigate("Notification")}
              style={({ pressed }) => [
                styles.notificationIcon,
                pressed && {
                  backgroundColor: applyOpacity(theme.colors.white, 0.1),
                },
              ]}
            >
              <Bell size={25} color={theme.colors.white} />
            </Pressable>
          </View>

          {/* Profile Section */}
          {loading ? (
            <View style={styles.userInfoContainer}>
              <View style={[styles.profileImage, styles.skeleton]} />
              <View
                style={[
                  styles.skeletonBar,
                  { width: 140, height: 20, marginTop: 3 },
                ]}
              />
              <View
                style={[
                  styles.skeletonBar,
                  { width: 100, height: 14, marginTop: 4 },
                ]}
              />
            </View>
          ) : (
            userData && (
              <View style={styles.userInfoContainer}>
                <Image
                  source={
                    userData.profilePicture
                      ? { uri: userData.profilePicture }
                      : require("../../assets/placeholder-profile-picture.png")
                  }
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <Text style={[styles.name, { color: theme.colors.white }]}>
                  {userData.firstName} {userData.lastName}
                </Text>
                <Text
                  style={[styles.username, { color: theme.colors.greyWhite }]}
                >
                  @{userData.username}
                </Text>
              </View>
            )
          )}

          {/* Tabs Section */}
          <View style={styles.tabsContainer}>
            {tabs.map(({ name, icon: IconComponent }) => (
              <Pressable
                key={name}
                onPress={() => handleNavigate(name)}
                style={({ pressed }) => [
                  styles.tab,
                  { backgroundColor: theme.colors.darkGrey },
                  pressed && {
                    backgroundColor: applyOpacity(theme.colors.darkGrey, 0.8),
                  },
                ]}
              >
                <IconComponent
                  size={20}
                  stroke={theme.colors.white}
                  strokeWidth={2}
                />
                <Text style={[styles.tabText, { color: theme.colors.white }]}>
                  {name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Settings Options */}
          <GradientCard
            style={[
              styles.settingsCard,
              { backgroundColor: theme.colors.darkGrey },
            ]}
          >
            <AnimatedPressable
              onPress={() => navigation.navigate("EditProfile")}
              style={styles.menuItem}
            >
              <Pencil size={15} stroke={theme.colors.white} strokeWidth={2} />
              <Text style={[styles.menuText, { color: theme.colors.white }]}>
                Edit Profile
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => navigation.navigate("OrderHistory")}
              style={styles.menuItem}
            >
              <Archive size={15} stroke={theme.colors.white} strokeWidth={2} />
              <Text style={[styles.menuText, { color: theme.colors.white }]}>
                Order History
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => navigation.navigate("GeneratedOutfitList")}
              style={styles.menuItem}
            >
              <Shirt size={15} stroke={theme.colors.white} strokeWidth={2} />
              <Text style={[styles.menuText, { color: theme.colors.white }]}>
                Generated Outfits
              </Text>
            </AnimatedPressable>
            <AnimatedPressable onPress={handleLogout} style={styles.menuItem}>
              <LogOut size={15} stroke={theme.colors.white} strokeWidth={2} />
              <Text style={[styles.menuText, { color: theme.colors.white }]}>
                Log Out
              </Text>
            </AnimatedPressable>
          </GradientCard>
        </ScrollView>
      </SafeAreaView>
    </BackgroundProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 50,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  notificationIcon: {
    padding: 8,
    borderRadius: 25,
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontSize: 14,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  tabText: {
    marginTop: 5,
    fontSize: 14,
  },
  settingsCard: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 2,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 14,
  },
  // Skeleton placeholder styles
  skeleton: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  skeletonBar: {
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

export default ProfileSettingsScreen;
