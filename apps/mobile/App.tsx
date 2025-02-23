// App.js
import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, ImageBackground, View, Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider, extendTheme } from "native-base";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Home, Store, ShoppingCart, User } from "lucide-react-native";
import * as NavigationBar from "expo-navigation-bar";
import * as Font from "expo-font";
import LoadingSpinner from "./components/Loading";
import OpenAiLogoRainbow from "./assets/icons/OpenAiLogoRainbow.svg";

// Screens (imports remain unchanged)
import LoginScreen from "./screens/account/LoginScreen";
import RegisterScreen from "./screens/account/RegisterScreen";
import Register2Screen from "./screens/account/Register2Screen";
import Register3Screen from "./screens/account/Register3Screen";
import ForgotPasswordScreen from "./screens/account/ForgotPasswordScreen";
import CartScreen from "./screens/app/CartScreen";
import VirtualFittingScreen from "./screens/app/VirtualFittingScreen";
import AiTryOnScreen from "./screens/app/AiTryOnScreen";
import EditProfileScreen from "./screens/app/EditProfileScreen";
import ShopScreen from "./screens/app/ShopScreen";
import ProfileSettingsScreen from "./screens/app/ProfileSettingsScreen";
import OrderTransactionScreen from "./screens/app/OrderTransactionScreen";
import OrderHistoryScreen from "./screens/app/OrderHistoryScreen";
import InputScreen from "./screens/app/InputScreen";
import ProductView from "./screens/app/ProductViewScreen";
import PlaygroundScreen from "./screens/app/PlaygroundScreen";
import NotificationScreen from "./screens/app/NotificationScreen";
import ViewNotificationScreen from "./screens/app/ViewNotificationScreen";
import ArTryOnScreen from "./screens/app/ArTryOnScreen";
import GeneratedOutfitListScreen from "./screens/app/GeneratedOutfitListScreen";
import GeneratedOutfitViewScreen from "./screens/app/GeneratedOutfitViewScreen";

// Load Geist Fonts
const loadFonts = async () => {
  await Font.loadAsync({
    GeistBlack: require("./assets/fonts/Geist-Black.ttf"),
    GeistBold: require("./assets/fonts/Geist-Bold.ttf"),
    GeistExtraBold: require("./assets/fonts/Geist-ExtraBold.ttf"),
    GeistExtraLight: require("./assets/fonts/Geist-ExtraLight.ttf"),
    GeistLight: require("./assets/fonts/Geist-Light.ttf"),
    GeistMedium: require("./assets/fonts/Geist-Medium.ttf"),
    GeistRegular: require("./assets/fonts/Geist-Regular.ttf"),
    GeistSemiBold: require("./assets/fonts/Geist-SemiBold.ttf"),
    GeistThin: require("./assets/fonts/Geist-Thin.ttf"),
  });
};

