// constants/colors.ts

/**
 * Centralized color palette for the app
 */
export const colors = {
  // Primary grayscale
  black: "#111111",
  dark: "#191919",
  darkGrey: "#1F1F1F",
  grey: "#4E4E4E",
  greyWhite: "#C0C0C0",
  lowGreyWhite: "#F1F1F1",
  lowWhite: "#EFEFEF",
  white: "#FFFFFF",

  // Semantic colors
  success: "#7BE24A",
  warning: "#E24A4A",
  error: "#E24A4A",
  info: "#4A90E2",

  successAccentBg: "#BBFF9A",
  errorAccentBg: "#FF9A9A",
  warningAccentBg: "#FF9A9A",
  infoAccentBg: "#9ABBFF",

  // Status colors
  status: {
    PENDING: "#60A5FA",
    PROCESSING: "#F59E0B",
    DELIVERING: "#A78BFA",
    RESERVED: "#e60076",
    COMPLETED: "#7BE24A",
    CANCELLED: "#E24A4A",
  },
};

/**
 * Converts a hex color to an rgba string with the given opacity.
 * @param hex - The hex color code (e.g. '#FFAABB' or '#FAB')
 * @param opacity - A number between 0 and 1
 * @returns rgba(r, g, b, opacity)
 */
export function applyOpacity(hex: string, opacity: number): string {
  let processedHex = hex.replace("#", "");
  if (processedHex.length === 3) {
    processedHex = processedHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(processedHex.substring(0, 2), 16);
  const g = parseInt(processedHex.substring(2, 4), 16);
  const b = parseInt(processedHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export type Colors = typeof colors;
