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
import { useTheme, applyOpacity } from "../../providers/ThemeProvider";

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
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
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
      {/* Set the overall background to transparent */}
      <SafeAreaView style={[styles.safeArea, { backgroundColor: "transparent" }]}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
            My Profile
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Notification")}
            style={({ pressed }) => [
              styles.notificationIcon,
              pressed && { backgroundColor: applyOpacity(theme.colors.white, 0.1) },
            ]}
          >
            <Bell size={25} color={theme.colors.white} />
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
            <Text style={[styles.name, { color: theme.colors.white }]}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={[styles.username, { color: theme.colors.greyWhite }]}>
              @{userData.username}
            </Text>
          </View>
        )}

        {/* Order Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(({ name, icon: IconComponent }) => (
            <Pressable
              key={name}
              onPress={() => handleNavigate(name)}
              style={({ pressed }) => [
                styles.tab,
                { backgroundColor: theme.colors.darkGrey },
                pressed && { backgroundColor: applyOpacity(theme.colors.darkGrey, 0.8) },
              ]}
            >
              <IconComponent size={24} stroke={theme.colors.white} strokeWidth={2} />
              <Text style={[styles.tabText, { color: theme.colors.white }]}>{name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Settings Options using AnimatedPressable */}
        <GradientCard style={[styles.settingsCard, { backgroundColor: theme.colors.darkGrey }]}>
          <AnimatedPressable
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.menuItem}
          >
            <Pencil size={24} stroke={theme.colors.white} strokeWidth={2} />
            <Text style={[styles.menuText, { color: theme.colors.white }]}>
              Edit Profile
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => navigation.navigate("OrderHistory")}
            style={styles.menuItem}
          >
            <Archive size={24} stroke={theme.colors.white} strokeWidth={2} />
            <Text style={[styles.menuText, { color: theme.colors.white }]}>
              Order History
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => navigation.navigate("GeneratedOutfitList")}
            style={styles.menuItem}
          >
            <Shirt size={24} stroke={theme.colors.white} strokeWidth={2} />
            <Text style={[styles.menuText, { color: theme.colors.white }]}>
              Generated Outfits
            </Text>
          </AnimatedPressable>
          <AnimatedPressable onPress={handleLogout} style={styles.menuItem}>
            <LogOut size={24} stroke={theme.colors.white} strokeWidth={2} />
            <Text style={[styles.menuText, { color: theme.colors.white }]}>
              Log Out
            </Text>
          </AnimatedPressable>
        </GradientCard>
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
    paddingHorizontal: 25,
    marginTop: 40,
    marginBottom: 15,
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
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
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
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  tab: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  tabText: {
    marginTop: 8,
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
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 14,
  },
});

export default ProfileSettingsScreen;
