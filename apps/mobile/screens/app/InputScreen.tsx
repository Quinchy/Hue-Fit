// src/screens/account/InputScreen.tsx
import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { VStack, Text, View } from "native-base";
import CustomInput from "../../components/Input";
import DefaultButton from "../../components/Button";
import GradientCard from "../../components/GradientCard";
import LoadingSpinner from "../../components/Loading";
import * as NavigationBar from "expo-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PUBLIC_API_URL } from "@env";
import { Asterisk } from "lucide-react-native";

interface FashionRadioGroupProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const FashionRadioGroup: React.FC<FashionRadioGroupProps> = ({ selectedValue, onValueChange }) => {
  // Define the available options along with their images
  const options = [
    { label: "Casual", image: require("../../assets/casual.png") },
    { label: "Smart Casual", image: require("../../assets/smart-casual.png") },
    { label: "Formal", image: require("../../assets/formal.png") },
  ];

  return (
    <View style={styles.radioGroupContainer}>
      {options.map((option) => {
        const isSelected = selectedValue === option.label;
        return (
          <TouchableOpacity
            key={option.label}
            style={[
              styles.optionContainer,
              {
                borderColor: isSelected ? "#fff" : "#4E4E4E",
                borderWidth: isSelected ? 2 : 1,
                borderStyle: isSelected ? "solid" : "dashed",
              },
            ]}
            onPress={() => onValueChange(option.label)}
          >
            <Image source={option.image} style={styles.optionImage} resizeMode="contain" />
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const InputScreen: React.FC<any> = ({ navigation }) => {
  const [outfitName, setOutfitName] = useState("");
  // Default to "Casual" since "All Random" option is removed
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
        console.error("Error fetching customer features:", featuresResponse.statusText);
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
        `https://hue-fit-ai.onrender.com/generate-outfit?unique=${Date.now()}`,
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
  NavigationBar.setBackgroundColorAsync("#0f0f0f");

  return (
    <ScrollView style={{ backgroundColor: "#191919" }}>
      <View style={{ marginTop: 45, marginLeft: 15, marginBottom: 20 }}>
        <Text fontSize={28} fontWeight="bold" color="white">
          Generate Outfit
        </Text>
      </View>
      <GradientCard>
        <VStack space={4} padding={4}>
          <CustomInput
            label="Outfit Name (optional)"
            placeholder="Give this outfit a name"
            value={outfitName}
            onChangeText={setOutfitName}
            variant="filled"
          />
          <View>
            <Text fontSize="lg" fontWeight="bold" color="white" mt={4}>
              Outfit Style <Asterisk size={12} color="#C0C0C0" style={{ marginLeft: 4, marginTop: 2 }} />
            </Text>
            <Text fontSize="md" color="#C0C0C0" fontWeight="light">
              Select a fashion style and generate outfit.
            </Text>
          </View>
          {/* Replace CustomSelect with our custom radio group in grid layout */}
          <FashionRadioGroup selectedValue={preference} onValueChange={setPreference} />
          <DefaultButton mt={10} mb={75} title="GENERATE" onPress={handleGenerate} />
        </VStack>
      </GradientCard>
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
    color: "#fff",
  },
});

export default InputScreen;
