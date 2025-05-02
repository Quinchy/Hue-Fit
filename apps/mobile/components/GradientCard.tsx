// src/components/GradientCard.tsx
import React from 'react';
import { Box } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../providers/ThemeProvider';

type GradientCardProps = {
  children?: React.ReactNode;
};

const GradientCard: React.FC<GradientCardProps> = ({ children }) => {
  const { theme } = useTheme();
  return (
    <>
      <Box
        position="relative"
        overflow="visible"
        width="100%"
        height="100%"
        alignSelf="center"
      >
        {/* gradient bar, absolutely positioned inside the parent Box */}
        <LinearGradient
          colors={[
            "#FF75C3",
            "#FFA647",
            "#FFE83F",
            "#9FFF5B",
            "#70E2FF",
            "#CD93FF",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            top: -1,
            left: 0,
            right: 0,
            height: 100,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          }}
        />

        {/* your dark card */}
        <Box
          bg={theme.colors.darkGrey}
          p={4}
          width="100%"
          height="100%"
          shadow={2}
          borderRadius={25}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default GradientCard;
