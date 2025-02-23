import React, { useState } from 'react';
import { Image, ScrollView, Pressable, Modal, ActivityIndicator } from 'react-native';
import { VStack, HStack, Text, Center } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import CustomInput from '../../components/Input';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { EXPO_PUBLIC_API_URL } from '@env';
import { useTheme, applyOpacity } from '../../providers/ThemeProvider';

const ForgotPasswordSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const ResetPasswordSchema = Yup.object().shape({
  otp: Yup.string().required('OTP is required'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [usernameForReset, setUsernameForReset] = useState('');
  const [emailForReset, setEmailForReset] = useState('');

  const handleForgotPassword = async (values: { username: string; email: string; }) => {
    setLoading(true);
    setRequestError('');
    setRequestSuccess('');
    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/forgot-password/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-platform': 'mobile',
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setRequestSuccess(data.message || 'OTP sent successfully.');
        setUsernameForReset(values.username);
        setEmailForReset(values.email);
        setModalVisible(true);
      } else {
        setRequestError(data.error || 'Failed to send OTP.');
      }
    } catch (error) {
      setRequestError('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (values: { otp: string; newPassword: string; confirmPassword: string; }) => {
    setResetLoading(true);
    setResetError('');
    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/forgot-password/create-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-platform': 'mobile',
        },
        body: JSON.stringify({
          username: usernameForReset,
          email: emailForReset,
          otp: values.otp,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setModalVisible(false);
        navigation.navigate('Login');
      } else {
        setResetError(data.error || 'Failed to update password.');
      }
    } catch (error) {
      setResetError('An unexpected error occurred. Please try again.');
    }
    setResetLoading(false);
  };

  return (
    <BackgroundProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Center>
          <Image
            source={require('../../assets/icons/hue-fit-logo.png')}
            style={{ width: 60, height: 60, marginTop: 225, marginBottom: 30 }}
            resizeMode="contain"
          />
          <GradientCard>
            <Center mt={5} mb={10}>
              <Text fontSize="3xl" color={theme.colors.white} fontWeight="bold">
                FORGOT PASSWORD
              </Text>
              <HStack alignItems="center" space={1}>
                <Text fontSize="md" color={applyOpacity(theme.colors.greyWhite, 0.95)}>
                  Remembered your password?
                </Text>
                <Pressable onPress={() => navigation.navigate('Login')}>
                  {({ pressed }) => (
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color={theme.colors.white}
                      style={{ textDecorationLine: pressed ? 'underline' : 'none' }}
                    >
                      LOGIN
                    </Text>
                  )}
                </Pressable>
              </HStack>
            </Center>
            <Formik
              initialValues={{ username: '', email: '' }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={handleForgotPassword}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <VStack space={4} alignItems="center">
                  <VStack width="100%">
                    <CustomInput
                      label="Username"
                      placeholder="Enter your username"
                      value={values.username}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      error={touched.username && errors.username ? errors.username : undefined}
                      required
                    />
                    {touched.username && errors.username && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.username}
                      </Text>
                    )}
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Email"
                      placeholder="Enter your email"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={touched.email && errors.email ? errors.email : undefined}
                      required
                    />
                    {touched.email && errors.email && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.email}
                      </Text>
                    )}
                  </VStack>
                  {requestError ? (
                    <Text color="red.500" mt={1} fontSize="xs">
                      {requestError}
                    </Text>
                  ) : null}
                  {requestSuccess ? (
                    <Text color="green.500" mt={1} fontSize="xs">
                      {requestSuccess}
                    </Text>
                  ) : null}
                  {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.white} />
                  ) : (
                    <DefaultButton mt={10} title="SUBMIT" onPress={handleSubmit} />
                  )}
                </VStack>
              )}
            </Formik>
          </GradientCard>
        </Center>
      </ScrollView>

      {/* Modal for Reset Password */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Center flex={1} px={4}>
          <GradientCard>
            <Center mt={5} mb={10}>
              <Text fontSize="3xl" color={theme.colors.white} fontWeight="bold">
                RESET PASSWORD
              </Text>
            </Center>
            <Formik
              initialValues={{ otp: '', newPassword: '', confirmPassword: '' }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleResetPassword}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <VStack space={4} alignItems="center">
                  <VStack width="100%">
                    <CustomInput
                      label="OTP"
                      placeholder="Enter OTP"
                      value={values.otp}
                      onChangeText={handleChange('otp')}
                      onBlur={handleBlur('otp')}
                      error={touched.otp && errors.otp ? errors.otp : undefined}
                      required
                    />
                    {touched.otp && errors.otp && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.otp}
                      </Text>
                    )}
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="New Password"
                      placeholder="Enter new password"
                      value={values.newPassword}
                      onChangeText={handleChange('newPassword')}
                      onBlur={handleBlur('newPassword')}
                      isPassword
                      error={touched.newPassword && errors.newPassword ? errors.newPassword : undefined}
                      required
                    />
                    {touched.newPassword && errors.newPassword && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.newPassword}
                      </Text>
                    )}
                  </VStack>
                  <VStack width="100%">
                    <CustomInput
                      label="Confirm Password"
                      placeholder="Confirm new password"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      isPassword
                      error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                      required
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text color="red.500" mt={1} fontSize="xs">
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </VStack>
                  {resetError ? (
                    <Text color="red.500" mt={1} fontSize="xs">
                      {resetError}
                    </Text>
                  ) : null}
                  {resetLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.white} />
                  ) : (
                    <DefaultButton mt={10} title="UPDATE PASSWORD" onPress={handleSubmit} />
                  )}
                </VStack>
              )}
            </Formik>
            <DefaultButton mt={4} title="CANCEL" onPress={() => setModalVisible(false)} />
          </GradientCard>
        </Center>
      </Modal>
    </BackgroundProvider>
  );
};

export default ForgotPasswordScreen;
