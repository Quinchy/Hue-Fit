// VirtualFittingScreen.js
import React, { useState, useEffect, useRef, memo } from "react";
import { StyleSheet, View, Alert, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import { Camera } from "expo-camera";

const VirtualFittingScreen = ({ route }) => {
  const { pngClotheURL, upperWearPng, lowerWearPng, outerWearPng, type, tag } =
    route.params;
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
  const webviewRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

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

  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error: ", nativeEvent);
    Alert.alert("WebView Error", nativeEvent.description);
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
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
      <WebView
        ref={webviewRef}
        source={{ uri: webViewUrl }}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
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
