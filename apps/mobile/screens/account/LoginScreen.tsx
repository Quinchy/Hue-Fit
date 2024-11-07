// src/screens/account/LoginScreen.tsx
import React from 'react';
import { Image, ScrollView } from 'react-native';
import { VStack, HStack, Text, Center } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import OutlineButton from '../../components/OutlineButton';
import GradientCard from '../../components/GradientCard';
import Link from '../../components/Link';

export default function LoginScreen({ navigation }) {
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
              <CustomInput placeholder="Username" />
              <CustomInput placeholder="Password" isPassword />
              <Text alignSelf="flex-end" color="gray.400" fontSize="sm" mt={-2} mb={2}>
                Forgot Password?
              </Text>
              <DefaultButton title="LOGIN" onPress={() => {}} />

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
