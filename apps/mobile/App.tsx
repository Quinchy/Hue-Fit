// App.js
import React, { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  ImageBackground,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider, extendTheme } from "native-base";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as NavigationBar from "expo-navigation-bar";
import * as Font from "expo-font";
import LoadingSpinner from "./components/Loading";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Account screens
import LoginScreen from "./screens/account/LoginScreen";
import RegisterScreen from "./screens/account/RegisterScreen";
import Register2Screen from "./screens/account/Register2Screen";
import Register3Screen from "./screens/account/Register3Screen";
import ForgotPasswordScreen from "./screens/account/ForgotPasswordScreen";

// App screens
import CartScreen from "./screens/app/CartScreen";
import VirtualFittingScreen from "./screens/app/VirtualFittingScreen";
import AiTryOnScreen from "./screens/app/AiTryOnScreen";
import EditProfileScreen from "./screens/app/EditProfileScreen";
import ProfileSettingsScreen from "./screens/app/ProfileSettingsScreen";
import OrderTransactionScreen from "./screens/app/OrderTransactionScreen";
import OrderHistoryScreen from "./screens/app/OrderHistoryScreen";
import ProductView from "./screens/app/ProductViewScreen";
import NotificationScreen from "./screens/app/NotificationScreen";
import ViewNotificationScreen from "./screens/app/ViewNotificationScreen";
import ArTryOnScreen from "./screens/app/ArTryOnScreen";
import GeneratedOutfitListScreen from "./screens/app/GeneratedOutfitListScreen";
import GeneratedOutfitViewScreen from "./screens/app/GeneratedOutfitViewScreen";

// Bottom‐tabs navigator
import BottomTabs from "./components/BottomNavigationBar";

// Extend NativeBase theme (fonts only)
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

const Stack = createStackNavigator();

const queryClient = new QueryClient();

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

function AppNavigator({ initialRoute }) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Register2" component={Register2Screen} />
      <Stack.Screen name="Register3" component={Register3Screen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen
        name="OrderTransactionScreen"
        component={OrderTransactionScreen}
      />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="VirtualFitting" component={VirtualFittingScreen} />
      <Stack.Screen name="AiTryOn" component={AiTryOnScreen} />
      <Stack.Screen name="ProductView" component={ProductView} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen
        name="ViewNotification"
        component={ViewNotificationScreen}
      />
      <Stack.Screen name="ArTryOn" component={ArTryOnScreen} />
      <Stack.Screen
        name="GeneratedOutfitList"
        component={GeneratedOutfitListScreen}
      />
      <Stack.Screen
        name="GeneratedOutfitView"
        component={GeneratedOutfitViewScreen}
      />
    </Stack.Navigator>
  );
}

function AppContent({ initialRoute }) {
  const [barVisible, setBarVisible] = useState(false);

  useEffect(() => {
    NavigationBar.setPositionAsync("absolute");
    NavigationBar.setBackgroundColorAsync("transparent");
  }, []);

  useEffect(() => {
    const sub = NavigationBar.addVisibilityListener(({ visibility }) => {
      if (visibility === "visible") setBarVisible(true);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (barVisible) {
      const t = setTimeout(
        () => NavigationBar.setVisibilityAsync("hidden"),
        3000
      );
      return () => clearTimeout(t);
    }
  }, [barVisible]);

  // also hide periodically
  useEffect(() => {
    const iv = setInterval(
      () => NavigationBar.setVisibilityAsync("hidden"),
      3000
    );
    return () => clearInterval(iv);
  }, []);

  return (
    <ImageBackground
      source={require("./assets/tile-pattern-2.png")}
      style={styles.background}
      resizeMode="repeat"
    >
      <View style={styles.overlay}>
        <StatusBar translucent backgroundColor="transparent" />
        <NavigationContainer>
          <AppNavigator initialRoute={initialRoute} />
        </NavigationContainer>
      </View>
    </ImageBackground>
  );
}

function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await loadFonts();
      setFontsLoaded(true);
      const user = await AsyncStorage.getItem("user");
      setInitialRoute(user ? "Main" : "Login");
    })();
  }, []);

  if (!fontsLoaded || initialRoute === null) {
    return <LoadingSpinner size={200} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <NativeBaseProvider theme={nbTheme}>
            <AppContent initialRoute={initialRoute} />
          </NativeBaseProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  root: { flex: 1 },
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(25,25,25,0.9)" },
});
