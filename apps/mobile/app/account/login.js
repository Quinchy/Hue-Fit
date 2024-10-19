import { Text, View } from 'react-native';
import NavHeader from '../../components/nav-header';

export default function Login() {
  return (
    <View>
        <NavHeader />
        <Text className="text-center text-white text-[69px] font-bold">Login</Text>
    </View>
  );
}