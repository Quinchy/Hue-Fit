// Frontend: ProfileSettingsScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Archive, MonitorCog, Package, Truck, Shirt, LogOut, Pencil } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import BackgroundProvider from '../../providers/BackgroundProvider';
import DefaultButton from '../../components/Button';
import GradientCard from '../../components/GradientCard';

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [pressedItem, setPressedItem] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('firstName');
      await AsyncStorage.removeItem('lastName');
      await AsyncStorage.removeItem('profilePicture');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Tabs array reintroduced here
  const tabs = [
    { name: 'Processing', icon: MonitorCog },
    { name: 'Packaging', icon: Package },
    { name: 'Delivering', icon: Truck },
  ];

  const handleNavigate = (tabName) => {
    navigation.navigate('OrderScreen', { initialTab: tabName });
  };

  const handleOrderHistory = () => {
    navigation.navigate('OrderHistory');
  };

  const handlePressIn = (itemName) => setPressedItem(itemName);
  const handlePressOut = () => setPressedItem(null);

  return (
    <BackgroundProvider>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>My Profile</Text>
        {userData && (
          <View style={styles.userInfoContainer}>
            <Image
              source={
                userData.profilePicture
                  ? { uri: userData.profilePicture }
                  : require('../../assets/placeholder-profile-picture.png')
              }
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text style={styles.name}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.username}>{"@"}{userData.username}</Text>
          </View>
        )}
        <View style={styles.tabsContainer}>
          {tabs.map(({ name, icon: IconComponent }) => (
            <TouchableOpacity
              key={name}
              onPress={() => handleNavigate(name)}
              style={styles.tab}
            >
              <IconComponent size={24} stroke="white" strokeWidth={2} />
              <Text style={styles.tabText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <GradientCard style={styles.settingsCard}>
          <TouchableOpacity
            style={[
              styles.menuItem,
              pressedItem === 'Edit Profile' && styles.menuItemPressed,
            ]}
            onPressIn={() => handlePressIn('Edit Profile')}
            onPressOut={handlePressOut}
          >
            <Pencil size={24} stroke="white" strokeWidth={2} />
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.menuItem,
              pressedItem === 'Order History' && styles.menuItemPressed,
            ]}
            onPressIn={() => handlePressIn('Order History')}
            onPressOut={handlePressOut}
            onPress={handleOrderHistory}
          >
            <Archive size={24} stroke="white" strokeWidth={2} />
            <Text style={styles.menuText}>Order History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.menuItem,
              pressedItem === 'Generated Outfits' && styles.menuItemPressed,
            ]}
            onPressIn={() => handlePressIn('Generated Outfits')}
            onPressOut={handlePressOut}
          >
            <Shirt size={24} stroke="white" strokeWidth={2} />
            <Text style={styles.menuText}>Generated Outfits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.menuItem,
              pressedItem === 'Log Out' && styles.menuItemPressed,
            ]}
            onPressIn={() => handlePressIn('Log Out')}
            onPressOut={handlePressOut}
            onPress={handleLogout}
          >
            <LogOut size={24} stroke="white" strokeWidth={2} />
            <Text style={styles.menuText}>Log Out</Text>
          </TouchableOpacity>
        </GradientCard>
      </SafeAreaView>
    </BackgroundProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    color: 'white',
    fontSize: 22,
    marginBottom: 20,
    marginTop: 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    color: 'gray',
    fontSize: 14,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  tab: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  tabText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
  },
  settingsCard: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#222',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 14,
  },
  menuItemPressed: {
    backgroundColor: '#555',
  },
});

export default ProfileSettingsScreen;