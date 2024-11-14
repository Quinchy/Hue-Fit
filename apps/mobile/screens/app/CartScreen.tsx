import React from 'react'
import { Text, View } from 'react-native';
import BackgroundProvider from '../../providers/BackgroundProvider';

const CartScreen = () =>{
  return (
    <BackgroundProvider>
        <Text>Cart Screen</Text>
    </BackgroundProvider>
  )
}

export default CartScreen