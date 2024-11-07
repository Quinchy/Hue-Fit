// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';
import { createStackNavigator,  CardStyleInterpolators } from '@react-navigation/stack'; // Import TransitionPresets
import GetStartedScreen from './screens/GetStartedScreen';
import LoginScreen from './screens/account/LoginScreen';
import RegisterScreen from './screens/account/RegisterScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  const config = {
    dependencies: {
      'linear-gradient': LinearGradient,
    },
  };

  return (
    <NativeBaseProvider config={config}>
      <NavigationContainer>
        {/* Set the StatusBar to light content */}
        <StatusBar barStyle="light-content" backgroundColor="#191919" />
        <Stack.Navigator
          initialRouteName="GetStarted"
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
          <Stack.Screen name="GetStarted" component={GetStartedScreen}  options={{ unmountOnBlur: true }} />
          <Stack.Screen name="Login" component={LoginScreen}  options={{ unmountOnBlur: true }}/>
          <Stack.Screen name="Register" component={RegisterScreen}  options={{ unmountOnBlur: true }} />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
