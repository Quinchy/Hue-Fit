// src/components/Input.tsx
import React, { useState } from 'react';
import { Input, Icon, IInputProps, Pressable, Text, VStack } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Asterisk } from 'lucide-react-native';

interface CustomInputProps extends IInputProps {
  isPassword?: boolean;
  label?: string;       // Optional label for the input
  error?: string;       // Optional error message (for red border styling)
  required?: boolean;   // If true, show a required asterisk beside the label
}

const CustomInput: React.FC<CustomInputProps> = ({
  isPassword = false,
  label,
  error,
  required = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Determine border styling based on error state or focus state
  const computedBorderWidth = error ? 2 : (isFocused ? 2 : 0);
  const computedBorderColor = error ? "red.500" : "transparent";

  return (
    <VStack space={1}>
      {label ? (
        <Text fontSize="md" fontWeight={600} color="#cebfbf" flexDir="row" alignItems="center">
          {label}
          {required && (
            <Asterisk size={12} color="#C0C0C0" style={{ marginLeft: 4, marginTop: 2 }} />
          )}
        </Text>
      ) : null}
      <Input
        {...props}
        type={isPassword && !showPassword ? "password" : "text"}
        bg="#2E2E2E"
        color="white"
        placeholderTextColor="#c0c0c035"
        width="100%"
        fontSize="md"
        height={50}
        borderRadius="md"
        borderWidth={computedBorderWidth}
        borderColor={computedBorderColor}
        selectionColor="#c0c0c0"
        _focus={{
          bg: "#272727",
          borderWidth: 2,
          borderColor: error ? "red.500" : "transparent",
          selectionColor: '#c0c0c035',
        }}
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
