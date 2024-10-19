import { Text, View, Button } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function Page() {
  const [isNewUser, setIsNewUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  const simulateNewUser = () => {
    setIsNewUser(true);
    router.replace('/get-started');
  };

  const simulateAuthenticatedUser = () => {
    setIsAuthenticated(true);
    router.replace('/home');
  };

  const simulateUnauthenticatedUser = () => {
    setIsAuthenticated(false);
    router.replace('/account/login');
  };

  // Render a few buttons to simulate the different user statuses
  if (isNewUser === null && isAuthenticated === null) {
    return (
      <View>
        <Text>Test User Status:</Text>
        <Button title="Set as New User" onPress={simulateNewUser} />
        <Button title="Set as Authenticated User" onPress={simulateAuthenticatedUser} />
        <Button title="Set as Unauthenticated User" onPress={simulateUnauthenticatedUser} />
      </View>
    );
  }

  // After setting, you can display the following as a simple example
  return (
    <View>
      <Text>Welcome to the app! Your user status is now simulated.</Text>
    </View>
  );
}
