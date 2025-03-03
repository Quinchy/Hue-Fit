import React, { useState, useEffect } from "react";
import { ScrollView, Image, View, StatusBar, TouchableOpacity } from "react-native";
import { VStack, Text, Box, HStack, IconButton, Spinner, Skeleton, Select, Center } from "native-base";
import { House, Menu, ChevronRight, Camera } from "lucide-react-native";
import BackgroundProvider from "../../providers/BackgroundProvider";
import DefaultButton from "../../components/Button";
import CustomInput from "../../components/Input";
import OutlineButton from "../../components/OutlineButton";
import Shirt from "../../assets/icons/Shirt.svg";
import Pants from "../../assets/icons/Pants.svg";
import Sneaker from "../../assets/icons/Sneaker.svg";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
import * as NavigationBar from "expo-navigation-bar";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import CustomSelect from "../../components/Select";
import { LinearGradient } from "expo-linear-gradient";
import { EXPO_PUBLIC_API_URL } from '@env';

const PlaygroundScreen: React.FC = ({ route, navigation }) => {
  useEffect(() => {
    console.log("Route Params:", route.params);
  }, [route.params]);

  const { 
    outfit_name, 
    upper_wear, 
    lower_wear, 
    footwear, 
    outerwear, 
    color_palette = [], 
    user_inputs, 
    wardrobeId 
  } = route.params || {};

  useEffect(() => {
    const fetchWardrobeDetails = async () => {
      if (!wardrobeId) return;
      setIsFetching(true);
      try {
        const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/generate/get-wardrobe-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wardrobeId }),
        });
        if (!response.ok) {
          console.error('Error fetching wardrobe details:', response.statusText);
          return;
        }
        const data = await response.json();
        console.log('Wardrobe Details:', data);
        if (data && data.wardrobe) {
          const {
            outfitName,
            outfitStyle,
            wardrobeCustomerFeatures,
            outfitDetails: { upper_wear, lower_wear, footwear, outerwear, color_palette },
          } = data.wardrobe;
          setOutfitName(outfitName || "Unnamed Outfit");
          setPreference(outfitStyle || "");
          setHeight(wardrobeCustomerFeatures?.height?.toString() || "");
          setWeight(wardrobeCustomerFeatures?.weight?.toString() || "");
          setSkinTone(wardrobeCustomerFeatures?.skintone || "");
          setAge(wardrobeCustomerFeatures?.age?.toString() || "");
          setBodyShape(wardrobeCustomerFeatures?.bodyShape || "");
          const colorPalette = [
            ...(upper_wear?.color ? [{ name: "Upperwear", hexcode: upper_wear.color.hexcode }] : []),
            ...(lower_wear?.color ? [{ name: "Lowerwear", hexcode: lower_wear.color.hexcode }] : []),
            ...(footwear?.color ? [{ name: "Footwear", hexcode: footwear.color.hexcode }] : []),
            ...(outerwear?.color ? [{ name: "Outerwear", hexcode: outerwear.color.hexcode }] : []),
          ];
          setOutfitData({
            outfit_name: outfitName,
            upper_wear,
            lower_wear,
            footwear,
            outerwear,
            color_palette: colorPalette,
          });
        }
      } catch (error) {
        console.error('Error fetching wardrobe details:', error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchWardrobeDetails();
  }, [wardrobeId]);

  const defaultUserInputs = {
    height: "",
    weight: "",
    skintone: "",
    age: "",
    bodyshape: "",
    category: "",
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [outfitData, setOutfitData] = useState({
    outfit_name: outfit_name || "Unnamed Outfit",
    upper_wear: upper_wear || null,
    lower_wear: lower_wear || null,
    footwear: footwear || null,
    outerwear: outerwear || null,
    color_palette: color_palette || [],
  });

  const [outfitName, setOutfitName] = useState(outfitData.outfit_name || "Unnamed Outfit");
  const [height, setHeight] = useState(user_inputs?.height?.toString() || defaultUserInputs.height);
  const [weight, setWeight] = useState(user_inputs?.weight?.toString() || defaultUserInputs.weight);
  const [skinTone, setSkinTone] = useState(user_inputs?.skintone || defaultUserInputs.skintone);
  const [age, setAge] = useState(user_inputs?.age?.toString() || defaultUserInputs.age);
  const [bodyShape, setBodyShape] = useState(user_inputs?.bodyshape || defaultUserInputs.bodyshape);
  const [preference, setPreference] = useState(user_inputs?.category || defaultUserInputs.category);

  const translateX = useSharedValue(300);
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("#ffffff01");

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const openMenu = () => {
    translateX.value = withTiming(0, { duration: 300 });
    setMenuOpen(true);
  };

  const closeMenu = () => {
    translateX.value = withTiming(300, { duration: 300 }, () => runOnJS(setMenuOpen)(false));
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setIsFetching(true);
    const userInputs = {
      outfit_name: outfitName,
      height: parseFloat(height) || 0,
      weight: parseFloat(weight) || 0,
      age: parseInt(age, 10) || 0,
      skintone: skinTone,
      bodyshape: bodyShape,
      category: preference,
    };
    try {
      const response = await fetch(`https://hue-fit-ai.onrender.com/generate-outfit?unique=${Date.now()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "close",
        },
        body: JSON.stringify(userInputs),
      });
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
        setOutfitData({
          outfit_name,
          upper_wear,
          lower_wear,
          footwear,
          outerwear,
          color_palette,
        });
      } else {
        console.error("Error generating outfit:", response.statusText);
      }
    } catch (error) {
      console.error("Error generating outfit:", error);
    } finally {
      setLoading(false);
      setIsFetching(false);
      if (menuOpen) closeMenu();
    }
  };

  useEffect(() => {
    if (wardrobeId) {
      console.log("Fetching wardrobe details for ID:", wardrobeId);
    }
  }, [wardrobeId]);

  const totalPrice =
    (outfitData.upper_wear?.price || 0) +
    (outfitData.lower_wear?.price || 0) +
    (outfitData.footwear?.price || 0) +
    (outfitData.outerwear?.price || 0);

  const isVirtualFittingEnabled = (() => {
    const category = preference ? preference.toUpperCase() : "";
    if (category === "FORMAL") {
      return (
        outfitData.upper_wear?.pngClotheURL != null &&
        outfitData.lower_wear?.pngClotheURL != null &&
        outfitData.outerwear?.pngClotheURL != null
      );
    } else if (category === "CASUAL" || category === "SMART CASUAL") {
      return (
        outfitData.upper_wear?.pngClotheURL != null &&
        outfitData.lower_wear?.pngClotheURL != null
      );
    }
    return false;
  })();

  const renderOutfitItem = (icon: JSX.Element, item: any, fallback: string) => {
    if (isFetching) {
      return (
        <HStack mb={2} space={2} alignItems="center">
          <Skeleton w="20%" h={115} borderRadius="md" />
          <Skeleton.Text flex={1} px={2} lines={3} />
        </HStack>
      );
    }
    if (!item) {
      return (
        <HStack alignItems="center" mb={2} space={2}>
          <Box bg="gray.800" p={3} borderRadius="md" justifyContent="center" alignItems="center">
            {icon}
          </Box>
          <Box bg="gray.800" flex={1} p={4} borderRadius="md" justifyContent="center">
            <Text color="white" fontSize="md" fontWeight="light" textAlign="center">
              {fallback}
            </Text>
          </Box>
        </HStack>
      );
    }
    return (
      <HStack bg="#2E2E2E" borderRadius="md" alignItems="center" mb={2} space={1}>
        <Box paddingLeft={3} py={3} justifyContent="center" alignItems="center">
          <Image source={{ uri: item.thumbnail }} style={{ width: 115, height: 115, borderRadius: 5 }} />
        </Box>
        <VStack flex={1} p={2} justifyContent="space-between">
          <VStack flexGrow={1}>
            <Text color="white" fontSize={13} fontWeight="light">
              {item.name.length > 87 ? `${item.name.substring(0, 87)}...` : item.name}
            </Text>
            <Text fontWeight="light" fontSize={12} color="gray.400">
              ₱{item.price}
            </Text>
          </VStack>
          <OutlineButton
            title="VIEW PRODUCT"
            width="fit-content"
            height={30}
            fontWeight="light"
            fontSize={11}
            py={1}
            onPress={() => {
              if (item.productId) {
                console.log(`View product : ${item.productId}`);
                navigation.navigate("ProductView", { productId: item.productId, recommendedColor: item.hexcode });
              } else {
                console.error("No productId available for this item.");
              }
            }}
          />
        </VStack>
      </HStack>
    );
  };

  useEffect(() => {
    console.log("Outfit Data:", outfitData);
  }, [outfitData]);

  return (
    <View style={{ flex: 1 }}>
      <BackgroundProvider>
        <ScrollView>
          <StatusBar backgroundColor="#ffffff01" />
          <VStack px={4} py={2} mt={10}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Text color="white" fontSize="2xl" fontWeight="bold">
                {outfitData.outfit_name || "Unnamed Outfit"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  console.log("upperWearPng:", outfitData.upper_wear.pngClotheURL);
                  console.log("lowerWearPng:", outfitData.lower_wear.pngClotheURL);
                  console.log("outerWearPng:", preference.toUpperCase() === "FORMAL" ? outfitData.outerwear?.pngClotheURL : null);
                  navigation.navigate("VirtualFitting", {
                    upperWearPng: outfitData.upper_wear.pngClotheURL,
                    lowerWearPng: outfitData.lower_wear.pngClotheURL,
                    outerWearPng: preference.toUpperCase() === "FORMAL" ? outfitData.outerwear?.pngClotheURL : null,
                  });
                }}
                disabled={!isVirtualFittingEnabled}
                style={{ opacity: isVirtualFittingEnabled ? 1 : 0.5 }}
              >
                <Camera color="white" size={24} />
              </TouchableOpacity>
            </HStack>
            <VStack>
              <Text color="#C0C0C0" fontSize="md" fontWeight="light" textTransform="uppercase" mb={2}>
                Recommended Outfit
              </Text>
              <VStack mb={2} alignItems="flex-end">
                <HStack space={2}>
                  {isFetching ? (
                    <Skeleton h={8} w={8} borderRadius="md" />
                  ) : outfitData.color_palette.length > 0 ? (
                    outfitData.color_palette.map((color, index) => (
                      <Box
                        key={index}
                        bg={color.hexcode}
                        width={8}
                        height={8}
                        borderRadius="md"
                        borderWidth={1}
                        borderColor="gray.800"
                      />
                    ))
                  ) : (
                    <Text color="gray.400" fontSize="sm">
                      No colors available.
                    </Text>
                  )}
                </HStack>
              </VStack>
              {outfitData.outerwear &&
                renderOutfitItem(
                  <Image source={{ uri: outfitData.outerwear.thumbnail }} style={{ width: 30, height: 30, borderRadius: 8 }} />,
                  outfitData.outerwear,
                  "No Outerwear"
                )}
              {renderOutfitItem(<Shirt width={30} height={30} color="white" />, outfitData.upper_wear, "No Upperwear")}
              {renderOutfitItem(<Pants width={30} height={30} color="white" />, outfitData.lower_wear, "No Lowerwear")}
              {renderOutfitItem(<Sneaker width={30} height={30} color="white" />, outfitData.footwear, "No Footwear")}
              <VStack alignItems="flex-end">
                {isFetching ? (
                  <Skeleton.Text lines={1} px={2} />
                ) : (
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    Total Price: ₱{parseFloat(totalPrice || 0).toFixed(2)}
                  </Text>
                )}
              </VStack>
            </VStack>
            <DefaultButton
              title={loading ? "Generating..." : "RE-GENERATE"}
              mt={10}
              mb={150}
              onPress={handleRegenerate}
              isDisabled={loading}
              leftIcon={loading ? <Spinner color="white" size="sm" /> : undefined}
            />
          </VStack>
        </ScrollView>
      </BackgroundProvider>
    </View>
  );
};

export default PlaygroundScreen;
