import React from 'react'
import { Text, View } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';

const ProductViewScreen = () =>{
  return (
    <BackgroundProvider>
        <Text>ProductView Screen</Text>
    </BackgroundProvider>
  )
}

export default ProductViewScreen