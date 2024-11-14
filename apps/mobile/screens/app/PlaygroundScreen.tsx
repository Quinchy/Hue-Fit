import React from 'react'
import { Text, View } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';

const PlaygroundScreen = () =>{
  return (
    <BackgroundProvider>
        <Text>Playground Screen</Text>
    </BackgroundProvider>
  )
}

export default PlaygroundScreen