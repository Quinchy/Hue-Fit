import React from 'react';
import { ScrollView, Alert } from 'react-native';
import { VStack, Text, Center, HStack, IconButton, Select } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import CustomSelect from '../../components/Select';
import GradientCard from '../../components/GradientCard';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { EXPO_PUBLIC_API_URL } from '@env';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme, applyOpacity } from '../../providers/ThemeProvider';

const Register3Schema = Yup.object().shape({
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

export default function Register3Screen({ navigation, route }) {
  const { theme } = useTheme();
  const prevData = route.params?.registerData || {};

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          {/* Back Button */}
          <HStack width="100%" px={2} pt={165} mb={5}>
            <IconButton
              icon={<ArrowLeft color={theme.colors.white} size={24} />}
              onPress={() =>
                navigation.navigate('Register2', { registerData: prevData })
              }
              alignSelf="flex-start"
              _pressed={{ bg: applyOpacity(theme.colors.darkGrey, 0.8) }}
              borderRadius="full"
            />
          </HStack>
          <GradientCard>
            <VStack alignItems="flex-start" mb={4}>
              <Text fontSize="lg" color={theme.colors.white} fontWeight="bold">
                Personal Features
              </Text>
              <Text fontSize="md" color={applyOpacity(theme.colors.greyWhite, 0.6)}>
                Please fill the form with your personal details.
              </Text>
            </VStack>

            <Formik
              initialValues={{
                height: prevData.height || '',
                weight: prevData.weight || '',
                age: prevData.age || '',
                skinTone: prevData.skinTone || '',
                bodyShape: prevData.bodyShape || '',
              }}
              validationSchema={Register3Schema}
              onSubmit={async (values, { setSubmitting }) => {
                const registrationData = { ...prevData, ...values };
                const heightNumber = parseFloat(registrationData.height);
                const weightNumber = parseFloat(registrationData.weight);
                const ageNumber = parseInt(registrationData.age, 10);
                if (isNaN(heightNumber) || isNaN(weightNumber) || isNaN(ageNumber)) {
                  Alert.alert(
                    "Error",
                    "Please enter valid numeric values for Height, Weight, and Age."
                  );
                  setSubmitting(false);
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
                      // Personal Info
                      firstName: registrationData.firstName,
                      lastName: registrationData.lastName,
                      username: registrationData.username,
                      password: registrationData.password,
                      // Address Info
                      buildingNo: registrationData.buildingNo,
                      street: registrationData.street,
                      barangay: registrationData.barangay,
                      municipality: registrationData.municipality,
                      province: registrationData.province,
                      postalCode: registrationData.postalCode,
                      // Customer Features
                      height: heightNumber,
                      weight: weightNumber,
                      age: ageNumber,
                      skintone: registrationData.skinTone,
                      bodyshape: registrationData.bodyShape,
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
                setSubmitting(false);
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <VStack space={4} alignItems="center" opacity={isSubmitting ? 0.5 : 1}>
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

                  <DefaultButton
                    mt={10}
                    title={isSubmitting ? "Registering..." : "REGISTER"}
                    onPress={handleSubmit}
                    isDisabled={isSubmitting}
                  />
                </VStack>
              )}
            </Formik>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
