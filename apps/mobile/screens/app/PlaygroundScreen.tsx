import React, { useEffect, useState } from "react";
import { ScrollView, Image, TouchableOpacity } from "react-native";
import { VStack, Text, Box, HStack, IconButton, Center } from "native-base";
import { House, Menu, MoveRight } from "lucide-react-native";
import BackgroundProvider from "../../providers/BackgroundProvider";
import LoadingSpinner from "../../components/Loading";
import Shirt from '../../assets/icons/Shirt.svg';
import Pants from '../../assets/icons/Pants.svg';
import Sneaker from '../../assets/icons/Sneaker.svg';
import OutlineButton from '../../components/OutlineButton';
import DefaultButton from '../../components/Button';
import { EXPO_PUBLIC_API_URL } from '@env';

const PlaygroundScreen: React.FC = ({ route, navigation }) => {
  const { outfitData, outfitName } = route.params || {};
  const [generatedData, setGeneratedData] = useState([]);
  const [colorPalette, setColorPalette] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchGeneratedProducts = async () => {
    console.log("Fetching generated products...");
    console.log("Sending request with outfitData:", outfitData);

    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/products/get-generated-products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfitData }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        setGeneratedData(data.products);
        setColorPalette(data.colors);
        setTotalPrice(data.totalPrice);
        setLoading(false);
      } else {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in fetchGeneratedProducts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneratedProducts();
  }, []);

  if (loading) {
    return <LoadingSpinner messages={["Fetching generated outfit..."]} />;
  }

  return (
    <BackgroundProvider>
      <ScrollView>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" mt={5} mb={10} px={4} py={2}>
          <IconButton
            icon={<House size={24} color="white" />}
            onPress={() => navigation.navigate("Home")}
            _pressed={{ bg: 'gray.700' }}
            borderRadius={"full"}
          />
          <Image
            source={require("../../assets/icons/hue-fit-logo.png")}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
          <IconButton
            icon={<Menu size={24} color="white" />}
            onPress={() => console.log("Toggle Menu")}
            _pressed={{ bg: 'gray.700' }}
            borderRadius={"full"}
          />
        </HStack>

        <VStack space={4} px={4} py={2}>
          {/* Outfit Name */}
          <Text color="white" fontSize="2xl" fontWeight="bold">
            Outfit Name: {outfitName || "Unnamed Outfit"}
          </Text>

          {/* Generated Outfit Tags */}
          <VStack mb={6}>
            <Text color="white" fontSize="lg" fontWeight="bold" textTransform={"uppercase"} mb={2}>
              Generated Outfit
            </Text>
            {/* Upperwear */}
            <HStack alignItems="center" mb={2} space={2}>
              <Box bg="gray.800" p={3} borderRadius="md" justifyContent="center" alignItems="center">
                <Shirt width={30} height={30} color="white" />
              </Box>
              <Box bg="gray.800" flex={1} p={4} borderRadius="md" justifyContent="center">
                <Text color="white" fontSize="md" fontWeight="light" textTransform={"uppercase"} textAlign="center">
                  {generatedData[0]?.tags || "None"}
                </Text>
              </Box>
            </HStack>

            {/* Lowerwear */}
            <HStack alignItems="center" mb={2} space={2}>
              <Box bg="gray.800" p={3} borderRadius="md" justifyContent="center" alignItems="center">
                <Pants width={30} height={30} color="white" />
              </Box>
              <Box bg="gray.800" flex={1} p={4} borderRadius="md" justifyContent="center">
                <Text color="white" fontSize="md" fontWeight="light" textTransform={"uppercase"} textAlign="center">
                  {generatedData[1]?.tags || "None"}
                </Text>
              </Box>
            </HStack>

            {/* Footwear */}
            <HStack alignItems="center" mb={2} space={2}>
              <Box bg="gray.800" p={3} borderRadius="md" justifyContent="center" alignItems="center">
                <Sneaker width={30} height={30} color="white" />
              </Box>
              <Box bg="gray.800" flex={1} p={4} borderRadius="md" justifyContent="center">
                <Text color="white" fontSize="md" fontWeight="light" textTransform={"uppercase"} textAlign="center">
                  {generatedData[2]?.tags || "None"}
                </Text>
              </Box>
            </HStack>
          </VStack>

          <VStack space={4} py={2} alignItems="flex-end">
            {/* Color Palette */}
            <HStack space={2}>
              {colorPalette.map((color, index) => (
                <Box
                  key={index}
                  bg={color.hexcode}
                  width={8}
                  height={8}
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="gray.500"
                />
              ))}
            </HStack>

            {/* Generated Products */}
            {generatedData.length > 0 ? (
              <VStack space={4} width="100%" alignItems="flex-end">
                {generatedData.map((product, index) => {
                  // Find the color name that matches the product's colorId
                  const color = colorPalette.find((c) => c.id === product.colorId);

                  return (
                    <Box
                      key={index}
                      bg="gray.800"
                      p={2}
                      borderRadius="md"
                      borderColor="gray.700"
                      borderWidth={1}
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <HStack space={2} flex={1}>
                        <Image
                          source={{ uri: product.thumbnail }}
                          style={{ width: 100, height: 100, borderRadius: 8 }}
                        />
                        <VStack flex={1} space={2} alignContent="flex-start">
                          <VStack flex={1}>
                            {/* Combine color name and product name */}
                            <Text color="white" fontSize="sm" fontWeight="light">
                              {color ? `${color.name} ${product.name}` : product.name}
                            </Text>
                            <Text fontWeight="light" color="gray.400">
                              ₱{product.price}
                            </Text>
                          </VStack>
                          <OutlineButton
                            title="VIEW PRODUCT"
                            iconRight={<MoveRight size={15} color="gray" />}
                            width="fit-content"
                            height={39}
                            py={1}
                            fontWeight="light"
                            fontSize="xs"
                            onPress={() => {}}
                          />
                        </VStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Text color="gray.400" textAlign="center" alignSelf="flex-end">
                No products found.
              </Text>
            )}

            {/* Total Price */}
            <Text color="white" fontSize="lg" fontWeight="bold">
              Total Price: ₱{totalPrice}
            </Text>
          </VStack>
          <DefaultButton title="SAVE OUTFIT" mt={5} mb={10} onPress={() => {}} />
        </VStack>
      </ScrollView>
    </BackgroundProvider>
  );
};

export default PlaygroundScreen;
