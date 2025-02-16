import React, { useState, useEffect, useRef } from "react";
import { FlatList, Pressable, View, Image, Animated, Easing } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { VStack, Text, HStack } from "native-base";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingSpinner from "../../components/Loading";
import { EXPO_PUBLIC_API_URL } from "@env";

// AnimatedPressable that animates the entire background color.
const AnimatedPressable = ({ children, onPress, style }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  // Base card color is #191919; on press, we animate to #1F1F1F.
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
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[style, { backgroundColor }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const GeneratedOutfitListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGeneratedOutfits = async () => {
    let userId = null;
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        userId = JSON.parse(storedUser).id;
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
    }

    if (!userId) {
      setOutfits([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/mobile/generate/get-generated-outfits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOutfits(data.generatedOutfits || []);
      } else {
        console.error("Failed to fetch generated outfits, status:", response.status);
        setOutfits([]);
      }
    } catch (error) {
      console.error("Error fetching generated outfits:", error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneratedOutfits();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
        <LoadingSpinner
          size={300}
          messages="Loading generated outfits..."
          visible={true}
        />
      </View>
    );
  }

  const renderCard = ({ item: outfit }) => {
    // Calculate container height based on number of images.
    const imageCount = outfit.items.length;
    const containerHeight = imageCount > 0 ? (imageCount - 1) * 5 + 60 : 60;

    return (
      <AnimatedPressable
        onPress={() => navigation.navigate("GeneratedOutfitView", { outfitId: outfit.id })}
        style={{
          marginHorizontal: 10,
          marginBottom: 10,
          borderRadius: 8,
          // Other styles below will be applied on top of the animated background.
          padding: 10,
          borderWidth: 1,
          borderColor: "#C0C0C025",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <HStack alignItems="center">
          {/* Stacked Images */}
          <View style={{ width: 90, height: containerHeight, position: "relative" }}>
            {outfit.items.map((item, index) => {
              const imageUrl = item.ProductVariant?.ProductVariantImage?.[0]?.imageURL;
              if (!imageUrl) return null;
              return (
                <Image
                  key={item.id.toString()}
                  source={{ uri: imageUrl }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    position: "absolute",
                    left: index * 5,
                    top: index * 5,
                    zIndex: outfit.items.length - index,
                  }}
                />
              );
            })}
          </View>
          {/* Outfit Name and Style */}
          <VStack justifyContent="center">
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 2 }}>
              {outfit.name || "Unnamed Outfit"}
            </Text>
            <Text style={{ color: "#AAA", fontSize: 12 }}>
              {outfit.style || "No style"}
            </Text>
          </VStack>
        </HStack>
      </AnimatedPressable>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top - 20,
        paddingBottom: insets.bottom,
        backgroundColor: "#191919",
      }}
      edges={["top", "left", "right"]}
    >
      <VStack flex={1}>
        <HStack alignItems="center" space={2} mb={2} pl={4} style={{ paddingTop: 10 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ padding: 4 }}
            android_ripple={{ color: "rgba(255, 255, 255, 0.3)", radius: 20, borderless: true }}
            accessibilityLabel="Go back"
          >
            <ArrowLeft color="#FFF" size={24} />
          </Pressable>
          <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}>
            Generated Outfits
          </Text>
        </HStack>
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingVertical: 10 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default GeneratedOutfitListScreen;
