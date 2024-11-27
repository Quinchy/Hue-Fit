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
        <Text fontSize="md" fontWeight={600} color="#C0C0C0">
          {label}
        </Text>
      ) : null}
      <Input
        {...props}
        type={isPassword && !showPassword ? "password" : "text"}
        bg="#2E2E2E"
        color="white"
        placeholderTextColor="#c0c0c035"
        width={"100%"}
        fontSize="md"
        height={50}
        borderRadius="md"
        borderWidth={isFocused ? 2 : 0}
        borderColor="transparent"
        selectionColor="#c0c0c0"
        _focus={
          isFocused
          ? {
              bg: "#272727",
              selectionColor: '#c0c0c035',
            }
          : {}
        }
        focusOutlineColor="#c0c0c035"
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
