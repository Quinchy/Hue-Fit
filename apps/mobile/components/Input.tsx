// src/components/CustomInput.tsx
import React, { useState } from 'react';
import { Input, Icon, IInputProps, Pressable } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps extends IInputProps {
  isPassword?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({ isPassword = false, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      type={isPassword && !showPassword ? "password" : "text"}
      bg="gray.800"
      color="white"
      placeholderTextColor="gray.400"
      fontSize="md"
      height={50}  
      borderRadius="md"
      borderWidth={0}
      py={3}
      px={5}
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
  );
};

export default CustomInput;
