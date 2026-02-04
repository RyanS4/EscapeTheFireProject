import {View, Text, TextInput, Button, StyleSheet, Image} from 'react-native';
import React, {useState} from 'react';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Handle login logic here
    console.log('Logging in with', username, password);
    if (username === '' || password === '') {
        {console.log("Error");}
        setError('Please enter both username and password.');
    } else {
        setError('');
        (navigation as any).replace('DashboardStaff');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Management</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Image style={styles.logo} source={require('../assets/BoysAndGirlsClubLogo.png')} />
      <Text style={{color: 'red', marginTop: 10}}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffffff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginTop: 20,
    alignSelf: 'center',
  }
});


export default Login;