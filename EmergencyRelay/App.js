import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import DashboardStaff from './screens/DashboardStaff';
const Stack = createStackNavigator();
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="DashboardStaff" component={DashboardStaff} />
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
