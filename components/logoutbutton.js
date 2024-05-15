import React from 'react';
import { View, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LogoutButton = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
   
    navigation.navigate('LoginScreen');
    console.log("du har loggat in")
    
    // visa ett meddelande ifall man loggats ut
    Alert.alert("Utloggad", "Du har loggats ut från applikationen.");
  };

  return (
    <View style={{ margin: 20 }}>
      <Button title="Logga ut" onPress={handleLogout} />
    </View>
  );
};

export default LogoutButton;
