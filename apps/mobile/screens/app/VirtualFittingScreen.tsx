// VirtualFittingScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ToastAndroid,
} from "react-native";
import { WebView } from "react-native-webview";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

export default function VirtualFittingScreen({ route, navigation }) {
  // Extract parameters passed via route.
  const { pngClotheURL, upperWearPng, lowerWearPng, outerWearPng, type, tag } =
    route.params;

  // Build the URL for your virtual try-on web app based on provided params.
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
  const webviewRef = useRef(null);

  // Request camera permission on mount.
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      setIsLoading(false);
    })();
  }, []);

  // Inject viewport meta tag and disable scrolling in the WebView.
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

  // onMessage handler receives messages from the WebView.
  // Expecting the web page to post the snapshot as a data URL (base64 encoded PNG).
  const onMessage = async (event) => {
    const data = event.nativeEvent.data;
    if (data && data.startsWith("data:image/png;base64,")) {
      try {
        // Request media library permission before saving.
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission not granted",
            "Media library permission is required to save images."
          );
          return;
        }
        // Remove header and obtain the base64 string.
        const base64Data = data.replace("data:image/png;base64,", "");
        const fileUri = FileSystem.cacheDirectory + "snapshot.png";
        // Write the image file to the device cache.
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Save the file to the device's media library.
        await MediaLibrary.createAssetAsync(fileUri);
        // Show a toast or alert notification.
        if (Platform.OS === "android") {
          ToastAndroid.show(
            "Image has been saved to your phone",
            ToastAndroid.SHORT
          );
        } else {
          Alert.alert("Success", "Image has been saved to your phone");
        }
        // Exit the screen.
        navigation.goBack();
      } catch (error) {
        console.error("Error saving image", error);
        Alert.alert("Error", "There was an error saving the image.");
      }
    }
  };

  // Allow all requests to load.
  const onShouldStartLoadWithRequest = (request) => {
    return true;
  };

  // Show an error alert if the WebView encounters an error.
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

  return (
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
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        // Grant camera permission requests automatically on Android.
        onPermissionRequest={(event) => {
          if (Platform.OS === "android") {
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
});
