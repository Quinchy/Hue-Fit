// src/screens/account/Register2Screen.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { VStack, Text, Center, HStack, IconButton } from 'native-base';
import { ArrowLeft } from 'lucide-react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';
import { Formik } from 'formik';
import * as Yup from 'yup';

const Register2Schema = Yup.object().shape({
  buildingNo: Yup.string(),
  street: Yup.string(),
  barangay: Yup.string().required('Barangay is required'),
  municipality: Yup.string().required('Municipality is required'),
  province: Yup.string().required('Province is required'),
  postalCode: Yup.string().required('Postal Code is required'),
});

export default function Register2Screen({ navigation, route }) {
  const prevData = route.params?.registerData || {};

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          {/* Back Button similar to Register3 */}
          <HStack width="100%" px={2} pt={165} mb={5}>
            <IconButton
              icon={<ArrowLeft color="white" size={24} />}
              onPress={() => navigation.navigate('Register', { registerData: prevData })}
              alignSelf="flex-start"
              _pressed={{ bg: 'dark.100' }}
              borderRadius="full"
            />
          </HStack>

          <GradientCard>
            <VStack alignItems="flex-start" mb={4}>
              <Text fontSize="lg" color="white" fontWeight="bold">
                Address Information
              </Text>
              <Text fontSize="md" color="#C0C0C095">
                Please fill in your address details.
              </Text>
            </VStack>

            <Formik
              initialValues={{
                buildingNo: prevData.buildingNo || '',
                street: prevData.street || '',
                barangay: prevData.barangay || '',
                municipality: prevData.municipality || '',
                province: prevData.province || '',
                postalCode: prevData.postalCode || '',
              }}
              validationSchema={Register2Schema}
              onSubmit={(values) => {
                navigation.navigate('Register3', { registerData: { ...prevData, ...values } });
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <VStack space={4} alignItems="center">
                  <VStack width="100%">
                    <CustomInput
                      label="Building No"
                      placeholder="Building No"
                      value={values.buildingNo}
                      onChangeText={handleChange('buildingNo')}
                      onBlur={handleBlur('buildingNo')}
                    />
                    {touched.buildingNo && errors.buildingNo && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.buildingNo}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Street"
                      placeholder="Street"
                      value={values.street}
                      onChangeText={handleChange('street')}
                      onBlur={handleBlur('street')}
                    />
                    {touched.street && errors.street && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.street}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Barangay"
                      placeholder="Barangay"
                      value={values.barangay}
                      onChangeText={handleChange('barangay')}
                      onBlur={handleBlur('barangay')}
                      error={touched.barangay && errors.barangay ? errors.barangay : undefined}
                      required
                    />
                    {touched.barangay && errors.barangay && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.barangay}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Municipality"
                      placeholder="Municipality"
                      value={values.municipality}
                      onChangeText={handleChange('municipality')}
                      onBlur={handleBlur('municipality')}
                      error={touched.municipality && errors.municipality ? errors.municipality : undefined}
                      required
                    />
                    {touched.municipality && errors.municipality && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.municipality}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Province"
                      placeholder="Province"
                      value={values.province}
                      onChangeText={handleChange('province')}
                      onBlur={handleBlur('province')}
                      error={touched.province && errors.province ? errors.province : undefined}
                      required
                    />
                    {touched.province && errors.province && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.province}
                      </Text>
                    )}
                  </VStack>

                  <VStack width="100%">
                    <CustomInput
                      label="Postal Code"
                      placeholder="Postal Code"
                      value={values.postalCode}
                      onChangeText={handleChange('postalCode')}
                      onBlur={handleBlur('postalCode')}
                      error={touched.postalCode && errors.postalCode ? errors.postalCode : undefined}
                      required
                    />
                    {touched.postalCode && errors.postalCode && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.postalCode}
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
