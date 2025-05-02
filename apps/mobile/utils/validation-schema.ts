import * as Yup from "yup";

// This file contains the validation schemas for various forms used in the app.

// Login form validation schema
export const LoginSchema = Yup.object().shape({
  username: Yup.string().trim().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

// Registration form validation schema
export const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});
export const Register2Schema = Yup.object().shape({
  buildingNo: Yup.string(),
  street: Yup.string(),
  barangay: Yup.string().required("Barangay is required"),
  municipality: Yup.string().required("Municipality is required"),
  province: Yup.string().required("Province is required"),
  postalCode: Yup.string().required("Postal Code is required"),
});
export const Register3Schema = Yup.object().shape({
  height: Yup.number()
    .typeError("Must be a number")
    .required("Height is required"),
  weight: Yup.number()
    .typeError("Must be a number")
    .required("Weight is required"),
  age: Yup.number().typeError("Must be a number").required("Age is required"),
  skinTone: Yup.string().required("Skin Tone is required"),
  bodyShape: Yup.string().required("Body Shape is required"),
});

/** Forgot / Reset password */
export const ForgotPasswordSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export const ResetPasswordSchema = Yup.object().shape({
  otp: Yup.string().required("OTP is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm Password is required"),
});