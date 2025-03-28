// EditProfileScreen.js
import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, Alert, View, Pressable } from "react-native";
import { VStack, Text, Center, HStack, Image, Select, Box } from "native-base";
import BackgroundProvider from "../../providers/BackgroundProvider";
import CustomInput from "../../components/Input";
import DefaultButton from "../../components/Button";
import CustomSelect from "../../components/Select";
import { Formik } from "formik";
import * as Yup from "yup";
import { EXPO_PUBLIC_API_URL } from "@env";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import LoadingSpinner from "../../components/Loading";

CustomSelect.Item = Select.Item;
const placeholderProfile = require("../../assets/placeholder-profile-picture.png");

const EditProfileSchema = Yup.object().shape({
  userNo: Yup.string().required("User Number is required"),
  username: Yup.string().required("Username is required"),
  profilePicture: Yup.string(),
  email: Yup.string().email("Invalid email").required("Email is required"),
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  height: Yup.number()
    .typeError("Must be a number")
    .required("Height is required"),
  weight: Yup.number()
    .typeError("Must be a number")
    .required("Weight is required"),
  age: Yup.number().typeError("Must be a number").required("Age is required"),
  skintone: Yup.string().required("Skin Tone is required"),
  bodyShape: Yup.string().required("Body Shape is required"),
  buildingNo: Yup.string(),
  street: Yup.string(),
  barangay: Yup.string().required("Barangay is required"),
  municipality: Yup.string().required("Municipality is required"),
  province: Yup.string().required("Province is required"),
  postalCode: Yup.string().required("Postal Code is required"),
});

