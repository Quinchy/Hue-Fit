// src/components/GradientCard.tsx
import React from 'react';
import { Box } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';

type GradientCardProps = {
  children?: React.ReactNode; // Define children explicitly
};

const GradientCard: React.FC<GradientCardProps> = ({ children }) => {
  return (
    <Box
      bg="#191919"
      borderRadius="2xl"
      p={2}
      width="100%"
      height="100%"
      alignSelf="center"
      shadow={2}
    >
      <LinearGradient
        colors={['#FF75C3', '#FFA647', '#FFE83F', '#9FFF5B', '#70E2FF', '#CD93FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      />
      {children}
    </Box>
  );
};

export default GradientCard;
