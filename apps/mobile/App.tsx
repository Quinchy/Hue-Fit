import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, ImageBackground, View, Text, Pressable } from "react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Screens
import LoginScreen from "./screens/account/LoginScreen";
import RegisterScreen from "./screens/account/RegisterScreen";
import Register2Screen from "./screens/account/Register2Screen";
import ForgetPassword1Screen from "./screens/account/ForgetPassword1Screen";
import ForgetPassword2Screen from "./screens/account/ForgetPassword2Screen";
import CartScreen from "./screens/app/CartScreen";
import VirtualFittingScreen from "./screens/app/VirtualFittingScreen";
import AiTryOnScreen from "./screens/app/AiTryOnScreen";
import EditProfileScreen from "./screens/app/EditProfileScreen";
import ShopScreen from "./screens/app/ShopScreen";
import ProfileSettingsScreen from "./screens/app/ProfileSettingsScreen";
import OrderTransactionScreen from "./screens/app/OrderTransactionScreen";
import InputScreen from "./screens/app/InputScreen";
import ProductView from "./screens/app/ProductViewScreen";
import PlaygroundScreen from "./screens/app/PlaygroundScreen";
import NotificationScreen from "./screens/app/NotificationScreen";
import GeneratedOutfitScreen from "./screens/app/GeneratedOutfitScreen";

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
const theme = extendTheme({
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

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets(); // Retrieve dynamic safe area insets

  return (
    <SafeAreaView
      style={{
        backgroundColor: "#0f0f0f", // Background color of the tab bar
        paddingBottom: insets.bottom, // Dynamically add safe area padding at the bottom
      }}
      edges={["bottom"]} // Apply padding only to the bottom edge
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          let Icon = null;
          let label = options.tabBarLabel || route.name;

          if (route.name === "Home") Icon = Home;
          else if (route.name === "Shops") Icon = Store;
          else if (route.name === "Cart") Icon = ShoppingCart;
          else if (route.name === "Profile") Icon = User;
          else if (route.name === "InputStack") {
            Icon = OpenAiLogoRainbow;
            label = "Generate";
          }

          return (
            <Pressable
              key={route.name}
              onPress={() => {
                if (!isFocused) navigation.navigate(route.name);
              }}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.2)", // Ripple color
                radius: 40, // Ripple radius
                centered: true, // Ensures ripple effect is centered
              }}
              style={[
                styles.iconContainer,
                {
                  borderRadius: 10,
                  overflow: "hidden",
                },
              ]}
            >
              {Icon && route.name === "InputStack" ? (
                <Icon width={25} height={25} strokeWidth={1} color={isFocused ? "#FFF" : "#999"} />
              ) : (
                Icon && (
                  <Icon
                    size={25}
                    strokeWidth={1.5}
                    color={isFocused ? "#FFF" : "#999"}
                  />
                )
              )}
              <Text
                style={[
                  styles.iconText,
                  { color: isFocused ? "#FFF" : "#999" },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
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
    <Tab.Screen name="InputStack" component={InputStack} options={{ tabBarLabel: "Generate" }} />
  </Tab.Navigator>
);

const AppNavigator = ({ initialRoute }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Register2" component={Register2Screen} />
    <Stack.Screen name="ForgetPassword1" component={ForgetPassword1Screen} />
    <Stack.Screen name="ForgetPassword2" component={ForgetPassword2Screen} />
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
    <Stack.Screen name="OrderTransactionScreen" component={OrderTransactionScreen} />
    <Stack.Screen name="VirtualFitting" component={VirtualFittingScreen} />
    <Stack.Screen name="AiTryOn" component={AiTryOnScreen} />
    <Stack.Screen name="ProductView" component={ProductView} />
    <Stack.Screen name="Notification" component={NotificationScreen} />
    <Stack.Screen name="GeneratedOutfit" component={GeneratedOutfitScreen} />
  </Stack.Navigator>
);

export default function App() {
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

  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("#0f0f0f");

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NativeBaseProvider theme={theme}>
          <ImageBackground
            source={require("./assets/tile-pattern-2.png")}
            style={styles.background}
            resizeMode="repeat"
          >
            <View style={styles.overlay}>
              <StatusBar backgroundColor="#ffffff01" />
              <NavigationContainer>
                <AppNavigator initialRoute={initialRoute} />
              </NavigationContainer>
            </View>
          </ImageBackground>
        </NativeBaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  background: { flex: 1, backgroundColor: "#191919" },
  overlay: { flex: 1, backgroundColor: "rgba(25, 25, 25, 0.9)" },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    height: 65,
    position: "absolute",
    overflow: "hidden",
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 42,
  },
  iconContainer: { 
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  iconText: { marginTop: 5, fontSize: 10, textAlign: "center" },
});