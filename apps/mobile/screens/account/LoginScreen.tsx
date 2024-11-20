// LoginScreen.tsx
import React, { useState } from 'react';
import { Image, ScrollView, Alert } from 'react-native';
import { VStack, HStack, Text, Center } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import OutlineButton from '../../components/OutlineButton';
import GradientCard from '../../components/GradientCard';
import Link from '../../components/Link';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing user data
import { EXPO_PUBLIC_API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoadingSpinner from '../../components/Loading';

type RootStackParamList = {
  Home: undefined;
  Register: undefined;
};

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle login
  const handleLogin = async () => {
    setLoading(true); 
    try {
      const apiUrl = `${EXPO_PUBLIC_API_URL}/api/mobile/auth/login`; // Update to new login API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      // Check if the response content type is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
  
        console.log('Response JSON:', data); // Log the JSON response
        
        if (response.ok) {
          // Store the user data for session persistence
          await AsyncStorage.setItem('user', JSON.stringify(data));
          navigation.navigate('Home'); // Redirect to home screen
          setLoading(false);
        } else {
          Alert.alert('Login failed', data.message || 'Invalid credentials');
        }
      } else {
        // Log the response text if it's not JSON
        const text = await response.text();
        console.error('Non-JSON response:', text);
        Alert.alert('Login failed', 'Unexpected response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      Alert.alert('Login error', 'An error occurred. Please try again.');
    }
  };
  if (loading) {
    return <LoadingSpinner size={150} />; // Use your LoadingSpinner component here
  }
  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          <Image
            source={require('../../assets/icons/hue-fit-logo.png')}
            style={{
              width: 75,
              height: 75,
              marginTop: 200,
              marginBottom: 50,
            }}
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
                variant="filled"
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

              <Text color="gray.400" fontSize="sm" my={4}>
                ─────────── OR CONTINUE WITH ───────────
              </Text>

              <OutlineButton title="GOOGLE" onPress={() => {}} />
              <OutlineButton title="FACEBOOK" onPress={() => {}} />
            </VStack>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
