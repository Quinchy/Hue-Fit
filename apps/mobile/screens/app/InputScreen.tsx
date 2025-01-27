import React, { useState, useEffect } from "react";
import { ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack, Text, HStack, Center, IconButton, Select } from "native-base";
import { ArrowLeft } from "lucide-react-native";
import BackgroundProvider from "../../providers/BackgroundProvider";
import CustomInput from "../../components/Input";
import CustomSelect from "../../components/Select";
import DefaultButton from "../../components/Button";
import GradientCard from "../../components/GradientCard";
import LoadingSpinner from "../../components/Loading"; // For loading animation
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_API_URL } from '@env';

const InputScreen: React.FC = ({ navigation }) => {
  const [outfitName, setOutfitName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [bodyShape, setBodyShape] = useState("");
  const [age, setAge] = useState("");
  const [preference, setPreference] = useState("All Random"); // User preference
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user').then((user) => user && JSON.parse(user).id);
        if (userData) {
          setUserId(userData);
        } else {
          console.warn('No user data found in AsyncStorage');
          // Optionally, navigate to login screen
          navigation.navigate("Login");
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    getUser();
  }, [navigation]);

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const userFeatures = {
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age, 10),
        skintone: skinTone, // Match "skintone"
        bodyshape: bodyShape, // Match "bodyshape"
        category: preference, // Match "category"
        outfit_name: outfitName, // Match "outfit_name"
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

        // Extract necessary data for navigation
        const { outfit_name, best_combination } = data;
        const { upper_wear, lower_wear, footwear, outerwear } = best_combination;

        // Build the color palette from the hexcodes
        const color_palette = [
          { name: "Upperwear", hexcode: upper_wear?.hexcode },
          { name: "Lowerwear", hexcode: lower_wear?.hexcode },
          { name: "Footwear", hexcode: footwear?.hexcode },
          ...(outerwear ? [{ name: "Outerwear", hexcode: outerwear?.hexcode }] : []),
        ].filter((color) => color.hexcode); // Filter out undefined hexcodes

        const passedData = {
          outfit_name,
          upper_wear,
          lower_wear,
          footwear,
          ...(outerwear && { outerwear }), // Include outerwear if available
          color_palette, // Pass the built color palette
          user_inputs: userFeatures, // Pass the user inputs
        };
        console.log("User ID:", userId);
        // Send data to the new API
        await fetch(`http://192.168.254.105:3000/api/mobile/generate/create-wardrobe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            generate_outfit_response: data,
            user_inputs: userFeatures,
            userId: userId,
          }),
        });
        setLoading(false);
        // Navigate to the Playground screen and pass the data
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
    ); // Keep showing the loading spinner until data is fetched
  }
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync('#0f0f0f')
  return (
    <BackgroundProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Center mt={5} mb={10}>
            <GradientCard>
              <Center mb={6}>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  GENERATE OUTFIT
                </Text>
                <Text fontSize="md" color="#C0C0C0" fontWeight="light" textAlign="center">
                  Fill-up the form to let an AI pick an outfit for you.
                </Text>
              </Center>

              {/* Input Form */}
              <VStack space={4}>
                <CustomInput
                  label="Outfit Name"
                  placeholder="Give this outfit a name"
                  value={outfitName}
                  onChangeText={setOutfitName}
                  variant="filled"
                />
                {/* User Features Label */}
                <Text fontSize="lg" fontWeight="bold" color="white" mt={2}>
                  Your Physical Data
                </Text>
                <CustomInput
                  label="Height"
                  placeholder="Type your Height (in cm)"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  variant="filled"
                />
                <CustomInput
                  label="Weight"
                  placeholder="Type your Weight (in kg)"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  variant="filled"
                />
                <CustomSelect
                  label="Skin Tone"
                  value={skinTone} // Bind state value
                  onChange={(value) => setSkinTone(value)} // Update state
                >
                  <Select.Item label="Fair" value="Fair" />
                  <Select.Item label="Light" value="Light" />
                  <Select.Item label="Medium" value="Medium" />
                  <Select.Item label="Dark" value="Dark" />
                  <Select.Item label="Deep" value="Deep" />
                </CustomSelect>
                <CustomSelect
                  label="Body Shape"
                  value={bodyShape} // Bind state value
                  onChange={(value) => setBodyShape(value)} // Update state
                >
                  <Select.Item label="Bulky" value="Bulky" />
                  <Select.Item label="Athletic" value="Athletic" />
                  <Select.Item label="Skinny" value="Skinny" />
                  <Select.Item label="Fit" value="Fit" />
                  <Select.Item label="Skinny Fat" value="Skinny Fat" />
                  <Select.Item label="Chubby" value="Chubby" />
                </CustomSelect>
                <CustomInput
                  label="Age"
                  placeholder="Type your Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  variant="filled"
                />

                {/* User Preference Label */}
                <Text fontSize="lg" fontWeight="bold" color="white" mt={4}>
                  Your Outfit Preference
                </Text>

                <CustomSelect
                  label="Fashion Style"
                  value={preference} // Bind state value
                  onChange={(value) => setPreference(value)} // Update state
                >
                  <Select.Item label="All Random" value="All Random" />
                  <Select.Item label="Casual" value="Casual" />
                  <Select.Item label="Smart Casual" value="Smart Casual" />
                  <Select.Item label="Formal" value="Formal" />
                </CustomSelect>

                {/* Generate Button */}
                <DefaultButton my={10} title="GENERATE" onPress={handleGenerate} />
              </VStack>
            </GradientCard>
          </Center>
        </ScrollView>
      </SafeAreaView>
    </BackgroundProvider>
  );
};

export default InputScreen;
