// @ts-nocheck

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          <Text fontSize="3xl" color="white" fontWeight="bold">
            HomeScreen
          </Text>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}