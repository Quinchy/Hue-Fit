// app.config.ts
export default {
  expo: {
    name: "Hue-Fit",
    slug: "hue-fit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",       // Path to your splash screen image
      resizeMode: "contain",              // Options: 'contain' or 'cover'
      backgroundColor: "#191919",         // Background color for splash screen
    },
    ios: {
      supportsTablet: true,               // iOS tablet support
    },
    android: {
      package: "com.hue_fit.huefit",      // Unique package name
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#191919",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    entryPoint: "./index.js",
    extra: {
      eas: {
        projectId: "09a1c6fc-3f6f-4244-a20d-3eb3f01edb99", // Project ID for EAS
      },
      apiUrl: "https://hue-fit-web.vercel.app", // Added API URL here
    },
  },
};
