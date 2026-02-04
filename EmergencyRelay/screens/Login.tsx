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
    } else if (username === 'admin' && password == 'admin') {  // This is a temp check for a admin username and password (will be changed later)
        setError('');
        (navigation as any).replace('DashboardAdmin');
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
      <Text style={styles.error}>{error}</Text>
      <Image style={styles.logo} source={require('../assets/BoysAndGirlsClubLogo.png')} />
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
  },
  error: {
    color: 'red',
    marginTop: 10,
  }
});


export default Login;