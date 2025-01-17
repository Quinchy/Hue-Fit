import React, { useState } from 'react';
import { Image, ScrollView, Alert } from 'react-native';
import { VStack, HStack, Text, Center } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import OutlineButton from '../../components/OutlineButton';
import GradientCard from '../../components/GradientCard';
import Link from '../../components/Link';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/Loading';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Main: undefined; Register: undefined };

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.254.105:3000/api/mobile/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok) {
          await AsyncStorage.setItem('user', JSON.stringify(data));
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } else {
          Alert.alert('Login failed', data.message || 'Invalid credentials');
        }
      } else {
        Alert.alert('Login failed', 'Unexpected response format');
      }
    } catch (error) {
      Alert.alert('Login error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size={150} />;

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          <Image
            source={require('../../assets/icons/hue-fit-logo.png')}
            style={{ width: 60, height: 60, marginTop: 250, marginBottom: 50 }}
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
              <CustomInput label="Username" placeholder="Username" value={username} onChangeText={setUsername} />
              <CustomInput label="Password" placeholder="Password" value={password} onChangeText={setPassword} isPassword />
              <Text alignSelf="flex-end" color="gray.400" fontSize="sm" mt={-2} mb={2}>
                Forgot Password?
              </Text>
              <DefaultButton title="LOGIN" onPress={handleLogin} />
              <Text color="gray.400" fontSize="sm" my={4}>
                ─────────── OR CONTINUE WITH ───────────
              </Text>
              <OutlineButton title="GOOGLE" width="full" onPress={() => {}} />
              <OutlineButton title="FACEBOOK" width="full" onPress={() => {}} />
            </VStack>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
