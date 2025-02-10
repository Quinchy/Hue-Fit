// src/screens/app/EditProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Alert, StyleSheet, View } from 'react-native';
import { VStack, Text, Center, HStack, IconButton, Image, Select } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import CustomSelect from '../../components/Select';
import GradientCard from '../../components/GradientCard';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { EXPO_PUBLIC_API_URL } from '@env';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import LoadingSpinner from '../../components/Loading';

// Attach the native-base Select.Item to CustomSelect so that <CustomSelect.Item> is defined.
CustomSelect.Item = Select.Item;

// Import the placeholder image.
const placeholderProfile = require('../../assets/placeholder-profile-picture.png');

const EditProfileSchema = Yup.object().shape({
  // General Section
  userNo: Yup.string().required('User Number is required'),
  username: Yup.string().required('Username is required'),
  // "status" field removed
  profilePicture: Yup.string(),
  email: Yup.string().email('Invalid email').required('Email is required'),
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  // Customer Feature Section
  height: Yup.number().typeError('Must be a number').required('Height is required'),
  weight: Yup.number().typeError('Must be a number').required('Weight is required'),
  age: Yup.number().typeError('Must be a number').required('Age is required'),
  skintone: Yup.string().required('Skin Tone is required'),
  bodyShape: Yup.string().required('Body Shape is required'),
  // Customer Address Section
  buildingNo: Yup.string(), // optional
  street: Yup.string(),     // optional
  barangay: Yup.string().required('Barangay is required'),
  municipality: Yup.string().required('Municipality is required'),
  province: Yup.string().required('Province is required'),
  postalCode: Yup.string().required('Postal Code is required'),
});

