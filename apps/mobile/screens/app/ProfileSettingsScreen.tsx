import React from 'react'
import { Text, View } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';

const ProfileSettingsScreen = () =>{
  return (
    <BackgroundProvider>
        <Text>ProfileSettings Screen</Text>
    </BackgroundProvider>
  )
}

export default ProfileSettingsScreen