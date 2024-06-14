import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        const storedPassword = await AsyncStorage.getItem('password');
        if (storedEmail && storedPassword) {
          setEmail(storedEmail);
          setPassword(storedPassword);
        }
      } catch (error) {
        console.error('Error loading credentials', error);
      }
    };

    loadCredentials();
  }, []);

  const handleLogin = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigation.navigate('Main');

      // Spara användarnamn och lösenord om "komma ihåg" är aktiverat
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('password', password);
    } catch (error) {
      Alert.alert('Fel', 'Inloggningen misslyckades. Försök igen.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Lösenord"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Logga in" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default LoginScreen;
