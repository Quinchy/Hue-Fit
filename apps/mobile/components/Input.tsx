// components/Input.tsx
import React, { useState, memo } from "react";
import {
  Input as NBInput,
  IInputProps,
  Pressable,
  Text,
  VStack,
  HStack,
} from "native-base";
import { Asterisk, TriangleAlert, Eye, EyeOff } from "lucide-react-native";
import { colors, applyOpacity } from "../constants/colors";

interface InputProps extends IInputProps {
  isPassword?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  isPassword = false,
  label,
  error,
  required = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const computedBorderWidth = error ? 2 : isFocused ? 2 : 1;
  const computedBorderColor = error
    ? colors.warning
    : isFocused
    ? colors.white
    : applyOpacity(colors.greyWhite, 0.35);

  return (
    <VStack space={1} width="100%">
      {label && (
        <Text
          fontSize="md"
          fontWeight="bold"
          color={colors.white}
          flexDir="row"
          alignItems="center"
        >
          {label}
          {required && <Asterisk size={12} color={colors.white} />}
        </Text>
      )}
      <NBInput
        {...props}
        type={isPassword && !showPassword ? "password" : "text"}
        bg={colors.darkGrey}
        color={colors.white}
        placeholderTextColor={applyOpacity(colors.greyWhite, 0.35)}
        width="100%"
        fontSize="md"
        height={50}
        borderRadius="lg"
        borderWidth={computedBorderWidth}
        borderColor={computedBorderColor}
        selectionColor={applyOpacity(colors.greyWhite, 0.35)}
        _focus={{
          bg: colors.dark,
          borderWidth: 1,
          focusOutlineColor: colors.greyWhite,
          borderColor: error ? colors.warning : colors.status.PENDING,
          selectionColor: applyOpacity(colors.greyWhite, 0.35),
        }}
        _disabled={{
          bg: colors.darkGrey,
          borderWidth: 1,
          borderColor: applyOpacity(colors.greyWhite, 0.35),
          color: applyOpacity(colors.greyWhite, 0.35),
        }}
        focusOutlineColor="transparent"
        py={3}
        px={5}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        InputRightElement={
          isPassword ? (
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              mr={5}
              _pressed={{
                opacity: 0.6,
                transform: [{ scale: 0.95 }],
              }}
            >
              {showPassword ? (
                <Eye size={20} color={applyOpacity(colors.greyWhite, 0.95)} />
              ) : (
                <EyeOff
                  size={20}
                  color={applyOpacity(colors.greyWhite, 0.95)}
                />
              )}
            </Pressable>
          ) : undefined
        }
      />
      {error && !isFocused && (
        <HStack space={1} alignItems="center">
          <TriangleAlert size={16} color={colors.warning} />
          <Text fontSize="sm" color={colors.warning}>
            {error}
          </Text>
        </HStack>
      )}
    </VStack>
  );
};

export default memo(Input);
