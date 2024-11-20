import React, { useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

interface LoadingSpinnerProps {
  size?: number; // Optional size for the animation
  visible?: boolean; // Control spinner visibility
  onFinish?: () => void; // Optional callback for when the fade-out completes
  messages?: string | string[]; // Custom loading messages
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 150,
  visible = true,
  onFinish,
  messages = 'Loading...', // Default message
}) => {
  const [currentMessage, setCurrentMessage] = useState(
    Array.isArray(messages) ? messages[0] : messages
  ); // Initialize message
  const opacity = useSharedValue(visible ? 1 : 0); // Start with 1 (visible) if `visible` is true

  useEffect(() => {
    let messageInterval: NodeJS.Timeout | null = null;

    if (Array.isArray(messages) && messages.length > 1) {
      let index = 0;
      messageInterval = setInterval(() => {
        index = (index + 1) % messages.length;
        setCurrentMessage(messages[index]); // Rotate through messages
      }, 2000); // Change message every 2 seconds
    }

    return () => {
      if (messageInterval) clearInterval(messageInterval);
    }; // Cleanup interval
  }, [messages]);

  useEffect(() => {
    if (!visible) {
      // Trigger fade-out animation when `visible` changes to false
      opacity.value = withTiming(0, { duration: 500 }, () => {
        if (onFinish) {
          runOnJS(onFinish)(); // Trigger the callback after fade-out
        }
      });
    } else {
      // Reset opacity to 1 when `visible` is true
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [visible, opacity, onFinish]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ImageBackground
      source={require('../assets/tile-pattern.png')} // Replace with your background image
      style={styles.background}
      resizeMode="repeat"
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <LottieView
          source={require('../assets/animations/loading.json')} // Default animation file
          autoPlay
          loop
          style={{ width: size, height: size }}
        />
        <Text style={styles.message}>{currentMessage}</Text>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#191919',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default LoadingSpinner;
