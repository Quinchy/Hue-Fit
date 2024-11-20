import React, { useState } from 'react';
import { Input, Icon, IInputProps, Pressable, Text, VStack } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps extends IInputProps {
  isPassword?: boolean;
  label?: string; // Optional label for the input
}

const CustomInput: React.FC<CustomInputProps> = ({ isPassword = false, label, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <VStack space={1}>
      {label ? ( // Ensure label is rendered within a <Text> component
        <Text fontSize="md" fontWeight={600} color="gray.400">
          {label}
        </Text>
      ) : null}
      <Input
        {...props}
        type={isPassword && !showPassword ? "password" : "text"}
        bg="gray.800"
        color="white"
        placeholderTextColor="gray.600"
        width={"100%"}
        fontSize="md"
        height={50}
        borderRadius="md"
        borderWidth={isFocused ? 2 : 0}
        borderColor="transparent"
        selectionColor="gray.500"
        _focus={
          isFocused
          ? {
              bg: "gray.800",
              selectionColor: 'gray.500',
            }
          : {}
        }
        focusOutlineColor="gray.500"
        py={3}
        px={5}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        InputRightElement={
          isPassword ? (
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Icon
                as={<Ionicons name={showPassword ? "eye-off" : "eye"} />}
                size="sm"
                color="gray.400"
                mr={5}
              />
            </Pressable>
          ) : null
        }
      />
    </VStack>
  );
};

export default CustomInput;
