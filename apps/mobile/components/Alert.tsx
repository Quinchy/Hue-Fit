// components/Alert.tsx
import React, { useEffect, useState } from "react";
import {
  PresenceTransition,
  Alert as NBAlert,
  VStack,
  HStack,
  Text,
  IconButton,
  CloseIcon,
} from "native-base";
import { colors, applyOpacity } from "../constants/colors";

export type AlertStatus = "success" | "error" | "warning" | "info";

interface AlertProps {
  message: string;
  status?: AlertStatus;
  /** How long before it begins to fade out (ms) */
  duration?: number;
  onClose: () => void;
}

const statusColorMap: Record<AlertStatus, string> = {
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
};

const statusBgMap: Record<AlertStatus, string> = {
  success: colors.successAccentBg,
  error: colors.errorAccentBg,
  warning: colors.warningAccentBg,
  info: colors.infoAccentBg,
};

const TRANSITION_DURATION = 300;

const Alert: React.FC<AlertProps> = ({
  message,
  status = "error",
  duration = 3000,
  onClose,
}) => {
  const accent = statusColorMap[status];
  const bgColor = statusBgMap[status];
  const textColor = colors.black;

  const [isVisible, setIsVisible] = useState(true);

  // trigger exit animation after `duration`
  useEffect(() => {
    const hideTimer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(hideTimer);
  }, [duration]);

  // once exit animation finishes, invoke onClose
  useEffect(() => {
    if (!isVisible) {
      const closeTimer = setTimeout(onClose, TRANSITION_DURATION);
      return () => clearTimeout(closeTimer);
    }
  }, [isVisible, onClose]);

  return (
    <PresenceTransition
      visible={isVisible}
      initial={{ translateY: -50, opacity: 0 }}
      animate={{
        translateY: 0,
        opacity: 1,
        transition: { duration: TRANSITION_DURATION },
      }}
      exit={{
        translateY: -50,
        opacity: 0,
        transition: { duration: TRANSITION_DURATION },
      }}
      style={{
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        zIndex: 999,
      }}
    >
      <NBAlert
        bg={bgColor}
        borderLeftWidth={4}
        borderLeftColor={accent}
        mb={4}
        mx={4}
        p={3}
        shadow={2}
      >
        <VStack space={2} flexShrink={1} w="100%">
          <HStack alignItems="center" justifyContent="space-between">
            <HStack space={2} alignItems="center" flexShrink={1}>
              <NBAlert.Icon color={accent} />
              <Text fontSize="md" color={textColor}>
                {message}
              </Text>
            </HStack>
            <IconButton
              onPress={() => setIsVisible(false)}
              icon={<CloseIcon size="3" color={textColor} />}
              borderRadius="full"
              _pressed={{
                bg: applyOpacity(accent, 0.2),
              }}
            />
          </HStack>
        </VStack>
      </NBAlert>
    </PresenceTransition>
  );
};

export default Alert;
