import React from 'react'
import { Text, View } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';

const HomeScreen = () =>{
  return (
    <BackgroundProvider>
        <Text>Home Screen</Text>
    </BackgroundProvider>
  )
}

export default HomeScreen