export default function EditProfileScreen({ navigation, route }) {
  const [initialValues, setInitialValues] = useState({
    // General Section
    userNo: '',
    username: '',
    // "status" field removed
    profilePicture: '',
    email: '',
    firstName: '',
    lastName: '',
    // Customer Feature Section
    height: '',
    weight: '',
    age: '',
    skintone: '',
    bodyShape: '',
    // Customer Address Section
    buildingNo: '',
    street: '',
    barangay: '',
    municipality: '',
    province: '',
    postalCode: '',
  });
  const [loading, setLoading] = useState(true);
  // Local state for immediate preview.
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  // Local state to control the spinner during image upload.
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('user').then((user) =>
          user ? JSON.parse(user).id : null
        );
        // Fetch customer info from the API endpoint.
        const response = await fetch("http://192.168.254.105:3000/api/mobile/profile/get-user-info", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId || null })
        });
        if (response.ok) {
          const user = await response.json();
          const loadedProfilePicture = user.CustomerProfile?.profilePicture || '';
          setInitialValues({
            userNo: user.userNo || '',
            username: user.username || '',
            // "status" field removed
            profilePicture: loadedProfilePicture,
            email: user.CustomerProfile?.email || '',
            firstName: user.CustomerProfile?.firstName || '',
            lastName: user.CustomerProfile?.lastName || '',
            height: user.CustomerFeature?.height ? user.CustomerFeature.height.toString() : '',
            weight: user.CustomerFeature?.weight ? user.CustomerFeature.weight.toString() : '',
            age: user.CustomerFeature?.age ? user.CustomerFeature.age.toString() : '',
            skintone: user.CustomerFeature?.skintone || '',
            bodyShape: user.CustomerFeature?.bodyShape || '',
            buildingNo: user.CustomerAddress?.buildingNo || '',
            street: user.CustomerAddress?.street || '',
            barangay: user.CustomerAddress?.barangay || '',
            municipality: user.CustomerAddress?.municipality || '',
            province: user.CustomerAddress?.province || '',
            postalCode: user.CustomerAddress?.postalCode || '',
          });
          // Initialize the preview with the loaded profile picture.
          setProfileImagePreview(loadedProfilePicture);
          await AsyncStorage.setItem("user", JSON.stringify(user));
        } else {
          Alert.alert("Error", "Failed to fetch user info.");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Function to handle profile picture upload.
  const handleUploadProfilePicture = async (setFieldValue: (field: string, value: any) => void) => {
    try {
      setUploading(true);
      // Request permission to access the media library.
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Permission to access camera roll is required!");
        setUploading(false);
        return;
      }
      // Launch the image library with editing enabled and force a square aspect.
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      // Check for cancellation using the new API.
      if (pickerResult.canceled) {
        setUploading(false);
        return;
      }
      // Retrieve the URI from the first asset.
      const uploadedUrl = pickerResult.assets[0].uri;
      // Update the local preview state immediately.
      setProfileImagePreview(uploadedUrl);
      // Update Formik's field value.
      setFieldValue('profilePicture', uploadedUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Upload Error", "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainerFull}>
        <LoadingSpinner size={300} messages="Loading edit profile..." visible={true} />
      </View>
    );
  }

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          {/* Back Button */}
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
            <Formik
              initialValues={initialValues}
              validationSchema={EditProfileSchema}
              onSubmit={async (values, { setSubmitting }) => {
                const heightNumber = parseFloat(values.height);
                const weightNumber = parseFloat(values.weight);
                const ageNumber = parseInt(values.age, 10);
                if (isNaN(heightNumber) || isNaN(weightNumber) || isNaN(ageNumber)) {
                  Alert.alert(
                    "Error",
                    "Please enter valid numeric values for Height, Weight, and Age."
                  );
                  setSubmitting(false);
                  return;
                }
                try {
                  const apiUrl = `${EXPO_PUBLIC_API_URL}/api/mobile/profile/update`;
                  const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userNo: values.userNo,
                      username: values.username,
                      // "status" field removed
                      profilePicture: values.profilePicture,
                      email: values.email,
                      firstName: values.firstName,
                      lastName: values.lastName,
                      height: heightNumber,
                      weight: weightNumber,
                      age: ageNumber,
                      skintone: values.skintone,
                      bodyShape: values.bodyShape,
                      buildingNo: values.buildingNo,
                      street: values.street,
                      barangay: values.barangay,
                      municipality: values.municipality,
                      province: values.province,
                      postalCode: values.postalCode,
                    }),
                  });
                  const data = await response.json();
                  if (response.ok) {
                    Alert.alert("Success", "Profile updated successfully!", [
                      { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                    await AsyncStorage.setItem("user", JSON.stringify(data.user));
                  } else {
                    Alert.alert("Error", data.message || "Profile update failed.");
                  }
                } catch (error) {
                  console.error("Profile update error:", error);
                  Alert.alert("Error", "An error occurred while updating profile.");
                }
                setSubmitting(false);
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
                isSubmitting,
              }) => (
                <VStack space={4} alignItems="center" opacity={isSubmitting ? 0.5 : 1}>
                  {/* Profile Picture Section */}
                  <VStack alignItems="center" mb={4}>
                    <Image
                      key={profileImagePreview || 'placeholder'}
                      source={
                        profileImagePreview
                          ? { uri: profileImagePreview }
                          : placeholderProfile
                      }
                      alt="Profile Picture"
                      size="xl"
                      borderRadius="full"
                      mb={2}
                    />
                    {uploading ? (
                      <LoadingSpinner size={50} messages="" visible={true} />
                    ) : (
                      <DefaultButton
                        title="Upload Profile Picture"
                        onPress={() => handleUploadProfilePicture(setFieldValue)}
                      />
                    )}
                  </VStack>

                  {/* GENERAL SECTION */}
                  <Text fontSize="md" color="white" fontWeight="bold" alignSelf="flex-start">
                    General
                  </Text>
                  <VStack width="100%">
                    <CustomInput
                      label="User Number"
                      placeholder="User Number"
                      value={values.userNo}
                      onChangeText={handleChange('userNo')}
                      onBlur={handleBlur('userNo')}
                      variant="filled"
                      error={touched.userNo && errors.userNo ? errors.userNo : undefined}
                      required
                      editable={false}
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Username"
                      placeholder="Username"
                      value={values.username}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      variant="filled"
                      error={touched.username && errors.username ? errors.username : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Email"
                      placeholder="Email"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      keyboardType="email-address"
                      variant="filled"
                      error={touched.email && errors.email ? errors.email : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="First Name"
                      placeholder="First Name"
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      variant="filled"
                      error={touched.firstName && errors.firstName ? errors.firstName : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Last Name"
                      placeholder="Last Name"
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      variant="filled"
                      error={touched.lastName && errors.lastName ? errors.lastName : undefined}
                      required
                    />
                  </VStack>

                  {/* CUSTOMER FEATURE SECTION */}
                  <Text fontSize="md" color="white" fontWeight="bold" alignSelf="flex-start" mt={4}>
                    Customer Feature
                  </Text>
                  <VStack width="100%">
                    <CustomInput
                      label="Height (cm)"
                      placeholder="Height"
                      value={values.height}
                      onChangeText={handleChange('height')}
                      onBlur={handleBlur('height')}
                      keyboardType="numeric"
                      variant="filled"
                      error={touched.height && errors.height ? errors.height : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Weight (kg)"
                      placeholder="Weight"
                      value={values.weight}
                      onChangeText={handleChange('weight')}
                      onBlur={handleBlur('weight')}
                      keyboardType="numeric"
                      variant="filled"
                      error={touched.weight && errors.weight ? errors.weight : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Age"
                      placeholder="Age"
                      value={values.age}
                      onChangeText={handleChange('age')}
                      onBlur={handleBlur('age')}
                      keyboardType="numeric"
                      variant="filled"
                      error={touched.age && errors.age ? errors.age : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomSelect
                      label="Skin Tone"
                      value={values.skintone}
                      onChange={(value) => handleChange('skintone')(value)}
                      required
                      error={touched.skintone && errors.skintone ? errors.skintone : undefined}
                    >
                      <CustomSelect.Item label="Fair" value="Fair" />
                      <CustomSelect.Item label="Light" value="Light" />
                      <CustomSelect.Item label="Medium" value="Medium" />
                      <CustomSelect.Item label="Dark" value="Dark" />
                      <CustomSelect.Item label="Deep" value="Deep" />
                    </CustomSelect>
                  </VStack>
                  <VStack width="100%">
                    <CustomSelect
                      label="Body Shape"
                      value={values.bodyShape}
                      onChange={(value) => handleChange('bodyShape')(value)}
                      required
                      error={touched.bodyShape && errors.bodyShape ? errors.bodyShape : undefined}
                    >
                      <CustomSelect.Item label="Bulky" value="Bulky" />
                      <CustomSelect.Item label="Athletic" value="Athletic" />
                      <CustomSelect.Item label="Skinny" value="Skinny" />
                      <CustomSelect.Item label="Fit" value="Fit" />
                      <CustomSelect.Item label="Skinny Fat" value="Skinny Fat" />
                      <CustomSelect.Item label="Chubby" value="Chubby" />
                    </CustomSelect>
                  </VStack>

                  {/* CUSTOMER ADDRESS SECTION */}
                  <Text fontSize="md" color="white" fontWeight="bold" alignSelf="flex-start" mt={4}>
                    Customer Address
                  </Text>
                  <VStack width="100%">
                    <CustomInput
                      label="Building No"
                      placeholder="Building No"
                      value={values.buildingNo}
                      onChangeText={handleChange('buildingNo')}
                      onBlur={handleBlur('buildingNo')}
                      variant="filled"
                      error={touched.buildingNo && errors.buildingNo ? errors.buildingNo : undefined}
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Street"
                      placeholder="Street"
                      value={values.street}
                      onChangeText={handleChange('street')}
                      onBlur={handleBlur('street')}
                      variant="filled"
                      error={touched.street && errors.street ? errors.street : undefined}
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Barangay"
                      placeholder="Barangay"
                      value={values.barangay}
                      onChangeText={handleChange('barangay')}
                      onBlur={handleBlur('barangay')}
                      variant="filled"
                      error={touched.barangay && errors.barangay ? errors.barangay : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Municipality"
                      placeholder="Municipality"
                      value={values.municipality}
                      onChangeText={handleChange('municipality')}
                      onBlur={handleBlur('municipality')}
                      variant="filled"
                      error={touched.municipality && errors.municipality ? errors.municipality : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Province"
                      placeholder="Province"
                      value={values.province}
                      onChangeText={handleChange('province')}
                      onBlur={handleBlur('province')}
                      variant="filled"
                      error={touched.province && errors.province ? errors.province : undefined}
                      required
                    />
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Postal Code"
                      placeholder="Postal Code"
                      value={values.postalCode}
                      onChangeText={handleChange('postalCode')}
                      onBlur={handleBlur('postalCode')}
                      variant="filled"
                      error={touched.postalCode && errors.postalCode ? errors.postalCode : undefined}
                      required
                    />
                  </VStack>

                  <DefaultButton
                    mt={10}
                    title={isSubmitting ? "Saving..." : "Save Changes"}
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

const styles = StyleSheet.create({
  loadingContainerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
