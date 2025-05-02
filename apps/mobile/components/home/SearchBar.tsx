// components/SearchBar.tsx
import React, { useState } from "react";
import { Box, Input, Icon } from "native-base";
import { Search } from "lucide-react-native";
import { colors, applyOpacity } from "../../constants/colors";

type SearchBarProps = {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value: string;
};

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onChangeText,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box borderRadius={10} bg={colors.darkGrey} width="100%" height={50}>
      <Input
        placeholder={placeholder}
        placeholderTextColor={applyOpacity(colors.greyWhite, 0.75)}
        fontSize="sm"
        fontWeight={300}
        height={50}
        borderRadius={10}
        p={2}
        onChangeText={onChangeText}
        variant="unstyled"
        color={colors.white}
        InputLeftElement={
          <Icon
            as={<Search size={20} />}
            color={applyOpacity(colors.greyWhite, 0.85)}
            marginLeft={3}
          />
        }
        _focus={{
          borderColor: applyOpacity(colors.greyWhite, 0.75),
          bg: colors.dark,
          selectionColor: applyOpacity(colors.greyWhite, 0.35),
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        borderColor={applyOpacity(colors.greyWhite, 0.15)}
        borderWidth={1}
      />
    </Box>
  );
};

export default SearchBar;
