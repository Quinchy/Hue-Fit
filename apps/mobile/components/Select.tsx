// components/Select.tsx
import React, { useState } from "react";
import {
  Box,
  Text,
  Select as NBSelect,
  ISelectProps,
  CheckIcon,
  HStack,
  Pressable,
  Modal,
  VStack,
  ScrollView,
} from "native-base";
import { Asterisk, TriangleAlert, Info } from "lucide-react-native";
import { colors, applyOpacity } from "../constants/colors";

interface InfoEntry {
  hex: string;
  description: string;
}
type InfoContent = Record<string, string | InfoEntry>;

export interface SelectProps extends Omit<ISelectProps, "onValueChange"> {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  children?: React.ReactNode;
  required?: boolean;
  error?: string;
  infoContent?: InfoContent;
  placeholder?: string;
}

// Extend React.FC to include the Item subcomponent
interface SelectComponent extends React.FC<SelectProps> {
  Item: typeof NBSelect.Item;
}

const Select: SelectComponent = ({
  label = "Select an option",
  placeholder,
  value,
  onValueChange,
  children,
  required = false,
  error,
  infoContent,
  isDisabled = false,
  ...props
}) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const placeholderText =
    placeholder ?? `Please select your ${label.toLowerCase()}`;
  const disabledBg = colors.darkGrey;
  const disabledText = applyOpacity(colors.greyWhite, 0.35);
  const disabledBorder = applyOpacity(colors.greyWhite, 0.10);

  const toggleInfo = () => {
    if (infoContent) setIsInfoOpen(!isInfoOpen);
  };

  return (
    <>
      <HStack mb={1} width="100%" alignItems="center">
        <Text
          fontSize="md"
          fontWeight="bold"
          color={isDisabled ? disabledText : colors.white}
        >
          {label}
        </Text>
        {required && <Asterisk size={12} color={colors.white} />}
        {infoContent && !isDisabled && (
          <Pressable ml={2} onPress={toggleInfo}>
            <Info size={16} color={colors.greyWhite} />
          </Pressable>
        )}
      </HStack>

      <Box
        width="100%"
        borderWidth={error ? 2 : 1}
        borderColor={
          error
            ? colors.warning
            : isDisabled
            ? disabledBorder
            : applyOpacity(colors.greyWhite, 0.35)
        }
        borderRadius="md"
        bg={isDisabled ? disabledBg : "transparent"}
      >
        <NBSelect
          selectedValue={value}
          accessibilityLabel={label}
          placeholder={placeholderText}
          placeholderTextColor={
            isDisabled ? disabledText : applyOpacity(colors.greyWhite, 0.35)
          }
          onValueChange={onValueChange}
          isDisabled={isDisabled}
          width="100%"
          py={3}
          px={5}
          height={50}
          borderRadius="md"
          bg={isDisabled ? disabledBg : colors.darkGrey}
          borderColor="transparent"
          fontSize="md"
          color={isDisabled ? disabledText : colors.white}
          _disabled={{
            bg: disabledBg,
            _text: { color: disabledText },
          }}
          _selectedItem={{
            bg: isDisabled ? disabledBg : applyOpacity(colors.greyWhite, 0.2),
            borderRadius: "md",
            endIcon: <CheckIcon size={5} />,
          }}
          _actionSheetContent={{
            backgroundColor: colors.darkGrey,
            borderRadius: "lg",
          }}
          _actionSheetBody={{
            backgroundColor: colors.darkGrey,
          }}
          _item={{
            bg: colors.darkGrey,
            my: 0.5,
            _text: { color: colors.white },
            _pressed: {
              bg: applyOpacity(colors.greyWhite, 0.2),
              borderRadius: "md",
            },
          }}
          {...props}
        >
          {children}
        </NBSelect>
      </Box>

      {error && (
        <HStack space={1} alignItems="center" mt={1}>
          <TriangleAlert size={16} color={colors.warning} />
          <Text fontSize="sm" color={colors.warning}>
            {error}
          </Text>
        </HStack>
      )}

      {infoContent && !isDisabled && (
        <Modal isOpen={isInfoOpen} onClose={toggleInfo} size="lg">
          <Modal.Content bg={colors.darkGrey}>
            <Modal.CloseButton
              bg="transparent"
              _pressed={{ bg: applyOpacity(colors.greyWhite, 0.1) }}
            />
            <Modal.Header bg={colors.darkGrey}>
              <Text color={colors.white} fontSize="lg" fontWeight="bold">
                {label}
              </Text>
            </Modal.Header>
            <Modal.Body>
              <ScrollView>
                <VStack space={4}>
                  {Object.entries(infoContent).map(([key, entry]) => {
                    const title = key
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ");
                    if (typeof entry === "string") {
                      return (
                        <Text key={key} color={colors.white} fontSize="md">
                          {`${title}: ${entry}`}
                        </Text>
                      );
                    } else {
                      return (
                        <HStack key={key} space={3} alignItems="center">
                          <Box size={6} bg={entry.hex} borderRadius="full" />
                          <VStack>
                            <Text color={colors.white} fontSize="md">
                              {title}
                            </Text>
                            <Text color={colors.greyWhite} fontSize="sm">
                              {entry.description}
                            </Text>
                          </VStack>
                        </HStack>
                      );
                    }
                  })}
                </VStack>
              </ScrollView>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      )}
    </>
  );
};

// Attach the NativeBase Select.Item subcomponent
Select.Item = NBSelect.Item;

export default Select;
