import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import DashboardStaff from './screens/DashboardStaff';
import DashboardAdmin from './screens/DashboardAdmin';
import CreateStaffAccount from './screens/CreateStaffAccount';
const Stack = createStackNavigator();
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="DashboardStaff" component={DashboardStaff} />
        <Stack.Screen name="DashboardAdmin" component={DashboardAdmin} />
        <Stack.Screen name="CreateStaffAccount" component={CreateStaffAccount} />
        {//<Stack.Screen name="StudentRoster" component={StudentRoster} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
