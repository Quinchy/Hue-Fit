import React, { ReactNode, forwardRef } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

interface BackgroundProviderProps {
  children: ReactNode;
}

const BackgroundProvider = forwardRef<View, BackgroundProviderProps>(({ children }, ref) => {
  return (
    <ImageBackground
      source={require('../assets/tile-pattern-2.png')}
      style={styles.background}
      resizeMode="repeat"
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
    backgroundColor: '#616161',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 25, 25, 0.78)',
  },
});

export default BackgroundProvider;
