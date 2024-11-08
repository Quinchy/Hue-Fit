// src/screens/account/RegisterScreen.tsx
import React, { useState } from 'react';
import { Image, ScrollView, Alert } from 'react-native';
import { VStack, HStack, Text, Center } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';
import Link from '../../components/Link';
import { API_BASE_URL } from '@env';

export default function RegisterScreen({ navigation }) {
  // State for input fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Log the imported API_BASE_URL to verify it’s being read correctly
  console.log("API_BASE_URL:", API_BASE_URL);

  // Handle registration
  const handleRegister = async () => {
    // Basic validation
    if (!firstName || !lastName || !username || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      // Use the imported API_BASE_URL instead of Constants.manifest.extra
      const apiUrl = `${API_BASE_URL}/api/mobile/auth/register`;
      console.log("apiUrl:", apiUrl); // Log the constructed URL

      // Make API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          password,
          role: "CUSTOMER", // Role for the user
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "User registered successfully!", [
          { text: "OK", onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert("Error", data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "An error occurred during registration.");
    }
  };

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          <Image
            source={require('../../assets/icons/hue-fit-logo.png')}
            style={{
              width: 75,
              height: 75,
              marginTop: 175,
              marginBottom: 25,
            }}
            resizeMode="contain"
          />
          <GradientCard>
            <Center mb={10}>
              <Text fontSize="3xl" color="white" fontWeight="bold">
                REGISTER
              </Text>
              <HStack alignItems="center" space={1}>
                <Text fontSize="md" color="gray.400">
                  Already have an account?
                </Text>
                <Link title="LOGIN" onPress={() => navigation.navigate('Login')} />
              </HStack>
            </Center>
            
            <VStack space={4} alignItems="center">
              <CustomInput placeholder="First Name" value={firstName} onChangeText={setFirstName} />
              <CustomInput placeholder="Last Name" value={lastName} onChangeText={setLastName} />
              <CustomInput placeholder="Username" value={username} onChangeText={setUsername} />
              <CustomInput placeholder="Password" value={password} onChangeText={setPassword} isPassword />
              <CustomInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} isPassword />
              
              <DefaultButton title="REGISTER" onPress={handleRegister} />
            </VStack>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}