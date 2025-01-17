// components/SearchBar.tsx
import React from 'react';
import { Box, Input, Icon } from 'native-base';
import { Search } from 'lucide-react-native';
import { useState } from 'react';

type SearchBarProps = {
  placeholder?: string;
  onChangeText?: (text: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Box borderRadius="md" bg="dark.100"  width="100%">
      <Input
        placeholder={placeholder}
        placeholderTextColor="dark.400"
        fontSize="sm"
        fontWeight={300}
        height={10}
        borderRadius={10}
        p={2}
        onChangeText={onChangeText}
        variant="unstyled"
        color="white"
        InputLeftElement={<Icon as={<Search />} color="dark.400" marginLeft={3} />}
        _focus={
          isFocused
          ? {
            bg: "dark.100",
            selectionColor: 'dark.400',
          }
          : {}
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </Box>
  );
};

export default SearchBar;
