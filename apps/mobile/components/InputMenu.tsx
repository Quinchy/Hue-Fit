import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { VStack, Text, Box, IconButton, Select, Center, Spinner, Skeleton } from "native-base";
import { ChevronRight } from "lucide-react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import CustomInput from "../components/Input";
import CustomSelect from "../components/Select";
import DefaultButton from "../components/Button";
import { LinearGradient } from "expo-linear-gradient";

type InputMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userInputs: any) => void;
  initialData?: {
    outfit_name?: string;
    height?: number;
    weight?: number;
    age?: number;
    skintone?: string;
    bodyshape?: string;
    category?: string;
  };
};

const InputMenu: React.FC<InputMenuProps> = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [outfitName, setOutfitName] = useState(initialData.outfit_name || "My 2024 Outfit Drip");
  const [height, setHeight] = useState(initialData.height?.toString() || "");
  const [weight, setWeight] = useState(initialData.weight?.toString() || "");
  const [skinTone, setSkinTone] = useState(initialData.skintone || "#f1c27d");
  const [bodyShape, setBodyShape] = useState(initialData.bodyshape || "Pear");
  const [age, setAge] = useState(initialData.age?.toString() || "");
  const [preference, setPreference] = useState(initialData.category || "Casual");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const translateX = useSharedValue(300);
  const opacity = useSharedValue(0);

  const animateOpen = () => {
    translateX.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  };

  const animateClose = () => {
    translateX.value = withTiming(
      300,
      {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      },
      () => runOnJS(onClose)()
    );

    opacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.in(Easing.ease),
    });
  };

  useEffect(() => {
    if (isOpen) {
      animateOpen();
    } else {
      animateClose();
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handleRegenerate = async () => {
    setLoading(true);
    setIsFetching(true);

    const userInputs = {
      outfit_name: outfitName,
      height: parseFloat(height),
      weight: parseFloat(weight),
      age: parseInt(age, 10),
      skintone: skinTone,
      bodyshape: bodyShape,
      category: preference,
    };

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

        onSubmit({
          outfit_name,
          upper_wear,
          lower_wear,
          footwear,
          ...(outerwear && { outerwear }),
          color_palette,
          user_inputs: userInputs,
        });

        animateClose();
      } else {
        console.error("Error generating outfit:", response.statusText);
      }
    } catch (error) {
      console.error("Error generating outfit:", error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  return (
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
              onPress={animateClose}
              _pressed={{ bg: "gray.800" }}
              borderRadius="full"
            />
          </Box>
          <ScrollView>
            <Center>
              <Text fontSize="lg" fontWeight="bold" color="white" mb={4}>
                INPUT DETAILS
              </Text>
            </Center>
            <VStack space={4} px={4}>
              <CustomInput
                label="Outfit Name"
                placeholder="Type an Outfit Name"
                value={outfitName}
                onChangeText={setOutfitName}
                variant="filled"
              />
              <CustomInput
                label="Height (in cm)"
                placeholder="Type your Height"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                variant="filled"
              />
              <CustomInput
                label="Weight (in kg)"
                placeholder="Type your Weight"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                variant="filled"
              />
              <CustomInput
                label="Skin Tone"
                placeholder="Select your Skin Tone"
                value={skinTone}
                onChangeText={setSkinTone}
                variant="filled"
              />
              <CustomInput
                label="Age"
                placeholder="Type your Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                variant="filled"
              />
              <CustomSelect
                label="Body Shape"
                value={bodyShape}
                onChange={(value) => setBodyShape(value)}
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
                value={preference}
                onChange={(value) => setPreference(value)}
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
                onPress={handleRegenerate}
              />
            </VStack>
          </ScrollView>
        </Box>
      </LinearGradient>
    </Animated.View>
  );
};

export default InputMenu;
