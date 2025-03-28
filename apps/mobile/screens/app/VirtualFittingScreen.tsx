// VirtualFittingScreen.js
import React, { useState, useEffect, useRef, memo } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Camera } from "expo-camera";

const VirtualFittingScreen = ({ route }) => {
  const { pngClotheURL, upperWearPng, lowerWearPng, outerWearPng, type, tag } =
    route.params;

  // Build the WebView URL based on provided parameters.
  let webViewUrl = "";
  if (upperWearPng && lowerWearPng) {
    webViewUrl = `https://hue-fit-web.vercel.app/virtual-try-on?upperWearPng=${encodeURIComponent(
      upperWearPng
    )}&lowerWearPng=${encodeURIComponent(lowerWearPng)}`;
    if (outerWearPng) {
      webViewUrl += `&outerWearPng=${encodeURIComponent(outerWearPng)}`;
    }
    webViewUrl += `&type=${encodeURIComponent(type)}&tag=${encodeURIComponent(
      tag
    )}`;
  } else if (pngClotheURL) {
    webViewUrl = `https://hue-fit-web.vercel.app/virtual-try-on?pngClotheURL=${encodeURIComponent(
      pngClotheURL
    )}&type=${encodeURIComponent(type)}&tag=${encodeURIComponent(tag)}`;
  } else {
    webViewUrl = `https://hue-fit-web.vercel.app/virtual-try-on?type=${encodeURIComponent(
      type
    )}&tag=${encodeURIComponent(tag)}`;
  }

  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const webviewRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      setIsLoading(false);
    })();
  }, []);

  // Minimal viewport meta tag injected to disable zooming/scaling.
  const viewportMeta = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  `;

  const injectedJS = `
    (function() {
      ${viewportMeta}
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    })();
  `;

  // Handler for onLoadEnd: remove loading indicator.
  const handleLoadEnd = () => {
    setIsContentLoaded(true);
  };

  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error: ", nativeEvent);
    Alert.alert("WebView Error", nativeEvent.description);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009b88" />
        <Text style={styles.loadingText}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is required for virtual fitting.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        >
          <Text style={styles.permissionButtonText}>
            Grant Camera Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isContentLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#009b88" />
        </View>
      )}
      <WebView
        ref={webviewRef}
        source={{ uri: webViewUrl }}
        style={styles.webview}
        startInLoadingState
        onLoadEnd={handleLoadEnd}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
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
        originWhitelist={["*"]}
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        overScrollMode="never"
        decelerationRate="normal"
        contentMode="mobile"
        scalesPageToFit={Platform.OS === "android"}
        onError={onError}
        // Automatically grant camera permission requests on Android
        onPermissionRequest={(event) => {
          if (Platform.OS === "android") {
            event.nativeEvent.request.grant(event.nativeEvent.resources);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -25,
    marginTop: -25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#009b88",
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default memo(VirtualFittingScreen);
