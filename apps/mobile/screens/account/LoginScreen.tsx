// screens/LoginScreen.tsx
import React, { useState } from "react";
import { Image, ScrollView } from "react-native";
import { VStack, HStack, Text, Center } from "native-base";
import { Formik } from "formik";
import BackgroundProvider from "../../providers/BackgroundProvider";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Link from "../../components/Link";
import GradientCard from "../../components/GradientCard";
import Alert, { AlertStatus } from "../../components/Alert";
import { NavigationProp } from "../../types/navigation";
import { LoginSchema } from "../../utils/validation-schema";
import { colors, applyOpacity } from "../../constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { EXPO_PUBLIC_API_URL } from "@env";

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<"Login">>();

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("error");

  const showAlert = (message: string, status: AlertStatus = "error") => {
    setAlertMessage(message);
    setAlertStatus(status);
  };

  const handleLogin = async (
    values: { username: string; password: string },
    formikHelpers: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    formikHelpers.setSubmitting(true);
    try {
      const res = await fetch(`${EXPO_PUBLIC_API_URL}/api/mobile/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          await AsyncStorage.setItem("user", JSON.stringify(data));
          navigation.reset({ index: 0, routes: [{ name: "Main" }] });
          return;
        } else {
          showAlert(data.message || "Invalid credentials", "error");
        }
      } else {
        showAlert("Unexpected response format", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("An error occurred. Please try again.", "error");
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <BackgroundProvider>
      {alertMessage && (
        <Alert
          message={alertMessage}
          status={alertStatus}
          onClose={() => setAlertMessage(null)}
        />
      )}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          <Image
            source={require("../../assets/icons/hue-fit-logo.png")}
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
              <Text fontSize="3xl" color={colors.white} fontWeight="bold">
                LOGIN
              </Text>
              <HStack alignItems="center" space={1}>
                <Text fontSize="md" color={applyOpacity(colors.greyWhite, 0.5)}>
                  Don't have an account?
                </Text>
                <Link label="Register" to="Register" />
              </HStack>
            </Center>

            <Formik
              initialValues={{ username: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <VStack space={10}>
                  <VStack space={5} alignItems="center">
                    <Input
                      label="Username"
                      placeholder="Username"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      error={touched.username ? errors.username : undefined}
                      required
                      isDisabled={isSubmitting}
                    />
                    <VStack space={2}>
                      <Input
                        label="Password"
                        placeholder="Password"
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        isPassword
                        error={touched.password ? errors.password : undefined}
                        required
                        isDisabled={isSubmitting}
                      />
                      <Link
                        label="Forgot Password?"
                        to="ForgotPassword"
                        style={{ alignSelf: "flex-end" }}
                      />
                    </VStack>
                  </VStack>
                  <Button
                    title="LOGIN"
                    loadingTitle="LOGGING IN..."
                    onPress={handleSubmit as any}
                    isLoading={isSubmitting}
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
