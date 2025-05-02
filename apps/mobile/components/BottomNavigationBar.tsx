// src/navigation/BottomTabs.tsx
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Store, ShoppingCart, User } from "lucide-react-native";
import OpenAiLogoRainbow from "../assets/icons/OpenAiLogoRainbow.svg";
import ShopScreen from "../screens/app/ShopScreen";
import CartScreen from "../screens/app/CartScreen";
import ProfileSettingsScreen from "../screens/app/ProfileSettingsScreen";
import InputScreen from "../screens/app/InputScreen";
import PlaygroundScreen from "../screens/app/PlaygroundScreen";
import { applyOpacity, colors } from "../constants/colors";

const Tab = createBottomTabNavigator();

// Custom Tab Bar
const CustomTabBar = ({ state, descriptors, navigation }) => (
  <View style={styles.tabBarContainer}>
    {state.routes.map((route, idx) => {
      const isFocused = state.index === idx;
      const descriptor = descriptors[route.key];
      const onPress = () => {
        if (!isFocused) navigation.navigate(route.name);
      };
      // pick your icon
      let Icon: React.ComponentType<any> | null = null;
      if (route.name === "Shops") Icon = Store;
      else if (route.name === "Cart") Icon = ShoppingCart;
      else if (route.name === "Profile") Icon = User;
      else if (route.name === "InputStack") Icon = OpenAiLogoRainbow;

      return (
        <Pressable
          key={route.name}
          onPress={onPress}
          android_ripple={{
            color: applyOpacity(colors.white, 0.2),
            radius: 25,
          }}
          style={styles.iconWrapper}
        >
          {isFocused ? (
            <View style={[styles.activeCircle]}>
              {Icon && (
                <Icon
                  {...(route.name === "InputStack"
                    ? { width: 24, height: 24 }
                    : { size: 24, strokeWidth: 1.5 })}
                  color={colors.white}
                />
              )}
            </View>
          ) : (
            Icon &&
            (route.name === "InputStack" ? (
              <Icon
                width={24}
                height={24}
                strokeWidth={1}
                color={colors.greyWhite}
              />
            ) : (
              <Icon size={24} strokeWidth={1.5} color={colors.greyWhite} />
            ))
          )}
        </Pressable>
      );
    })}
  </View>
);

// The actual Tab Navigator
export default function BottomTabs() {
  return (
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
}

// Stack for Input + Playground
import { createStackNavigator } from "@react-navigation/stack";
const Stack = createStackNavigator();
function InputStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Input" component={InputScreen} />
      <Stack.Screen name="Playground" component={PlaygroundScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 50,
    left: 10,
    right: 10,
    height: 65,
    borderWidth: 1,
    borderColor: applyOpacity(colors.white, 0.15),
    elevation: 5,
    backgroundColor: colors.dark,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconWrapper: {
    borderRadius: 25,
    overflow: "hidden",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: applyOpacity(colors.white, 0.1),
  },
});
