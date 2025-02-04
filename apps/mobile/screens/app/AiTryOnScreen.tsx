// AiTryOnScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';
import BackgroundProvider from '../../providers/BackgroundProvider';
import { EXPO_PUBLIC_API_URL } from '@env';

function AiTryOnScreen() {
  const route = useRoute();
  const { pngClotheURL, type } = route.params;
  const [image, setImage] = useState<string | null>(null);
  const [mode, setMode] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  // Function to launch image picker for model selection
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access your gallery is needed.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  // Submit function to call the try-on API endpoint
  const handleSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select a model image.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('model', {
        uri: image,
        name: 'model.jpg',
        type: 'image/jpeg',
      });
      formData.append('pngClotheURL', pngClotheURL);
      formData.append('type', type);
      formData.append('mode', mode);

      // Remove manual "Content-Type" header so fetch sets the correct boundary automatically.
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/fashn/try-on`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setResultImage(data.resultImage);
      } else {
        Alert.alert('Error', 'Try-On failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error during try-on:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Available try-on modes
  const modes = [
    { label: 'Performance', value: 'performance' },
    { label: 'Balanced', value: 'balanced' },
    { label: 'Quality', value: 'quality' },
  ];

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>AI Try-On</Text>

          {/* Garment Image */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>Garment</Text>
            {pngClotheURL ? (
              <View style={styles.garmentWrapper}>
                <Image source={{ uri: pngClotheURL }} style={styles.garmentImage} resizeMode="contain" />
              </View>
            ) : (
              <Text style={styles.placeholder}>No Garment Selected</Text>
            )}
          </View>

          {/* Model Image Picker / Preview */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>Model</Text>
            {image ? (
              <View style={styles.modelWrapper}>
                <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Select Model Image</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>Select Mode:</Text>
            <View style={styles.modeContainer}>
              {modes.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[
                    styles.modeButton,
                    mode === m.value && styles.modeButtonSelected,
                  ]}
                  onPress={() => setMode(m.value)}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === m.value && styles.modeButtonTextSelected,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Try-On Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#4E4E4E" />
            ) : (
              <Text style={styles.submitButtonText}>Try-On</Text>
            )}
          </TouchableOpacity>

          {/* Result Section */}
          {resultImage && (
            <View style={styles.resultSection}>
              <Text style={styles.subtitle}>Result</Text>
              <View style={styles.resultWrapper}>
                <Image source={{ uri: resultImage }} style={styles.resultImage} resizeMode="contain" />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </BackgroundProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, padding: 16, marginTop: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#fff' },
  section: { marginBottom: 20, alignItems: 'center' },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#fff' },

  // Garment image wrapper with dashed border
  garmentWrapper: { 
    width: "100%", 
    height: 200, 
    borderWidth: 1, 
    borderColor: '#4E4E4E', 
    borderStyle: 'dashed',
    borderRadius: 6, 
    overflow: 'hidden'
  },
  // Image inside the garment wrapper without its own border
  garmentImage: { 
    width: "100%", 
    height: "100%", 
  },

  // Model image wrapper with dashed border
  modelWrapper: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#4E4E4E',
    borderStyle: 'dashed',
    overflow: 'hidden'
  },
  // Image inside the model wrapper
  image: { 
    width: "100%", 
    height: "100%", 
  },

  placeholder: { color: '#fff', fontStyle: 'italic' },

  // Button style remains unchanged as it already uses a dashed border
  button: { 
    padding: 12, 
    borderRadius: 6, 
    width: '100%', 
    height: 200, 
    borderWidth: 1, 
    borderColor: '#4E4E4E', 
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center' 
  },
  buttonText: { color: '#4E4E4E', fontSize: 16 },

  modeContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  modeButton: { 
    flex: 1, 
    marginHorizontal: 5, 
    paddingVertical: 8, 
    borderWidth: 1, 
    borderColor: '#fff', 
    borderRadius: 4, 
    alignItems: 'center' 
  },
  modeButtonSelected: { backgroundColor: '#fff' },
  modeButtonText: { color: '#fff', fontSize: 14 },
  modeButtonTextSelected: { color: '#191919' },

  submitButton: { backgroundColor: '#fff', padding: 14, borderRadius: 6, alignItems: 'center', width: '100%' },
  submitButtonText: { color: '#191919', fontSize: 18 },

  // New styles for the result section
  resultSection: { marginTop: 30, marginBottom: 100, alignItems: 'center' },
  resultWrapper: {
    width: "100%",
    height: 300,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#4E4E4E',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  // Image inside the result wrapper fills the container
  resultImage: { 
    width: "100%", 
    height: "100%" 
  },
});

export default AiTryOnScreen;
