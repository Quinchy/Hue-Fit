// src/components/OutlineButton.tsx
import React from 'react';
import { Button, IButtonProps, Text } from 'native-base';

interface OutlineButtonProps extends IButtonProps {
  title: string;
  onPress: () => void;
}

const OutlineButton: React.FC<OutlineButtonProps> = ({ title, onPress, ...props }) => {
  return (
    <Button
      onPress={onPress}
      variant="outline"
      borderColor="gray.600"
      borderRadius="md"
      height={50}  
      width="100%"
      py={3}
      _pressed={{ bg: "gray.700" }}
      {...props}
    >
      <Text color="white" fontWeight="bold" fontSize="md">
        {title}
      </Text>
    </Button>
  );
};

export default OutlineButton;
