// components/Home/FilterBar.tsx
import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, applyOpacity } from "../../constants/colors";
import { Layers, Shirt } from "lucide-react-native";
import Jacket from "../../assets/icons/Jacket.svg";
import Sneaker from "../../assets/icons/Sneaker.svg";
import Trousers from "../../assets/icons/Trousers.svg";

const FILTER_OPTIONS = [
  "ALL CLOTHINGS",
  "OUTERWEAR",
  "UPPERWEAR",
  "LOWERWEAR",
  "FOOTWEAR",
] as const;

const FILTER_ICONS: Record<
  (typeof FILTER_OPTIONS)[number],
  React.ComponentType<any>
> = {
  "ALL CLOTHINGS": Layers,
  OUTERWEAR: Jacket,
  UPPERWEAR: Shirt,
  LOWERWEAR: Trousers,
  FOOTWEAR: Sneaker,
};

const UniformIcon = ({
  IconComponent,
  size = 16,
  color,
  style,
}: {
  IconComponent: React.ComponentType<any>;
  size?: number;
  color?: string;
  style?: object;
}) => (
  <IconComponent
    width={size}
    height={size}
    stroke={color}
    strokeWidth={1.5}
    style={style}
  />
);

type Props = {
  activeFilters: string[];
  onFiltersChange: (newFilters: string[]) => void;
};

export default function FilterBar({ activeFilters, onFiltersChange }: Props) {
  const handlePress = (filter: string) => {
    if (filter === "ALL CLOTHINGS") {
      return onFiltersChange(["ALL CLOTHINGS"]);
    }

    let next = activeFilters.filter((f) => f !== "ALL CLOTHINGS");

    if (next.includes(filter)) next = next.filter((f) => f !== filter);
    else next.push(filter);

    if (next.length === 0) next = ["ALL CLOTHINGS"];
    onFiltersChange(next);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10 }}
    >
      {FILTER_OPTIONS.map((filter) => {
        const isActive = activeFilters.includes(filter);
        const IconComponent = FILTER_ICONS[filter];

        return (
          <TouchableOpacity
            key={filter}
            onPress={() => handlePress(filter)}
            activeOpacity={0.75}
            style={[
              styles.filterButton,
              { backgroundColor: isActive ? colors.white : colors.darkGrey },
            ]}
          >
            {IconComponent && (
              <UniformIcon
                IconComponent={IconComponent}
                color={
                  isActive ? colors.dark : applyOpacity(colors.greyWhite, 0.85)
                }
                style={{ marginRight: 4 }}
              />
            )}
            <Text
              style={{
                color: isActive
                  ? colors.dark
                  : applyOpacity(colors.greyWhite, 0.75),
                fontSize: 12,
              }}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    height: 35,
    borderWidth: 1,
    borderColor: applyOpacity(colors.white, 0.15),
    borderRadius: 8,
    gap: 2,
  },
});
