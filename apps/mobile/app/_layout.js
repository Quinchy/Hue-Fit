import { Slot } from 'expo-router';
import { ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <View className="flex-1 bg-app-bg">
      <StatusBar style="light" />
      <ImageBackground
        source={require('../assets/tile-pattern.png')}
        resizeMode='repeat'
        className='flex-1'
      >
        <SafeAreaView>
          <Slot />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
