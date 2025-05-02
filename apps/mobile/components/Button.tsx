// components/Button.tsx
import React, { memo, useRef } from "react";
import { Box, Text, HStack, Spinner, IBoxProps, ITextProps } from "native-base";
import { Pressable, Animated, Easing } from "react-native";
import { colors, applyOpacity } from "../constants/colors";

type ButtonVariant = "solid" | "outline";

interface ButtonProps extends IBoxProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  isLoading?: boolean;
  loadingTitle?: string; // ← new prop
  centerTitle?: boolean;
  isDisabled?: boolean;
  variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({
  title,
  loadingTitle,
  onPress,
  icon,
  isLoading = false,
  centerTitle = false,
  isDisabled = false,
  variant = "solid",
  ...props
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const isOutline = variant === "outline";
  const blocked = isLoading || isDisabled;

  // Press feedback animation
  const handlePressIn = () => {
    if (blocked) return;
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };
  const handlePressOut = () => {
    if (blocked) return;
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  // Colors
  const solidBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.white, applyOpacity(colors.greyWhite, 0.5)],
  });
  const outlineBorder = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.white, applyOpacity(colors.greyWhite, 0.5)],
  });

  const disabledSolidBg = applyOpacity(colors.greyWhite, 0.3);
  const disabledOutlineBorder = applyOpacity(colors.greyWhite, 0.3);

  const textColorSolid = blocked
    ? colors.darkGrey
    : colors.black;
  const textColorOutline = blocked
    ? colors.greyWhite
    : colors.white;

  const spinnerColor = isOutline ? colors.greyWhite : colors.darkGrey;

  // Layout helpers
  const hStackProps = centerTitle
    ? { w: "100%", justifyContent: "center", alignItems: "center", space: 2 }
    : { justifyContent: "center", alignItems: "center", space: 2, flex: 1 };
  const textProps: Pick<ITextProps, "textAlign" | "flex"> = centerTitle
    ? { flex: 1, textAlign: "center" }
    : { textAlign: "center" };

  // Determine the label to show when loading
  const labelWhenLoading =
    loadingTitle ?? (title === "LOGIN" ? "Logging In..." : title);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={blocked}
      style={{ width: "100%" }}
    >
      <Animated.View
        style={{
          backgroundColor: isOutline
            ? "transparent"
            : blocked
            ? disabledSolidBg
            : solidBg,
          borderRadius: 8,
          borderWidth: isOutline ? 1 : 0,
          borderColor: isOutline
            ? blocked
              ? disabledOutlineBorder
              : outlineBorder
            : undefined,
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          width: "100%",
        }}
        {...props}
      >
        {isLoading ? (
          <HStack space={2} alignItems="center">
            <Spinner color={spinnerColor} />
            <Text
              color={isOutline ? textColorOutline : textColorSolid}
              fontWeight="bold"
              fontSize="md"
            >
              {labelWhenLoading}
            </Text>
          </HStack>
        ) : (
          <HStack {...hStackProps}>
            {icon && <Box>{icon}</Box>}
            <Text
              color={isOutline ? textColorOutline : textColorSolid}
              fontWeight="bold"
              fontSize="md"
              {...textProps}
            >
              {title}
            </Text>
          </HStack>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default memo(Button);
