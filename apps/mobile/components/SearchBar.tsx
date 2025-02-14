// components/SearchBar.tsx
import React, { useState } from 'react';
import { Box, Input, Icon } from 'native-base';
import { Search } from 'lucide-react-native';

type SearchBarProps = {
  placeholder?: string;
  onChangeText?: (text: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <Box borderRadius={10} bg="#2E2E2E" width="100%" height={50}>
      <Input
        placeholder={placeholder}
        placeholderTextColor="#C0C0C090"
        fontSize="sm"
        fontWeight={300}
        height={50}
        borderRadius={10}
        p={2}
        onChangeText={onChangeText}
        variant="unstyled"
        color="white"
        InputLeftElement={<Icon as={<Search />} color="#C0C0C0" marginLeft={3} />}
        // Override focus style to use a specific border color.
        _focus={{
          borderColor: "#C0C0C090", // Updated focus border color.
          bg: "#272727",
          selectionColor: '#c0c0c035',
        }}
        // Use onFocus and onBlur to set a flag if needed elsewhere.
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // Optional: Remove the dynamic borderColor if not needed.
        borderColor={isFocused ? "#C0C0C090" : "#c0c0c035"}
        borderWidth={1}
      />
    </Box>
  );
};

export default SearchBar;
