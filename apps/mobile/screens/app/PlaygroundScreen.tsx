import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Image,
  View,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import {
  VStack,
  Text,
  Box,
  HStack,
  Spinner,
  Skeleton,
  useToast,
} from "native-base";
import { CheckCircle, Circle, Camera } from "lucide-react-native";
import BackgroundProvider from "../../providers/BackgroundProvider";
import Button from "../../components/Button";
import OutlineButton from "../../components/OutlineButton";
import * as NavigationBar from "expo-navigation-bar";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { EXPO_PUBLIC_API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

// RecommendedProductCard Component
const RecommendedProductCard = ({
  item,
  isSelected,
  selectedSizeData, // will hold { sizeId, shopId }
  onSelectChange,
  navigation,
  disabled,
}) => {
  const [sizes, setSizes] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(false);
  const [localSelectedSize, setLocalSelectedSize] = useState(
    selectedSizeData ? selectedSizeData.sizeId : null
  );
  const toast = useToast();

  // Fetch available sizes for the product variant.
  const fetchSizes = async () => {
    setLoadingSizes(true);
    try {
      const response = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/products/get-product-variant-size`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productVariantId: item.productVariantId }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(
          "Fetched variant sizes:",
          JSON.stringify(data.variantSizes, null, 2)
        );
        // Assuming the API returns an array in data.variantSizes.
        let variantSizes = data.variantSizes || [];
        // Define the expected order of sizes.
        const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
        // Sort by the abbreviation based on the defined order.
        variantSizes.sort((a, b) => {
          const aIndex = sizeOrder.indexOf(a.Size.abbreviation);
          const bIndex = sizeOrder.indexOf(b.Size.abbreviation);
          if (aIndex === -1 || bIndex === -1) {
            return a.Size.abbreviation.localeCompare(b.Size.abbreviation);
          }
          return aIndex - bIndex;
        });
        setSizes(variantSizes);
      } else {
        console.error(
          "Error fetching sizes for product variant",
          item.productVariantId
        );
      }
    } catch (error) {
      console.error("Error fetching sizes:", error);
    } finally {
      setLoadingSizes(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, [item.productVariantId]);

  // Handle size selection within this card.
  const handleSizeSelect = (sizeId) => {
    const selectedSizeObj = sizes.find((s) => s.id === sizeId);
    setLocalSelectedSize(sizeId);
    onSelectChange(item.productVariantId, {
      sizeId,
      shopId: selectedSizeObj ? selectedSizeObj.Size.shopId : null,
    });
  };

  // Toggle the card selection via the radio button.
  const handleToggleSelection = () => {
    if (isSelected) {
      onSelectChange(item.productVariantId, null);
      setLocalSelectedSize(null);
    } else {
      if (!localSelectedSize && sizes.length > 0) {
        handleSizeSelect(sizes[0].id);
      } else {
        onSelectChange(item.productVariantId, {
          sizeId: localSelectedSize,
          shopId:
            sizes.find((s) => s.id === localSelectedSize)?.Size.shopId || null,
        });
      }
    }
  };

  return (
    <HStack
      bg="#2E2E2E"
      borderRadius="md"
      alignItems="center"
      mb={2}
      space={2}
      padding={2}
    >
      {/* Radio Button */}
      <TouchableOpacity onPress={handleToggleSelection} disabled={disabled}>
        {isSelected ? (
          <CheckCircle color="white" size={24} />
        ) : (
          <Circle color="white" size={24} />
        )}
      </TouchableOpacity>
      {/* Thumbnail Image */}
      <Box>
        <Image
          source={{ uri: item.thumbnail }}
          style={{ width: 80, height: 80, borderRadius: 5 }}
        />
      </Box>
      {/* Product Details */}
      <VStack flex={1} space={1}>
        <HStack alignItems="center" space={2}>
          <Text color="white" fontSize={13} fontWeight="light">
            {item.name.length > 87
              ? `${item.name.substring(0, 87)}...`
              : item.name}
          </Text>
        </HStack>
        <Text fontWeight="light" fontSize={12} color="gray.400">
          ₱{item.price}
        </Text>
        {/* Horizontal scrollable row for product variant sizes */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 5 }}
        >
          {loadingSizes ? (
            <Spinner color="white" />
          ) : sizes.length > 0 ? (
            sizes.map((size) => (
              <TouchableOpacity
                key={size.id}
                onPress={() => handleSizeSelect(size.id)}
                style={{
                  padding: 8,
                  backgroundColor:
                    localSelectedSize === size.id ? "white" : "#555",
                  borderRadius: 5,
                  marginRight: 5,
                }}
                disabled={disabled}
              >
                <Text
                  style={{
                    color: localSelectedSize === size.id ? "#2E2E2E" : "white",
                  }}
                >
                  {size.Size.abbreviation}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text color="gray.400" fontSize="sm">
              No sizes available.
            </Text>
          )}
        </ScrollView>
        <OutlineButton
          title="VIEW PRODUCT"
          onPress={() => {
            if (item.productId) {
              console.log(`View product : ${item.productId}`);
              navigation.navigate("ProductView", {
                productId: item.productId,
                recommendedColor: item.hexcode,
              });
            } else {
              console.error("No productId available for this item.");
            }
          }}
          width="fit-content"
          height={30}
          fontSize={11}
          py={1}
          disabled={disabled}
        />
      </VStack>
    </HStack>
  );
};

// PlaygroundScreen Component
const PlaygroundScreen = ({ route, navigation }) => {
  const toast = useToast();
  const [addingToCart, setAddingToCart] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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
    wardrobeId,
  } = route.params || {};

  // State for fetching wardrobe details and outfit data.
  const [isFetching, setIsFetching] = useState(false);
  const [outfitData, setOutfitData] = useState({
    outfit_name: outfit_name || "Unnamed Outfit",
    upper_wear: upper_wear || null,
    lower_wear: lower_wear || null,
    footwear: footwear || null,
    outerwear: outerwear || null,
    color_palette: color_palette || [],
  });
  const [outfitName, setOutfitName] = useState(
    outfitData.outfit_name || "Unnamed Outfit"
  );
  const [height, setHeight] = useState(user_inputs?.height?.toString() || "");
  const [weight, setWeight] = useState(user_inputs?.weight?.toString() || "");
  const [skinTone, setSkinTone] = useState(user_inputs?.skintone || "");
  const [age, setAge] = useState(user_inputs?.age?.toString() || "");
  const [bodyShape, setBodyShape] = useState(user_inputs?.bodyshape || "");
  const [preference, setPreference] = useState(user_inputs?.category || "");
  const [loading, setLoading] = useState(false); // for re-generate specifically

  // State for recommended item selections.
  // Keys are productVariantId and values are an object { sizeId, shopId }.
  const [selectedRecommended, setSelectedRecommended] = useState({});

  // Callback passed to each RecommendedProductCard.
  const handleRecommendedSelect = (productVariantId, sizeData) => {
    setSelectedRecommended((prev) => {
      const newState = { ...prev };
      if (sizeData) {
        newState[productVariantId] = sizeData;
      } else {
        delete newState[productVariantId];
      }
      return newState;
    });
  };

  const translateX = useSharedValue(300);
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("#ffffff01");
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const openMenu = () => {
    translateX.value = withTiming(0, { duration: 300 });
  };

  const closeMenu = () => {
    translateX.value = withTiming(300, { duration: 300 });
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setLoading(true);
    setIsFetching(true);
    const userInputsData = {
      outfit_name: outfitName,
      height: parseFloat(height) || 0,
      weight: parseFloat(weight) || 0,
      age: parseInt(age, 10) || 0,
      skintone: skinTone,
      bodyshape: bodyShape,
      category: preference,
    };
    try {
      const response = await fetch(
        `https://hue-fit-ai-v4mw.onrender.com/generate-outfit?unique=${Date.now()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Connection: "close",
          },
          body: JSON.stringify(userInputsData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const { outfit_name, best_combination } = data;
        const { upper_wear, lower_wear, footwear, outerwear } =
          best_combination;
        const color_palette = [
          { name: "Upperwear", hexcode: upper_wear?.hexcode },
          { name: "Lowerwear", hexcode: lower_wear?.hexcode },
          { name: "Footwear", hexcode: footwear?.hexcode },
          ...(outerwear
            ? [{ name: "Outerwear", hexcode: outerwear?.hexcode }]
            : []),
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
      setRegenerating(false);
      closeMenu();
    }
  };

  const addRecommendedToCart = async () => {
    // Check immediately if none is selected.
    if (Object.keys(selectedRecommended).length === 0) {
      toast.show({
        description: "Please select at least one item with a size.",
      });
      return;
    }
    setAddingToCart(true);
    console.log(
      "Starting add to cart with selected items:",
      selectedRecommended
    );
    const user = await AsyncStorage.getItem("user");
    const userId = user ? JSON.parse(user).id : null;
    if (!userId) {
      console.error("User ID not found");
      setAddingToCart(false);
      return;
    }
    const itemsToAdd = [];
    const recommendedItems = [
      outfitData.outerwear,
      outfitData.upper_wear,
      outfitData.lower_wear,
      outfitData.footwear,
    ];
    recommendedItems.forEach((item) => {
      if (item && selectedRecommended[item.productVariantId]) {
        itemsToAdd.push({
          productId: item.productId,
          productVariantId: item.productVariantId,
          productVariantSizeId:
            selectedRecommended[item.productVariantId].sizeId,
          quantity: 1,
          shopId: selectedRecommended[item.productVariantId].shopId,
        });
      }
    });
    console.log("Items to add to cart:", itemsToAdd);
    try {
      for (const payload of itemsToAdd) {
        const response = await fetch(
          `${EXPO_PUBLIC_API_URL}/api/mobile/cart/add-to-cart`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, userId }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to add to cart");
        }
        await response.json();
      }
      toast.show({ description: "Item/s added to cart successfully" });
    } catch (error) {
      console.error(error);
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    console.log("Outfit Data:", outfitData);
  }, [outfitData]);

  // Calculate the total price of all outfit items.
  const totalPrice =
    (outfitData.upper_wear?.price || 0) +
    (outfitData.lower_wear?.price || 0) +
    (outfitData.footwear?.price || 0) +
    (outfitData.outerwear?.price || 0);

  // Compute total price based on selected items. If none are selected, show the full total.
  const computeSelectedTotalPrice = () => {
    const recommendedItems = [
      outfitData.outerwear,
      outfitData.upper_wear,
      outfitData.lower_wear,
      outfitData.footwear,
    ];
    let selectedPrice = 0;
    let anySelected = false;
    recommendedItems.forEach((item) => {
      if (item && selectedRecommended[item.productVariantId]) {
        anySelected = true;
        selectedPrice += item.price;
      }
    });
    return anySelected ? selectedPrice : totalPrice;
  };

  const selectedTotalPrice = computeSelectedTotalPrice();

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

  // Disable all interactive buttons when adding to cart, regenerating, or fetching.
  const disableAll = addingToCart || regenerating || isFetching;

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
                  console.log(
                    "upperWearPng:",
                    outfitData.upper_wear?.pngClotheURL
                  );
                  console.log(
                    "lowerWearPng:",
                    outfitData.lower_wear?.pngClotheURL
                  );
                  console.log(
                    "outerWearPng:",
                    preference.toUpperCase() === "FORMAL"
                      ? outfitData.outerwear?.pngClotheURL
                      : null
                  );
                  navigation.navigate("VirtualFitting", {
                    upperWearPng: outfitData.upper_wear?.pngClotheURL,
                    lowerWearPng: outfitData.lower_wear?.pngClotheURL,
                    outerWearPng:
                      preference.toUpperCase() === "FORMAL"
                        ? outfitData.outerwear?.pngClotheURL
                        : null,
                  });
                }}
                disabled={!isVirtualFittingEnabled || disableAll}
                style={{
                  opacity: isVirtualFittingEnabled && !disableAll ? 1 : 0.5,
                }}
              >
                <Camera color="white" size={24} />
              </TouchableOpacity>
            </HStack>
            <VStack>
              <Text
                color="#C0C0C0"
                fontSize="md"
                fontWeight="light"
                textTransform="uppercase"
                mb={2}
              >
                Recommended Outfit
              </Text>
              {outfitData.outerwear && (
                <RecommendedProductCard
                  item={outfitData.outerwear}
                  navigation={navigation}
                  isSelected={
                    !!selectedRecommended[outfitData.outerwear.productVariantId]
                  }
                  selectedSizeData={
                    selectedRecommended[outfitData.outerwear.productVariantId]
                  }
                  onSelectChange={handleRecommendedSelect}
                  disabled={disableAll}
                />
              )}
              {outfitData.upper_wear && (
                <RecommendedProductCard
                  item={outfitData.upper_wear}
                  navigation={navigation}
                  isSelected={
                    !!selectedRecommended[
                      outfitData.upper_wear.productVariantId
                    ]
                  }
                  selectedSizeData={
                    selectedRecommended[outfitData.upper_wear.productVariantId]
                  }
                  onSelectChange={handleRecommendedSelect}
                  disabled={disableAll}
                />
              )}
              {outfitData.lower_wear && (
                <RecommendedProductCard
                  item={outfitData.lower_wear}
                  navigation={navigation}
                  isSelected={
                    !!selectedRecommended[
                      outfitData.lower_wear.productVariantId
                    ]
                  }
                  selectedSizeData={
                    selectedRecommended[outfitData.lower_wear.productVariantId]
                  }
                  onSelectChange={handleRecommendedSelect}
                  disabled={disableAll}
                />
              )}
              {outfitData.footwear && (
                <RecommendedProductCard
                  item={outfitData.footwear}
                  navigation={navigation}
                  isSelected={
                    !!selectedRecommended[outfitData.footwear.productVariantId]
                  }
                  selectedSizeData={
                    selectedRecommended[outfitData.footwear.productVariantId]
                  }
                  onSelectChange={handleRecommendedSelect}
                  disabled={disableAll}
                />
              )}
              <VStack alignItems="flex-end" mb={4}>
                {isFetching ? (
                  <Skeleton.Text lines={1} px={2} />
                ) : (
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    Total Price: ₱
                    {parseFloat(selectedTotalPrice || 0).toFixed(2)}
                  </Text>
                )}
              </VStack>
            </VStack>
            <VStack space={2} style={{ marginBottom: 150 }}>
              {addingToCart ? (
                <HStack justifyContent="center" alignItems="center" space={2}>
                  <Spinner color="white" />
                  <Text color="white" fontSize="md" fontWeight="bold">
                    Adding to Cart...
                  </Text>
                </HStack>
              ) : (
                <OutlineButton
                  title="Add to Cart"
                  onPress={addRecommendedToCart}
                  width="100%"
                  height={50}
                  py={3}
                  fontSize="md"
                  fontWeight="bold"
                  disabled={disableAll}
                />
              )}
              <Button
                title={regenerating ? "Generating..." : "Re-Generate"}
                mb={150}
                mt={2}
                onPress={handleRegenerate}
                isDisabled={disableAll}
              />
            </VStack>
          </VStack>
        </ScrollView>
      </BackgroundProvider>
    </View>
  );
};

export default PlaygroundScreen;