// Extend NativeBase Theme
const nbTheme = extendTheme({
  fonts: {
    heading: "GeistBold",
    body: "GeistRegular",
    mono: "GeistMedium",
  },
  fontConfig: {
    Geist: {
      100: "GeistThin",
      200: "GeistExtraLight",
      300: "GeistLight",
      400: "GeistRegular",
      500: "GeistMedium",
      600: "GeistSemiBold",
      700: "GeistBold",
      800: "GeistExtraBold",
      900: "GeistBlack",
    },
  },
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const InputStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Input" component={InputScreen} />
    <Stack.Screen name="Playground" component={PlaygroundScreen} />
  </Stack.Navigator>
);

// Import your custom theme hooks and opacity helper
import { useTheme, applyOpacity, ThemeProvider as CustomThemeProvider } from "./providers/ThemeProvider";

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.floatingTabBarContainer, { backgroundColor: theme.colors.dark }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        let Icon = null;

        if (route.name === "Shops") Icon = Store;
        else if (route.name === "Cart") Icon = ShoppingCart;
        else if (route.name === "Profile") Icon = User;
        else if (route.name === "InputStack") Icon = OpenAiLogoRainbow;

        return (
          <View key={route.name} style={styles.rippleContainer}>
            <Pressable
              onPress={() => {
                if (!isFocused) navigation.navigate(route.name);
              }}
              android_ripple={{
                color: applyOpacity(theme.colors.white, 0.2),
                radius: 25,
                borderless: false,
              }}
              style={styles.iconPressable}
            >
              {isFocused ? (
                <View style={[styles.iconCircle, { backgroundColor: applyOpacity(theme.colors.white, 0.1) }]}>
                  {Icon && route.name === "InputStack" ? (
                    <Icon width={24} height={24} strokeWidth={1} color={theme.colors.white} />
                  ) : (
                    Icon && <Icon size={24} strokeWidth={1.5} color={theme.colors.white} />
                  )}
                </View>
              ) : (
                Icon && route.name === "InputStack" ? (
                  <Icon width={24} height={24} strokeWidth={1} color={theme.colors.greyWhite} />
                ) : (
                  Icon && <Icon size={24} strokeWidth={1.5} color={theme.colors.greyWhite} />
                )
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Shops" component={ShopScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Profile" component={ProfileSettingsScreen} />
    <Tab.Screen name="InputStack" component={InputStack} />
  </Tab.Navigator>
);

const AppNavigator = ({ initialRoute }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Register2" component={Register2Screen} />
    <Stack.Screen name="Register3" component={Register3Screen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
    <Stack.Screen name="OrderTransactionScreen" component={OrderTransactionScreen} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="VirtualFitting" component={VirtualFittingScreen} />
    <Stack.Screen name="AiTryOn" component={AiTryOnScreen} />
    <Stack.Screen name="ProductView" component={ProductView} />
    <Stack.Screen name="Notification" component={NotificationScreen} />
    <Stack.Screen name="ViewNotification" component={ViewNotificationScreen} />
    <Stack.Screen name="ArTryOn" component={ArTryOnScreen} />
    <Stack.Screen name="GeneratedOutfitList" component={GeneratedOutfitListScreen} />
    <Stack.Screen name="GeneratedOutfitView" component={GeneratedOutfitViewScreen} />
  </Stack.Navigator>
);

function AppContent({ initialRoute }) {
  const { theme } = useTheme();
  const [barVisibility, setBarVisibility] = useState();
  
  useEffect(() => {
    NavigationBar.setPositionAsync("absolute");
    NavigationBar.setBackgroundColorAsync(applyOpacity(theme.colors.white, 0.01));
  }, [theme]);

  useEffect(() => {
    // Listen for navigation bar visibility changes
    const listener = NavigationBar.addVisibilityListener(({ visibility }) => {
      if (visibility === "visible") {
        setBarVisibility(visibility);
      }
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (barVisibility === "visible") {
      const timeout = setTimeout(() => {
        NavigationBar.setVisibilityAsync("hidden");
      }, 3000); // hide after 3 seconds
      return () => clearTimeout(timeout);
    }
  }, [barVisibility]);

  // Force hide navigation bar every 3 seconds regardless
  useEffect(() => {
    const interval = setInterval(() => {
      NavigationBar.setVisibilityAsync("hidden");
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navigationConfig = async () => {
    // Ensure the navigation bar is hidden
    NavigationBar.setBackgroundColorAsync(applyOpacity(theme.colors.white, 0.01));
    NavigationBar.setVisibilityAsync("hidden");
  };

  useEffect(() => {
    navigationConfig();
  }, [barVisibility]);

  return (
    <ImageBackground
      source={require("./assets/tile-pattern-2.png")}
      style={[styles.background, { backgroundColor: theme.colors.dark }]}
      resizeMode="repeat"
    >
      <View style={[styles.overlay, { backgroundColor: applyOpacity(theme.colors.dark, 0.9) }]}>
        <StatusBar backgroundColor={applyOpacity(theme.colors.white, 0)} />
        <NavigationContainer>
          <AppNavigator initialRoute={initialRoute} />
        </NavigationContainer>
      </View>
    </ImageBackground>
  );
}

function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        setInitialRoute(user ? "Main" : "Login");
      } catch (error) {
        console.error("Error checking user status:", error);
        setInitialRoute("Login");
      }
    };

    const loadAppFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };

    checkUserStatus();
    loadAppFonts();
  }, []);

  if (!initialRoute || !fontsLoaded) return <LoadingSpinner size={200} />;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NativeBaseProvider theme={nbTheme}>
          <AppContent initialRoute={initialRoute} />
        </NativeBaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Wrap your entire app with your custom ThemeProvider
export default function AppWrapper() {
  return (
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  background: { flex: 1 },
  overlay: { flex: 1 },
  floatingTabBarContainer: {
    position: "absolute",
    bottom: 50,
    left: 15,
    right: 15,
    height: 65,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  rippleContainer: {
    borderRadius: 25,
    overflow: "hidden",
  },
  iconPressable: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
  },
  // Active indicator style for the tab bar
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});
