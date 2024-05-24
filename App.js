import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Animated, View, TouchableOpacity } from 'react-native';
import { auth } from './config/firebaseConfig';  // Se till att sökvägen är korrekt

import HomeScreen from './pages/homescreen';
import PictureScreen from './pages/picture';
import EventsScreen from './pages/events';
import LoginScreen from './pages/loginscreen';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const [animation] = useState(new Animated.Value(0));

  const handleAnimation = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const animatedStyle = {
    opacity: animation,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Main" component={MainTabScreen} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
      <TouchableOpacity onPress={handleAnimation}>
        <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
          <Animated.View style={[{ width: 100, height: 100, backgroundColor: 'red' }, animatedStyle]} />
        </View>
      </TouchableOpacity>
    </NavigationContainer>
  );
}

function MainTabScreen() {
  return (
    <Tab.Navigator initialRouteName="Startsida" style={{ marginTop: 45 }}>
      <Tab.Screen name="Startsida" component={HomeScreen} />
      <Tab.Screen name="Bilder" component={PictureScreen} />
      <Tab.Screen name="Händelser" component={EventsScreen} />
    </Tab.Navigator>
  );
}
