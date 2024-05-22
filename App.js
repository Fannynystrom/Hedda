import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Animated, View, TouchableOpacity } from 'react-native';
import HomeScreen from './components/homescreen';
import PictureScreen from './components/picture';
import EventsScreen from './components/events';
import LoginScreen from './components/loginscreen';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator(); // Skapa en stacknavigator

export default function App() {
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
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      <TouchableOpacity onPress={handleAnimation}>
        <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
          <Animated.View style={[{ width: 100, height: 100, backgroundColor: 'red' }, animatedStyle]} />
        </View>
      </TouchableOpacity>
    </NavigationContainer>
  );
}

// Skapa en komponent för din huvudtabell
function MainTabScreen() {
  return (
    <Tab.Navigator initialRouteName="Startsida" style={{ marginTop: 45 }}>
      <Tab.Screen name="Startsida" component={HomeScreen} />
      <Tab.Screen name="Bilder" component={PictureScreen} />
      <Tab.Screen name="Händelser" component={EventsScreen} />
    </Tab.Navigator>
  );
}
