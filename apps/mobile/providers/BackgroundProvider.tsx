// BackgroundProvider.tsx
import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

interface BackgroundProviderProps {
  children: ReactNode;
}

const BackgroundProvider: React.FC<BackgroundProviderProps> = ({ children }) => {
  return (
    <ImageBackground
      source={require('../assets/tile-pattern.png')}
      style={styles.background}
      resizeMode="repeat" // This will repeat the image as a tile pattern
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#191919', // The solid background color behind the overlay
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 25, 25, 0.9)', // Adjust the alpha to control the opacity of the overlay
  },
});

export default BackgroundProvider;
