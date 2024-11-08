import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

import GetStartedScreen from './screens/GetStartedScreen';
import LoginScreen from './screens/account/LoginScreen';
import RegisterScreen from './screens/account/RegisterScreen';
import HomeScreen from './screens/app/HomeScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('GetStarted'); // Default to GetStarted
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
      }
    };

    checkUserStatus();
  }, []);

  return (
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
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
