// screens/Register3Screen.tsx
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { VStack, Text, Center, HStack, Box, Spinner } from "native-base";
import { ArrowLeft } from "lucide-react-native";
import BackgroundProvider from "../../providers/BackgroundProvider";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import GradientCard from "../../components/GradientCard";
import IconButton from "../../components/IconButton";
import Alert, { AlertStatus } from "../../components/Alert";
import { Formik, FormikProps } from "formik";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NavigationProp, ScreenRouteProp } from "../../types/navigation";
import { PrevRegistrationData, PersonalFeatureValues } from "../../types/forms";
import { Register3Schema } from "../../utils/validation-schema";
import { EXPO_PUBLIC_API_URL } from "@env";
import { colors, applyOpacity } from "../../constants/colors";

type Register3Nav = NavigationProp<"Register3">;
type Register3Route = ScreenRouteProp<"Register3">;

export default function Register3Screen() {
  const navigation = useNavigation<Register3Nav>();
  const route = useRoute<Register3Route>();
  const prevData = route.params.registerData;

  // Alert state
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>("error");

  const showAlert = (message: string, status: AlertStatus = "error") => {
    setAlertMessage(message);
    setAlertStatus(status);
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
          <HStack width="100%" px={2} pt={165} mb={5}>
            <IconButton
              icon={<ArrowLeft color={colors.white} size={24} />}
              onPress={() =>
                navigation.navigate("Register2", { registerData: prevData })
              }
            />
          </HStack>

          <GradientCard>
            <VStack alignItems="flex-start" mt={5} mb={5}>
              <Text fontSize="lg" color={colors.white} fontWeight="bold">
                Personal Features
              </Text>
              <Text fontSize="md" color={applyOpacity(colors.greyWhite, 0.6)}>
                Please fill the form with your personal details.
              </Text>
            </VStack>

            <Formik<PersonalFeatureValues>
              initialValues={{
                height: prevData.height != null ? String(prevData.height) : "",
                weight: prevData.weight != null ? String(prevData.weight) : "",
                age: prevData.age != null ? String(prevData.age) : "",
                skinTone: prevData.skinTone ?? "",
                bodyShape: prevData.bodyShape ?? "",
              }}
              validationSchema={Register3Schema}
              onSubmit={async (values, { setSubmitting }) => {
                const heightNum = parseFloat(values.height);
                const weightNum = parseFloat(values.weight);
                const ageNum = parseInt(values.age, 10);

                if (isNaN(heightNum) || isNaN(weightNum) || isNaN(ageNum)) {
                  showAlert(
                    "Please enter valid numeric values for Height, Weight, and Age.",
                    "error"
                  );
                  setSubmitting(false);
                  return;
                }

                const payload: PrevRegistrationData & {
                  height: number;
                  weight: number;
                  age: number;
                  skintone: string;
                  bodyshape: string;
                  role: "CUSTOMER";
                } = {
                  ...prevData,
                  height: heightNum,
                  weight: weightNum,
                  age: ageNum,
                  skintone: values.skinTone,
                  bodyshape: values.bodyShape,
                  role: "CUSTOMER",
                };

                try {
                  const res = await fetch(
                    `${EXPO_PUBLIC_API_URL}/api/mobile/auth/register`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    }
                  );
                  const data = await res.json();
                  if (res.ok) {
                    showAlert("User registered successfully!", "success");
                    setTimeout(() => navigation.navigate("Login"), 300);
                  } else {
                    showAlert(data.message || "Registration failed.", "error");
                  }
                } catch (err) {
                  console.error(err);
                  showAlert("An error occurred during registration.", "error");
                } finally {
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
                isSubmitting,
              }: FormikProps<PersonalFeatureValues>) => (
                <Box flex={1}>
                  <VStack
                    space={4}
                    width="100%"
                    alignItems="center"
                    opacity={isSubmitting ? 0.5 : 1}
                  >
                    <Input
                      label="Height (in cm)"
                      placeholder="Please enter your height"
                      value={values.height}
                      onChangeText={handleChange("height")}
                      onBlur={handleBlur("height")}
                      keyboardType="numeric"
                      isDisabled={isSubmitting}
                      error={touched.height ? errors.height : undefined}
                      required
                    />

                    <Input
                      label="Weight (in kg)"
                      placeholder="Please enter your weight"
                      value={values.weight}
                      onChangeText={handleChange("weight")}
                      onBlur={handleBlur("weight")}
                      keyboardType="numeric"
                      isDisabled={isSubmitting}
                      error={touched.weight ? errors.weight : undefined}
                      required
                    />

                    <Input
                      label="Age"
                      placeholder="Please enter your age"
                      value={values.age}
                      onChangeText={handleChange("age")}
                      onBlur={handleBlur("age")}
                      keyboardType="numeric"
                      isDisabled={isSubmitting}
                      error={touched.age ? errors.age : undefined}
                      required
                    />

                    <Select
                      label="Skin Tone"
                      placeholder="Please select your skin tone"
                      value={values.skinTone}
                      onValueChange={handleChange("skinTone")}
                      isDisabled={isSubmitting}
                      error={touched.skinTone ? errors.skinTone : undefined}
                      required
                      infoContent={{
                        fair: {
                          hex: "#FFEAD9",
                          description: "Very light complexion",
                        },
                        light: {
                          hex: "#D8C0AB",
                          description: "Light complexion",
                        },
                        medium: {
                          hex: "#D1A17B",
                          description: "Medium tan complexion",
                        },
                        dark: {
                          hex: "#8E583E",
                          description: "Dark brown complexion",
                        },
                        deep: {
                          hex: "#422D26",
                          description: "Very deep brown complexion",
                        },
                      }}
                    >
                      <Select.Item label="Fair" value="fair" />
                      <Select.Item label="Light" value="light" />
                      <Select.Item label="Medium" value="medium" />
                      <Select.Item label="Dark" value="dark" />
                      <Select.Item label="Deep" value="deep" />
                    </Select>

                    <Select
                      label="Body Type"
                      placeholder="Please select your body type"
                      value={values.bodyShape}
                      onValueChange={handleChange("bodyShape")}
                      isDisabled={isSubmitting}
                      error={touched.bodyShape ? errors.bodyShape : undefined}
                      required
                      infoContent={{
                        bulky:
                          "Broad body with a muscular build and slight fat",
                        athletic: "Lean body with defined muscles",
                        skinny: "Very slim frame with little muscle and fat",
                        fit: "Balanced muscle and body fat",
                        "skinny fat": "Slim limbs with visible belly fat",
                        chubby: "Rounded physique with extra body fat",
                      }}
                    >
                      <Select.Item label="Bulky" value="bulky" />
                      <Select.Item label="Athletic" value="athletic" />
                      <Select.Item label="Skinny" value="skinny" />
                      <Select.Item label="Fit" value="fit" />
                      <Select.Item label="Skinny Fat" value="skinny fat" />
                      <Select.Item label="Chubby" value="chubby" />
                    </Select>
                  </VStack>

                  <VStack space={10} mt={10} width="100%">
                    <Button
                      title="REGISTER"
                      loadingTitle="Registering..."
                      onPress={handleSubmit as any}
                      isLoading={isSubmitting}
                      isDisabled={isSubmitting}
                    />
                  </VStack>
                </Box>
              )}
            </Formik>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
