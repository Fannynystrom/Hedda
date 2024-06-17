// components/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image style={styles.image} source={require("../assets/Header.png")} />
      <Image style={styles.image} source={require("../assets/11.png")} />
      <Image style={styles.image} source={require("../assets/12.png")} />

      <Text style={styles.additionalText}>HEJ</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    paddingTop: 0, 
    marginTop: 0,
    backgroundColor: '#add8e6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  additionalText: {
    fontSize: 17,
    marginTop: 40,
    lineHeight: 20,
    color: 'black',
    padding: 10,
  },
  image: {
    width: 400, 
    height: 395,
    marging: 20,
  },
});

export default HomeScreen;
