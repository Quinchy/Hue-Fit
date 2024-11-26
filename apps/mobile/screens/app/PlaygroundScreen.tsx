import React from "react";
import { ScrollView, Image } from "react-native";
import { VStack, Text, Box, HStack, IconButton, Center } from "native-base";
import { House, Menu } from "lucide-react-native";
import BackgroundProvider from "../../providers/BackgroundProvider";
import DefaultButton from "../../components/Button";

const PlaygroundScreen: React.FC = ({ route, navigation }) => {
  const { outfit_name, upper_wear, lower_wear, footwear, outerwear } = route.params || {};

  const totalPrice =
    (upper_wear?.price || 0) +
    (lower_wear?.price || 0) +
    (footwear?.price || 0) +
    (outerwear?.price || 0);

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
            Outfit Name: {outfit_name || "Unnamed Outfit"}
          </Text>

          {/* Render Outfit Components */}
          {upper_wear && (
            <HStack alignItems="center" mb={2} space={2}>
              <Box bg="gray.800" p={3} borderRadius="md" justifyContent="center" alignItems="center">
                <Image source={{ uri: upper_wear.thumbnail }} style={{ width: 50, height: 50 }} />
              </Box>
              <Box bg="gray.800" flex={1} p={4} borderRadius="md" justifyContent="center">
                <Text color="white" fontSize="md" fontWeight="light">
                  {upper_wear.name}
                </Text>
                <Text fontWeight="light" color="gray.400">
                  ₱{upper_wear.price}
                </Text>
              </Box>
            </HStack>
          )}

          {lower_wear && (
            <HStack alignItems="center" mb={2} space={2}>
              <Box bg="gray.800" p={3} borderRadius="md" justifyContent="center" alignItems="center">
                <Image source={{ uri: lower_wear.thumbnail }} style={{ width: 50, height: 50 }} />
              </Box>
              <Box bg="gray.800" flex={1} p={4} borderRadius="md" justifyContent="center">
                <Text color="white" fontSize="md" fontWeight="light">
                  {lower_wear.name}
                </Text>
                <Text fontWeight="light" color="gray.400">
                  ₱{lower_wear.price}
                </Text>
              </Box>
            </HStack>
          )}

          {footwear && (
            <HStack alignItems="center" mb={2} space={2}>
              <Box bg="gray.800" p={3} borderRadius="md" justifyContent="center" alignItems="center">
                <Image source={{ uri: footwear.thumbnail }} style={{ width: 50, height: 50 }} />
              </Box>
              <Box bg="gray.800" flex={1} p={4} borderRadius="md" justifyContent="center">
                <Text color="white" fontSize="md" fontWeight="light">
                  {footwear.name}
                </Text>
                <Text fontWeight="light" color="gray.400">
                  ₱{footwear.price}
                </Text>
              </Box>
            </HStack>
          )}

          {outerwear && (
            <HStack alignItems="center" mb={2} space={2}>
              <Box bg="gray.800" p={3} borderRadius="md" justifyContent="center" alignItems="center">
                <Image source={{ uri: outerwear.thumbnail }} style={{ width: 50, height: 50 }} />
              </Box>
              <Box bg="gray.800" flex={1} p={4} borderRadius="md" justifyContent="center">
                <Text color="white" fontSize="md" fontWeight="light">
                  {outerwear.name}
                </Text>
                <Text fontWeight="light" color="gray.400">
                  ₱{outerwear.price}
                </Text>
              </Box>
            </HStack>
          )}

          {/* Total Price */}
          <Text color="white" fontSize="lg" fontWeight="bold">
            Total Price: ₱{totalPrice}
          </Text>

          <DefaultButton title="SAVE OUTFIT" mt={5} mb={10} onPress={() => {}} />
        </VStack>
      </ScrollView>
    </BackgroundProvider>
  );
};

export default PlaygroundScreen;
