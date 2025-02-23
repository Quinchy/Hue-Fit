import React, { ReactNode, forwardRef } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

interface BackgroundProviderProps {
  children: ReactNode;
}

const BackgroundProvider = forwardRef<View, BackgroundProviderProps>(({ children }, ref) => {
  return (
    <ImageBackground
      source={require('../assets/tile-pattern-2.png')} // Replace with your background image
      style={styles.background}
      resizeMode="repeat" // This will repeat the image as a tile pattern
    >
      <View ref={ref} style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#19191990', // The solid background color behind the overlay,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 25, 25, 0.85)', // Adjust the alpha to control the opacity of the overlay
  },
});

export default BackgroundProvider;
