import React, { useState } from "react";
import { ScrollView, Image, View, StatusBar } from "react-native";
import { VStack, Text, Box, HStack, IconButton, Spinner, Skeleton, Select, Center } from "native-base";
import { House, Menu, ChevronRight } from "lucide-react-native";
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

const PlaygroundScreen: React.FC = ({ route, navigation }) => {
  const { outfit_name, upper_wear, lower_wear, footwear, outerwear, color_palette = [], user_inputs } =
    route.params || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [outfitData, setOutfitData] = useState({
    outfit_name,
    upper_wear,
    lower_wear,
    footwear,
    outerwear,
    color_palette,
  });
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
    translateX.value = withTiming(
      300,
      { duration: 300 },
      () => runOnJS(setMenuOpen)(false)
    );
  };

  const handleRegenerate = async (inputs) => {
    setLoading(true);
    setIsFetching(true);

    const userInputs = inputs || user_inputs;

    try {
      const response = await fetch(`http://192.168.254.105:8000/generate-outfit?unique=${Date.now()}`, {
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

  const totalPrice =
    (outfitData.upper_wear?.price || 0) +
    (outfitData.lower_wear?.price || 0) +
    (outfitData.footwear?.price || 0) +
    (outfitData.outerwear?.price || 0);

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
            onPress={() => console.log(`View product: ${item.productVariantNo}`)}
          />
        </VStack>
      </HStack>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <BackgroundProvider>
        <ScrollView>
          <StatusBar backgroundColor="#ffffff01" />
          <HStack justifyContent="space-between" alignItems="center" mt={50} mb={10} px={4} py={2}>
            <IconButton
              icon={<House size={24} color="white" />}
              onPress={() => navigation.navigate("Home")}
              _pressed={{ bg: "gray.700" }}
              borderRadius="full"
            />
            <Image
              source={require("../../assets/icons/hue-fit-logo.png")}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
            <IconButton
              icon={<Menu size={24} color="white" />}
              onPress={openMenu}
              _pressed={{ bg: "gray.700" }}
              borderRadius="full"
            />
          </HStack>

          <VStack px={4} py={2}>
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {outfitData.outfit_name || "Unnamed Outfit"}
            </Text>
            <VStack>
              <Text color="white" fontSize="lg" fontWeight="bold" textTransform="uppercase" mb={2}>
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
                  <Image
                    source={{ uri: outfitData.outerwear.thumbnail }}
                    style={{ width: 30, height: 30, borderRadius: 8 }}
                  />,
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
              mt={20}
              mb={20}
              onPress={() => handleRegenerate()}
              isDisabled={loading}
              leftIcon={loading ? <Spinner color="white" size="sm" /> : undefined}
            />
          </VStack>
        </ScrollView>
      </BackgroundProvider>

      {menuOpen && (
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "80%",
              height: "100%",
              right: 0,
              top: 0,
              zIndex: 1,
            },
            animatedStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                right: 0,
                width: "120%",
                height: "100%",
                zIndex: 1,
                paddingTop: 50,
                paddingBottom: 45,
              },
              animatedStyle,
            ]}
          >
            <LinearGradient
              colors={["#FF75C3", "#FFA647", "#FFE83F", "#9FFF5B", "#70E2FF", "#CD93FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                padding: 1,
              }}
            >
              <Box
                bg="#191919"
                flex={1}
                borderTopLeftRadius={16}
                borderBottomLeftRadius={16}
                overflow="hidden"
                style={{
                  marginRight: -2,
                }}
              >
                <Box alignItems="flex-start" p={3}>
                  <IconButton
                    icon={<ChevronRight size={24} color="white" />}
                    onPress={closeMenu}
                    _pressed={{ bg: "gray.800" }}
                    borderRadius="full"
                  />
                </Box>
                <GestureScrollView>
                  <Center>
                    <Text fontSize="lg" fontWeight="bold" color="white" mb={4}>
                      INPUT DETAILS
                    </Text>
                  </Center>
                  <VStack space={4} px={4}>
                    <CustomInput
                      label="Outfit Name"
                      placeholder="Type an Outfit Name"
                      value={outfitData.outfit_name}
                      onChangeText={(text) =>
                        setOutfitData((prev) => ({ ...prev, outfit_name: text }))
                      }
                      variant="filled"
                    />
                    <CustomInput
                      label="Height (in cm)"
                      placeholder="Type your Height"
                      value={user_inputs.height?.toString() || ""}
                      onChangeText={(text) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          user_inputs: { ...prev.user_inputs, height: parseFloat(text) },
                        }))
                      }
                      keyboardType="numeric"
                      variant="filled"
                    />
                    <CustomInput
                      label="Weight (in kg)"
                      placeholder="Type your Weight"
                      value={user_inputs.weight?.toString() || ""}
                      onChangeText={(text) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          user_inputs: { ...prev.user_inputs, weight: parseFloat(text) },
                        }))
                      }
                      keyboardType="numeric"
                      variant="filled"
                    />
                    <CustomInput
                      label="Skin Tone"
                      placeholder="Select your Skin Tone"
                      value={user_inputs.skintone || ""}
                      onChangeText={(text) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          user_inputs: { ...prev.user_inputs, skintone: text },
                        }))
                      }
                      variant="filled"
                    />
                    <CustomInput
                      label="Age"
                      placeholder="Type your Age"
                      value={user_inputs.age?.toString() || ""}
                      onChangeText={(text) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          user_inputs: { ...prev.user_inputs, age: parseInt(text, 10) },
                        }))
                      }
                      keyboardType="numeric"
                      variant="filled"
                    />
                    <CustomSelect
                      label="Body Shape"
                      value={user_inputs.bodyshape || outfitData.user_inputs.bodyshape }
                      onChange={(value) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          user_inputs: { ...prev.user_inputs, bodyshape: value },
                        }))
                      }
                    >
                      <Select.Item label="Bulky" value="Bulky" />
                      <Select.Item label="Athletic" value="Athletic" />
                      <Select.Item label="Skinny" value="Skinny" />
                      <Select.Item label="Pear" value="Pear" />
                      <Select.Item label="Fit" value="Fit" />
                      <Select.Item label="Chubby" value="Chubby" />
                    </CustomSelect>
                    <CustomSelect
                      label="Style"
                      value={user_inputs.category || outfitData.user_inputs.category}
                      onChange={(value) =>
                        setOutfitData((prev) => ({
                          ...prev,
                          user_inputs: { ...prev.user_inputs, category: value },
                        }))
                      }
                    >
                      <Select.Item label="All Random" value="All Random" />
                      <Select.Item label="Casual" value="Casual" />
                      <Select.Item label="Smart Casual" value="Smart Casual" />
                      <Select.Item label="Formal" value="Formal" />
                    </CustomSelect>
                    <DefaultButton
                      title={loading ? "Generating..." : "RE-GENERATE"}
                      isDisabled={loading}
                      leftIcon={loading ? <Spinner color="white" size="sm" /> : undefined}
                      my={6}
                      onPress={() => handleRegenerate()}
                    />
                  </VStack>
                </GestureScrollView>
              </Box>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

export default PlaygroundScreen;
