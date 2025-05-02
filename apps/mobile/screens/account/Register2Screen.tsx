// screens/Register2Screen.tsx
import React from "react";
import { ScrollView } from "react-native";
import { VStack, Text, Center, HStack } from "native-base";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute} from "@react-navigation/native";
import { NavigationProp, ScreenRouteProp } from "../../types/navigation";
import BackgroundProvider from "../../providers/BackgroundProvider";
import Input from "../../components/Input";
import Button from "../../components/Button";
import IconButton from "../../components/IconButton";
import GradientCard from "../../components/GradientCard";
import { AddressValues } from "../../types/forms";
import { Register2Schema } from "../../utils/validation-schema";
import { colors, applyOpacity } from "../../constants/colors";
import { Formik, FormikProps } from "formik";

// Navigation & route types
type Register2Nav = NavigationProp<"Register2">;
type Register2Route = ScreenRouteProp<"Register2">;

export default function Register2Screen() {
  const navigation = useNavigation<Register2Nav>();
  const route = useRoute<Register2Route>();
  const prevData = route.params.registerData;

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          <HStack width="100%" px={2} pt={165} mb={5}>
            <IconButton
              icon={<ArrowLeft color={colors.white} size={24} />}
              onPress={() =>
                navigation.navigate("Register", { registerData: prevData })
              }
            />
          </HStack>

          <GradientCard>
            <VStack alignItems="flex-start" mt={5} mb={5}>
              <Text fontSize="lg" color={colors.white} fontWeight="bold">
                Address Information
              </Text>
              <Text fontSize="md" color={applyOpacity(colors.greyWhite, 0.6)}>
                Please fill in your address details.
              </Text>
            </VStack>

            <Formik<AddressValues>
              initialValues={{
                buildingNo: prevData.buildingNo ?? "",
                street: prevData.street ?? "",
                barangay: prevData.barangay ?? "",
                municipality: prevData.municipality ?? "",
                province: prevData.province ?? "",
                postalCode: prevData.postalCode ?? "",
              }}
              validationSchema={Register2Schema}
              onSubmit={(values) =>
                navigation.navigate("Register3", {
                  registerData: { ...prevData, ...values },
                })
              }
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }: FormikProps<AddressValues>) => (
                <VStack space={10}>
                  <VStack space={4} width="100%" alignItems="center">
                    <Input
                      label="Building No"
                      placeholder="Please enter your building no."
                      value={values.buildingNo}
                      onChangeText={handleChange("buildingNo")}
                      onBlur={handleBlur("buildingNo")}
                    />
                    <Input
                      label="Street"
                      placeholder="Please enter your street"
                      value={values.street}
                      onChangeText={handleChange("street")}
                      onBlur={handleBlur("street")}
                    />
                    <Input
                      label="Barangay"
                      placeholder="Please enter your barangay"
                      value={values.barangay}
                      onChangeText={handleChange("barangay")}
                      onBlur={handleBlur("barangay")}
                      error={
                        touched.barangay && errors.barangay
                          ? errors.barangay
                          : undefined
                      }
                      required
                    />
                    <Input
                      label="Municipality"
                      placeholder="Please enter your municipality"
                      value={values.municipality}
                      onChangeText={handleChange("municipality")}
                      onBlur={handleBlur("municipality")}
                      error={
                        touched.municipality && errors.municipality
                          ? errors.municipality
                          : undefined
                      }
                      required
                    />
                    <Input
                      label="Province"
                      placeholder="Please enter your province"
                      value={values.province}
                      onChangeText={handleChange("province")}
                      onBlur={handleBlur("province")}
                      error={
                        touched.province && errors.province
                          ? errors.province
                          : undefined
                      }
                      required
                    />
                    <Input
                      label="Postal Code"
                      placeholder="Please enter your postal code"
                      value={values.postalCode}
                      onChangeText={handleChange("postalCode")}
                      onBlur={handleBlur("postalCode")}
                      error={
                        touched.postalCode && errors.postalCode
                          ? errors.postalCode
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
