import React, { useState } from 'react';
import { Box, Input, Icon } from 'native-base';
import { Search } from 'lucide-react-native';
import { useTheme } from '../providers/ThemeProvider';

type SearchBarProps = {
  placeholder?: string;
  onChangeText?: (text: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();

  return (
    <Box borderRadius={10} bg={theme.colors.darkGrey} width="100%" height={50}>
      <Input
        placeholder={placeholder}
        placeholderTextColor={theme.colors.greyWhite + "90"}
        fontSize="sm"
        fontWeight={300}
        height={50}
        borderRadius={10}
        p={2}
        onChangeText={onChangeText}
        variant="unstyled"
        color={theme.colors.white}
        InputLeftElement={
          <Icon as={<Search />} color={theme.colors.greyWhite} marginLeft={3} />
        }
        _focus={{
          borderColor: theme.colors.greyWhite + "90",
          bg: theme.colors.dark, // you may choose to use theme.colors.dark or similar
          selectionColor: theme.colors.greyWhite + "35",
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        borderColor={isFocused ? theme.colors.greyWhite + "90" : theme.colors.greyWhite + "35"}
        borderWidth={1}
      />
    </Box>
  );
};

export default SearchBar;
