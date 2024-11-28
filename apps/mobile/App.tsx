import React, { useEffect, useState } from "react";
import { StatusBar, StyleSheet, ImageBackground, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider } from "native-base";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoadingSpinner from "../mobile/components/Loading";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Easing } from "react-native";
import * as NavigationBar from 'expo-navigation-bar';
import GetStartedScreen from "./screens/GetStartedScreen";
import LoginScreen from "./screens/account/LoginScreen";
import RegisterScreen from "./screens/account/RegisterScreen";
import HomeScreen from "./screens/app/HomeScreen";
import CartScreen from "./screens/app/CartScreen";
import InputScreen from "./screens/app/InputScreen";
import NotificationScreen from "./screens/app/NotificationScreen";
import PlaygroundScreen from "./screens/app/PlaygroundScreen";
import ProductViewScreen from "./screens/app/ProductViewScreen";
import ProfileSettingsScreen from "./screens/app/ProfileSettingsScreen";
import ShopLocationScreen from "./screens/app/ShopLocationScreen";
import WardrobeScreen from "./screens/app/WardrobeScreen";
import SettingsScreen from "./screens/app/SettingsScreen";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const config = {
    dependencies: {
      "linear-gradient": LinearGradient,
    },
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        const hasVisited = await AsyncStorage.getItem("hasVisited");

        if (user) {
          setInitialRoute("Home");
        } else if (hasVisited) {
          setInitialRoute("Login");
        } else {
          await AsyncStorage.setItem("hasVisited", "true");
          setInitialRoute("GetStarted");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setInitialRoute("GetStarted");
      }
    };

    checkUserStatus();
  }, []);

  if (initialRoute === null) {
    return <LoadingSpinner size={200} />;
  }
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync('#ffffff01')
  
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NativeBaseProvider config={config}>
          {/* Full-Screen Background */}
          <ImageBackground
            source={require("./assets/tile-pattern-2.png")} // Replace with your background image path
            style={styles.background}
            resizeMode="repeat" // Repeat the image to create a tiled effect
          >
            {/* Semi-transparent overlay */}
            <View style={styles.overlay}>
              <StatusBar backgroundColor='#ffffff01' />
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName={initialRoute}
                  screenOptions={{
                    headerShown: false,
                    transitionSpec: {
                      open: {
                        animation: "timing",
                        config: {
                          duration: 200,
                          easing: Easing.inOut(Easing.cubic),
                        },
                      },
                      close: {
                        animation: "timing",
                        config: {
                          duration: 200,
                          easing: Easing.inOut(Easing.cubic),
                        },
                      },
                    },
                    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
                  }}
                >
                  <Stack.Screen name="GetStarted" component={GetStartedScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="Login" component={LoginScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="Register" component={RegisterScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="Home" component={HomeScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="Wardrobe" component={WardrobeScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="Cart" component={CartScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen
                    name="Profile Settings"
                    component={ProfileSettingsScreen}
                    options={{ unmountOnBlur: true }}
                  />
                  <Stack.Screen
                    name="Shop Location"
                    component={ShopLocationScreen}
                    options={{ unmountOnBlur: true }}
                  />
                  <Stack.Screen name="Settings" component={SettingsScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="Notification" component={NotificationScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="Input" component={InputScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="Playground" component={PlaygroundScreen} options={{ unmountOnBlur: true }} />
                  <Stack.Screen name="ProductView" component={ProductViewScreen} options={{ unmountOnBlur: true }} />
                </Stack.Navigator>
              </NavigationContainer>
            </View>
          </ImageBackground>
        </NativeBaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "#191919", // Solid fallback background color
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(25, 25, 25, 0.9)", // Semi-transparent overlay
  },
});
