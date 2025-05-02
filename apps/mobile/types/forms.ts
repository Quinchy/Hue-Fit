// src/types/forms.ts

// This file contains the form values and types used in the app.

// Registration form types
export interface PersonalInformationValues {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AddressValues {
  buildingNo: string;
  street: string;
  barangay: string;
  municipality: string;
  province: string;
  postalCode: string;
}

export type PrevRegistrationData = PersonalInformationValues & AddressValues;

export interface PersonalFeatureValues {
  height: string;
  weight: string;
  age: string;
  skinTone: string;
  bodyShape: string;
}

export type CompleteRegistrationData = PrevRegistrationData & PersonalFeatureValues;

// Forgot/Reset-Password form values
export interface ForgotPasswordValues {
  username: string;
  email: string;
}

export interface ResetPasswordValues {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}