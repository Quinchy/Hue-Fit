// src/components/OutlineButton.tsx
import React from 'react';
import { Button, HStack, IButtonProps, Text } from 'native-base';

interface OutlineButtonProps extends IButtonProps {
  title: string;
  onPress: () => void;
  width?: string | number;
  height?: string | number;
  py?: number;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fontSize?: string | number;
  fontWeight?: string | number;
}

const OutlineButton: React.FC<OutlineButtonProps> = ({
  title,
  onPress,
  width = "fit-content",
  height = 50,
  py = 3,
  fontSize = "md",
  fontWeight = "bold",
  iconLeft,
  iconRight,
  ...props
}) => {
  return (
    <Button
      onPress={onPress}
      variant="outline"
      borderColor="gray.600"
      borderRadius="md"
      height={height}
      width={width}
      py={py}
      _pressed={{ bg: "gray.700" }}
      {...props}
    >
      <HStack alignItems="center" space={2}>
        {/* Icon on the left, if provided */}
        {iconLeft && iconLeft}
        <Text color="white" fontWeight={fontWeight} fontSize={fontSize}>
          {title}
        </Text>
        {/* Icon on the right, if provided */}
        {iconRight && iconRight}
      </HStack>
    </Button>
  );
};

export default OutlineButton;