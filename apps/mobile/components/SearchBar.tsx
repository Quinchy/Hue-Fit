// components/SearchBar.tsx
import React from 'react';
import { Box, Input, Icon } from 'native-base';
import { Search } from 'lucide-react-native';

type SearchBarProps = {
  placeholder?: string;
  onChangeText?: (text: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onChangeText }) => {
  return (
    <Box borderRadius="md" bg="gray.700" paddingX={3} paddingY={1} width="100%">
      <Input
        placeholder={placeholder}
        onChangeText={onChangeText}
        variant="unstyled"
        color="white"
        InputLeftElement={<Icon as={<Search />} color="gray.400" marginLeft={2} />}
        _focus={{
          borderColor: 'transparent',
        }}
      />
    </Box>
  );
};

export default SearchBar;
