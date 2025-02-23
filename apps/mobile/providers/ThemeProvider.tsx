// providers/ThemeProvider.js
import React, { createContext, useState, useContext } from 'react';

export const applyOpacity = (hex, opacity) => {
  let processedHex = hex.replace('#', '');
  if (processedHex.length === 3) {
    processedHex = processedHex
      .split('')
      .map(char => char + char)
      .join('');
  }
  const r = parseInt(processedHex.substring(0, 2), 16);
  const g = parseInt(processedHex.substring(2, 4), 16);
  const b = parseInt(processedHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const defaultTheme = {
  colors: {
    // Primary grayscale
    black: '#111111',
    dark: '#191919',
    darkGrey: '#1F1F1F',
    grey: '#4E4E4E',
    greyWhite: '#C0C0C0',
    lowGreyWhite: '#F1F1F1',
    lowWhite: '#EFEFEF',
    white: '#FFFFFF',
    // Semantic colors
    warning: '#E24A4A',
    success: '#7BE24A',
    // Status colors
    status: {
      PENDING: '#60A5FA',
      PROCESSING: '#F59E0B',
      DELIVERING: '#A78BFA',
      RESERVED: '#e60076',
      COMPLETED: '#7BE24A',
      CANCELLED: '#E24A4A',
    },
  },
};

const ThemeContext = createContext({
  theme: defaultTheme,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
