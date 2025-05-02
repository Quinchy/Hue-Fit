// screens/RegisterScreen.tsx
import React from "react";
import { Image, ScrollView, Pressable } from "react-native";
import { VStack, HStack, Text, Center } from "native-base";
import BackgroundProvider from "../../providers/BackgroundProvider";
import Input from "../../components/Input";
import Button from "../../components/Button";
import GradientCard from "../../components/GradientCard";
import { Formik, FormikProps } from "formik";
import { colors, applyOpacity } from "../../constants/colors";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NavigationProp, RootStackParamList } from "../../types/navigation";
import { PersonalInformationValues } from "../../types/forms";
import { RegisterSchema } from "../../utils/validation-schema";

type RegisterRouteProp = RouteProp<RootStackParamList, "Register">;
type RegisterNavProp = NavigationProp<"Register">;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const route = useRoute<RegisterRouteProp>();

  const prevData = route.params?.registerData ?? {};

  return (
    <BackgroundProvider>
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
                REGISTER
              </Text>
              <HStack alignItems="center" space={1}>
                <Text
                  fontSize="md"
                  color={applyOpacity(colors.greyWhite, 0.5)}
                >
                  Already have an account?
                </Text>
                <Pressable onPress={() => navigation.navigate("Login")}>
                  {({ pressed }) => (
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color={colors.white}
                      style={{
                        textDecorationLine: pressed ? "underline" : "none",
                      }}
                    >
                      Login
                    </Text>
                  )}
                </Pressable>
              </HStack>
            </Center>

            <VStack alignItems="flex-start" mb={5}>
              <Text fontSize="lg" color={colors.white} fontWeight="bold">
                Personal Information
              </Text>
              <Text
                fontSize="md"
                color={applyOpacity(colors.greyWhite, 0.5)}
              >
                Please fill the form with your personal information
              </Text>
            </VStack>

            <Formik<PersonalInformationValues>
              initialValues={{
                firstName: prevData.firstName ?? "",
                lastName: prevData.lastName ?? "",
                username: prevData.username ?? "",
                password: prevData.password ?? "",
                confirmPassword: prevData.confirmPassword ?? "",
              }}
              validationSchema={RegisterSchema}
              onSubmit={(values) =>
                navigation.navigate("Register2", { registerData: values })
              }
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }: FormikProps<PersonalInformationValues>) => (
                <VStack space={10}>
                  <VStack space={2} alignItems="center">
                    <Input
                      label="First Name"
                      placeholder="Please enter your first name"
                      value={values.firstName}
                      onChangeText={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      error={touched.firstName ? errors.firstName : undefined}
                      required
                    />
                    <Input
                      label="Last Name"
                      placeholder="Please enter your last name"
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      error={touched.lastName ? errors.lastName : undefined}
                      required
                    />
                    <Input
                      label="Username"
                      placeholder="Please enter a username"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      error={touched.username ? errors.username : undefined}
                      required
                    />
                    <Input
                      label="Password"
                      placeholder="Please enter a password"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      isPassword
                      error={touched.password ? errors.password : undefined}
                      required
                    />
                    <Input
                      label="Confirm Password"
                      placeholder="Please re-enter the password"
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
                  </VStack>
                  <Button title="NEXT" onPress={handleSubmit as any} />
                </VStack>
              )}
            </Formik>
          </GradientCard>
        </Center>
      </ScrollView>
    </BackgroundProvider>
  );
}
