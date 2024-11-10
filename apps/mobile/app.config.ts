// app.config.ts
export default {
  expo: {
    name: "Hue-Fit",
    slug: "hue-fit",
    version: "1.0.0",
    android: {
      package: "com.hue_fit.huefit", // Replace with your unique package name
    },
    splash: {
      image: "./assets/splash.png",    // Path to your splash screen image
      resizeMode: "contain",           // Options: 'contain' or 'cover'
      backgroundColor: "#191919"      // Set your desired background color
    },
    entryPoint: "./index.js",
    extra: {
      eas: {
        projectId: "09a1c6fc-3f6f-4244-a20d-3eb3f01edb99", // Project ID for EAS
      },
    },
  },
};
