import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { Camera } from "expo-camera";

export default function VirtualFittingScreen({ route }) {
  // Extract parameters from route; different screens may pass either:
  // - a single pngClotheURL OR
  // - upperWearPng, lowerWearPng, and optionally outerWearPng.
  const { pngClotheURL, upperWearPng, lowerWearPng, outerWearPng, type, tag } =
    route.params;

  // Build the WebView URL based on which parameters are provided.
  let webViewUrl = "";
  if (upperWearPng && lowerWearPng) {
    // Multiple PNG URLs provided.
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
    // Fallback to single PNG URL.
    webViewUrl = `https://hue-fit-web.vercel.app/virtual-try-on?pngClotheURL=${encodeURIComponent(
      pngClotheURL
    )}&type=${encodeURIComponent(type)}&tag=${encodeURIComponent(tag)}`;
  } else {
    // If none provided, just pass type and tag.
    webViewUrl = `https://hue-fit-web.vercel.app/virtual-try-on?type=${encodeURIComponent(
      type
    )}&tag=${encodeURIComponent(tag)}`;
  }

  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(null);
  const webviewRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
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

  const onShouldStartLoadWithRequest = (request) => true;

  // Updated onMessage to receive snapshot from web
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.image) {
        setSnapshot(data.image);
        Alert.alert(
          "Snapshot Received",
          "The snapshot has been received from the web view."
        );
      }
    } catch (error) {
      console.error("Error parsing message from web:", error);
    }
  };

  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error: ", nativeEvent);
    Alert.alert("WebView Error", nativeEvent.description);
  };

  return (
    <ScrollView contentContainerStyle={styles.flexContainer}>
      <View style={styles.container}>
        <WebView
          ref={webviewRef}
          source={{ uri: webViewUrl }}
          style={styles.webview}
          startInLoadingState
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
          onMessage={onMessage}
          // Grant camera permission requests automatically on Android
          onPermissionRequest={(event) => {
            if (Platform.OS === "android") {
              event.nativeEvent.request.grant(event.nativeEvent.resources);
            }
          }}
        />
      </View>
      {snapshot && (
        <View style={styles.snapshotContainer}>
          <Text style={styles.snapshotTitle}>Snapshot Received</Text>
          <Image source={{ uri: snapshot }} style={styles.snapshotImage} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flexGrow: 1,
  },
  container: { flex: 1 },
  webview: { flex: 1, height: 500 },
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
  snapshotContainer: {
    marginTop: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  snapshotTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  snapshotImage: {
    width: 300,
    height: 400,
    resizeMode: "contain",
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
