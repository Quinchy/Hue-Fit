// src/screens/GetStartedScreen.tsx
import React from 'react';
import { View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackgroundProvider from '../providers/BackgroundProvider';
import DefaultButton from "../components/Button";

export default function GetStartedScreen() {
  const navigation = useNavigation();

  return (
    <BackgroundProvider>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 40,
          paddingHorizontal: 30,
        }}
      >
        {/* Logo at the top */}
        <Image
          source={require("../assets/icons/hue-fit-logo.png")}
          style={{
            width: 60,
            height: 60,
            marginTop: 50,
          }}
          resizeMode="contain"
        />

        {/* Button at the bottom */}
        <DefaultButton
          title="GET STARTED"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </BackgroundProvider>
  );
}
