// DefaultButton.js
import React, { memo } from 'react';
import { Button, IButtonProps, Text, Box, HStack, Spinner } from 'native-base';

interface DefaultButtonProps extends IButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  isLoading?: boolean;
  centerTitle?: boolean;
}

const DefaultButton: React.FC<DefaultButtonProps> = ({
  title,
  onPress,
  icon,
  isLoading,
  centerTitle = false,
  ...props
}) => {
  const hStackProps = centerTitle
    ? { w: "100%", justifyContent: "center", alignItems: "center", space: 2 }
    : { justifyContent: "center", alignItems: "center", space: 2, flex: 1 };
  const textProps = centerTitle ? { flex: 1, textAlign: "center" } : { textAlign: "center" };

  return (
    <Button
      onPress={onPress}
      bg="white"
      borderRadius="md"
      height={50}
      borderColor="transparent"
      _pressed={{ bg: "#C0C0C0" }}
      px={8}
      py={3}
      width="100%"
      {...props}
    >
      {isLoading ? (
        <Spinner color="#191919" />
      ) : (
        <HStack {...hStackProps}>
          {icon && <Box>{icon}</Box>}
          <Text color="black" fontWeight="bold" fontSize="md" {...textProps}>
            {title}
          </Text>
        </HStack>
      )}
    </Button>
  );
};

export default memo(DefaultButton);
