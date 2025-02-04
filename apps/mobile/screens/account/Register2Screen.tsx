// src/screens/account/Register2Screen.tsx
import React from 'react';
import { ScrollView, Alert } from 'react-native';
import { VStack, Text, Center, Select, HStack, IconButton } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import CustomSelect from '../../components/Select';
import GradientCard from '../../components/GradientCard';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { EXPO_PUBLIC_API_URL } from '@env';
import { ArrowLeft } from 'lucide-react-native';

const Register2Schema = Yup.object().shape({
  height: Yup.number()
    .typeError('Must be a number')
    .required('Height is required'),
  weight: Yup.number()
    .typeError('Must be a number')
    .required('Weight is required'),
  age: Yup.number()
    .typeError('Must be a number')
    .required('Age is required'),
  skinTone: Yup.string().required('Skin Tone is required'),
  bodyShape: Yup.string().required('Body Shape is required'),
});

export default function Register2Screen({ navigation, route }) {
  // Get the registration data from the previous screen
  const registerData = route.params?.registerData || {};

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          {/* Back Button above the gradient card */}
          <HStack width="100%" px={4} pt={5} mb={3} mt={125}>
            <IconButton
              icon={<ArrowLeft color="white" size={24} />}
              onPress={() => navigation.goBack()}
              alignSelf="flex-start"
              _pressed={{ bg: 'dark.100' }}
              borderRadius="full"
            />
          </HStack>
          <GradientCard>
            <VStack alignItems="flex-start" mb={4}>
              <Text fontSize="lg" color="white" fontWeight="bold">
                Personal Features
              </Text>
              <Text fontSize="md" color="gray.400">
                Please fill the form with your personal details.
              </Text>
            </VStack>

            <Formik
              initialValues={{
                height: '',
                weight: '',
                age: '',
                skinTone: '',
                bodyShape: '',
              }}
              validationSchema={Register2Schema}
              onSubmit={async (values) => {
                // Safely convert numeric fields
                const heightNumber = parseFloat(values.height);
                const weightNumber = parseFloat(values.weight);
                const ageNumber = parseInt(values.age, 10);
                if (isNaN(heightNumber) || isNaN(weightNumber) || isNaN(ageNumber)) {
                  Alert.alert("Error", "Please enter valid numeric values for Height, Weight, and Age.");
                  return;
                }

                try {
                  const apiUrl = `${EXPO_PUBLIC_API_URL}/api/mobile/auth/register`;
                  const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      ...registerData, // includes firstName, lastName, username, password
                      height: heightNumber,
                      weight: weightNumber,
                      age: ageNumber,
                      skintone: values.skinTone,
                      bodyshape: values.bodyShape,
                      role: "CUSTOMER",
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
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <VStack space={4} alignItems="center">
                  {/* Height Field */}
                  <VStack width="100%">
                    <CustomInput
                      label="Height"
                      placeholder="Type your Height (in cm)"
                      value={values.height}
                      onChangeText={handleChange('height')}
                      onBlur={handleBlur('height')}
                      keyboardType="numeric"
                      variant="filled"
                      error={touched.height && errors.height ? errors.height : undefined}
                      required
                    />
                    {touched.height && errors.height && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.height}
                      </Text>
                    )}
                  </VStack>

                  {/* Weight Field */}
                  <VStack width="100%">
                    <CustomInput
                      label="Weight"
                      placeholder="Type your Weight (in kg)"
                      value={values.weight}
                      onChangeText={handleChange('weight')}
                      onBlur={handleBlur('weight')}
                      keyboardType="numeric"
                      variant="filled"
                      error={touched.weight && errors.weight ? errors.weight : undefined}
                      required
                    />
                    {touched.weight && errors.weight && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.weight}
                      </Text>
                    )}
                  </VStack>

                  {/* Age Field */}
                  <VStack width="100%">
                    <CustomInput
                      label="Age"
                      placeholder="Type your Age"
                      value={values.age}
                      onChangeText={handleChange('age')}
                      onBlur={handleBlur('age')}
                      keyboardType="numeric"
                      variant="filled"
                      error={touched.age && errors.age ? errors.age : undefined}
                      required
                    />
                    {touched.age && errors.age && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.age}
                      </Text>
                    )}
                  </VStack>

                  {/* Skin Tone Field */}
                  <VStack width="100%">
                    <CustomSelect
                      label="Skin Tone"
                      value={values.skinTone}
                      onChange={(value) => handleChange('skinTone')(value)}
                      required
                      error={touched.skinTone && errors.skinTone ? errors.skinTone : undefined}
                    >
                      <Select.Item label="Fair" value="Fair" />
                      <Select.Item label="Light" value="Light" />
                      <Select.Item label="Medium" value="Medium" />
                      <Select.Item label="Dark" value="Dark" />
                      <Select.Item label="Deep" value="Deep" />
                    </CustomSelect>
                    {touched.skinTone && errors.skinTone && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.skinTone}
                      </Text>
                    )}
                  </VStack>

                  {/* Body Shape Field */}
                  <VStack width="100%">
                    <CustomSelect
                      label="Body Shape"
                      value={values.bodyShape}
                      onChange={(value) => handleChange('bodyShape')(value)}
                      required
                      error={touched.bodyShape && errors.bodyShape ? errors.bodyShape : undefined}
                    >
                      <Select.Item label="Bulky" value="Bulky" />
                      <Select.Item label="Athletic" value="Athletic" />
                      <Select.Item label="Skinny" value="Skinny" />
                      <Select.Item label="Fit" value="Fit" />
                      <Select.Item label="Skinny Fat" value="Skinny Fat" />
                      <Select.Item label="Chubby" value="Chubby" />
                    </CustomSelect>
                    {touched.bodyShape && errors.bodyShape && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.bodyShape}
                      </Text>
                    )}
                  </VStack>

                  <DefaultButton mt={10} title="REGISTER" onPress={handleSubmit} />
                </VStack>
              )}
            </Formik>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
