// app.config.ts
export default {
  expo: {
    name: "Hue-Fit",
    slug: "hue-fit",
    version: "1.0.0",
    android: {
      package: "com.hue_fit.huefit", // Replace with your unique package name
    },
    entryPoint: "./index.js",
    extra: {
      eas: {
        projectId: "09a1c6fc-3f6f-4244-a20d-3eb3f01edb99", // Project ID for EAS
      },
    },
  },
};
