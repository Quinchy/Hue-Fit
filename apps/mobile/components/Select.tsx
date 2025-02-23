import React from 'react';
import { Box, Text, Select, ISelectProps, CheckIcon } from 'native-base';
import { Asterisk } from 'lucide-react-native';
import { useTheme, applyOpacity } from '../providers/ThemeProvider';

interface CustomSelectProps extends ISelectProps {
  label?: string;           // Optional label for the selector
  value: string;            // Currently selected value
  onChange: (value: string) => void; // Function to update the selected value
  children?: React.ReactNode; // Allow passing custom Select.Item components
  required?: boolean;       // If true, show an asterisk beside the label
  error?: string;           // Optional error message (for red border styling)
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label = 'Select an option',
  value,
  onChange,
  children,
  required = false,
  error,
  ...props
}) => {
  const { theme } = useTheme();
  const labelColor = theme.colors.greyWhite; // replacing "#C0C0C0"
  const bgColor = theme.colors.darkGrey; // replacing "#2E2E2E"
  const placeholderTextColor = applyOpacity(theme.colors.greyWhite, 0.35); // similar to "#c0c0c035"
  const computedBorderColor = error ? "red.500" : placeholderTextColor;

  return (
    <Box>
      <Text
        fontSize="md"
        fontWeight={600}
        color={labelColor}
        mb={1}
        flexDir="row"
        alignItems="center"
      >
        {label}
        {required && (
          <Asterisk size={12} color={labelColor} style={{ marginLeft: 4 }} />
        )}
      </Text>
      <Box borderWidth={error ? 2 : 1} borderColor={computedBorderColor} borderRadius="md">
        <Select
          selectedValue={value}
          minWidth="200"
          accessibilityLabel={`Choose your ${label}`}
          placeholder={`Choose your ${label}`}
          onValueChange={(itemValue) => onChange(itemValue)}
          _selectedItem={{
            bg: placeholderTextColor,
            borderRadius: "md",
            endIcon: <CheckIcon size="5" />,
          }}
          _actionSheetContent={{
            backgroundColor: bgColor,
            borderRadius: "lg",
          }}
          _actionSheetBody={{
            backgroundColor: bgColor,
          }}
          _item={{
            bg: bgColor,
            my: 0.5,
            _text: {
              color: theme.colors.white,
            },
            _pressed: {
              bg: placeholderTextColor,
              borderRadius: "md",
            },
          }}
          py={3}
          px={5}
          height={50}
          borderRadius="md"
          bg={bgColor}
          borderColor="transparent"
          placeholderTextColor={placeholderTextColor}
          fontSize="md"
          color={theme.colors.white}
          {...props}
        >
          {children}
        </Select>
      </Box>
    </Box>
  );
};

export default CustomSelect;
