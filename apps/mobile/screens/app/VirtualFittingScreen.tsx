import React from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const VirtualFittingScreen = ({ navigation, route }) => {
  const { pngClotheURL } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </Pressable>
      </View>
      {pngClotheURL ? (
        <Image
          source={{ uri: pngClotheURL }}
          style={styles.clotheImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.placeholder}>
          {/* Placeholder content or message if no image available */}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191919', justifyContent: 'center', alignItems: 'center' },
  backButtonContainer: { position: 'absolute', top: 20, left: 15, zIndex: 10 },
  backButton: { padding: 10 },
  clotheImage: { width: '100%', height: '100%' },
  placeholder: { width: 200, height: 200, backgroundColor: '#333' }
});

export default VirtualFittingScreen;
