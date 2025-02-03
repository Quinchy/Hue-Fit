// Frontend: LoginScreen.tsx

import React, { useState } from 'react';
import { Image, ScrollView, Alert } from 'react-native';
import { VStack, HStack, Text, Center } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';
import Link from '../../components/Link';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/Loading';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EXPO_PUBLIC_API_URL } from '@env';

type RootStackParamList = { Main: undefined; Register: undefined };

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Basic input validation (optional but recommended)
    if (!username.trim() || !password) {
      Alert.alert('Validation Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          // Store the entire user object
          await AsyncStorage.setItem('user', JSON.stringify(data));

          // Additionally, store firstName, lastName, and profilePicture separately
          await AsyncStorage.setItem('firstName', data.firstName);
          await AsyncStorage.setItem('lastName', data.lastName);
          await AsyncStorage.setItem('profilePicture', data.profilePicture || '');

          // Navigate to the Main screen
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } else {
          Alert.alert('Login Failed', data.message || 'Invalid credentials');
        }
      } else {
        Alert.alert('Login Failed', 'Unexpected response format');
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert('Login Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size={300} messages="Loading Hue-Fit..." visible />;

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          <Image
            source={require('../../assets/icons/hue-fit-logo.png')}
            style={{ width: 60, height: 60, marginTop: 225, marginBottom: 30 }}
            resizeMode="contain"
          />
          <GradientCard>
            <Center mt={5} mb={10}>
              <Text fontSize="3xl" color="white" fontWeight="bold">
                LOGIN
              </Text>
              <HStack alignItems="center" space={1}>
                <Text fontSize="md" color="gray.400">
                  Don't have an account?
                </Text>
                <Link title="REGISTER" onPress={() => navigation.navigate('Register')} />
              </HStack>
            </Center>
            <VStack space={4} alignItems="center">
              <CustomInput
                label="Username"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <CustomInput
                label="Password"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
              <Text alignSelf="flex-end" color="gray.400" fontSize="sm" mt={-2} mb={2}>
                Forgot Password?
              </Text>
              <DefaultButton title="LOGIN" onPress={handleLogin} />
            </VStack>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