export default function EditProfileScreen({ navigation }) {
  const [initialValues, setInitialValues] = useState({
    userNo: "",
    username: "",
    profilePicture: "",
    email: "",
    firstName: "",
    lastName: "",
    height: "",
    weight: "",
    age: "",
    skintone: "",
    bodyShape: "",
    buildingNo: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // to store file info

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUserStr = await AsyncStorage.getItem("user");
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        if (storedUser) {
          setUserId(storedUser.id);
          const response = await fetch(
            `${EXPO_PUBLIC_API_URL}/api/mobile/profile/get-user-info`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: storedUser.id }),
            }
          );
          if (response.ok) {
            const user = await response.json();
            const loadedProfilePicture =
              user.CustomerProfile?.profilePicture || "";
            setInitialValues({
              userNo: user.userNo || "",
              username: user.username || "",
              profilePicture: loadedProfilePicture,
              email: user.CustomerProfile?.email || "",
              firstName: user.CustomerProfile?.firstName || "",
              lastName: user.CustomerProfile?.lastName || "",
              height: user.CustomerFeature?.height
                ? user.CustomerFeature.height.toString()
                : "",
              weight: user.CustomerFeature?.weight
                ? user.CustomerFeature.weight.toString()
                : "",
              age: user.CustomerFeature?.age
                ? user.CustomerFeature.age.toString()
                : "",
              skintone: user.CustomerFeature?.skintone || "",
              bodyShape: user.CustomerFeature?.bodyShape || "",
              buildingNo: user.CustomerAddress?.buildingNo || "",
              street: user.CustomerAddress?.street || "",
              barangay: user.CustomerAddress?.barangay || "",
              municipality: user.CustomerAddress?.municipality || "",
              province: user.CustomerAddress?.province || "",
              postalCode: user.CustomerAddress?.postalCode || "",
            });
            setProfileImagePreview(loadedProfilePicture);
            await AsyncStorage.setItem("user", JSON.stringify(user));
          } else {
            Alert.alert("Error", "Failed to fetch user info.");
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Image picker handler only picks the image and stores file info.
  const handleUploadProfilePicture = useCallback(async (setFieldValue) => {
    try {
      setUploading(true);
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access camera roll is required!"
        );
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (pickerResult.canceled) {
        return;
      }
      const file = pickerResult.assets[0];
      setProfileImagePreview(file.uri);
      setSelectedFile(file); // Save the file for later upload
      // Update the form's profilePicture field with the local preview URI
      setFieldValue("profilePicture", file.uri);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Upload Error", "Failed to pick image.");
    } finally {
      setUploading(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner
          size={300}
          messages="Loading edit profile..."
          visible={true}
        />
      </View>
    );
  }

  return (
    <BackgroundProvider>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        contentContainerStyle={{ padding: 10, backgroundColor: "#191919" }}
      >
        <HStack
          alignItems="center"
          space={2}
          mb={2}
          px={4}
          style={{ paddingTop: 40 }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ padding: 4 }}
            android_ripple={{
              color: "rgba(255, 255, 255, 0.3)",
              radius: 20,
              borderless: true,
            }}
            accessibilityLabel="Go back"
          >
            <ArrowLeft color="#FFF" size={24} />
          </Pressable>
          <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "bold" }}>
            Edit Profile
          </Text>
        </HStack>

        <Center>
          <Box
            style={{ backgroundColor: "#191919", padding: 15, width: "100%" }}
          >
            <Formik
              initialValues={initialValues}
              validationSchema={EditProfileSchema}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  // Build a FormData object for multipart submission
                  const formData = new FormData();
                  formData.append("userId", userId);
                  formData.append("username", values.username);
                  formData.append("email", values.email);
                  formData.append("firstName", values.firstName);
                  formData.append("lastName", values.lastName);
                  formData.append("height", values.height);
                  formData.append("weight", values.weight);
                  formData.append("age", values.age);
                  formData.append("skintone", values.skintone);
                  formData.append("bodyShape", values.bodyShape);
                  formData.append("buildingNo", values.buildingNo);
                  formData.append("street", values.street);
                  formData.append("barangay", values.barangay);
                  formData.append("municipality", values.municipality);
                  formData.append("province", values.province);
                  formData.append("postalCode", values.postalCode);

                  // Append a new profile picture file if one was selected.
                  if (selectedFile) {
                    const uriParts = selectedFile.uri.split("/");
                    const fileName = uriParts[uriParts.length - 1];
                    formData.append("profilePicture", {
                      uri: selectedFile.uri,
                      name: fileName,
                      type: "image/jpeg",
                    });
                  } else {
                    // If no new file was chosen, send the existing URL as a field.
                    formData.append("profilePicture", values.profilePicture);
                  }

                  const apiUrl = `${EXPO_PUBLIC_API_URL}/api/mobile/profile/edit-user-info`;
                  const response = await fetch(apiUrl, {
                    method: "POST",
                    body: formData,
                    // Do not manually set the Content-Type header when sending FormData in React Native.
                  });
                  const data = await response.json();
                  if (response.ok) {
                    Alert.alert("Success", "Profile updated successfully!");
                    if (data.user) {
                      await AsyncStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                      );
                    }
                  } else {
                    Alert.alert(
                      "Error",
                      data.message || "Profile update failed."
                    );
                  }
                } catch (error) {
                  console.error("Profile update error:", error);
                  Alert.alert(
                    "Error",
                    "An error occurred while updating profile."
                  );
                } finally {
                  setLocalSubmitting(false);
                  setSubmitting(false);
                }
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
                <VStack
                  space={6}
                  alignItems="center"
                  opacity={isSubmitting || localSubmitting ? 0.5 : 1}
                >
                  <VStack width="100%" space={4} alignItems="center">
                    <Image
                      key={profileImagePreview || "placeholder"}
                      source={
                        profileImagePreview
                          ? { uri: profileImagePreview }
                          : placeholderProfile
                      }
                      alt="Profile Picture"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        marginBottom: 10,
                        alignSelf: "center",
                      }}
                    />
                    <DefaultButton
                      title="Upload Profile Picture"
                      onPress={() => handleUploadProfilePicture(setFieldValue)}
                      isLoading={uploading}
                    />
                  </VStack>

                  <VStack width="100%" space={2}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "white",
                        fontWeight: "bold",
                        marginBottom: 4,
                      }}
                    >
                      General
                    </Text>
                    <CustomInput
                      label="User Number"
                      placeholder="User Number"
                      value={values.userNo}
                      onChangeText={handleChange("userNo")}
                      onBlur={handleBlur("userNo")}
                      variant="filled"
                      error={
                        touched.userNo && errors.userNo
                          ? errors.userNo
                          : undefined
                      }
                      required
                      isDisabled={true}
                    />
                    <CustomInput
                      label="Username"
                      placeholder="Username"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      variant="filled"
                      error={
                        touched.username && errors.username
                          ? errors.username
                          : undefined
                      }
                      required
                    />
                    <CustomInput
                      label="Email"
                      placeholder="Email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      keyboardType="email-address"
                      variant="filled"
                      error={
                        touched.email && errors.email ? errors.email : undefined
                      }
                      required
                    />
                    <CustomInput
                      label="First Name"
                      placeholder="First Name"
                      value={values.firstName}
                      onChangeText={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      variant="filled"
                      error={
                        touched.firstName && errors.firstName
                          ? errors.firstName
                          : undefined
                      }
                      required
                    />
                    <CustomInput
                      label="Last Name"
                      placeholder="Last Name"
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      variant="filled"
                      error={
                        touched.lastName && errors.lastName
                          ? errors.lastName
                          : undefined
                      }
                      required
                    />
                  </VStack>

                  <VStack width="100%" space={2}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "white",
                        fontWeight: "bold",
                        marginBottom: 4,
                      }}
                    >
                      Customer Feature
                    </Text>
                    <CustomInput
                      label="Height (cm)"
                      placeholder="Height"
                      value={values.height}
                      onChangeText={handleChange("height")}
                      onBlur={handleBlur("height")}
                      keyboardType="numeric"
                      variant="filled"
                      error={
                        touched.height && errors.height
                          ? errors.height
                          : undefined
                      }
                      required
                    />
                    <CustomInput
                      label="Weight (kg)"
                      placeholder="Weight"
                      value={values.weight}
                      onChangeText={handleChange("weight")}
                      onBlur={handleBlur("weight")}
                      keyboardType="numeric"
                      variant="filled"
                      error={
                        touched.weight && errors.weight
                          ? errors.weight
                          : undefined
                      }
                      required
                    />
                    <CustomInput
                      label="Age"
                      placeholder="Age"
                      value={values.age}
                      onChangeText={handleChange("age")}
                      onBlur={handleBlur("age")}
                      keyboardType="numeric"
                      variant="filled"
                      error={touched.age && errors.age ? errors.age : undefined}
                      required
                    />
                    <CustomSelect
                      label="Skin Tone"
                      value={values.skintone}
                      onChange={(value) => handleChange("skintone")(value)}
                      required
                      error={
                        touched.skintone && errors.skintone
                          ? errors.skintone
                          : undefined
                      }
                    >
                      <CustomSelect.Item label="Fair" value="Fair" />
                      <CustomSelect.Item label="Light" value="Light" />
                      <CustomSelect.Item label="Medium" value="Medium" />
                      <CustomSelect.Item label="Dark" value="Dark" />
                      <CustomSelect.Item label="Deep" value="Deep" />
                    </CustomSelect>
                    <CustomSelect
                      label="Body Shape"
                      value={values.bodyShape}
                      onChange={(value) => handleChange("bodyShape")(value)}
                      required
                      error={
                        touched.bodyShape && errors.bodyShape
                          ? errors.bodyShape
                          : undefined
                      }
                    >
                      <CustomSelect.Item label="Bulky" value="Bulky" />
                      <CustomSelect.Item label="Athletic" value="Athletic" />
                      <CustomSelect.Item label="Skinny" value="Skinny" />
                      <CustomSelect.Item label="Fit" value="Fit" />
                      <CustomSelect.Item
                        label="Skinny Fat"
                        value="Skinny Fat"
                      />
                      <CustomSelect.Item label="Chubby" value="Chubby" />
                    </CustomSelect>
                  </VStack>

                  <VStack width="100%" space={2}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "white",
                        fontWeight: "bold",
                        marginBottom: 4,
                      }}
                    >
                      Customer Address
                    </Text>
                    <CustomInput
                      label="Building No"
                      placeholder="Building No"
                      value={values.buildingNo}
                      onChangeText={handleChange("buildingNo")}
                      onBlur={handleBlur("buildingNo")}
                      variant="filled"
                      error={
                        touched.buildingNo && errors.buildingNo
                          ? errors.buildingNo
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Street"
                      placeholder="Street"
                      value={values.street}
                      onChangeText={handleChange("street")}
                      onBlur={handleBlur("street")}
                      variant="filled"
                      error={
                        touched.street && errors.street
                          ? errors.street
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Barangay"
                      placeholder="Barangay"
                      value={values.barangay}
                      onChangeText={handleChange("barangay")}
                      onBlur={handleBlur("barangay")}
                      variant="filled"
                      error={
                        touched.barangay && errors.barangay
                          ? errors.barangay
                          : undefined
                      }
                      required
                    />
                    <CustomInput
                      label="Municipality"
                      placeholder="Municipality"
                      value={values.municipality}
                      onChangeText={handleChange("municipality")}
                      onBlur={handleBlur("municipality")}
                      variant="filled"
                      error={
                        touched.municipality && errors.municipality
                          ? errors.municipality
                          : undefined
                      }
                      required
                    />
                    <CustomInput
                      label="Province"
                      placeholder="Province"
                      value={values.province}
                      onChangeText={handleChange("province")}
                      onBlur={handleBlur("province")}
                      variant="filled"
                      error={
                        touched.province && errors.province
                          ? errors.province
                          : undefined
                      }
                      required
                    />
                    <CustomInput
                      label="Postal Code"
                      placeholder="Postal Code"
                      value={values.postalCode}
                      onChangeText={handleChange("postalCode")}
                      onBlur={handleBlur("postalCode")}
                      variant="filled"
                      error={
                        touched.postalCode && errors.postalCode
                          ? errors.postalCode
                          : undefined
                      }
                      required
                    />
                  </VStack>

                  <DefaultButton
                    mt={10}
                    mb={125}
                    title={
                      localSubmitting || isSubmitting
                        ? "Saving..."
                        : "Save Changes"
                    }
                    onPress={handleSubmit}
                    isDisabled={localSubmitting || isSubmitting}
                  />
                </VStack>
              )}
            </Formik>
          </Box>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
