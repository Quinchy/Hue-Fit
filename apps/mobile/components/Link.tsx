// src/components/Link.tsx
import React from 'react';
import { Text, Pressable } from 'native-base';

interface LinkProps {
  title: string;
  onPress: () => void;
}

const Link: React.FC<LinkProps> = ({ title, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      <Text color="white" underline fontSize="md" fontWeight="bold">
        {title}
      </Text>
    </Pressable>
  );
};

export default Link;
