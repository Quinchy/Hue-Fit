// VirtualFittingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';

export default function VirtualFittingScreen({ route }) {
  const { pngClotheURL, type, tag } = route.params;
  const webViewUrl = `https://hue-fit-web.vercel.app/virtual-try-on?pngClotheURL=${encodeURIComponent(pngClotheURL)}&type=${type}&tag=${tag}`;
  
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const webviewRef = useRef(null);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setIsLoading(false);
    })();
  }, []);

  const viewportMeta = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, 
    maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" />
  `;

  const injectedJS = `
    (function() {
      ${viewportMeta}
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    })();
  `;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009b88" />
        <Text style={styles.loadingText}>Requesting camera permissions...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is required for virtual fitting.</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const onShouldStartLoadWithRequest = (request) => true;
  
  const onMessage = (event) => {
    // Handle messages from WebView if needed
  };
  
  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert('WebView Error', nativeEvent.description);
  };
  
  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: webViewUrl }}
        style={styles.webview}
        startInLoadingState
        injectedJavaScriptBeforeContentLoaded={`
          navigator.mediaDevices.getUserMedia({ video: true }).then(console.log).catch(console.error);
        `}
        renderLoading={() => (
          <ActivityIndicator
            color="#009b88"
            size="large"
            style={styles.loading}
          />
        )}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        overScrollMode="never"
        decelerationRate="normal"
        contentMode="mobile"
        scalesPageToFit={Platform.OS === 'android'}
        onError={onError}
        // Grant camera permission requests automatically on Android
        onPermissionRequest={event => {
          if (Platform.OS === 'android') {
            event.nativeEvent.request.grant(event.nativeEvent.resources);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#009b88',
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
