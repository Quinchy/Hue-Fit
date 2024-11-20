// src/components/RegisterButton.tsx
import React from 'react';
import { Button, IButtonProps, Text, Box, HStack } from 'native-base';


interface DefaultButtonProps extends IButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode; // Optional icon prop
}

const DefaultButton: React.FC<DefaultButtonProps> = ({ title, onPress, icon, ...props }) => {
  return (
    <Button
      onPress={onPress}
      bg="white"               // White background color
      borderRadius="md"      // Fully rounded corners
      height={50}              // 50px height
      borderColor="transparent"// Optional: Use transparent or specific border color
      _pressed={{ bg: "gray.200" }} // Light gray background on press
      px={8}                   // Horizontal padding
      py={3}                   // Vertical padding
      width="100%"             // Full width
      {...props}
    >
      <HStack justifyContent="center" alignItems="center" space={2} flex={1}>
        {icon && <Box>{icon}</Box>} 
        <Text color="black" fontWeight="bold" fontSize="md" textAlign="center">
          {title}
        </Text>
      </HStack>
    </Button>
  );
};

export default DefaultButton;
