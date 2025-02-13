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

// AnimatedPressable for settings options with ease in/out animations.
const AnimatedPressable = ({ children, style, onPress, ...props }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  const animatedStyle = {
    backgroundColor: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(255,255,255,0.1)"],
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
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      }
    })();
  }, []);

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

  const tabs = [
    { name: "Pending", icon: MonitorCog },
    { name: "Processing", icon: Package },
    { name: "Delivering", icon: Truck },
  ];

  const handleNavigate = (tabName) => {
    navigation.navigate("OrderTransactionScreen", { initialTab: tabName });
  };

  return (
    <BackgroundProvider>
      <SafeAreaView style={styles.safeArea}>
        {/* New Header Row: "My Profile" left-aligned and Notification icon on right */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Pressable
            onPress={() => navigation.navigate("Notification")}
            style={({ pressed }) => [
              styles.notificationIcon,
              pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
            ]}
          >
            <Bell size={25} color="white" />
          </Pressable>
        </View>

        {userData && (
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
            <Text style={styles.name}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.username}>@{userData.username}</Text>
          </View>
        )}

        {/* Order Tabs remain unchanged */}
        <View style={styles.tabsContainer}>
          {tabs.map(({ name, icon: IconComponent }) => (
            <Pressable
              key={name}
              onPress={() => handleNavigate(name)}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              <IconComponent size={24} stroke="white" strokeWidth={2} />
              <Text style={styles.tabText}>{name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Settings Options using AnimatedPressable for smooth ease in/out */}
        <GradientCard style={styles.settingsCard}>
          <AnimatedPressable
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.menuItem}
          >
            <Pencil size={24} stroke="white" strokeWidth={2} />
            <Text style={styles.menuText}>Edit Profile</Text>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => navigation.navigate("OrderHistory")}
            style={styles.menuItem}
          >
            <Archive size={24} stroke="white" strokeWidth={2} />
            <Text style={styles.menuText}>Order History</Text>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => navigation.navigate("GeneratedOutfits")}
            style={styles.menuItem}
          >
            <Shirt size={24} stroke="white" strokeWidth={2} />
            <Text style={styles.menuText}>Generated Outfits</Text>
          </AnimatedPressable>
          <AnimatedPressable onPress={handleLogout} style={styles.menuItem}>
            <LogOut size={24} stroke="white" strokeWidth={2} />
            <Text style={styles.menuText}>Log Out</Text>
          </AnimatedPressable>
        </GradientCard>
      </SafeAreaView>
    </BackgroundProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginTop: 40,
    marginBottom: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  notificationIcon: {
    padding: 8,
    borderRadius: 25,
  },
  userInfoContainer: { alignItems: "center", marginBottom: 30 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { color: "white", fontSize: 18, fontWeight: "bold" },
  username: { color: "gray", fontSize: 14, marginTop: 4 },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  tab: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  tabPressed: { backgroundColor: "#444" },
  tabText: { color: "white", marginTop: 8, fontSize: 14 },
  settingsCard: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#222",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  menuText: { color: "white", fontSize: 16, marginLeft: 14 },
});

export default ProfileSettingsScreen;
