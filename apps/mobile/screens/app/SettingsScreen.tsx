import React from 'react'
import { Text, View } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';

const SettingsScreen = () =>{
  return (
    <BackgroundProvider>
      <Text>Settings Screen</Text>
    </BackgroundProvider>
  )
}

export default SettingsScreen