import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Archive, MonitorCog, Package, Truck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import BackgroundProvider from '../../providers/BackgroundProvider';
import DefaultButton from '../../components/Button';

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

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
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('user');
      // Navigate to Login screen and reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const tabs = [
    { name: 'History', icon: Archive },
    { name: 'Processing', icon: MonitorCog },
    { name: 'Packaging', icon: Package },
    { name: 'Delivering', icon: Truck },
  ];

  const handleNavigate = (tabName) => {
    navigation.navigate('OrderScreen', { initialTab: tabName });
  };

  return (
    <BackgroundProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>
          ProfileSettings Screen
        </Text>

        {/* Display user data if available */}
        {userData && (
          <View style={{ marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>ID: {userData.id}</Text>
            <Text style={{ color: 'white' }}>Username: {userData.username}</Text>
            <Text style={{ color: 'white' }}>First Name: {userData.firstName}</Text>
            <Text style={{ color: 'white' }}>Last Name: {userData.lastName}</Text>
            <Text style={{ color: 'white' }}>Role ID: {userData.roleId}</Text>
          </View>
        )}

        <DefaultButton title="LOG OUT" onPress={handleLogout} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            padding: 20,
            width: '100%',
          }}
        >
          {tabs.map(({ name, icon: IconComponent }) => (
            <TouchableOpacity
              key={name}
              onPress={() => handleNavigate(name)}
              style={{ alignItems: 'center' }}
            >
              <IconComponent size={24} stroke="white" strokeWidth={2} />
              <Text style={{ marginTop: 4, color: 'white' }}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BackgroundProvider>
  );
};

export default ProfileSettingsScreen;
