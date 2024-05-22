// components/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../assets/RubrikImage.png'


const HomeScreen = () => {
  
  const navigation = useNavigation();

  

  return (
    
    <View style={styles.container}>
<Image style={styles.Image} source={require("../assets/Header.png")} />

      <Text style={styles.title}>App!</Text>
     
      <Text style={styles.additionalText}>Apppppppp Hejhejhej </Text>
      <Text style={styles.additionalText}>Apppppppp Hejhejhejbedjdewhbdewd </Text>

    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        paddingTop: 10, 
        marginTop: 0,
        backgroundColor: 'rgb(245, 245, 240)',
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

  Image: {
    width: 445, 
    height: 395,
    
},
});

export default HomeScreen;
