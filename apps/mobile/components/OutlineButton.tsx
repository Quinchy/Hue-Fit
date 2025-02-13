import React from 'react';
import { Button, HStack, IButtonProps, Text, Box } from 'native-base';

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
      borderColor="#C0C0C025"
      borderRadius="md"
      height={height}
      width={width}
      py={py}
      _pressed={{ bg: "gray.700" }}
      _disabled={{
        bg: "gray.200",
        borderColor: "gray.200",
        _text: { color: "gray.500" },
      }}
      {...props}
    >
      <HStack justifyContent="center" alignItems="center" space={2}>
        {iconLeft && <Box>{iconLeft}</Box>}
        <Text color="white" fontWeight={fontWeight} fontSize={fontSize} textAlign="center">
          {title}
        </Text>
        {iconRight && <Box>{iconRight}</Box>}
      </HStack>
    </Button>
  );
};

export default OutlineButton;
