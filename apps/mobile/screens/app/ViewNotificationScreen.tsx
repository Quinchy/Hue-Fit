// File: screens/ViewNotificationScreen.tsx
import React from "react";
import { Pressable } from "react-native";
import { VStack, Text, HStack } from "native-base";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

const ViewNotificationScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { notifId, title, message } = route.params as {
    notifId: number;
    title: string;
    message: string;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#191919",
        paddingTop: 10,
        paddingHorizontal: 20,
      }}
      edges={["top", "left", "right"]}
    >
      <HStack alignItems="center" space={2} mb={4}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            { padding: 4, borderRadius: 100 },
            pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
          ]}
          accessibilityLabel="Go back"
        >
          <ArrowLeft color="#FFF" size={24} />
        </Pressable>
        <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}>
          {title}
        </Text>
      </HStack>
      <VStack flex={1}>
        <Text style={{ color: "#AAA", fontSize: 16, marginTop: 20 }}>
          {message}
        </Text>
      </VStack>
    </SafeAreaView>
  );
};

export default ViewNotificationScreen;
