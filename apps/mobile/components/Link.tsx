import React from "react";
import { Pressable, PressableProps } from "react-native";
import { Text } from "native-base";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { colors } from "../constants/colors";

interface LinkProps extends Omit<PressableProps, "onPress"> {
  label: string;
  to: keyof Record<string, object | undefined>;
}

const Link: React.FC<LinkProps> = ({ label, to, style, ...props }) => {
  const navigation =
    useNavigation<NavigationProp<Record<string, object | undefined>>>();
  return (
    <Pressable onPress={() => navigation.navigate(to)} style={style} {...props}>
      {({ pressed }) => (
        <Text
          fontSize="md"
          fontWeight="bold"
          color={colors.white}
          style={{ textDecorationLine: pressed ? "underline" : "none" }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

export default Link;
