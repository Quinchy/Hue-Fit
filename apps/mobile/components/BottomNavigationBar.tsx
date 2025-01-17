// components/BottomNavigationBar.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Home, Store, ShoppingCart, User } from 'lucide-react-native';
import OpenAiLogoDark from '../assets/icons/OpenAiLogoDark.svg';
import { Box } from 'native-base';

const BottomNavigationBar = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconContainer}>
        <Home size={25} strokeWidth={1} color="white" />
        <Text style={styles.iconText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Shops')} style={styles.iconContainer}>
        <Store size={25} strokeWidth={1} color="white" />
        <Text style={styles.iconText}>Shop</Text>
      </TouchableOpacity>
      <Box
        borderRadius="xl"
        width={50}
        height={50}
        alignItems="center"
        justifyContent="center"
        bg={{
          linearGradient: {
            colors: ['#FF75C3', '#FFA647', '#FFE83F', '#9FFF5B', '#70E2FF', '#CD93FF'],
            start: [0, 0],
            end: [1, 0],
          },
        }}
        shadow={2}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Input')} style={styles.generateOutfit}>
          <OpenAiLogoDark width={35} height={35} fill="black" />
        </TouchableOpacity>
      </Box>
      <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.iconContainer}>
        <ShoppingCart size={25} strokeWidth={1} color="white" />
        <Text style={styles.iconText}>Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile Settings')} style={styles.iconContainer}>
        <User size={25} strokeWidth={1} color="white" />
        <Text style={styles.iconText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#191919',
    height: 110,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconText: {
    marginTop: 5,
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
  },
  generateOutfit: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomNavigationBar;
