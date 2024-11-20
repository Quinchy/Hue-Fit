// components/DrawerMenu.tsx
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { VStack, Text, IconButton, Box } from 'native-base';
import { X, LogOut } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerGestureEvent } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultButton from '../components/Button';

type DrawerMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  navigation: any; // Replace `any` with the specific navigation type if known
};

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose, navigation }) => {
  const translateX = useSharedValue(300); // Start off-screen to the right
  const opacity = useSharedValue(0); // Initial opacity set to 0 (invisible)

  const animateOpen = () => {
    translateX.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  };

  const animateClose = () => {
    translateX.value = withTiming(300, {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    }, () => runOnJS(onClose)()); // Ensure onClose is called after animation completes

    opacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.in(Easing.ease),
    });
  };

  useEffect(() => {
    if (isOpen) {
      animateOpen();
    } else {
      animateClose();
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handleSwipeClose = (event: GestureHandlerGestureEvent) => {
    if (event.nativeEvent.translationX > 100) {
      animateClose(); // Start animation immediately on swipe
    }
  };

  const navigateToScreen = (screen: string) => {
    animateClose();
    if (navigation) {
      navigation.navigate(screen);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Clear user data
      animateClose();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // Navigate to Login
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  return (
    <PanGestureHandler onGestureEvent={handleSwipeClose}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            right: 0,
            width: '110%',
            height: '100%',
            backgroundColor: '#191919',
            zIndex: 1,
            paddingTop: 50,
          },
          animatedStyle,
        ]}
      >
        <Box position="absolute" top={10} right={10}>
          <IconButton 
            icon={<X size={24} 
            color="white" />} 
            onPress={animateClose}
            _pressed={{ bg: 'gray.800' }}
            borderRadius="full"
          />
        </Box>
        <VStack space={8} alignItems="center" mt={8} mx={16}>
          {['Home', 'Wardrobe', 'Cart', 'ProfileSettings', 'ShopLocation', 'Settings'].map((screen) => (
            <TouchableOpacity
              key={screen}
              onPress={() => navigateToScreen(screen)}
            >
              <Text color="white" fontSize="xl" fontWeight="bold">
                {screen.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
            </TouchableOpacity>
          ))}
          {/* Logout Button */}
          <DefaultButton 
            title="LOG OUT" 
            onPress={handleLogout}
            icon={<LogOut size={20} color="black" />}
          />
        </VStack>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default DrawerMenu;
