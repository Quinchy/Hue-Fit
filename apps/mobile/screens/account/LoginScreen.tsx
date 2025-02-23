import React, { useState } from 'react';
import { Image, ScrollView, Alert, Pressable } from 'react-native';
import { VStack, HStack, Text, Center } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/Loading';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EXPO_PUBLIC_API_URL } from '@env';
import { useTheme } from '../../providers/ThemeProvider';

type RootStackParamList = { Main: undefined; Register: undefined; ForgotPassword: undefined };

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
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
          await AsyncStorage.setItem('user', JSON.stringify(data));
          await AsyncStorage.setItem('firstName', data.firstName);
          await AsyncStorage.setItem('lastName', data.lastName);
          await AsyncStorage.setItem('profilePicture', data.profilePicture || '');
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
              <Text fontSize="3xl" color={theme.colors.white} fontWeight="bold">
                LOGIN
              </Text>
              <HStack alignItems="center" space={1}>
                <Text fontSize="md" color={theme.colors.greyWhite}>
                  Don't have an account?
                </Text>
                <Pressable onPress={() => navigation.navigate('Register')}>
                  {({ pressed }) => (
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color={theme.colors.white}
                      style={{ textDecorationLine: pressed ? 'underline' : 'none' }}
                    >
                      Register.
                    </Text>
                  )}
                </Pressable>
              </HStack>
            </Center>
            <VStack space={4} alignItems="center">
              <CustomInput
                label="Username"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                required
              />
              <CustomInput
                label="Password"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                isPassword
                required
              />
              <Pressable
                style={{ alignSelf: 'flex-end' }}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                {({ pressed }) => (
                  <Text
                    color={theme.colors.white}
                    fontSize="sm"
                    fontWeight="bold"
                    mt={-2}
                    mb={2}
                    style={{ textDecorationLine: pressed ? 'underline' : 'none' }}
                  >
                    Forgot Password?
                  </Text>
                )}
              </Pressable>
              <DefaultButton title="LOGIN" onPress={handleLogin} />
            </VStack>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
