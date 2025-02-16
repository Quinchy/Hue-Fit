import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, Image, StatusBar, Animated, Easing } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, VStack, HStack, Box, Skeleton, Pressable as NBPressable } from "native-base";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import OutlineButton from "../../components/OutlineButton";
import { EXPO_PUBLIC_API_URL } from "@env";
import LoadingSpinner from "../../components/Loading";

interface OutfitItem {
  productId: number;
  price: string | number;
  productName: string;
  colorName: string;
  colorHex: string;
  productVariantImage: string | null;
}

interface OutfitData {
  id: number;
  name: string;
  style?: string;
  items: OutfitItem[];
}

// AnimatedPressable: Animates its background color from "#191919" to "#1F1F1F" on press.
const AnimatedPressable = ({ children, onPress, style }: any) => {
  const animValue = useRef(new Animated.Value(0)).current;

  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#191919", "#1F1F1F"],
  });

  const handlePressIn = () => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  return (
    <NBPressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[style, { backgroundColor }]}>
        {children}
      </Animated.View>
    </NBPressable>
  );
};

const GeneratedOutfitViewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { outfitId } = route.params as { outfitId: number };

  const [loading, setLoading] = useState<boolean>(false);
  const [outfitData, setOutfitData] = useState<OutfitData | null>(null);

  useEffect(() => {
    const fetchOutfitDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${EXPO_PUBLIC_API_URL}/api/mobile/generate/get-generated-outfit-info`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ outfitId }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setOutfitData(data);
        } else {
          console.error("Error fetching outfit details:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching outfit details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfitDetails();
  }, [outfitId]);

  const calculateTotalPrice = () => {
    if (!outfitData || !outfitData.items) return 0;
    return outfitData.items.reduce(
      (total, item) => total + parseFloat(item.price as string || "0"),
      0
    );
  };

  const renderOutfitItem = (item: OutfitItem) => {
    if (!item) return null;

    const thumbnail = item.productVariantImage;
    const { colorName, productName, price } = item;

    return (
      <HStack bg="#2E2E2E" borderRadius="md" alignItems="center" mb={2} space={1}>
        <Box paddingLeft={3} py={3} justifyContent="center" alignItems="center">
          {thumbnail ? (
            <Image
              source={{ uri: thumbnail }}
              style={{ width: 115, height: 115, borderRadius: 5 }}
            />
          ) : (
            <Skeleton w={115} h={115} borderRadius="md" />
          )}
        </Box>
        <VStack flex={1} p={2} justifyContent="space-between">
          <VStack flexGrow={1}>
            <Text color="white" fontSize={13} fontWeight="light">
              {`${colorName} ${productName}`}
            </Text>
            <Text fontWeight="light" fontSize={12} color="gray.400">
              ₱{price}
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
                navigation.navigate("ProductView", { productId: item.productId });
              } else {
                console.error("No productId available for this item.");
              }
            }}
          />
        </VStack>
      </HStack>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#191919", paddingTop: insets.top }}
        edges={["top", "left", "right"]}
      >
        <LoadingSpinner
          size={300}
          messages="Loading generated outfit details..."
          visible={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#191919" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar backgroundColor="#191919" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <VStack flex={1} p={4}>
          <HStack alignItems="center" space={2} mb={2} style={{ paddingTop: 10 }}>
            <AnimatedPressable
              onPress={() => navigation.goBack()}
              style={{
                padding: 8,
                borderRadius: 24,
              }}
            >
              <ArrowLeft color="#FFF" size={24} />
            </AnimatedPressable>
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}>
              Generated Outfit Details
            </Text>
          </HStack>
          <Text color="white" fontSize="2xl" fontWeight="bold" mt={4}>
            {outfitData?.name || "Unnamed Outfit"}
          </Text>
          <Text color="#C0C0C0" fontSize="md" fontWeight="light" mt={2} mb={4}>
            RECOMMENDED OUTFIT
          </Text>
          {/* Render Color Palette */}
          <HStack mb={4} space={2}>
            {outfitData && outfitData.items && outfitData.items.length > 0 ? (
              outfitData.items.map((item, index) => (
                <Box
                  key={index}
                  bg={item.colorHex || "#000"}
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
          {/* Render Each Outfit Item */}
          {outfitData &&
            outfitData.items &&
            outfitData.items.map((item, index) => (
              <View key={index}>{renderOutfitItem(item)}</View>
            ))}
          <VStack alignItems="flex-end" mt={4} mb={50}>
            <Text color="white" fontSize="lg" fontWeight="bold">
              Total Price: ₱{calculateTotalPrice().toFixed(2)}
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GeneratedOutfitViewScreen;
