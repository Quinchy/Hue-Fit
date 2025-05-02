// screens/ForgotPasswordScreen.tsx
import React, { useState } from "react";
import { Image, ScrollView, Modal, View } from "react-native";
import { VStack, HStack, Text, Center } from "native-base";
import BackgroundProvider from "../../providers/BackgroundProvider";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Link from "../../components/Link";
import GradientCard from "../../components/GradientCard";
import Alert, { AlertStatus } from "../../components/Alert";
import { Formik } from "formik";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../types/navigation";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../../utils/validation-schema";
import { ForgotPasswordValues, ResetPasswordValues } from "../../types/forms";
import { EXPO_PUBLIC_API_URL } from "@env";
import { colors, applyOpacity } from "../../constants/colors";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp<"ForgotPassword">>();

  // Alert & modal state
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("error");
  const [modalVisible, setModalVisible] = useState(false);

  // Loading & carry-over
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [usernameForReset, setUsernameForReset] = useState("");
  const [emailForReset, setEmailForReset] = useState("");

  const showAlert = (msg: string, status: AlertStatus = "error") => {
    setAlertMessage(msg);
    setAlertStatus(status);
  };

  const handleForgot = async (values: ForgotPasswordValues) => {
    setLoading(true);
    showAlert("", "error");
    try {
      const res = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/forgot-password/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-platform": "mobile",
          },
          body: JSON.stringify(values),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showAlert(data.message || "OTP sent successfully.", "success");
        setUsernameForReset(values.username);
        setEmailForReset(values.email);
        setModalVisible(true);
      } else {
        showAlert(data.error || "Failed to send OTP.", "error");
      }
    } catch {
      showAlert("An unexpected error occurred. Please try again.", "error");
    }
    setLoading(false);
  };

  const handleReset = async (values: ResetPasswordValues) => {
    setResetLoading(true);
    showAlert("", "error");
    try {
      const res = await fetch(
        `${EXPO_PUBLIC_API_URL}/api/forgot-password/create-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-platform": "mobile",
          },
          body: JSON.stringify({
            username: usernameForReset,
            email: emailForReset,
            otp: values.otp,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showAlert("Password updated! Redirecting...", "success");
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate("Login");
        }, 800);
      } else {
        showAlert(data.error || "Failed to update password.", "error");
      }
    } catch {
      showAlert("An unexpected error occurred. Please try again.", "error");
    }
    setResetLoading(false);
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

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Center flex={1}>
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
                FORGOT PASSWORD
              </Text>
              <HStack alignItems="center" space={1}>
                <Text
                  fontSize="md"
                  color={applyOpacity(colors.greyWhite, 0.95)}
                >
                  Remembered your password?
                </Text>
                <Link label="Login" to="Login" />
              </HStack>
            </Center>

            <Formik<ForgotPasswordValues>
              initialValues={{ username: "", email: "" }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleForgot}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <VStack space={10}>
                  <VStack space={4} alignItems="center">
                    <Input
                      label="Username"
                      placeholder="Enter your username"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      error={touched.username ? errors.username : undefined}
                      required
                    />
                    <Input
                      label="Email"
                      placeholder="Enter your email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      error={touched.email ? errors.email : undefined}
                      required
                    />
                  </VStack>
                  <Button
                    title="SEND"
                    onPress={handleSubmit as any}
                    isLoading={loading}
                    loadingTitle="SENDING..."
                    isDisabled={loading}
                  />
                </VStack>
              )}
            </Formik>
          </GradientCard>
        </Center>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Center flex={1}>
          <View
            style={{
              width: "100%",
              borderRadius: 10,
              padding: 20,
              backgroundColor: colors.dark,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Center mt={5} mb={10}>
              <Text fontSize="3xl" color={colors.white} fontWeight="bold">
                RESET PASSWORD
              </Text>
            </Center>

            <Formik<ResetPasswordValues>
              initialValues={{ otp: "", newPassword: "", confirmPassword: "" }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleReset}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <VStack space={4} alignItems="center">
                  <Input
                    label="OTP"
                    placeholder="Enter OTP"
                    value={values.otp}
                    onChangeText={handleChange("otp")}
                    onBlur={handleBlur("otp")}
                    error={touched.otp ? errors.otp : undefined}
                    required
                  />
                  <Input
                    label="New Password"
                    placeholder="Enter new password"
                    value={values.newPassword}
                    onChangeText={handleChange("newPassword")}
                    onBlur={handleBlur("newPassword")}
                    isPassword
                    error={touched.newPassword ? errors.newPassword : undefined}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    isPassword
                    error={
                      touched.confirmPassword
                        ? errors.confirmPassword
                        : undefined
                    }
                    required
                  />

                  <Button
                    mt={10}
                    title="UPDATE PASSWORD"
                    onPress={handleSubmit as any}
                    isLoading={resetLoading}
                    loadingTitle="UPDATING..."
                    isDisabled={resetLoading}
                  />

                  <Button
                    mt={4}
                    title="CANCEL"
                    variant="outline"
                    onPress={() => setModalVisible(false)}
                  />
                </VStack>
              )}
            </Formik>
          </View>
        </Center>
      </Modal>
    </BackgroundProvider>
  );
}
