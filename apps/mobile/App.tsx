import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import LoadingSpinner from '../mobile/components/Loading';

import GetStartedScreen from './screens/GetStartedScreen';
import LoginScreen from './screens/account/LoginScreen';
import RegisterScreen from './screens/account/RegisterScreen';
import HomeScreen from './screens/app/HomeScreen';
import CartScreen from './screens/app/CartScreen';
import InputScreen from './screens/app/InputScreen';
import NotificationScreen from './screens/app/NotificationScreen';
import PlaygroundScreen from './screens/app/PlaygroundScreen';
import ProductViewScreen from './screens/app/ProductViewScreen';
import ProfileSettingsScreen from './screens/app/ProfileSettingsScreen';
import ShopLocationScreen from './screens/app/ShopLocationScreen';
import WardrobeScreen from './screens/app/WardrobeScreen';
import SettingsScreen from './screens/app/SettingsScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null); // Default to GetStarted
  const config = {
    dependencies: {
      'linear-gradient': LinearGradient,
    },
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Check AsyncStorage for user data
        const user = await AsyncStorage.getItem('user');
        const hasVisited = await AsyncStorage.getItem('hasVisited');

        if (user) {
          // User is already logged in, navigate to Home
          setInitialRoute('Home');
        } else if (hasVisited) {
          // No user data, but the user has visited before, go to Login
          setInitialRoute('Login');
        } else {
          // Completely new user, go to GetStarted
          await AsyncStorage.setItem('hasVisited', 'true');
          setInitialRoute('GetStarted');
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setInitialRoute('GetStarted'); 
      }
    };

    checkUserStatus();
  }, []);

  // Show a loading spinner until `initialRoute` is determined
  if (initialRoute === null) {
    return (
      <LoadingSpinner size={200} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider config={config}>
        <NavigationContainer>
          {/* Set the StatusBar to light content */}
          <StatusBar barStyle="light-content" backgroundColor="#191919" />
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                    easing: Easing.inOut(Easing.cubic),
                  },
                },
                close: {
                  animation: 'timing',
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
            <Stack.Screen name="Profile Settings" component={ProfileSettingsScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="Shop Location" component={ShopLocationScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="Notification" component={NotificationScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="Input" component={InputScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="Playground" component={PlaygroundScreen} options={{ unmountOnBlur: true }} />
          </Stack.Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}
