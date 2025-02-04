// src/screens/account/RegisterScreen.tsx
import React from 'react';
import { Image, ScrollView } from 'react-native';
import { VStack, HStack, Text, Center } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';
import Link from '../../components/Link';
import { Formik } from 'formik';
import * as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export default function RegisterScreen({ navigation }) {
  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          {/* Logo remains on this screen */}
          <Image
            source={require('../../assets/icons/hue-fit-logo.png')}
            style={{
              width: 60,
              height: 60,
              marginTop: 225,
              marginBottom: 30,
            }}
            resizeMode="contain"
          />

          <GradientCard>
            <Center mt={5} mb={10}>
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

            {/* New section: Personal Information (aligned left) */}
            <VStack alignItems="flex-start" mb={4}>
              <Text fontSize="lg" color="white" fontWeight="bold">
                Personal Information
              </Text>
              <Text fontSize="md" color="gray.400">
                Please fill the form with your personal information
              </Text>
            </VStack>

            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                username: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={RegisterSchema}
              onSubmit={(values) => {
                // When valid, pass the registration info to the next screen
                navigation.navigate('Register2', { registerData: values });
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <VStack space={4} alignItems="center">
                  <VStack width="100%">
                    <CustomInput
                      label="First Name"
                      placeholder="First Name"
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      error={touched.firstName && errors.firstName ? errors.firstName : undefined}
                      required
                    />
                    {touched.firstName && errors.firstName && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.firstName}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Last Name"
                      placeholder="Last Name"
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={touched.lastName && errors.lastName ? errors.lastName : undefined}
                      required
                    />
                    {touched.lastName && errors.lastName && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.lastName}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Username"
                      placeholder="Username"
                      value={values.username}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      error={touched.username && errors.username ? errors.username : undefined}
                      required
                    />
                    {touched.username && errors.username && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.username}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Password"
                      placeholder="Password"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      isPassword
                      error={touched.password && errors.password ? errors.password : undefined}
                      required
                    />
                    {touched.password && errors.password && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.password}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Confirm Password"
                      placeholder="Confirm Password"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      isPassword
                      error={
                        touched.confirmPassword && errors.confirmPassword
                          ? errors.confirmPassword
                          : undefined
                      }
                      required
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </VStack>

                  <DefaultButton mt={10} title="NEXT" onPress={handleSubmit} />
                </VStack>
              )}
            </Formik>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
