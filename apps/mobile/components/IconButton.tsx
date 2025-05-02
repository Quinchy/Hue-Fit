// components/IconButton.tsx
import React from "react";
import {
  IconButton as NBIconButton,
  IIconButtonProps,
  useTheme,
} from "native-base";
import { applyOpacity, colors } from "../constants/colors";

interface IconButtonProps extends IIconButtonProps {
  /** The icon to render, e.g. <ArrowLeft color={colors.white} size={24} /> */
  icon: React.ReactElement;
}

/**
 * A drop-in replacement for NativeBase’s IconButton
 * with your app’s default styling (full circle, semi-opaque dark bg).
 */
export default function IconButton(props: IconButtonProps) {
  const { icon, ...rest } = props;

  return (
    <NBIconButton
      icon={icon}
      borderRadius="full"
      bg={applyOpacity(colors.dark, 0.5)}
      _pressed={{
        bg: applyOpacity(colors.dark, 0.7),
      }}
      {...rest}
    />
  );
}
