import React from 'react';
import { Box, Text, Select, ISelectProps, CheckIcon } from 'native-base';
import { Asterisk } from 'lucide-react-native';

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
  const borderWidth = error ? 2 : 1;
  const borderColor = error ? "red.500" : "#C0C0C035";

  return (
    <Box>
      <Text
        fontSize="md"
        fontWeight={600}
        color="#C0C0C0"
        mb={1}
        flexDir="row"
        alignItems="center"
      >
        {label}
        {required && (
          <Asterisk size={12} color="#C0C0C0" style={{ marginLeft: 4 }} />
        )}
      </Text>
      <Box borderWidth={borderWidth} borderColor={borderColor} borderRadius="md">
        <Select
          selectedValue={value}
          minWidth="200"
          accessibilityLabel={`Choose your ${label}`}
          placeholder={`Choose your ${label}`}
          onValueChange={(itemValue) => onChange(itemValue)}
          _selectedItem={{
            bg: "#c0c0c035",
            borderRadius: "md",
            endIcon: <CheckIcon size="5" />,
          }}
          _actionSheetContent={{
            backgroundColor: "#2E2E2E",
            borderRadius: "lg",
          }}
          _actionSheetBody={{
            backgroundColor: "#2E2E2E",
          }}
          _item={{
            bg: "#2E2E2E",
            my: 0.5,
            _text: {
              color: "white",
            },
            _pressed: {
              bg: "#c0c0c035",
              borderRadius: "md",
            },
          }}
          py={3}
          px={5}
          height={50}
          borderRadius="md"
          bg="#2E2E2E"
          borderColor="transparent"
          placeholderTextColor="#c0c0c035"
          fontSize="md"
          color="white"
          {...props}
        >
          {children}
        </Select>
      </Box>
    </Box>
  );
};

export default CustomSelect;
