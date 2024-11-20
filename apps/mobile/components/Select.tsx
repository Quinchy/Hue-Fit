import React from 'react';
import { Box, Text, Select, ISelectProps, CheckIcon } from 'native-base';

interface CustomSelectProps extends ISelectProps {
  label?: string; // Optional label for the selector
  value: string; // Currently selected value
  onChange: (value: string) => void; // Function to update the selected value
  children?: React.ReactNode; // Allow passing custom Select.Item components
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    label = 'Select an option',
    value,
    onChange,
    children, // Accept children
    ...props
  }) => {
    return (
      <Box>
        <Text fontSize="md" fontWeight={600} color="gray.400" mb={1}>
          {label}
        </Text>
        <Select
          selectedValue={value}
          minWidth="200"
          accessibilityLabel={`Choose your ${label}`}
          placeholder={`Choose your ${label}`}
          onValueChange={(itemValue) => onChange(itemValue)}
          _selectedItem={{
            bg: "gray.700",
            borderRadius: "md",
            endIcon: <CheckIcon size="5" />,
          }}
          _actionSheetContent={{
            backgroundColor: "gray.800",
            borderRadius: "lg",
          }}
          _actionSheetBody={{
            backgroundColor: "gray.800",
          }}
          _item={{
            bg: "gray.800",
            my: 0.5,
            _text: {
              color: "white",
            },
            _pressed: {
              bg: "gray.700",
              borderRadius: "md",
            },
          }}
          py={3}
          px={5}
          height={50}
          borderRadius="md"
          bg="gray.800"
          borderColor="transparent"
          placeholderTextColor="gray.600"
          fontSize="md"
          color="white"
          {...props}
        >
          {children} {/* Ensure unique children are passed */}
        </Select>
      </Box>
    );
  };
  
export default CustomSelect;