declare module '@env' {
  export const EXPO_PUBLIC_API_URL: string; // Replace with your actual environment variable name(s)
  export const RENDER_API_URL: string; // Replace with your actual environment variable name(s)
}  

declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}