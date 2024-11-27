// screens/NotificationScreen.tsx
import React from 'react';
import { Box, Text, VStack, HStack, IconButton, Icon } from 'native-base';
import BackgroundProvider from '../../providers/BackgroundProvider';
import GradientCard from '../../components/GradientCard';
import { Image } from 'react-native';
import { ArrowLeft, Bell } from 'lucide-react-native';

type NotificationScreenProps = {
  navigation: any; // Replace `any` with specific navigation type if available
};

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  return (
    <BackgroundProvider>
      <VStack flex={1}>
        {/* Header with Back Button and Title */}
        <HStack alignItems="center" mt={10} justifyContent="space-between" padding={4}>
          <IconButton
            icon={<Icon as={ArrowLeft} color="white" size={24} />}
            onPress={() => navigation.goBack()}
          />
          <Text color="white" fontSize="xl" fontWeight="bold">
            Notifications
          </Text>
        </HStack>

        {/* Notification Card */}
        <GradientCard padding={4} marginX={4}>
          <HStack alignItems="center" space={3}>
            {/* HueFit logo */}
            <Image
              source={require('../../assets/icons/hue-fit-logo.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />

            {/* Notification content */}
            <VStack flex={1}>
              <Text color="white" fontSize="lg" fontWeight="bold">
                Welcome to Hue-Fit
              </Text>
              <Text color="gray.300" fontSize="sm" isTruncated>
                Discover the power of AI to find your personalized outfit.
              </Text>
            </VStack>

            {/* Notification Icon */}
            <Icon as={<Bell size={24} />} color="white" />
          </HStack>
        </GradientCard>
      </VStack>
    </BackgroundProvider>
  );
};

export default NotificationScreen;
