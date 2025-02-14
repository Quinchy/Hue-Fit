// ArTryOnScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ViroARSceneNavigator, ViroARScene, ViroText } from 'react-viro';

const HelloWorldSceneAR = () => {
  return (
    <ViroARScene>
      <ViroText 
        text="Hello, AR World!" 
        position={[0, 0, -1]} 
        style={{ fontSize: 30, color: '#ffffff' }}
      />
    </ViroARScene>
  );
};

export default function ArTryOnScreen() {
  return (
    <View style={styles.flexContainer}>
      <ViroARSceneNavigator 
        initialScene={{ scene: HelloWorldSceneAR }}
        style={styles.flexContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
});
