import React, { useState, memo } from 'react';
import { Input, Icon, IInputProps, Pressable, Text, VStack } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Asterisk } from 'lucide-react-native';
import { useTheme, applyOpacity } from '../providers/ThemeProvider';

interface CustomInputProps extends IInputProps {
  isPassword?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  isPassword = false,
  label,
  error,
  required = false,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const computedBorderWidth = error ? 2 : (isFocused ? 2 : 1);
  const computedBorderColor = error
    ? "red.500"
    : (isFocused ? theme.colors.white : theme.colors.greyWhite + "35");

  return (
    <VStack space={1}>
      {label && (
        <Text
          fontSize="md"
          fontWeight="bold"
          color={theme.colors.white}
          flexDir="row"
          alignItems="center"
        >
          {label}
          {required && (
            <Asterisk
              size={12}
              color={theme.colors.greyWhite}
              style={{ marginLeft: 4, marginTop: 2 }}
            />
          )}
        </Text>
      )}
      <Input
        {...props}
        type={isPassword && !showPassword ? "password" : "text"}
        bg={theme.colors.darkGrey}
        color={theme.colors.white}
        placeholderTextColor={theme.colors.greyWhite + "35"}
        width="100%"
        fontSize="md"
        height={50}
        borderRadius="md"
        borderWidth={computedBorderWidth}
        borderColor={computedBorderColor}
        selectionColor={theme.colors.greyWhite + "35"}
        _focus={{
          bg: theme.colors.dark,
          borderWidth: 2,
          borderColor: error ? "red.500" : "#60A5FA",
          selectionColor: theme.colors.greyWhite + "35",
        }}
        _disabled={{
          bg: theme.colors.darkGrey,
          borderWidth: 1,
          borderColor: theme.colors.greyWhite + "35",
          color: theme.colors.greyWhite + "35",
        }}
        focusOutlineColor={theme.colors.greyWhite + "35"}
        py={3}
        px={5}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        InputRightElement={
          isPassword && (
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Icon
                as={<Ionicons name={showPassword ? "eye-off" : "eye"} />}
                size="sm"
                color={theme.colors.greyWhite + "95"}
                mr={5}
              />
            </Pressable>
          )
        }
      />
    </VStack>
  );
};

export default memo(CustomInput);
