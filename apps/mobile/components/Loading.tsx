// src/components/Loading.tsx
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
  size = 200,
  visible = true,
  onFinish,
  messages = 'Loading...', // Default message
}) => {
  const [currentMessage, setCurrentMessage] = useState(
    Array.isArray(messages) ? messages[0] : messages
  );
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    let messageInterval: NodeJS.Timeout | null = null;
    if (Array.isArray(messages) && messages.length > 1) {
      let index = 0;
      messageInterval = setInterval(() => {
        index = (index + 1) % messages.length;
        setCurrentMessage(messages[index]);
      }, 2000);
    }
    return () => {
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [messages]);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        if (onFinish) {
          runOnJS(onFinish)();
        }
      });
    } else {
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [visible, opacity, onFinish]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ImageBackground
      source={require('../assets/tile-pattern.png')}
      style={styles.background}
      resizeMode="repeat"
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <LottieView
          source={require('../assets/animations/loading.json')}
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
    ...StyleSheet.absoluteFillObject, // ensures full-screen coverage
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#191919',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 170,
  },
  message: {
    marginTop: -70,
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    fontWeight: '300',
  },
});

export default LoadingSpinner;
