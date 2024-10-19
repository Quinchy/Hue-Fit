import React from 'react';
import { View, Image } from 'react-native';

export default function NavHeader() {
  return (
    <View className="h-24 flex items-center justify-center">
      <Image
        source={require('../assets/icons/hue-fit-logo.png')} // Adjust the path if necessary
        className="w-10 h-10" // Adjust the width and height as needed
        resizeMode="contain"  // Ensures the image scales properly
      />
    </View>
  );
}
