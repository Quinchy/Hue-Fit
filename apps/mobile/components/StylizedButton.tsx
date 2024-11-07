// src/components/StylizedButton.tsx
import React from 'react';
import { Pressable, Text, IButtonProps, Box } from 'native-base';

interface RainbowButtonProps extends IButtonProps {
  title: string;
  onPress: () => void;
}

const StylizedButton: React.FC<RainbowButtonProps> = ({ title, onPress, ...props }) => {
  return (
    <Pressable onPress={onPress} width="100%">
      {({ isPressed }) => (
        <Box
          borderRadius="md"
          overflow="hidden"
          width="100%"
          height={50}
          alignItems="center"
          justifyContent="center"
          bg={{
            linearGradient: {
              colors: isPressed 
                ? ['#FF8ABF', '#FFB066', '#FFE368', '#A8FF81', '#6CD8F2', '#C79BE6'] 
                : ['#FF75C3', '#FFA647', '#FFE83F', '#9FFF5B', '#70E2FF', '#CD93FF'],
              start: [0, 0],
              end: [1, 0],
            },
          }}
          {...props}
        >
          <Text color="black" fontWeight="bold" fontSize="md" textTransform="uppercase">
            {title}
          </Text>
        </Box>
      )}
    </Pressable>
  );
};

export default StylizedButton;
