// src/screens/account/InputScreen.tsx
import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack, Text, Center, Select } from "native-base";
import BackgroundProvider from "../../providers/BackgroundProvider";
import CustomInput from "../../components/Input";
import CustomSelect from "../../components/Select";
import DefaultButton from "../../components/Button";
import GradientCard from "../../components/GradientCard";
import LoadingSpinner from "../../components/Loading";
import * as NavigationBar from "expo-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "native-base";
import { EXPO_PUBLIC_API_URL } from "@env";

const InputScreen: React.FC = ({ navigation }) => {
  const [outfitName, setOutfitName] = useState("");
  const [preference, setPreference] = useState("All Random");
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
        `http://192.168.254.105:8000/generate-outfit?unique=${Date.now()}`,
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
          ...best_combination, // Use the API-returned best_combination directly
          color_palette,
          user_inputs: userFeatures,
        };
        console.log("User ID:", userId);
        await fetch(`http://192.168.254.105:3000/api/mobile/generate/create-wardrobe`, {
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
      <View style={{ marginTop: 60, marginLeft: 15, marginBottom: 20 }}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          GENERATE OUTFIT
        </Text>
      </View>
      <GradientCard>
        <VStack space={4}>
          <CustomInput
            label="Outfit Name"
            placeholder="Give this outfit a name"
            value={outfitName}
            onChangeText={setOutfitName}
            variant="filled"
            required
          />
          <View>
            <Text fontSize="lg" fontWeight="bold" color="white" mt={4}>
              Your Outfit Preference
            </Text>
            <Text fontSize="md" color="#C0C0C0" fontWeight="light">
              Select a fashion style and generate outfit.
            </Text>
          </View>
          <CustomSelect
            label="Fashion Style"
            value={preference}
            onChange={(value) => setPreference(value)}
            required
          >
            <Select.Item label="All Random" value="All Random" />
            <Select.Item label="Casual" value="Casual" />
            <Select.Item label="Smart Casual" value="Smart Casual" />
            <Select.Item label="Formal" value="Formal" />
          </CustomSelect>
          <DefaultButton mt={10} mb={185} title="GENERATE" onPress={handleGenerate} />
        </VStack>
      </GradientCard>
    </ScrollView>
  );
};

export default InputScreen;
