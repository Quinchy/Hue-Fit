// src/types/navigation.ts

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import {
  PrevRegistrationData,
  PersonalInformationValues,
  AddressValues,
  PersonalFeatureValues,
} from "./forms";

/** All screens & their params */
export type RootStackParamList = {
  Login: undefined;
  Register: { registerData?: Partial<PersonalInformationValues> };
  Register2: {
    registerData: PersonalInformationValues & Partial<AddressValues>;
  };
  Register3: {
    registerData: PrevRegistrationData & Partial<PersonalFeatureValues>;
  };
  ForgotPassword: undefined;
  Main: undefined;
  Cart: undefined;
  EditProfile: undefined;
  ProfileSettings: undefined;
  OrderTransactionScreen: undefined;
  OrderHistory: undefined;
  VirtualFitting: undefined;
  AiTryOn: undefined;
  Shop: undefined;
  ProductView: { productId: number };
  Notification: undefined;
  ViewNotification: undefined;
  ArTryOn: undefined;
  GeneratedOutfitList: undefined;
  GeneratedOutfitView: undefined;
};

/** Hook type for useNavigation() */
export type NavigationProp<RouteName extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, RouteName>;

/** Hook type for useRoute() */
export type ScreenRouteProp<RouteName extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, RouteName>;
