// src/screens/account/InputScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { VStack, Text, View } from "native-base";
import CustomInput from "../../components/Input";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/Loading";
import * as NavigationBar from "expo-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PUBLIC_API_URL } from "@env";
import { Asterisk } from "lucide-react-native";
import { useTheme, applyOpacity } from "../../providers/ThemeProvider";

interface FashionRadioGroupProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
}

// Internal AnimatedOption component
const AnimatedOption: React.FC<{
  isSelected: boolean;
  theme: any;
  style?: any;
  children: React.ReactNode;
}> = ({ isSelected, theme, style, children, ...props }) => {
  // Create an animated value; initial value depends on isSelected
  const animatedValue = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isSelected ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // Color interpolation does not support native driver
    }).start();
  }, [isSelected, animatedValue]);

  // Interpolate backgroundColor from transparent to 50% opacity dark
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", applyOpacity(theme.colors.dark, 0.5)],
  });

  return (
    <Animated.View style={[style, { backgroundColor }]} {...props}>
      {children}
    </Animated.View>
  );
};

const FashionRadioGroup: React.FC<FashionRadioGroupProps> = ({
  selectedValue,
  onValueChange,
}) => {
  const { theme } = useTheme();
  const options = [
    { label: "Casual", image: require("../../assets/casual.png") },
    { label: "Smart Casual", image: require("../../assets/smart-casual.png") },
    { label: "Formal", image: require("../../assets/formal.png") },
  ];

  return (
    <View style={styles.radioGroupContainer}>
      {options.map((option) => {
        const isSelected = selectedValue === option.label;
        const borderStyles = {
          borderColor: isSelected ? theme.colors.white : theme.colors.grey,
          borderWidth: isSelected ? 2 : 1,
          borderStyle: isSelected ? "solid" : "dashed",
        };

        return (
          <AnimatedOption
            key={option.label}
            isSelected={isSelected}
            theme={theme}
            style={[styles.optionContainer, borderStyles]}
          >
            <TouchableOpacity
              onPress={() => onValueChange(option.label)}
              style={{ flex: 1, alignItems: "center" }}
            >
              <Image
                source={option.image}
                style={styles.optionImage}
                resizeMode="contain"
              />
              <Text style={[styles.optionText, { color: theme.colors.white }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          </AnimatedOption>
        );
      })}
    </View>
  );
};

const InputScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const [outfitName, setOutfitName] = useState("");
  const [preference, setPreference] = useState("Casual");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user").then(
          (user) => user && JSON.parse(user).id
        );
        if (userData) {
          setUserId(userData);
        } else {
          console.warn("No user data found in AsyncStorage");
          navigation.navigate("Login");
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      } finally {
        setLoadingUser(false);
      }
    };
    getUser();
  }, [navigation]);

  const handleGenerate = async () => {
    if (!userId) {
      console.error("User ID is missing. Cannot fetch customer features.");
      return;
    }
    setLoading(true);
    try {
      const featuresResponse = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/user/get-customer-features`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (!featuresResponse.ok) {
        console.error(
          "Error fetching customer features:",
          featuresResponse.statusText
        );
        setLoading(false);
        return;
      }
      const featuresData = await featuresResponse.json();
      const customerFeature = featuresData.customerFeature;
      if (!customerFeature) {
        console.error("No customer features found for this user.");
        setLoading(false);
        return;
      }
      const userFeatures = {
        outfit_name: outfitName,
        category: preference,
        height: customerFeature.height,
        weight: customerFeature.weight,
        age: customerFeature.age,
        skintone: customerFeature.skintone,
        bodyshape: customerFeature.bodyShape,
      };
      const response = await fetch(
        `https://hue-fit-ai-v4mw.onrender.com/generate-outfit?unique=${Date.now()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Connection: "close",
          },
          body: JSON.stringify(userFeatures),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const { outfit_name, best_combination } = data;
        const { upper_wear, lower_wear, footwear, outerwear } = best_combination;
        const color_palette = [
          { name: "Upperwear", hexcode: upper_wear?.hexcode },
          { name: "Lowerwear", hexcode: lower_wear?.hexcode },
          { name: "Footwear", hexcode: footwear?.hexcode },
          ...(outerwear ? [{ name: "Outerwear", hexcode: outerwear?.hexcode }] : []),
        ].filter((color) => color.hexcode);
        const passedData = {
          outfit_name,
          ...best_combination,
          color_palette,
          user_inputs: userFeatures,
        };
        console.log("User ID:", userId);
        await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/generate/store-generated-outfit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generate_outfit_response: data,
            user_inputs: userFeatures,
            userId: userId,
          }),
        });
        setLoading(false);
        navigation.navigate("Playground", passedData);
      } else {
        console.error("Error generating outfit:", response.statusText);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error generating outfit:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        size={300}
        messages={[
          "Matching multiple clothing items...",
          "Creating a personalized color palette...",
          "Browsing curated styles...",
          "Finalizing the best outfit for you...",
        ]}
        visible={true}
      />
    );
  }
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync(theme.colors.dark);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.darkGrey }}>
      <View style={{ marginTop: 50, marginLeft: 15, marginBottom: 10 }}>
        <Text fontSize={28} fontWeight="bold" color={theme.colors.white}>
          Generate Outfit
        </Text>
      </View>
      {/* Card Container */}
      <View style={[styles.cardContainer, { backgroundColor: theme.colors.darkGrey }]}>
        <Text style={[styles.label, { color: theme.colors.white }]}>
          Outfit Name (optional)
        </Text>
        <CustomInput
          placeholder="Give this outfit a name"
          value={outfitName}
          onChangeText={setOutfitName}
          variant="filled"
        />
        <View>
          <Text fontSize="lg" fontWeight="bold" color={theme.colors.white} mt={4}>
            Outfit Style{" "}
            <Asterisk size={12} color={theme.colors.greyWhite} style={{ marginLeft: 2, marginTop: 2 }} />
          </Text>
          <Text fontSize="md" color={theme.colors.greyWhite} fontWeight="light">
            Select a fashion style and generate outfit.
          </Text>
        </View>
        <FashionRadioGroup selectedValue={preference} onValueChange={setPreference} />
        <Button mt={10} mb={75} title="GENERATE" onPress={handleGenerate} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  radioGroupContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  optionContainer: {
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    marginBottom: 10,
  },
  optionImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    textAlign: "center",
  },
  cardContainer: {
    marginHorizontal: 12,
    marginBottom: 20,
    borderRadius: 8,
    padding: 4,
  },
  label: {
    fontSize: 18, // Same as Outfit Style ("lg")
    fontWeight: "bold",
    marginBottom: 8,
  },
});

export default InputScreen;
